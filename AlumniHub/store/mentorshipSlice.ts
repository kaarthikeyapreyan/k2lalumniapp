import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { MentorshipState, Mentorship, MentorshipRequest, MentorshipRequestStatus, Resource, Recommendation } from '../types';
import * as mentorshipService from '../mock/services/mentorshipService';

const initialState: MentorshipState = {
  mentorships: [],
  myMentorships: [],
  requests: [],
  myRequests: [],
  currentMentorship: null,
  isLoading: false,
  error: null,
};

export const fetchMentorships = createAsyncThunk(
  'mentorship/fetchMentorships',
  async (_, { rejectWithValue }) => {
    try {
      return await mentorshipService.getMentorships();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMentorshipById = createAsyncThunk(
  'mentorship/fetchMentorshipById',
  async (mentorshipId: string, { rejectWithValue }) => {
    try {
      return await mentorshipService.getMentorshipById(mentorshipId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMyMentorships = createAsyncThunk(
  'mentorship/fetchMyMentorships',
  async (_, { rejectWithValue }) => {
    try {
      return await mentorshipService.getMyMentorships();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createMentorship = createAsyncThunk(
  'mentorship/createMentorship',
  async (data: {
    title: string;
    expertise: string[];
    availability: string;
    mentoringStyle: string;
    description: string;
    maxMentees: number;
  }, { rejectWithValue }) => {
    try {
      return await mentorshipService.createMentorship(data);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const requestMentorship = createAsyncThunk(
  'mentorship/requestMentorship',
  async (data: {
    mentorshipId: string;
    message: string;
    goals: string[];
  }, { rejectWithValue }) => {
    try {
      return await mentorshipService.requestMentorship(data.mentorshipId, {
        message: data.message,
        goals: data.goals,
      });
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const respondToRequest = createAsyncThunk(
  'mentorship/respondToRequest',
  async (data: { requestId: string; status: MentorshipRequestStatus }, { rejectWithValue }) => {
    try {
      return await mentorshipService.respondToRequest(data.requestId, data.status);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMyMentorshipRequests = createAsyncThunk(
  'mentorship/fetchMyMentorshipRequests',
  async (_, { rejectWithValue }) => {
    try {
      return await mentorshipService.getMyMentorshipRequests();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchIncomingRequests = createAsyncThunk(
  'mentorship/fetchIncomingRequests',
  async (_, { rejectWithValue }) => {
    try {
      return await mentorshipService.getIncomingRequests();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const giveRecommendation = createAsyncThunk(
  'mentorship/giveRecommendation',
  async (data: {
    recipientId: string;
    relationship: string;
    content: string;
  }, { rejectWithValue }) => {
    try {
      return await mentorshipService.giveRecommendation(data);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const mentorshipSlice = createSlice({
  name: 'mentorship',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentMentorship: (state, action: PayloadAction<Mentorship | null>) => {
      state.currentMentorship = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch mentorships
      .addCase(fetchMentorships.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMentorships.fulfilled, (state, action) => {
        state.isLoading = false;
        state.mentorships = action.payload;
      })
      .addCase(fetchMentorships.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch mentorship by id
      .addCase(fetchMentorshipById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMentorshipById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentMentorship = action.payload;
      })
      .addCase(fetchMentorshipById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch my mentorships
      .addCase(fetchMyMentorships.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyMentorships.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myMentorships = action.payload;
      })
      .addCase(fetchMyMentorships.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create mentorship
      .addCase(createMentorship.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createMentorship.fulfilled, (state, action) => {
        state.isLoading = false;
        state.mentorships.unshift(action.payload);
        state.myMentorships.unshift(action.payload);
      })
      .addCase(createMentorship.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Request mentorship
      .addCase(requestMentorship.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(requestMentorship.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myRequests.push(action.payload);
      })
      .addCase(requestMentorship.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Respond to request
      .addCase(respondToRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(respondToRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        const requestIndex = state.requests.findIndex(r => r.id === action.payload.id);
        if (requestIndex !== -1) {
          state.requests[requestIndex] = action.payload;
        }
        // Update mentorship currentMentees count
        const mentorshipIndex = state.mentorships.findIndex(m => m.id === action.payload.mentorshipId);
        if (mentorshipIndex !== -1 && action.payload.status === MentorshipRequestStatus.ACCEPTED) {
          state.mentorships[mentorshipIndex].currentMentees += 1;
        }
      })
      .addCase(respondToRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch my mentorship requests
      .addCase(fetchMyMentorshipRequests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyMentorshipRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myRequests = action.payload;
      })
      .addCase(fetchMyMentorshipRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch incoming requests
      .addCase(fetchIncomingRequests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchIncomingRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.requests = action.payload;
      })
      .addCase(fetchIncomingRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Give recommendation
      .addCase(giveRecommendation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(giveRecommendation.fulfilled, (state, action) => {
        state.isLoading = false;
        // Handle recommendation if needed
      })
      .addCase(giveRecommendation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentMentorship } = mentorshipSlice.actions;
export default mentorshipSlice.reducer;
