# Swift Cycle DeepSeek Harness 适配器设计

## 状态

- 项目治理：已建立。
- 适配器源码：本地实现和自动化测试已完成。
- 打包制品：dry-run 文件合同及临时解包后完整性验证已通过。
- 隔离 Harness 兼容性：已按固定版本通过验证。
- 真实用户环境：GitHub `v0.1.0` 固定发布 commit 已安装到真实 Web profile，并通过空工作区和本仓库非空 Git 工作区中的只读显式调用烟测；npm `v0.1.1` 的真实 consumer 仍未验证。
- GitHub 分发：`v0.1.0` 与 `v0.1.1` 已发布；`v0.1.1` tag 精确指向发布 commit。
- npm 分发：`v0.1.1` 已公开发布，Registry 身份与候选制品一致，并通过 rc.6 隔离安装、注册、重试、卸载和清理验证。

以上结论彼此独立；本项目不使用单一总体状态替代各层证据。

## 目标

把锁定的 Swift Cycle v1.2.0 载荷包装为一个可由 DeepSeek Harness 安装、仅允许用户显式调用、离线可校验的适配器，同时保持 Swift Cycle 权威仓库不变。

## 正式架构

适配器携带只读的上游快照，通过 DeepSeek Harness 的 `ctx.skills.register()` 注册 `swift-cycle`。上游身份和文件由 `upstream.lock.json` 及 SHA-256 校验约束；Harness 专用调用策略位于快照之外。

首版使用固定 GitHub commit 安装。`v0.1.1` 增加 npm 固定版本分发，同时保持无运行时依赖、无安装生命周期脚本、运行时不访问网络且不使用凭据。Release tag 负责版本发现；npm 固定版本和 GitHub 完整 commit 分别作为对应渠道的不可变安装身份。

## 关键边界

- 权威治理内容：Swift Cycle 上游仓库及其 v1.2.0 Release。
- Harness 适配行为：本仓库的入口、bundle patch、锁文件和兼容性证据。
- 交付层次：Git 源码 → 本地 pack 候选制品 → npm/GitHub 分发制品 → 隔离 Harness runtime → 真实用户 profile/consumer。
- 调用策略：`modelInvocable: false`、`userInvocable: true`。
- 兼容性基线：`deepseek-ai/deepseek-harness` commit `47f943859bef60e4160492346772ded9b24f765a`，`@deepseek-ai/dsh-skill` `0.1.0-rc.5`。
- 真实 consumer 基线：`@deepseek-ai/dsh` `0.1.0-rc.6`，适配器固定发布 commit `c09326cb44ab8dbda67f82535fca4efe85c0444b`。
- 非空 Git 治理基线：本仓库 HEAD `582f4ee258a4cb9b09276d2d18f73b72c20d731c`，`Read Only` 权限下单次用户显式调用。
- npm 分发基线：`dsh-plugin-swift-cycle@0.1.1`，发布 commit `d44bee70c109bb1d772d26ee790d6de9aadce9cc`，Registry integrity `sha512-UchV9FYEg3fqw67nAcvjMy7Hg41S2ytlMMBrFnI2NvybRKrWOGPAzfKvs4+0nWUPVpPc6wBox51Jj90/+Z/bLA==`。

## 详细文档

- [已批准设计](docs/superpowers/specs/2026-08-15-deepseek-harness-adapter-design.md)
- [实施计划](docs/superpowers/plans/2026-08-15-deepseek-harness-adapter.md)
- [隔离 Harness 兼容性证据](docs/evidence/2026-08-15-dsh-compatibility.md)
- [真实 Web consumer 烟测证据](docs/evidence/2026-08-16-real-web-consumer-smoke.md)
- [非空 Git 项目治理烟测证据](docs/evidence/2026-08-16-real-git-project-governance-smoke.md)
- [npm v0.1.1 发布证据](docs/evidence/2026-08-16-npm-release-v0.1.1.md)

隔离 Runtime 与各分发身份的安装结论只适用于对应的固定 Harness 和适配器身份；真实 Web consumer 结论只覆盖 `0.1.0-rc.6`、GitHub `v0.1.0` 固定适配器 commit、一个空的非 Git 工作区和本仓库在上述 HEAD 的一次只读治理调用。npm `v0.1.1` 的真实 consumer、其他项目、写入流程和生产治理仍未验证。
