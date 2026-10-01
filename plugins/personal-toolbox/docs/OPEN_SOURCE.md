# 开源发布与隐私边界

本源码包可以公开发布，但它是绑定 DeepSeek Harness `0.2.0-rc.2` 的本地 bundle 源码，不是脱离 Harness 的通用安装包。

## 发布包包含什么

- `src/`、`compat/`、`config/`、`assets/`、`locale/`：功能源码、兼容层、稳定组件清单、图标和元数据。
- `tools/`、`tests/`、`docs/`：构建、恢复、离线验证和维护文档。
- `source-manifest.json`：导出文件的 SHA-256 清单。
- `LICENSE`：MIT 许可证。

## 明确不包含什么

源码导出不会读取或复制以下内容：

- 浏览器 `localStorage` / IndexedDB，包括“常用提示词”收藏；
- 会话记录、检测历史、模型配置、供应商配置和 API 密钥；
- `personal-spending.sqlite`、SQLite WAL/SHM、余额历史和消费账本；
- `output/intelligence-tests/` 等生成文件；
- 用户目录、登录状态、Cookie、截图和聊天内容。

“常用提示词”功能的代码会保留，但公开包没有任何个人提示词。功能首次运行时读取使用者自己的浏览器存储；本包不提供默认个人内容，也不迁移原机器数据。

## 导出与检查

在兼容 Harness checkout 中运行：

```powershell
node plugins/personal-toolbox/tools/apply.mjs --check
node plugins/personal-toolbox/tools/apply.mjs
node plugins/personal-toolbox/tools/export-source.mjs --directory-only --destination .\output\public-source
node plugins/personal-toolbox/tests/verify-toolbox-branding.mjs
```

导出工具拒绝覆盖已有目标，并逐文件计算 SHA-256。公开仓库应提交源码目录、文档、许可证和忽略规则，不提交 `packages/`、`node_modules/`、`output/`、备份目录或任何 profile 数据。

## 安装边界

发布者和使用者都必须先确认 Harness 版本与兼容补丁版本；不要把自己的 profile、凭据或浏览器数据放进 issue、压缩包或 Git 提交。首次安装前应备份 profile，并由使用者自己决定是否重启服务。
