import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { name } from '../src/plugin.js'

// 这三个断言防的是同一类事故：插件"装上了但静默不出现"。
// 清单里任何一处对不上，DSH 都不会报错，只是加载不到东西。
const root = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..')
const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8')) as {
  name: string
  dsh?: { bundle?: { patch?: string } }
}

describe('插件清单', () => {
  it('package.json 声明了 dsh.bundle.patch，指向的文件确实存在', () => {
    const patch = pkg.dsh?.bundle?.patch
    expect(patch).toBeTruthy()
    expect(() => readFileSync(path.join(root, patch as string), 'utf8')).not.toThrow()
  })

  it('cordis.patch.yml 用包名引用自己', () => {
    const patch = readFileSync(path.join(root, pkg.dsh?.bundle?.patch as string), 'utf8')
    expect(patch).toContain(pkg.name)
  })

  it('插件的 name 与包名一致', () => {
    expect(name).toBe(pkg.name)
  })
})
