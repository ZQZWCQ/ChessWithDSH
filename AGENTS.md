# 在这个仓库里工作：操作契约

> 为了方便接手这个仓库的人或 agent 工作。
> 姊妹项目 `ChessWithCodex` 有一份同名文件。两边数据契约对齐，实现各自决定。

## 这是什么

在 DeepSeek Harness 里下一盘能讲明白的棋。本地引擎负责计算，模型负责讲解。
以 DSH bundle 插件的形式分发。

## 硬性要求

1. **不要自己起服务器。** 界面挂在宿主自己的 web 服务上（`ctx.webServer`、`ctx.connection.fetch`），
进程生命周期归宿主。
2. **数字必须来自引擎。** 评估、最佳着法、失误判定都问引擎。
没有对应的引擎记录时，只描述事实，不下棋力结论。
3. **评估缓存键是 `<fen>|d<深度>|<引擎名>`，统一按照白方视角分数存储。**
云评估的引擎名为 `lichess-cloud-eval`，depth 采用响应里的真实值。
4. **`games/` 是生成物，不要改动；`notes/` 是人写的，不要覆盖。**
重算时按 `(ply, san)` 把人写字段合并回去，并且校验 SAN：序号不存在或 SAN 对不上就跳过。
5. **提交前跑 `pnpm verify`。** `main` 受保护，改动走分支加 PR。

## 分支与 PR

分支名 `<type>/<短描述>`，type 跟提交信息一致：`feat/ fix/ docs/ refactor/ test/ chore/`。
一个分支只做一件事，标题写中文短句，正文说清改了什么、为什么、怎么验证。
提交信息用 Conventional Commits，例如 `feat(engine): 补 Windows 引擎查找`。
不要直接 push 到 `main`。合并前 `pnpm verify` 要全绿，CI 跑的是同一条命令。

## 常用命令

```bash
pnpm install
pnpm verify             # 提交门槛：format:check + lint + typecheck + test
pnpm test               # vitest
pnpm test -- 名字        # 只跑匹配的用例
pnpm typecheck
pnpm lint / pnpm format
```

## 如何讲解对局

先分析整盘的评估曲线，再从中挑几个转折点重点讲，剩下的每一手没有必要都像chess.com一样详细讲解。
指出问题时带上引擎数字和替代着法，比如「2.exf5 是 +1.90，实战 2.d3 只剩 +0.36」。
正文没有必要重复强调界面上的曲线、箭头、评估数字等。
指出清晰的赢棋/输棋原因：对手设置的几档/多少ELO，对手的失误是设计使然还是真被打崩了，行棋方的失误是由于没有看到什么等等。

## 数据存储

代码存储在插件目录里，数据存储在数据根。
顺序是 `CHESSPLUGIN_HOME`，没有就用 `${DSH_HOME}/dsh-chess`（`DSH_HOME` 也没设时取 `~/.dsh`）。
把 `CHESSPLUGIN_HOME` 指到 Codex 侧的数据目录，可以实现双侧共享。

`pgn/` 存放原始棋谱。`games/` 是真实数据。`notes/` 是人写的，永不覆盖。
`cache/evals.json` 是可丢弃的加速层。`sessions/` 存放进行中的对局。

## 文字风格

文档和提交信息都用中文。句子写短，能具体就具体，写清文件、命令和数字。
AI味太重的文字会让人丧失阅读的欲望，如果这样，还不如直接写成agent的接口式文档。

## 边界

不随仓库分发引擎。Stockfish 是 GPLv3，只通过 UCI 协议调用。
不接收他人评注，只在棋谱库存着法和元数据，讲解则写进 `notes/`。
引擎缺失时对弈盘必须仍能下，退回内置的弱搜索；分析类功能需要提供可读的安装指引。
棋谱库是独立仓库，本地侧仅负责读取仓库的 `index.json`。

## 文档地图

* `docs/pitfalls.md` 曾遇到过的问题，注意规避
* `docs/architecture.md` 目录职责和设计（待补）

