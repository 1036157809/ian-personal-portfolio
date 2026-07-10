/**
 * 文本切片工具
 *
 * 策略：
 * 1. 如果是 Markdown 内容（以 ## 开头），先按 ## 标题切分大段
 * 2. 每个大段内按段落（空行）累积，控制每块不超过 maxChunkSize
 * 3. 单段超长时按句子切分
 * 4. 相邻块之间保留 overlap 字符的重叠
 */
export interface Chunk {
  id: string;
  text: string;
  metadata: {
    source: string;   // 来源，如 'knowledge/01-intro', 'i18n/about'
    title: string;    // 章节标题
    language: string; // 'en' | 'zh'
  };
}

export const chunkText = (
  content: string,
  metadata: Chunk['metadata'],
  options: { maxChunkSize?: number; overlap?: number } = {}
): Chunk[] => {
  const { maxChunkSize = 400, overlap = 50 } = options;
  const chunks: Chunk[] = [];

  // 如果内容包含 ## 标题，先按标题切分
  const hasMarkdownHeaders = /^## /m.test(content);
  const sections: Array<{ title: string; body: string }> = [];

  if (hasMarkdownHeaders) {
    const parts = content.split(/^## /m).filter((s) => s.trim());
    for (const part of parts) {
      const lines = part.trim().split('\n');
      const heading = lines[0].replace(/^#+\s*/, '').trim();
      const body = lines.slice(1).join('\n').trim();
      if (body.length > 10) {
        sections.push({ title: heading, body });
      }
    }
  } else {
    // 非 Markdown，整个内容作为一个 section
    sections.push({ title: metadata.title, body: content });
  }

  // 对每个 section 做段落级切片
  for (const section of sections) {
    const sectionHeader = section.title ? `## ${section.title}\n\n` : '';
    const paragraphs = section.body.split(/\n\n+/).filter((p) => p.trim());
    let buffer = '';

    for (const paragraph of paragraphs) {
      const trimmed = paragraph.trim();
      if (!trimmed) continue;

      // 单段超长时按句子切分
      if (trimmed.length > maxChunkSize) {
        // 先 flush 缓冲区
        if (buffer) {
          chunks.push(createChunk(sectionHeader + buffer, metadata, chunks.length));
          buffer = '';
        }
        const sentences = trimmed.split(/(?<=[.!?。！？])\s+/);
        let sentenceBuf = '';
        for (const sentence of sentences) {
          if ((sentenceBuf + sentence).length > maxChunkSize) {
            if (sentenceBuf) {
              chunks.push(createChunk(sectionHeader + sentenceBuf, metadata, chunks.length));
              sentenceBuf = sentenceBuf.slice(-overlap);
            }
            sentenceBuf += sentence;
          } else {
            sentenceBuf += (sentenceBuf ? ' ' : '') + sentence;
          }
        }
        if (sentenceBuf) {
          buffer = sentenceBuf;
        }
        continue;
      }

      // 累积段落
      const candidate = buffer ? buffer + '\n\n' + trimmed : trimmed;
      if (candidate.length > maxChunkSize && buffer) {
        chunks.push(createChunk(sectionHeader + buffer, metadata, chunks.length));
        buffer = buffer.slice(-overlap) + '\n\n' + trimmed;
      } else {
        buffer = candidate;
      }
    }

    if (buffer) {
      chunks.push(createChunk(sectionHeader + buffer, metadata, chunks.length));
    }
  }

  return chunks;
}

const createChunk = (text: string, metadata: Chunk['metadata'], index: number): Chunk => {
  return {
    id: `${metadata.source}-${metadata.language}-${index}`,
    text: text.trim(),
    metadata,
  };
};
