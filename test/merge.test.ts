import { describe, expect, it } from 'vitest'
import type { Arrow, NoteFile, Ply } from '../src/contracts.js'
import { authoredOf, mergeAuthored } from '../src/store/merge.js'

/** 一局两手棋，第一手已经带了人写的讲解。 */
function fixture(): Ply[] {
  return [
    { ply: 1, san: 'e4', uci: 'e2e4', fen: 'fen1', cp: 29, mate: null, note: '旧讲解' },
    { ply: 2, san: 'e5', uci: 'e7e5', fen: 'fen2', cp: 25, mate: null },
  ]
}

function noteFile(plies: NoteFile['plies']): NoteFile {
  return { schema: 1, plies }
}

describe('mergeAuthored', () => {
  it('没有讲解时，原样保留上次的人写字段', () => {
    const previous = fixture()
    const out = mergeAuthored(previous, noteFile([]))
    expect(out.plies).toEqual(previous)
    expect(out.skipped).toEqual([])
  })

  it('notes 覆盖同名的人写字段', () => {
    const out = mergeAuthored(fixture(), noteFile([{ ply: 1, san: 'e4', note: '新讲解' }]))
    expect(out.plies[0]?.note).toBe('新讲解')
    expect(out.skipped).toEqual([])
  })

  it('notes 没写的字段保留旧值', () => {
    const arrows: Arrow[] = [{ from: 'e2', to: 'e4', tone: 'best' }]
    const out = mergeAuthored(fixture(), noteFile([{ ply: 1, san: 'e4', arrows }]))
    expect(out.plies[0]?.note).toBe('旧讲解')
    expect(out.plies[0]?.arrows).toEqual(arrows)
  })

  it('序号不存在就跳过，记进 skipped', () => {
    const out = mergeAuthored(fixture(), noteFile([{ ply: 9, san: 'Qh5', note: '无中生有' }]))
    expect(out.plies).toEqual(fixture())
    expect(out.skipped).toEqual([{ ply: 9, san: 'Qh5', reason: 'unknown-ply' }])
  })

  it('SAN 对不上就跳过，记进 skipped', () => {
    const out = mergeAuthored(fixture(), noteFile([{ ply: 1, san: 'd4', note: '对不上' }]))
    expect(out.plies[0]?.note).toBe('旧讲解')
    expect(out.skipped).toEqual([{ ply: 1, san: 'd4', reason: 'san-mismatch' }])
  })

  it('条数与顺序和入参一致', () => {
    const out = mergeAuthored(fixture(), noteFile([{ ply: 2, san: 'e5', note: 'ok' }]))
    expect(out.plies.map((p) => p.ply)).toEqual([1, 2])
  })

  it('不改入参', () => {
    const previous = fixture()
    const snapshot = structuredClone(previous)
    mergeAuthored(previous, noteFile([{ ply: 1, san: 'e4', note: '改了' }]))
    expect(previous).toEqual(snapshot)
  })
})

describe('authoredOf', () => {
  it('只带回真的写了的字段', () => {
    expect(authoredOf({ ply: 1, san: 'e4' })).toEqual({})
    expect(authoredOf({ ply: 1, san: 'e4', note: 'x' })).toEqual({ note: 'x' })
  })
})
