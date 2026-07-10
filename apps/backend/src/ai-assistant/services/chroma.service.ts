import { CloudClient } from 'chromadb';
import {
  getChromaApiKey,
  getChromaHost,
  getChromaTenant,
  getChromaDatabase,
  getChromaCollection,
} from '../config';

let client: CloudClient | null = null;

const getClient = (): CloudClient => {
  if (client) return client;
  client = new CloudClient({
    apiKey: getChromaApiKey(),
    host: getChromaHost(),
    tenant: getChromaTenant(),
    database: getChromaDatabase(),
    fetchOptions: {
      signal: AbortSignal.timeout(60000),
    },
  });
  return client;
};

export const getOrCreateCollection = async () => {
  const chroma = getClient();
  const name = getChromaCollection();
  return chroma.getOrCreateCollection({
    name,
    metadata: { 'hnsw:space': 'cosine' },
    embeddingFunction: null,
  });
};

export const resetCollection = async () => {
  const chroma = getClient();
  const name = getChromaCollection();
  try {
    await chroma.deleteCollection({ name });
    console.log(`Deleted old collection: ${name}`);
  } catch {
    console.log(`Collection ${name} did not exist, creating new one`);
  }
  return chroma.createCollection({
    name,
    metadata: { 'hnsw:space': 'cosine' },
    embeddingFunction: null,
  });
};
