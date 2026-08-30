# npm v0.1.2 发布证据

## 状态

- 源码：`PASS`
- 候选制品：`PASS`
- GitHub 分发：`PASS`
- npm 分发：`PASS`
- 隔离 Harness Runtime：`NOT_VERIFIED`
- 真实 profile：`NOT_VERIFIED`
- 真实 consumer / 模型调用：`NOT_VERIFIED`

这些状态彼此独立。公共包发布不证明 DeepSeek Harness 已安装、加载或实际调用该版本。

## 发布身份

| 对象 | 精确身份 |
| --- | --- |
| npm 包 | `dsh-plugin-swift-cycle@0.1.2` |
| GitHub tag | `v0.1.2` |
| 发布 commit | `8697450e53d9829c8b1e07d8fa5d7e059b0a7f89` |
| Swift Cycle 上游 commit | `f383157fce7d179f29de867605d16e01b64366c8` |
| 上游载荷 SHA-256 | `fff7094f40c291cc9e03aa96ad271ef110229aba2fb7afa322473949043e4c19` |
| npm SHA-1 | `ba893e21a9a78324ca26d7eeb999f47627f23304` |
| npm integrity | `sha512-IihhK/JmQm9Ywfb3gyeAjM/maWkjXyPyEx5a9X6PLkdqPooZ06wrID3YO5N+Egr13g9Fgf60K9J7ek5rYCe9zg==` |

GitHub Release：<https://github.com/Solismuchengxue/dsh_plugin_swift_cycle/releases/tag/v0.1.2>

## 发布前验证

- `npm test`：18/18 PASS。
- 显式上游 checkout 比对：packaged 与 source payload SHA-256 一致。
- `npm pack --json --dry-run`：19 项文件，包大小 27,787 bytes，解包大小 70,204 bytes。
- 解包后上游载荷完整性验证：PASS。
- Swift Cycle `quick_validate.py`：PASS。
- Markdown 本地链接：13 条，0 条失效。
- 敏感信息与本机绝对路径扫描：0 条命中。
- `git diff --check`：PASS。

## 发布结果

- `main` 发布提交已普通非强制推送。
- `v0.1.2` 已创建并推送，精确指向发布 commit。
- `npm publish --access public` 成功；Registry `latest` 为 `0.1.2`。
- Registry 返回的 SHA-1 与 integrity 均和发布前 dry-run 候选一致。
- GitHub Release 为普通公开 Release，不是 draft 或 prerelease。

## 安装

```powershell
dsh plugin --profile web add dsh-plugin-swift-cycle@0.1.2
```

需要 GitHub 固定 commit 时：

```powershell
dsh plugin --profile web add "github:Solismuchengxue/dsh_plugin_swift_cycle#8697450e53d9829c8b1e07d8fa5d7e059b0a7f89"
```

## 边界

- 本次没有修改真实 DSH profile。
- 本次没有启动 Web/UI 或调用模型。
- 本次没有读取或输出 npm、GitHub 或模型凭据。
- 既有 `0.1.0` / `0.1.1` Runtime 与 consumer 证据不能自动晋升为 `0.1.2` 证据。
- 只有在固定 `0.1.2` 身份完成对应安装、加载与显式调用后，才能分别更新 Runtime、profile 和 consumer 状态。
