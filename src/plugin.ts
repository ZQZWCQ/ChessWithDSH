/**
 * DSH bundle 插件的入口。
 *
 * 用具名导出（`name` / `inject` / `apply`），与 DSH 官方插件一致 ——
 * 具名导出会保留 loader 需要的注入元数据。
 *
 * @module plugin
 */

/** 插件名。 */
export const name = 'chess-with-dsh'

/**
 * 需要宿主注入的服务名。
 *
 * S0 还没有用到任何服务，先留空；注册工具时会加 `'tools'`，
 * 挂界面时加 `'webServer'`、`'connection'`。
 */
export const inject: readonly string[] = []

/** 插件 `apply` 拿到的上下文（S0 只需要最小形状）。 */
export interface PluginContext {
  /** 宿主提供的副作用登记；卸载时自动清理。 */
  readonly effect?: (fn: () => void) => void
}

/**
 * 插件装入口。
 *
 * S0 只有骨架：保证**能被加载**、**能被测试**。
 * 真正的工具注册在 S3、界面在 S2/S4。
 *
 * @param _ctx - 宿主上下文。
 * @param _config - 插件配置（当前未使用）。
 */
export function apply(_ctx: PluginContext, _config?: unknown): void {
  // 刻意留空：S0 的验收标准是"可加载 + 流水线全绿"，不是"有功能"。
}
