/**
 * 知识库索引脚本
 *
 * 数据来源：knowledge/zh/*.md + knowledge/en/*.md
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

interface IndexItem {
  content: string;
  source: string;
  title: string;
  language: string;
}

/**
 * 加载指定语言目录下的所有 .md 文件
 */
function loadMarkdownKnowledge(language: string): IndexItem[] {
  const items: IndexItem[] = [];
  const knowledgeDir = path.join(__dirname, `../../../knowledge/${language}`);

  if (!fs.existsSync(knowledgeDir)) {
    console.warn(`knowledge/${language}/ directory not found, skipping`);
    return items;
  }

  const files = fs.readdirSync(knowledgeDir).filter((f) => f.endsWith('.md')).sort();

  for (const file of files) {
    const filePath = path.join(knowledgeDir, file);
    const raw = fs.readFileSync(filePath, 'utf-8');

    // 按 ## 标题切分成 section
    const sections = raw.split(/^## /m).filter((s) => s.trim().length > 10);

    for (const section of sections) {
      const lines = section.trim().split('\n');
      const heading = lines[0].replace(/^#+\s*/, '').trim();
      const body = lines.slice(1).join('\n').trim();
      if (body.length < 20) continue;

      const filePrefix = file.replace('.md', '');
      items.push({
        content: `## ${heading}\n\n${body}`,
        source: `knowledge/${language}/${filePrefix}`,
        title: heading.slice(0, 60),
        language,
      });
    }

    console.log(`Loaded ${sections.length} sections from knowledge/${language}/${file}`);
  }

  return items;
}

async function main() {
  console.log('=== Building knowledge base ===\n');

  const zhItems = loadMarkdownKnowledge('zh');
  console.log(`--- Chinese: ${zhItems.length} sections ---\n`);

  const enItems = loadMarkdownKnowledge('en');
  console.log(`--- English: ${enItems.length} sections ---\n`);

  const allItems = [...zhItems, ...enItems];
  console.log(`Total items to index: ${allItems.length}`);

  if (allItems.length === 0) {
    console.warn('No items found.');
    process.exit(1);
  }

  const result = await indexKnowledge(allItems);
  console.log(`\nIndexed ${result.totalChunks} chunks successfully.`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Indexing failed:', err);
  process.exit(1);
});
