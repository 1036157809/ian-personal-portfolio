/**
 * Markdown 解析模块
 * 将 Markdown 字符串解析为 Block 数组，同时提供去除 Markdown 格式标记的工具函数。
 */

import { marked } from 'marked'
import type { Block } from './types'

/**
 * 将 Markdown 字符串解析为 Block 数组。
 * 使用 marked 的 lexer 进行词法分析，支持标题、段落、列表、表格、引用块。
 * 嵌套列表通过 depth 字段记录层级，子列表内容不会重复出现在父列表项中。
 */
export const parseBlocks =  (md: string): Block[]  => {
  const tokens = marked.lexer(md)
  const blocks: Block[] = []

  /**
   * 递归处理列表 token。
   * 如果列表项内包含嵌套子列表，只提取非列表的文本内容作为当前项的 text，
   * 避免子项内容在父项中重复渲染。
   */
  const processList = (listToken: any, depth: number) => {
    for (const item of listToken.items) {
      let itemText = item.text

      if (item.tokens) {
        const hasNestedList = item.tokens.some((t: any) => t.type === 'list')
        if (hasNestedList) {
          // 有嵌套子列表：只取非列表 token 的文本，子列表会递归处理
          const inlineTokens = item.tokens.filter((t: any) => t.type !== 'list')
          if (inlineTokens.length > 0) {
            itemText = inlineTokens
              .map((t: any) => t.text || t.raw || '')
              .join('')
              .trim()
          }
        }
      }

      blocks.push({
        type: 'list_item',
        text: itemText,
        ordered: !!listToken.ordered,
        depth,
      })

      // 递归处理嵌套子列表
      if (item.tokens) {
        for (const inner of item.tokens) {
          if (inner.type === 'list') {
            processList(inner, depth + 1)
          }
        }
      }
    }
  }

  // 遍历 marked 产生的顶层 token，按类型分发
  for (const t of tokens) {
    switch (t.type) {
      case 'heading':
        // 限制最大深度为 h4
        blocks.push({ type: `h${Math.min(t.depth, 4)}` as Block['type'], text: t.text })
        break
      case 'paragraph':
        blocks.push({ type: 'paragraph', text: t.text })
        break
      case 'list':
        processList(t, 0)
        break
      case 'table': {
        // 表格序列化为 JSON 存储，渲染时反序列化
        const headers = t.header.map((h: { text: string }) => h.text)
        const rows = t.rows.map((row: { text: string }[]) =>
          row.map((c: { text: string }) => c.text))
        blocks.push({ type: 'table', text: JSON.stringify({ headers, rows }) })
        break
      }
      case 'blockquote':
        blocks.push({ type: 'blockquote', text: t.text })
        break
      case 'space':
        // 空行分隔符，用于保留 md 中的段落间距
        blocks.push({ type: 'space' })
        break
    }
  }
  return blocks
}

/**
 * 去除 Markdown 格式标记，返回纯文本。
 * 处理：**粗体**、*斜体*、`代码`、[链接](url)、~~删除行~~、HTML 标签。
 */
export const stripMD =  (s: string): string  => {
  return s
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/~~(.+?)~~/g, '$1')
    .replace(/<[^>]+>/g, '')
}
