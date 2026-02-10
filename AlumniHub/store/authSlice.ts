import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthState, User } from '../types';
import { mockLogin, mockSignup, mockOAuthLogin, mockLogout } from '../mock/services/authService';

const AUTH_STORAGE_KEY = '@alumnihub_auth';

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  isLoading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await mockLogin(credentials);
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(response));
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const signup = createAsyncThunk(
  'auth/signup',
  async (
    data: {
      name: string;
      email: string;
      password: string;
      graduationYear: number;
      institution: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await mockSignup(data);
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(response));
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const oauthLogin = createAsyncThunk(
  'auth/oauthLogin',
  async (provider: 'google' | 'linkedin', { rejectWithValue }) => {
    try {
      const response = await mockOAuthLogin(provider);
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(response));
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await mockLogout();
  await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
});

export const rehydrateAuth = createAsyncThunk('auth/rehydrate', async () => {
  const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return null;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(signup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(signup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(oauthLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(oauthLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(oauthLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      .addCase(rehydrateAuth.fulfilled, (state, action) => {
        if (action.payload) {
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.token = action.payload.token;
        }
      });
  },
});

export const { clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;
