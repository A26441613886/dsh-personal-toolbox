import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
const source=await readFile(new URL('../src/intelligence/client.js',import.meta.url),'utf8');
const a=source.indexOf('async function saveIntelligenceArtifact('),b=source.indexOf('function createIntelligenceRunner(',a);
const timeouts=[],delays=[];
const save=vm.runInNewContext(source.slice(a,b)+';saveIntelligenceArtifact',{AbortSignal:{timeout:ms=>{timeouts.push(ms);return AbortSignal.timeout(1000)}},window:{setTimeout:(fn,ms)=>{delays.push(ms);return setTimeout(fn,0)}}});
const html='<html><svg>original</svg></html>', artifact={id:'a'.repeat(64),path:'fixture.html'};
let calls=[];
const fetch=async(url,init)=>{calls.push({url,body:init.body});if(calls.length===1)throw Object.assign(new Error('signal timed out'),{name:'TimeoutError'});if(calls.length===2)return Response.json({error:'temporary'},{status:503});return Response.json(artifact)};
assert.deepEqual(JSON.parse(JSON.stringify(await save(html,'same-run',fetch))),artifact);
assert.equal(calls.length,3);assert.equal(new Set(calls.map(c=>c.body)).size,1);assert.ok(calls.every(c=>c.url==='/api/intelligence-artifact'));
assert.deepEqual(JSON.parse(calls[0].body),{html,runId:'same-run'});assert.ok(timeouts.every(ms=>ms===120000));assert.deepEqual(delays,[1000,2000]);
for(const status of [400,401,403,404,413,500]){let n=0;await assert.rejects(save(html,'same-run',async()=>{n++;return Response.json({error:'cannot save'},{status})}));assert.equal(n,1,'Do not retry permanent file/auth/config errors')}
let count=0;await assert.rejects(save(html,'same-run',async()=>{count++;throw Object.assign(new Error('signal timed out'),{name:'TimeoutError'})}),/本地保存等待超时/);assert.equal(count,3);
console.log('PASS: local-save timeout and transient retries only; bounded attempts; exact same HTML/run; no model calls; permanent failures not retried.');
