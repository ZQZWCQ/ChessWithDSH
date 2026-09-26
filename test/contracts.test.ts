import { describe, expect, it } from 'vitest'
import { AUTHORED_FIELDS, SCHEMA_VERSION, evalCacheKey } from '../src/contracts.js'

describe('数据契约', () => {
  it('契约版本号是 1', () => {
    expect(SCHEMA_VERSION).toBe(1)
  })

  it('人写字段固定为四项', () => {
    expect([...AUTHORED_FIELDS]).toEqual(['note', 'arrows', 'highlights', 'markers'])
  })
})

describe('evalCacheKey', () => {
  const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

  it('格式是 <fen>|d<深度>|<引擎名>', () => {
    expect(evalCacheKey(fen, 16, 'Stockfish 19')).toBe(`${fen}|d16|Stockfish 19`)
  })

  it('换深度会失效', () => {
    expect(evalCacheKey(fen, 16, 'Stockfish 19')).not.toBe(evalCacheKey(fen, 20, 'Stockfish 19'))
  })

  it('换引擎会失效', () => {
    expect(evalCacheKey(fen, 16, 'Stockfish 19')).not.toBe(
      evalCacheKey(fen, 16, 'lichess-cloud-eval'),
    )
  })

  it('去掉 FEN 与引擎名两端的空白', () => {
    expect(evalCacheKey(`  ${fen}  `, 16, '  Stockfish 19 ')).toBe(`${fen}|d16|Stockfish 19`)
  })
})
