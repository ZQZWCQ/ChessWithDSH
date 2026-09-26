# 在这个仓库里工作：操作契约

> 给任何接手这个仓库的人／agent 看的。目标：**不用重新探索就能正确操作。**
> 姊妹项目 `ChessWithCodex` 有一份等价的 `AGENTS.md`，两边**数据契约对齐、实现各自决定**。

## 这是什么

在 DeepSeek Harness（DSH）里下一盘能讲明白的棋：
**本地 Stockfish 负责算，模型只负责讲**，以 DSH bundle 插件的形式分发。

## 五条铁律

1. **不要自己起服务器。** 界面必须挂在宿主自己的 web 服务上（`ctx.webServer` / `ctx.connection.fetch`），
   进程生命周期归宿主。**曾经踩过**：在工具调用里后台起一个 `serve.mjs`，
   命令一结束进程就被收走 —— 端口上只剩 `TIME_WAIT`、没有 `LISTEN`，
   用户的浏览器就报「拒绝连接」、棋盘"画得出来但点不动"。
2. **数字必须来自引擎。** 评估、最佳着法、失误判定一律用 Stockfish 的结果；
   不要凭手感给评估。没有引擎记录时**只描述事实、不下棋力结论**。
3. **评估缓存键 = `<fen>|d<深度>|<引擎名>`**，一律**白方视角**。
   换深度或换引擎自然失效 —— **这是设计不是 bug**。云评估的引擎名要标 `lichess-cloud-eval`
   并写真实 depth，**绝不能伪装成自己的 d16**。
4. **`games/` 是生成物，不要手改**；`notes/` 才是人的资产，**永不覆盖**。
   重算时按 `(ply, san)` 合并人写字段（`note / arrows / highlights / markers`），
   **且必须校验 SAN**：序号不存在或 SAN 对不上就警告跳过，绝不污染记录。
5. **改完必须跑 `pnpm verify`**（format:check + lint + typecheck + test）再提交。
   `main` 受保护，**任何改动都走分支 + PR**。

## 分支与 PR

- 分支名 `<type>/<短描述>`，type 用约定式提交的类型：`feat/ fix/ docs/ refactor/ test/ chore/`
- 一个分支只做一件事；**标题用中文短句**，正文说清「改了什么 / 为什么 / 怎么验证」
- 提交信息用 Conventional Commits：`feat(engine): ...`
- **永远不要直接 push 到 `main`**
- 合并前 `pnpm verify` 必须全绿（CI 跑的是同一条命令）

## 常用命令

```bash
pnpm install
pnpm verify            # 提交门槛：format:check + lint + typecheck + test
pnpm test              # vitest
pnpm test -- <名字>     # 单个用例
pnpm typecheck
pnpm lint / pnpm format
```

## 讲棋的纪律（这是产品的一部分）

- 先看整盘的评估曲线，挑 **2-3 个转折点**讲，**不要逐手复述**
- 指出问题时给出**引擎数字和替代着法**（例如「2.exf5 是 +1.90，实战 2.d3 只剩 +0.36」）
- 界面上已经画出来的东西（曲线、箭头、评估数字）**不要在正文里重复一遍**
- 赢棋要归因清楚：对手是几档、它的失误是设计使然还是真被打崩了

## 环境与坑（都踩过，别再踩）

| 症状 | 原因 | 做法 |
| --- | --- | --- |
| 端口无 `LISTEN`、浏览器「拒绝连接」、棋盘点不动 | 自己起的服务活不过 agent 的一步 | 挂宿主的 web 服务，**不要自己起进程** |
| 棋子细、低对比、看不清 | 用字体画棋子 | 用成熟 SVG 棋子集并**逐个核对可读性**；"马读起来是一坨""象像个字母"都是这么来的 |
| 自证全绿但用户说"看不清/用不顺手" | 只测逻辑没测观感 | 交互与可读性要用**真截图 + 真点击**验收，不看断言数字 |
| 分块下载攒内存最后落盘 | 中断后临时目录空，看着像"卡死" | **边下边写** + 校验 sha256；永远保留"用户自备引擎"的旁路 |
| 引擎 `null function` / `memory access out of bounds` | 引擎没就绪就发指令 | 发 `uci`、**等 `uciok`** 再用；超时 `terminate()` |
| 无头浏览器 + 虚拟时间判断异步初始化 | 空白棋盘 / 引擎"没反应" | 用 Node 在**真实时间**跑，或看真实界面状态行 |
| 语法错误 | 在 JS 模板串里嵌大段 CSS/HTML，反引号提前闭合 | 模板单独放文件 + 启动时校验占位符 |
| Windows 上通过 PATH 找不到引擎 | 候选名缺 `.exe`；用宿主分隔符切 PATH | Windows 候选 `['stockfish.exe','stockfish']`；补 WinGet Links / LOCALAPPDATA / ProgramFiles |

## 数据放哪

代码在插件目录（可能只读、升级会被覆盖），**数据必须在数据根**：

1. `CHESSPLUGIN_HOME`（显式指定；设成 Codex 侧的数据目录即可**两边共享棋谱/讲解/缓存**）
2. 否则 `${DSH_HOME}/dsh-chess`（`DSH_HOME` 未设时取 `~/.dsh`）

目录职责：`pgn/`（原始棋谱）`games/`（唯一真相，生成物）`notes/`（人写，永不覆盖）
`cache/evals.json`（可丢弃的加速层）`sessions/`（进行中的对局）

## 边界（别承诺做不到的事）

- **不随仓库分发引擎**：Stockfish 是 GPLv3，只通过 UCI 协议调用，不捆绑、不 vendor。
- **不收他人评注**：棋谱库只存着法 + 元数据，讲解一律自己写在 `notes/`。
- 引擎缺失时对弈盘**必须仍能下**（退回内置的弱搜索）；分析类功能给可读的安装指引，不甩堆栈。
- 棋谱库是**独立仓库**，我们只读它的 `index.json`，不负责它的内容维护。
