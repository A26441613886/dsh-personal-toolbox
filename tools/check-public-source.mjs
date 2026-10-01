// Static, dependency-free publication checks. Never applies patches or reads user data.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const root=fileURLToPath(new URL('../',import.meta.url));
const plugin=path.join(root,'plugins','personal-toolbox');
const allowed=new Set(['.md','.json','.js','.mjs','.yml','.svg','.css','.png','.gitignore']);
const files=[];
function walk(directory){
  for(const entry of fs.readdirSync(directory,{withFileTypes:true})){
    if(directory===root&&entry.name==='.git')continue;
    const file=path.join(directory,entry.name),relative=path.relative(root,file);
    if(entry.isSymbolicLink())throw Error('Unexpected symlink: '+relative);
    if(entry.isDirectory()){
      assert.ok(!['node_modules','packages','output','profiles','credentials','.dsh','archive'].includes(entry.name),'excluded directory: '+relative);
      walk(file);continue;
    }
    assert.ok(entry.name==='LICENSE'||['.gitignore','.gitattributes'].includes(entry.name)||allowed.has(path.extname(entry.name)),'unexpected publication file: '+relative);
    if(entry.name.endsWith('.png')){
      assert.ok(relative.replaceAll('\\','/').startsWith('docs/images/'),'PNG outside demo image directory: '+relative);
      const image=fs.readFileSync(file);
      assert.ok(image.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),'invalid PNG: '+relative);
      for(const chunk of ['tEXt','zTXt','iTXt','eXIf'])assert.ok(!image.includes(Buffer.from(chunk)),'unexpected PNG metadata: '+relative);
      files.push(relative.replaceAll('\\','/'));continue;
    }
    const source=fs.readFileSync(file,'utf8');
    const forbidden=[/(?:sk-|gh[pousr]_)[A-Za-z0-9_-]{16,}/,/github_pat_[A-Za-z0-9_]{16,}/,/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,/https?:\/\/[^\s"'<>/:]+:[^\s"'<>@]+@/,/[A-Z]:\\Users\\[^\s\\]+/];
    for(const pattern of forbidden)assert.ok(!pattern.test(source),'potential sensitive value: '+relative+' (not printed)');
    if(/\.(?:js|mjs)$/.test(entry.name)){
      const result=spawnSync(process.execPath,['--check',file],{stdio:'inherit'});
      if(result.error)throw result.error;assert.equal(result.status,0,'syntax: '+relative);
    }
    if(entry.name.endsWith('.json'))JSON.parse(source);
    files.push(relative.replaceAll('\\','/'));
  }
}
walk(root);
const manifest=JSON.parse(fs.readFileSync(path.join(plugin,'config','patches.json'),'utf8'));
const components=JSON.parse(fs.readFileSync(path.join(plugin,'config','components.json'),'utf8'));
assert.equal(manifest.dsh,'0.2.0-rc.2');assert.equal(manifest.patches.length,11);assert.equal(Object.keys(components).length,4);
for(const row of manifest.patches){assert.ok(fs.statSync(path.join(plugin,row.src)).isFile());}
for(const row of Object.values(components))for(const property of ['client','icon','sourceHost'])if(row[property])assert.ok(fs.statSync(path.join(plugin,row[property])).isFile());
for(const directory of [root,plugin])assert.match(fs.readFileSync(path.join(directory,'LICENSE'),'utf8'),/Copyright \(c\) 2026 DeepSeek/);
const exporter=fs.readFileSync(path.join(plugin,'tools','export-source.mjs'),'utf8');assert.match(exporter,/'LICENSE', 'THIRD-PARTY-NOTICES.md'/);
console.log('PASS static publication checks: '+files.length+' text/source files, JavaScript syntax, JSON, 11 patch sources, 4 component sources, license/export notices, no excluded data paths or matching secret patterns. Pattern scanning is not a guarantee that all possible secrets are absent.');
