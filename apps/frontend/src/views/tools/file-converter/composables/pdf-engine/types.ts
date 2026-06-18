/**
 * PDF 引擎类型定义
 * 包含块级元素 Block、行内片段 Seg、PDF 转换结果 PdfConversionResult。
 */

/** 解析后的块级元素 */
export interface Block {
  type: 'h2' | 'h3' | 'h4' | 'paragraph' | 'list_item' | 'table' | 'blockquote' | 'space'
  text?: string        // 文本内容（表格为 JSON 序列化的 { headers, rows }）
  ordered?: boolean    // 是否为有序列表
  depth?: number       // 列表嵌套深度（0 = 顶层）
}

/** 行内片段：一段具有相同样式（常规/粗体/链接）的文本 */
export interface Seg {
  text: string
  bold: boolean
  link?: string  // 存在时表示这是一个 URL 链接
}

/** PDF 转换结果 */
export interface PdfConversionResult {
  blob: Blob
  url: string
  filename: string
}
