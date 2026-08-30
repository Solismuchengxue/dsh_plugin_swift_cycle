# Swift Cycle for DeepSeek Harness

这是 [Swift Cycle](https://github.com/Solismuchengxue/skill_swift_cycle) 的 DeepSeek Harness 适配器。它把锁定到精确上游 commit 的 Swift Cycle 载荷注册为只能由用户显式调用的 Harness Skill。

## 当前状态

- 适配器版本：`0.1.2`（已发布）
- 上游 tag：无；当前快照锁定未打 tag 的精确 commit
- 上游 commit：`f383157fce7d179f29de867605d16e01b64366c8`
- 上游整体 SHA-256：`fff7094f40c291cc9e03aa96ad271ef110229aba2fb7afa322473949043e4c19`
- 本地源码验证：已通过 18/18 自动化测试和显式上游 checkout 比对
- 候选制品预检：已通过 13 文件 dry-run 合同和临时解包后完整性验证
- 分发状态：GitHub `v0.1.2` 与 npm `0.1.2` 已发布；`v0.1.0`、`v0.1.1` 保留为历史版本
- Harness Runtime 兼容性：已通过固定版本的隔离验证、GitHub 固定 commit 安装验证，以及 `0.1.0-rc.6` 真实 Web profile 中 GitHub `v0.1.0` 与 npm `0.1.1` 的只读显式调用烟测

`0.1.2` 当前证明源码、候选制品和公共分发身份；既有隔离 Runtime 与真实 Web consumer 结论仍只覆盖各自记录的 `0.1.0`/`0.1.1` 身份，不自动转移到该版本。

## 包含的 Swift Cycle 能力

- Knowledge Promotion：把长期共享事实从本地记录晋升到适当的 Git 管理资产。
- State Separation：拆分彼此独立的工程、实验、质量和发布结论。
- Governance Baseline：复杂治理开始前记录可比较的当前基线。
- Commit Boundary Planning：为多提交工作预先划分单一意图和验证边界。
- Source/Runtime Boundary：分别验证源码、制品、运行态和实际消费者。
- Scenario Routing：按任务场景选择最小有效治理路径。
- Document Profiles：按需使用 `minimal`、`standard` 或 `runtime_integration`，不强制固定目录树。
- Language Adaptation：分别解析交流语言与文件语言。
- Freshness and Packet Lifecycle：对齐过期事实并冻结、替代或退役 Review/Closeout Packet。
- Reusable Failure Learning：只把已确认且可复用的失败防线晋升为共享规则。

完整治理规则以锁定的上游 `SKILL.md` 为准；本 README 不复制 Skill 正文。

## 调用策略

适配器向 Harness 注册：

```text
name = swift-cycle
modelInvocable = false
userInvocable = true
```

Swift Cycle 不进入模型可隐式选择的 Skill 目录。用户需要显式输入：

```text
/swift-cycle
```

## 安装

日常安装使用 npm `latest`；当前公开版本为 `0.1.2`：

```powershell
dsh plugin --profile web add dsh-plugin-swift-cycle
```

需要固定、可重放的安装身份时指定版本：

```powershell
dsh plugin --profile web add dsh-plugin-swift-cycle@0.1.2
```

npm 固定版本不可变。需要直接从 GitHub 安装同一版本时，使用 `v0.1.2` 对应的完整 40 位 commit：

```powershell
dsh plugin --profile web add "github:Solismuchengxue/dsh_plugin_swift_cycle#8697450e53d9829c8b1e07d8fa5d7e059b0a7f89"
```

npm `0.1.1` 和其 GitHub 固定提交已在临时隔离 `DSH_HOME` 中验证。`0.1.2` 已完成公共分发身份校验，但尚未进行隔离或真实 profile 安装。各版本的安装身份和验证边界以对应 [GitHub Release](https://github.com/Solismuchengxue/dsh_plugin_swift_cycle/releases/tag/v0.1.2) 为准；不要把未固定的默认分支用于可重放安装。

`0.1.2` 的不可变安装身份是 npm 固定版本、GitHub tag 及上述完整发布 commit；不要把可继续前进的 `main` 当作不可变安装版本。

安装或改动 profile 前先检查合成配置：

```powershell
dsh --profile web --dump-config
```

GitHub `v0.1.0` 固定 commit 与 npm `0.1.1` 均已在同一个真实 Web profile 中完成安装、加载和只读调用烟测。其他 profile 的安装仍需用户单独授权。

## 本地验证

需要 Node.js 20 或更高版本。本包没有运行时依赖，也不需要执行安装生命周期脚本。

```powershell
npm test
npm run verify:upstream
npm run pack:dry-run
```

维护者可以显式提供一个 Swift Cycle checkout，做只读载荷比对：

```powershell
node scripts/verify-upstream.mjs --source "<path-to-swift-cycle-skill-directory>"
```

适配器加载和运行时不会访问网络，不读取凭据，也不会修改用户级 Skill 目录。通过 npm 或 GitHub 安装时，分发工具仍需要联网获取用户指定的固定版本。

## 同名 Skill 与证据边界

根据锁定的 DeepSeek Harness Skill Registry 规则，项目级同名条目可以覆盖本适配器的 Runtime 注册；Runtime 注册可能遮蔽同层的用户级同名条目。本适配器不会删除或改写被遮蔽的 Skill。

以下结论必须分别验证：

1. Git 源码与上游锁一致；
2. `npm pack` 候选制品内容正确；
3. 隔离 Harness Runtime 能注册和显式调用；
4. 真实用户 profile 已安装并由实际消费者使用。

真实 consumer 证据覆盖 GitHub `v0.1.0` 在空的非 Git 工作区与本仓库中的只读调用，以及 npm `0.1.1` 在本仓库中的一次只读调用。`0.1.2` 已完成源码、候选制品和公共分发身份验证，隔离 Runtime、真实 profile 和 consumer 均为 `NOT_VERIFIED`。参见 [2026-08-15 DSH 隔离兼容性验证](docs/evidence/2026-08-15-dsh-compatibility.md)、[2026-08-16 真实 Web consumer 烟测](docs/evidence/2026-08-16-real-web-consumer-smoke.md)、[2026-08-16 非空 Git 项目治理烟测](docs/evidence/2026-08-16-real-git-project-governance-smoke.md)、[2026-08-20 npm v0.1.1 真实 consumer 烟测](docs/evidence/2026-08-20-real-npm-v0.1.1-consumer-smoke.md)与 [2026-08-30 npm v0.1.2 发布证据](docs/evidence/2026-08-30-npm-release-v0.1.2.md)。

## 权威来源

- Swift Cycle 行为和版本：[Solismuchengxue/skill_swift_cycle](https://github.com/Solismuchengxue/skill_swift_cycle)
- DeepSeek Harness 插件与 Skill 语义：[deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness)
- 本适配器的架构和验证边界：[DESIGN.md](DESIGN.md)
