# npm v0.1.1 发布证据

## 状态

- 发布候选：`in progress`
- npm Registry：`NOT_PUBLISHED`
- 隔离安装：`NOT_VERIFIED`
- GitHub Release：`NOT_CREATED`

各状态独立维护；候选制品通过不能替代 Registry、安装运行态或 Release 证据。

## 发布身份

- 包：`dsh-plugin-swift-cycle@0.1.1`
- 发布前基线 HEAD：`811f2ccee4c72187c701ed9c86d5e2dba5219f06`
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

## 发布关闭证据

发布 commit、Registry 完整性、隔离安装/卸载、临时环境清理和 GitHub Release 结果在实际完成后记录。未验证前不得将本文件状态改为完成。
