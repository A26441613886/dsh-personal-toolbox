import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { webcrypto } from 'node:crypto';
import { createIntelligenceTestHandler } from '../src/shared/services.js';
const req = (extra = {}, stream = false, signal) => new Request('http://localhost/api/intelligence-test', { method: 'POST', signal, headers: { 'content-type': 'application/json', ...(stream ? { accept: 'application/x-ndjson' } : {}) }, body: JSON.stringify({ provider: 'mock', model: 'mock', mode: 'candy', prompt: 'mock', ...extra }) });
const calls=[];
const fast = createIntelligenceTestHandler({async *stream(options) { calls.push(options); yield {type:'reasoning-delta',index:0,text:'think'}; yield {type:'text-delta',index:1,text:'2'}; yield {type:'block-end',index:1,block:{type:'text',text:'21'}}; yield {type:'finish',reason:{kind:'stop'}}; } });
for (const reasoningEffort of [undefined,'off','high','xhigh','max']) {
 const res=await fast(req(reasoningEffort ? {reasoningEffort} : {}));const value=await res.json();assert.equal(res.status,200);assert.equal(value.raw,'21');assert.equal(value.reasoningChars,5);assert.equal(value.textChars,2);assert.equal(calls.at(-1).reasoningEffort,reasoningEffort);
 assert.ok(!('tools' in calls.at(-1)) && !('sessionId' in calls.at(-1)) && !('maxTokens' in calls.at(-1)));
}
const events=(await (await fast(req({reasoningEffort:'max'},true))).text()).trim().split('\n').map(JSON.parse);
assert.equal(events[0].type,'progress');assert.equal(events.at(-1).raw,'21');
assert.equal((await fast(req({timeoutMinutes:0}))).status,400);assert.equal((await fast(req({timeoutMinutes:31}))).status,400);assert.equal((await fast(req({reasoningEffort:{id:'high'}}))).status,400);
const hanging = { async *stream({signal}) { yield {type:'reasoning-delta',index:0,text:'thinking'};yield {type:'text-delta',index:1,text:'partial'}; await new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(new Error('abort')), {once:true})); } };
const timeout=createIntelligenceTestHandler(hanging,{timeoutMs:25});
const fail=await timeout(req());assert.equal(fail.status,504);const data=await fail.json();assert.equal(data.code,'TEST_TIMEOUT');assert.equal(data.partialRaw,'partial');assert.equal(data.reasoningChars,8);assert.ok(data.elapsedMs>=20);
const abort=new AbortController();const pending=timeout(req({},false,abort.signal));abort.abort();assert.equal((await (await pending).json()).code,'CANCELLED');
const transport=createIntelligenceTestHandler({ async *stream() {throw Object.assign(new Error('SECRET_API_KEY'),{code:'TIMEOUT'});} });
const failure=await (await transport(req())).json();assert.equal(failure.code,'TIMEOUT');assert.ok(!JSON.stringify(failure).includes('SECRET_API_KEY'));
const toolReturn={type:'tool-call',id:'call-1',name:'write_file',arguments:'{"path":"pelican.html","content":"test"}'};
const toolsReturned=createIntelligenceTestHandler({ async *stream() {yield {type:'block-end',index:0,block:toolReturn};yield {type:'finish',reason:{kind:'tool-use'}};} });
const toolResult=await (await toolsReturned(req())).json();assert.deepEqual(toolResult.toolCalls,[toolReturn]);assert.equal(toolResult.raw,'');assert.equal(toolResult.error,undefined);
const untouched='  <!DOCTYPE html>\n<html><style>body{background:pink}</style><script>window.example=1</script><svg></svg></html>\n ';
const verbatim=createIntelligenceTestHandler({ async *stream(options) {assert.equal(options.messages[0].content[0].text,' 原始提示词\n');yield {type:'text-delta',index:0,text:untouched.slice(0,20)};yield {type:'text-delta',index:0,text:untouched.slice(20)};yield {type:'finish',reason:{kind:'stop'}};} });
assert.equal((await (await verbatim(req({prompt:' 原始提示词\n'}))).json()).raw,untouched);
const incomplete=createIntelligenceTestHandler({ async *stream() {yield {type:'text-delta',index:0,text:'21'};} });assert.equal((await (await incomplete(req())).json()).code,'INCOMPLETE');
let stopped=false;
const cancelStream=createIntelligenceTestHandler({async *stream({signal}) { signal.addEventListener('abort',()=>{stopped=true;}); await new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(new Error('abort')), {once:true}));} });
const response=await cancelStream(req({},true));await response.body.cancel();await new Promise(resolve=>setTimeout(resolve,10));assert.equal(stopped,true);
// Exercise the actual UI runner against the mocked backend, including concurrent requests.
const source=fs.readFileSync(new URL('../src/intelligence/client.js',import.meta.url),'utf8');
const start=source.indexOf('\t\tasync function readIntelligenceResponse('),end=source.indexOf('\t\tfunction IntelligenceWorkbenchPage',start);
let history=[];
const extract = (start, end) => source.slice(source.indexOf(start), source.indexOf(end, source.indexOf(start)));
const storage = new Map();
const globals={react:{memo:fn=>fn},crypto:webcrypto,AbortSignal,Map,Set,Object,Date,Math,JSON,Error,TextDecoder,AbortController,window:{setTimeout,clearTimeout,setInterval,clearInterval},localStorage:{getItem:key=>storage.get(key)},readIntelligenceWorkbenchHistory:()=>history,writeIntelligenceWorkbenchHistory:v=>history=v};
const api=vm.runInNewContext(
 extract('const INTELLIGENCE_TEST_PROMPT =', 'const intelligenceCss =') +
 extract('function intelligenceResultStatus(', 'const INTELLIGENCE_TIME_RANGES =') +
 extract('function normalizeIntelligenceRecord(', 'function updateIntelligenceTargets(') +
 extract('function readIntelligenceTargets(', 'function readIntelligenceWorkbenchHistory(') +
 extract('function getIntelligencePrompt(', '// Keep the reply intact.') +
 extract('function evaluateIntelligenceCandy(', '// Plugin-owned state') +
 source.slice(start,end)+`;({createIntelligenceRunner,intelligenceResultStatus,normalizeIntelligenceRecord,evaluateIntelligenceCandy,readIntelligenceTargets,getIntelligencePrompt,INTELLIGENCE_LEGACY_CANDY_PROMPT})`,
 {...globals,prepareIntelligenceSvg:raw=>({svg:raw.includes('<svg')?raw:'',error:'mock-invalid'})});
const createRunner=api.createIntelligenceRunner;
assert.equal(api.evaluateIntelligenceCandy('answer: 29. 最终答案：21').answer,21);
assert.equal(api.evaluateIntelligenceCandy('至少 21。最终答案：29').answer,29);
assert.equal(api.evaluateIntelligenceCandy('无法作答').answer,null);
for (const [reply, expected] of [
 ['最少取出 **21** 个糖果。',21],
 ['最少需要摸出二十一颗糖果才能保证。',21],
 ['因此，至少应当抽取 29 颗。',29],
 ['\\[\\boxed{29}\\]',29],
 ['最终答案：\\boxed{\\text{21颗}}',21],
 ['所以至少需要 12+9=21 颗糖果。',21],
 ['答案是 3*7=21 颗。',21],
 ['答案是 3*7 颗。',null],
 ['答案是 *29* 颗。',29],
 ['最终答案：２１颗',21],
 ['<p>最少取出 <strong>29</strong> 个。</p>',29],
 ['{"answer":29}',29],
 ['答案是21或29，还不能确定。',null],
 ['至少取出 20 颗不能保证。',null],
 ['至少取出 20 颗糖果不能保证。',null],
 ['1.\n无法确定答案。',null],
 ['假设至少取出 21 颗。',null],
 ['答案是21.5颗',null],
 ['苹果味 桃子味 西瓜味\n圆形 7 9 8\n五角星形 7 6 4',null],
 ['<think>最终答案：21</think>无法给出最终答案。',null],
 ['最少取出 21 颗。\n推理：'+ '其他推理。'.repeat(600),21]
]) assert.equal(api.evaluateIntelligenceCandy(reply).answer,expected,reply.slice(0,150));
const oldRaw='最少取出 **21** 个糖果。';
const oldCandy={mode:'candy',answer:null,completed:true,raw:oldRaw};
const repaired=api.normalizeIntelligenceRecord({mode:'combined',completed:true,questions:[{mode:'pelican',raw:'<svg>original</svg>',completed:true},oldCandy]});
assert.equal(repaired.answer,21);assert.equal(repaired.tone,'good');assert.equal(repaired.questions[1].raw,oldRaw);assert.equal(oldCandy.answer,null);
assert.equal(api.normalizeIntelligenceRecord({...oldCandy,raw:'\\boxed{29}'}).answer,29);
assert.equal(api.normalizeIntelligenceRecord({...oldCandy,completed:false}).passed,false);
assert.equal(api.normalizeIntelligenceRecord({...oldCandy,raw:'',responseBlocks:[{type:'reasoning',text:'答案是21'},{type:'text',text:'最少取出29颗'}]}).answer,29);

assert.ok(!api.getIntelligencePrompt('candy').includes('正确答案'));
assert.ok(api.getIntelligencePrompt('candy').endsWith('苹果味 桃子味 西瓜味 圆形 7 9 8 五角星形 7 6 4'));
assert.ok(!api.getIntelligencePrompt('candy').includes('最后单独'));
assert.equal(api.getIntelligencePrompt('pelican'),'创建一个 HTML，内容是 SVG 绘制一个鹈鹕骑自行车的 2D 动画，不用测试（不要看我源文件里面的东西直接在里面新建一个）');
storage.set('dsh.local.intelligenceConfig.v1',JSON.stringify({prompt:api.INTELLIGENCE_LEGACY_CANDY_PROMPT}));
assert.ok(!api.getIntelligencePrompt('candy').includes('正确答案'));
storage.set('dsh.local.intelligenceConfig.v1',JSON.stringify({prompt:'用户自定义题'}));
assert.equal(api.getIntelligencePrompt('candy'),'用户自定义题');
storage.delete('dsh.local.intelligenceConfig.v1');
storage.set('dsh.local.intelligenceTargets.v2',JSON.stringify([{id:'old',name:'Old',mode:'pelican',modelId:'original'}]));
assert.equal(api.readIntelligenceTargets()[0].mode,'combined');
assert.equal(api.readIntelligenceTargets()[0].modelId,'original');
assert.equal(JSON.parse(storage.get('dsh.local.intelligenceTargets.v2'))[0].mode,'pelican','Reading migration leaves saved user data intact');
const bodies=[];
const runner=createRunner(async(url,init)=>{bodies.push(JSON.parse(init.body));return fast(new Request('http://localhost'+url,init));});
await Promise.all([runner.run({id:'one',providerId:'mock',modelId:'mock',mode:'candy',reasoningEffort:'max',timeoutMinutes:20}),runner.run({id:'two',providerId:'mock',modelId:'mock',mode:'pelican'})]);
assert.equal(history.length,2);assert.ok(history.every(item=>item.completed&&item.questions.length===2&&item.mode==='combined'));
assert.equal(bodies.length,4);assert.ok(bodies.slice(0,2).every(body=>body.reasoningEffort==='max'&&body.timeoutMinutes===20));assert.ok(bodies.slice(2).every(body=>!('reasoningEffort' in body)));assert.equal(runner.getSnapshot().running.length,0);
assert.deepEqual(bodies.map(body=>body.mode),['pelican','candy','pelican','candy']);
const failedRunner=createRunner(async(url,init)=>timeout(new Request('http://localhost'+url,{...init,body:JSON.stringify({...JSON.parse(init.body),timeoutMinutes:undefined})})));
await failedRunner.run({id:'timeout',providerId:'mock',modelId:'mock',mode:'candy'});
assert.ok(history[0].questions.every(q=>q.code==='TEST_TIMEOUT'&&q.completed===false&&q.partialRaw==='partial'));
assert.equal(history[0].tone,'bad');
const responseOf=(raw, init)=>Response.json({raw, ...Object.fromEntries(Object.entries(JSON.parse(init.body)).filter(([key])=>['requestId','provider','model'].includes(key)))});
for(const [svg,answer,tone] of [[true,21,'good'],[true,29,'warn'],[false,21,'warn'],[false,29,'bad']]) {
 const combined=createRunner(async(url,init)=>responseOf(JSON.parse(init.body).mode==='pelican'?(svg?'<svg>mock</svg>':'no svg'):`最终答案：${answer}`,init));
 await combined.run({id:'matrix',providerId:'mock',modelId:'mock'});
 assert.equal(history[0].tone,tone);assert.equal(history[0].answer,answer);
 assert.equal(api.normalizeIntelligenceRecord(history[0]).tone,tone);
 if(svg&&answer===21){combined.previewFailed(history[0].id);await combined.flushHistory();assert.equal(api.normalizeIntelligenceRecord(history[0]).tone,'warn');assert.equal(history[0].questions[1].answer,21);}
}
// One completed question remains visible and survives cancellation of the other.
let held, abortCount=0, requestCount=0;
const partial=createRunner(async(url,init)=>{
 requestCount++;
 if(JSON.parse(init.body).mode==='candy')return responseOf('最终答案：29',init);
 return new Promise((resolve,reject)=>{held=resolve;init.signal.addEventListener('abort',()=>{abortCount++;reject(new Error('abort'));},{once:true});});
});
const target={id:'partial',providerId:'mock',modelId:'mock',mode:'pelican'};
const run=partial.run(target);await new Promise(resolve=>setTimeout(resolve,5));await partial.run(target);
assert.equal(requestCount,2,'Duplicate target skipped');assert.equal(partial.getSnapshot().progress.partial.questions[1].answer,29);
assert.ok(partial.getSnapshot().progress.partial.questions[0].pending);
partial.cancel(target.id);await run;assert.equal(abortCount,1);assert.equal(history[0].answer,29);assert.equal(history[0].questions[0].code,'CANCELLED');
// Failure of one request does not abort the remaining question.
let finishCandy, candyInit;
const isolated=createRunner(async(url,init)=>JSON.parse(init.body).mode==='pelican'?Response.json({error:'fixture error'},{status:500}):new Promise(resolve=>{finishCandy=resolve;candyInit=init;}));
const isolationRun=isolated.run(target);await new Promise(resolve=>setTimeout(resolve,5));
assert.equal(isolated.getSnapshot().progress.partial.questions[0].completed,false);
assert.ok(isolated.getSnapshot().progress.partial.questions[1].pending);
finishCandy(responseOf('21',candyInit));await isolationRun;assert.equal(history[0].tone,'warn');
let cancelledRequests=0;
const allCancel=createRunner(async(url,init)=>new Promise((resolve,reject)=>init.signal.addEventListener('abort',()=>{cancelledRequests++;reject(new Error('abort'));},{once:true})));
const cancelRun=allCancel.run(target);allCancel.cancel(target.id);await cancelRun;
assert.equal(cancelledRequests,2);assert.ok(history[0].questions.every(q=>q.code==='CANCELLED'));
console.log('PASS: paired requests, real numeric extraction, no answer leak, default migration, custom prompt preservation, per-question progress, colors, preview failure, concurrent targets, cancellation, timeout and failure isolation.');

const prepare=vm.runInNewContext(extract('function prepareIntelligenceSvg(', 'function extractIntelligenceSvg(')+';prepareIntelligenceSvg');
assert.equal(prepare(untouched).svg,untouched.slice(2,untouched.indexOf('</html>')+7));
const staticSvg='<svg><circle r="20"/></svg>';assert.equal(prepare(staticSvg).svg,staticSvg);
assert.equal(prepare('模型未生成文件').svg,'');
assert.equal(prepare('```html\n'+untouched+'\n```').svg,untouched.slice(2,untouched.indexOf('</html>')+7));
console.log('PASS: exact prompts, response whitespace and tool calls retained, HTML scripts/background preserved, no invented animation.');
