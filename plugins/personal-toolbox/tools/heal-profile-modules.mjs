#!/usr/bin/env node
/**
 * Rebuild `$DSH_HOME/profiles/node_modules` fallback links after an upgrade.
 *
 * Agent-preset health checks resolve plugin names through this fallback, not
 * only the install tree. A 0.1.6 overlay that leaves the old 0.1.5 links in
 * place makes Standard/Creator look "failed to load" because they enable
 * `@deepseek-ai/dsh-workflow-ptc`, which 0.1.5 never linked.
 */
import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, rmSync, symlinkSync, unlinkSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { linkLocalPackage, personalPackageNames } from './build.mjs';
import { projectRoot } from './paths.mjs';

const root = projectRoot;
const installAnchor = join(root, 'node_modules', '@deepseek-ai', 'dsh', 'package.json');

function dshHome() {
	const override = process.env.DSH_HOME?.trim();
	if (override) return override;
	return join(homedir(), '.dsh');
}

function ensureJunction(link, target) {
	mkdirSync(dirname(link), { recursive: true });
	try {
		const stat = lstatSync(link);
		if (stat.isSymbolicLink()) {
			try {
				unlinkSync(link);
			} catch {
				rmSync(link, { recursive: true, force: true });
			}
		} else {
			rmSync(link, { recursive: true, force: true });
		}
	} catch (error) {
		if (error?.code !== 'ENOENT') throw error;
	}
	symlinkSync(target, link, 'junction');
}

function linkMissingInstallPackages() {
	const installModules = join(root, 'node_modules', '@deepseek-ai');
	const fallbackModules = join(dshHome(), 'profiles', 'node_modules', '@deepseek-ai');
	if (!existsSync(installModules)) return 0;
	mkdirSync(fallbackModules, { recursive: true });
	let linked = 0;
	for (const entry of readdirSync(installModules, { withFileTypes: true })) {
		if (!entry.isDirectory() && !entry.isSymbolicLink()) continue;
		const pkg = join(installModules, entry.name, 'package.json');
		if (!existsSync(pkg)) continue;
		const dest = join(fallbackModules, entry.name);
		const destPkg = join(dest, 'package.json');
		if (existsSync(destPkg)) continue;
		ensureJunction(dest, join(installModules, entry.name));
		linked++;
		console.log(`[heal] linked @deepseek-ai/${entry.name}`);
	}
	return linked;
}

async function main() {
	if (!existsSync(installAnchor)) {
		console.warn('[heal] @deepseek-ai/dsh is not installed — skip profile module fallback.');
		return;
	}
	try {
		const { healProfilesModuleFallback, loadProfile } = await import('@deepseek-ai/dsh-app-boot');
		if (typeof healProfilesModuleFallback === 'function') {
			const profile = loadProfile('dsh', 'web', installAnchor);
			await healProfilesModuleFallback({ installAnchor, profile });
			console.log('[heal] official profile module fallback updated');
		}
	} catch (error) {
		console.warn(`[heal] official fallback failed (${error instanceof Error ? error.message : String(error)}); linking missing packages directly.`);
	}
	const linked = linkMissingInstallPackages();
	const localProfile = join(dshHome(), 'profiles', 'web', 'package.json');
	if (existsSync(localProfile) && JSON.parse(readFileSync(localProfile, 'utf8')).dependencies?.['@local/dsh-personal-customizations']) {
		for (const name of personalPackageNames) {
			const target = join(root, 'packages', name);
			if (!existsSync(join(target, 'package.json'))) throw new Error('Missing local plugin source: ' + name);
			for (const location of [join(dshHome(), 'profiles', 'web', 'node_modules'), join(dshHome(), 'profiles', 'node_modules')]) {
				linkLocalPackage(join(location, '@local', name), target);
			}
		}
		console.log('[heal] local plugin links restored; saved enablement unchanged');
	}
	if (linked > 0) console.log(`[heal] added ${linked} missing profile fallback link(s)`);
	else console.log('[heal] profile fallback already had every installed @deepseek-ai package');

	for (const name of ['dsh-workflow-ptc', 'dsh-ptc-runtime', 'dsh-ptc-runtime-node']) {
		const dest = join(dshHome(), 'profiles', 'node_modules', '@deepseek-ai', name, 'package.json');
		if (!existsSync(dest)) {
			console.error(`[heal] still missing ${name} under $DSH_HOME/profiles/node_modules`);
			process.exitCode = 1;
		}
	}
}

await main();
