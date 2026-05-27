/**
 * 知识库索引脚本
 *
 * 数据来源：knowledge/*.md — 手动编写的结构化知识
 *
 * 用法：
 *   cd backend
 *   npx tsx src/ai-assistant/scripts/index-knowledge.ts
 */

import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { indexKnowledge } from '../services/indexing.service';

dotenv.config({ path: path.join(__dirname, '../../../.env') });

// ─── 知识文件白名单 ─────────────────────────────────────────
const KNOWLEDGE_FILES = [
  '01-intro.md',
  '02-skills.md',
  '03-work-experience.md',
  '04-projects.md',
  '05-resume-summary.md',
];

// ─── 类型 ───────────────────────────────────────────────────
interface IndexItem {
  content: string;
  source: string;
  title: string;
  language: string;
}

// ─── 加载 knowledge/*.md ────────────────────────────────────
function loadMarkdownKnowledge(): IndexItem[] {
  const items: IndexItem[] = [];
  const knowledgeDir = path.join(__dirname, '../../../knowledge');

  if (!fs.existsSync(knowledgeDir)) {
    console.warn('knowledge/ directory not found, skipping markdown knowledge');
    return items;
  }

  for (const file of KNOWLEDGE_FILES) {
    const filePath = path.join(knowledgeDir, file);
    if (!fs.existsSync(filePath)) {
      console.warn(`  Skipping ${file} (not found)`);
      continue;
    }

    const raw = fs.readFileSync(filePath, 'utf-8');

    // 按空行切分成段落，每个段落作为一个索引单元
    const paragraphs = raw.split(/\n\s*\n/).filter((s) => s.trim().length >= 20);

    for (const paragraph of paragraphs) {
      const text = paragraph.trim();
      // 取前 40 字符作为 title
      const title = text.slice(0, 40).replace(/\n/g, ' ');
      const filePrefix = file.replace('.md', '');
      items.push({
        content: text,
        source: `knowledge/${filePrefix}`,
        title,
        language: 'zh',
      });
    }

    console.log(`Loaded ${paragraphs.length} paragraphs from knowledge/${file}`);
  }

  return items;
}

// ─── 主流程 ─────────────────────────────────────────────────
async function main() {
  console.log('=== Building knowledge base ===\n');

  const items = loadMarkdownKnowledge();

  console.log(`\nTotal items to index: ${items.length}`);

  if (items.length === 0) {
    console.warn('No items found.');
    process.exit(1);
  }

  // 清空旧数据 + 重新索引
  const result = await indexKnowledge(items);
  console.log(`\nIndexed ${result.totalChunks} chunks successfully.`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Indexing failed:', err);
  process.exit(1);
});
