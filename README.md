# ChessWithDSH

在 DeepSeek Harness 里下一盘能讲明白的棋。本地 Stockfish 负责算，模型负责讲。

状态：早期开发，目前只有 S0 的骨架。

## 和 ChessWithCodex 的关系

数据契约逐字对齐（`games/`、`notes/`、`cache/evals.json`，以及棋谱库的 `index.json`），
所以棋谱、讲解、评估缓存可以在两边来回搬。工具层和渲染管线互相参考，
宿主接入和产品取向各自决定。

## 文档

| 文件 | 内容 |
| --- | --- |
| [AGENTS.md](AGENTS.md) | 操作契约：硬性要求、命令、讲解方式、边界 |
| [docs/problems_met.md](docs/problems_met.md) | 遇到过的问题 |
| docs/architecture.md | 目录职责和设计（待补） |

## 许可

本仓库代码是 MIT，见 [LICENSE](LICENSE)。
Stockfish 是 GPLv3。本项目不随仓库分发引擎，只通过 UCI 协议调用用户自备的引擎。
