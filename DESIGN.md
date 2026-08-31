# Swift Cycle DeepSeek Harness 适配器设计

## 状态

- 项目治理：已建立。
- 适配器源码：`0.1.3` 本地候选锁定 Swift Cycle commit `18df0777921aa9bf30977a4a07b911b8feaebd28`；18/18 自动化测试和显式上游 checkout 比对已通过，尚未提交或发布。
- 打包制品：`0.1.3` 候选的 19 个上游载荷文件、25 个包文件 dry-run 合同及临时解包后完整性验证已通过。
- 隔离 Harness 兼容性：已按固定版本通过验证。
- 真实用户环境：GitHub `v0.1.0` 固定发布 commit 已通过空工作区和本仓库中的只读显式调用烟测；npm `v0.1.1` 已精确安装到同一真实 Web profile，并通过本仓库中的一次只读显式调用烟测。
- GitHub 分发：`v0.1.0`、`v0.1.1` 与 `v0.1.2` 已发布；`v0.1.2` tag 精确指向发布 commit `8697450e53d9829c8b1e07d8fa5d7e059b0a7f89`。
- npm 分发：`0.1.2` 已公开发布，Registry SHA-1 与 integrity 和候选制品一致；`0.1.1` 的 rc.6 隔离验证保留为历史版本证据。
- `0.1.3` Runtime/consumer：尚未安装到隔离或真实 profile，也未执行模型调用，保持 `NOT_VERIFIED`。

以上结论彼此独立；本项目不使用单一总体状态替代各层证据。

## 目标

把锁定到精确 Swift Cycle commit 的载荷包装为一个可由 DeepSeek Harness 安装、仅允许用户显式调用、离线可校验的适配器，同时保持 Swift Cycle 权威仓库不变。

## 正式架构

适配器携带只读的上游快照，通过 DeepSeek Harness 的 `ctx.skills.register()` 注册 `swift-cycle`。上游身份和文件由 `upstream.lock.json` 及 SHA-256 校验约束；Harness 专用调用策略位于快照之外。`0.1.3` 候选锁定未打 tag 的 commit `18df0777921aa9bf30977a4a07b911b8feaebd28`，并携带简体中文 canonical Skill、host metadata、六份按需 reference 和十一份条件式模板。

首版使用固定 GitHub commit 安装。`v0.1.1` 增加 npm 固定版本分发；`v0.1.2` 更新上游治理载荷。`0.1.3` 本地候选继续刷新为中文 canonical、一次 adoption 后持久绑定、后台自动维护、条件式文档信息架构，以及可移植的 TODO、DEVLOG 与 DESIGN 模板，同时保持无运行时依赖、无安装生命周期脚本、运行时不访问网络且不使用凭据。Release tag 负责版本发现；npm 固定版本和 GitHub 完整 commit 分别作为对应渠道的不可变安装身份。

## 关键边界

- 权威治理内容：Swift Cycle 上游仓库；当前候选以精确 commit 为身份，`v1.2.0` Release 仅是上一已发布上游基线。
- Harness 适配行为：本仓库的入口、bundle patch、锁文件和兼容性证据。
- 交付层次：Git 源码 → 本地 pack 候选制品 → npm/GitHub 分发制品 → 隔离 Harness runtime → 真实用户 profile/consumer。
- 调用策略：`modelInvocable: false`、`userInvocable: true`。
- 兼容性基线：`deepseek-ai/deepseek-harness` commit `47f943859bef60e4160492346772ded9b24f765a`，`@deepseek-ai/dsh-skill` `0.1.0-rc.5`。
- 真实 consumer 基线：`@deepseek-ai/dsh` `0.1.0-rc.6`，适配器固定发布 commit `c09326cb44ab8dbda67f82535fca4efe85c0444b`。
- 非空 Git 治理基线：本仓库 HEAD `582f4ee258a4cb9b09276d2d18f73b72c20d731c`，`Read Only` 权限下单次用户显式调用。
- npm 分发基线：`dsh-plugin-swift-cycle@0.1.1`，发布 commit `d44bee70c109bb1d772d26ee790d6de9aadce9cc`，Registry integrity `sha512-UchV9FYEg3fqw67nAcvjMy7Hg41S2ytlMMBrFnI2NvybRKrWOGPAzfKvs4+0nWUPVpPc6wBox51Jj90/+Z/bLA==`。
- npm 真实 consumer 基线：`@deepseek-ai/dsh` `0.1.0-rc.6`，`dsh-plugin-swift-cycle@0.1.1`，本仓库 HEAD `b4fbdcc8b7e86ad3cb1e5350aa2ee2bf0b90457c`，`Read Only` 权限下单次用户显式调用。
- 当前分发基线：`dsh-plugin-swift-cycle@0.1.2`、发布 commit `8697450e53d9829c8b1e07d8fa5d7e059b0a7f89`、上游 commit `f383157fce7d179f29de867605d16e01b64366c8`、payload SHA-256 `fff7094f40c291cc9e03aa96ad271ef110229aba2fb7afa322473949043e4c19`；源码、本地 pack 与公共分发身份已验证。
- 当前源码候选：`dsh-plugin-swift-cycle@0.1.3`、上游 commit `18df0777921aa9bf30977a4a07b911b8feaebd28`、payload SHA-256 `4e3e94815947c77094717aacbe17c11f7c9c15906b3f9499433c21c254301664`；仅本地源码与候选 pack 已验证。

## 详细文档

- [已批准设计](docs/superpowers/specs/2026-08-15-deepseek-harness-adapter-design.md)
- [实施计划](docs/superpowers/plans/2026-08-15-deepseek-harness-adapter.md)
- [隔离 Harness 兼容性证据](docs/evidence/2026-08-15-dsh-compatibility.md)
- [真实 Web consumer 烟测证据](docs/evidence/2026-08-16-real-web-consumer-smoke.md)
- [非空 Git 项目治理烟测证据](docs/evidence/2026-08-16-real-git-project-governance-smoke.md)
- [npm v0.1.1 发布证据](docs/evidence/2026-08-16-npm-release-v0.1.1.md)
- [npm v0.1.1 真实 consumer 烟测证据](docs/evidence/2026-08-20-real-npm-v0.1.1-consumer-smoke.md)
- [npm v0.1.2 发布证据](docs/evidence/2026-08-30-npm-release-v0.1.2.md)

隔离 Runtime 与各分发身份的安装结论只适用于对应的固定 Harness 和适配器身份；真实 Web consumer 结论只覆盖 `0.1.0-rc.6`、GitHub `v0.1.0` 固定适配器 commit 在一个空的非 Git 工作区和本仓库中的只读调用，以及 npm `v0.1.1` 在本仓库上述 HEAD 的一次只读调用。`0.1.2` 的公共发布已验证；`0.1.3` 候选的隔离 Runtime、真实 profile、consumer、公共分发和生产治理均未验证。
