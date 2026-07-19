import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getThreadId, sendChatMessage } from "../../api/chatApi";

const VISIBLE_MESSAGE_TYPES = new Set(["human", "ai"]);

const createLocalMessage = (overrides) => ({
  id: overrides.id || crypto.randomUUID(),
  role: overrides.role || "assistant",
  content: overrides.content || "",
  timestamp: overrides.timestamp || new Date().toISOString()
});

const toUiMessage = (message, index) => {
  if (!VISIBLE_MESSAGE_TYPES.has(message.type)) {
    return null;
  }

  return createLocalMessage({
    id: message.id || `server-message-${index}`,
    role: message.type === "human" ? "user" : "assistant",
    content: typeof message.content === "string" ? message.content : "",
    timestamp:
      message.response_metadata?.created_at || message.timestamp || undefined
  });
};

const mergeSequentialMessages = (messages) => {
  const mergedMessages = [];

  for (const message of messages) {
    const previousMessage = mergedMessages[mergedMessages.length - 1];

    if (
      previousMessage &&
      previousMessage.role === message.role &&
      message.role === "assistant"
    ) {
      previousMessage.content = `${previousMessage.content}\n\n${message.content}`.trim();
      previousMessage.timestamp = message.timestamp || previousMessage.timestamp;
      continue;
    }

    mergedMessages.push(message);
  }

  return mergedMessages;
};

const normalizeMessages = (messages) =>
  mergeSequentialMessages(
    messages.map(toUiMessage).filter(Boolean)
  );

export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async (message, thunkApi) => {
    try {
      const data = await sendChatMessage(message);
      return normalizeMessages(data.history?.messages || []);
    } catch (error) {
      return thunkApi.rejectWithValue(
        error.message || "Something went wrong while sending the message."
      );
    }
  }
);

const initialState = {
  messages: [],
  isLoading: false,
  error: null,
  threadId: ""
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    loadWelcomeMessage(state) {
      if (!state.threadId) {
        state.threadId = getThreadId();
      }

      if (state.messages.length > 0) {
        return;
      }

      state.messages = [
        createLocalMessage({
          role: "assistant",
          content:
            "Hi, I can help with product search, comparisons, prices, and recommendations. What are you shopping for today?"
        })
      ];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state, action) => {
        state.isLoading = true;
        state.error = null;
        state.threadId = getThreadId();
        state.messages.push(
          createLocalMessage({
            role: "user",
            content: action.meta.arg
          })
        );
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.messages = action.payload.length > 0 ? action.payload : state.messages;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to send message.";
      });
  }
});

export const { loadWelcomeMessage } = chatSlice.actions;
export const selectChat = (state) => state.chat;

export default chatSlice.reducer;
