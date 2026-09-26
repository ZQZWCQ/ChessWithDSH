/**
 * 数据落点解析。
 *
 * 为什么需要它：插件代码装在插件目录里（可能只读、升级会被覆盖、卸载会被删），
 * 而棋谱、讲解、缓存、对局都要写。所以"代码在哪"和"数据在哪"必须是两个概念。
 *
 * 解析顺序：
 *   1. `CHESSPLUGIN_HOME`（显式指定）—— 设成姊妹项目的数据目录即可**两边共享**
 *   2. 否则 `${DSH_HOME}/dsh-chess`（`DSH_HOME` 未设时取 `~/.dsh`）
 *
 * @module paths
 */

import { homedir } from 'node:os'
import { join } from 'node:path'

/** 数据根下的目录与文件布局。 */
export interface DataLayout {
  /** 数据根。 */
  readonly root: string
  /** 原始棋谱（人或下载工具写）。 */
  readonly pgnDir: string
  /** 完整记录。**生成物**，手改会被覆盖。 */
  readonly gamesDir: string
  /** 讲解与标注。**人写**，重算时合并回记录，永不覆盖。 */
  readonly notesDir: string
  /** 进行中的人机对局。 */
  readonly sessionsDir: string
  /** 评估记忆，可丢弃的加速层。 */
  readonly cacheFile: string
}

/**
 * 解析数据根。
 *
 * @param env - 环境变量来源，可注入以便测试。
 * @returns 数据根的绝对路径。
 */
export function resolveDataRoot(env: NodeJS.ProcessEnv = process.env): string {
  const explicit = env['CHESSPLUGIN_HOME']?.trim()
  if (explicit !== undefined && explicit !== '') return explicit

  const dshHome = env['DSH_HOME']?.trim()
  const home = dshHome !== undefined && dshHome !== '' ? dshHome : join(homedir(), '.dsh')
  return join(home, 'dsh-chess')
}

/**
 * 由数据根推导完整布局。
 *
 * @param root - 数据根，默认 {@link resolveDataRoot}。
 */
export function dataLayout(root: string = resolveDataRoot()): DataLayout {
  return {
    root,
    pgnDir: join(root, 'pgn'),
    gamesDir: join(root, 'games'),
    notesDir: join(root, 'notes'),
    sessionsDir: join(root, 'sessions'),
    cacheFile: join(root, 'cache', 'evals.json'),
  }
}
