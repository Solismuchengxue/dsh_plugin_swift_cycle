---
name: swift-cycle
description: 仅当用户显式调用 swift-cycle，或当前项目的 AGENTS.md 已持久绑定该 Skill 时使用；适用于单项目内的轻量维护、文档治理、里程碑推进与收敛。
license: MIT
---

# Swift Cycle（快速螺旋）

## 目标与边界

用最小必要文档连接项目意图、实施、证据和学习。先读取真实现场，再做最小可验证变更；证据不足时保持候选、未知或未验证。

Swift Cycle 只负责一个项目内部的工程循环。它不负责上层协同、容量、独立验收、Registry、跨部门治理、模型选择或跨项目授权，也不接入 `stop-that-shit`。

## 调用与采用

- 系统层保持显式调用；不得把语义相似当成采用。
- 用户首次要求初始化或接管时，执行一次显式 `$swift-cycle` adoption。
- adoption 获得批准后，在项目 `AGENTS.md` 写入持久绑定：后续项目任务必须加载 `$swift-cycle`，由 Agent 自动维护，不要求用户重复调用或选择模式。
- 一次性显式审查不自动产生持久绑定；只有用户要求采用或初始化时才写入。
- 已绑定项目直接继续当前任务。不要向用户展示 bootstrap、milestone 或 closeout 菜单。

采用、绑定文本和内部阶段判断见 [adoption-and-routing.md](references/adoption-and-routing.md)。

## 使用项目语言

对话中的普通内容按用户要求，其次按本次调用语言。修改文件中的普通内容优先沿用文件主语言；新建文件中的普通内容优先项目主语言。技术标识不随普通内容翻译：文件名、命令、API、代码标识、标准状态值和品牌名保持准确原文。不要因对话切换而批量翻译。语言判定与图示表达见 [zh-CN.md](references/zh-CN.md)。

## 读取真实现场

1. 读取适用的 `AGENTS.md`、项目意图权威、`README.md`、`DESIGN.md`、相关 `docs/`、忽略规则和可访问的本地维护记录。
2. 检查 Git 分支、状态和相关 diff，分开既有用户改动与当前任务。
3. 区分已确认事实、观察、推断、候选、限制和未知项。
4. 只检查与当前声明相关的源码、制品、运行态或消费者层，不假设不存在或已经验证的层。

## 后台自动路由

根据现场自动判断当前阶段，不要求用户选择：

| 阶段 | 识别信号 | 默认动作 |
| --- | --- | --- |
| 首次采用或接管 | 尚无持久绑定，或文档职责未建立 | 保留现场，建立绑定和最小职责映射 |
| 普通推进 | 目标与架构边界未实质改变 | 只更新受影响代码、测试和权威文档 |
| 重大结构变化 | 权威、模块职责、合同模型、数据或交付边界发生实质变化 | 建立必要基线并更新设计或详细权威 |
| 里程碑关闭 | 交付与验证已结束 | 自动收敛文档、状态、证据与本地行动记录 |

详细触发、停止条件和授权边界见 [adoption-and-routing.md](references/adoption-and-routing.md)。

## 自动选择文档档位

选择能覆盖真实职责的最小档位：

- `minimal`：覆盖项目意图基线，并复用 README、简洁设计入口、AGENTS、本地 TODO/DEVLOG 和已有必要文档。
- `standard`：仅在长期架构、路线图、评估或重要决策需要独立权威时增加对应文档。
- `runtime_integration`：仅在当前任务需要建立、改变或验证多个运维、合同、安全、存储、集成或身份层时增加文档与证据。

档位是后台配置，不是用户模式，也不是固定目录树。读取 [document-profiles.md](references/document-profiles.md) 完成内部 `profile_conformance`：每项职责记录“复用现有 / 新建 / 不适用”、唯一权威、理由和更新触发。缺少该映射时，不得宣称档位已落地。

## 文档职责

- `docs/blueprint.md` 或等价权威：共享、受跟踪的项目意图基线，说明为什么做、为谁做、可观察结果、范围和非目标、约束与未知、关键边界、启动出口、待决事项和更新触发。
- `README.md`：面向用户的介绍、安装或启动、用法和用户可见限制。
- `DESIGN.md`：简洁设计总入口、正式边界、候选区分和详细文档索引。
- `AGENTS.md`：项目规则、Swift Cycle 持久绑定、安全边界、同步触发与验证要求。
- 本地 `TODO.md`：当前行动、阻塞和下一步；保持短小并由 Git 忽略。
- 本地 `DEVLOG.md`：失败、拒绝方案、内部判断、维护证据和演进；由 Git 忽略。
- `docs/`：长期共享的需求、架构、路线图、评估、运行手册、证据和 ADR。

一个事实只保留一个共享权威；其他位置使用链接或短摘要。模板只是条件式结构，必须按现场删减，禁止机械创建完整文档集。

新项目在实质实施前必须创建非空、受跟踪的 `docs/blueprint.md`；根目录 Blueprint 默认禁止。接管旧项目时，优先复用完整的 Charter、Product Brief、Project Spec 或其他等价权威，记录路径映射并链接；若缺失，才以确认事实和 `UNKNOWN` 创建 `docs/blueprint.md`。一次性审查不创建 Blueprint。docs 路径命名和旧文件迁移规则见 [document-information-architecture.md](references/document-information-architecture.md)。

需要创建或重整 Blueprint、TODO、DEVLOG、DESIGN 或架构文档时，读取 [document-profiles.md](references/document-profiles.md) 并按需裁剪对应模板，不复制参考项目事实或建立第二权威。先理解读者问题与项目事实关系，再决定是否使用可视化以及采用何种表达；不得把示例拓扑当成默认项目结构。

当文档数量、受众差异或平铺结构已经影响可发现性，读取 [document-information-architecture.md](references/document-information-architecture.md)。小项目由 DESIGN 提供必要索引；只有完整 docs 导航确有价值时才增加 `docs/README.md`，并把移动与链接修复纳入一个有界 documentation-hygiene 工作包。

## 自动同步与收敛

在已批准任务或里程碑范围内，文档同步属于正常实施步骤，无需单独请示：

- 用户行为变化时更新 README 或用户文档。
- 目标用户、价值、目标结果、范围、非目标、关键约束、假设或边界实质变化时更新 Blueprint；小型实现或普通里程碑变化不触发。
- 架构、合同、数据、工具职责或交付边界变化时更新 DESIGN 和对应详细文档。
- 行动、阻塞或下一步变化时更新本地 TODO。
- 失败、拒绝方案或内部维护证据变化时更新本地 DEVLOG。
- 长期承诺、决策、验证事实或迁移结果按职责晋升到共享文档，本地记录只保留状态或链接。
- 每个里程碑关闭时检查 Blueprint、README、DESIGN、docs、TODO、DEVLOG 和活动 Packet；更新受影响内容，或记录“无文档影响”及理由。

详细治理、状态和证据边界见 [governance-boundaries.md](references/governance-boundaries.md)；候选、失败学习和关闭流程见 [lifecycle-and-closeout.md](references/lifecycle-and-closeout.md)。

## 有限工作包

对非简单任务，在后台形成有限工作包：

- 目标、可观察退出条件、精确范围和保留项；
- 当前阶段、最小档位和 `profile_conformance`；
- 依赖、风险、已知未知项、回滚点和最近验证；
- 受影响文档及同步计划；
- 仍需独立授权的动作。

不把内部路由细节变成用户菜单。普通任务直接推进，用户只看到结果或精确 blocker。

## 短循环

1. 扫描当前事实与风险。
2. 完成推进目标的最小变更。
3. 立即运行最接近风险的验证。
4. 证据支持则继续；否则诊断、修正或回退当前步骤。
5. 在里程碑关闭时自动完成文档收敛和新鲜度检查。

不要因发现无关问题而扩展范围。多提交或混合 hunk 才规划提交边界；简单单提交只核对暂存范围。

## 何时请求决定

只在以下情况暂停并请求用户或外部协调方决定：

- 出现 materially new authority 或新的外部副作用；
- 目标、架构或关键边界发生实质改变；
- 无法安全判断事实的唯一权威位置；
- 证据否定当前计划、回滚不再安全或任务越出已批准范围。

普通文档同步、Mermaid、表格、TODO/DEVLOG 维护和档位选择不得打断用户。删除、安装、发布、部署、凭据、真实消费者切换等授权不会因 adoption 自动获得。

## 验证与独立审查

验证强度与声明风险相称：审查最终 diff，运行最近测试和 `git diff --check`，按受影响路径检查链接、忽略规则、文档新鲜度及真实交付层。

独立审查默认只判断目标、架构、边界、职责和文档是否与事实一致。除非哈希、manifest 或格式正是声明成立的必要证据，否则不要升级为全仓 SHA、多 manifest、反演摘要或格式微审计。未检查的层保持未验证。

## 简洁报告

只向用户报告：完成了什么、实际验证、发现的问题、需要决定的 blocker 或下一步。场景识别、档位选择、`profile_conformance` 和普通文档选择保留在后台；仅当其本身解释风险或 blocker 时展开。
