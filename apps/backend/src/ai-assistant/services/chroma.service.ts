import { CloudClient } from 'chromadb';
import {
  getChromaApiKey,
  getChromaHost,
  getChromaTenant,
  getChromaDatabase,
  getChromaCollection,
} from '../config';

let client: CloudClient | null = null;

const getClient = async (): Promise<CloudClient> => {
  if (client) return client;
  client = new CloudClient({
    apiKey: await getChromaApiKey(),
    host: await getChromaHost(),
    tenant: await getChromaTenant(),
    database: await getChromaDatabase(),
  });
  return client;
};

export const getOrCreateCollection = async () => {
  const chroma = await getClient();
  const name = await getChromaCollection();
  return chroma.getOrCreateCollection({
    name,
    metadata: { 'hnsw:space': 'cosine' },
    embeddingFunction: null,
  });
};

export const resetCollection = async () => {
  const chroma = await getClient();
  const name = await getChromaCollection();
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
