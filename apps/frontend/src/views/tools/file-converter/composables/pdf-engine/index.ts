/**
 * PDF 引擎模块统一入口
 *
 * 模块结构：
 *   constants.ts        — 常量配置（页面、边距、字号、颜色等）
 *   types.ts            — 类型定义（Block, Seg, PdfConversionResult）
 *   markdown-parser.ts  — Markdown 解析（parseBlocks, stripMD）
 *   text-wrapper.ts     — 文本换行与行内解析（safeWrapText, parseSegments, ab2b64）
 *   pdf-builder.ts      — PDF 渲染器（Builder 类）
 */

export { PT, PAGE_W_PT, PAGE_H_PT, ML_PT, MR_PT, MT_PT, MB_PT, CW_PT } from './constants'
export { FS_H2, FS_H3, FS_BODY, FS_TABLE } from './constants'
export { LH_BODY, LH_H2, LH_H3, LH_TABLE } from './constants'
export { GAP_BEFORE_H2, GAP_H2_RULE, GAP_H2_CONTENT, GAP_BEFORE_H3, GAP_AFTER_H2_CONTENT, GAP_AFTER_TABLE } from './constants'
export { BULLET_INDENT, NESTED_INDENT, DOT_OFFSET, DOT_RADIUS_PT } from './constants'
export { C_ACCENT, C_TEXT, C_MID, C_BULLET, C_LINE, C_BG_TINT } from './constants'
export { FONT_REG, FONT_BOLD, BREAK_AFTER } from './constants'

export type { Block, Seg, PdfConversionResult } from './types'

export { parseBlocks, stripMD } from './markdown-parser'
export { safeWrapText, parseSegments, ab2b64 } from './text-wrapper'
export { Builder } from './pdf-builder'
