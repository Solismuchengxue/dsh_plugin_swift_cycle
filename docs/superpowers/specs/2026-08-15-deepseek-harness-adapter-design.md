# Swift Cycle DeepSeek Harness 适配器设计

## 状态

- 设计状态：已批准并作为当前实现依据。
- 本地源码状态：实现和自动化测试已完成。
- 候选制品状态：dry-run 文件合同及临时解包后完整性验证已通过。
- Harness Runtime 兼容性：等待单独授权，尚未执行。
- 首版分发方式：通过 GitHub 源码安装，并固定到精确提交。
- 首版不发布 npm 或其他 Registry。
- 创建远程仓库、push、Release、添加 Topic 和真实安装继续作为互相独立的授权事项。

## 目标

把 Swift Cycle v1.2.0 打包成真正可安装的 DeepSeek Harness 组合包，同时不修改 Swift Cycle 权威仓库，也不让适配器成为第二套治理规则来源。

首版适配器必须做到：

- 支持通过 `dsh plugin --profile web add github:...#ADAPTER_COMMIT_SHA` 安装；
- 只注册一个名为 `swift-cycle` 的 Skill；
- 在 DeepSeek Harness 中强制执行“仅用户显式调用”；
- 保留对简体中文参考文档的访问；
- 不依赖安装时构建、运行时网络、凭据或 npm 发布；
- 保存足够的上游身份与哈希证据，使打包载荷可复现、可核对。

## 非目标

首版不包含：

- 发布到 npm 或其他 Registry；
- 修改 Swift Cycle v1.2.0 或其现有 GitHub Release；
- 把 DeepSeek Harness 专用规则写入权威 Skill；
- 在运行时从 GitHub 下载 Skill 内容；
- 在开发过程中自动安装到用户的真实 Harness profile；
- 增加工具、模型提供方、凭据、网络集成或项目状态 Schema；
- 对尚未测试的未来 DeepSeek Harness 版本作兼容承诺。

## 仓库与包身份

| 项目 | 身份 |
| --- | --- |
| 本地仓库 | `F:\70_Infrastructure_and_Operations\prompt_engineering\dsh_plugin_swift_cycle` |
| 拟创建的 GitHub 仓库 | `Solismuchengxue/dsh_plugin_swift_cycle` |
| 包名 | `dsh-plugin-swift-cycle` |
| 适配器版本 | `0.1.0` |
| 上游 Swift Cycle 版本 | `v1.2.0` |
| 上游提交 | `af3c5ddafba516c304613ea69081118fc234add7` |
| Skill 名称 | `swift-cycle` |

适配器版本和 Swift Cycle 版本分别维护。只修复适配器时，仅升级适配器版本，不能暗示 Swift Cycle 本身发生变化。升级上游版本时，必须重新生成锁定快照并重新取得兼容性证据。

## 目录结构

```text
dsh_plugin_swift_cycle/
├── AGENTS.md
├── README.md
├── LICENSE
├── package.json
├── cordis.patch.yml
├── index.js
├── upstream.lock.json
├── vendor/
│   └── swift-cycle/
│       ├── SKILL.md
│       ├── agents/
│       │   └── openai.yaml
│       └── references/
│           └── zh-CN.md
├── scripts/
│   └── verify-upstream.mjs
├── tests/
│   └── plugin.test.mjs
└── docs/
    └── superpowers/
        └── specs/
            └── 2026-08-15-deepseek-harness-adapter-design.md
```

`vendor/swift-cycle/` 是从锁定的上游 tag 复制得到的发布快照，不允许在适配仓库中手工修改。适配器策略和加载行为必须放在快照外部。

## 方案比较

### 方案一：固定快照 + Runtime 注册（采用）

插件读取仓库中固定的上游 Skill 快照，并通过 `ctx.skills.register()` 注册。

优点：

- 可以由 Harness 注册表强制执行显式调用策略；
- 不修改权威 Skill 的 frontmatter；
- 不依赖运行时网络；
- 不需要自定义 Provider 或文件监听器；
- 使用预置 JavaScript 入口，不需要安装时编译。

代价：

- 适配器需要携带一份版本化的上游载荷，因此必须建立严格的晋升与哈希验证流程。

### 方案二：独立文件系统 Provider

组合包可以挂载一个专用 Provider，读取随包 Skill 目录。

首版不采用该方案，因为它会增加 Provider 生命周期、优先级、监听器和路径解析问题，却不能为单个静态 Skill 带来实际收益。同时仍要处理 DSH 专用调用策略或 Provider 侧策略覆盖。

### 方案三：GitHub 远程 Provider

组合包可以在发现或加载阶段从 GitHub 获取指定 tag 的 Skill。

不采用该方案，因为它会把运行时网络可用性、远程失败、缓存失效、供应链验证和远程解析稳定性引入一个应当离线可用的治理工具。

## 组合包设计

`package.json` 声明 DeepSeek Harness bundle：

```json
{
  "name": "dsh-plugin-swift-cycle",
  "version": "0.1.0",
  "type": "module",
  "main": "index.js",
  "files": [
    "index.js",
    "cordis.patch.yml",
    "vendor",
    "upstream.lock.json",
    "LICENSE"
  ],
  "dsh": {
    "bundle": {
      "patch": "./cordis.patch.yml"
    }
  }
}
```

包中只包含已经写入仓库的 JavaScript 和静态资源，不设置 `prepare`、`postinstall` 或其他安装时脚本。

`cordis.patch.yml` 只插入适配器插件：

```yaml
- insert:
    - id: swift-cycle
      name: dsh-plugin-swift-cycle
```

这个 patch 不增加模型、凭据、权限、文件系统或网络配置。

## Runtime 注册

入口导出 `inject = ['skills']`，并注册一个 Runtime Skill：

| 字段 | 值 |
| --- | --- |
| `name` | `swift-cycle` |
| `description` | 从锁定的上游 frontmatter 生成 |
| `source` | `bundled` |
| `provider` | `dsh-plugin-swift-cycle` |
| `invocation.modelInvocable` | `false` |
| `invocation.userInvocable` | `true` |
| `resourceBase.kind` | `directory` |
| `resourceBase.path` | 随包 `vendor/swift-cycle` 的绝对路径 |
| `content` | 去除 YAML frontmatter 后的上游 `SKILL.md` 正文 |

插件只有在以下条件全部满足时才能注册，否则必须在激活阶段失败关闭：

- 随包 manifest 正确；
- `SKILL.md` frontmatter 边界可识别；
- Skill 身份符合预期；
- 载荷哈希与锁文件一致。

不得注册残缺或身份未知的载荷。

适配器有意使用 Runtime 注册优先级。根据 Harness 的优先级规则，项目级同名 Skill 可以覆盖它；用户级同名文件系统 Skill 可能被插件注册遮蔽。文档和测试必须明确这一点，但插件不得删除、覆盖或改写其他安装。

## 调用策略

Swift Cycle 继续保持“需要用户有意识地手动调用”。

适配器在 Harness 注册边界强制设置：

```text
modelInvocable = false
userInvocable = true
```

用户通过以下手势调用：

```text
/swift-cycle
```

权威快照中的 `agents/openai.yaml` 仅用于保留上游来源完整性，不作为 DeepSeek Harness 的调用策略来源。

## 上游快照与证据

`upstream.lock.json` 记录：

- 上游仓库 URL；
- 上游 tag 与 commit；
- 适配器版本；
- 随包上游文件的相对路径；
- 每个文件的 SHA-256；
- 确定性的整体载荷哈希；
- 生成后的注册元数据哈希。

`scripts/verify-upstream.mjs` 提供两种模式：

1. 离线验证：核对 `vendor/` 文件和 `upstream.lock.json`。
2. 维护者同步：升级时，将单独取得的精确上游 checkout 或 archive 与候选快照比较。

普通插件运行和用户安装过程中不发起网络请求。快照升级是明确的维护操作，不能自动执行。

完成晋升后，适配器文档只链接上游长期事实，不在适配器仓库中重新编写完整 Swift Cycle 规则。随包快照只承担固定版本分发职责。

## 错误处理

以下情况必须激活失败：

- 上游锁文件缺失或格式错误；
- `SKILL.md` 缺失；
- Skill 名称不是 `swift-cycle`；
- 无法识别 frontmatter 边界；
- 载荷哈希和锁文件不一致；
- 必需的中文参考文档缺失；
- Harness 的 `skills` 服务不可用。

禁止使用以下降级方式：

- 失败后从网络下载；
- 自动修复随包文件；
- 静默注册部分内容；
- 修改用户 Skill 目录。

## 验证策略

### 静态与单元验证

- 校验 `package.json` 和 `dsh.bundle.patch`；
- 确认 patch 只插入适配器插件；
- 执行离线上游哈希验证；
- 使用假的 `ctx.skills.register()` 调用入口并捕获注册对象；
- 确认只注册一次，并核对名称、Provider、资源基址和调用策略；
- 确认正文包含 Swift Cycle v1.2.0 的五项能力；
- 确认 `references/zh-CN.md` 存在且能从资源基址访问；
- 验证格式错误或陈旧快照会失败关闭；
- 执行 `git diff --check` 和 Markdown 链接检查。

### 打包验证

- 执行 `npm pack --dry-run` 或当前环境可用的等价命令；
- 核对最终打包文件清单；
- 拒绝 source map、缓存、凭据、本机绝对路径、测试夹具和无关仓库文件；
- 解包到临时目录后重新执行离线完整性验证。

### Harness 兼容性验证

使用隔离的临时 profile，并固定 DeepSeek Harness 版本或 commit：

- 安装本地 checkout 或打包产物；
- 检查 `dsh --profile web --dump-config`；
- 确认 `/swift-cycle` 可用；
- 确认模型目录不暴露 Swift Cycle，模型不能隐式调用；
- 加载 Skill 和中文参考文档；
- 卸载后确认注册消失；
- 重新安装并确认行为可重复；
- 确认已有同名用户 Skill 即使被遮蔽也没有被删除或改写；
- 不执行真实项目修改、凭据访问或外部模型请求。

Harness 安装、依赖获取和运行测试会改变本地 profile 或环境，因此必须单独取得授权。

## 发布与公开发现

首版发布拆成以下独立阶段：

1. 创建并验证本地适配仓库。
2. 按可审查的提交边界完成实现。
3. 取得创建 `Solismuchengxue/dsh_plugin_swift_cycle` 远程仓库的授权。
4. 审计后执行普通非强制 push。
5. 取得创建适配器 `v0.1.0` tag 和 GitHub Release 的授权。
6. 取得添加 GitHub Topics（包括 `dsh-plugin`）的授权。
7. 确认仓库出现在 GitHub Topic 页面。
8. 安装到任何真实 Harness profile 前再次取得授权。

添加 GitHub Topic 只代表获得公开发现入口，不能证明包已安装、Runtime 已加载、Skill 可调用或版本兼容。

## 用户安装约定

正式文档只推荐固定到不可变适配器提交的安装方式：

```powershell
dsh plugin --profile web add "github:Solismuchengxue/dsh_plugin_swift_cycle#ADAPTER_COMMIT_SHA"
```

`ADAPTER_COMMIT_SHA` 是发布时必须替换成实际完整提交哈希的标记，不得原样出现在最终 Release 安装说明中。

启动前先检查合成后的 profile：

```powershell
dsh --profile web --dump-config
```

首版不把未固定的默认分支安装写成推荐路径。

## 文档权威关系

- Swift Cycle 权威仓库负责治理行为、跨宿主 Skill 内容和上游 Release。
- 适配器仓库负责 DeepSeek Harness 打包、显式调用约束、兼容性证据和安装说明。
- DeepSeek Harness 官方文档负责 bundle、profile、service 和插件生命周期语义。
- GitHub Topic 页面只是公开发现索引，不是兼容性或 Release 身份的权威来源。

## 验收条件

同时满足以下条件后，实施结果才可以进入本地发布审计：

- 静态、单元、完整性、打包和隔离 Harness 检查全部通过；
- 适配器没有独立修改治理规则；
- 上游身份精确且可复现；
- 安装不需要构建脚本、运行时网络或凭据；
- Harness 注册策略强制执行仅手动调用；
- 工作树 clean，提交边界可审查；
- README 的所有声明都有对应证据；
- 创建远程仓库、push、Release、添加 Topic 和真实安装均继续等待各自授权。
