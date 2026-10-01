import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
import { readClientSource } from '../tools/client-sources.mjs';
import {apply as applyHost,applySpendingHost} from '../src/shared/services.js';

// Evaluate the actual client module without a browser or provider calls.
let client;
const storage=new Map();
const active=new Map();
const context=vm.createContext({
  window:{setTimeout,clearTimeout,setInterval,clearInterval,__ModuleLoader__:{load:({factory})=>{client=factory(name=>name==='react'?{memo:f=>f}:{})}}},
  localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)},
  crypto:webcrypto,AbortController,AbortSignal,TextDecoder,Date,fetch:async(url,options)=>new Promise((resolve,reject)=>{
    active.set(url,options);options.signal.addEventListener('abort',()=>reject(new DOMException('Stopped','AbortError')),{once:true});
  })
});
vm.runInContext(readClientSource('src/intelligence/client.js').toString('utf8'),context);
function activateClient(){
  const registrations=[],dispose=[];
  const ctx={
    effect:fn=>dispose.push(fn()),
    slots:{inject:(name,fn)=>fn(),register:options=>{registrations.push(options);return ()=>{}}},
    configForms:{describe:()=>({})},remote:{session:{modelCatalog:()=>({})}},
    get:()=>({selectPanel:()=>{}})
  };
  client.apply(ctx);
  const runner=registrations.find(r=>r.name==='main'&&r.key==='intelligence-test').inject().runner;
  return {runner,registrations,dispose:()=>dispose.forEach(fn=>fn())};
}
const first=activateClient();
assert.equal(first.registrations.filter(r=>r.id==='intelligence-test').length,1);
const run=first.runner.run({id:'fixture',providerId:'fixture',modelId:'fixture'},'candy');
assert.equal(active.size,1);
first.dispose();
const second=activateClient();
assert.equal(first.runner,second.runner,'hot re-enable must not race a second history owner');
await run;
assert.equal(second.runner.getSnapshot().running.length,0);
assert.equal(second.runner.getSnapshot().history.length,1);
assert.equal(second.runner.getSnapshot().history[0].questions[0].code,'CANCELLED');
await second.runner.flushHistory();
assert.equal(JSON.parse(storage.get('dsh.local.intelligenceWorkbenchHistory.v2')).length,1);
second.dispose();

const routes=new Map(),effects=[];
let started;
const ready=new Promise(resolve=>started=resolve);
const ctx={
  on:()=>()=>{},
  inject:(_,fn)=>fn(ctx),effect:fn=>effects.push(fn()),
  connection:{fetch:{register:row=>routes.set(row.path,row.fetch)}},
  settings:{describe:()=>[]},credentials:{resolve:()=>undefined},
  llm:{async *stream({signal}){started();await new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(new DOMException('Stopped','AbortError')),{once:true}));}}
};
applyHost(ctx);
assert.equal(routes.size,6, 'intelligence folder/artifact/test and three balance routes');
assert.ok(routes.has('/api/personal-plugin-folder'));
applySpendingHost(ctx);
assert.equal(routes.size,7);
const result=routes.get('/api/intelligence-test')(new Request('http://localhost/api/intelligence-test',{method:'POST',body:JSON.stringify({provider:'fixture',model:'fixture',mode:'candy',prompt:'Original prompt'})}));
await ready;effects.forEach(fn=>fn());
assert.equal((await (await result).json()).code,'SERVICE_STOPPED');
console.log('PASS plugin owns routes and UI; hot disable cancels in-flight model requests; re-enable keeps the same history owner and preserves cancelled output; zero external calls.');
