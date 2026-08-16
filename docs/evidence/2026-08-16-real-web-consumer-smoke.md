# DeepSeek Harness 真实 Web consumer 烟测证据

- 日期：2026-08-16（Asia/Shanghai）
- 状态：PASS（真实 Web profile 加载、用户显式调用与只读边界）；非空 Git 项目治理效果为 NOT_VERIFIED
- 适配器版本：`0.1.0`
- 安装身份：`github:Solismuchengxue/dsh_plugin_swift_cycle#c09326cb44ab8dbda67f82535fca4efe85c0444b`
- Swift Cycle：`v1.2.0` / `af3c5ddafba516c304613ea69081118fc234add7`
- DeepSeek Harness：`@deepseek-ai/dsh` `0.1.0-rc.6`

## 范围与安全边界

验证对象为真实 `~/.dsh/profiles/web` consumer 和一个本机 `dsh_test` 工作区；公开证据不记录用户名或本机绝对路径。DSH 按正常流程使用既有模型配置和凭据，验证人员未直接读取、记录或输出凭据内容。

本次只提交一条真实模型请求，不安装、升级或卸载插件，不修改 profile、全局设置、Codex 用户级 Skill 或项目仓库，不执行第二次模型调用。会话权限在发送前切换为 `Read Only`。

请求内容为：

```text
/swift-cycle 请只读识别当前项目的 README、DESIGN、AGENTS 和 Git 边界，仅输出治理基线摘要。不要修改文件，不要执行 Git 写操作。
```

## 调用前基线

| 检查 | 结果 | 证据 |
|---|---|---|
| Web consumer | PASS | `127.0.0.1:3080` 由唯一 DSH Node.js 进程监听 |
| 插件加载 | PASS | Web 插件清单由 160 项增加为 161 项，`plugin-swift-cycle` 显示已启用 |
| Skill 可见性 | PASS | 输入 `/` 后出现 `swift-cycle`，并标记为“仅用户” |
| 工作区 | PASS | 文件 0、子目录 0、非 reparse point、非 Git 仓库 |
| 工作区聚合 SHA-256 | PASS | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |

## 真实调用结果

| 检查 | 结果 | 证据 |
|---|---|---|
| 用户显式调用 | PASS | `/swift-cycle` 作为唯一用户消息提交，未继续第二次调用 |
| Skill 注入 | PASS | 会话轨迹包含 `<skill_content name="swift-cycle">` |
| 资源基址 | PASS | 注入内容把资源目录指向真实 profile 内已安装包的 `vendor/swift-cycle` |
| 中文参考 | PASS | 模型通过只读 `read` 调用解析 `references/zh-CN.md` |
| 调用策略 | PASS | UI 将 Skill 标记为“仅用户”；本次由用户显式手势触发 |
| 权限 | PASS | 会话运行上下文与 UI 均显示 `Read Only` |
| 模型响应 | PASS | 真实模型完成治理基线摘要，正确报告空工作区、治理文档缺失和非 Git 边界 |
| 浏览器控制台 | PASS | 烟测后错误与警告日志为 0 |

模型共执行 5 次只读工具调用：

1. `pwsh`：确认当前目录并检查 Git 状态；
2. `glob`：检查工作区文件；
3. `read`：读取 Swift Cycle 简体中文参考；
4. `pwsh`：列出工作区和父目录并检查 Git 边界；
5. `pwsh`：记录证据时间并确认治理文档不存在。

首个 Git 检查退出码为 1，因为目标工作区不是 Git 仓库；这是本次基线的预期事实，不是适配器或 Skill 加载失败。PowerShell 同时出现 ConstrainedLanguage 启动噪音，但未阻断后续只读检查或模型最终响应。

## 调用后差分

| 检查 | 结果 | 证据 |
|---|---|---|
| 工作区文件 | PASS | 调用后仍为文件 0、子目录 0 |
| 工作区聚合 SHA-256 | PASS | 调用后仍为 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| Git 边界 | PASS | 调用前后均不是 Git 仓库，没有 Git 写操作 |
| profile 控制文件 | PASS | `package.json`、pnpm lock/workspace、`cordis.yml` 与 `cordis.patch.yml` 的 SHA-256 均保持安装后基线 |
| 凭据边界 | PASS | DSH 正常使用既有配置；验证人员未读取或输出凭据 |

真实调用会正常创建或更新 DSH 会话数据。本次没有建立 runtime/session 文件数量的调用前基线，因此不把会话数据声明为零差分；该变化不属于 `dsh_test` 项目文件差分。

## 结论与限制

真实 Web consumer 已证明能够加载固定发布 commit、发现用户专用的 `swift-cycle`、注入完整 Skill 内容、解析中文参考，并在 `Read Only` 权限下完成一次真实模型调用。真实 profile/consumer 这一交付层由 NOT_VERIFIED 更新为 PASS。

本次工作区为空且不是 Git 仓库，因此以下内容仍为 NOT_VERIFIED：

- 非空项目中的 README、DESIGN、AGENTS 与 docs 职责审查；
- 真实 Git 分支、HEAD、工作树和 diff 的治理判断；
- 对现有用户文件的保留与变更隔离；
- 任何写入、提交、发布或生产治理流程。
