# Swift Cycle for DeepSeek Harness

这是 [Swift Cycle](https://github.com/Solismuchengxue/skill_swift_cycle) 的 DeepSeek Harness 适配器。它把锁定的 Swift Cycle v1.2.0 载荷注册为只能由用户显式调用的 Harness Skill。

## 当前状态

- 适配器版本：`0.1.1`
- 上游版本：`v1.2.0`
- 上游 commit：`af3c5ddafba516c304613ea69081118fc234add7`
- 上游整体 SHA-256：`e01de6fa081c12c7e481a219d3932e48a2e386f05202e7b8a6e51a0029fad686`
- 本地源码验证：已通过
- 候选制品预检：已通过 dry-run 文件合同和临时解包后完整性验证
- 分发版本：GitHub `v0.1.0` 固定提交与 npm `0.1.1` 固定版本
- Harness Runtime 兼容性：已通过固定版本的隔离验证、GitHub 固定 commit 安装验证，以及 `0.1.0-rc.6` 真实 Web profile 中空工作区和一个非空 Git 项目的只读显式调用烟测

以上结果证明源码、候选制品、固定版本的隔离 Harness Runtime，以及两个已记录工作区中的真实 Web consumer 调用符合已验证边界；不代表其他项目、写入流程或生产治理已经验证。

## 包含的 Swift Cycle 能力

- Knowledge Promotion：把长期共享事实从本地记录晋升到适当的 Git 管理资产。
- State Separation：拆分彼此独立的工程、实验、质量和发布结论。
- Governance Baseline：复杂治理开始前记录可比较的当前基线。
- Commit Boundary Planning：为多提交工作预先划分单一意图和验证边界。
- Source/Runtime Boundary：分别验证源码、制品、运行态和实际消费者。

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

推荐通过 npm 安装固定版本：

```powershell
dsh plugin --profile web add dsh-plugin-swift-cycle@0.1.1
```

npm 版本不可变，适合作为简短、可重放的安装身份。GitHub `v0.1.0` 对应的完整 40 位 commit 仍可作为首版兼容安装来源：

```powershell
dsh plugin --profile web add "github:Solismuchengxue/dsh_plugin_swift_cycle#c09326cb44ab8dbda67f82535fca4efe85c0444b"
```

GitHub 固定提交命令已在临时隔离 `DSH_HOME` 中验证。各版本的安装身份和验证边界以对应 [GitHub Release](https://github.com/Solismuchengxue/dsh_plugin_swift_cycle/releases) 为准；不要使用未固定的默认分支或可移动 tag。

安装或改动 profile 前先检查合成配置：

```powershell
dsh --profile web --dump-config
```

公开发布 commit 已在一个真实 Web profile 中完成安装、加载和只读调用烟测。其他 profile 的安装仍需用户单独授权。

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

当前四层均已有对应证据；真实 consumer 证据覆盖空的非 Git 工作区和本仓库非空 Git 工作区中的各一次只读调用，不代表其他项目、写入流程或生产治理已经验证。参见 [2026-08-15 DSH 隔离兼容性验证](docs/evidence/2026-08-15-dsh-compatibility.md)、[2026-08-16 真实 Web consumer 烟测](docs/evidence/2026-08-16-real-web-consumer-smoke.md)与 [2026-08-16 非空 Git 项目治理烟测](docs/evidence/2026-08-16-real-git-project-governance-smoke.md)。

## 权威来源

- Swift Cycle 行为和版本：[Solismuchengxue/skill_swift_cycle](https://github.com/Solismuchengxue/skill_swift_cycle)
- DeepSeek Harness 插件与 Skill 语义：[deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness)
- 本适配器的架构和验证边界：[DESIGN.md](DESIGN.md)
