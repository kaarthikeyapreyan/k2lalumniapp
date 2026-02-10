import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ProfileState, Profile, PrivacySettings } from '../types';
import { getProfile, updateProfile, updatePrivacySettings } from '../mock/services/profileService';
import { currentUserProfile } from '../mock/data/profiles';

const initialState: ProfileState = {
  currentProfile: null,
  viewedProfile: null,
  isLoading: false,
  error: null,
};

export const fetchCurrentProfile = createAsyncThunk(
  'profile/fetchCurrent',
  async (userId: string, { rejectWithValue }) => {
    try {
      return await getProfile(userId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchProfileById = createAsyncThunk(
  'profile/fetchById',
  async (userId: string, { rejectWithValue }) => {
    try {
      return await getProfile(userId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const saveProfile = createAsyncThunk(
  'profile/save',
  async (
    { userId, updates }: { userId: string; updates: Partial<Profile> },
    { rejectWithValue }
  ) => {
    try {
      return await updateProfile(userId, updates);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const savePrivacySettings = createAsyncThunk(
  'profile/savePrivacy',
  async (
    { userId, settings }: { userId: string; settings: PrivacySettings },
    { rejectWithValue }
  ) => {
    try {
      return await updatePrivacySettings(userId, settings);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearViewedProfile: (state) => {
      state.viewedProfile = null;
    },
    setCurrentProfile: (state, action: PayloadAction<Profile>) => {
      state.currentProfile = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCurrentProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProfile = action.payload;
      })
      .addCase(fetchCurrentProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchProfileById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProfileById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.viewedProfile = action.payload;
      })
      .addCase(fetchProfileById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(saveProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(saveProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProfile = action.payload;
      })
      .addCase(saveProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(savePrivacySettings.fulfilled, (state, action) => {
        state.currentProfile = action.payload;
      });
  },
});

export const { clearError, clearViewedProfile, setCurrentProfile } = profileSlice.actions;
export default profileSlice.reducer;
