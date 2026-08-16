# DeepSeek Harness 非空 Git 项目治理烟测证据

- 日期：2026-08-16（Asia/Shanghai）
- 治理验证状态：PASS（本仓库、单次用户显式调用、只读边界）
- 环境集成状态：WARNING（Hindsight 知识库请求返回 401）
- 安装身份：`github:Solismuchengxue/dsh_plugin_swift_cycle#c09326cb44ab8dbda67f82535fca4efe85c0444b`
- Swift Cycle：`v1.2.0` / `af3c5ddafba516c304613ea69081118fc234add7`
- DeepSeek Harness：`@deepseek-ai/dsh` `0.1.0-rc.6`
- 验证项目：`dsh_plugin_swift_cycle` / `582f4ee258a4cb9b09276d2d18f73b72c20d731c`

## 范围与安全边界

验证对象为真实 `~/.dsh/profiles/web` consumer 和本仓库的非空 Git 工作区。公开证据不记录用户名或本机绝对路径。DSH 按正常流程使用既有模型配置和凭据；验证人员未直接读取、记录或输出凭据内容。

本次只提交一条真实模型请求。会话在发送前切换为 `Read Only`；不安装依赖，不修改 profile、项目文件或 Git 状态，不执行 Git 写操作，不调用子代理，也不继续第二次模型调用。

请求内容为：

```text
/swift-cycle 请对当前非空 Git 项目执行一次只读治理基线验证。读取 AGENTS.md、README.md、DESIGN.md 和必要的 docs，识别当前 HEAD、分支、工作树、文档权威关系、source/runtime 边界与已知未知项。仅输出治理基线摘要和验证结论；不要修改文件，不要执行任何 Git 写操作，不要安装依赖，不要调用子代理。
```

## 调用前基线

| 检查 | 结果 | 证据 |
|---|---|---|
| Git 身份 | PASS | `main` / HEAD `582f4ee258a4cb9b09276d2d18f73b72c20d731c` |
| 工作树 | PASS | tracked、staged 与未忽略 untracked 变更均为 0 |
| 跟踪载荷 | PASS | 22 个文件 |
| 聚合 SHA-256 | PASS | `6d83df1c1e9a65d0ce82239de70e3589ad4ca4ca1468a4db94f48ef73bf9de34` |
| 治理入口 | PASS | `AGENTS.md`、`README.md`、`DESIGN.md` 与 `docs/` 均存在 |

## 真实调用结果

| 检查 | 结果 | 证据 |
|---|---|---|
| 用户显式调用 | PASS | `/swift-cycle` 作为唯一用户消息提交 |
| 上下文注入 | PASS | 会话显示 `AGENTS.md` 与 `swift-cycle` 均已注入 |
| 权限 | PASS | 会话运行上下文与 UI 均显示 `Read Only` |
| Git 基线 | PASS | 正确识别 HEAD、分支、跟踪关系、clean 工作树与本地 tag |
| 文档职责 | PASS | 正确区分 README、DESIGN、AGENTS、docs 与本地维护记录的职责 |
| 源码/运行态边界 | PASS | 分别报告源码、候选制品、隔离 runtime 与真实 consumer 证据 |
| 已知未知项 | PASS | 未把其他 profile、未来版本、写入流程或生产治理声明为已验证 |
| 子代理 | PASS | 未调用子代理 |
| 浏览器控制台 | PASS | 调用完成后错误与警告日志为 0 |

模型通过只读 `read`、`glob` 和 `pwsh` 工具读取治理文档、Git 元数据、载荷锁及 SHA-256。它没有运行 `npm test`、`verify:upstream` 或 `pack:dry-run`，并在结论中明确这些既有证据未在本次会话复验。

`TODO.md` 与 `DEVLOG.md` 在本次调用中被读取，但保持 ignored 且未跟踪。模型正确把它们视为本地维护记录，没有将其作为长期共享权威；这也说明 `Read Only` 只限制写入，不限制模型读取工作区内可访问的 ignored 文件。

## 环境集成警告

DSH 自动注入的 Hindsight 集成尝试读取项目知识库，远端返回 `401 API key required`。该请求未向模型提供知识库内容，验证人员未读取或输出凭据，治理主流程继续完成。此结果只证明 Hindsight 在本次环境中不可用，不属于 Swift Cycle 适配器失败。

## 调用后差分

| 检查 | 结果 | 证据 |
|---|---|---|
| HEAD | PASS | 仍为 `582f4ee258a4cb9b09276d2d18f73b72c20d731c` |
| 工作树 | PASS | tracked、staged 与未忽略 untracked 变更仍为 0 |
| 跟踪载荷 | PASS | 仍为 22 个文件 |
| 聚合 SHA-256 | PASS | 仍为 `6d83df1c1e9a65d0ce82239de70e3589ad4ca4ca1468a4db94f48ef73bf9de34` |
| Git 锁 | PASS | `.git/index.lock` 不存在 |
| 模型调用 | PASS | 只完成本次调用，未继续第二次调用 |

真实模型调用会正常创建或更新 DSH 会话数据；这些 runtime/session 变化不属于项目工作树差分，本次也不把它们声明为零差分。

## 结论与限制

真实 Web consumer 已在一个非空 Git 项目中完成 Swift Cycle 治理基线识别，正确处理文档职责、Git 状态、源码/运行态边界和未验证项。非空 Git 项目治理这一验证项由 NOT_VERIFIED 更新为 PASS。

该结论只覆盖本仓库上述 HEAD、固定适配器安装身份、`0.1.0-rc.6` 和一次只读调用。以下内容仍未验证：

- 其他非空项目类型和其他 Harness profile；
- 对现有用户文件的写入、修改、提交或回滚；
- 写入权限、发布操作或生产治理流程；
- Hindsight 认证成功后的知识库行为；
- 未来 Harness 或模型版本的兼容性。
