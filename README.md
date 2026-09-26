# ChessWithDSH

> 在 DeepSeek Harness 里下一盘能讲明白的棋：**本地 Stockfish 负责算，模型只负责讲。**

**状态：** 早期开发（S0 骨架）。README 的产品叙述待补。

## 姊妹项目

本仓库与 [ChessWithCodex](https://github.com/CuberRobot/ChessWithCodex) 是**亲缘项目**，不是移植也不是 fork：

- **数据契约逐字对齐**（`games/`、`notes/`、`cache/evals.json`、棋谱库 `index.json`），
  所以棋谱、讲解、评估缓存能在两个项目之间来回搬；
- **工具层与渲染管线互相参考**；
- **宿主接入与产品取向各自决定**。

## 文档

| 文件 | 内容 |
| --- | --- |
| [AGENTS.md](AGENTS.md) | **操作契约**：铁律、命令、讲棋纪律、环境坑、边界 |
| docs/ | 架构与设计记录（待补） |

## 许可

本仓库代码为 **MIT**（见 [LICENSE](LICENSE)）。
Stockfish 是 **GPLv3**，本项目**不随仓库分发引擎**，只通过 UCI 协议调用用户自备的引擎。
