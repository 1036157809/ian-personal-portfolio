import { Collection } from 'chromadb';
import { resetCollection, getOrCreateCollection } from './chroma.service';
import { embedTexts } from './embedding.service';
import { chunkText, Chunk } from '../utils/chunker';
import { CHUNK_MAX_SIZE, CHUNK_OVERLAP, RETRIEVE_TOP_K } from '../config';

/**
 * 索引知识库：切片 → 计算 embedding → 存入 ChromaDB
 */
export async function indexKnowledge(
  items: Array<{
    content: string;
    source: string;
    title: string;
    language: string;
  }>
): Promise<{ totalChunks: number }> {
  // 先尝试获取旧 collection，如果有数据则清空；如果维度不匹配则重建
  let collection: Collection;
  try {
    collection = await getOrCreateCollection();
    const existing = await collection.get();
    if (existing.ids?.length) {
      await collection.delete({ ids: existing.ids });
      console.log(`Cleared ${existing.ids.length} old chunks`);
    }
  } catch (err: any) {
    // 维度不匹配或其他错误，删除重建
    console.log(`Collection reset needed: ${err.message}`);
    collection = await resetCollection();
  }

  // 切片
  let allChunks: Chunk[] = [];
  let globalIdx = 0;
  for (const item of items) {
    const chunks = chunkText(
      item.content,
      { source: item.source, title: item.title, language: item.language },
      { maxChunkSize: CHUNK_MAX_SIZE, overlap: CHUNK_OVERLAP }
    );
    for (const chunk of chunks) {
      chunk.id = `${chunk.id}-${globalIdx++}`;
    }
    allChunks = allChunks.concat(chunks);
  }

  if (allChunks.length === 0) {
    return { totalChunks: 0 };
  }

  // 批量计算 embedding（每批 20 条，避免超时和 502）
  const batchSize = 20;
  for (let i = 0; i < allChunks.length; i += batchSize) {
    const batch = allChunks.slice(i, i + batchSize);
    const texts = batch.map((c) => c.text);

    // 重试机制（最多 3 次）
    let embeddings: number[][] | null = null;
    for (let retry = 0; retry < 3; retry++) {
      try {
        embeddings = await embedTexts(texts);
        break;
      } catch (err: any) {
        console.warn(`  Batch ${i / batchSize + 1} attempt ${retry + 1} failed: ${err.message}`);
        if (retry < 2) {
          await new Promise((r) => setTimeout(r, 2000 * (retry + 1))); // 递增等待
        }
      }
    }

    if (!embeddings) {
      console.error(`  Skipping batch ${i / batchSize + 1} after 3 failed attempts`);
      continue;
    }

    await collection.add({
      ids: batch.map((c) => c.id),
      embeddings,
      documents: texts,
      metadatas: batch.map((c) => c.metadata),
    });

    console.log(`  Indexed ${Math.min(i + batchSize, allChunks.length)}/${allChunks.length}`);
  }

  return { totalChunks: allChunks.length };
}

/**
 * 检索相关片段
 * @param query 用户问题
 * @param topK 返回片段数
 * @param language 语言偏好 ('zh' | 'en')，用于 metadata 过滤
 */
export async function retrieveChunks(
  query: string,
  topK: number = RETRIEVE_TOP_K,
  language?: string
): Promise<Chunk[]> {
  const collection = await getOrCreateCollection();

  // 计算 query 的 embedding
  const { embedText } = await import('./embedding.service');
  const queryEmbedding = await embedText(query);

  // 向量检索（多取一些，过滤后保证数量）
  const fetchK = language ? Math.min(topK * 3, 20) : topK;
  const queryOpts: any = {
    queryEmbeddings: [queryEmbedding],
    nResults: fetchK,
  };

  // 按语言过滤 metadata
  if (language === 'zh') {
    queryOpts.where = { language: 'zh' };
  } else if (language === 'en') {
    queryOpts.where = { language: 'en' };
  }

  const results = await collection.query(queryOpts);

  const chunks: Chunk[] = [];
  const ids = results.ids?.[0] ?? [];
  const documents = results.documents?.[0] ?? [];
  const metadatas = results.metadatas?.[0] ?? [];

  for (let i = 0; i < ids.length && chunks.length < topK; i++) {
    if (documents[i]) {
      chunks.push({
        id: ids[i] as string,
        text: documents[i] as string,
        metadata: {
          source: (metadatas[i] as any)?.source ?? '',
          title: (metadatas[i] as any)?.title ?? '',
          language: (metadatas[i] as any)?.language ?? 'en',
        },
      });
    }
  }

  return chunks;
}
