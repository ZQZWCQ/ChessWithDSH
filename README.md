# ChessWithDSH

在 DeepSeek Harness 里下一盘能讲明白的棋。本地引擎负责计算，模型负责讲解。

## 状态

早期开发，目前只有骨架（S0）：插件能加载，数据契约和落盘位置定好了，测试和 CI 跑起来了。
工具、界面、引擎接入都还没做。

## 为什么做这个项目

学习国际象棋时，chess.com 和 lichess 等传统平台调用的引擎成熟，给出的建议精当；而现在流行的的LLM则更精通于局面的详细讲解。但在使用中，我们往往会遇到引擎算得准但不会讲、模型会讲但算不准的情况。本项目旨在取双方之所长来便利国际象棋的学习。

本项目是 ChessWithCodex 的姊妹项目。Codex方案的版本成熟，但受宿主限制，对弈过程中模型是断线的，只能下完整盘再拿去复盘。

注意到 DSH 的宿主自带回合队列，界面上的关键局面可以直接唤醒模型，因此DSH上的实现会更有助于学习理解。

## 和 ChessWithCodex 的关系

数据契约逐字对齐（`games/`、`notes/`、`cache/evals.json`，以及棋谱库的 `index.json`）。
棋谱、讲解、评估缓存可以在两边来回搬。工具层和渲染管线互相参考，宿主接入和产品取向各自决定。

## 安装

还没到能用的程度。本地开发的装法：

```bash
pnpm install
pnpm build
dsh plugin --profile web add link:<本仓库路径>
```

卸载用 `dsh plugin --profile web remove chess-with-dsh`。

## 数据存放

默认写到 `${DSH_HOME}/dsh-chess`。设了 `CHESSPLUGIN_HOME` 就用它，
指到 Codex 侧的数据目录就能两边共享棋谱和讲解。

## 引擎

不分发引擎。分析和复盘要一个本地 Stockfish，需要用户自己安装。
【占位符：装法和配置项等做引擎接入时再补。】

## 文档

|文件|内容|
|-|-|
|[AGENTS.md](AGENTS.md)|操作契约：硬性要求、命令、讲解方式、边界|
|[docs/problems_met.md](docs/problems_met.md)|遇到过的问题|
|docs/architecture.md|目录职责和设计（待补）|

## 许可

代码是 MIT，见 [LICENSE](LICENSE)。
Stockfish 是 GPLv3。本项目不随仓库分发引擎，只通过 UCI 协议调用你自备的引擎。

