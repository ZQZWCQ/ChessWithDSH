/**
 * 跨插件数据契约（与姊妹项目 ChessWithCodex 逐字对齐）。
 *
 * 这个文件里的字段名、单位、视角、缓存键格式**不能随便改**：
 * 一改，棋谱、讲解、评估缓存就没法在两个项目之间互相搬了。
 *
 * @module contracts
 */

/** 契约版本号。读到自己不认识的版本要给可读提示，而不是硬着头皮解析。 */
export const SCHEMA_VERSION = 1

/**
 * 一个局面的评估，**一律白方视角**。
 *
 * 引擎原生态给的是行棋方视角，不换算会整体反号 ——
 * 这正是"越强的档越乱走"那类 bug 的根源。
 *
 * `mate` 非空时 `cp` 无意义；`mate: 0` 表示**该局面已经将杀**，
 * 谁赢要结合该局面 FEN 的走子方判断，不能只看符号。
 */
export interface Score {
  /** 百分之一兵单位，白方视角。`mate` 非空时为 `null`。 */
  readonly cp: number | null
  /** 距离将杀的步数（含符号）。非将杀局面为 `null`。 */
  readonly mate: number | null
}

/** 引擎身份。会进缓存键，所以不能用含糊的名字。 */
export interface EngineIdentity {
  readonly name: string
  readonly version: string
}

/**
 * 评估缓存的键：`<fen>|d<深度>|<引擎名>`。
 *
 * 键里必须含**深度与引擎名**，所以换深度或换引擎会自然失效 ——
 * 这是设计，不是 bug。云评估（Lichess cloud-eval）用
 * `lichess-cloud-eval` 当引擎名、写响应里的**真实** depth，
 * 绝不能伪装成自己的 d16，否则深度语义就废了。
 *
 * @param fen - 完整 FEN。
 * @param depth - 实际达到的搜索深度。
 * @param engineName - 引擎显示名（例如 `Stockfish 19`）。
 */
export function evalCacheKey(fen: string, depth: number, engineName: string): string {
  return `${fen.trim()}|d${depth}|${engineName.trim()}`
}

/** 人写的字段。重算时这些字段必须原样保留，**永不覆盖**。 */
export const AUTHORED_FIELDS = ['note', 'arrows', 'highlights', 'markers'] as const

/** {@link AUTHORED_FIELDS} 的元素类型。 */
export type AuthoredField = (typeof AUTHORED_FIELDS)[number]
