#!/usr/bin/env node
/**
 * Re-apply the DeepSeek Harness local customizations after an `npm install`.
 *
 * `npm install` replaces whole package directories, which wipes every edit made
 * directly inside node_modules. This script restores the customized artifacts
 * from `plugins/personal-toolbox/` so a reinstall or upgrade cannot silently lose them.
 *
 * The inventory lives in `plugins/personal-toolbox/config/patches.json`. Do not delete that file, this
 * script, or the classified source files: they are the only durable copies of
 * the local features.
 *
 * Run automatically by start-deepseek-harness.bat before a new server starts,
 * and by `npm install` through the postinstall script. Safe to run repeatedly:
 * files already carrying the patch are left untouched.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildPersonalPlugin } from './build.mjs';
import { readClientSource } from './client-sources.mjs';
import { sourceRoot as here, projectRoot as root, manifestPath } from './paths.mjs';

const modules = path.join(root, 'node_modules');

if (!fs.existsSync(manifestPath)) {
	console.error('[patches] missing plugins/personal-toolbox/config/patches.json — refusing to continue so local customizations cannot be dropped silently.');
	process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const TARGET_DSH_VERSION = manifest.dsh;
const TARGET_PACKAGE_VERSIONS = manifest.packages ?? {};
const PATCHES = manifest.patches ?? [];

if (!TARGET_DSH_VERSION || PATCHES.length === 0) {
	console.error('[patches] plugins/personal-toolbox/config/patches.json is incomplete — it must name a dsh version and at least one patch.');
	process.exit(1);
}

function installedDshVersion() {
	try {
		return JSON.parse(fs.readFileSync(path.join(modules, '@deepseek-ai/dsh/package.json'), 'utf8')).version;
	} catch {
		return undefined;
	}
}

const version = installedDshVersion();
let mismatch = false;
for (const [pkg, expected] of Object.entries(TARGET_PACKAGE_VERSIONS)) {
	try {
		const actual = JSON.parse(fs.readFileSync(path.join(modules, pkg, 'package.json'), 'utf8')).version;
		if (actual !== expected) {
			mismatch = true;
			console.warn(`[patches] WARNING: ${pkg} ${actual} installed; patches were adapted against ${expected}.`);
		}
	} catch {
		mismatch = true;
		console.warn(`[patches] WARNING: ${pkg} package metadata is missing.`);
	}
}
if (version === undefined) {
	console.error('[patches] @deepseek-ai/dsh is not installed under node_modules — nothing to patch.');
	process.exit(1);
}
if (version !== TARGET_DSH_VERSION) {
	mismatch = true;
	console.warn(`[patches] WARNING: patches were ported against @deepseek-ai/dsh ${TARGET_DSH_VERSION}, but ${version} is installed.`);
	console.warn('[patches] The upstream code may have moved on; no files will be overwritten until the patches are re-adapted.');
} else {
	console.log(`[patches] target version ${version}`);
}
if (mismatch) {
	console.warn('[patches] Do not delete plugins/personal-toolbox/ or replace classified source files with upstream files. Re-adapt the existing sources instead.');
	process.exit(1);
}

if (process.argv.includes('--check')) {
    buildPersonalPlugin({ root, check: true });
	for (const patch of PATCHES) {
		const src = path.join(here, patch.src);
		const dest = path.join(modules, patch.dest);
		if (!fs.existsSync(src) || !fs.existsSync(dest)) {
			console.error(`[patches] missing: ${patch.src} or ${patch.dest}`);
			process.exitCode = 1;
			continue;
		}
		if (!readClientSource(patch.src, here).equals(fs.readFileSync(dest))) console.log(`[patches] needs apply — ${patch.label}`);
		else console.log(`[patches] current — ${patch.label}`);
	}
	process.exit(process.exitCode ?? 0);
}

// Check every target before the first overwrite; a partial install cannot receive half a patch set.
buildPersonalPlugin({ root, check: true });
for (const patch of PATCHES) {
    if (!fs.existsSync(path.join(here, patch.src)) || !fs.existsSync(path.join(modules, patch.dest))) {
        console.error(`[patches] missing source or destination for ${patch.id}; no files overwritten.`);
        process.exit(1);
    }
}
let applied = 0;
let current = 0;
const problems = [];

for (const patch of PATCHES) {
	const src = path.join(here, patch.src);
	const dest = path.join(modules, patch.dest);
	if (!fs.existsSync(src)) {
		problems.push(`patch source missing: ${patch.src}`);
		continue;
	}
	if (!fs.existsSync(dest)) {
		problems.push(`not installed, skipped: ${patch.dest}`);
		continue;
	}
	const want = readClientSource(patch.src, here);
	if (fs.readFileSync(dest).equals(want)) {
		current++;
		console.log(`[patches] already applied — ${patch.label}`);
		continue;
	}
	fs.mkdirSync(path.dirname(dest), { recursive: true });
	fs.writeFileSync(dest, want);
	applied++;
	console.log(`[patches] applied — ${patch.label}`);
}

console.log(`[patches] summary: ${applied} applied, ${current} already current, ${problems.length} problem(s)`);
for (const problem of problems) console.error(`[patches]   - ${problem}`);
if (problems.length > 0) process.exit(1);
buildPersonalPlugin({ root });
