/**
 * PDF 渲染器模块（Builder 类）
 *
 * 职责：管理 jsPDF 实例，维护当前 Y 坐标和页面状态，
 * 将 Block 数组逐块渲染为 PDF 内容。
 *
 * 渲染的块类型包括：
 *   - h2/h3/h4 标题
 *   - 段落（支持行内粗体、URL 链接）
 *   - 列表项（无序/有序、嵌套、行内标签、四列模式）
 *   - 表格（个人信息表格/普通表格、斑马纹、跨页）
 *   - 引用块
 */

import { jsPDF } from 'jspdf'
import type { Block, PdfConversionResult } from './types'
import {
  PT, PAGE_W_PT, PAGE_H_PT, ML_PT, MT_PT, MB_PT, CW_PT,
  FS_H2, FS_H3, FS_BODY, FS_TABLE,
  LH_BODY, LH_H2, LH_H3, LH_TABLE,
  GAP_BEFORE_H2, GAP_H2_RULE, GAP_H2_CONTENT, GAP_BEFORE_H3,
  GAP_AFTER_H2_CONTENT, GAP_AFTER_TABLE,
  BULLET_INDENT, NESTED_INDENT, DOT_OFFSET, DOT_RADIUS_PT,
  C_ACCENT, C_TEXT, C_MID, C_BULLET, C_LINE, C_BG_TINT,
  FONT_REG, FONT_BOLD,
} from './constants'
import { stripMD } from './markdown-parser'
import { safeWrapText, parseSegments, ab2b64 } from './text-wrapper'

export class Builder {
  private doc: jsPDF
  /** 当前 Y 坐标（pt，基线位置） */
  private y: number = MT_PT
  /** 当前页数 */
  private pages = 1
  /** CJK 字体是否已加载 */
  private fontsOK = false
  /** 上一个渲染的块是否为 h2（用于控制 h2 后的额外间距） */
  private prevWasH2 = false
  /** 字体加载失败时的错误信息 */
  public fontError: string | null = null

  constructor() {
    this.doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [PAGE_W_PT * PT, PAGE_H_PT * PT] })
  }

  // ── 字体管理 ────────────────────────────────────────────────────────

  /**
   * 加载 CJK 字体（NotoSansSC 常规体 + 粗体）。
   * 通过 fetch 下载字体文件 → ArrayBuffer → Base64 → addFileToVFS → addFont。
   * 加载失败时降级为 Helvetica，并记录错误信息。
   */
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

  /**
   * 设置字体。优先使用 SH（NotoSansSC），失败时降级为 Helvetica。
   */
  private font(bold: boolean) {
    try { this.doc.setFont('SH', bold ? 'bold' : 'normal') }
    catch { this.doc.setFont('Helvetica', bold ? 'bold' : 'normal') }
  }

  // ── 工具方法 ────────────────────────────────────────────────────────

  /** pt → mm 转换 */
  private mm(pt: number): number {
    return pt * PT
  }

  /** 检查剩余空间是否足够，不足时自动翻页 */
  private need(pt: number) {
    if (this.y + pt > PAGE_H_PT - MB_PT) {
      this.doc.addPage()
      this.pages++
      this.y = MT_PT
    }
  }

  // ── 富文本渲染（支持行内粗体 + URL 链接）────────────────────────────
  // 所有换行（包括自动换行）从相同的 xPt 开始。
  // 使用 safeWrapText 避免 jsPDF splitTextToSize 丢字符的问题。
  // 通过 segment-aware 渲染保证 **bold** 和 URL 标记在换行处不丢失。

  /**
   * 渲染含行内标记的富文本。
   * @returns 渲染的行数
   */
  private wrappedRichTextBold(raw: string, xPt: number, maxWidthPt: number, fontSizePt: number, color: [number, number, number]): number {
    const segs = parseSegments(raw)
    this.doc.setFontSize(fontSizePt)

    const plain = segs.map(s => s.text).join('')
    const wrapLines = safeWrapText(this.doc, plain, this.mm(maxWidthPt))

    let segIdx = 0       // 当前片段索引
    let segCharOff = 0   // 当前片段内的字符偏移
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
        if (seg.link) {
          // URL 链接：蓝色 + 下划线 + 可点击
          this.doc.setTextColor(0, 80, 200)
          this.doc.setFont('SH', 'normal')
          this.doc.text(part, cx, this.mm(this.y))
          const tw = this.doc.getTextWidth(part)
          this.doc.setDrawColor(0, 80, 200)
          this.doc.setLineWidth(0.3 * PT)
          this.doc.line(cx, this.mm(this.y + 0.8), cx + tw, this.mm(this.y + 0.8))
          this.doc.link(cx, this.mm(this.y - fontSizePt * PT * 0.8), tw, this.mm(fontSizePt * PT), { url: seg.link })
          cx += tw
        } else {
          this.doc.setTextColor(...color)
          this.font(seg.bold)
          this.doc.text(part, cx, this.mm(this.y))
          cx += this.doc.getTextWidth(part)
        }
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

  // ── 个人信息表格渲染 ──────────────────────────────────────────────
  // 检测条件：表头包含"姓名"/"性别"/"联系方式"关键词。
  // 渲染为带边框的多行表格，首行作为表头（灰色背景 + 粗体），居中对齐。

  private personalInfo(headers: string[], rows: string[][]) {
    const infoRowH = 22  // 个人信息表格使用更紧凑的行高
    this.need(infoRowH * rows.length + 8)

    const colN = headers.length
    const colW = CW_PT / colN
    const tableX = ML_PT
    const tableW = CW_PT
    const tableH = infoRowH * rows.length

    // 绘制表头背景
    this.doc.setFillColor(232, 236, 240)
    this.doc.rect(this.mm(tableX), this.mm(this.y), this.mm(tableW), this.mm(infoRowH), 'F')

    // 外边框
    this.doc.setDrawColor(...C_LINE)
    this.doc.setLineWidth(0.3 * PT)
    this.doc.rect(this.mm(tableX), this.mm(this.y), this.mm(tableW), this.mm(tableH))

    // 列分隔线
    this.doc.setLineWidth(0.15 * PT)
    for (let c = 1; c < colN; c++) {
      const x = tableX + c * colW
      this.doc.line(this.mm(x), this.mm(this.y), this.mm(x), this.mm(this.y + tableH))
    }

    // 行分隔线
    for (let r = 1; r < rows.length; r++) {
      const ry = this.y + r * infoRowH
      this.doc.line(this.mm(tableX), this.mm(ry), this.mm(tableX + tableW), this.mm(ry))
    }

    // 渲染文字（居中对齐）
    for (let r = 0; r < rows.length; r++) {
      const textY = this.y + infoRowH / 2 + FS_BODY * 0.35
      for (let c = 0; c < colN; c++) {
        const val = stripMD(rows[r]?.[c] || '')
        if (val) {
          this.doc.setFontSize(FS_BODY)
          this.doc.setTextColor(...C_TEXT)
          if (r === 0) this.font(true)  // 表头加粗
          else this.font(false)
          this.doc.text(val, this.mm(tableX + c * colW + colW / 2), this.mm(textY), { align: 'center' })
        }
      }
      this.y += infoRowH
    }

    this.y += 18  // 个人信息表格后的额外间距
  }

  // ── h2 标题：大字号粗体 + 底部强调分隔线 ──────────────────────────

  private h2(text: string) {
    if (this.y > MT_PT) this.y += GAP_BEFORE_H2

    this.need(LH_H2 + GAP_H2_RULE + GAP_H2_CONTENT + LH_BODY)
    this.font(true)
    this.doc.setFontSize(FS_H2)
    this.doc.setTextColor(...C_ACCENT)

    const plain = stripMD(text)
    this.doc.text(plain, this.mm(ML_PT), this.mm(this.y))
    this.y += LH_H2

    // 绘制底部强调分隔线
    const ruleY = this.y + GAP_H2_RULE
    this.doc.setDrawColor(...C_ACCENT)
    this.doc.setLineWidth(1.2 * PT)
    this.doc.line(
      this.mm(ML_PT),
      this.mm(ruleY),
      this.mm(ML_PT + CW_PT),
      this.mm(ruleY),
    )
    this.y = ruleY + GAP_H2_CONTENT
    this.prevWasH2 = true  // 标记：下一个非表格内容需要额外间距
  }

  // ── h3 / h4 标题 ──────────────────────────────────────────────────

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

  // ── 段落 ──────────────────────────────────────────────────────────

  private p(text: string) {
    this.wrappedRichTextBold(text, ML_PT, CW_PT, FS_BODY, C_TEXT)
  }

  // ── 多列同行渲染 ──────────────────────────────────────────────────
  // 用于 **label**：content（两列）和 方案/结果（四列）模式。
  // 每个 segment 独立换行，按行索引逐行渲染，保证同行内容 Y 坐标一致。

  private wrappedMultiCol(segments: { text: string; bold: boolean; xPt: number; maxWidthPt: number }[], fontSizePt: number, color: [number, number, number]): number {
    if (segments.length === 0) return 0

    this.doc.setFontSize(fontSizePt)
    this.doc.setTextColor(...color)

    // 对每个 segment 独立做换行计算
    const segLines: { text: string; bold: boolean; xPt: number }[][] = []
    for (const seg of segments) {
      const wrapLines = safeWrapText(this.doc, seg.text, this.mm(seg.maxWidthPt))
      segLines.push(wrapLines.map(wl => ({ text: wl.text, bold: seg.bold, xPt: seg.xPt })))
    }

    // 逐行渲染：每行遍历所有 segment
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

  // ── 行内标签模式：**label**：content ──────────────────────────────
  // 粗体标签和正文内容在同一行开始。
  // 首行内容区域较窄（减去标签宽度），后续换行使用完整行宽。
  // 支持 content 中包含额外的 **bold** 行内标记和 URL 链接。

  private bulletInlineLabel(text: string, xPt: number, maxWidthPt: number, fontSizePt: number, color: [number, number, number]) {
    // 解析 **label**：content 格式（[^*]+ 防止跨 ** 边界匹配）
    const m = text.match(/^\*\*([^*]+)\*\*：(.+)$/)
    if (!m) {
      this.wrappedRichTextBold(text, xPt, maxWidthPt, fontSizePt, color)
      return
    }

    const label = m[1]
    const content = '：' + m[2]

    // 测量粗体标签宽度，计算内容起始位置
    this.font(true)
    this.doc.setFontSize(fontSizePt)
    const labelW = this.doc.getTextWidth(label) / PT
    const contentX = xPt + labelW
    const contentMaxW = maxWidthPt - labelW

    // 解析内容中的行内标记
    const contentSegs = parseSegments(content)
    const contentPlain = contentSegs.map(s => s.text).join('')

    // 双通道换行：首行用窄宽度（标签后），剩余文本用完整宽度
    const firstLineLines = safeWrapText(this.doc, contentPlain, this.mm(contentMaxW))
    let contentWrapLines: { text: string; widthPt: number }[]

    if (firstLineLines.length > 1) {
      // 首行溢出 → 取第一行，剩余部分用完整宽度重新换行
      const firstLineText = firstLineLines[0].text
      const remainingPlain = contentPlain.slice(firstLineText.length)
      const restLines = remainingPlain
        ? safeWrapText(this.doc, remainingPlain, this.mm(maxWidthPt))
        : []
      contentWrapLines = [
        firstLineText ? { text: firstLineText, widthPt: this.doc.getTextWidth(firstLineText) / PT } : { text: '', widthPt: 0 },
        ...restLines,
      ]
    } else {
      contentWrapLines = firstLineLines
    }

    // 渲染首行：标签（粗体）+ 内容起始部分
    this.need(LH_BODY)
    this.doc.setFontSize(fontSizePt)
    this.doc.setTextColor(...color)

    this.font(true)
    this.doc.text(label, this.mm(xPt), this.mm(this.y))

    // 逐行渲染内容（segment-aware，处理粗体和链接跨行）
    let segIdx = 0
    let segCharOff = 0

    for (let lineIdx = 0; lineIdx < contentWrapLines.length; lineIdx++) {
      if (lineIdx > 0) {
        this.need(LH_BODY)
      }
      // 首行内容从标签后开始，后续行从行首开始（悬挂缩进效果）
      const lineX = lineIdx === 0 ? contentX : xPt
      let cx = this.mm(lineX)
      let remaining = contentWrapLines[lineIdx].text

      while (remaining.length > 0 && segIdx < contentSegs.length) {
        const seg = contentSegs[segIdx]
        const segRemain = seg.text.length - segCharOff
        const take = Math.min(remaining.length, segRemain)

        const part = seg.text.slice(segCharOff, segCharOff + take)
        if (seg.link) {
          this.doc.setTextColor(0, 80, 200)
          this.doc.setFont('SH', 'normal')
          this.doc.text(part, cx, this.mm(this.y))
          const tw = this.doc.getTextWidth(part)
          this.doc.setDrawColor(0, 80, 200)
          this.doc.setLineWidth(0.3 * PT)
          this.doc.line(cx, this.mm(this.y + 0.8), cx + tw, this.mm(this.y + 0.8))
          this.doc.link(cx, this.mm(this.y - fontSizePt * PT * 0.8), tw, this.mm(fontSizePt * PT), { url: seg.link })
          cx += tw
        } else {
          this.doc.setTextColor(...color)
          this.font(seg.bold)
          this.doc.text(part, cx, this.mm(this.y))
          cx += this.doc.getTextWidth(part)
        }
        segCharOff += take
        remaining = remaining.slice(take)

        if (segCharOff >= seg.text.length) {
          segIdx++
          segCharOff = 0
        }
      }

      this.y += LH_BODY
    }

    if (contentWrapLines.length === 0) {
      this.need(LH_BODY)
      this.y += LH_BODY
    }
  }

  // ── 列表项渲染 ────────────────────────────────────────────────────
  // 圆点与第一行文字居中对齐，所有换行使用相同的 x（悬挂缩进）。
  // 支持四种模式：
  //   1. 有序列表（ordered）：数字编号 + 内容
  //   2. 四列模式（depth≥2 且含 **方案**/**结果**）：标题 | 描述 | 方案 | 结果
  //   3. 行内标签模式（**label**：content）：标签粗体 + 内容同行
  //   4. 普通无序列表：圆点 + 内容

  private bullet(text: string, ordered: boolean, depth: number = 0) {
    const extraIndent = depth * NESTED_INDENT
    const bulletX = ML_PT + extraIndent
    const textX = bulletX + BULLET_INDENT
    const availW = CW_PT - extraIndent - BULLET_INDENT

    if (ordered) {
      // 有序列表：提取编号，剩余内容用富文本渲染
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
      // 四列模式：技术难点子项（标题 | 描述 | 方案 | 结果）
      if (depth >= 2 && text.startsWith('**') && text.includes('**：') && text.includes('**方案**：')) {
        this.bulletFourColFull(text, FS_BODY, C_TEXT, depth)
        return
      }

      // 行内标签模式：**label**：content
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

      // 普通无序列表
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

  // ── 四列完整渲染（技术难点子项）────────────────────────────────────
  // 解析 **标题**：描述... **方案**：方案内容... **结果**：结果内容...
  // 列布局：标题（自适应）| 描述（弹性）| 方案（固定 ~38%）| 结果（固定 ~38%）

  private bulletFourColFull(text: string, fontSizePt: number, color: [number, number, number], depth: number = 2) {
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

    // 列边界计算
    const areaLeft = ML_PT + extraIndent
    const areaRight = ML_PT + CW_PT
    const areaW = areaRight - areaLeft

    this.doc.setFontSize(fontSizePt)
    this.doc.setTextColor(...color)

    // 标题宽度（粗体测量）
    this.font(true)
    const titleW = this.doc.getTextWidth(title) / PT
    const titleX = areaLeft
    const descX = areaLeft + titleW

    // 右侧两列（方案、结果）各占 ~38% 宽度
    const rightColW = areaW * 0.38
    const planLabelX = areaRight - rightColW * 2 - 2
    const resultLabelX = areaRight - rightColW

    // 各列可用宽度
    const descAvailW = planLabelX - descX - 4
    const planAvailW = resultLabelX - planLabelX - 4
    const resultAvailW = areaRight - resultLabelX - 2

    // 对各列分别做换行计算
    this.font(false)
    const descLines = desc ? safeWrapText(this.doc, desc, this.mm(Math.max(descAvailW, 10))) : []

    const planLabelW = this.doc.getTextWidth('方案') / PT
    const planContentAvailW = planAvailW - planLabelW - 2
    const planContentLines = planText ? safeWrapText(this.doc, planText, this.mm(Math.max(planContentAvailW, 10))) : []

    const resultLabelW = this.doc.getTextWidth('结果') / PT
    const resultContentAvailW = resultAvailW - resultLabelW - 2
    const resultContentLines = resultText ? safeWrapText(this.doc, resultText, this.mm(Math.max(resultContentAvailW, 10))) : []

    // 总行数 = 所有列中最大的行数
    const totalLines = Math.max(descLines.length, planContentLines.length + 1, resultContentLines.length + 1, 1)

    for (let i = 0; i < totalLines; i++) {
      this.need(LH_BODY)

      if (i === 0) {
        // 第 1 行：标题（粗体）+ 描述首行 + 方案标签（粗体）+ 结果标签（粗体）
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
        // 后续行：描述续行 + 方案内容 + 结果内容
        const descIdx = i
        const planIdx = i - 1
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

  // ── 表格渲染 ──────────────────────────────────────────────────────
  // 带表头背景色、斑马纹行、边框线。
  // 自动处理跨页：当剩余空间不足时翻页并重新绘制表头。

  private table(headers: string[], rows: string[][]) {
    const colN = headers.length
    const colW = CW_PT / colN

    /** 绘制表头行 */
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

    /** 开始表格：绘制表头并返回数据行起始 Y */
    const startTable = (yStart: number) => {
      renderHeader(yStart)
      return yStart + LH_TABLE
    }

    // 如果当前页放不下表头+至少一行数据，先翻页
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
      // 跨页检查：空间不足时翻页并重绘表头
      if (this.y + LH_TABLE > PAGE_H_PT - MB_PT) {
        this.doc.addPage()
        this.pages++
        this.y = MT_PT
        this.y = startTable(this.y)
        this.font(false)
        this.doc.setFontSize(FS_TABLE)
        this.doc.setTextColor(...C_TEXT)
      }

      // 斑马纹背景
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

    // 绘制表格外边框
    const tableH = LH_TABLE * (1 + rows.length)
    this.doc.setDrawColor(...C_LINE)
    this.doc.setLineWidth(0.15 * PT)
    this.doc.rect(this.mm(ML_PT), this.mm(this.y - tableH), this.mm(CW_PT), this.mm(tableH))

    // 绘制列分隔线
    for (let c = 1; c < colN; c++) {
      const x = ML_PT + c * colW
      this.doc.line(this.mm(x), this.mm(this.y - tableH), this.mm(x), this.mm(this.y))
    }

    this.y += GAP_AFTER_TABLE
  }

  // ── 引用块 ────────────────────────────────────────────────────────
  // 左侧绘制强调色竖线，文字使用次要颜色。

  private bq(text: string) {
    const lineCount = this.wrappedRichTextBold(text, ML_PT + 4, CW_PT - 6, FS_BODY, C_MID)
    const barTop = this.y - LH_BODY * lineCount
    const barH = LH_BODY * lineCount
    const barW = 1.2 * PT
    this.doc.setFillColor(...C_ACCENT)
    this.doc.rect(this.mm(ML_PT), this.mm(barTop), barW, this.mm(barH), 'F')
  }

  // ── 主渲染流程 ────────────────────────────────────────────────────
  // 遍历 Block 数组，按类型分发到对应的渲染方法。
  // 特殊处理：
  //   - 个人信息表格：检测到含"姓名"/"性别"/"联系方式"的表头时，
  //     将表头行并入数据行，用 personalInfo() 渲染
  //   - h2 后的非表格内容：通过 prevWasH2 标志添加额外间距

  async render(blocks: Block[]) {
    await this.loadFonts()

    // 扫描个人信息表格（第一个含个人字段表头的表格）
    let personalInfoData: { headers: string[]; rows: string[][] } | null = null
    let personalInfoIdx = -1
    for (let j = 0; j < blocks.length; j++) {
      if (blocks[j].type === 'table') {
        try {
          const d = JSON.parse(blocks[j].text || '{}')
          const headers: string[] = d.headers || []
          if (headers.some((h: string) => h.includes('姓名') || h.includes('性别') || h.includes('联系方式'))) {
            // 表头行实际上是数据（姓名/性别/籍贯），将其作为首行并入 rows
            personalInfoData = { headers, rows: [headers, ...(d.rows || [])] }
            personalInfoIdx = j
            break
          }
        } catch { /* 忽略解析失败 */ }
      }
    }

    // 逐块渲染
    for (let i = 0; i < blocks.length; i++) {
      // 跳过个人信息表格块及其相邻的空行
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
        if (this.prevWasH2) { this.y += GAP_AFTER_H2_CONTENT; this.prevWasH2 = false }
        this.h3(b.text || '')
      } else if (b.type === 'paragraph') {
        if (this.prevWasH2) { this.y += GAP_AFTER_H2_CONTENT; this.prevWasH2 = false }
        this.p(b.text || '')
      } else if (b.type === 'list_item') {
        if (this.prevWasH2) { this.y += GAP_AFTER_H2_CONTENT; this.prevWasH2 = false }
        this.bullet(b.text || '', b.ordered || false, b.depth || 0)
      } else if (b.type === 'table') {
        this.prevWasH2 = false
        const d = JSON.parse(b.text || '{}')
        this.table(d.headers || [], d.rows || [])
      } else if (b.type === 'blockquote') {
        if (this.prevWasH2) { this.y += GAP_AFTER_H2_CONTENT; this.prevWasH2 = false }
        this.bq(b.text || '')
      } else if (b.type === 'space') {
        this.y += 6
      }
    }
  }

  /** 输出 PDF 结果 */
  output(filename: string): PdfConversionResult {
    return {
      blob: this.doc.output('blob'),
      url: URL.createObjectURL(this.doc.output('blob')),
      filename,
    }
  }
}
