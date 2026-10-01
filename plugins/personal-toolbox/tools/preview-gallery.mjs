// Offline documentation renderer: source components + explicit synthetic fixtures.
// No Harness/profile/browser storage/credentials/model requests are accessed.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const output=path.resolve(process.argv[2]||path.join(root,'../../output/gallery'));
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const h=(type,props,...children)=>({type,props:{...(props||{}),...(children.length?{children:children.length===1?children[0]:children}:{})}});
const escape=x=>String(x).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
let overrides={},active='',cursor=0;
const React={
 Component:class{},Fragment:'fragment',memo:f=>f,forwardRef:f=>f,
 createElement:h,Children:{toArray:x=>Array.isArray(x)?x:[x]},
 useState(initial){const index=cursor++;const override=overrides[active];return [override&&Object.hasOwn(override,index)?override[index]:typeof initial==='function'?initial():initial,()=>{}];},
 useRef:x=>({current:x}),useEffect(){},useLayoutEffect(){},useMemo:f=>f(),useCallback:f=>f,useId:()=> 'demo-id',useSyncExternalStore:(_,get)=>get()
};
function invoke(fn,props){const prev=[active,cursor];active=fn.name;cursor=0;try{return fn(props||{});}finally{[active,cursor]=prev;}}
const voids=new Set(['input','img','br','hr','meta','link','path','circle','rect','stop']);
function html(node){
 if(node==null||typeof node==='boolean')return '';
 if(Array.isArray(node))return node.map(html).join('');
 if(typeof node!=='object')return escape(node);
 let {type,props={}}=node;
 if(typeof type==='function')return html(invoke(type,props));
 if(type==='fragment')return html(props.children);
 if(!type)throw Error('Missing component type: '+JSON.stringify(props));
 const attrs=Object.entries(props).flatMap(([k,v])=>{
  if(['children','ref','key','popover'].includes(k)||k.startsWith('on')||v==null||typeof v==='function'||v===false&&!k.startsWith('aria-'))return [];
  if(k==='dangerouslySetInnerHTML')return [];
  if(k==='style')return ['style="'+escape(Object.entries(v).map(([key,value])=>key.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())+':'+(typeof value==='number'&&!['opacity','zIndex','flex','flexGrow','flexShrink','fontWeight','lineHeight','order','strokeWidth'].includes(key)?value+'px':value)).join(';'))+'"'];
  k=({className:'class',htmlFor:'for',srcDoc:'srcdoc',tabIndex:'tabindex',strokeWidth:'stroke-width',strokeLinecap:'stroke-linecap',strokeLinejoin:'stroke-linejoin',textAnchor:'text-anchor',stopColor:'stop-color',stopOpacity:'stop-opacity',referrerPolicy:'referrerpolicy'}[k]||k);
  if(v===true&&!k.startsWith('aria-'))return [k];
  return [k+'="'+escape(v)+'"'];
 });
 if(type==='dialog')attrs.push('open');
 if(type==='details')attrs.push('open');
 return '<'+type+' '+attrs.join(' ')+'>'+ (type==='textarea'?escape(props.value||''):props.dangerouslySetInnerHTML?.__html||html(props.children))+(voids.has(type)?'':'</'+type+'>');
}
const primitives=new Proxy({
 Modal:({open,title,children,footer})=>open?h('section',{className:'demo-section'},h('h2',{},title),children,footer):null,
 Button:({children,disabled,variant})=>h('button',{disabled,className:'demo-ui-button '+(variant||'')},children),
 Switch:({checked,label})=>h('button',{role:'switch','aria-checked':checked,'aria-label':label,className:'demo-switch'},h('span')),
 StateDot:({state})=>h('i',{className:'demo-dot '+state}),
},{get:(o,k)=>o[k]||(String(k).startsWith('Icon')?({size=16})=>h('svg',{width:size,height:size,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor'},h('path',{d:'M5 7h14M7 7v13h10V7M9 4h6'})):undefined)});
function moduleFrom(relative,names){
 const styles=[];let face;
 const document={querySelector:()=>null,createElement:()=>({dataset:{},textContent:''}),head:{appendChild:x=>styles.push(x)}};
 const storage={getItem:()=>null,setItem(){throw Error('Fixture must never persist');}};
 const require=name=>name==='react'?React:name==='react/jsx-runtime'?{jsx:(t,p)=>h(t,p),jsxs:(t,p)=>h(t,p)}:name==='react-dom'?{createPortal:x=>x}:name.includes('primitives')?primitives:{};
 const source=read(relative).replace('/*COMPAT_PREFERENCES*/',read('src/shared/compat-preferences.js')).replace(/return module\.exports;/g,'Object.assign(exports,{'+names.join(',')+'}); return module.exports;');
 vm.runInNewContext(source,{window:{innerWidth:1280,innerHeight:1000,__ModuleLoader__:{load:row=>{face=row.factory(require);}}},document,localStorage:storage,URL,URLSearchParams,Request,Response,AbortController,AbortSignal,console,Date,setTimeout(){throw Error('No timers allowed');},fetch(){throw Error('External requests forbidden');}}, {filename:relative});
 return {face,css:()=>styles.map(x=>x.textContent).join('\n')};
}
const intelligence=moduleFrom('src/intelligence/client.js',['PersonalPluginDetails','CompatLayerSwitches','IntelligenceWorkbenchPage','IntelligenceModelPicker','IntelligenceRequestEvidence','IntelligencePreviewLightbox']);
const models=moduleFrom('compat/models/client.js',['NamedKeysEditor','ModelListEditor','ActiveBalanceQuerySettings','ProviderKeyGroup','zh']);
const prompts=moduleFrom('src/prompts/client.js',['PromptPresetControl','zh']);
const spending=moduleFrom('src/spending/client.js',['SpendingPage','PriceDialog']);
const basePreview=read('tools/preview-personal-spending.mjs');
const theme=basePreview.slice(basePreview.indexOf(':root {'),basePreview.indexOf('.dsh-preview-bar'));
const extra=`*{box-sizing:border-box}body{margin:0;background:#f6f8fb;color:#172032;font-family:'Segoe UI','Microsoft YaHei',sans-serif;font-size:14px}button,input,select,textarea{font:inherit}button{cursor:default}svg{flex-shrink:0} .demo-banner{padding:22px 36px;border-bottom:1px solid #dfe6ef;background:white;display:flex;align-items:center;justify-content:space-between}.demo-banner b{display:block;font-size:21px}.demo-banner small{display:block;color:#66758b;margin-top:6px}.demo-tag{border:1px solid #c9d9e8;background:#edf6ff;color:#32658c;border-radius:20px;padding:7px 12px;font-size:12px}.demo-stage{padding:32px;max-width:1280px;margin:auto}.demo-section{background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l2);border-radius:18px;padding:24px;margin-bottom:20px}.demo-section h2{margin:0 0 16px;font-size:18px}.demo-switch{border:0;background:#376ef5;width:40px;height:22px;border-radius:12px;padding:3px;display:flex;justify-content:flex-end}.demo-switch span{display:block;background:white;width:16px;height:16px;border-radius:50%}.demo-switch[aria-checked=false]{background:#bdc5d3;justify-content:flex-start}.demo-dot{width:7px;height:7px;background:#27a078;border-radius:100%;display:inline-block;margin-right:6px}.demo-component{display:flex;align-items:center;gap:12px;padding:16px 0;border-bottom:1px solid #e8edf4}.demo-component img{width:40px;height:40px}.demo-component strong{display:block}.demo-component small{color:#718096}.demo-component .spacer{flex:1}.demo-note{background:#eaf3fd;color:#436382;padding:16px;border-radius:12px;margin-top:18px;line-height:1.7}dialog[open]{position:relative;inset:auto;margin:0 auto;max-height:none!important;box-shadow:0 8px 28px #1629441a}.dshIw_evidenceDialog{width:900px!important}.dshIw_evidenceBody{max-height:none!important}.dshPp_panel{position:relative!important;left:auto!important;top:auto!important;visibility:visible!important;width:520px!important;max-height:none!important}.dshPd_panel{max-width:none}.demo-columns{display:grid;grid-template-columns:1fr 1fr;gap:24px}.demo-composer{background:white;border:1px solid #d8e0ea;border-radius:18px;padding:22px;margin-bottom:20px;line-height:1.8}.dsh-sp__backdrop{position:relative!important;inset:auto!important;background:transparent!important}.dsh-sp__dialog{width:700px!important}.dshIt_statusPage{background:transparent!important}.dshIw_pickerList{max-height:none!important}.dshIw_pickerMenu{position:relative!important;top:auto!important;margin-top:12px}.zGbnIq_modelCatalog{margin-top:0!important} [data-dark] body{background:#131820;color:#e9eff6}.demo-footer{padding:18px 32px;color:#708098;font-size:12px;text-align:center}`;
fs.mkdirSync(output,{recursive:true});
function page(name,title,nodes,source,opts={}){
 overrides=opts.states||{};
 const body=html(nodes);
 const css=[theme,extra,intelligence.css(),models.css(),prompts.css(),read('src/spending/style.css')].join('\n');
 const doc=`<!doctype html><html lang="zh-CN" ${opts.dark?'data-dark':''}><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(title)} · 星潮工具箱演示</title><style>${css}</style></head><body><header class="demo-banner"><div><b>${escape(title)}</b><small>星潮工具箱 · 源码组件离线渲染</small></div><span class="demo-tag">DeepSeek Harness · Starwave Toolkit</span></header><main class="demo-stage">${body}</main><footer class="demo-footer">来自 ${escape(source)}</footer></body></html>`;
 fs.writeFileSync(path.join(output,name+'.html'),doc);
 console.log(name);
}
const at=Date.now(),today=new Date().toISOString().slice(0,10),prev=d=>new Date(at-d*86400000).toISOString().slice(0,10);
const keys=[{id:'main',name:'DeepSeek 主线路'},{id:'secondary',name:'DeepSeek 演示线路'}];
const demoModels=[{id:'deepseek-chat',name:'deepseek-chat',apiKey:'main',input:['text','image']},{id:'deepseek-reasoner',name:'deepseek-reasoner',apiKey:'main',input:['text','image']},{id:'deepseek-chat-demo',upstreamModelId:'deepseek-chat',name:'deepseek-chat · 演示',apiKey:'secondary',input:['text','image']}];
const profile={apiKeys:keys,activeApiKey:'main',models:demoModels,baseURL:'https://api.deepseek.com'};
const components=JSON.parse(read('config/components.json'));
page('toolbox','工具箱详情 · 4 个组件与兼容开关',[
 h(intelligence.face.PersonalPluginDetails),h('section',{className:'demo-section'},h('h2',{},'独立宿主组件'),Object.values(components).map(c=>h('div',{className:'demo-component'},h('img',{src:'/assets/'+path.basename(c.icon||'toolbox.svg')}),h('div',{},h('strong',{},c.title),h('small',{},c.description)),h('span',{className:'spacer'}),h('span',{},'运行中'),h(primitives.Switch,{checked:true,label:c.title})))),h(intelligence.face.CompatLayerSwitches)
],'src/intelligence/client.js；宿主组件列表使用 config/components.json（演示容器）');
const bird=`<!doctype html><html><body style="margin:0;background:#edf7fc"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 720"><rect width="960" height="720" fill="#edf7fc"/><circle cx="800" cy="100" r="45" fill="#ffe7a3"/><path d="M0 550Q250 450 480 540T960 520V720H0" fill="#c7e4ce"/><path d="M0 610h960" stroke="#799bb0" stroke-width="8"/><g fill="none" stroke="#3f657e" stroke-width="12"><circle cx="330" cy="490" r="92"/><circle cx="650" cy="490" r="92"/><path d="M330 490l105-160 76 160H330l192-112 128 112M522 378l-22-94h70M415 330h75"/></g><ellipse cx="490" cy="240" rx="107" ry="64" fill="white"/><path d="M525 230Q580 210 567 150Q540 70 606 78Q638 88 627 147L590 263" fill="white"/><path d="M620 112l140 25-140 22" fill="#f5b34b"/><circle cx="615" cy="103" r="6"/><path d="M445 220q85 70 125 15" fill="#d9e5ea"/><path d="M490 285l-20 50 47 60" fill="none" stroke="#dfaa57" stroke-width="11"/><text x="480" y="666" text-anchor="middle" font-family="sans-serif" font-size="24" fill="#607e90">DeepSeek · 人工绘制示例，不是模型生成结果</text></svg></body></html>`;
const targets=[{id:'t1',providerId:'deepseek-demo',modelId:'deepseek-chat',name:'DeepSeek · deepseek-chat',mode:'combined'},{id:'t2',providerId:'deepseek-demo',modelId:'deepseek-reasoner',name:'DeepSeek · deepseek-reasoner',mode:'combined'}];
const questions=[{mode:'pelican',name:'鹈鹕 SVG',preview:bird,raw:bird,passed:true,valid:true,completed:true,requestId:'demo-request-pelican',upstreamResponseId:'demo-response-pelican',serverElapsedMs:24800,firstChunkMs:2400,rawSha256:'0'.repeat(64),artifact:{path:'output/intelligence-tests/demo-pelican.html'},transport:{observed:true,attempts:1,responses:1,failures:0,status:200,headersMs:920,headers:{'x-cache':'MISS'}}},{mode:'candy',name:'糖果推理',answer:21,raw:'结论：至少 21 颗。',passed:true,valid:true,completed:true,requestId:'demo-request-candy',upstreamResponseId:'demo-response-candy',serverElapsedMs:16600,firstChunkMs:2000,transport:{observed:true,attempts:1,responses:1,failures:0,status:200,headersMs:760,headers:{}}}];
const records=targets.flatMap((t,ti)=>Array.from({length:4},(_,i)=>({id:`demo-${ti}-${i}`,targetId:t.id,providerId:t.providerId,modelId:t.modelId,at:at-((i*2+1)*3600000),questions:questions.map(q=>({...q,at:at-(i*2+1)*3600000,...i===2&&q.mode==='candy'?{passed:false,answer:20}:{}})),reasoningEffort:'high',elapsedMs:24800,testMode:'combined'})));
const groups=[{id:'deepseek-demo',name:'DeepSeek 演示',models:demoModels.map(m=>({...m,key:m.apiKey}))}];
const runner={subscribe:()=>()=>{},getSnapshot:()=>({history:records,running:[],progress:{},historyError:'',historyLoading:false,historySaving:false})};
const slots={subscribe:()=>()=>{},getVersion:()=>0,entries:()=>[{options:{id:'spending',label:'余额总览'}}]};
const catalog={status:'ready',groups,failures:[],error:null};
const namespaces=[{ns:'llm-pi-ai',value:{providers:{'deepseek-demo':profile}}}];
const workProps={goToConversation(){},loadModelCatalog:()=>({groups}),runner,slots,renderSlot:()=>null,settingsFace:{getSnapshot:()=>({view:{namespaces}})}};
for(const mode of ['detail','preview'])page('intelligence-'+mode,'智力检测 · '+(mode==='detail'?'详细模式':'预览模式'),h(intelligence.face.IntelligenceWorkbenchPage,workProps),'src/intelligence/client.js',{states:{IntelligenceWorkbenchPage:{0:namespaces,1:targets,2:false,3:mode,18:catalog}}});
page('request-evidence','智力检测 · 请求核查',h(intelligence.face.IntelligenceRequestEvidence,{title:'DeepSeek 演示 · deepseek-chat',questions,onClose(){}}),'src/intelligence/client.js');
page('model-picker','检测模型 · 供应商 / 密钥 / 模型三级选择',h('section',{className:'demo-section'},h('h2',{},'选择已配置的 DeepSeek 模型'),h(intelligence.face.IntelligenceModelPicker,{groups:[{label:'DeepSeek 演示',keys:keys.map(k=>({label:k.name,items:demoModels.filter(m=>m.apiKey===k.id).map(m=>({value:m.id,label:m.name}))}))}],searchable:true,placeholder:'请选择供应商、密钥和模型',onChange(){}})),'src/intelligence/client.js',{states:{IntelligenceModelPicker:{0:true}}});
const t=k=>models.face.zh[k]||k;
page('models','模型设置 · 每把命名密钥独立管理模型',h('section',{className:'demo-section'},h('h2',{},'DeepSeek 演示 · 模型'),h(models.face.ModelListEditor,{models:demoModels,apiKeys:keys,defaultApiKey:'main',onChange(){},probe:{baseURL:'https://api.deepseek.com',settingsNs:'demo'},operations:{},t,disabled:false,onBusyChange(){}})),'compat/models/client.js');
page('named-keys','模型设置 · 命名密钥',h('section',{className:'demo-section'},h('h2',{},'DeepSeek 演示 · 命名密钥'),h(models.face.NamedKeysEditor,{entries:keys,values:{},states:{main:{configured:true},secondary:{configured:true}},onChange(){},onValue(){},usedIds:new Set(['main','secondary']),defaultId:'main',t,disabled:false})),'compat/models/client.js');
const spendHistory={today:[{unit:'元',spend:22.55}],days:Array.from({length:7},(_,i)=>({date:prev(i),amounts:[{unit:'元',spend:[22.55,30.7,12.8,18.4,9.65,24.3,15.6][i]}]}))};
page('balance-query','余额与消费 · 查询配置和每日记录',h('section',{className:'demo-section'},h('h2',{},'DeepSeek 演示 · 余额查询'),h(models.face.ActiveBalanceQuerySettings,{provider:'deepseek-demo',profile,t,disabled:false})),'compat/models/client.js',{states:{ActiveBalanceQuerySettings:{1:{writable:true,config:{}},2:{type:'deepseek',url:'https://api.deepseek.com/user/balance',auth:'apiKey',interval:300,scope:'account'},4:false,7:spendHistory}}});
const presets=[{id:'demo-1',title:'示例：梳理问题',body:'以下是公开演示文案：请先列出已知条件，再说明待确认的问题。'},{id:'demo-2',title:'示例：解释代码',body:'以下是公开演示文案：请解释代码的输入、输出与主要执行步骤。'},{id:'demo-3',title:'示例：核对清单',body:'以下是公开演示文案：请把任务整理成可以逐项检查的清单。'}];
for(const mode of ['list','edit'])page('prompts-'+mode,'常用提示词 · '+(mode==='list'?'本机收藏':'新增 / 编辑'),[h('div',{className:'demo-composer'},h('b',{},'对话输入框 · DeepSeek 演示'),h('p',{},'选择常用提示词，只填入输入框，不自动发送。')),h(prompts.face.PromptPresetControl,{locked:false,inputActions:{},t:k=>prompts.face.zh[k]||k})],'src/prompts/client.js',{states:{PromptPresetControl:{0:true,1:presets,2:mode,4:mode==='edit'?'示例：核对清单':'',5:mode==='edit'?presets[2].body:'',6:{position:'relative',visibility:'visible'}}}});
console.log('Offline gallery generated:',output);
