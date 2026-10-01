# 插件目录与维护入口

本插件的唯一长期源码根目录是 `plugins/personal-toolbox/`。不把配置、密钥、消费库、浏览器历史或检测生成文件混进插件源码。

```text
personal-toolbox/
├─ package.json             插件身份、源码入口和开发命令
├─ README.md                功能与维护说明（先读）
├─ cordis.patch.yml         4 个真实组件；稳定 ID 不改
├─ src/
│  ├─ bundle/index.js       运行包的兼容性检查入口
│  ├─ intelligence/client.js 智力检测及插件详情界面
│  ├─ balance/client.js     余额与消费界面
│  ├─ spending/             消费统计 client.js、host.js、style.css
│  ├─ prompts/              常用提示词 client.js、host.js、元数据
│  └─ shared/services.js    共享余额/检测服务（暂不拆分函数，避免行为变化）
├─ compat/
│  ├─ baseline/             4 个未修改官方客户端及 MIT/来源校验；关闭增强时使用
│  ├─ models/               供应商、密钥、模型设置与 onboarding
│  ├─ model-selection/      模型切换与思考强度滑条
│  ├─ routing/              后台请求路由及多密钥支持
│  ├─ providers/            官方供应商旧配置兼容
│  ├─ connection/           连接状态与断线提示
│  ├─ sessions/             会话菜单和工作区增强
│  ├─ skills/               技能菜单
│  └─ windows/              Windows 文件关联兼容
├─ config/
│  ├─ components.json       组件源码、包名、依赖和图标映射
│  └─ patches.json          兼容版本、完整功能清单和 11 个替换映射
├─ assets/icons/            插件与组件图标
├─ locale/                  插件中文/英文说明
├─ tools/                   构建、恢复、备份、预览和首次注册工具
├─ tests/                   离线回归；浏览器测试生成器不自动执行
├─ docs/                    分类、迁移与使用说明
└─ archive/                 旧一次性改版脚本，仅供查阅，不运行/不打包
```

## 开发命令

在项目根目录执行：

```powershell
node plugins/personal-toolbox/tools/apply.mjs --check
node plugins/personal-toolbox/tools/apply.mjs
node plugins/personal-toolbox/tests/verify-source-layout.mjs
```

在本插件目录执行：

```powershell
npm run check
npm run apply
npm test
npm run export:source
```

`build` 只构建运行包；`apply` 会先检查兼容版本及目标，再恢复兼容补丁并构建运行包。`export:source` 只导出源码及校验清单，不打包用户数据，不启动服务。导出明确不包含浏览器 localStorage/IndexedDB（包括常用提示词）、会话记录、检测历史、生成文件、供应商配置、凭据、API Key、余额账本或 SQLite/WAL。`register-personal-plugin.mjs` 仅首次安装使用，现有安装不要重跑。

## 源码与运行包

保留当前 `@local/dsh-personal-*` 包名、组件 ID 和 `packages/` 输出位置，确保已有 profile 链接和用户关闭状态继续有效。运行包分为多个包是 Harness 组件生命周期所需，不代表源码散落；源码已经全部在这个目录。

旧 `patches/*.mjs` 只是很薄的兼容命令入口，不是第二份实现。不要在那里增加功能或维护重复源码。

## 数据与加载

用户配置、凭据、余额账本与 `personal-spending.sqlite` 继续在原 DSH_HOME；浏览器 IndexedDB/localStorage 继续使用原地址，检测文件仍在 `output/intelligence-tests/`。备份本插件目录只备份代码，不等于备份这些数据；更新备份工具会分别备份它们。

只修改并构建，不自动重启 Harness 或调用启动器；需要加载后台新代码时由用户自行决定重启。界面由用户测试，不重复自动点按钮或调用收费模型。

当前兼容 Harness `0.2.0-rc.2`，并非任意版本可直接安装的通用插件。
