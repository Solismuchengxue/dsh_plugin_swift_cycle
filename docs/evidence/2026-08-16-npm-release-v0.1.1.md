# npm v0.1.1 发布证据

## 状态

- 发布候选：`complete`
- npm Registry：`PASS`
- 隔离安装：`PASS`
- GitHub Release：`PASS`
- 真实 profile/consumer：`NOT_VERIFIED`

各状态独立维护；候选制品通过不能替代 Registry、安装运行态或 Release 证据。

## 发布身份

- 包：`dsh-plugin-swift-cycle@0.1.1`
- 发布前基线 HEAD：`811f2ccee4c72187c701ed9c86d5e2dba5219f06`
- 发布 commit：`d44bee70c109bb1d772d26ee790d6de9aadce9cc`
- GitHub Release：[`v0.1.1`](https://github.com/Solismuchengxue/dsh_plugin_swift_cycle/releases/tag/v0.1.1)
- 上游 Swift Cycle：`v1.2.0` / `af3c5ddafba516c304613ea69081118fc234add7`
- 上游载荷 SHA-256：`e01de6fa081c12c7e481a219d3932e48a2e386f05202e7b8a6e51a0029fad686`
- 兼容性运行时：`@deepseek-ai/dsh` `0.1.0-rc.6`

## 预期安装

```powershell
dsh plugin --profile web add dsh-plugin-swift-cycle@0.1.1
```

验证必须在临时隔离 `DSH_HOME` 中完成，不访问真实 profile、凭据或模型。

## 发布前检查

| 检查 | 状态 | 证据 |
| --- | --- | --- |
| npm 登录 | PASS | 仅验证认证状态，不读取或记录凭据 |
| 公共包名 | PASS | 发布前 Registry 中不存在该公共包 |
| 本地/远程 tag | PASS | 发布前均不存在 `v0.1.1` |
| GitHub Release | PASS | 发布前不存在 `v0.1.1` Release |
| 自动化测试 | PASS | 18/18；版本合同先按预期失败 3 项，身份同步后全部通过 |
| 上游载荷 | PASS | commit 与载荷 SHA-256 保持不变 |
| npm pack | PASS | 9 个文件；15,672 bytes；SHA-1 `03073bc60b02ea1cb9760feeca6b6a874295d3de` |
| Markdown 链接 | PASS | 13 个 Markdown 文件、10 个本地链接、0 个失效链接 |
| 敏感信息扫描 | PASS | 高置信凭据模式 0；本机绝对路径 0 |

候选 npm integrity：`sha512-UchV9FYEg3fqw67nAcvjMy7Hg41S2ytlMMBrFnI2NvybRKrWOGPAzfKvs4+0nWUPVpPc6wBox51Jj90/+Z/bLA==`。

## Registry 与隔离安装

| 检查 | 状态 | 证据 |
| --- | --- | --- |
| Registry 版本 | PASS | `version` 与 `latest` 均为 `0.1.1` |
| Registry 制品 | PASS | SHA-1 `03073bc60b02ea1cb9760feeca6b6a874295d3de`；integrity 与候选一致 |
| 隔离基线 | PASS | `@deepseek-ai/dsh` `0.1.0-rc.6`；依赖 0；目标 bundle 0 |
| 固定版本安装 | PASS | 依赖精确为 `0.1.1`；依赖 1；目标 bundle 1 |
| 安装载荷 | PASS | adapter `0.1.1`；上游载荷 SHA-256 不变；中文参考 SHA-256 `ddec383edfa8e419c0b098f6cf6ffc6f5a44c8a4a57084a0e22f222320fb1e0b` |
| Runtime 注册 | PASS | 恰好注册 1 次；provider `dsh-plugin-swift-cycle`；source `bundled`；`modelInvocable: false`；`userInvocable: true` |
| 重复安装 | PASS | 依赖和目标 bundle 均保持 1；配置 SHA-256 不变 |
| 卸载恢复 | PASS | 目标依赖和 bundle 均为 0；安装路径不存在；配置恢复基线 SHA-256 `4c0f9990705a86cd014c12b60b1827db9b0d697ab92432a6ebf0d3be02a2f7a5` |
| 临时环境清理 | PASS | 510 个外部依赖 Junction 仅删除临时链接，510 个目标均保持存在；随后删除剩余 37 项和临时根目录 |
| GitHub Release | PASS | 普通 Release；非 draft、非 prerelease；额外资产 0；远程 tag 指向发布 commit |

安装后合成配置 SHA-256 为 `ea0576639914812e0a99db31587a99c99de617e1427b76c649b714c52e461788`，重复安装保持相同，卸载后恢复基线。

## 发布关闭证据

源码、候选制品、npm Registry、隔离安装运行态和 GitHub Release 已分别关闭。验证未读取或输出 npm 凭据，未访问真实 DSH profile，未调用模型。

npm `v0.1.1` 的真实 Web profile/consumer 使用状态保持 `NOT_VERIFIED`；历史真实 consumer 证据对应 GitHub `v0.1.0` 固定 commit，不能自动晋升为本版本证据。
