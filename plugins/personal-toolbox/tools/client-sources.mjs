import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { sourcePath } from './paths.mjs';

export const compatPreferencesMarker = '/*COMPAT_PREFERENCES*/';
const baselineByCompat = {
  'compat/model-selection/client.js': 'compat/baseline/model-selection.js',
  'compat/models/client.js': 'compat/baseline/models.js',
  'compat/sessions/client.js': 'compat/baseline/sessions.js',
  'compat/skills/client.js': 'compat/baseline/skills.js'
};
const baselineGuardByCompat = {
  'compat/model-selection/client.js': 'modelMenu',
  'compat/models/client.js': 'models',
  'compat/sessions/client.js': 'sessions',
  'compat/skills/client.js': 'skills'
};
function inlineBaseline(body, baseline, id, helper) {
  const marker = 'factory: (require) => {';
  const normalized = baseline.replace(/\r\n/g, '\n');
  const start = normalized.indexOf(marker);
  const end = normalized.lastIndexOf('\n\t}\n});');
  if (start < 0 || end < start || !body.includes(marker) || !body.includes(compatPreferencesMarker)) throw new Error('Invalid client/baseline bundle: ' + id);
  const baselineBody = normalized.slice(start + marker.length, end);
  const guard = `${helper}\nconst __dshOfficialBaseline = (require) => {${baselineBody}\n};\nif (compatLayerOff(${JSON.stringify(id)})) return __dshOfficialBaseline(require);\n`;
  return body.replace(compatPreferencesMarker, '').replace(marker, () => marker + '\n' + guard);
}
export function readClientSource(relative, base) {
  let body = fs.readFileSync(sourcePath(relative, base));
  if (relative === 'src/spending/client.js') {
    const marker = '/*SPENDING_EXCEL*/';
    if (!body.includes(marker)) throw new Error('Missing spending Excel source marker');
    const excel = fs.readFileSync(sourcePath('src/spending/excel.js', base), 'utf8').replace(/^export /gm, '');
    body = Buffer.from(body.toString('utf8').replace(marker, () => excel));
  }
  const baseline = baselineByCompat[relative];
  if (!baseline && !body.includes(compatPreferencesMarker)) return body;
  const helper = fs.readFileSync(sourcePath('src/shared/compat-preferences.js', base), 'utf8');
  let text = body.toString('utf8');
  if (baseline) {
    const baselineBody = fs.readFileSync(sourcePath(baseline, base));
    const provenance = JSON.parse(fs.readFileSync(sourcePath('compat/baseline/provenance.json', base), 'utf8').replace(/^\uFEFF/, ''));
    const entry = provenance.files.find(row => baseline === 'compat/baseline/' + row.file);
    if (!entry || entry.version !== '0.2.0-rc.2' || entry.license !== 'MIT' || createHash('sha256').update(baselineBody).digest('hex') !== entry.sha256) throw new Error('Official baseline integrity mismatch: ' + baseline);
    text = inlineBaseline(text, baselineBody.toString('utf8'), baselineGuardByCompat[relative], helper);
  }
  else if (text.includes(compatPreferencesMarker)) text = text.replace(compatPreferencesMarker, () => helper);
  return Buffer.from(text);
}
