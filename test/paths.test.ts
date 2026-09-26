import { describe, expect, it } from 'vitest'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { dataLayout, resolveDataRoot } from '../src/paths.js'

describe('resolveDataRoot', () => {
  it('CHESSPLUGIN_HOME 优先（设成它即可与姊妹项目共享数据）', () => {
    expect(resolveDataRoot({ CHESSPLUGIN_HOME: '/shared/chess', DSH_HOME: '/dsh' })).toBe(
      '/shared/chess',
    )
  })

  it('没有 CHESSPLUGIN_HOME 时用 DSH_HOME/dsh-chess', () => {
    expect(resolveDataRoot({ DSH_HOME: '/dsh' })).toBe(join('/dsh', 'dsh-chess'))
  })

  it('两者都没有时退回 ~/.dsh/dsh-chess', () => {
    expect(resolveDataRoot({})).toBe(join(homedir(), '.dsh', 'dsh-chess'))
  })

  it('空白值当成没设', () => {
    expect(resolveDataRoot({ CHESSPLUGIN_HOME: '   ', DSH_HOME: '/dsh' })).toBe(
      join('/dsh', 'dsh-chess'),
    )
  })
})

describe('dataLayout', () => {
  it('目录职责与 AGENTS.md 一致', () => {
    const layout = dataLayout('/data')
    expect(layout).toEqual({
      root: '/data',
      pgnDir: join('/data', 'pgn'),
      gamesDir: join('/data', 'games'),
      notesDir: join('/data', 'notes'),
      sessionsDir: join('/data', 'sessions'),
      cacheFile: join('/data', 'cache', 'evals.json'),
    })
  })
})
