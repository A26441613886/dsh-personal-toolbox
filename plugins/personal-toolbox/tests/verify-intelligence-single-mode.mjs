import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {webcrypto} from 'node:crypto';
const source=await readFile(new URL('../src/intelligence/client.js',import.meta.url),'utf8');
const slice=(a,b)=>source.slice(source.indexOf(a),source.indexOf(b,source.indexOf(a)));
const calls=[],saves=[],storage=new Map();let failCandy=false,block=false,releases=[];
const fetch=async(url,init)=>{
 const body=JSON.parse(init.body);
 if(url==='/api/intelligence-artifact'){saves.push(body);return Response.json({id:'a'.repeat(64),path:'fixture.html'})}
 assert.equal(url,'/api/intelligence-test');calls.push(body);
 if(block)await new Promise(resolve=>releases.push(resolve));
 return Response.json({...body,raw:body.mode==='candy'?(failCandy?'29':'21'):'<html><svg>original</svg></html>',upstreamResponseId:'fixture-'+calls.length});
};
const context=vm.createContext({crypto:webcrypto,AbortController,AbortSignal,TextDecoder,Date,window:{setInterval,clearInterval,setTimeout,clearTimeout},INTELLIGENCE_WORKBENCH_HISTORY_KEY:'history',localStorage:{setItem:(k,v)=>storage.set(k,v)},readIntelligenceWorkbenchHistory:()=>[],getIntelligencePrompt:mode=>' Original '+mode+' prompt\n'});
const code=slice('function intelligenceResultStatus(','function buildIntelligenceTimeline(')+slice('function normalizeIntelligenceRecord(','function updateIntelligenceTargets(')+slice('function writeIntelligenceWorkbenchHistory(','function intelligenceModelKey(')+slice('function prepareIntelligenceSvg(','function IntelligenceModelPicker(');
const {createRunner,normalize,status,displayed}=vm.runInContext(code+';({createRunner:createIntelligenceRunner,normalize:normalizeIntelligenceRecord,status:intelligenceResultStatus,displayed:intelligenceDisplayedQuestions})',context);
const runner=createRunner(fetch),target={id:'one',providerId:'provider',modelId:'model',reasoningEffort:'high',timeoutMinutes:5};
await runner.run(target);
assert.deepEqual(calls.map(c=>c.mode),['pelican','candy']);assert.equal(saves.length,1);
let record=runner.getSnapshot().history[0];assert.equal(record.questions.length,2);assert.equal(record.testMode,'combined');assert.equal(record.max,2);assert.equal(status(record).label,'正常');
await runner.run(target,'candy');record=runner.getSnapshot().history[0];
assert.equal(calls.length,3);assert.equal(calls.at(-1).mode,'candy');assert.equal(saves.length,1);
assert.equal(record.questions.length,1);assert.equal(record.testMode,'candy');assert.equal(record.preview,'');assert.equal(record.answer,21);assert.equal(record.max,1);assert.equal(record.passed,true);assert.equal(record.verdict,'糖果通过');assert.equal(normalize(record).verdict,'糖果通过');
failCandy=true;await runner.run(target,'candy');record=runner.getSnapshot().history[0];assert.equal(record.verdict,'糖果未通过');assert.equal(record.answer,29);assert.equal(record.passed,false);assert.equal(record.questions.length,1);
await runner.run(target,'pelican');record=runner.getSnapshot().history[0];assert.equal(calls.length,5);assert.equal(calls.at(-1).mode,'pelican');assert.equal(saves.length,2);assert.equal(record.answer,null);assert.equal(record.verdict,'鹈鹕通过');assert.equal(normalize(record).questions.length,1);
assert.equal(record.preview,'<html><svg>original</svg></html>');assert.equal(record.max,1);
// Retention is a display-only join: never replace a selected pending/failed result.
const oldPelican={mode:'pelican',preview:'old animation',completedAt:101,runId:'original-pelican',artifactError:'save failed'};
const oldCandy={mode:'candy',answer:21,completedAt:102};
const both={id:'both',targetId:target.id,providerId:target.providerId,modelId:target.modelId,at:100,testMode:'combined',questions:[oldPelican,oldCandy]};
const candyOnly={...both,id:'candy-only',at:200,testMode:'candy',questions:[{mode:'candy',answer:29}]};
const candyAgain={...candyOnly,id:'candy-again',at:300};
const retainedHistory=[candyAgain,candyOnly,both],before=JSON.stringify(retainedHistory);
let shown=displayed(target,retainedHistory);
assert.equal(shown.pelican.question,oldPelican);assert.equal(shown.pelican.retained,true);assert.equal(shown.pelican.recordId,'both');assert.equal(shown.pelican.runKey,'original-pelican');assert.equal(shown.pelican.at,101);
assert.equal(shown.candy.question.answer,29);assert.equal(shown.candy.retained,false);
const pending={testMode:'pelican',questions:[{mode:'pelican',pending:true}]};
shown=displayed(target,retainedHistory,pending);assert.equal(shown.pelican.question,pending.questions[0]);assert.equal(shown.candy.question.answer,29);assert.equal(shown.candy.retained,true);assert.equal(shown.candy.recordId,'candy-again');
const failed={...pending,questions:[{mode:'pelican',completed:false,previewError:'failed'}]};
shown=displayed(target,retainedHistory,failed);assert.equal(shown.pelican.question,failed.questions[0]);assert.equal(shown.pelican.retained,false);assert.equal(shown.candy.question.answer,29);
shown=displayed(target,retainedHistory,{testMode:'candy',questions:[{mode:'candy',pending:true}]});assert.equal(shown.pelican.question,oldPelican);assert.equal(shown.candy.question.pending,true);
shown=displayed(target,retainedHistory,{testMode:'combined',questions:[]});assert.equal(shown.pelican.question,undefined);assert.equal(shown.candy.question,undefined);
for(const patch of [{targetId:'other'},{providerId:'other'},{modelId:'other'}]){
 shown=displayed(target,[{...both,...patch},candyOnly]);assert.equal(shown.pelican.question,undefined);
}
shown=displayed(target,runner.getSnapshot().history.map(normalize));assert.equal(shown.candy.question.answer,29);assert.equal(shown.candy.retained,true);assert.ok(shown.pelican.question.preview);
assert.equal(JSON.stringify(retainedHistory),before);assert.equal(calls.length,5);assert.equal(saves.length,2);
console.log('PASS: singles retain only the unselected question, including repeated singles, pending/failure and normalized reload; original time, preview key and save owner retained; target/model isolation; no history mutations or extra calls.');
for(const call of calls){assert.equal(call.prompt,' Original '+call.mode+' prompt\n');assert.equal(call.provider,'provider');assert.equal(call.model,'model');assert.equal(call.reasoningEffort,'high');assert.equal(call.timeoutMinutes,5)}
assert.equal(new Set(calls.map(c=>c.requestId)).size,calls.length);
const count=calls.length;await runner.run(target,'invalid');assert.equal(calls.length,count);
// Real batch callback: skip active target, forward scope to each idle target.
block=true;const running=runner.run(target,'pelican');
const targets=[target,{...target,id:'two'},{...target,id:'three'},{id:'missing'}];
const batchStart=source.indexOf('const runAllTargets = (testMode = "combined") => {'),batchEnd=source.indexOf('const cards =',batchStart);
const toasts=[];const batch=new Function('runner','targets','setToast',source.slice(batchStart,batchEnd)+';return runAllTargets;')(runner,targets,v=>toasts.push(v));
batch('candy');await new Promise(resolve=>setTimeout(resolve,0));
assert.deepEqual(calls.slice(count).map(c=>c.mode),['pelican','candy','candy']);assert.match(toasts[0],/2 个糖果/);assert.equal(runner.getSnapshot().running.length,3);
releases.forEach(resolve=>resolve());await running;
while(runner.getSnapshot().running.length)await new Promise(resolve=>setTimeout(resolve,0));
await runner.flushHistory();
const persisted=JSON.parse(storage.get('history'));assert.equal(persisted.length,7);assert.equal(persisted.filter(r=>r.testMode==='combined').length,1);
runner.dispose();console.log('PASS: direct click defaults to both; singles send only selected original prompt; no sibling/save calls for candy; single results survive normalization; no old score mixing; valid params/unique IDs; batch forwards selected scope and skips active/missing targets. No paid calls.');
