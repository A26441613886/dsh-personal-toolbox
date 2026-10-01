# 星潮工具箱 · Starwave Toolkit

[![Harness](https://img.shields.io/badge/DeepSeek%20Harness-0.2.0--rc.2-4f86f7)](https://github.com/deepseek-ai/deepseek-harness)
[![License](https://img.shields.io/badge/license-MIT-31b89b)](LICENSE)

> 让 AI 工作流更顺手：模型检测、余额与用量、提示词收藏，以及一组可独立关闭的界面兼容增强。

![星潮工具箱封面](docs/images/starwave-cover.svg)

**星潮工具箱（Starwave Toolkit）** 是 DeepSeek Harness 的非官方、版本绑定本地定制源码。当前适配 **Harness `0.2.0-rc.2`**，插件版本 **`1.1.0`**。演示界面只使用虚构的 DeepSeek 示例数据，不包含任何真实供应商、密钥、余额、会话或个人提示词。

> 这是「源码 + 版本绑定兼容层」，不是在任意桌面版里上传 ZIP 即可安装的通用插件。兼容层包含修改后的上游打包代码；请先备份 Harness 安装与数据，不要对其他版本强行应用。

![消费总览演示](docs/images/spending-demo.png)

## 功能

> **演示数据说明**：仓库中的截图和预览脚本使用虚构的 DeepSeek 示例名称（如 `DeepSeek 演示`、`deepseek-chat`），不来自任何真实账户。仓库不包含供应商配置、密钥、余额、会话、浏览器存储或个人提示词。

- **智力检测**：独立后台请求，鹈鹕 SVG / 糖果推理、组合或单项检测、进度、原始答复与本机历史。
- **余额与消费**：按供应商和命名密钥查询余额，保留查询配置及长期消费记录。
- **消费总览**：每日月历、余额差额、token 用量、自定义单价估算、分类 Excel（.xlsx）导出，带标题冻结、筛选和隔行底色。
- **常用提示词**：在输入框填入本机收藏，不自动发送。
- **配套兼容层**：多密钥模型分组和路由、中文思考滑条、会话/技能菜单、连接状态以及 Windows 文件关联修复。

插件管理界面保留四个独立组件和一组界面兼容开关。关闭组件不会删除已有用户数据；关闭界面兼容开关不会撤销后台路由补丁。

## 源码布局

```text
plugins/personal-toolbox/
├─ src/       intelligence、balance、spending、prompts、shared、bundle
├─ compat/    models、model-selection、routing、providers、connection、sessions、skills、windows
├─ config/    组件清单、版本及补丁映射
├─ assets/    图标
├─ locale/    中英文说明
├─ tools/     检查、构建、应用、备份、预览、首次注册、导出
├─ tests/     离线回归及可选浏览器测试生成器
└─ docs/      目录、维护规则、上游来源与迁移映射
```

代码位于 [plugins/personal-toolbox](plugins/personal-toolbox/README.md)。完整说明见 [目录说明](plugins/personal-toolbox/docs/DIRECTORY.md)、[维护规则](plugins/personal-toolbox/docs/MAINTENANCE.md) 和 [AI 接手说明](plugins/personal-toolbox/docs/AI-HANDOFF.md)。历史说明可能描述旧界面；当前源码及最新规则优先。

## 安装到兼容的 Harness

要求：Node.js 支持 `node:sqlite`（建议 Node 22.13+），已安装 `@deepseek-ai/dsh@0.2.0-rc.2`；Windows 是主要维护平台，资源管理器相关功能仅支持 Windows。这里不包含上游依赖或现成运行包。

1. **先备份**你的 Harness 安装、原 DSH_HOME 和浏览器数据。备份不是仅复制这个源码仓库。
2. 下载或克隆本仓库，把 `plugins/personal-toolbox/` 放到 **Harness 安装根目录**的同名位置；不要覆盖已有定制而不做备份。不要把整个仓库当 npm 依赖安装到 profile。
3. 在 Harness 安装根目录运行：

   ```powershell
   node plugins/personal-toolbox/tools/apply.mjs --check
   node plugins/personal-toolbox/tools/apply.mjs
   ```

   检查会拒绝不匹配的包版本或缺失的补丁目标。应用会替换清单指定的 11 个安装文件，并生成 bundle 与 4 个组件运行包。
4. **只有第一次安装**，在 web profile 已初始化且你确认允许添加组件后运行：

   ```powershell
   node plugins/personal-toolbox/tools/register-personal-plugin.mjs
   ```

   它会修改 profile 的依赖与 bundle 注册并保存原文件备份。现有安装更新不要重跑，以免改变组件状态。自定义数据目录须用原 `DSH_HOME`，或明确传入 `--home`。
5. 由你自行重启原 Harness 服务，并刷新原地址加载；本仓库脚本不替你启动新服务。

源码必须保持 `<Harness 根目录>/plugins/personal-toolbox/` 的布局，因为工具会据此定位项目、依赖和输出。不要在任意独立克隆目录运行 apply/register/heal/backup；尤其不要对真实 profile 运行不匹配版本的安装操作。

## 更新与开发

在兼容安装的插件目录中：

```powershell
npm run check
npm run apply
npm test
npm run export:source
```

不必每次修改都导出 ZIP。`export:source` 只导出源码及 SHA-256 清单；测试使用隔离/模拟数据，不需要真实密钥。浏览器测试生成器不是默认测试，也不会自动操作页面。

更新 Harness 前需重新适配兼容层；不能只修改版本号绕过检查。上游依赖重装会覆盖兼容替换，需要再次应用。不要用 npm install 命令代替首次注册或插件应用。

## 数据、费用与限制

- **仓库不含** API 密钥、用户配置、浏览器存储、检测历史、消费库或模型生成文件。
- 实际模型检测可能产生费用，部分临时失败会自动重试；重试不是免费续写。
- 公开版本不包含私人供应商缓存域名白名单；该机制仅保留不可解析的示例域名和离线测试，默认不改写真实端点的 URL。不承诺检测可以绕过上游缓存。
- 余额差额与 token 估算均不能替代上游完整账单；停用、强制退出或没有用量时可能缺失。
- 当前 UI 把元/CNY/USD/$/¥ 折叠到人民币显示口径，**不代表进行了真实汇率换算**。原始账本与查询配置保持原样，请据原始币种核对实际账单。
- 模型 HTML/SVG 在隔离 iframe 中预览，可能执行模型返回的脚本；不要把生成内容当可信本地程序执行。
- 桌面、上游供应商及浏览器行为需使用者自行验证。不承诺所有平台或版本兼容。

## 开源许可

[MIT License](LICENSE)。修改后的上游代码保留 DeepSeek 版权；详见 [第三方说明](THIRD-PARTY-NOTICES.md)。此项目与 DeepSeek 官方无隶属或背书关系。
