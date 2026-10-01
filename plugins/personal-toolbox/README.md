# 星潮工具箱 · Starwave Toolkit

原显示名「我的定制工具箱」。采用深蓝底、蓝青轨道与星芒图标；插件列表使用简短介绍，详情页使用轻量功能卡片和 SVG 线性图标，跟随浅色/深色主题。仅更新品牌与视觉，运行包名、4 个组件 ID、开关和用户数据保持不变。

这是 DeepSeek Harness 0.2.0-rc.2 的本地定制 bundle 源码包，不是 Codex 插件，也不是可脱离对应 Harness 源码直接安装的通用插件。本文件是维护入口：修改前请先阅读本目录 `docs/MAINTENANCE.md`、`docs/AI-HANDOFF.md` 和 `docs/DIRECTORY.md`。

## 目录与插件形式

全部长期源码集中在本目录：`src/`（智力检测、余额、消费、提示词和共享服务）、`compat/`（模型、路由、会话、技能与 Windows 兼容层）、`config/`（组件及补丁清单）、`assets/`（图标）、`tools/`（构建与导出）、`tests/`（回归）、`docs/`（维护说明）。详细目录见 [DIRECTORY.md](docs/DIRECTORY.md)，完整规则与功能约束见 [MAINTENANCE.md](docs/MAINTENANCE.md)，AI 接手说明见 [AI-HANDOFF.md](docs/AI-HANDOFF.md)。

本目录是版本绑定的 Harness 本地 bundle **源码包**，身份为 `@local/dsh-personal-customizations`；由工具生成现有 5 个运行包（bundle + 4 个组件），输出路径和组件 ID 不变。插件关闭状态、用户配置和数据库不随源码目录移动。`archive/` 只是旧一次性脚本，不参与构建；旧 `patches/*.mjs` 仅保留兼容命令转发。

在本目录可用 `npm run check`、`npm run apply`、`npm test`、`npm run export:source`。导出只包含源码及校验清单，不含密钥、配置、账本或浏览器历史。日常修改只构建，不自动重启；页面由用户自行验证。

## 给维护者的指令

先阅读仓库根 `AGENTS.md`、`README.md`、本目录 `docs/MAINTENANCE.md` 和 `config/patches.json`。安装边界以仓库根 README 为准；本文件帮助定位实现，详细行为以现有代码和维护约束为准。

1. Harness 定制以本目录 `plugins/personal-toolbox/` 为唯一长期源码。不要只改 `node_modules/`，也不要直接改生成包 `packages/dsh-personal-customizations/`；安装或升级会覆盖生成结果。改功能时更新 `plugins/personal-toolbox/config/patches.json` 的 `features`，按项目规则同步维护文档。
2. 保留供应商配置、模型、API 密钥及凭据引用、每日消费账本、浏览器 IndexedDB 和 localStorage、检测历史、`output/intelligence-tests` 中的生成文件。不要为修复问题清空或重置它们；不要改动插件现有的启用状态。
3. 更新依赖只使用 `update-deepseek-harness.bat` 或 `update-deepseek-harness.ps1`。更新前备份并检查版本；版本不匹配时停止覆盖，在已有 `plugins/personal-toolbox/` 源码上适配。普通修改不需要运行更新脚本或重新注册插件。
4. 修改后依次运行 `node plugins/personal-toolbox/tools/apply.mjs --check`、`node plugins/personal-toolbox/tools/apply.mjs`；改过的 JavaScript 再运行 `node --check <文件>`，相关功能运行对应的 `plugins/personal-toolbox/tests/verify-*.mjs`。最后说明改动的补丁源文件和验证结果。

## 功能与源码

插件详情页有四个可分别开关的组件。关闭某项仅停止对应入口和服务；重新开启应恢复已有记录，不删除数据。

| 功能 | 维护入口 |
| --- | --- |
| 智力检测页面、鹈鹕预览、糖果答案、时间轴、历史对照、请求核查 | `plugins/personal-toolbox/src/intelligence/client.js` |
| 独立检测请求、请求重试、原始文件保存、余额服务和消费账本 | `plugins/personal-toolbox/src/shared/services.js` |
| 余额前端、供应商设置、多命名密钥与模型编辑 | `plugins/personal-toolbox/src/balance/client.js`、`plugins/personal-toolbox/compat/models/client.js` |
| 独立消费总览、每日模型用量、单价与长期账本 | `plugins/personal-toolbox/src/spending/client.js`、`plugins/personal-toolbox/src/spending/host.js`、`plugins/personal-toolbox/src/spending/style.css` |
| 组件入口、插件元数据和兼容校验 | `plugins/personal-toolbox/config/components.json`、`src/bundle/index.js`、`package.json`、`cordis.patch.yml` |
| 组件列表图标 | `plugins/personal-toolbox/assets/icons/`；由 `components.json` 的 `icon` 指定，构建时写入各组件包的 `icon.svg` |
| 模型请求路由和推理强度 | `plugins/personal-toolbox/compat/routing/pi-ai.js`、`plugins/personal-toolbox/compat/model-selection/client.js`；完整映射见 `plugins/personal-toolbox/config/patches.json` |
| 插件构建、版本检查和恢复 | `plugins/personal-toolbox/tools/build.mjs`、`plugins/personal-toolbox/tools/apply.mjs`、`plugins/personal-toolbox/config/patches.json` |
| 常用提示词 | 长期源码在 `src/prompts/`；构建时恢复 `packages/dsh-client-ui-prompt-presets/`，不再依赖生成包作为唯一源码 |

智力检测是独立后台请求，不创建普通聊天会话；可以组合测试鹈鹕 SVG 与糖果推理，也可以单独测试。检测题按用户原文发送，不额外拼接限制；保留模型原始输出、请求证据、预览和历史。切换显示模式、单独测试或关闭组件时不能意外覆盖其他检测结果。余额与消费按供应商及密钥区分，临时查询失败不清空已保存记录。常用提示词只填入输入框，不自动发送。

插件详情显示 **4 个独立宿主服务组件 + 1 组配套兼容层**。上方介绍卡说明全部功能，文件夹按钮与版本标签并排。按钮打开完整 `plugins/personal-toolbox/` 定制源码目录；这里已按 `src/`、`compat/`、`config/`、`assets/`、`tools/`、`tests/` 分类放置全部长期源码、兼容补丁、图标、构建工具和离线测试，`packages/` 仅是生成输出。后端 `/api/personal-plugin-folder` 验证固定目录并通过 Windows 桌面启动资源管理器，返回路径，失败明确提示；不读取或改写其中的内容。

「配套兼容层」在组件列表下方单独显示总开关和 5 个子项：模型切换与多密钥菜单、模型设置、思考滑条、会话菜单、技能菜单。保存在浏览器 `dsh.local.compat.v1`，沿用旧状态，无记录时全部开启；localStorage 配额满或拒绝写入时，备用同源 Cookie `dsh_compat_v1` 仅保存 5 位开关状态。所有相关客户端共用 `src/shared/compat-preferences.js`，由 `tools/client-sources.mjs` 构建内联；备用状态优先，不清空或裁剪历史。读回确认写入成功才更新界面，双存储均失败不改变显示状态，刷新页面后生效。不删除供应商、密钥、模型、会话或技能数据。后台多密钥路由、请求参数兼容不受开关影响。兼容层不是新的宿主服务，因此不把官方 4 个运行组件的数量改成 5。总开关和子项统一复用 `@deepseek-ai/dsh-client-ui-primitives` 的 `Switch`，与上方宿主组件开关保持同一尺寸、配色和交互；不要重新添加自绘开关样式。状态复用 `StateDot` 与中性文字：按页面加载时的开关显示运行中/已关闭，保存但尚未刷新时显示待刷新；不是后台服务健康诊断。关闭模型菜单、模型设置、会话菜单或技能菜单增强后，构建内联的 `compat/baseline/` 官方同版本客户端负责注册完整原始界面，不隐藏入口、也不继续运行增强版。基线来自官方 npm 包，保留 MIT、下载地址、包完整性和源码 SHA-256；不能用已修改的升级备份替代。单独关闭思考滑条会恢复普通推理档位选项，不隐藏推理设置；模型菜单关闭时整个菜单回退原版，因此滑条增强也不生效。图标统一为圆角外框、彩色渐变底块和白色 SVG 图形，不使用字符符号。客户端声明 plugin-manager 依赖；`plugins.detail.section` 的 JSX 调用必须传空 props 对象，否则 React 运行时会抛错并隐藏该区块。

## 按密钥管理模型

会话输入框的模型选择菜单按供应商、密钥、模型三级展示，密钥名称与顺序直接来自配置镜像，供应商设置保存后即时更新；旧未绑定模型沿用该供应商原默认密钥。重复模型的本地别名仍分别可选，选中后沿用原模型 ID 和原请求线路。菜单内的搜索框是带图标的自定义输入，键盘处理按它内部的原生输入判断，避免打字被当成菜单导航而无法搜索。实现源 `plugins/personal-toolbox/compat/model-selection/client.js`，离线回归 `node plugins/personal-toolbox/tests/verify-model-selection-keys.mjs`。

智力检测的添加检测模型弹窗使用同一套三级顺序：先供应商，再该供应商的命名密钥，最后密钥下的模型，并支持按供应商、密钥或模型名称搜索。密钥归属读取设置镜像，只按模型 ID 精确匹配；没有命名密钥的供应商仍按模型平铺。思考强度和等待时限的选择器不带搜索。实现源 `plugins/personal-toolbox/src/intelligence/client.js`。

供应商编辑弹窗的“模型”页按命名密钥分组，标题显示密钥名和模型数量。每组只保留一个“添加模型”入口，底部重复入口和右上角“获取可用模型/查询线路”已移除。点击打开统一窗口，可选择“获取可用模型”或“手动添加”，两种方式均固定绑定该组密钥。获取模式支持搜索、多选和失败重试；手动模式保留模型 ID、名称、容量及图片能力。打开或取消不新增空模型，关闭或切换手动时忽略迟到的获取结果；无命名密钥时仍保留一个添加入口。双击模型可编辑绑定，组内可拖动排序；相同上游模型绑定不同密钥时分别保留。

不再提供“未绑定模型使用的默认密钥”及供应商默认密钥快捷切换。旧未绑定条目按原有效线路显示，在用户点击保存时固定已有显式模型和覆盖项的绑定；取消不写配置。继承目录和旧认证回退继续兼容，保留模型别名、图片能力、凭据引用和其他隐藏字段，不批量改写用户配置。

这部分属于工具箱配套的模型设置兼容层，维护源是 `plugins/personal-toolbox/compat/models/client.js`；随项目补丁恢复，关闭工具箱不会撤销。回归检查为 `node plugins/personal-toolbox/tests/verify-model-key-groups.mjs`；请同时保留按密钥路由及余额查询的独立行为。

## 消费界面现状

最新界面沿用已完成的月历每日明细，点击日期展开供应商或模型用量；余额总览和模型设置余额统一以人民币口径展示，元/CNY/USD/$/¥ 按现有界面规则折叠为单一金额，不改原始账本或查询配置。下方及完整维护文档里的早期“按币种分组/可展开日期行”描述是改版历史，不应据此回退当前源码。

## 兼容与安装

运行期间每5分钟按现有余额查询配置采样（遵守原查询缓存间隔），手动刷新可立即尝试；未配置或关闭的查询不调用模型，停用供应商不采样。后台未运行时不采样；跨日差额仍归采样当日，不能补造精确上游历史。

「消费总览」与原「余额与消费」并列、可分别开关。服务运行状态页的页签栏在「智力检测」旁提供「余额总览」页签，查看同一套每日供应商消费及合计、模型和密钥 token 用量与自定义单价估算、时间范围及 Excel（.xlsx）导出，报表分为说明、每日汇总、余额明细、模型用量、余额读数、单价与统计设置，标题冻结、明细可筛选、金额和 Token 为数值，保留原币种和未知费用空白；只在本地生成全部已加载历史，不修改账本；该页签由消费总览组件自行挂载，两个组件都开启时才出现，关闭任一组件即回到只有智力检测。插件详情中的组件列表仍可打开同一页面，应用主侧栏不新增入口。余额统计每个供应商选一把代表密钥或排除共享账户；不自动识别跨供应商的重复账户。余额差额与模型估算独立展示，币种分别累计；修改单价重算历史估算，不伪造旧模型账单。`personal-spending.sqlite` 位于 DSH_HOME（默认用户目录 `.dsh`），与旧余额账本一起长期保留；不得清空、随版本替换或按期限裁剪。用量仅在请求结束后记账，强制退出或关闭组件期间可能缺失；统计不保证覆盖上游全部扣款。专用验证：`node plugins/personal-toolbox/tests/verify-personal-spending.mjs`。

界面按卡片组织：顶部工具栏切换「余额变化 / 模型估算」与时间范围（当天、7 天、30 天、全部）；主指标卡给今天总花费、时段合计、有记录天数，并在余额口径下显示较上一个有记录日期的变化；「逐日趋势」一天一根柱，柱高是当天合计，鼠标移上或点击后在图上方显示当天金额，不同币种绝不叠加或换算；「供应商与统计密钥」显示连接状态点、余额读数、统计密钥和单价设置；「每日明细」可逐日展开：每行左侧是日期块（大号日期、下方年月），旁边是星期和「今天」标记，金额与供应商数量靠右，避免日期、星期和金额挤在一起折行；余额口径给出供应商占比条，估算口径给出 token 表格与本日合计。样式源码是本目录 `src/spending/style.css`，由 `plugins/personal-toolbox/tools/build.mjs` 构建时内联进客户端（占位符 `/*SPENDING_CSS*/`），运行时没有额外请求；改样式请改这个 CSS 文件后重新运行补丁应用。需要脱离 Harness 核对视觉时，用 `node plugins/personal-toolbox/tools/preview-personal-spending.mjs [输出路径]` 生成独立预览页（默认 `output/spending-redesign-preview.html`，设 `SPENDING_PREVIEW_MODE=estimate` 预览估算口径）。

目前需要 Harness **0.2.0-rc.2** 和 `plugins/personal-toolbox/config/patches.json` 列出的配套补丁。模型设置、多密钥路由、推理强度、工作区与技能菜单、连接提示、Windows 文件关联修复属于插件依赖的兼容层；关闭插件不会撤销它们。`plugins/personal-toolbox/tools/build.mjs` 会把本目录的说明一起复制到 `packages/dsh-personal-customizations/`；该目录及 `node_modules/` 内的链接是生成结果。

首次迁移才使用 `node plugins/personal-toolbox/tools/register-personal-plugin.mjs`；不要在日常启动或修改后重复注册，以免重新启用用户关闭的组件。通过项目更新脚本升级，版本不兼容时先停止并适配补丁，不直接覆盖用户配置或本地定制。
