import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useLanguageStore } from 'src/stores/language';
import { chatApi, ChatMessage } from '../api/chat.api';

const STORAGE_KEY = 'ai-assistant-conversations';

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function loadFromSession(): Conversation[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

function saveToSession(conversations: Conversation[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch { /* ignore quota errors */ }
}

export const useChatStore = defineStore('chat', () => {
  // ── state ──────────────────────────────────────────
  const conversations = ref<Conversation[]>(loadFromSession());
  const currentConversationId = ref<string | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const isOpen = ref(false);

  // ── computed ───────────────────────────────────────
  const currentConversation = computed(() =>
    currentConversationId.value
      ? conversations.value.find(c => c.id === currentConversationId.value) || null
      : null
  );

  const messages = computed(() => currentConversation.value?.messages || []);

  const hasMessages = computed(() => messages.value.length > 0);

  const isNewConversation = computed(() => currentConversationId.value === null);

  const sortedConversations = computed(() =>
    [...conversations.value].sort((a, b) => b.updatedAt - a.updatedAt)
  );

  // ── abort controller for streaming ──────────────────
  let currentAbortController: AbortController | null = null;

  function abortCurrentStream() {
    if (currentAbortController) {
      currentAbortController.abort();
      currentAbortController = null;
    }
  }

  // ── persistence ────────────────────────────────────
  function persist() {
    saveToSession(conversations.value);
  }

  // ── conversation CRUD ──────────────────────────────
  function createConversation(): Conversation {
    const conv: Conversation = {
      id: generateId(),
      title: '',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    conversations.value.unshift(conv);
    currentConversationId.value = conv.id;
    persist();
    return conv;
  }

  function deleteConversation(id: string) {
    const idx = conversations.value.findIndex(c => c.id === id);
    if (idx === -1) return;

    abortCurrentStream();
    conversations.value.splice(idx, 1);

    if (currentConversationId.value === id) {
      // Switch to the most recent conversation, or null if none left
      if (conversations.value.length > 0) {
        const sorted = [...conversations.value].sort((a, b) => b.updatedAt - a.updatedAt);
        currentConversationId.value = sorted[0].id;
      } else {
        currentConversationId.value = null;
      }
      error.value = null;
    }
    persist();
  }

  function switchConversation(id: string) {
    if (conversations.value.some(c => c.id === id)) {
      abortCurrentStream();
      currentConversationId.value = id;
      error.value = null;
    }
  }

  /**
   * Enter "new conversation" state (blank page, no sidebar selection).
   * Returns false if already in new-conversation state.
   */
  function newConversation(): boolean {
    if (currentConversationId.value === null) return false;
    abortCurrentStream();
    currentConversationId.value = null;
    error.value = null;
    return true;
  }

  // ── messaging ──────────────────────────────────────
  function generateTitle(content: string): string {
    const trimmed = content.trim();
    return trimmed.length > 20 ? trimmed.slice(0, 20) + '…' : trimmed;
  }

  function addMessage(msg: ChatMessage) {
    const conv = currentConversation.value;
    if (!conv) return;
    conv.messages.push(msg);
    conv.updatedAt = Date.now();
    if (!conv.title && msg.role === 'user') {
      conv.title = generateTitle(msg.content);
    }
    persist();
  }

  /**
   * Delete a user message and its corresponding assistant reply.
   * `index` is the index of the user message.
   */
  function deleteMessagePair(index: number) {
    const conv = currentConversation.value;
    if (!conv) return;
    // Remove user message + assistant reply (index and index+1)
    conv.messages.splice(index, 2);
    conv.updatedAt = Date.now();
    persist();

    // If conversation is now empty, delete it and switch to new conversation state
    if (conv.messages.length === 0) {
      const convId = conv.id;
      // Switch to new conversation state first
      currentConversationId.value = null;
      error.value = null;
      // Remove the empty conversation from the list
      const idx = conversations.value.findIndex(c => c.id === convId);
      if (idx !== -1) {
        conversations.value.splice(idx, 1);
      }
      persist();
    }
  }

  /**
   * Edit a user message: remove it and everything after it,
   * then re-send with the new content.
   */
  async function editMessage(index: number, newContent: string) {
    const conv = currentConversation.value;
    if (!conv) return;

    abortCurrentStream();
    isLoading.value = false;
    error.value = null;

    // Remove the user message and everything after
    conv.messages.splice(index);
    conv.updatedAt = Date.now();
    persist();

    // Re-send with new content
    await sendMessageStream(newContent);
  }

  /**
   * Regenerate the assistant reply for the AI message at `index`.
   * Finds the preceding user message, removes the old reply, and re-sends.
   */
  async function regenerateMessage(index: number) {
    const conv = currentConversation.value;
    if (!conv) return;

    // index is the AI message index; find the preceding user message
    const aiMsg = conv.messages[index];
    if (!aiMsg || aiMsg.role !== 'assistant') return;

    // Find the user message immediately before this AI message
    let userIndex = index - 1;
    while (userIndex >= 0 && conv.messages[userIndex].role !== 'user') {
      userIndex--;
    }
    if (userIndex < 0) return;

    const userMsg = conv.messages[userIndex];
    abortCurrentStream();

    // Remove everything from the user message onward, then re-add user message
    conv.messages.splice(userIndex);
    conv.updatedAt = Date.now();
    persist();

    // Re-send
    await sendMessageStream(userMsg.content);
  }

  async function sendMessage(content: string) {
    if (!content.trim() || isLoading.value) return;

    if (!currentConversation.value) {
      createConversation();
    }

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

  async function sendMessageStream(content: string) {
    if (!content.trim() || isLoading.value) return;

    if (!currentConversation.value) {
      createConversation();
    }

    const lang = useLanguageStore().currentLang;
    const conv = currentConversation.value!;

    addMessage({ role: 'user', content: content.trim() });
    isLoading.value = true;
    error.value = null;

    conv.messages.push({ role: 'assistant', content: '' });
    const assistantIndex = conv.messages.length - 1;
    persist();

    // History = everything except the last two messages we just added (user + empty assistant)
    const history = conv.messages.slice(0, -2).map(m => ({ role: m.role, content: m.content }));

    currentAbortController = new AbortController();

    try {
      const stream = await chatApi.sendMessageStream(content, history, lang, currentAbortController.signal);
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          const data = trimmed.slice(6);
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.token) {
              conv.messages[assistantIndex].content += parsed.token;
            }
            if (parsed.dailyLimitReached) {
              conv.messages[assistantIndex].content = '';
              error.value = '__DAILY_LIMIT__';
            }
          } catch { /* ignore */ }
        }
        persist();
      }
    } catch (err: any) {
      error.value = err.message || '连接失败，请稍后重试';
      conv.messages[assistantIndex].content = '抱歉，发生了错误，请重试。';
    } finally {
      isLoading.value = false;
      persist();
    }
  }

  // ── panel ──────────────────────────────────────────
  function toggleChat() {
    isOpen.value = !isOpen.value;
  }

  function openChat() {
    isOpen.value = true;
  }

  function closeChat() {
    isOpen.value = false;
  }

  return {
    conversations,
    sortedConversations,
    currentConversationId,
    currentConversation,
    messages,
    hasMessages,
    isNewConversation,
    isLoading,
    error,
    isOpen,
    createConversation,
    deleteConversation,
    switchConversation,
    newConversation,
    addMessage,
    editMessage,
    deleteMessagePair,
    regenerateMessage,
    sendMessage,
    sendMessageStream,
    toggleChat,
    openChat,
    closeChat,
    abortCurrentStream,
  };
});
