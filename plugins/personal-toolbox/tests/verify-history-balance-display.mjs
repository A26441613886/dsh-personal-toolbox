import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const general=readFileSync(new URL('../src/intelligence/client.js',import.meta.url),'utf8'),models=readFileSync(new URL('../compat/models/client.js',import.meta.url),'utf8');
const cut=(s,a,b)=>s.slice(s.indexOf(a),s.indexOf(b,s.indexOf(a)));
const history=vm.runInNewContext(cut(general,'function intelligencePreviewHistory(','function intelligenceStaticPreview(')+';intelligencePreviewHistory');
const target={id:'t',providerId:'p',modelId:'m'};
const record=(id,at,mode='pelican')=>({id,at,targetId:'t',providerId:'p',modelId:'m',questions:[{mode,preview:mode==='pelican'?'same HTML':'',runId:id,completed:true}]});
const rows=[record('older',-1),record('h5',0),record('h4',1),record('h3',2),record('h2',3),record('h1',4),record('current',5),record('candy',6,'candy'),{...record('other',7),targetId:'other'},{...record('model',7),modelId:'other'},{...record('provider',7),providerId:'other'},record('future',8)];
const before=JSON.stringify(rows),current={recordId:'current',runKey:'current',at:5};
assert.deepEqual(Array.from(history(target,rows,current),r=>r.id),['h1','h2','h3','h4','h5']);
assert.equal(JSON.stringify(rows),before);
assert.equal(history(target,[record('current',5)],current).length,0);
assert.equal(history(target,[{...record('legacy',2),modelId:undefined,questions:undefined,mode:'pelican',preview:'legacy'}],current)[0].html,'legacy');
assert.equal(history(target,[{...record('bad',4),questions:[{mode:'pelican',completed:false,preview:'partial'}]}],current).length,0);
// A retained pelican skips candy-only rounds, preserving actual earlier pelican runs.
assert.deepEqual(Array.from(history(target,[record('candy-only',10,'candy'),...rows],current),r=>r.id),['h1','h2','h3','h4','h5']);
const merge=vm.runInNewContext(cut(models,'function mergeProviderBalanceReading(','function ProviderBalance(')+';mergeProviderBalanceReading');
const previous={status:'ok',balances:[{remaining:88,used:12,unit:'元'}],updatedAt:100,scope:'key'};
const old=JSON.stringify(previous);
for(const next of [{status:'error',reason:'timeout'},{status:'error',reason:'query'},{status:'unavailable',reason:'changed'},{status:'unavailable',reason:'setup'}]){const result=merge(previous,next);assert.equal(result.balances,previous.balances);assert.equal(result.updatedAt,100);assert.equal(result.status,'error');assert.equal(result.stale,true)}
for(const reason of ['disabled','provider']){const result=merge(previous,{status:'unavailable',reason});assert.equal(result.balances,undefined)}
assert.equal(merge(undefined,{status:'error'}).balances,undefined);
assert.equal(merge(previous,{status:'ok',balances:[{remaining:22}]}).balances[0].remaining,22);
assert.equal(JSON.stringify(previous),old);
console.log('PASS: history selects 5 earlier same-target/model previews, retains duplicate HTML for comparison, skips candy/failed/current/future records without mutation; balance preserves readings on transient failure but clears authoritative unavailable results. No network calls.');

assert.equal(merge(undefined,{status:'unavailable',reason:'setup'}).reason,'setup');
const tone=vm.runInNewContext(cut(general,'function intelligenceCandyTone(','function IntelligencePreviewPlaceholder(')+';intelligenceCandyTone');
for(const [q,expected] of [[undefined,'gray'],[{pending:true},'gray'],[{completed:false,answer:null},'bad'],[{answer:null},'bad'],[{answer:29},'warn'],[{answer:21},'good']])assert.equal(tone(q),expected);
console.log('PASS: candy pending/absent gray; missing or failed answer red; wrong answer orange; 21 green.');
