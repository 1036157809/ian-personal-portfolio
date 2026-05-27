import OpenAI from 'openai';
import { getConfig } from 'src/services/config.service';

let client: OpenAI | null = null;

async function getClient(): Promise<OpenAI> {
  if (!client) {
    const baseURL = await getConfig('embedding_base_url');
    const apiKey = await getConfig('embedding_api_key');
    if (!baseURL || !apiKey) {
      throw new Error('Embedding config missing: embedding_base_url / embedding_api_key');
    }
    client = new OpenAI({ baseURL, apiKey });
  }
  return client;
}

function invalidateClient() {
  client = null;
}

/**
 * 计算文本的 embedding 向量
 */
export async function embedText(text: string): Promise<number[]> {
  const c = await getClient();
  const model = await getConfig('embedding_model');
  if (!model) throw new Error('Embedding config missing: embedding_model');
  const res = await c.embeddings.create({ model, input: text });
  return res.data[0].embedding;
}

/**
 * 批量计算 embedding 向量
 */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  const c = await getClient();
  const model = await getConfig('embedding_model');
  if (!model) throw new Error('Embedding config missing: embedding_model');
  const res = await c.embeddings.create({ model, input: texts });
  return res.data.map((d) => d.embedding);
}

export { invalidateClient };
