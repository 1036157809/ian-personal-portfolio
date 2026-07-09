import { Collection } from 'chromadb';
import { resetCollection, getOrCreateCollection } from './chroma.service';
import { embedTexts } from './embedding.service';
import { chunkText, Chunk } from '../utils/chunker';
import { getChunkMaxSize, getChunkOverlap, getRetrieveTopK } from '../config';

export const indexKnowledge = async (
  items: Array<{ content: string; source: string; title: string; language: string }>
): Promise<{ totalChunks: number }> => {
  let collection: Collection;
  try {
    collection = await getOrCreateCollection();
    const existing = await collection.get();
    if (existing.ids?.length) {
      await collection.delete({ ids: existing.ids });
      console.log(`Cleared ${existing.ids.length} old chunks`);
    }
  } catch (err: any) {
    console.log(`Collection reset needed: ${err.message}`);
    collection = await resetCollection();
  }

  const maxChunkSize = await getChunkMaxSize();
  const chunkOverlap = await getChunkOverlap();

  let allChunks: Chunk[] = [];
  let globalIdx = 0;
  for (const item of items) {
    const chunks = chunkText(
      item.content,
      { source: item.source, title: item.title, language: item.language },
      { maxChunkSize, overlap: chunkOverlap }
    );
    for (const chunk of chunks) chunk.id = `${chunk.id}-${globalIdx++}`;
    allChunks = allChunks.concat(chunks);
  }

  if (allChunks.length === 0) return { totalChunks: 0 };

  const batchSize = 20;
  for (let i = 0; i < allChunks.length; i += batchSize) {
    const batch = allChunks.slice(i, i + batchSize);
    const texts = batch.map((c) => c.text);

    let embeddings: number[][] | null = null;
    for (let retry = 0; retry < 3; retry++) {
      try {
        embeddings = await embedTexts(texts);
        break;
      } catch (err: any) {
        console.warn(`  Batch ${i / batchSize + 1} attempt ${retry + 1} failed: ${err.message}`);
        if (retry < 2) await new Promise((r) => setTimeout(r, 2000 * (retry + 1)));
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
};

export const retrieveChunks = async (query: string, topK?: number, language?: string): Promise<Chunk[]> => {
  const collection = await getOrCreateCollection();
  const retrieveTopK = await getRetrieveTopK();
  const finalTopK = topK ?? retrieveTopK;

  const { embedText } = await import('./embedding.service');
  const queryEmbedding = await embedText(query);

  const fetchK = language ? Math.min(finalTopK * 3, 20) : finalTopK;
  const queryOpts: any = {
    queryEmbeddings: [queryEmbedding],
    nResults: fetchK,
  };

  if (language === 'zh') queryOpts.where = { language: 'zh' };
  else if (language === 'en') queryOpts.where = { language: 'en' };

  const results = await collection.query(queryOpts);

  const chunks: Chunk[] = [];
  const ids = results.ids?.[0] ?? [];
  const documents = results.documents?.[0] ?? [];
  const metadatas = results.metadatas?.[0] ?? [];

  for (let i = 0; i < ids.length && chunks.length < finalTopK; i++) {
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
};
