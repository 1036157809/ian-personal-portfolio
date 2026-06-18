/**
 * PDF 引擎常量配置
 * 包含页面尺寸、边距、字号、行高、间距、颜色、字体路径等所有常量。
 *
 * 单位说明：所有内部计算均以 pt（磅）为单位。
 * jsPDF 使用 unit='mm' 时：
 *   setFontSize(pt)       — 字号始终以 pt 为单位
 *   text(x_mm, y_mm)      — 绘制位置以 mm 为单位（y 为文字基线）
 *   splitTextToSize(str, max_width_mm) — 宽度以 mm 为单位
 *   getTextWidth(str)     — 返回 mm
 *   line/rect/circle      — 均以 mm 为单位
 * PT = 25.4/72（1 pt = 1/72 英寸 = 25.4/72 mm）
 */

/** pt → mm 转换系数 */
export const PT = 25.4 / 72

// ── 页面尺寸（pt）────────────────────────────────────────────────────
/** 页面宽度 612pt（8.5 英寸，Letter 纸） */
export const PAGE_W_PT = 612
/** 页面高度 792pt（11 英寸） */
export const PAGE_H_PT = 792

// ── 页边距（pt）──────────────────────────────────────────────────────
export const ML_PT = 42                    // 左边距
export const MR_PT = 42                    // 右边距
export const MT_PT = 61                    // 上边距（第一行基线位置）
export const MB_PT = 42                    // 下边距
export const CW_PT = PAGE_W_PT - ML_PT - MR_PT  // 内容区域宽度 = 528pt

// ── 字号（pt）───────────────────────────────────────────────────────
export const FS_H2    = 14.6   // h2 标题字号
export const FS_H3    = 11.4   // h3 标题字号
export const FS_BODY  =  9.8   // 正文字号
export const FS_TABLE =  9.8   // 表格字号

// ── 行高（pt）───────────────────────────────────────────────────────
export const LH_BODY   = 15.5  // 正文行高（基线到基线）
export const LH_H2     = 16.0  // h2 标题行高
export const LH_H3     = 24.4  // h3 标题行高
export const LH_TABLE  = 27.8  // 表格行高

// ── 间距（pt）───────────────────────────────────────────────────────
export const GAP_BEFORE_H2        = 18.3  // h2 标题前的额外间距
export const GAP_H2_RULE           =  6.0  // h2 文字基线到下方分隔线的距离
export const GAP_H2_CONTENT        = 12.0  // 分隔线到后续内容的距离
export const GAP_BEFORE_H3         =  2.2  // h3 标题前的额外间距
/**
 * h2 标题后，非表格内容需要的额外间距。
 * 原因：LH_H2=16 已包含表格间距，普通内容需要 26pt 的基线间距。
 */
export const GAP_AFTER_H2_CONTENT = 10.0
export const GAP_AFTER_TABLE       =  8.0  // 表格后的额外间距
export const BULLET_INDENT         = 19.5  // 列表项圆点右侧到文字左边的距离
export const NESTED_INDENT         = 20.0  // 列表每嵌套一层额外缩进的距离
export const DOT_OFFSET            =  7.0  // 圆点中心相对于列表左边缘的偏移
export const DOT_RADIUS_PT         =  1.2  // 列表圆点半径

// ── 颜色（RGB）──────────────────────────────────────────────────────
export const C_ACCENT:  [number, number, number] = [52, 73, 94]     // h2 标题/分隔线强调色
export const C_TEXT:    [number, number, number] = [40, 40, 40]     // 正文主文字颜色
export const C_MID:     [number, number, number] = [110, 110, 110]  // 引用块等次要文字颜色
export const C_BULLET:  [number, number, number] = [0, 0, 0]        // 列表圆点颜色
export const C_LINE:    [number, number, number] = [185, 185, 185]  // 表格边框线颜色
export const C_BG_TINT: [number, number, number] = [248, 248, 250]  // 表格斑马纹背景色

// ── 字体文件路径 ────────────────────────────────────────────────────
export const FONT_REG  = '/fonts/NotoSansSC-Regular.ttf'  // 常规体
export const FONT_BOLD = '/fonts/NotoSansSC-Bold.ttf'     // 粗体

// ── 换行相关 ────────────────────────────────────────────────────────
/**
 * 可以在其后断行的字符集合。
 * 包含中文标点（、，；。）》」』）、英文标点（, ; )）和空格。
 */
export const BREAK_AFTER = new Set([
  '、', '，', '；', '。', '）', '」', '』', '》', ' ', ',', ';', ')',
])
