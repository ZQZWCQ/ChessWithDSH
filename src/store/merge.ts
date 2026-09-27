/**
 * 记录合并：把 notes/ 里人写的字段合回棋谱。
 *
 * 这里是 INV-2（讲解 append-only）的落点。规矩来自数据契约：
 * 先取上次记录里已存的人写字段，再用 notes/ 覆盖；
 * 每次都校验 SAN —— 序号不存在、或者 SAN 和棋谱对不上，就记进
 * skipped 跳过，绝不写进记录。
 *
 * 已知未覆盖：notes 里的 start_note（整局开头那句）不在这里处理。
 * 它属于整局而不是某一手，等 S1b 落存储时一起接。
 *
 * @module store/merge
 */

import type { Arrow, Highlight, Marker, NoteEntry, NoteFile, Ply } from '../contracts.js'

/** 一条被跳过的讲解，以及原因。 */
export interface MergeSkip {
  readonly ply: number
  readonly san: string
  readonly reason: 'unknown-ply' | 'san-mismatch'
}

/** 合并结果。skipped 交给调用方打日志，不静默吞掉。 */
export interface MergeOutcome {
  readonly plies: readonly Ply[]
  readonly skipped: readonly MergeSkip[]
}

/** Ply 里人写的那四个字段。 */
export interface Authored {
  readonly note?: string
  readonly arrows?: readonly Arrow[]
  readonly highlights?: readonly Highlight[]
  readonly markers?: readonly Marker[]
}

/**
 * 从一条讲解里取出它真的写了的字段。
 *
 * 返回类型只有那四项，拿不到 cp/fen 这类引擎算出来的值。
 * 没写的字段不进结果，因为"字段不存在"和"字段是 undefined"是两回事。
 */
export function authoredOf(entry: NoteEntry): Authored {
  const out: {
    note?: string
    arrows?: readonly Arrow[]
    highlights?: readonly Highlight[]
    markers?: readonly Marker[]
  } = {}
  if (entry.note !== undefined) out.note = entry.note
  if (entry.arrows !== undefined) out.arrows = entry.arrows
  if (entry.highlights !== undefined) out.highlights = entry.highlights
  if (entry.markers !== undefined) out.markers = entry.markers
  return out
}

/**
 * 把人写的字段合进棋谱。
 *
 * 纯函数：不改入参，返回新的数组。plies 的条数与顺序和 previous 完全一致。
 * 一条讲解有问题只跳过它自己，其余的照常合并。
 *
 * @param previous - 上一次记录里的逐手数据（含已存的人写字段）。
 * @param notes - notes/<id>.json 的内容。
 */
export function mergeAuthored(previous: readonly Ply[], notes: NoteFile): MergeOutcome {
  const merged = new Map<number, Ply>()
  for (const ply of previous) merged.set(ply.ply, ply)

  const skipped: MergeSkip[] = []
  for (const entry of notes.plies) {
    const base = merged.get(entry.ply)
    if (base === undefined) {
      skipped.push({ ply: entry.ply, san: entry.san, reason: 'unknown-ply' })
      continue
    }
    if (base.san !== entry.san) {
      skipped.push({ ply: entry.ply, san: entry.san, reason: 'san-mismatch' })
      continue
    }
    merged.set(entry.ply, { ...base, ...authoredOf(entry) })
  }

  return { plies: previous.map((ply) => merged.get(ply.ply) ?? ply), skipped }
}
