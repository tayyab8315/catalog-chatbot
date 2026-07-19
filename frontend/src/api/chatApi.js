const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const CHAT_ENDPOINT = import.meta.env.VITE_CHAT_ENDPOINT || "/api/chat";
const THREAD_STORAGE_KEY = "product-catalog-chat-thread-id";
const DEFAULT_THREAD_ID = import.meta.env.VITE_DEFAULT_THREAD_ID || "";

function createThreadId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `thread-${Date.now()}`;
}

export function getThreadId() {
  if (typeof window === "undefined") {
    return DEFAULT_THREAD_ID || createThreadId();
  }

  const existingThreadId = window.localStorage.getItem(THREAD_STORAGE_KEY);

  if (existingThreadId) {
    return existingThreadId;
  }

  const nextThreadId = DEFAULT_THREAD_ID || createThreadId();
  window.localStorage.setItem(THREAD_STORAGE_KEY, nextThreadId);
  return nextThreadId;
}

export async function sendChatMessage(message) {
  const threadId = getThreadId();
  const response = await fetch(`${API_BASE_URL}${CHAT_ENDPOINT}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message,
      thread_id: threadId
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Unable to send message. HTTP ${response.status}`);
  }

  return response.json();
}
