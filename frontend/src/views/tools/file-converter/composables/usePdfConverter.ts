import { ref } from 'vue'
import { jsPDF } from 'jspdf'
import { marked } from 'marked'

export interface PdfConversionResult {
  blob: Blob
  url: string
  filename: string
}

// ══════════════════════════════════════════════════════════════════════
//  All measurements in pt.  jsPDF with unit='mm':
//    setFontSize(pt)   — fontSize ALWAYS in pt
//    text(x_mm, y_mm)  — position in mm (y is text baseline)
//    splitTextToSize(str, max_width_mm) — width in mm
//    getTextWidth(str) — returns mm
//    line/rect/circle  — in mm
//  PT = 25.4/72
// ══════════════════════════════════════════════════════════════════════

const PT = 25.4 / 72

// Page
const PAGE_W_PT = 612
const PAGE_H_PT = 792

// Margins
const ML_PT = 42
const MR_PT = 42
const MT_PT = 61
const MB_PT = 42

const CW_PT = PAGE_W_PT - ML_PT - MR_PT  // 528pt

// Font sizes (pt)
const FS_H2    = 14.6
const FS_H3    = 11.4
const FS_BODY  =  9.8
const FS_TABLE =  9.8

// Line heights (pt)
const LH_BODY   = 15.5
const LH_H2     = 16.0
const LH_H3     = 24.4
const LH_TABLE  = 27.8

// Spacing (pt)
const GAP_BEFORE_H2    = 18.3
const GAP_H2_RULE       = 6.0   // baseline → rule (gap between text and rule line)
const GAP_H2_CONTENT    = 12.0  // rule → first content line
const GAP_BEFORE_H3     = 2.2
// After H2, non-table content (p, bullet, blockquote) needs extra spacing
// because LH_H2=16 accounts for table spacing; content needs 26pt baseline-to-baseline
const GAP_AFTER_H2_CONTENT = 10.0
const GAP_AFTER_TABLE   = 8.0
const BULLET_INDENT     = 19.5
const NESTED_INDENT     = 20.0  // extra indent per nesting level
const DOT_OFFSET        = 7.0
const DOT_RADIUS_PT     = 1.2

// Colors
const C_ACCENT  = [52, 73, 94]     as [number, number, number]
const C_TEXT    = [40, 40, 40]     as [number, number, number]
const C_MID     = [110, 110, 110]  as [number, number, number]
const C_BULLET  = [0, 0, 0]        as [number, number, number]
const C_LINE    = [185, 185, 185]  as [number, number, number]
const C_BG_TINT = [248, 248, 250]  as [number, number, number]

// Font paths
const FONT_REG  = '/fonts/NotoSansSC-Regular.ttf'
const FONT_BOLD = '/fonts/NotoSansSC-Bold.ttf'

// ── Block types ──────────────────────────────────────────────────────
interface Block {
  type: 'h2'|'h3'|'h4'|'paragraph'|'list_item'|'table'|'blockquote'|'space'
  text?: string
  ordered?: boolean
  depth?: number
}

function parseBlocks(md: string): Block[] {
  const tokens = marked.lexer(md)
  const blocks: Block[] = []

  function processList(listToken: any, depth: number) {
    for (const item of listToken.items) {
      let itemText = item.text
      // If item has a nested sub-list, collect only non-list tokens (text, paragraph, etc.)
      // to avoid duplicating sub-item content that will be rendered recursively.
      if (item.tokens) {
        const hasNestedList = item.tokens.some((t: any) => t.type === 'list')
        if (hasNestedList) {
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

      if (item.tokens) {
        for (const inner of item.tokens) {
          if (inner.type === 'list') {
            processList(inner, depth + 1)
          }
        }
      }
    }
  }

  for (const t of tokens) {
    switch (t.type) {
      case 'heading':
        blocks.push({ type: `h${Math.min(t.depth, 4)}` as Block['type'], text: t.text })
        break
      case 'paragraph':
        blocks.push({ type: 'paragraph', text: t.text })
        break
      case 'list':
        processList(t, 0)
        break
      case 'table': {
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
        blocks.push({ type: 'space' })
        break
    }
  }
  return blocks
}

function stripMD(s: string): string {
  return s
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/~~(.+?)~~/g, '$1')
    .replace(/<[^>]+>/g, '')
}

function ab2b64(buf: ArrayBuffer): string {
  let b = ''
  const bytes = new Uint8Array(buf)
  for (let i = 0; i < bytes.byteLength; i++) b += String.fromCharCode(bytes[i])
  return btoa(b)
}

// ── Safe line wrapping ────────────────────────────────────────────────
// jsPDF's splitTextToSize drops characters at CJK/ASCII boundaries.
// This function wraps text by accumulating character widths, guaranteeing
// zero character loss. Works with the doc already having the correct font set.
// Returns an array of { text: string, widthPt: number } lines.
// Preferred line-break positions: break after these characters when possible
const BREAK_AFTER = new Set(['、', '，', '；', '。', '）', '」', '』', '》', ' ', ',', ';', ')'])

function safeWrapText(doc: any, text: string, maxWidthMm: number): { text: string; widthPt: number }[] {
  if (!text) return []
  const lines: { text: string; widthPt: number }[] = []

  // Split text into tokens: each English word (with trailing space) is one token,
  // each CJK character is its own token. This prevents breaking English words.
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

  // Greedily pack tokens into lines, preferring to break at punctuation
  // When overflow occurs, look backwards for the punctuation break that produces
  // the most balanced line split (closest to half the total content width)
  let lineStart = 0
  let lineWidthMm = 0
  const punctBreaks: number[] = []  // indices of all punctuation break points in current line

  for (let i = 0; i < tokens.length; i++) {
    const tokW = doc.getTextWidth(tokens[i])
    const tokStr = tokens[i]
    if (tokStr && BREAK_AFTER.has(tokStr[tokStr.length - 1])) {
      punctBreaks.push(i)
    }

    if (lineWidthMm + tokW > maxWidthMm && i > lineStart) {
      // Find the best punctuation break: among 、 and ； breaks, choose the one
      // that fills the line to ~80% of capacity for a natural look.
      let breakAt = i  // default: break at overflow point
      const minBreakPos = lineStart + Math.floor((i - lineStart) * 0.25)
      const enumBreaks = punctBreaks.filter(p => p >= minBreakPos && p < i && '、；'.includes(tokens[p]))
      const validBreaks = enumBreaks.length > 0 ? enumBreaks : punctBreaks.filter(p => p >= minBreakPos && p < i)
      if (validBreaks.length > 0) {
        // Target: fill the line to ~80% of the max width
        const targetMm = maxWidthMm * 0.80
        let bestPunct = validBreaks[0]
        let bestDist = Infinity
        for (const p of validBreaks) {
          const lineUpToPunct = tokens.slice(lineStart, p + 1).reduce((s, t) => s + doc.getTextWidth(t), 0)
          const dist = Math.abs(lineUpToPunct - targetMm)
          if (dist < bestDist) {
            bestDist = dist
            bestPunct = p
          }
        }
        breakAt = bestPunct + 1
      }
      const lineText = tokens.slice(lineStart, breakAt).join('')
      const lineW = doc.getTextWidth(lineText)
      lines.push({ text: lineText, widthPt: lineW / PT })
      lineStart = breakAt
      lineWidthMm = 0
      for (let j = breakAt; j <= i; j++) {
        lineWidthMm += doc.getTextWidth(tokens[j])
      }
      punctBreaks.length = 0
    } else {
      lineWidthMm += tokW
    }
  }
  if (lineStart < tokens.length) {
    const lineText = tokens.slice(lineStart).join('')
    lines.push({ text: lineText, widthPt: doc.getTextWidth(lineText) / PT })
  }

  // Rebalance: if the last line is very short (< 20% of max) AND the previous line
  // didn't end at an enumeration comma (、；), try to pull content to even things out.
  // This avoids undoing good punctuation-based breaks from the greedy pass.
  if (lines.length >= 2) {
    const lastLine = lines[lines.length - 1]
    const prevLine = lines[lines.length - 2]
    const lastChar = prevLine.text[prevLine.text.length - 1]
    const prevEndedAtEnum = '、；'.includes(lastChar)
    if (!prevEndedAtEnum && lastLine.widthPt < maxWidthMm / PT * 0.20) {
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

  return lines
}

// ── Inline segment parser ───────────────────────────────────────────
interface Seg { text: string; bold: boolean }

function parseSegments(raw: string): Seg[] {
  const segs: Seg[] = []
  const re = /\*\*(.+?)\*\*|\*(.+?)\*/g
  let last = 0, m: RegExpExecArray | null
  while ((m = re.exec(raw)) !== null) {
    if (m.index > last) segs.push({ text: raw.slice(last, m.index), bold: false })
    if (m[1]) segs.push({ text: m[1], bold: true })
    else if (m[2]) segs.push({ text: m[2], bold: false })
    last = m.index + m[0].length
  }
  if (last < raw.length) segs.push({ text: raw.slice(last), bold: false })
  return segs.length ? segs : [{ text: raw, bold: false }]
}

// ══════════════════════════════════════════════════════════════════════
//  PDF Builder
// ══════════════════════════════════════════════════════════════════════
class Builder {
  private doc: jsPDF
  private y: number = MT_PT
  private pages = 1
  private fontsOK = false
  public fontError: string | null = null

  constructor() {
    this.doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [PAGE_W_PT * PT, PAGE_H_PT * PT] })
  }

  async loadFonts() {
    if (this.fontsOK) return
    try {
      const [r, b] = await Promise.all([
        fetch(FONT_REG).then(x => x.arrayBuffer()),
        fetch(FONT_BOLD).then(x => x.arrayBuffer()),
      ])
      this.doc.addFileToVFS('reg.ttf', ab2b64(r))
      this.doc.addFont('reg.ttf', 'SH', 'normal')
      this.doc.addFileToVFS('bold.ttf', ab2b64(b))
      this.doc.addFont('bold.ttf', 'SH', 'bold')
      this.fontsOK = true
    } catch (e: any) {
      this.fontError = e.message || 'Unknown error'
      console.warn('CJK font load failed', e)
      this.fontsOK = false
    }
  }

  private font(bold: boolean) {
    try { this.doc.setFont('SH', bold ? 'bold' : 'normal') }
    catch { this.doc.setFont('Helvetica', bold ? 'bold' : 'normal') }
  }

  private mm(pt: number): number {
    return pt * PT
  }

  private need(pt: number) {
    if (this.y + pt > PAGE_H_PT - MB_PT) {
      this.doc.addPage()
      this.pages++
      this.y = MT_PT
    }
  }

  // ── Wrapped rich text with inline bold + hanging indent ────────────
  // All lines (incl. wrapped) start at the same xPt.
  // Handles **bold** across line breaks.
  // Uses safeWrapText to avoid jsPDF splitTextToSize character-loss bug.
  private wrappedRichTextBold(raw: string, xPt: number, maxWidthPt: number, fontSizePt: number, color: [number, number, number]): number {
    const segs = parseSegments(raw)
    this.doc.setFontSize(fontSizePt)
    this.doc.setTextColor(...color)

    const plain = segs.map(s => s.text).join('')
    const wrapLines = safeWrapText(this.doc, plain, this.mm(maxWidthPt))

    let segIdx = 0
    let segCharOff = 0
    let lineCount = 0

    for (const wrapLine of wrapLines) {
      this.need(LH_BODY)
      let cx = this.mm(xPt)
      let remaining = wrapLine.text

      while (remaining.length > 0 && segIdx < segs.length) {
        const seg = segs[segIdx]
        const segRemain = seg.text.length - segCharOff
        const take = Math.min(remaining.length, segRemain)

        const part = seg.text.slice(segCharOff, segCharOff + take)
        this.font(seg.bold)
        this.doc.text(part, cx, this.mm(this.y))
        cx += this.doc.getTextWidth(part)
        segCharOff += take
        remaining = remaining.slice(take)

        if (segCharOff >= seg.text.length) {
          segIdx++
          segCharOff = 0
        }
      }

      this.y += LH_BODY
      lineCount++
    }

    return lineCount
  }

  // ── Personal info: render as multi-row table with borders ────────────
  private personalInfo(headers: string[], rows: string[][]) {
    const infoRowH = 22  // compact row height for personal info
    this.need(infoRowH * rows.length + 8)

    const colN = headers.length
    const colW = CW_PT / colN
    const tableX = ML_PT
    const tableW = CW_PT
    const tableH = infoRowH * rows.length

    // Draw table header background
    this.doc.setFillColor(232, 236, 240)
    this.doc.rect(this.mm(tableX), this.mm(this.y), this.mm(tableW), this.mm(infoRowH), 'F')

    // Draw outer border
    this.doc.setDrawColor(...C_LINE)
    this.doc.setLineWidth(0.3 * PT)
    this.doc.rect(this.mm(tableX), this.mm(this.y), this.mm(tableW), this.mm(tableH))

    // Draw vertical inner separators
    this.doc.setLineWidth(0.15 * PT)
    for (let c = 1; c < colN; c++) {
      const x = tableX + c * colW
      this.doc.line(this.mm(x), this.mm(this.y), this.mm(x), this.mm(this.y + tableH))
    }

    // Draw horizontal row separators
    for (let r = 1; r < rows.length; r++) {
      const ry = this.y + r * infoRowH
      this.doc.line(this.mm(tableX), this.mm(ry), this.mm(tableX + tableW), this.mm(ry))
    }

    // Render text
    for (let r = 0; r < rows.length; r++) {
      const textY = this.y + infoRowH / 2 + FS_BODY * 0.35
      for (let c = 0; c < colN; c++) {
        const val = stripMD(rows[r]?.[c] || '')
        if (val) {
          this.doc.setFontSize(FS_BODY)
          this.doc.setTextColor(...C_TEXT)
          if (r === 0) this.font(true)  // header row bold
          else this.font(false)
          this.doc.text(val, this.mm(tableX + c * colW + colW / 2), this.mm(textY), { align: 'center' })
        }
      }
      this.y += infoRowH
    }

    this.y += 18  // extra space after personal info table before next content
  }

  // ── h2: large bold title with accent rule ──────────────────────────
  private h2(text: string) {
    if (this.y > MT_PT) this.y += GAP_BEFORE_H2

    this.need(LH_H2 + GAP_H2_RULE + GAP_H2_CONTENT + LH_BODY)
    this.font(true)
    this.doc.setFontSize(FS_H2)
    this.doc.setTextColor(...C_ACCENT)

    const plain = stripMD(text)
    this.doc.text(plain, this.mm(ML_PT), this.mm(this.y))
    this.y += LH_H2

    // Draw accent rule below title
    const ruleY = this.y + GAP_H2_RULE
    this.doc.setDrawColor(...C_ACCENT)
    this.doc.setLineWidth(1.2 * PT)
    this.doc.line(
      this.mm(ML_PT),
      this.mm(ruleY),
      this.mm(ML_PT + CW_PT),
      this.mm(ruleY),
    )
    // Position y below the rule with gap before next content
    this.y = ruleY + GAP_H2_CONTENT
  }

  // ── h3 / h4 ───────────────────────────────────────────────────────
  private h3(text: string) {
    this.need(GAP_BEFORE_H3 + LH_H3)
    this.y += GAP_BEFORE_H3

    this.font(true)
    this.doc.setFontSize(FS_H3)
    this.doc.setTextColor(...C_TEXT)

    const plain = stripMD(text)
    const wrapLines = safeWrapText(this.doc, plain, this.mm(CW_PT))
    for (const wrapLine of wrapLines) {
      this.doc.text(wrapLine.text, this.mm(ML_PT), this.mm(this.y))
      this.y += LH_H3
    }
  }

  // ── Paragraph ─────────────────────────────────────────────────────
  private p(text: string) {
    this.wrappedRichTextBold(text, ML_PT, CW_PT, FS_BODY, C_TEXT)
  }

  // ── Multi-column inline text: render segments at different X on same Y ──
  // Used for **label**：content patterns (2-col) and 方案/结果 (4-col).
  // segments: [{text, bold, xPt, maxWidthPt}]
  // Returns the number of wrapped lines consumed.
  private wrappedMultiCol(segments: { text: string; bold: boolean; xPt: number; maxWidthPt: number }[], fontSizePt: number, color: [number, number, number]): number {
    if (segments.length === 0) return 0

    this.doc.setFontSize(fontSizePt)
    this.doc.setTextColor(...color)

    // For each segment, pre-compute wrap lines using safe wrapping
    const segLines: { text: string; bold: boolean; xPt: number }[][] = []
    for (const seg of segments) {
      const plain = seg.text
      const wrapLines = safeWrapText(this.doc, plain, this.mm(seg.maxWidthPt))
      segLines.push(wrapLines.map(wl => ({ text: wl.text, bold: seg.bold, xPt: seg.xPt })))
    }

    // All segments have the same number of wrap lines (they're on the same Y)
    // Actually, each segment wraps independently. We need to render line-by-line.
    const maxLines = Math.max(...segLines.map(sl => sl.length))

    for (let lineIdx = 0; lineIdx < maxLines; lineIdx++) {
      this.need(LH_BODY)
      for (const sl of segLines) {
        if (lineIdx < sl.length && sl[lineIdx].text) {
          const { text, bold, xPt } = sl[lineIdx]
          this.font(bold)
          this.doc.text(text, this.mm(xPt), this.mm(this.y))
        }
      }
      this.y += LH_BODY
    }

    return maxLines
  }

  // ── Inline label pattern: **label**：content → label and content on same Y ──
  // The bold label is rendered at xPt, content starts right after label text ends.
  // The content portion may contain additional **bold** inline markers (e.g. **结果**).
  // Uses segment-aware wrapping to avoid splitting ** markers across lines.
  private bulletInlineLabel(text: string, xPt: number, maxWidthPt: number, fontSizePt: number, color: [number, number, number]) {
    // Parse **label**：content — use [^*]+ to prevent matching across ** boundaries
    const m = text.match(/^\*\*([^*]+)\*\*：(.+)$/)
    if (!m) {
      this.wrappedRichTextBold(text, xPt, maxWidthPt, fontSizePt, color)
      return
    }

    const label = m[1]
    const content = '：' + m[2]

    // Measure bold label width
    this.font(true)
    this.doc.setFontSize(fontSizePt)
    const labelW = this.doc.getTextWidth(label) / PT
    const contentX = xPt + labelW
    const contentMaxW = maxWidthPt - labelW

    // Parse content into segments for bold-aware rendering
    const contentSegs = parseSegments(content)

    // Build plain text from content segments for safe wrapping
    const contentPlain = contentSegs.map(s => s.text).join('')
    const contentWrapLines = safeWrapText(this.doc, contentPlain, this.mm(contentMaxW))

    // Render first line: label (bold) + content start
    this.need(LH_BODY)
    this.doc.setFontSize(fontSizePt)
    this.doc.setTextColor(...color)

    // Draw label
    this.font(true)
    this.doc.text(label, this.mm(xPt), this.mm(this.y))

    // Draw content on remaining lines using segment-aware rendering
    let segIdx = 0
    let segCharOff = 0

    for (let lineIdx = 0; lineIdx < contentWrapLines.length; lineIdx++) {
      if (lineIdx > 0) {
        this.need(LH_BODY)
      }

      // First line: content starts after label. Wrapped lines: align with text start (hanging indent).
      const lineX = lineIdx === 0 ? contentX : xPt
      let cx = this.mm(lineX)
      let remaining = contentWrapLines[lineIdx].text

      while (remaining.length > 0 && segIdx < contentSegs.length) {
        const seg = contentSegs[segIdx]
        const segRemain = seg.text.length - segCharOff
        const take = Math.min(remaining.length, segRemain)

        const part = seg.text.slice(segCharOff, segCharOff + take)
        this.font(seg.bold)
        this.doc.text(part, cx, this.mm(this.y))
        cx += this.doc.getTextWidth(part)
        segCharOff += take
        remaining = remaining.slice(take)

        if (segCharOff >= seg.text.length) {
          segIdx++
          segCharOff = 0
        }
      }

      this.y += LH_BODY
    }

    // If content was empty, still advance Y
    if (contentWrapLines.length === 0) {
      this.need(LH_BODY)
      this.y += LH_BODY
    }
  }

  // ── Bullet item ───────────────────────────────────────────────────
  // Dot centered with first text line. All wrapped lines → same x (hanging indent).
  // Supports multi-column patterns:
  //   - **label**：content → inline 2-column (label bold, content follows on same Y)
  //   - depth >= 2 with **title**：desc...**方案**：...**结果**：... → 4-column
  private bullet(text: string, ordered: boolean, depth: number = 0) {
    const extraIndent = depth * NESTED_INDENT
    const bulletX = ML_PT + extraIndent
    const textX = bulletX + BULLET_INDENT
    const availW = CW_PT - extraIndent - BULLET_INDENT

    if (ordered) {
      const num = text.match(/^(\d+\.\s*)/)?.[1] || ''
      const rest = text.replace(/^\d+\.\s*/, '')

      this.need(LH_BODY)
      this.font(false)
      this.doc.setFontSize(FS_BODY)
      this.doc.setTextColor(...C_TEXT)
      this.doc.text(num, this.mm(bulletX), this.mm(this.y))
      const numW = this.doc.getTextWidth(num) / PT

      this.wrappedRichTextBold(rest, bulletX + numW + 1.5, availW - numW - 1.5, FS_BODY, C_TEXT)
    } else {
      // Check for 4-column pattern (depth >= 2 with **title**：desc...**方案**：...**结果**：...)
      if (depth >= 2 && text.startsWith('**') && text.includes('**：') && text.includes('**方案**：')) {
        this.bulletFourColFull(text, FS_BODY, C_TEXT, depth)
        return
      }

      // Check for inline label pattern: **label**：content
      // Use [^*]+ to prevent lazy expansion across ** boundaries
      if (text.match(/^\*\*([^*]+)\*\*：/)) {
        this.need(LH_BODY)
        const dotCenterY = this.y - 3.5
        this.doc.setFillColor(...C_BULLET)
        this.doc.circle(
          this.mm(bulletX + DOT_OFFSET),
          this.mm(dotCenterY),
          DOT_RADIUS_PT * PT,
          'F'
        )
        this.bulletInlineLabel(text, textX, availW, FS_BODY, C_TEXT)
        return
      }

      // Regular bullet
      this.need(LH_BODY)
      const dotCenterY = this.y - 3.5
      this.doc.setFillColor(...C_BULLET)
      this.doc.circle(
        this.mm(bulletX + DOT_OFFSET),
        this.mm(dotCenterY),
        DOT_RADIUS_PT * PT,
        'F'
      )
      this.wrappedRichTextBold(text, textX, availW, FS_BODY, C_TEXT)
    }
  }

  // ── Full 4-column renderer for 技术难点 sub-items ──
  // Renders title, desc, 方案, 结果 sharing Y lines
  private bulletFourColFull(text: string, fontSizePt: number, color: [number, number, number], depth: number = 2) {
    // Parse: **title**：desc... **方案**：plan... **结果**：result...
    const re = /^\*\*(.+?)\*\*：(.+?)(\*\*方案\*\*：(.+?))?(\*\*结果\*\*：(.+))?$/
    const m = text.match(re)
    const extraIndent = depth * NESTED_INDENT + BULLET_INDENT
    if (!m) {
      this.wrappedRichTextBold(text, ML_PT + extraIndent, CW_PT - extraIndent, fontSizePt, color)
      return
    }

    const title = m[1]
    const desc = '：' + m[2]
    const planText = m[4] ? '：' + m[4] : null
    const resultText = m[6] ? '：' + m[6] : null

    // Column layout: title (dynamic) | desc (flex) | 方案 (fixed) | 结果 (fixed)
    const areaLeft = ML_PT + extraIndent
    const areaRight = ML_PT + CW_PT
    const areaW = areaRight - areaLeft  // total available width

    this.doc.setFontSize(fontSizePt)
    this.doc.setTextColor(...color)

    // Measure title width (bold)
    this.font(true)
    const titleW = this.doc.getTextWidth(title) / PT
    const titleX = areaLeft
    const descX = areaLeft + titleW

    // Fixed column widths for 方案 and 结果 (each gets ~38% of remaining space)
    const rightColW = areaW * 0.38  // each right column
    const planLabelX = areaRight - rightColW * 2 - 2  // 方案 starts 2 gaps from right edge
    const resultLabelX = areaRight - rightColW          // 结果 starts 1 gap from right edge

    // Compute available widths for each column
    const descAvailW = planLabelX - descX - 4
    const planAvailW = resultLabelX - planLabelX - 4
    const resultAvailW = areaRight - resultLabelX - 2

    // Split desc into wrap lines
    this.font(false)
    const descLines = desc ? safeWrapText(this.doc, desc, this.mm(Math.max(descAvailW, 10))) : []

    // Split plan content (方案 label + content share the column)
    const planLabelW = this.doc.getTextWidth('方案') / PT
    const planContentAvailW = planAvailW - planLabelW - 2
    const planContentLines = planText ? safeWrapText(this.doc, planText, this.mm(Math.max(planContentAvailW, 10))) : []

    // Split result content
    const resultLabelW = this.doc.getTextWidth('结果') / PT
    const resultContentAvailW = resultAvailW - resultLabelW - 2
    const resultContentLines = resultText ? safeWrapText(this.doc, resultText, this.mm(Math.max(resultContentAvailW, 10))) : []

    // Total lines = max of all content blocks
    const totalLines = Math.max(descLines.length, planContentLines.length + 1, resultContentLines.length + 1, 1)

    for (let i = 0; i < totalLines; i++) {
      this.need(LH_BODY)

      if (i === 0) {
        // First line: title (bold) + desc start + 方案 label (bold) + 结果 label (bold)
        this.font(true)
        this.doc.text(title, this.mm(titleX), this.mm(this.y))

        if (descLines.length > 0) {
          this.font(false)
          this.doc.text(descLines[0].text, this.mm(descX), this.mm(this.y))
        }

        this.font(true)
        if (planText) this.doc.text('方案', this.mm(planLabelX), this.mm(this.y))
        if (resultText) this.doc.text('结果', this.mm(resultLabelX), this.mm(this.y))
      } else {
        // Subsequent lines: desc continue, plan content, result content
        const descIdx = i
        const planIdx = i - 1  // plan content starts on line 2
        const resultIdx = i - 1

        if (descIdx < descLines.length) {
          this.font(false)
          this.doc.text(descLines[descIdx].text, this.mm(descX), this.mm(this.y))
        }

        if (planIdx >= 0 && planIdx < planContentLines.length) {
          this.font(false)
          this.doc.text(planContentLines[planIdx].text, this.mm(planLabelX + planLabelW + 2), this.mm(this.y))
        }

        if (resultIdx >= 0 && resultIdx < resultContentLines.length) {
          this.font(false)
          this.doc.text(resultContentLines[resultIdx].text, this.mm(resultLabelX + resultLabelW + 2), this.mm(this.y))
        }
      }

      this.y += LH_BODY
    }
  }

  // ── Table ─────────────────────────────────────────────────────────
  private table(headers: string[], rows: string[][]) {
    const colN = headers.length
    const colW = CW_PT / colN

    const renderHeader = (yStart: number) => {
      this.doc.setFillColor(232, 236, 240)
      this.doc.rect(this.mm(ML_PT), this.mm(yStart), this.mm(CW_PT), this.mm(LH_TABLE), 'F')

      this.font(true)
      this.doc.setFontSize(FS_TABLE)
      this.doc.setTextColor(...C_TEXT)

      const textY = yStart + LH_TABLE / 2 + FS_TABLE * 0.60
      for (let c = 0; c < colN; c++) {
        const t = safeWrapText(this.doc, stripMD(headers[c]), this.mm(colW - 4))
        this.doc.text(t.length ? t[0].text : '', this.mm(ML_PT + c * colW + colW / 2), this.mm(textY), { align: 'center' })
      }
    }

    const startTable = (yStart: number) => {
      renderHeader(yStart)
      return yStart + LH_TABLE
    }

    // Check if table header + at least one row fits on current page
    if (this.y + LH_TABLE * 2 > PAGE_H_PT - MB_PT) {
      this.doc.addPage()
      this.pages++
      this.y = MT_PT
    }

    this.y = startTable(this.y)

    this.font(false)
    this.doc.setFontSize(FS_TABLE)
    this.doc.setTextColor(...C_TEXT)

    for (let r = 0; r < rows.length; r++) {
      if (this.y + LH_TABLE > PAGE_H_PT - MB_PT) {
        this.doc.addPage()
        this.pages++
        this.y = MT_PT
        this.y = startTable(this.y)
        this.font(false)
        this.doc.setFontSize(FS_TABLE)
        this.doc.setTextColor(...C_TEXT)
      }

      if (r % 2 === 1) {
        this.doc.setFillColor(...C_BG_TINT)
        this.doc.rect(this.mm(ML_PT), this.mm(this.y), this.mm(CW_PT), this.mm(LH_TABLE), 'F')
      }

      const textY = this.y + LH_TABLE / 2 + FS_TABLE * 0.60
      for (let c = 0; c < colN; c++) {
        const t = safeWrapText(this.doc, stripMD(rows[r]?.[c] || ''), this.mm(colW - 4))
        this.doc.text(t.length ? t[0].text : '', this.mm(ML_PT + c * colW + colW / 2), this.mm(textY), { align: 'center' })
      }
      this.y += LH_TABLE
    }

    const tableH = LH_TABLE * (1 + rows.length)
    this.doc.setDrawColor(...C_LINE)
    this.doc.setLineWidth(0.15 * PT)
    this.doc.rect(this.mm(ML_PT), this.mm(this.y - tableH), this.mm(CW_PT), this.mm(tableH))

    for (let c = 1; c < colN; c++) {
      const x = ML_PT + c * colW
      this.doc.line(this.mm(x), this.mm(this.y - tableH), this.mm(x), this.mm(this.y))
    }

    this.y += GAP_AFTER_TABLE
  }

  // ── Blockquote ────────────────────────────────────────────────────
  private bq(text: string) {
    const lineCount = this.wrappedRichTextBold(text, ML_PT + 4, CW_PT - 6, FS_BODY, C_MID)
    const barTop = this.y - LH_BODY * lineCount
    const barH = LH_BODY * lineCount
    const barW = 1.2 * PT
    this.doc.setFillColor(...C_ACCENT)
    this.doc.rect(this.mm(ML_PT), this.mm(barTop), barW, this.mm(barH), 'F')
  }

  // ── Main render ───────────────────────────────────────────────────
  async render(blocks: Block[]) {
    await this.loadFonts()

    // Scan for personal info table (first table with personal field headers)
    // May not be blocks[0] — there could be a space token between h2 and table
    let personalInfoData: { headers: string[]; rows: string[][] } | null = null
    let personalInfoIdx = -1
    for (let j = 0; j < blocks.length; j++) {
      if (blocks[j].type === 'table') {
        try {
          const d = JSON.parse(blocks[j].text || '{}')
          const headers: string[] = d.headers || []
          if (headers.some((h: string) => h.includes('姓名') || h.includes('性别') || h.includes('联系方式'))) {
            // The "header" row is actually data (name/gender/origin), prepend it to rows
            personalInfoData = { headers, rows: [headers, ...(d.rows || [])] }
            personalInfoIdx = j
            break
          }
        } catch { /* ignore */ }
      }
    }

    for (let i = 0; i < blocks.length; i++) {
      // Skip the personal info table block and adjacent space blocks
      if (i === personalInfoIdx) continue
      if (blocks[i].type === 'space' && (i === personalInfoIdx - 1 || i === personalInfoIdx + 1)) continue
      const b = blocks[i]

      if (b.type === 'h2') {
        this.h2(b.text || '')
        if (b.text === '个人信息' && personalInfoData) {
          this.personalInfo(personalInfoData.headers, personalInfoData.rows)
          personalInfoData = null
        }
      } else if (b.type === 'h3' || b.type === 'h4') {
        this.h3(b.text || '')
      } else if (b.type === 'paragraph') {
        this.p(b.text || '')
      } else if (b.type === 'list_item') {
        this.bullet(b.text || '', b.ordered || false, b.depth || 0)
      } else if (b.type === 'table') {
        const d = JSON.parse(b.text || '{}')
        this.table(d.headers || [], d.rows || [])
      } else if (b.type === 'blockquote') {
        this.bq(b.text || '')
      } else if (b.type === 'space') {
        this.y += 6
      }
    }
  }

  output(filename: string): PdfConversionResult {
    return {
      blob: this.doc.output('blob'),
      url: URL.createObjectURL(this.doc.output('blob')),
      filename,
    }
  }
}

// ══════════════════════════════════════════════════════════════════════
//  Public composable
// ══════════════════════════════════════════════════════════════════════
export function usePdfConverter() {
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
