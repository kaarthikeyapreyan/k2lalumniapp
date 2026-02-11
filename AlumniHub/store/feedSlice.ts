import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { FeedState, FeedItem, FeedItemType, FeedSortOption, FeedFilter, FeedComment, PollOption } from '../types';
import * as feedService from '../mock/services/feedService';

const initialFilter: FeedFilter = {
  showPosts: true,
  showGroupActivity: true,
  showEvents: true,
  showJobs: true,
  showAchievements: true,
  mutedKeywords: [],
  mutedUserIds: [],
};

const initialState: FeedState = {
  items: [],
  hasMore: true,
  page: 1,
  sortBy: FeedSortOption.CHRONOLOGICAL,
  filter: initialFilter,
  isLoading: false,
  error: null,
  refreshing: false,
};

export const fetchFeed = createAsyncThunk(
  'feed/fetchFeed',
  async (
    { page, sortBy, filter }: { page: number; sortBy: FeedSortOption; filter: FeedFilter },
    { rejectWithValue }
  ) => {
    try {
      return await feedService.getFeed(page, sortBy, filter);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMoreFeed = createAsyncThunk(
  'feed/fetchMoreFeed',
  async (
    { page, sortBy, filter }: { page: number; sortBy: FeedSortOption; filter: FeedFilter },
    { rejectWithValue }
  ) => {
    try {
      return await feedService.getFeed(page, sortBy, filter);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createFeedPost = createAsyncThunk(
  'feed/createPost',
  async (
    data: {
      content: string;
      images?: string[];
      media?: string;
      mediaType?: 'video' | 'audio';
      visibility: string;
      pollOptions?: string[];
    },
    { rejectWithValue }
  ) => {
    try {
      return await feedService.createPost(data);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const likeFeedItem = createAsyncThunk(
  'feed/likeItem',
  async (itemId: string, { rejectWithValue }) => {
    try {
      return await feedService.likeItem(itemId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const unlikeFeedItem = createAsyncThunk(
  'feed/unlikeItem',
  async (itemId: string, { rejectWithValue }) => {
    try {
      return await feedService.unlikeItem(itemId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const addComment = createAsyncThunk(
  'feed/addComment',
  async (data: { itemId: string; content: string }, { rejectWithValue }) => {
    try {
      return await feedService.addComment(data.itemId, data.content);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const shareFeedItem = createAsyncThunk(
  'feed/shareItem',
  async (itemId: string, { rejectWithValue }) => {
    try {
      return await feedService.shareItem(itemId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const voteOnPoll = createAsyncThunk(
  'feed/voteOnPoll',
  async (data: { itemId: string; optionId: string }, { rejectWithValue }) => {
    try {
      return await feedService.voteOnPoll(data.itemId, data.optionId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const reportContent = createAsyncThunk(
  'feed/reportContent',
  async (
    data: { itemId: string; reason: string; details?: string },
    { rejectWithValue }
  ) => {
    try {
      return await feedService.reportContent(data.itemId, data.reason, data.details);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const muteUser = createAsyncThunk(
  'feed/muteUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      await feedService.muteUser(userId);
      return userId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const unmuteUser = createAsyncThunk(
  'feed/unmuteUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      await feedService.unmuteUser(userId);
      return userId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const addMutedKeyword = createAsyncThunk(
  'feed/addMutedKeyword',
  async (keyword: string, { rejectWithValue }) => {
    try {
      await feedService.addMutedKeyword(keyword);
      return keyword;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeMutedKeyword = createAsyncThunk(
  'feed/removeMutedKeyword',
  async (keyword: string, { rejectWithValue }) => {
    try {
      await feedService.removeMutedKeyword(keyword);
      return keyword;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSortBy: (state, action: PayloadAction<FeedSortOption>) => {
      state.sortBy = action.payload;
      state.page = 1;
      state.items = [];
      state.hasMore = true;
    },
    updateFilter: (state, action: PayloadAction<Partial<FeedFilter>>) => {
      state.filter = { ...state.filter, ...action.payload };
      state.page = 1;
      state.items = [];
      state.hasMore = true;
    },
    resetFilter: (state) => {
      state.filter = initialFilter;
      state.page = 1;
      state.items = [];
      state.hasMore = true;
    },
    setRefreshing: (state, action: PayloadAction<boolean>) => {
      state.refreshing = action.payload;
    },
    receiveRealtimeUpdate: (state, action: PayloadAction<FeedItem>) => {
      const exists = state.items.find(item => item.id === action.payload.id);
      if (!exists) {
        state.items.unshift(action.payload);
      }
    },
    updateItemLikes: (
      state,
      action: PayloadAction<{ itemId: string; likes: string[] }>
    ) => {
      const item = state.items.find(i => i.id === action.payload.itemId);
      if (item) {
        item.likes = action.payload.likes;
      }
    },
    updateItemComments: (
      state,
      action: PayloadAction<{ itemId: string; comments: FeedComment[] }>
    ) => {
      const item = state.items.find(i => i.id === action.payload.itemId);
      if (item) {
        item.comments = action.payload.comments;
      }
    },
    updatePollOptions: (
      state,
      action: PayloadAction<{ itemId: string; options: PollOption[] }>
    ) => {
      const item = state.items.find(i => i.id === action.payload.itemId);
      if (item) {
        item.pollOptions = action.payload.options;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeed.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.hasMore = action.payload.hasMore;
        state.page = 1;
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchMoreFeed.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMoreFeed.fulfilled, (state, action) => {
        state.isLoading = false;
        const existingIds = new Set(state.items.map(item => item.id));
        const newItems = action.payload.items.filter(item => !existingIds.has(item.id));
        state.items = [...state.items, ...newItems];
        state.hasMore = action.payload.hasMore;
        state.page += 1;
      })
      .addCase(fetchMoreFeed.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createFeedPost.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createFeedPost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createFeedPost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(likeFeedItem.fulfilled, (state, action) => {
        const item = state.items.find(i => i.id === action.payload.id);
        if (item) {
          item.likes = action.payload.likes;
        }
      })
      .addCase(unlikeFeedItem.fulfilled, (state, action) => {
        const item = state.items.find(i => i.id === action.payload.id);
        if (item) {
          item.likes = action.payload.likes;
        }
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const item = state.items.find(i => i.id === action.payload.feedItemId);
        if (item) {
          item.comments.push(action.payload);
        }
      })
      .addCase(shareFeedItem.fulfilled, (state, action) => {
        const item = state.items.find(i => i.id === action.payload.id);
        if (item) {
          item.shares = action.payload.shares;
        }
      })
      .addCase(voteOnPoll.fulfilled, (state, action) => {
        const item = state.items.find(i => i.id === action.payload.itemId);
        if (item && item.pollOptions) {
          item.pollOptions = action.payload.options;
        }
      })
      .addCase(muteUser.fulfilled, (state, action) => {
        if (!state.filter.mutedUserIds.includes(action.payload)) {
          state.filter.mutedUserIds.push(action.payload);
        }
        state.items = state.items.filter(item => item.authorId !== action.payload);
      })
      .addCase(unmuteUser.fulfilled, (state, action) => {
        state.filter.mutedUserIds = state.filter.mutedUserIds.filter(
          id => id !== action.payload
        );
      })
      .addCase(addMutedKeyword.fulfilled, (state, action) => {
        if (!state.filter.mutedKeywords.includes(action.payload)) {
          state.filter.mutedKeywords.push(action.payload);
        }
      })
      .addCase(removeMutedKeyword.fulfilled, (state, action) => {
        state.filter.mutedKeywords = state.filter.mutedKeywords.filter(
          k => k !== action.payload
        );
      });
  },
});

export const {
  clearError,
  setSortBy,
  updateFilter,
  resetFilter,
  setRefreshing,
  receiveRealtimeUpdate,
  updateItemLikes,
  updateItemComments,
  updatePollOptions,
} = feedSlice.actions;

export default feedSlice.reducer;
