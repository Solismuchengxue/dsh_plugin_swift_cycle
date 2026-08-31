# AGENTS.md

本仓库是 Swift Cycle 的 DeepSeek Harness 适配器，不是 Swift Cycle 权威源码仓库。

## 治理方式

- 非简单治理、文档收敛、提交规划和源码/运行态判断必须显式使用当前环境安装的 `$swift-cycle`。
- `README.md` 只保留用户可见的安装、使用和限制；`DESIGN.md` 是设计总入口；详细设计、计划和证据进入 `docs/`。
- 新建 docs Markdown 文件和多单词目录遵循 vendored Swift Cycle 的小写 snake_case 规则；既有命名偏差只在独立 documentation-hygiene 工作包内迁移，不复制第二权威。
- `TODO.md` 和 `DEVLOG.md` 仅作本地维护视图并保持 Git ignored；长期共享事实按职责晋升到 README、DESIGN、共享计划或 evidence 文档。
- 不创建 `PROJECT_STATE.md`，不把多个独立生命周期压缩成一个固定状态 Schema。

## 仓库与载荷边界

- 权威 Swift Cycle 仓库只读。`vendor/swift-cycle/` 只能从 `upstream.lock.json` 指定的上游身份刷新，禁止在本仓库手工编辑其内容。
- 适配器策略、DeepSeek Harness 注册和兼容性逻辑必须位于 vendor 快照之外。
- 不得删除、覆盖或修改用户已有的同名 Skill 安装。

## 权限与状态边界

- 源码、打包制品、隔离 Harness runtime、真实用户 profile/consumer、远程仓库和发布是独立层。
- 某一层的修改、验证或授权不能自动证明或授权下一层。
- 未经单独授权，不得安装或运行 DeepSeek Harness、修改真实 profile、创建 remote、push、tag、Release、Topic 或发布 npm 包。
- 不得引入运行时网络下载、凭据、模型配置或安装生命周期脚本。

## 验证与提交

- 行为修改遵循测试驱动开发：先确认测试因缺失行为而失败，再做最小实现并验证通过。
- 每个提交只包含一个意图；暂存前检查精确文件，提交前运行相关测试和 `git diff --check`。
- 完成声明必须分别报告源码、制品、隔离 runtime、真实 runtime 和发布状态；未直接验证的层保持未验证。
