/**
 * 文本换行与行内片段解析模块
 *
 * 包含三个核心功能：
 *   1. safeWrapText  — 安全换行算法（替代 jsPDF 有 bug 的 splitTextToSize）
 *   2. parseSegments — 行内 Markdown 标记解析（粗体、斜体、URL）
 *   3. ab2b64        — ArrayBuffer → Base64（字体文件编码）
 */

import { PT, BREAK_AFTER } from './constants'
import type { Seg } from './types'

// ── ArrayBuffer → Base64 ─────────────────────────────────────────────

/**
 * ArrayBuffer → Base64 字符串。
 * 用于将下载的字体文件转为 jsPDF addFileToVFS 需要的格式。
 */
export function ab2b64(buf: ArrayBuffer): string {
  let b = ''
  const bytes = new Uint8Array(buf)
  for (let i = 0; i < bytes.byteLength; i++) b += String.fromCharCode(bytes[i])
  return btoa(b)
}

// ── 行内片段解析 ─────────────────────────────────────────────────────

/**
 * 将含行内 Markdown 标记的文本解析为 Seg 片段数组。
 * 支持：
 *   - **粗体**  → bold: true
 *   - *斜体*    → 去除标记，作为普通文本
 *   - 裸 URL     → link: url（蓝色+下划线+可点击）
 */
export function parseSegments(raw: string): Seg[] {
  const segs: Seg[] = []
  const re = /\*\*(.+?)\*\*|\*(.+?)\*|(https?:\/\/[^\s)]+)/g
  let last = 0, m: RegExpExecArray | null
  while ((m = re.exec(raw)) !== null) {
    if (m.index > last) segs.push({ text: raw.slice(last, m.index), bold: false })
    if (m[1]) segs.push({ text: m[1], bold: true })       // **粗体**
    else if (m[2]) segs.push({ text: m[2], bold: false })  // *斜体*
    else if (m[3]) segs.push({ text: m[3], bold: false, link: m[3] }) // URL
    last = m.index + m[0].length
  }
  if (last < raw.length) segs.push({ text: raw.slice(last), bold: false })
  return segs.length ? segs : [{ text: raw, bold: false }]
}

// ── 安全换行算法 ─────────────────────────────────────────────────────
//
//  问题：jsPDF 的 splitTextToSize 在 CJK/ASCII 边界处会丢字符。
//  解决：按 token 累加宽度手动换行，保证零字符丢失。
//
//  算法步骤：
//    1. 分词：英文单词（含尾部空格）为一个 token，每个 CJK 字符为一个 token
//    2. 贪心填充：扫描找到当前行能容纳的最后一个 token（lastFit）
//    3. 标点优化断行：在 [lineStart, lastFit] 范围内找最佳标点断点
//       - 优先在 、； 处断开（枚举停顿）
//       - 其次在 ，。 等标点处断开
//       - 仅当填充率 ≥90% 时才使用标点断点，否则在 lastFit+1 处硬断
//    4. 标点孤行防护：如果断点后剩余内容全是尾部标点，直接并入当前行
//    5. 再平衡：处理过短的末行（<20%）和标点孤行问题
//

/**
 * 安全换行函数。
 * @param doc          jsPDF 实例（需已设置好字体和字号）
 * @param text          要换行的纯文本
 * @param maxWidthMm    最大行宽（mm）
 * @returns             换行后的每行 { text, widthPt }
 */
export function safeWrapText(doc: any, text: string, maxWidthMm: number): { text: string; widthPt: number }[] {
  if (!text) return []
  const lines: { text: string; widthPt: number }[] = []

  // ── 第 1 步：分词 ──────────────────────────────────────────────────
  // 英文单词（含尾部空格）合并为单个 token，保证英语单词不会被拆开换行。
  // 每个 CJK 字符作为独立 token，允许在任意两个 CJK 字符间断行。
  const tokens: string[] = []
  let buf = ''
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    const isASCII = ch.charCodeAt(0) < 128
    if (isASCII) {
      buf += ch
    } else {
      if (buf) { tokens.push(buf); buf = '' }
      tokens.push(ch)
    }
  }
  if (buf) tokens.push(buf)

  // ── 第 2 步：贪心填充 + 标点优化断行 ──────────────────────────────
  let lineStart = 0

  while (lineStart < tokens.length) {
    // 前向扫描：找到当前行能容纳的最后一个 token
    let lineWidthMm = 0
    let lastFit = lineStart - 1
    for (let i = lineStart; i < tokens.length; i++) {
      const w = doc.getTextWidth(tokens[i])
      if (lineWidthMm + w <= maxWidthMm) {
        lineWidthMm += w
        lastFit = i
      } else {
        break
      }
    }

    // 所有剩余 token 都放得下 → 最后一行，直接输出
    if (lastFit >= tokens.length - 1) {
      const lineText = tokens.slice(lineStart).join('')
      lines.push({ text: lineText, widthPt: doc.getTextWidth(lineText) / PT })
      break
    }

    // 在 [lineStart, lastFit] 范围内找最佳标点断点
    let bestEnumBreak = -1   // 最佳的 、； 断点
    let bestEnumWidth = 0
    let bestPunctBreak = -1  // 最佳的任意标点断点
    let bestPunctWidth = 0

    let accMm = 0
    for (let i = lineStart; i <= lastFit; i++) {
      accMm += doc.getTextWidth(tokens[i])
      const ch = tokens[i]
      if (ch && BREAK_AFTER.has(ch[ch.length - 1])) {
        if (bestPunctBreak === -1 || accMm > bestPunctWidth) {
          bestPunctBreak = i
          bestPunctWidth = accMm
        }
        if ('、；'.includes(ch)) {
          if (bestEnumBreak === -1 || accMm > bestEnumWidth) {
            bestEnumBreak = i
            bestEnumWidth = accMm
          }
        }
      }
    }

    // 决定断行位置：优先使用标点断点，但要求填充率 ≥90%
    const minFillRatio = 0.90
    const enumFillRatio = bestEnumBreak >= lineStart ? bestEnumWidth / maxWidthMm : 0
    const punctFillRatio = bestPunctBreak >= lineStart ? bestPunctWidth / maxWidthMm : 0

    let breakAt: number
    if (enumFillRatio >= minFillRatio) {
      breakAt = bestEnumBreak + 1
    } else if (punctFillRatio >= minFillRatio) {
      breakAt = bestPunctBreak + 1
    } else {
      breakAt = lastFit + 1
    }

    // ── 标点孤行防护（贪心阶段）──────────────────────────────────────
    // 如果断行后剩余内容全是尾部标点（如 。；、），直接并入当前行
    const remaining = tokens.slice(breakAt).join('')
    if (breakAt < tokens.length && /^[。，；、）]+$/.test(remaining)) {
      const allText = tokens.slice(lineStart).join('')
      lines.push({ text: allText, widthPt: doc.getTextWidth(allText) / PT })
      break
    }

    const lineText = tokens.slice(lineStart, breakAt).join('')
    lines.push({ text: lineText, widthPt: doc.getTextWidth(lineText) / PT })
    lineStart = breakAt
  }

  // ── 第 3 步：再平衡 ────────────────────────────────────────────────
  if (lines.length >= 2) {
    const lastLine = lines[lines.length - 1]
    const prevLine = lines[lines.length - 2]
    const maxPt = maxWidthMm / PT
    const lastW = lastLine.widthPt

    // ── Case 2：末行只有尾部标点，不能让它孤行 ──────────────────────
    const isOrphanPunctuation = /^[。，；、）]+$/.test(lastLine.text)
    if (isOrphanPunctuation) {
      const combinedW = prevLine.widthPt + lastW
      if (combinedW <= maxPt) {
        // 上一行有空间：直接合并
        lines[lines.length - 2] = { text: prevLine.text + lastLine.text, widthPt: combinedW }
        lines.pop()
      } else {
        // 上一行太满：从上一行尾部推一个非标点 token 下来
        const prevTokens: string[] = []
        buf = ''
        for (let i = 0; i < prevLine.text.length; i++) {
          const ch = prevLine.text[i]
          const isASCII = ch.charCodeAt(0) < 128
          if (isASCII) { buf += ch }
          else { if (buf) { prevTokens.push(buf); buf = '' }; prevTokens.push(ch) }
        }
        if (buf) prevTokens.push(buf)

        let splitIdx = prevTokens.length - 1
        while (splitIdx > 0 && /^[。，；、）]+$/.test(prevTokens[splitIdx])) splitIdx--

        if (splitIdx > 0 && splitIdx < prevTokens.length) {
          const moveTokens = prevTokens.slice(splitIdx)
          const newPrevText = prevTokens.slice(0, splitIdx).join('')
          const newLastText = moveTokens.join('') + lastLine.text
          lines[lines.length - 2] = { text: newPrevText, widthPt: doc.getTextWidth(newPrevText) / PT }
          lines[lines.length - 1] = { text: newLastText, widthPt: doc.getTextWidth(newLastText) / PT }
        }
      }
    } else {
      // ── Case 1：末行过短（<20%），且上一行未以 、； 结尾 ──────────
      // 合并两行后重新在中点附近断开，使两行宽度更均衡
      const prevChar = prevLine.text[prevLine.text.length - 1]
      const prevEndedAtEnum = '、；'.includes(prevChar)
      const prevFillRatio = prevLine.widthPt / maxPt
      if (!prevEndedAtEnum && lastW < maxPt * 0.20 && prevFillRatio < 0.85) {
        const combined = prevLine.text + lastLine.text
        const combinedTokens: string[] = []
        buf = ''
        for (let i = 0; i < combined.length; i++) {
          const ch = combined[i]
          const isASCII = ch.charCodeAt(0) < 128
          if (isASCII) { buf += ch }
          else { if (buf) { combinedTokens.push(buf); buf = '' }; combinedTokens.push(ch) }
        }
        if (buf) combinedTokens.push(buf)

        const totalWidthMm = doc.getTextWidth(combined)
        const halfWidthMm = totalWidthMm / 2
        let accMm = 0
        let bestBreak = -1
        let bestDist = Infinity

        const startSearch = Math.floor(combinedTokens.length * 0.3)
        for (let i = startSearch; i < combinedTokens.length - 1; i++) {
          accMm += doc.getTextWidth(combinedTokens[i])
          const dist = Math.abs(accMm - halfWidthMm)
          if (dist < bestDist) { bestDist = dist; bestBreak = i }
        }

        if (bestBreak > 0 && bestBreak < combinedTokens.length - 1) {
          const newPrev = combinedTokens.slice(0, bestBreak + 1).join('')
          const newLast = combinedTokens.slice(bestBreak + 1).join('')
          lines[lines.length - 2] = { text: newPrev, widthPt: doc.getTextWidth(newPrev) / PT }
          lines[lines.length - 1] = { text: newLast, widthPt: doc.getTextWidth(newLast) / PT }
        }
      }
    }
  }

  return lines
}
