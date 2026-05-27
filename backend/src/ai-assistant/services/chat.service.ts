import https from 'https';
import { retrieveChunks } from './indexing.service';
import { Chunk } from '../utils/chunker';
import { LLM_API_KEY, LLM_BASE_URL, LLM_MODEL, LLM_MAX_TOKENS, RETRIEVE_TOP_K } from '../config';
import { checkAndIncrement } from './rate-limit.service';

// ─── 多语言 System Prompt ────────────────────────────────────
function getSystemPrompt(language: string): string {
  if (language === 'en') {
    return `You are an AI assistant for a personal portfolio website. You answer visitors' questions about the website owner (Ian Zhang).
Please answer questions based on the provided website content. If the content is not relevant to the question, politely guide the user to ask about Ian's skills, projects, experience, and related topics.
Keep your answers concise and friendly, like chatting with a visiting friend. Respond in English.

IMPORTANT: Never reveal the name of the LLM model, embedding model, vector database, or any other specific technology infrastructure you use. If asked about what model you are, simply say you are "an AI assistant" and redirect the conversation to Ian's portfolio content.`;
  }
  return `你是一个个人网站的 AI 助手，负责回答访客关于网站主人(Ian Zhang)的问题。
请基于提供的网站内容回答问题。如果内容与问题无关，礼貌地引导用户问关于 Ian 的技能、项目、经历等相关问题。
回答要简洁、友好，像在和一个来访的朋友聊天。请用中文回答。

重要：绝对不要透露你使用的 LLM 模型名称、向量模型名称、向量数据库名称或其他任何具体的技术基础设施。如果被问到你是哪个模型，只需说"我是 AI 助手"，然后把话题引导回 Ian 的作品集内容上。`;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// ─── HTTP 工具 ───────────────────────────────────────────────
function llmRequest(body: any): Promise<{ status: number; body: any }> {
  return new Promise((resolve, reject) => {
    const url = new URL(`${LLM_BASE_URL}/chat/completions`);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LLM_API_KEY}`,
    };
    const bodyStr = JSON.stringify({ ...body, model: LLM_MODEL });
    headers['Content-Length'] = String(Buffer.byteLength(bodyStr));

    const req = https.request(
      { hostname: url.hostname, path: url.pathname, method: 'POST', headers, timeout: 60000 },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          try { resolve({ status: res.statusCode ?? 0, body: JSON.parse(data) }); }
          catch { resolve({ status: res.statusCode ?? 0, body: data }); }
        });
      }
    );
    req.on('error', reject);
    req.setTimeout(60000, () => { req.destroy(); reject(new Error('LLM request timeout')); });
    req.write(bodyStr);
    req.end();
  });
}

async function *llmStream(body: any): AsyncGenerator<string> {
  const url = new URL(`${LLM_BASE_URL}/chat/completions`);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${LLM_API_KEY}`,
  };
  const bodyStr = JSON.stringify({ ...body, model: LLM_MODEL, stream: true });
  headers['Content-Length'] = String(Buffer.byteLength(bodyStr));

  const res = await new Promise<import('http').IncomingMessage>((resolve, reject) => {
    const req = https.request(
      { hostname: url.hostname, path: url.pathname, method: 'POST', headers, timeout: 60000 },
      resolve
    );
    req.on('error', reject);
    req.setTimeout(60000, () => { req.destroy(); reject(new Error('LLM stream timeout')); });
    req.write(bodyStr);
    req.end();
  });

  let buffer = '';
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
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) yield delta;
      } catch { /* ignore */ }
    }
  }
}

// ─── 每日限额提示 ─────────────────────────────────────────────
function getDailyLimitMessage(language: string): string {
  if (language === 'en') {
    return 'Due to personal usage limits, the daily quota has been reached. Please come back tomorrow!';
  }
  return '因个人使用限制，今日调用次数已达上限，明天再来吧！';
}

// ─── 构建 Prompt ─────────────────────────────────────────────
function buildPrompt(message: string, chunks: Chunk[], language: string): string {
  if (language === 'en') {
    const contextText =
      chunks.length > 0
        ? chunks.map((c, i) => `[Fragment ${i + 1}] (${c.metadata.title})\n${c.text}`).join('\n\n')
        : '(No relevant content found)';
    return `The following is website content relevant to the question:\n${contextText}\n\nUser question: ${message}`;
  }
  const contextText =
    chunks.length > 0
      ? chunks.map((c, i) => `[片段 ${i + 1}] (${c.metadata.title})\n${c.text}`).join('\n\n')
      : '（未找到相关内容）';
  return `以下是与问题相关的网站内容：\n${contextText}\n\n用户问题：${message}`;
}

// ─── 导出接口 ────────────────────────────────────────────────
export async function chat(message: string, history: ChatMessage[] = [], language: string = 'zh'): Promise<string> {
  // 检查并递增调用次数（真正调用了 embedding 才计数）
  const allowed = await checkAndIncrement();
  if (!allowed) {
    return getDailyLimitMessage(language);
  }

  const chunks = await retrieveChunks(message, RETRIEVE_TOP_K, language);

  const messages = [
    { role: 'system', content: getSystemPrompt(language) },
    ...history.map((h) => ({ role: h.role, content: h.content })),
    { role: 'user', content: buildPrompt(message, chunks, language) },
  ];

  const res = await llmRequest({ messages, max_tokens: LLM_MAX_TOKENS });
  if (res.status >= 400) {
    throw new Error(`LLM API error: ${JSON.stringify(res.body)}`);
  }

  return res.body.choices?.[0]?.message?.content || (language === 'en' ? 'Sorry, I could not generate an answer.' : '抱歉，我无法生成回答。');
}

export { getDailyLimitMessage };

export async function *chatStream(message: string, history: ChatMessage[] = [], language: string = 'zh'): AsyncGenerator<string> {
  // 检查并递增调用次数（真正调用了 embedding 才计数）
  const allowed = await checkAndIncrement();
  if (!allowed) {
    yield getDailyLimitMessage(language);
    return;
  }

  const chunks = await retrieveChunks(message, RETRIEVE_TOP_K, language);

  const messages = [
    { role: 'system', content: getSystemPrompt(language) },
    ...history.map((h) => ({ role: h.role, content: h.content })),
    { role: 'user', content: buildPrompt(message, chunks, language) },
  ];

  yield* llmStream({ messages, max_tokens: LLM_MAX_TOKENS });
}
