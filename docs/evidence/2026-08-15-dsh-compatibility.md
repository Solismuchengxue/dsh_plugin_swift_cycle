# DeepSeek Harness 隔离兼容性证据

- 日期：2026-08-15（Asia/Shanghai）
- 状态：PASS（隔离 Runtime、GitHub 固定 commit 分发、rc.6 隔离复验）；真实用户 profile 与实际消费者为 NOT_VERIFIED
- 适配器 commit：`ddffe405d223cc161e47c83d6dc18c695bc8c52b`
- GitHub Release：[`v0.1.0`](https://github.com/Solismuchengxue/dsh_plugin_swift_cycle/releases/tag/v0.1.0) / `c09326cb44ab8dbda67f82535fca4efe85c0444b`
- 适配器版本：`0.1.0`
- Swift Cycle：`v1.2.0` / `af3c5ddafba516c304613ea69081118fc234add7`
- DeepSeek Harness（原始固定基线）：`47f943859bef60e4160492346772ded9b24f765a`
- `@deepseek-ai/dsh` / `@deepseek-ai/dsh-skill`（原始固定基线）：`0.1.0-rc.5`
- `@deepseek-ai/dsh` / `@deepseek-ai/dsh-skill`（后续隔离复验）：`0.1.0-rc.6`
- Node.js：`v25.2.1`
- npm：`11.6.2`
- pnpm：原始固定基线使用 `11.7.0`；rc.6 隔离复验使用 `11.21.0`

## 边界

全部兼容性与分发验证均发生在一次性 `<TEMP_ROOT>`、隔离 `DSH_HOME` 和本地验证 worktree 中。未读取或修改真实 `~/.dsh`，未读取凭据，未调用模型，未启动真实项目操作，也未发布 Registry 包。网络仅用于获取固定官方源码、构建依赖和用户指定的 GitHub 固定提交；适配器 Runtime 本身未发起网络请求。

## 固定输入

| 项目 | 结果 | 证据 |
|---|---|---|
| Harness checkout | PASS | HEAD 精确等于 `47f943859bef60e4160492346772ded9b24f765a` |
| Harness 源码归档 | PASS | SHA-256 `534c9f1c9d30fea136026ecf7a23c2137e350f43558e2f1eff6218aef7b15b26` |
| Harness 依赖与构建 | PASS | 官方 lockfile 1203 项供应链检查通过；`pnpm run build` 通过 |
| 适配器测试 | PASS | `npm test`：18/18 |
| 适配器候选包 | PASS | 9 个文件；SHA-256 `41e9e20a62987109a29a59227e7349e85b400762efe4e94314c3d1f8f0b6a7b2`；npm shasum `36462b83532193329751a6817bd4e852d6869da8` |

Registry 未提供锁定的 `0.1.0-rc.5` CLI/Skill 包，因此没有用其他 Registry 版本替代固定基线；验证使用该 commit 的官方源码构建产物。Windows `tar` 无法创建仓库中的符号链接条目，随后改用浅层 Git checkout 同一 commit，未改变版本身份。

## 安装与配置合成

脱敏命令：

```powershell
$env:DSH_HOME = '<TEMP_ROOT>/dsh-home'
dsh plugin --profile web add '<TEMP_ROOT>/artifacts/dsh-plugin-swift-cycle-0.1.0.tgz'
dsh --profile web --dump-config
```

| 检查 | 结果 | 证据 |
|---|---|---|
| profile 初始化 | PASS | 只创建隔离 `profiles/web`；基础 bundle 为 `dsh-base` 与 `dsh-web-app` |
| 安装后依赖 | PASS | `dsh-plugin-swift-cycle` 指向同一临时 `.tgz` |
| bundle 注册 | PASS | bundle 列表追加且只出现一次 `dsh-plugin-swift-cycle` |
| 配置差分 | PASS | 仅新增 bundle 标题、`id: swift-cycle`、`name: dsh-plugin-swift-cycle` 三行；删除 0 行 |
| 配置基线 SHA-256 | PASS | 安装前 `577cd467343c634ec4d479e8d75525a25818a57cec961788e8e266d37ee8c015` |
| 安装后配置 SHA-256 | PASS | `9c49b89fd40e5679030fdd1f777e6b5f704ea14d8d6ca78c71bb2045c126b2a6` |
| 模型、凭据或网络配置 | PASS | 适配器 patch 未新增这些配置 |

## Runtime 与调用策略

验证使用固定 Harness 构建后的真实 `Context`、Skill Registry、Tool Registry、Agent Registry、`dsh-skill-filesystem` 和 `dsh-tool-skill`，加载隔离 profile 中实际安装的适配器包。

| 检查 | 结果 | 证据 |
|---|---|---|
| Runtime 注册 | PASS | `swift-cycle` 的 provider 为 `dsh-plugin-swift-cycle`，source 为 `bundled` |
| 调用策略 | PASS | `modelInvocable: false`；`userInvocable: true` |
| 用户显式调用 | PASS | `/swift-cycle` 产生一条 `skill-invocation`，注入 `<skill_content name="swift-cycle">` |
| 模型目录 | PASS | `swift-cycle` 不在 `skill-catalog` 条目中 |
| 模型工具调用 | PASS | 模型侧 `skill(name=swift-cycle)` 按策略失败关闭 |
| 资源目录 | PASS | `resourceBase` 位于隔离 profile 已安装包内 |
| 中文参考 | PASS | SHA-256 `ddec383edfa8e419c0b098f6cf6ffc6f5a44c8a4a57084a0e22f222320fb1e0b`；五项操作标题均可读取 |
| 同名用户 Skill | PASS | Runtime 注册按官方优先级胜出；隔离 sentinel 文件未被删除或改写 |

## 卸载与重装

| 检查 | 结果 | 证据 |
|---|---|---|
| 卸载 | PASS | 依赖与 bundle 消失，配置 SHA-256 恢复为安装前基线 |
| 同名 sentinel | PASS | 安装前、卸载后、重装后 SHA-256 均为 `afb6d87c026b97f0822eff8cdd4db2c05f01bb6a9e5d2c509df44b236261b1d8` |
| 重装 | PASS | 同一 `.tgz` 只注册一次 bundle，配置 SHA-256 与首次安装一致 |
| 重装后 Runtime | PASS | 再次注册、显式注入、模型目录排除和中文参考哈希均通过 |

## GitHub 固定 commit 分发验证

验证对象为公开仓库 `Solismuchengxue/dsh_plugin_swift_cycle` 的完整发布 commit `c09326cb44ab8dbda67f82535fca4efe85c0444b`。`origin/main`、`v0.1.0` tag 和 GitHub Release 在发布时均指向该 commit，Release 未附加额外资产。

脱敏安装命令：

```powershell
$env:DSH_HOME = '<TEMP_ROOT>/dsh-home'
dsh plugin --profile web add 'github:Solismuchengxue/dsh_plugin_swift_cycle#c09326cb44ab8dbda67f82535fca4efe85c0444b'
```

| 检查 | 结果 | 证据 |
|---|---|---|
| Harness 基线 | PASS | commit `47f943859bef60e4160492346772ded9b24f765a`；`@deepseek-ai/dsh` / Skill `0.1.0-rc.5` |
| GitHub 依赖身份 | PASS | 安装结果保留完整 commit `c09326cb44ab8dbda67f82535fca4efe85c0444b` |
| 安装工具链 | PASS | 官方源码安装与构建固定使用 pnpm `11.7.0`；插件命令由系统 pnpm `11.21.0` 转发执行 |
| 配置差分 | PASS | 仅新增 bundle 标题、`id: swift-cycle`、`name: dsh-plugin-swift-cycle` 三行；删除 0 行 |
| 配置 SHA-256 | PASS | 安装前 `577cd467343c634ec4d479e8d75525a25818a57cec961788e8e266d37ee8c015`；安装后 `9c49b89fd40e5679030fdd1f777e6b5f704ea14d8d6ca78c71bb2045c126b2a6` |
| 模型、凭据或网络配置 | PASS | 配置差分未新增相关字段；环境中未提供模型密钥，未启动模型或 Web 消费者 |
| 安装入口完整性 | PASS | 已安装 `index.js` 与发布候选均为 SHA-256 `ec025bec6389a3a1c5ef285412c49e9e64ccd545bd51a8ae25ef91bb3b6b63d8` |
| Runtime 注册与策略 | PASS | provider `dsh-plugin-swift-cycle`、source `bundled`、`modelInvocable: false`、`userInvocable: true` |
| 中文参考 | PASS | SHA-256 `ddec383edfa8e419c0b098f6cf6ffc6f5a44c8a4a57084a0e22f222320fb1e0b`；五项操作标题均可读取 |
| 临时环境清理 | PASS | 删除前验证根目录位于系统 Temp 且不是 reparse point，外部 reparse target 为 0；删除后路径不存在 |

## rc.6 隔离兼容性复验

复验使用真实环境已安装的 `@deepseek-ai/dsh` `0.1.0-rc.6`、`@deepseek-ai/dsh-skill` `0.1.0-rc.6` 和 pnpm `11.21.0`，但把 `DSH_HOME`、`DSH_AGENTS_HOME` 与工作目录全部指向一次性 `<TEMP_ROOT>`。子进程显式移除了模型 API 环境变量并关闭 telemetry；未挂载 LLM、credentials、Web 或 session persistence，也未读取或修改真实 `~/.dsh`。

安装身份仍为公开 GitHub 固定 commit：

```powershell
dsh plugin --profile web add 'github:Solismuchengxue/dsh_plugin_swift_cycle#c09326cb44ab8dbda67f82535fca4efe85c0444b'
```

pnpm 使用该完整 GitHub spec，并从内容寻址缓存复用同一对象；本次下载数为 0，不改变固定 commit 身份。

| 检查 | 结果 | 证据 |
|---|---|---|
| 空白 profile 基线 | PASS | 依赖 0；bundle 仅 `@deepseek-ai/dsh-base`、`@deepseek-ai/dsh-web-app`；配置 491 行 |
| 安装与身份 | PASS | 依赖精确固定到完整 commit；bundle 恰好 1 个；版本 `0.1.0` |
| 安装入口完整性 | PASS | 已安装 `index.js` SHA-256 `ec025bec6389a3a1c5ef285412c49e9e64ccd545bd51a8ae25ef91bb3b6b63d8` |
| 配置差分 | PASS | 基线 SHA-256 `577cd467343c634ec4d479e8d75525a25818a57cec961788e8e266d37ee8c015`；安装后 `9c49b89fd40e5679030fdd1f777e6b5f704ea14d8d6ca78c71bb2045c126b2a6`；仅新增预期三行，删除 0 行 |
| Runtime 注册 | PASS | provider `dsh-plugin-swift-cycle`；source `bundled`；资源目录位于临时已安装包内 |
| 调用策略 | PASS | `modelInvocable: false`；`userInvocable: true`；模型目录不包含 `swift-cycle`；模型工具调用失败关闭 |
| 用户显式调用 | PASS | 同一消息内重复 `/swift-cycle` 只产生 1 条 `skill-invocation`，并注入规范 `<skill_content name="swift-cycle">` |
| 中文参考 | PASS | SHA-256 `ddec383edfa8e419c0b098f6cf6ffc6f5a44c8a4a57084a0e22f222320fb1e0b`；五项操作标题均可读取 |
| 安装重试 | PASS | 同一固定 spec 再次安装后仍为 1 个依赖、1 个 bundle，配置哈希不变 |
| 卸载与重装 | PASS | 卸载后依赖 0、Swift bundle 0、安装目录不存在且配置恢复基线；重装得到相同入口与配置哈希，Runtime 再次通过 |
| 清单序列化 | PASS（有记录差异） | 官方 pnpm remove 会删除初始化时的空 `dependencies: {}` 字段；递归键排序并把缺失依赖视为空集合后，manifest 语义一致；lock、workspace、profile patch 均逐字节恢复 |
| 最终回退 | PASS | 最终再次卸载；基础 bundle、配置哈希、依赖集合和安装目录均恢复基线 |
| 临时环境清理 | PASS | 删除前 567 个目录项、510 个内部 reparse、外部 target 0；删除后 `<TEMP_ROOT>` 不存在 |

结论：公开发布 commit 对 rc.6 的隔离安装、Runtime 注册、用户显式调用、幂等重试、卸载与重装兼容性为 PASS。该结论不证明真实用户 profile 已安装，也不证明真实 Web/UI 消费者已切换。

## 未验证项

- NOT_VERIFIED：真实用户 profile 的安装与加载。
- NOT_VERIFIED：真实 Web/UI 或其他实际消费者是否使用该适配器。
- NOT_VERIFIED：npm/其他 Registry 分发；本项目未发布 Registry 包。

## 清理

- 临时隔离目录：PASS；删除前确认根目录位于系统 Temp、根目录本身不是 reparse point，所有内部 reparse target 均未越界；删除后独立复核路径不存在。
- GitHub 固定 commit 安装临时目录：PASS；使用相同边界检查独立清理，删除后路径不存在。
- rc.6 复验临时目录：PASS；567 个目录项中的 510 个 reparse target 均未越界，删除后路径不存在。
- 真实用户 profile：未访问、未修改。
