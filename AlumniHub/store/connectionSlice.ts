import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ConnectionState } from '../types';
import {
  getConnections,
  getPendingRequests,
  getSentRequests,
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
} from '../mock/services/connectionService';

const initialState: ConnectionState = {
  connections: [],
  pendingRequests: [],
  sentRequests: [],
  isLoading: false,
  error: null,
};

export const fetchConnections = createAsyncThunk(
  'connection/fetchConnections',
  async (userId: string, { rejectWithValue }) => {
    try {
      return await getConnections(userId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPendingRequests = createAsyncThunk(
  'connection/fetchPending',
  async (userId: string, { rejectWithValue }) => {
    try {
      return await getPendingRequests(userId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchSentRequests = createAsyncThunk(
  'connection/fetchSent',
  async (userId: string, { rejectWithValue }) => {
    try {
      return await getSentRequests(userId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const sendRequest = createAsyncThunk(
  'connection/sendRequest',
  async ({ userId, targetUserId }: { userId: string; targetUserId: string }, { rejectWithValue }) => {
    try {
      return await sendConnectionRequest(userId, targetUserId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const acceptRequest = createAsyncThunk(
  'connection/acceptRequest',
  async (connectionId: string, { rejectWithValue }) => {
    try {
      return await acceptConnectionRequest(connectionId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const rejectRequest = createAsyncThunk(
  'connection/rejectRequest',
  async (connectionId: string, { rejectWithValue }) => {
    try {
      await rejectConnectionRequest(connectionId);
      return connectionId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const connectionSlice = createSlice({
  name: 'connection',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConnections.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConnections.fulfilled, (state, action) => {
        state.isLoading = false;
        state.connections = action.payload;
      })
      .addCase(fetchConnections.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchPendingRequests.fulfilled, (state, action) => {
        state.pendingRequests = action.payload;
      })
      .addCase(fetchSentRequests.fulfilled, (state, action) => {
        state.sentRequests = action.payload;
      })
      .addCase(sendRequest.fulfilled, (state, action) => {
        state.sentRequests.push(action.payload);
      })
      .addCase(acceptRequest.fulfilled, (state, action) => {
        state.connections.push(action.payload);
        state.pendingRequests = state.pendingRequests.filter(r => r.id !== action.payload.id);
      })
      .addCase(rejectRequest.fulfilled, (state, action) => {
        state.pendingRequests = state.pendingRequests.filter(r => r.id !== action.payload);
      });
  },
});

export const { clearError } = connectionSlice.actions;
export default connectionSlice.reducer;
