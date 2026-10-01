# Third-party notices

This is an unofficial, community-maintained customization bundle for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness). It is not an official DeepSeek product.

## DeepSeek Harness

Copyright (c) 2026 DeepSeek. Licensed under the MIT License; the complete permission and disclaimer are retained in [LICENSE](LICENSE).

The compatibility replacements under `plugins/personal-toolbox/compat/` contain modified upstream bundled JavaScript, not solely new plugin code. The split plugin UI/services may also contain upstream-derived portions. The upstream package version is `0.2.0-rc.2`:

- `@deepseek-ai/dsh-client-ui-settings-general`
- `@deepseek-ai/dsh-client-ui-settings-models` (client and host)
- `@deepseek-ai/dsh-client-ui-model-selection`
- `@deepseek-ai/dsh-client-ui-workspace`
- `@deepseek-ai/dsh-client-ui-skill`
- `@deepseek-ai/dsh-llm`
- `@deepseek-ai/dsh-llm-pi-ai`
- `@deepseek-ai/dsh-llm-deepseek`
- `@deepseek-ai/dsh-llm-deepseek-api-key`
- `@deepseek-ai/dsh-native-command`

Installed package license metadata and license-file SHA-256 are recorded in [UPSTREAM-PROVENANCE.json](docs/UPSTREAM-PROVENANCE.json). All ten replaced upstream packages were checked against their packaged MIT license files.

## Original UI baselines

`compat/baseline/` contains four unmodified official npm client bundles for `0.2.0-rc.2`, embedded by the build to restore the original Harness UI when enhancements are disabled. Their full MIT notice is retained in `compat/baseline/LICENSE`; package URLs, verified archive integrity and client SHA-256 are recorded in `compat/baseline/provenance.json`. These are upstream code, not new original contributions.

## External dependencies

This repository does not vendor `node_modules`, the pi-ai SDK, React, Cordis, Schemastery, or their runtime dependencies. They are installed separately with Harness and remain subject to their respective licenses. Imported modules are not relicensed by this repository.

No user configurations, API credentials, generated model responses, browser profiles, or ledgers are part of this source distribution.
