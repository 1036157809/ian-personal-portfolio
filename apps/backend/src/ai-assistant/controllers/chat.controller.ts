import type { Context } from 'koa';
import { chat, chatStream, ChatMessage } from '../services/chat.service';
import { indexKnowledge } from '../services/indexing.service';

export class ChatController {
  /**
   * POST /api/chat — 非流式聊天
   */
  async chat(ctx: Context) {
    const { message, history, language } = (ctx.request as any).body as {
      message: string;
      history?: ChatMessage[];
      language?: string;
    };

    if (!message || typeof message !== 'string') {
      ctx.status = 400;
      ctx.body = { error: 'message is required' };
      return;
    }

    const lang = language ?? 'zh';

    try {
      const answer = await chat(message, history ?? [], lang);
      ctx.body = { answer };
    } catch (err: any) {
      console.error('Chat error:', err);
      ctx.status = 500;
      ctx.body = { error: 'Internal server error', detail: err.message };
    }
  }

  /**
   * POST /api/chat/stream — 流式聊天（SSE）
   */
  async chatStream(ctx: Context) {
    const { message, history, language } = (ctx.request as any).body as {
      message: string;
      history?: ChatMessage[];
      language?: string;
    };

    if (!message || typeof message !== 'string') {
      ctx.status = 400;
      ctx.body = { error: 'message is required' };
      return;
    }

    const lang = language ?? 'zh';

    ctx.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    ctx.status = 200;

    const stream = ctx.res;

    try {
      for await (const token of chatStream(message, history ?? [], lang)) {
        stream.write(`data: ${JSON.stringify({ token })}\n\n`);
      }
      stream.write('data: [DONE]\n\n');
    } catch (err: any) {
      console.error('Stream error:', err);
      stream.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    } finally {
      stream.end();
    }
  }

  /**
   * POST /api/chat/index — 触发知识库重建
   */
  async index(ctx: Context) {
    const { items } = (ctx.request as any).body as {
      items: Array<{
        content: string;
        source: string;
        title: string;
        language: string;
      }>;
    };

    if (!items || !Array.isArray(items) || items.length === 0) {
      ctx.status = 400;
      ctx.body = { error: 'items array is required' };
      return;
    }

    try {
      const result = await indexKnowledge(items);
      ctx.body = { success: true, ...result };
    } catch (err: any) {
      console.error('Index error:', err);
      ctx.status = 500;
      ctx.body = { error: 'Internal server error', detail: err.message };
    }
  }
}

export default new ChatController();
