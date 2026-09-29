/**
 * 规则层：FEN 校验、合法着法、走子、记谱互转。
 *
 * 这里只包一层 chess.js，不掺业务。换规则库时只改这个文件，
 * 测试里也拿它当"真值"去校验别的东西。
 *
 * @module chess/rules
 */

import { Chess } from 'chess.js'

/** 一手棋走完的结果。 */
export interface PlayedMove {
  /** 走完之后的 FEN。 */
  readonly fen: string
  /** 标准代数记谱，例如 Nf3。 */
  readonly san: string
  /** 长代数记谱，例如 g1f3；升变带小写后缀，例如 e7e8q。 */
  readonly uci: string
}

/** 把 chess.js 给出的着法拼成 UCI 形式。升变要带小写后缀，否则引擎认不出。 */
function toUciOf(move: { from: string; to: string; promotion?: string }): string {
  return move.from + move.to + (move.promotion ?? '')
}

/** 标准开局的 FEN。 */
export function startFen(): string {
  return new Chess().fen()
}

/**
 * FEN 是否合法。
 *
 * 除了让 chess.js 判合法性，还要求六个字段齐全。原因：FEN 会进缓存键
 * （`<fen>|d<深度>|<引擎名>`），而 chess.js 会默默给缺字段的 FEN 补默认值、
 * 补完还和完整的写法等价。放行缺字段的写法，同一个局面就会有两个键，
 * 引擎白算一遍，记录也对不上。
 */
export function isValidFen(fen: string): boolean {
  if (fen.trim().split(/\s+/).length !== 6) return false
  try {
    new Chess(fen)
    return true
  } catch {
    return false
  }
}

/** 指定局面的全部合法着法，UCI 形式。 */
export function legalMoves(fen: string): string[] {
  return new Chess(fen).moves({ verbose: true }).map((move) => toUciOf(move))
}

/**
 * 走一步。SAN（Nf3）和 UCI（g1f3）都收。
 *
 * @throws 着法不合法时抛 Error，消息形如 Invalid move: Nf6。
 */
export function applyMove(fen: string, move: string): PlayedMove {
  const played = new Chess(fen).move(move)
  return { fen: played.after, san: played.san, uci: toUciOf(played) }
}

/** SAN 转 UCI。 */
export function toUci(fen: string, san: string): string {
  return applyMove(fen, san).uci
}

/** UCI 转 SAN。 */
export function toSan(fen: string, uci: string): string {
  return applyMove(fen, uci).san
}
