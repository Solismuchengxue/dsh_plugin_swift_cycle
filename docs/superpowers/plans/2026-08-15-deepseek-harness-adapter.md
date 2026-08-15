# Swift Cycle DeepSeek Harness 适配器实施计划

> **供执行 Agent 使用：**执行本计划时，必须使用 `superpowers:subagent-driven-development`（推荐）或 `superpowers:executing-plans`，逐项实施并在每个提交边界验证。

**目标：**把锁定在 `v1.2.0` 的 Swift Cycle 载荷包装为一个可由 DeepSeek Harness 安装、仅允许用户显式调用、离线可校验的组合包。

**架构：**适配器仓库携带上游只读快照，通过插件入口调用 `ctx.skills.register()` 注册 `swift-cycle`。上游内容由 `upstream.lock.json` 和 SHA-256 完整性检查约束；Harness 专用策略保留在快照之外。首版只支持固定 GitHub 提交安装，不发布 npm。

**技术栈：**Node.js 20+、ES Modules、Node 内置测试运行器、DeepSeek Harness bundle patch、YAML、JSON、Markdown。

## 全局约束

- 只允许修改 `F:\70_Infrastructure_and_Operations\prompt_engineering\dsh_plugin_swift_cycle`。
- 上游仓库 `F:\70_Infrastructure_and_Operations\prompt_engineering\skill_swift_cycle` 只读；上游身份固定为 tag `v1.2.0`、commit `af3c5ddafba516c304613ea69081118fc234add7`。
- 适配器包名为 `dsh-plugin-swift-cycle`，首版版本为 `0.1.0`，注册 Skill 名为 `swift-cycle`。
- 不创建固定状态 Schema、`PROJECT_STATE.md`、运行时下载、凭据集成、模型配置或安装时构建脚本。
- 必须强制 `modelInvocable: false`、`userInvocable: true`；不得依赖上游 `agents/openai.yaml` 解释 DSH 调用策略。
- 官方兼容基线固定为 `deepseek-ai/deepseek-harness` commit `47f943859bef60e4160492346772ded9b24f765a` 和 `@deepseek-ai/dsh-skill` `0.1.0-rc.5`。未来版本必须重新验证，不能沿用结论。
- 本计划不授权安装 DSH、修改真实 profile、创建 remote、push、tag、Release、GitHub Topic 或 npm 发布。
- 每个实现任务先写失败测试，再做最小实现；提交前至少运行相关测试和 `git diff --check`。
- 适配器仓库自身必须显式使用当前安装的 `$swift-cycle` 进行治理；这与包内分发的锁定 Swift Cycle 快照是两个独立角色，不能互相替代。

## 官方实现依据

实施时以锁定 commit 中的第一方资料为准，不以 Topic 页面或第三方示例替代：

- bundle 发布说明：`docs/user/develop/basic/publish.zh.md`
- 插件开发入口：`docs/user/develop/basic/index.zh.md`
- 配置与 patch 规则：`docs/user/develop/basic/config.zh.md`
- Skill 子系统：`docs/subsystems/skills.zh.md`
- Skill 服务接口：`packages/skill/skill/src/index.ts`
- 文件系统 Skill 实现：`packages/skill/skill-filesystem/`
- 内置工具 Skill 示例：`packages/skill/tool-skill/README.zh.md`
- bundle patch 示例：`packages/bundle/base/cordis.patch.yml`

以上文件均来自 `https://github.com/deepseek-ai/deepseek-harness/tree/47f943859bef60e4160492346772ded9b24f765a`。如果锁定文件与执行环境实际 API 不一致，必须把兼容性标为 FAIL 或 NOT_VERIFIED，不能自行猜测接口。

## 文件职责

| 文件 | 唯一职责 |
| --- | --- |
| `AGENTS.md` | 适配器仓库边界和维护约束 |
| `DESIGN.md` | 适配器设计总入口、权威关系和详细文档索引 |
| `.gitattributes` | 固定文本换行，保证跨平台哈希稳定 |
| `.gitignore` | 排除本地维护记录、依赖、打包产物和缓存 |
| `TODO.md` | ignored 的当前执行切片、阻塞和下一步 |
| `DEVLOG.md` | ignored 的失败、内部判断和维护过程 |
| `package.json` | npm 包身份、DSH bundle 声明和本地验证命令 |
| `cordis.patch.yml` | 只把适配器插件插入 Harness 配置 |
| `index.js` | 验证快照、解析 Skill、注册 Runtime Skill |
| `upstream.lock.json` | 锁定上游身份、文件哈希和整体哈希 |
| `vendor/swift-cycle/**` | 未经修改的 Swift Cycle v1.2.0 分发快照 |
| `scripts/verify-upstream.mjs` | 离线快照验证及维护者显式源目录比对 |
| `tests/*.test.mjs` | 包合同、完整性、注册行为和打包边界测试 |
| `README.md` | 纯用户视角的中文介绍、安装、验证和限制 |
| `docs/evidence/*.md` | 获得授权后记录隔离 Harness 兼容性证据 |

## 任务 0：用 Swift Cycle 建立项目自身治理基线

**文件：**

- 新建：`AGENTS.md`
- 新建：`DESIGN.md`
- 新建：`README.md`
- 新建：`.gitattributes`
- 新建：`.gitignore`
- 本地新建且保持 ignored：`TODO.md`
- 本地新建且保持 ignored：`DEVLOG.md`

### 步骤 1：显式加载 Swift Cycle 并采集新鲜基线

执行 Agent 必须在开始本任务时显式使用当前安装的 `$swift-cycle`，并运行：

```powershell
git rev-parse HEAD
git branch --show-current
git status --short
git remote -v
rg --files
```

把观察到的当前状态与目标状态分开。预期初始事实是：仓库只有已批准设计和实施计划，没有插件实现、remote、发布或 Runtime 证据；若实际状态不同，先报告差异并更新基线，不能覆盖既有工作。

### 步骤 2：建立最小文档所有权

`DESIGN.md` 只做简洁总入口，记录目标、采用架构、权威来源和以下链接：

- 已批准设计：`docs/superpowers/specs/2026-08-15-deepseek-harness-adapter-design.md`
- 共享实施计划：`docs/superpowers/plans/2026-08-15-deepseek-harness-adapter.md`
- 兼容性证据目录：`docs/evidence/`（尚未产生时明确标记为等待授权，不创建空目录）

`README.md` 使用纯用户视角，只说明项目用途、上游身份和当前尚未发布/尚不可安装的真实限制；安装命令等到任务 4 有证据时再加入。

`AGENTS.md` 记录：

- 本仓库与权威 Swift Cycle 仓库彼此独立；
- 非简单治理、文档收敛、提交规划和源码/运行态判断必须显式调用 `$swift-cycle`；
- vendor 只能从锁定上游刷新，禁止手改；
- 用户授权不能跨 source、artifact、隔离 runtime、真实用户 runtime、remote 和发布层传递；
- TODO/DEVLOG 只作本地捕获面，长期事实必须晋升到 README、DESIGN、共享计划或 evidence。

### 步骤 3：建立本地维护视图，不把它变成共享事实源

`.gitignore` 明确忽略 `TODO.md`、`DEVLOG.md`、`METHODOLOGY.md`、`node_modules/`、`*.tgz`、覆盖率和临时缓存。

- `TODO.md` 只链接本计划并记录当前执行切片；不复制完整计划。
- `DEVLOG.md` 只记录执行期失败、拒绝方案和内部判断；可复用事实按职责晋升后只保留链接。
- 不创建 `PROJECT_STATE.md`，不自动镜像本地记录。

### 步骤 4：拆分项目实际存在的生命周期和交付层

不定义固定字段或 Schema，但文档必须把以下结论独立表达：

- 仓库治理是否建立；
- 适配器源码是否实现并通过本地测试；
- 打包制品是否通过内容和完整性验证；
- 隔离 Harness 兼容性是否验证；
- remote、tag、Release、Topic 是否发布；
- 真实用户 profile 是否安装并生效。

对应的源码/运行态边界是：Git 源码 → `npm pack` 候选制品 → 隔离 Harness runtime → 真实用户 profile/consumer。前一层通过或获得授权不能关闭、执行或证明后一层。

### 步骤 5：验证治理文件并提交任务 0

```powershell
git check-ignore -v TODO.md DEVLOG.md METHODOLOGY.md
$trackedLocalRecords = git ls-files -- TODO.md DEVLOG.md METHODOLOGY.md
if ($trackedLocalRecords) { throw "local maintenance records must remain untracked: $trackedLocalRecords" }
git diff --check
git status --short
git add -- AGENTS.md DESIGN.md README.md .gitattributes .gitignore
git diff --cached --name-only
git diff --cached --check
git commit -m "chore: establish Swift Cycle project governance"
```

预期：`git check-ignore` 成功；`git ls-files --error-unmatch` 对三个本地文件返回未跟踪；提交只包含五个共享治理文件，TODO/DEVLOG 保持本地 ignored。

## 任务 1：建立最小组合包合同

**文件：**

- 新建：`package.json`
- 新建：`cordis.patch.yml`
- 新建：`LICENSE`
- 新建：`tests/package-contract.test.mjs`

### 步骤 1：先写失败的包合同测试

测试必须断言：

- `package.json` 的名称、版本、ESM 入口和 Node 版本正确；
- `files` 只声明发布所需入口、patch、快照、锁文件、README 和许可证；
- `dsh.bundle.patch` 精确指向 `./cordis.patch.yml`；
- 不存在 `dependencies`、`prepare`、`preinstall`、`install`、`postinstall`；
- patch 只包含一个 `id: swift-cycle` / `name: dsh-plugin-swift-cycle` 插入项。

运行：

```powershell
node --test tests/package-contract.test.mjs
```

预期：因包文件尚不存在而失败。

### 步骤 2：创建最小包清单

`package.json` 使用以下合同：

```json
{
  "name": "dsh-plugin-swift-cycle",
  "version": "0.1.0",
  "private": false,
  "type": "module",
  "main": "index.js",
  "files": [
    "index.js",
    "cordis.patch.yml",
    "vendor",
    "upstream.lock.json",
    "README.md",
    "LICENSE"
  ],
  "scripts": {
    "test": "node --test tests/*.test.mjs",
    "verify:upstream": "node scripts/verify-upstream.mjs",
    "pack:dry-run": "npm pack --json --dry-run"
  },
  "engines": {
    "node": ">=20"
  },
  "dsh": {
    "bundle": {
      "patch": "./cordis.patch.yml"
    }
  }
}
```

`cordis.patch.yml` 只写：

```yaml
- insert:
    - id: swift-cycle
      name: dsh-plugin-swift-cycle
```

任务 0 已用 `.gitattributes` 固定文本换行，并由 `AGENTS.md` 约束 vendor 来源；本任务不得重复这些规则。

### 步骤 3：验证并提交任务 1

```powershell
node --test tests/package-contract.test.mjs
git diff --check
git status --short
git add -- package.json cordis.patch.yml LICENSE tests/package-contract.test.mjs
git diff --cached --check
git commit -m "chore: scaffold DeepSeek Harness bundle"
```

预期：合同测试通过；暂存和提交只包含最小组合包合同，不混入治理文件或本地维护记录。

## 任务 2：锁定 Swift Cycle v1.2.0 上游载荷

**文件：**

- 新建：`vendor/swift-cycle/SKILL.md`
- 新建：`vendor/swift-cycle/agents/openai.yaml`
- 新建：`vendor/swift-cycle/references/zh-CN.md`
- 新建：`upstream.lock.json`
- 新建：`scripts/verify-upstream.mjs`
- 新建：`tests/upstream-integrity.test.mjs`
- 新建：`index.js`

### 步骤 1：只读确认上游身份和源文件

在上游仓库执行：

```powershell
git status --short
git rev-parse HEAD
git rev-list -n 1 v1.2.0
git diff --exit-code v1.2.0 -- skills/swift-cycle/SKILL.md skills/swift-cycle/agents/openai.yaml skills/swift-cycle/references/zh-CN.md
```

预期：工作树 clean，HEAD 和 tag 都解析为 `af3c5ddafba516c304613ea69081118fc234add7`，三个源文件与 tag 无差异。任何一项不符都停止，不能复制。

### 步骤 2：先写失败的完整性测试

测试覆盖：

- 锁文件身份和三文件清单精确；
- 每个文件 SHA-256 正确；
- 整体哈希按确定性算法计算；
- 生成的注册元数据按固定字段顺序序列化后，SHA-256 与锁文件一致；
- 缺失文件、额外文件、路径越界、哈希不匹配均失败关闭；
- `SKILL.md`、中文参考和 `openai.yaml` 都必须存在。

整体哈希算法固定为：按小写相对路径升序排列，每项拼接 `path + NUL + lowercaseSha256 + LF`，对 UTF-8 字节计算 SHA-256。

运行：

```powershell
node --test tests/upstream-integrity.test.mjs
```

预期：因 vendor、锁文件和验证函数尚不存在而失败。

### 步骤 3：复制锁定快照并写入锁文件

只复制上述三个文件。锁文件必须记录：

- upstream repository：`https://github.com/Solismuchengxue/skill_swift_cycle`
- tag：`v1.2.0`
- commit：`af3c5ddafba516c304613ea69081118fc234add7`
- adapter version：`0.1.0`
- 每个文件路径和 SHA-256：
  - `SKILL.md`：`27ce135df6ed459a869b10711cfab431d2772fe806a775b1bc5882692a005b82`
  - `agents/openai.yaml`：`2c28493e10c85a7710a5e774844bb0515f606c4506e5e8d5d12fa1be21107898`
  - `references/zh-CN.md`：`ddec383edfa8e419c0b098f6cf6ffc6f5a44c8a4a57084a0e22f222320fb1e0b`
- 整体哈希：`e01de6fa081c12c7e481a219d3932e48a2e386f05202e7b8a6e51a0029fad686`
- 注册元数据哈希：`a1b2bd838ee4dd2a961fd93638292dce7bda53deb35166c80c5c54333da16b5d`

注册元数据使用 `JSON.stringify()` 对以下固定顺序字段编码后计算 UTF-8 SHA-256：`name`、`description`、`source`、`provider`、`invocation`、`upstream`、`adapterVersion`、`payloadSha256`。对象内部顺序同样固定；测试必须锁住序列化字符串，禁止依赖对象键的偶然构造顺序。

### 步骤 4：实现可复用的离线验证

`index.js` 先导出：

```js
export async function sha256File(filePath) {}
export function aggregateHash(entries) {}
export async function verifyPackagedSnapshot(options = {}) {}
```

`verifyPackagedSnapshot()` 默认验证随包 vendor；必须使用规范化相对路径并拒绝 `..`、绝对路径、重复条目和未列入锁文件的额外普通文件。

`scripts/verify-upstream.mjs` 支持：

```powershell
node scripts/verify-upstream.mjs
node scripts/verify-upstream.mjs --source "F:\70_Infrastructure_and_Operations\prompt_engineering\skill_swift_cycle\skills\swift-cycle"
```

第一种仅离线验证随包快照；第二种额外核对显式提供的上游目录。脚本不得访问网络，也不得写入 vendor。

### 步骤 5：验证并提交任务 2

```powershell
node --test tests/upstream-integrity.test.mjs
npm run verify:upstream
node scripts/verify-upstream.mjs --source "F:\70_Infrastructure_and_Operations\prompt_engineering\skill_swift_cycle\skills\swift-cycle"
git diff --check
git add -- index.js upstream.lock.json vendor scripts/verify-upstream.mjs tests/upstream-integrity.test.mjs
git diff --cached --check
git commit -m "feat: lock Swift Cycle v1.2.0 payload"
```

预期：三种完整性验证通过，提交只包含载荷、锁文件及其验证逻辑。

## 任务 3：注册仅允许用户显式调用的 Runtime Skill

**文件：**

- 修改：`index.js`
- 新建：`tests/plugin.test.mjs`

### 步骤 1：先写失败的注册行为测试

用假的 `ctx.skills.register()` 捕获注册对象，覆盖：

- 插件只注册一次；
- `name` 为 `swift-cycle`，`provider` 为 `dsh-plugin-swift-cycle`，`source` 为 `bundled`；
- `invocation` 精确为 `{ modelInvocable: false, userInvocable: true }`；
- `resourceBase.kind` 为 `directory`，路径是随包 `vendor/swift-cycle` 的绝对路径；
- `content` 已去除 YAML frontmatter，但保留正文；
- 描述和 Skill 身份从经验证的 frontmatter 取得；
- 五项能力对应规则均能从载荷中找到：治理基线、本地知识晋升、复合状态拆分、提交边界、源码与运行态声明边界；测试使用上游实际标题或稳定语句，不要求权威 Skill 增加适配器专用标签；
- 锁文件错误、frontmatter 不完整、名称不符、中文参考缺失时不调用 `register()`。

运行：

```powershell
node --test tests/plugin.test.mjs
```

预期：因入口尚未实现注册而失败。

### 步骤 2：实现最小 frontmatter 解析与载荷读取

在 `index.js` 增加并导出：

```js
export function extractBody(skillText) {}
export async function loadPackagedSkill(options = {}) {}
```

解析器只处理当前锁定载荷所需的顶层 `name` 和 `description`，不得引入新的 YAML 运行时依赖。它必须严格识别开头和结尾分隔线，拒绝缺失、重复关键字段或 `name !== 'swift-cycle'`。

### 步骤 3：实现 Harness 插件入口

入口合同：

```js
export const inject = ['skills']

export async function apply(ctx) {
  const skill = await loadPackagedSkill()
  ctx.skills.register({
    name: skill.name,
    description: skill.description,
    source: 'bundled',
    provider: 'dsh-plugin-swift-cycle',
    invocation: {
      modelInvocable: false,
      userInvocable: true,
    },
    resourceBase: {
      kind: 'directory',
      path: skill.resourceBase,
    },
    content: skill.content,
    metadata: skill.metadata,
  })
}
```

`metadata` 只放上游仓库、tag、commit、适配器版本和整体哈希，不放本机路径。必须先完成全部完整性和身份验证，之后才能调用 `register()`。

### 步骤 4：验证并提交任务 3

```powershell
node --test tests/plugin.test.mjs
npm test
npm run verify:upstream
git diff --check
git add -- index.js tests/plugin.test.mjs
git diff --cached --check
git commit -m "feat: register Swift Cycle as a user-only DSH skill"
```

预期：正常载荷注册一次；所有损坏载荷都失败关闭；模型不可隐式调用。

## 任务 4：建立中文安装文档与发布文件合同

**文件：**

- 修改：`README.md`
- 新建：`tests/package-contents.test.mjs`
- 修改：`package.json`（仅在 dry-run 证据要求修正发布清单时）

### 步骤 1：先写失败的打包内容测试

测试调用 `npm pack --json --dry-run` 并断言最终包只含：

- `LICENSE`
- `README.md`
- `cordis.patch.yml`
- `index.js`
- `package.json`
- `upstream.lock.json`
- `vendor/swift-cycle/SKILL.md`
- `vendor/swift-cycle/agents/openai.yaml`
- `vendor/swift-cycle/references/zh-CN.md`

明确拒绝 `tests/`、`scripts/`、`docs/`、`.git/`、`node_modules/`、绝对路径、缓存、日志和 `.tgz`。

运行：

```powershell
node --test tests/package-contents.test.mjs
```

预期：任务 0 的最小 README 尚未满足正式安装内容合同，或发布文件清单不匹配，测试失败。

### 步骤 2：编写中文 README

README 只说明适配器事实，不复制完整 Skill 正文，至少包含：

- 适配器与上游 Swift Cycle 的职责边界；
- 锁定的上游 tag、commit 和适配器版本；
- 五项能力名称；
- 仅用户显式调用策略及 `/swift-cycle` 手势；
- 首版固定提交安装命令；
- 安装前 `--dump-config` 检查；
- 离线验证命令；
- 同名 Skill 的覆盖关系；
- 没有 npm 发布、运行时网络、凭据和安装脚本；
- “源码打包通过”与“真实 Harness 兼容性通过”是不同证据层。

安装示例写为：

```powershell
dsh plugin --profile web add "github:Solismuchengxue/dsh_plugin_swift_cycle#FULL_40_CHARACTER_COMMIT_SHA"
```

并明确 `FULL_40_CHARACTER_COMMIT_SHA` 是发布后由用户替换的参数。正式 Release Notes 必须使用实际完整提交哈希，不能保留占位符。

### 步骤 3：验证打包合同和 Markdown 链接

```powershell
node --test tests/package-contents.test.mjs
npm run pack:dry-run
rg -n "\]\(([^)#]+)(#[^)]+)?\)" README.md docs
git diff --check
```

对每个相对链接做存在性检查；外部链接只在允许联网的发布审计阶段检查可访问性，本阶段不得把文本匹配当作链接有效证据。

### 步骤 4：提交任务 4

```powershell
git add -- README.md tests/package-contents.test.mjs package.json
git diff --cached --name-only
git diff --cached --check
git commit -m "docs: add DSH installation and package contract"
```

预期：提交仅包含 README、打包合同测试，以及确有必要的最小 package 清单修正。

## 任务 5：完成不依赖 Harness 安装的本地预检

**文件：**按失败证据最小修改任务 1–4 的文件；不得顺手重构。

### 步骤 1：运行完整本地验证

```powershell
npm test
npm run verify:upstream
node scripts/verify-upstream.mjs --source "F:\70_Infrastructure_and_Operations\prompt_engineering\skill_swift_cycle\skills\swift-cycle"
npm run pack:dry-run
git diff --check
git status --short
```

预期：全部命令通过，工作树没有意外文件。

### 步骤 2：审计禁止项

```powershell
rg -n '"(preinstall|install|postinstall|prepare)"|dependencies|child_process|exec\(|spawn\(|fetch\(|https?://|credential|token|secret|C:\\Users|F:\\' package.json index.js scripts tests vendor README.md
```

逐条分类结果：

- 文档中的公开仓库 URL 可以保留；
- 测试或维护命令中的显式本地源路径不得进入发布包；
- runtime 代码中出现网络、子进程、凭据、本机绝对路径或安装生命周期脚本即为 FAIL。

### 步骤 3：确认上游仓库未被修改

```powershell
git -C "F:\70_Infrastructure_and_Operations\prompt_engineering\skill_swift_cycle" status --short
git -C "F:\70_Infrastructure_and_Operations\prompt_engineering\skill_swift_cycle" rev-parse HEAD
```

预期：clean，HEAD 仍为 `af3c5ddafba516c304613ea69081118fc234add7`。

### 步骤 4：只修复真实预检缺陷

如果步骤 1–3 失败：先为故障补充或收紧测试，再做最小修复并重跑全部检查。只有确实产生修复时，才根据 `git diff --name-only` 列出的精确文件逐一暂存并提交：

```powershell
git diff --cached --check
git commit -m "fix: close adapter preflight gaps"
```

如果全部通过，不创建空提交。

## 任务 6：在独立授权下验证真实 Harness 兼容性

**授权门：**此任务会获取或运行 DSH、可能安装依赖并写入隔离 profile。执行前必须向用户单独取得明确授权；未授权时停在任务 5。

**文件：**

- 新建：`docs/evidence/2026-08-15-dsh-compatibility.md`
- 修改：仅限由兼容性失败证明必须调整的实现或测试文件

### 步骤 1：建立隔离边界

- 使用临时目录作为 DSH home/profile；不得使用或修改 `C:\Users\smile\.dsh`。
- 固定官方 Harness commit `47f943859bef60e4160492346772ded9b24f765a` 和 `@deepseek-ai/dsh-skill` `0.1.0-rc.5`。
- 记录 Node、npm、DSH 和适配器 commit；不记录凭据、用户业务数据或真实项目路径。
- 开始前验证临时目录解析结果；清理时只删除这个精确临时目录，并再次验证路径不含 reparse point 或越界。

### 步骤 2：验证安装与配置合成

在隔离 profile 中安装本地 checkout 或本地 pack 产物，然后运行对应的：

```powershell
dsh --profile web --dump-config
```

验证 patch 只增加 `dsh-plugin-swift-cycle`，不增加模型、凭据、网络或其他插件配置。

### 步骤 3：验证 Runtime 注册和调用策略

通过 Harness 可观察接口或官方调试能力确认：

- `swift-cycle` 注册且资源可读取；
- `/swift-cycle` 的用户显式调用路径可发现；
- Skill 不出现在模型可隐式选择的目录；
- 中文参考可从 `resourceBase` 读取；
- 同名用户级 Skill 即使被遮蔽也未被删除或改写；
- 不发起真实模型请求，不对真实项目执行任何操作。

若官方接口无法在不调用模型的情况下证明某一项，证据文档必须标记 `NOT_VERIFIED`，不得推断为 PASS。

### 步骤 4：验证卸载与重装可重复性

仅在隔离 profile：卸载适配器、确认注册消失，再安装相同产物并确认相同配置和完整性结果。不得触碰真实用户 Skill 安装。

### 步骤 5：记录证据并清理隔离环境

证据文档记录：

- 固定版本和 commit；
- 执行命令的脱敏形式；
- 每项 PASS / FAIL / NOT_VERIFIED；
- 与 README 声明的对应关系；
- 隔离目录清理结果。

如果兼容性修复改变运行行为，必须先补失败测试，修复后重做任务 5 和本任务。完成后提交：

```powershell
git add -- docs/evidence/2026-08-15-dsh-compatibility.md
git diff --cached --check
git commit -m "test: record isolated DSH compatibility evidence"
```

## 任务 7：本地发布边界审计并停止

**文件：**不新增发布资产；只读审计。

### 步骤 1：验证代码、载荷与打包

```powershell
npm test
npm run verify:upstream
npm run pack:dry-run
git diff --check
git status
```

如果任务 6 获得授权并完成，还要确认最新 evidence 没有未解释的 FAIL，README 没有把 `NOT_VERIFIED` 写成已验证。

### 步骤 2：审计提交和仓库边界

```powershell
git log --oneline --decorate -10
git status --short
git remote -v
git tag --list
```

预期：

- 工作树 clean；
- 提交按“脚手架 / 上游锁定 / Runtime 注册 / 文档合同 / 必要修复 / 兼容性证据”可独立审查；
- remote 仍为空；
- 没有发布 tag；
- 没有 npm 发布或 Registry 状态；
- 上游 Swift Cycle 仓库和用户级 Skill 安装均未修改。

### 步骤 3：输出发布建议并停止

报告应分别给出：

1. 本地实现审计状态；
2. 上游载荷一致性状态；
3. Harness 兼容性状态（未执行时必须写“等待授权”，不能写 PASS）；
4. 待授权的独立动作：创建 GitHub remote、push、tag、Release、添加 `dsh-plugin` Topic、真实 profile 安装；
5. 推荐固定安装提交的完整 40 位 SHA（只有 push 前最终提交确定后才能生成）。

到此停止。不得把本地实现完成自动扩大为任何远程或发布授权。

## 计划完成判定

只有以下条件同时成立，才可把“本地适配器实现”标记为完成：

- 任务 0–5 全部完成且有新鲜验证输出；
- 项目自身已按 Swift Cycle 建立 README、DESIGN、AGENTS、共享计划和 ignored 本地维护记录边界；
- vendor 与锁定上游逐文件及整体哈希一致；
- 注册对象明确禁止模型隐式调用；
- dry-run 包内容严格匹配合同；
- 没有运行时网络、凭据、安装脚本或第二套治理规则；
- 上游仓库未修改；
- 适配器工作树 clean，提交边界清楚。

任务 6 的真实 Harness 兼容性是独立证据门。若未获授权，不阻止报告“本地实现完成”，但必须把“真实 Harness 兼容”保持为 `NOT_VERIFIED / WAITING_AUTHORIZATION`。
