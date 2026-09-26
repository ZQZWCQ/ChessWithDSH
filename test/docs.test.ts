import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// 从别处粘贴 Markdown 时，转义字符会跟着混进来。反引号包住的代码片段不做转义，
// 那些反斜杠会原样显示给读者，环境变量名和文件路径就此写错。这个测试盯着这件事。
const root = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..')
const DOCS = ['README.md', 'AGENTS.md', 'docs/problems_met.md', 'docs/architecture.md']
const BAD_ESCAPES = ['\\_', '\\*', '\\[', '\\]', '\\~', '\\.', '\\#']

describe('文档里的转义字符', () => {
  for (const rel of DOCS) {
    it(`${rel} 的代码片段不含多余的反斜杠`, () => {
      let text: string
      try {
        text = readFileSync(path.join(root, rel), 'utf8')
      } catch {
        return // 还没写的文档跳过
      }
      const spans = [...text.matchAll(/`([^`]*)`/g)].map((m) => m[1] ?? '')
      const offenders = spans.filter((s) => BAD_ESCAPES.some((e) => s.includes(e)))
      expect(offenders, `代码片段里有转义字符：${offenders.join(' / ')}`).toEqual([])
    })
  }
})
