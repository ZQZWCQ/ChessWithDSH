import { describe, expect, it } from 'vitest'
import { apply, inject, name } from '../src/plugin.js'

describe('插件骨架', () => {
  it('插件名与包名一致', () => {
    expect(name).toBe('chess-with-dsh')
  })

  it('inject 是字符串数组（S0 还没用到宿主服务）', () => {
    expect(Array.isArray(inject)).toBe(true)
    expect(inject.every((s) => typeof s === 'string' && s !== '')).toBe(true)
  })

  it('apply 能被加载且不抛异常（用最小假 ctx，不需要真宿主）', () => {
    const effects: Array<() => void> = []
    const ctx = { effect: (fn: () => void) => void effects.push(fn) }
    expect(() => apply(ctx)).not.toThrow()
  })
})
