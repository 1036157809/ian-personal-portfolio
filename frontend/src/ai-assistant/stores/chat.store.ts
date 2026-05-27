import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useLanguageStore } from 'src/stores/language';
import { chatApi, ChatMessage } from '../api/chat.api';

export const useChatStore = defineStore('chat', () => {
  const messages = ref<ChatMessage[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const isOpen = ref(false);

  const hasMessages = computed(() => messages.value.length > 0);

  function addMessage(msg: ChatMessage) {
    messages.value.push(msg);
  }

  function clearMessages() {
    messages.value = [];
  }

  function toggleChat() {
    isOpen.value = !isOpen.value;
  }

  function openChat() {
    isOpen.value = true;
  }

  function closeChat() {
    isOpen.value = false;
  }

  /**
   * 非流式发送消息
   */
  async function sendMessage(content: string) {
    if (!content.trim() || isLoading.value) return;

    const lang = useLanguageStore().currentLang;

    addMessage({ role: 'user', content: content.trim() });
    isLoading.value = true;
    error.value = null;

    try {
      const response = await chatApi.sendMessage(content, messages.value.slice(0, -1), lang);
      addMessage({ role: 'assistant', content: response.answer });
    } catch (err: any) {
      error.value = err.message || '发送失败，请稍后重试';
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * 流式发送消息（SSE）
   */
  async function sendMessageStream(content: string) {
    if (!content.trim() || isLoading.value) return;

    const lang = useLanguageStore().currentLang;

    addMessage({ role: 'user', content: content.trim() });
    isLoading.value = true;
    error.value = null;

    // 先插入一条空的 assistant 消息，后续流式填充
    addMessage({ role: 'assistant', content: '' });
    const assistantIndex = messages.value.length - 1;

    try {
      const stream = await chatApi.sendMessageStream(content, messages.value.slice(0, -2), lang);
      const reader = stream.getReader();
      const decoder = new TextDecoder();

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // 按行解析 SSE 事件
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';  // 保留不完整的行

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;

          const data = trimmed.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            if (parsed.token) {
              messages.value[assistantIndex].content += parsed.token;
            }
            // 如果后端返回了 daily limit 标记
            if (parsed.dailyLimitReached) {
              messages.value[assistantIndex].content = '';
              error.value = '__DAILY_LIMIT__';
            }
          } catch {
            // 忽略解析错误
          }
        }
      }
    } catch (err: any) {
      error.value = err.message || '连接失败，请稍后重试';
      messages.value[assistantIndex].content = '抱歉，发生了错误，请重试。';
    } finally {
      isLoading.value = false;
    }
  }

  return {
    messages,
    isLoading,
    error,
    isOpen,
    hasMessages,
    addMessage,
    clearMessages,
    toggleChat,
    openChat,
    closeChat,
    sendMessage,
    sendMessageStream,
  };
});
