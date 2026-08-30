# 系统架构

## 状态

- 状态：
- 当前结论：
- 适用范围：
- 更新触发：

## 系统上下文

系统与外部参与者的主要关系是：

```mermaid
flowchart LR
    Consumer[消费者] --> System[系统]
    System --> Dependency[依赖]
```

该图只描述责任关系；运行实例与活动消费者需要独立证据。

## 模块职责

| 模块 | 输入 | 输出 | 不负责 |
| --- | --- | --- | --- |
|  |  |  |  |

## 关键流程

请求按以下顺序跨越模块边界：

```mermaid
sequenceDiagram
    participant C as 调用方
    participant S as 系统
    C->>S: 请求
    S-->>C: 结果或明确错误
```

## 生命周期

只在项目实际跟踪独立生命周期时绘制状态：

```mermaid
stateDiagram-v2
    [*] --> Planned
    Planned --> Verified: 验证通过
    Verified --> [*]
```

## 边界与证据

| 声明 | 所需直接证据 | 当前状态 |
| --- | --- | --- |
|  |  | UNKNOWN |

## 未决事项

- （填写）

## 更新触发

- 模块、数据流、合同、生命周期或部署拓扑变化时更新。

## 修订记录

| 日期 | 变更 |
| --- | --- |
| YYYY-MM-DD | 初始版本 |
