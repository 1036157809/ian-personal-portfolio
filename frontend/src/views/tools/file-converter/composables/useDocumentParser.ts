import { ref } from 'vue'
import mammoth from 'mammoth'
import { marked } from 'marked'

export interface ParseResult {
  html: string
  text: string
}

export function useDocumentParser() {
  const parsing = ref(false)
  const error = ref('')

  const parseMarkdown = async (file: File): Promise<ParseResult> => {
    parsing.value = true
    error.value = ''

    try {
      const text = await file.text()
      const html = await marked(text)
      return { html, text }
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      parsing.value = false
    }
  }

  const parseDocx = async (file: File): Promise<ParseResult> => {
    parsing.value = true
    error.value = ''

    try {
      const arrayBuffer = await file.arrayBuffer()
      const result = await mammoth.convertToHtml({ arrayBuffer })
      const textResult = await mammoth.extractRawText({ arrayBuffer })
      return { html: result.value, text: textResult.value }
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      parsing.value = false
    }
  }

  return { converting: parsing, error, parseMarkdown, parseDocx }
}
