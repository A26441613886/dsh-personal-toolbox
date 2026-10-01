import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createHash } from 'node:crypto';
const require = createRequire(import.meta.url);
export function assertCompatible() {
  const compatibility = JSON.parse(readFileSync(new URL('./compatibility.json', import.meta.url), 'utf8'));
  for (const item of compatibility.files) {
    try {
      const packageFile = require.resolve(item.package + '/package.json');
      const meta = JSON.parse(readFileSync(packageFile, 'utf8'));
      const body = readFileSync(join(dirname(packageFile), item.file));
      if (meta.version !== item.version || createHash('sha256').update(body).digest('hex') !== item.sha256) throw new Error('mismatch');
    } catch {
      throw new Error('星潮工具箱：配套兼容层未就绪（' + item.package + '）。请从项目启动器启动；升级后需先适配 plugins/personal-toolbox/，不会修改你的配置或密钥。');
    }
  }
}
