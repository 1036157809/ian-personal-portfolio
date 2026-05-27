import { CloudClient } from 'chromadb';
import {
  CHROMADB_API_KEY,
  CHROMADB_HOST,
  CHROMADB_TENANT,
  CHROMADB_DATABASE,
  CHROMADB_COLLECTION,
} from '../config';

let client: CloudClient | null = null;

function getClient(): CloudClient {
  if (!client) {
    client = new CloudClient({
      apiKey: CHROMADB_API_KEY,
      host: CHROMADB_HOST,
      tenant: CHROMADB_TENANT,
      database: CHROMADB_DATABASE,
    });
  }
  return client;
}

export async function getOrCreateCollection(name: string = CHROMADB_COLLECTION) {
  const chroma = getClient();
  return chroma.getOrCreateCollection({
    name,
    metadata: { 'hnsw:space': 'cosine' },
  });
}

/**
 * 删除旧 collection 并重新创建（用于 embedding 维度变更时）
 */
export async function resetCollection(name: string = CHROMADB_COLLECTION) {
  const chroma = getClient();
  try {
    await chroma.deleteCollection({ name });
    console.log(`Deleted old collection: ${name}`);
  } catch {
    console.log(`Collection ${name} did not exist, creating new one`);
  }
  return chroma.createCollection({
    name,
    metadata: { 'hnsw:space': 'cosine' },
  });
}
