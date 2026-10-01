# Contributor and agent instructions

Read [README](README.md), [plugin documentation](plugins/personal-toolbox/README.md), [maintenance constraints](plugins/personal-toolbox/docs/MAINTENANCE.md), and [patch mapping](plugins/personal-toolbox/config/patches.json) before changes.

- This is an unofficial, version-bound source distribution for Harness 0.2.0-rc.2. Do not install/apply to other versions, or edit version numbers merely to bypass checks.
- Preserve stable package names, component IDs, user enablement and data. Do not execute registration, profile healing, update backup, or paid model calls without an explicit user request.
- Do not automatically restart Harness, launch a desktop window or repeatedly automate the UI.
- `plugins/personal-toolbox` is source. Never commit generated packages, node_modules, user settings, credentials, ledgers, browser storage, generated answers, or backup directories.
- Some maintenance documents preserve local migration history and describe launchers not shipped here. Public installation instructions in the root README take precedence.
- Preserve MIT and third-party notices. Compatibility replacements include upstream-derived bundled code; do not label all of it original work.
- Check syntax and affected offline tests. Installed runtime tests require the documented Harness installation layout. A standalone repository clone is not an active Harness installation.
- Review the complete staged diff and source file list before each public push. Keep LICENSE and THIRD-PARTY-NOTICES in exported source archives.
