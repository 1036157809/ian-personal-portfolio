import { request } from 'src/utils/request';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  answer: string;
}

export const chatApi = {
  async sendMessage(message: string, history: ChatMessage[] = [], language: string = 'zh'): Promise<ChatResponse> {
    return request<ChatResponse>('/chat', {
      method: 'POST',
      body: JSON.stringify({ message, history, language }),
    });
  },

  /**
   * 流式聊天，返回 ReadableStream
   */
  async sendMessageStream(
    message: string,
    history: ChatMessage[] = [],
    language: string = 'zh',
    signal?: AbortSignal
  ): Promise<ReadableStream<Uint8Array>> {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
    const response = await fetch(`${API_BASE_URL}/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history, language }),
      signal,
    });

    if (!response.ok) {
      throw new Error('Stream request failed');
    }

    return response.body!;
  },
};
