import https from 'https';
import { retrieveChunks } from './indexing.service';
import { Chunk } from '../utils/chunker';
import {
  getLlmApiKey,
  getLlmBaseUrl,
  getLlmModel,
  getLlmMaxTokens,
  getRetrieveTopK,
} from '../config';
import { checkAndIncrement } from './rate-limit.service';
import { getSystemPrompt } from '../prompts/system-prompts';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const buildRequest = async (body: any, stream: boolean) => {
  const baseUrl = await getLlmBaseUrl();
  const url = new URL(`${baseUrl}/chat/completions`);
  const apiKey = await getLlmApiKey();
  const model = await getLlmModel();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  };
  const bodyStr = JSON.stringify({ ...body, model, stream });
  headers['Content-Length'] = String(Buffer.byteLength(bodyStr));
  return { url, headers, bodyStr };
};

const sendRequest = async (url: URL, headers: Record<string, string>, bodyStr: string) => {
  return new Promise<import('http').IncomingMessage>((resolve, reject) => {
    const req = https.request(
      { hostname: url.hostname, path: url.pathname, method: 'POST', headers, timeout: 60000 },
      resolve
    );
    req.on('error', reject);
    req.setTimeout(60000, () => { req.destroy(); reject(new Error('LLM request timeout')); });
    req.write(bodyStr);
    req.end();
  });
};

export const llmRequest = async (body: any): Promise<{ status: number; body: any }> => {
  const { url, headers, bodyStr } = await buildRequest(body, false);
  const res = await sendRequest(url, headers, bodyStr);
  let data = '';
  res.on('data', (c) => (data += c));
  return new Promise((resolve) => {
    res.on('end', () => {
      try { resolve({ status: res.statusCode ?? 0, body: JSON.parse(data) }); }
      catch { resolve({ status: res.statusCode ?? 0, body: data }); }
    });
  });
};

export const llmStream = async function *(body: any): AsyncGenerator<string> {
  const { url, headers, bodyStr } = await buildRequest(body, true);
  const res = await sendRequest(url, headers, bodyStr);

  let buffer = '';
  let isFirstChunk = true;
  for await (const chunk of res) {
    buffer += chunk.toString();
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;
      const data = trimmed.slice(6);
      if (data === '[DONE]') return;
      try {
        const parsed = JSON.parse(data);
        if (isFirstChunk && parsed.error) throw new Error(parsed.error.message || 'LLM API error');
        isFirstChunk = false;
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) yield delta;
      } catch (err: any) {
        if (err.message?.includes('LLM API error')) throw err;
      }
    }
  }
};

const getDailyLimitMessage = (language: string): string =>
  language === 'en'
    ? 'Due to personal usage limits, the daily quota has been reached. Please come back tomorrow!'
    : '因个人使用限制，今日调用次数已达上限，明天再来吧！';

const buildPrompt = (message: string, chunks: Chunk[], language: string): string => {
  const contextText = chunks.length > 0
    ? chunks.map((c, i) => `[${language === 'en' ? 'Fragment' : '片段'} ${i + 1}] (${c.metadata.title})\n${c.text}`).join('\n\n')
    : language === 'en' ? '(No relevant content found)' : '（未找到相关内容）';
  return language === 'en'
    ? `The following is website content relevant to the question:\n${contextText}\n\nUser question: ${message}`
    : `以下是与问题相关的网站内容：\n${contextText}\n\n用户问题：${message}`;
};

export const chat = async (message: string, history: ChatMessage[] = [], language: string = 'zh'): Promise<string> => {
  const allowed = await checkAndIncrement();
  if (!allowed) return getDailyLimitMessage(language);

  const chunks = await retrieveChunks(message, await getRetrieveTopK(), language);
  const messages = [
    { role: 'system', content: getSystemPrompt(language) },
    ...history.map((h) => ({ role: h.role, content: h.content })),
    { role: 'user', content: buildPrompt(message, chunks, language) },
  ];

  const res = await llmRequest({ messages, max_tokens: await getLlmMaxTokens() });
  if (res.status >= 400) throw new Error(`LLM API error: ${JSON.stringify(res.body)}`);
  return res.body.choices?.[0]?.message?.content || (language === 'en' ? 'Sorry, I could not generate an answer.' : '抱歉，我无法生成回答。');
};

export const chatStream = async function *(message: string, history: ChatMessage[] = [], language: string = 'zh'): AsyncGenerator<string> {
  const allowed = await checkAndIncrement();
  if (!allowed) { yield getDailyLimitMessage(language); return; }

  const chunks = await retrieveChunks(message, await getRetrieveTopK(), language);
  const messages = [
    { role: 'system', content: getSystemPrompt(language) },
    ...history.map((h) => ({ role: h.role, content: h.content })),
    { role: 'user', content: buildPrompt(message, chunks, language) },
  ];

  yield* llmStream({ messages, max_tokens: await getLlmMaxTokens() });
};
