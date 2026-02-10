import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { MessagingState, Message, MessageType } from '../types';
import {
  getConversations,
  getConversation,
  sendMessage,
  markAsRead,
  createConversation,
} from '../mock/services/messagingService';

const initialState: MessagingState = {
  conversations: [],
  currentConversation: null,
  isLoading: false,
  error: null,
  typingUsers: {},
};

export const fetchConversations = createAsyncThunk(
  'messaging/fetchConversations',
  async (userId: string, { rejectWithValue }) => {
    try {
      return await getConversations(userId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchConversation = createAsyncThunk(
  'messaging/fetchConversation',
  async (conversationId: string, { rejectWithValue }) => {
    try {
      return await getConversation(conversationId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const sendNewMessage = createAsyncThunk(
  'messaging/sendMessage',
  async (
    {
      conversationId,
      senderId,
      content,
      type,
    }: {
      conversationId: string;
      senderId: string;
      content: string;
      type?: MessageType;
    },
    { rejectWithValue }
  ) => {
    try {
      return await sendMessage(conversationId, senderId, content, type);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const markConversationAsRead = createAsyncThunk(
  'messaging/markAsRead',
  async ({ conversationId, userId }: { conversationId: string; userId: string }, { rejectWithValue }) => {
    try {
      await markAsRead(conversationId, userId);
      return conversationId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const startConversation = createAsyncThunk(
  'messaging/startConversation',
  async ({ currentUserId, otherUserId }: { currentUserId: string; otherUserId: string }, { rejectWithValue }) => {
    try {
      return await createConversation(currentUserId, otherUserId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const messagingSlice = createSlice({
  name: 'messaging',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addOptimisticMessage: (state, action: PayloadAction<Message>) => {
      if (state.currentConversation) {
        state.currentConversation.messages.push(action.payload);
        state.currentConversation.lastMessage = action.payload;
      }
    },
    setTyping: (state, action: PayloadAction<{ conversationId: string; userId: string; isTyping: boolean }>) => {
      const { conversationId, userId, isTyping } = action.payload;
      if (!state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = [];
      }
      if (isTyping && !state.typingUsers[conversationId].includes(userId)) {
        state.typingUsers[conversationId].push(userId);
      } else if (!isTyping) {
        state.typingUsers[conversationId] = state.typingUsers[conversationId].filter(id => id !== userId);
      }
    },
    receiveMessage: (state, action: PayloadAction<{ conversationId: string; message: Message }>) => {
      const { conversationId, message } = action.payload;
      const conversation = state.conversations.find(c => c.id === conversationId);
      if (conversation) {
        conversation.messages.push(message);
        conversation.lastMessage = message;
        conversation.unreadCount += 1;
      }
      if (state.currentConversation?.id === conversationId) {
        state.currentConversation.messages.push(message);
        state.currentConversation.lastMessage = message;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchConversation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConversation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentConversation = action.payload;
      })
      .addCase(fetchConversation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(sendNewMessage.fulfilled, (state, action) => {
        if (state.currentConversation) {
          const existingIndex = state.currentConversation.messages.findIndex(
            m => m.id === action.payload.id || m.status === 'sending'
          );
          if (existingIndex >= 0) {
            state.currentConversation.messages[existingIndex] = action.payload;
          } else {
            state.currentConversation.messages.push(action.payload);
          }
          state.currentConversation.lastMessage = action.payload;
        }
      })
      .addCase(markConversationAsRead.fulfilled, (state, action) => {
        const conversation = state.conversations.find(c => c.id === action.payload);
        if (conversation) {
          conversation.unreadCount = 0;
        }
        if (state.currentConversation?.id === action.payload) {
          state.currentConversation.unreadCount = 0;
        }
      })
      .addCase(startConversation.fulfilled, (state, action) => {
        state.currentConversation = action.payload;
        const exists = state.conversations.find(c => c.id === action.payload.id);
        if (!exists) {
          state.conversations.unshift(action.payload);
        }
      });
  },
});

export const { clearError, addOptimisticMessage, setTyping, receiveMessage } = messagingSlice.actions;
export default messagingSlice.reducer;
