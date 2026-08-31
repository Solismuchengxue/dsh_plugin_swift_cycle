# 中文术语与表达

仅在需要统一简体中文术语或项目文档措辞时读取。本文件不复制 canonical 工作流。

## 核心术语

| 英文 | 推荐中文 |
| --- | --- |
| Swift Cycle | 快速螺旋；Skill 名和调用名保持 `swift-cycle` |
| adoption | 采用或接管 |
| Blueprint | 项目 Blueprint；职责名称为“项目意图基线” |
| governance baseline | 治理基线 |
| document profile | 文档档位 |
| profile conformance | 职责一致性 |
| knowledge promotion | 知识晋升 |
| state separation | 状态拆分 |
| commit boundary | 提交边界 |
| source/runtime boundary | 源码/运行态边界 |
| controlled trial | 受控试用 |
| Review Packet | 审查包 |
| Closeout Packet | 收尾包 |
| current milestone | 当前里程碑 |

## 事实词

- `FACT`：由权威来源或项目证据确认的事实。
- `OBSERVATION`：本次直接观察。
- `CANDIDATE`：尚未采用的方案或主张。
- `LIMITATION`：已知限制或适用边界。
- `ASSUMPTION`：合理但尚未验证的推断。
- `UNKNOWN`：尚未检查或证据不足。
- `NOT_VERIFIED`：明确未完成对应验证。

## 表达约定

- 结论先于过程；一段只表达一个主要判断。
- 一个 Markdown 文件只保留一个一级标题，二级标题承担稳定章节。
- Mermaid 图前写结论，一张图只表达一个主要关系，图后说明不证明什么。
- 用户文档不写内部执行状态；内部文档按需记录状态、当前结论、范围、未决事项和更新触发。
- Blueprint 回答“为什么做、为谁做、什么结果算成功”，默认权威路径为 `docs/blueprint.md`；旧项目可映射已有等价权威，README 和 DESIGN 只保留短摘要与链接。docs 命名细则以文档信息架构参考为唯一权威。
- 文件名、命令、API、代码标识和标准状态值保持原样，避免同一段无意中中英混杂。
- 未验证时使用“候选”“待确认”“UNKNOWN”或“NOT_VERIFIED”，不要写成“已采用”“已完成”或“已通过”。
