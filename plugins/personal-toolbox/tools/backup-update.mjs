import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {backupSpending} from './backup-spending.mjs';
const arg=(key)=>process.argv.includes(key)?process.argv[process.argv.indexOf(key)+1]:undefined;
import { projectRoot as pluginProjectRoot } from './paths.mjs';
const root=path.resolve(arg('--root')||pluginProjectRoot);
const stamp=new Date().toISOString().replace(/[-:]/g,'').replace('T','-').slice(0,15);
const dest=path.resolve(arg('--destination')||path.join(root,'backup-update-'+stamp));
if(fs.existsSync(dest))throw Error('Backup destination already exists; refusing to overwrite');
fs.mkdirSync(dest,{recursive:true});
const manifest={createdAt:new Date().toISOString(),root,files:0,bytes:0,entries:[],links:[],issues:[],browserNote:'Live file snapshot; LOCK omitted. Preserve original browser profile and origin. Validate/export copied IndexedDB separately before version migration.'};
const hash=b=>createHash('sha256').update(b).digest('hex');
const spendingData=path.resolve(process.env.DSH_HOME?.trim()||path.join(os.homedir(),'.dsh'),'personal-spending.sqlite');
function copy(source,relative,browser=false){
 if([spendingData,spendingData+'-wal',spendingData+'-shm'].includes(path.resolve(source)))return;
 if(!fs.existsSync(source))return;
 const stat=fs.lstatSync(source);
 if(stat.isSymbolicLink()){manifest.links.push({source,target:fs.readlinkSync(source)});return;}
 if(stat.isDirectory()){
  fs.mkdirSync(path.join(dest,relative),{recursive:true});
  for(const item of fs.readdirSync(source)){if(item==='node_modules'||item==='LOCK')continue;copy(path.join(source,item),path.join(relative,item),browser);}return;
 }
 try{
  const content=fs.readFileSync(source),out=path.join(dest,relative);fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,content);
  const sha256=hash(content);if(hash(fs.readFileSync(out))!==sha256)throw Error('Backup checksum mismatch');
  manifest.entries.push({path:relative,size:content.length,sha256});manifest.files++;manifest.bytes+=content.length;
 }catch(error){manifest.issues.push({path:relative,code:error.code||error.message});}
}
for(const name of ['plugins/personal-toolbox','patches','packages','package.json','package-lock.json','AGENTS.md','AI-MAINTENANCE.md','README.md','launch-deepseek-desktop.ps1','start-deepseek-harness.bat','start-harness.bat','update-deepseek-harness.ps1','update-deepseek-harness.bat'])copy(path.join(root,name),path.join('project',name));
for(const name of fs.readdirSync(root)){if(/\.(html|svg)$/.test(name))copy(path.join(root,name),path.join('project',name));}
copy(path.join(root,'output','intelligence-tests'),path.join('project','output','intelligence-tests'));
copy(process.env.DSH_HOME?.trim()||path.join(os.homedir(),'.dsh'),'user-data');
if(fs.existsSync(spendingData)){
 const relative=path.join('user-data','personal-spending.sqlite'),out=path.join(dest,relative);
 try{
  fs.mkdirSync(path.dirname(out),{recursive:true});await backupSpending(spendingData,out);
  const content=fs.readFileSync(out);manifest.entries.push({path:relative,size:content.length,sha256:hash(content),method:'sqlite-online-backup'});manifest.files++;manifest.bytes+=content.length;
 }catch(error){manifest.issues.push({path:relative,code:error.code||error.message});}
}
for(const browser of [['Microsoft','Edge'],['Google','Chrome']]){
 const base=path.join(process.env.LOCALAPPDATA||path.join(os.homedir(),'AppData','Local'),...browser,'User Data');if(!fs.existsSync(base))continue;
 for(const profile of fs.readdirSync(base)){if(profile!=='Default'&&!/^Profile \d+$/.test(profile))continue;
  const p=path.join(base,profile);copy(path.join(p,'Local Storage'),path.join('browser',...browser,profile,'Local Storage'),true);
  const indexed=path.join(p,'IndexedDB');if(fs.existsSync(indexed))for(const name of fs.readdirSync(indexed)){if(/(127\.0\.0\.1|localhost)_4173/.test(name))copy(path.join(indexed,name),path.join('browser',...browser,profile,'IndexedDB',name),true);}
 }
}
fs.writeFileSync(path.join(dest,'backup-manifest.json'),JSON.stringify(manifest,null,2));
if(manifest.issues.length)throw Error('Backup incomplete; see backup-manifest.json. Update must stop.');
fs.mkdirSync(path.join(root,'output'),{recursive:true});fs.writeFileSync(path.join(root,'output','latest-update-backup.txt'),dest+'\n');
console.log(`Backup verified: ${manifest.files} files, ${manifest.bytes} bytes. ${dest}`);
