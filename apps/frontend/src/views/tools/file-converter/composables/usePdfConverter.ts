/**
 * PDF 转换器 Composable
 *
 * 公开 API：
 *   const { converting, error, convertToPdf } = usePdfConverter()
 *   const result = await convertToPdf(markdownString, 'output.pdf')
 *   // result.blob → 下载用 Blob
 *   // result.url  → 预览用 Object URL
 *
 * 内部实现已拆分至 pdf-engine/ 子目录：
 *   constants.ts        — 常量配置
 *   types.ts            — 类型定义
 *   markdown-parser.ts  — Markdown 解析
 *   text-wrapper.ts     — 文本换行与行内解析
 *   pdf-builder.ts      — PDF 渲染器
 */

import { ref } from 'vue'
import type { PdfConversionResult } from './pdf-engine'
import { parseBlocks, Builder } from './pdf-engine'

export type { PdfConversionResult }

export const usePdfConverter =  ()  => {
  const converting = ref(false)
  const error = ref('')

  const convertToPdf = async (markdown: string, filename = 'document.pdf'): Promise<PdfConversionResult> => {
    converting.value = true
    error.value = ''
    try {
      const b = new Builder()
      await b.render(parseBlocks(markdown))
      if (b.fontError) {
        error.value = `字体加载失败: ${b.fontError}，PDF 中的中文可能显示为空白。请确保字体文件存在于 /fonts/ 目录下。`
      }
      return b.output(filename)
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      converting.value = false
    }
  }

  return { converting, error, convertToPdf }
}
