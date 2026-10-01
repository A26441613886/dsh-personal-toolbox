import path from 'node:path';
import { fileURLToPath } from 'node:url';
// tools/ -> personal-toolbox/ -> plugins/ -> Harness install root.
export const sourceRoot = fileURLToPath(new URL('../', import.meta.url));
export const projectRoot = fileURLToPath(new URL('../../../', import.meta.url));
export const manifestPath = path.join(sourceRoot, 'config', 'patches.json');
export function sourcePath(relative, base = sourceRoot) {
  const result = path.resolve(base, relative);
  if (!result.startsWith(path.resolve(base) + path.sep)) throw Error('Source path escapes the plugin: ' + relative);
  return result;
}
