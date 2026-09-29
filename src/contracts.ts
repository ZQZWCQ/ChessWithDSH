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

/** 标注色调。取值与姊妹项目一致，改了两边的渲染层就对不上。 */
export type Tone =
  'focus' | 'plan' | 'best' | 'alt' | 'threat' | 'mistake' | 'blunder' | 'check' | 'last'

/** 棋盘上的箭头。人写字段之一。 */
export interface Arrow {
  readonly from: string
  readonly to: string
  readonly tone: Tone
}

/** 方格高亮的画法。dot 画在棋子之上。 */
export type HighlightStyle = 'fill' | 'ring' | 'dot'

/** 方格高亮。人写字段之一。 */
export interface Highlight {
  readonly square: string
  readonly tone: Tone
  readonly style: HighlightStyle
}

/** 格角标记，例如 ??。人写字段之一。 */
export interface Marker {
  readonly square: string
  readonly text: string
  readonly shape: 'glyph' | 'badge'
  readonly tone: Tone
  readonly corner?: 'tl' | 'tr' | 'bl' | 'br'
}

/** 一手棋。棋谱的原子单位。 */
export interface Ply {
  /** 半回合序号，1 起。奇数白走，偶数黑走。 */
  readonly ply: number
  readonly san: string
  readonly uci: string
  /** 这一手走完之后的局面。 */
  readonly fen: string
  /** 白方视角。mate 非空时无意义。 */
  readonly cp: number | null
  readonly mate: number | null
  /** 以下四项是人写的，重算时必须原样保留。 */
  readonly note?: string
  readonly arrows?: readonly Arrow[]
  readonly highlights?: readonly Highlight[]
  readonly markers?: readonly Marker[]
}

/** notes/<id>.json 里的一条。字段与 Ply 的人写部分同形。 */
export interface NoteEntry {
  readonly ply: number
  readonly san: string
  readonly note?: string
  readonly arrows?: readonly Arrow[]
  readonly highlights?: readonly Highlight[]
  readonly markers?: readonly Marker[]
}

/** notes/<id>.json 是人写的资产，重算永不覆盖。 */
export interface NoteFile {
  readonly schema: number
  readonly start_note?: string
  readonly plies: readonly NoteEntry[]
}

/** 引擎记录：身份加搜索深度。 */
export interface GameEngine extends EngineIdentity {
  readonly depth: number
}

/** games/<id>.json 是唯一数据源，但由 PGN 生成，不要手改。 */
export interface GameRecord {
  readonly schema: number
  readonly id: string
  readonly title?: string
  /** PGN 头原样保留。 */
  readonly headers: Readonly<Record<string, string>>
  readonly start_fen: string
  readonly plies: readonly Ply[]
  readonly engine: GameEngine
  readonly created: string
  readonly analyzed: string
  readonly source?: string
}
