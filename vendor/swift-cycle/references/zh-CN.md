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
- 普通说明、标题、图中普通概念和面向读者的关系标签使用调用者要求的语言；写入既有文件时服从文件主语言，新文件服从项目主语言。文件名、命令、API、代码标识、标准状态值、品牌名和其他精确技术标识保持原文，不为了表面一致而翻译。
- 先确认读者需要理解的问题和项目事实间的真实关系；只有可视化比短段落或表格更清楚时才使用 Mermaid，并按语义自主选择合适图型。
- Mermaid 图前写当前结论，一张图只表达一个主要关系，图后说明适用边界和不证明什么。审查时核对关系方向、节点职责、顺序或状态含义是否符合事实，标签是否清楚并符合项目主语言，以及权限、授权、所有权和停止边界是否被准确表达。
- 不预设共同父节点、并列分支、条件汇合或停止出口等拓扑；它们只能由当前项目事实产生。示例只说明语法或表达选择，不能成为项目结构的证据。
- 用户文档不写内部执行状态；内部文档按需记录状态、当前结论、范围、未决事项和更新触发。
- Blueprint 回答“为什么做、为谁做、什么结果算成功”，默认权威路径为 `docs/blueprint.md`；旧项目可映射已有等价权威，README 和 DESIGN 只保留短摘要与链接。docs 命名细则以文档信息架构参考为唯一权威。
- 未验证时使用“候选”“待确认”“UNKNOWN”或“NOT_VERIFIED”，不要写成“已采用”“已完成”或“已通过”。
