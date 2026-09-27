import { describe, expect, it } from 'vitest'
import { applyMove, isValidFen, legalMoves, startFen, toSan, toUci } from '../src/chess/rules.js'

// 测试里把 FEN 写死，不靠被测代码生成，否则两边一起错就测不出来了。
const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
// 愚人杀终局：1.f3 e5 2.g4 Qh4#，轮到白走且已被将杀。
const FOOLS_MATE = 'rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3'
const AFTER_E4 = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1'

describe('startFen', () => {
  it('给出标准开局', () => {
    expect(startFen()).toBe(START)
  })
})

describe('isValidFen', () => {
  it('接受完整 FEN', () => {
    expect(isValidFen(START)).toBe(true)
  })

  it('拒绝乱写的字符串', () => {
    expect(isValidFen('这不是 FEN')).toBe(false)
  })

  it('拒绝少字段的 FEN（它会进缓存键，写法必须唯一）', () => {
    expect(isValidFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -')).toBe(false)
  })
})

describe('legalMoves', () => {
  it('开局二十步', () => {
    expect(legalMoves(START)).toHaveLength(20)
  })

  it('输出 UCI 形式', () => {
    expect(legalMoves(START)).toContain('e2e4')
  })

  it('将杀局面没有合法着法', () => {
    expect(legalMoves(FOOLS_MATE)).toEqual([])
  })
})

describe('applyMove', () => {
  it('收 SAN', () => {
    expect(applyMove(START, 'e4')).toEqual({ fen: AFTER_E4, san: 'e4', uci: 'e2e4' })
  })

  it('也收 UCI', () => {
    expect(applyMove(START, 'e2e4').san).toBe('e4')
  })

  it('不合法就抛错', () => {
    expect(() => applyMove(START, 'Nf6')).toThrow(/Invalid move/)
  })
})

describe('记谱互转', () => {
  it('SAN 转 UCI', () => {
    expect(toUci(START, 'e4')).toBe('e2e4')
    expect(toUci(START, 'Nf3')).toBe('g1f3')
  })

  it('UCI 转 SAN', () => {
    expect(toSan(START, 'e2e4')).toBe('e4')
    expect(toSan(START, 'g1f3')).toBe('Nf3')
  })
})
