# DeepSeek Harness 隔离兼容性证据

- 日期：2026-08-15（Asia/Shanghai）
- 状态：PASS（隔离 Runtime）；真实用户 profile 与实际消费者为 NOT_VERIFIED
- 适配器 commit：`ddffe405d223cc161e47c83d6dc18c695bc8c52b`
- 适配器版本：`0.1.0`
- Swift Cycle：`v1.2.0` / `af3c5ddafba516c304613ea69081118fc234add7`
- DeepSeek Harness：`47f943859bef60e4160492346772ded9b24f765a`
- `@deepseek-ai/dsh` / `@deepseek-ai/dsh-skill`：`0.1.0-rc.5`
- Node.js：`v25.2.1`
- npm：`11.6.2`
- pnpm：固定使用 `11.7.0`

## 边界

全部操作发生在一次性 `<TEMP_ROOT>`、隔离 `DSH_HOME` 和本地验证 worktree 中。未读取或修改真实 `~/.dsh`，未读取凭据，未调用模型，未启动真实项目操作，未创建远程、tag、Release 或 Registry 发布。网络仅用于获取固定官方源码和构建依赖；适配器 Runtime 验证未发起网络请求。

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

## 未验证项

- NOT_VERIFIED：真实用户 profile 的安装与加载。
- NOT_VERIFIED：真实 Web/UI 或其他实际消费者是否使用该适配器。
- NOT_VERIFIED：固定 GitHub commit 的远程安装路径。
- NOT_VERIFIED：npm/其他 Registry 发布、tag、Release 与 topic。

## 清理

- 临时隔离目录：PASS；删除前确认根目录位于系统 Temp、根目录本身不是 reparse point，所有内部 reparse target 均未越界；删除后独立复核路径不存在。
- 真实用户 profile：未访问、未修改。
