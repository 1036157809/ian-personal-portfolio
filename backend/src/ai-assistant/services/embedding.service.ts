import OpenAI from 'openai';
import {
  EMBEDDING_API_KEY,
  EMBEDDING_BASE_URL,
  EMBEDDING_MODEL,
} from '../config';

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI({
      baseURL: EMBEDDING_BASE_URL,
      apiKey: EMBEDDING_API_KEY,
    });
  }
  return client;
}

/**
 * 计算文本的 embedding 向量
 */
export async function embedText(text: string): Promise<number[]> {
  const c = getClient();
  const res = await c.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
    encoding_format: 'float',
  });
  return res.data[0].embedding;
}

/**
 * 批量计算 embedding 向量
 */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  const c = getClient();
  const res = await c.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts,
    encoding_format: 'float',
  });
  return res.data.map((d) => d.embedding);
}
