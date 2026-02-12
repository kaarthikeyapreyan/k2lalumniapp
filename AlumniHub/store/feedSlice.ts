import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { FeedItem, FeedState, FeedSort, FeedFilter, FeedItemType, FeedComment } from '../types';
import * as feedService from '../mock/services/feedService';
import { websocketService } from '../mock/services/websocketService';

const initialState: FeedState = {
  items: [],
  hasMore: true,
  page: 1,
  sort: FeedSort.LATEST,
  filter: FeedFilter.ALL,
  isLoading: false,
  error: null,
  refreshing: false,
  isRealtimeConnected: false,
};

export const fetchFeed = createAsyncThunk(
  'feed/fetchFeed',
  async ({ page, filter, sort }: { page: number; filter: FeedFilter; sort: FeedSort }) => {
    // Current service expects FeedFilter interface, but UI uses enum
    // We'll normalize this in the service or here.
    return await feedService.getFeed(page, sort, filter as any);
  }
);

export const fetchMoreFeed = createAsyncThunk(
  'feed/fetchMoreFeed',
  async ({ page, filter, sort }: { page: number; filter: FeedFilter; sort: FeedSort }) => {
    return await feedService.getFeed(page, sort, filter as any);
  }
);

export const createPost = createAsyncThunk(
  'feed/createPost',
  async ({ content, images, visibility, groupId }: {
    content: string;
    images?: string[];
    visibility?: any;
    groupId?: string
  }) => {
    return await feedService.createPost(content, images, visibility, groupId);
  }
);

export const likePost = createAsyncThunk(
  'feed/likePost',
  async (postId: string) => {
    return await feedService.likeItem(postId);
  }
);

export const addComment = createAsyncThunk(
  'feed/addComment',
  async ({ postId, content }: { postId: string; content: string }) => {
    return await feedService.addComment(postId, content);
  }
);

export const sharePost = createAsyncThunk(
  'feed/sharePost',
  async ({ postId, content }: { postId: string; content?: string }) => {
    return await feedService.sharePost(postId, content);
  }
);

export const connectRealtime = createAsyncThunk(
  'feed/connectRealtime',
  async (_, { dispatch }) => {
    websocketService.connect();

    websocketService.subscribe('new_post', (event) => {
      dispatch(handleRealtimeNewPost(event.data as FeedItem));
    });

    websocketService.subscribe('post_like', (event) => {
      const data = event.data as { postId: string; userId: string };
      dispatch(handleRealtimeLikeUpdate({ itemId: data.postId, likes: [] })); // We don't have full likes list in event
    });

    websocketService.subscribe('post_comment', (event) => {
      const comment = event.data as FeedComment;
      dispatch(handleRealtimeCommentUpdate({ itemId: comment.postId, comment }));
    });

    return true;
  }
);

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    setSort: (state, action: PayloadAction<FeedSort>) => {
      state.sort = action.payload;
      state.page = 1;
      state.items = [];
      state.hasMore = true;
    },
    setFilter: (state, action: PayloadAction<FeedFilter>) => {
      state.filter = action.payload;
      state.page = 1;
      state.items = [];
      state.hasMore = true;
    },
    resetFeed: (state) => {
      state.page = 1;
      state.items = [];
      state.hasMore = true;
    },
    handleRealtimeNewPost: (state, action: PayloadAction<FeedItem>) => {
      const post = action.payload;
      if (!state.items.find(i => i.id === post.id)) {
        state.items = [post, ...state.items];
      }
    },
    handleRealtimeLikeUpdate: (state, action: PayloadAction<{ itemId: string; likes: string[] }>) => {
      const item = state.items.find(i => i.id === action.payload.itemId);
      if (item) {
        // Since we don't have full list, we might need to handle this differently
        // or just let the next fetch handle it.
      }
    },
    handleRealtimeCommentUpdate: (state, action: PayloadAction<{ itemId: string; comment: any }>) => {
      const item = state.items.find(i => i.id === action.payload.itemId);
      if (item) {
        item.comments.push(action.payload.comment);
      }
    },
    handleRealtimeDelete: (state, action: PayloadAction<{ itemId: string }>) => {
      state.items = state.items.filter(i => i.id !== action.payload.itemId);
    },
    disconnectRealtime: (state) => {
      websocketService.disconnect();
      state.isRealtimeConnected = false;
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
        state.error = action.error.message || 'Failed to fetch feed';
      })
      .addCase(fetchMoreFeed.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMoreFeed.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = [...state.items, ...action.payload.items];
        state.hasMore = action.payload.hasMore;
        state.page += 1;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.items = [action.payload, ...state.items];
      })
      .addCase(connectRealtime.fulfilled, (state) => {
        state.isRealtimeConnected = true;
      });
  },
});

export const {
  setSort,
  setFilter,
  resetFeed,
  handleRealtimeNewPost,
  handleRealtimeLikeUpdate,
  handleRealtimeCommentUpdate,
  handleRealtimeDelete,
  disconnectRealtime
} = feedSlice.actions;

export default feedSlice.reducer;
