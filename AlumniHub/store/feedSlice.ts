import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { FeedState, FeedItem, FeedComment, FeedFilter, FeedSort } from '../types';
import * as feedService from '../mock/services/feedService';
import websocketService, { WebSocketEvent } from '../mock/services/websocketService';

const initialState: FeedState = {
  items: [],
  filteredItems: [],
  currentItem: null,
  filter: FeedFilter.ALL,
  sort: FeedSort.LATEST,
  page: 1,
  hasMore: true,
  isLoading: false,
  error: null,
  isRealtimeConnected: false,
};

export const fetchFeed = createAsyncThunk(
  'feed/fetchFeed',
  async (
    { page, filter, sort }: { page: number; filter: FeedFilter; sort: FeedSort },
    { rejectWithValue }
  ) => {
    try {
      return await feedService.getFeed(page, { filter, sort });
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMoreFeed = createAsyncThunk(
  'feed/fetchMoreFeed',
  async (
    { page, filter, sort }: { page: number; filter: FeedFilter; sort: FeedSort },
    { rejectWithValue }
  ) => {
    try {
      return await feedService.getFeed(page, { filter, sort });
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchFeedItemById = createAsyncThunk(
  'feed/fetchFeedItemById',
  async (itemId: string, { rejectWithValue }) => {
    try {
      return await feedService.getFeedItemById(itemId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createPost = createAsyncThunk(
  'feed/createPost',
  async (
    data: {
      content: string;
      images?: string[];
      mediaUrl?: string;
      type?: FeedItem['type'];
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

export const updatePost = createAsyncThunk(
  'feed/updatePost',
  async (
    { postId, data }: { postId: string; data: { content?: string; images?: string[] } },
    { rejectWithValue }
  ) => {
    try {
      return await feedService.updatePost(postId, data);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deletePost = createAsyncThunk(
  'feed/deletePost',
  async (postId: string, { rejectWithValue }) => {
    try {
      await feedService.deletePost(postId);
      return postId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const likePost = createAsyncThunk(
  'feed/likePost',
  async (postId: string, { rejectWithValue }) => {
    try {
      return await feedService.likePost(postId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const addComment = createAsyncThunk(
  'feed/addComment',
  async (
    { postId, content }: { postId: string; content: string },
    { rejectWithValue }
  ) => {
    try {
      return await feedService.addComment(postId, content);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const likeComment = createAsyncThunk(
  'feed/likeComment',
  async (commentId: string, { rejectWithValue }) => {
    try {
      return await feedService.likeComment(commentId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const sharePost = createAsyncThunk(
  'feed/sharePost',
  async (
    { postId, content }: { postId: string; content?: string },
    { rejectWithValue }
  ) => {
    try {
      return await feedService.sharePost(postId, content);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const connectRealtime = createAsyncThunk(
  'feed/connectRealtime',
  async (_, { dispatch }) => {
    await websocketService.connect();
    
    // Subscribe to WebSocket events
    websocketService.subscribe('new_post', (event: WebSocketEvent) => {
      dispatch(feedSlice.actions.handleRealtimeNewPost(event.data as FeedItem));
    });
    
    websocketService.subscribe('post_like', (event: WebSocketEvent) => {
      dispatch(feedSlice.actions.handleRealtimePostLike(event.data as { postId: string; userId: string }));
    });
    
    websocketService.subscribe('post_comment', (event: WebSocketEvent) => {
      dispatch(feedSlice.actions.handleRealtimePostComment(event.data as FeedComment));
    });
    
    return true;
  }
);

export const disconnectRealtime = createAsyncThunk(
  'feed/disconnectRealtime',
  async () => {
    websocketService.disconnect();
    return false;
  }
);

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<FeedFilter>) => {
      state.filter = action.payload;
      state.page = 1;
      state.items = [];
    },
    setSort: (state, action: PayloadAction<FeedSort>) => {
      state.sort = action.payload;
      state.page = 1;
      state.items = [];
    },
    clearError: (state) => {
      state.error = null;
    },
    setCurrentItem: (state, action: PayloadAction<FeedItem | null>) => {
      state.currentItem = action.payload;
    },
    handleRealtimeNewPost: (state, action: PayloadAction<FeedItem>) => {
      // Only add if it matches current filter
      const newPost = action.payload;
      const shouldAdd = 
        state.filter === FeedFilter.ALL ||
        (state.filter === FeedFilter.POSTS && (newPost.type === 'post' || newPost.type === 'milestone')) ||
        (state.filter === FeedFilter.EVENTS && newPost.type === 'event') ||
        (state.filter === FeedFilter.JOBS && newPost.type === 'job') ||
        (state.filter === FeedFilter.MEDIA && (newPost.type === 'media' || newPost.images?.length));
      
      if (shouldAdd && state.sort === FeedSort.LATEST) {
        state.items = [newPost, ...state.items];
      }
    },
    handleRealtimePostLike: (state, action: PayloadAction<{ postId: string; userId: string }>) => {
      const { postId, userId } = action.payload;
      const itemIndex = state.items.findIndex(item => item.id === postId);
      if (itemIndex !== -1) {
        const isLiked = state.items[itemIndex].likes.includes(userId);
        if (!isLiked) {
          state.items[itemIndex].likes.push(userId);
        }
      }
    },
    handleRealtimePostComment: (state, action: PayloadAction<FeedComment>) => {
      const comment = action.payload;
      const itemIndex = state.items.findIndex(item => item.id === comment.postId);
      if (itemIndex !== -1) {
        state.items[itemIndex].comments.push(comment);
      }
      if (state.currentItem?.id === comment.postId) {
        state.currentItem.comments.push(comment);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch feed
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
      // Fetch more feed
      .addCase(fetchMoreFeed.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMoreFeed.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = [...state.items, ...action.payload.items];
        state.hasMore = action.payload.hasMore;
        state.page += 1;
      })
      .addCase(fetchMoreFeed.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch feed item by id
      .addCase(fetchFeedItemById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFeedItemById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentItem = action.payload;
      })
      .addCase(fetchFeedItemById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create post
      .addCase(createPost.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createPost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update post
      .addCase(updatePost.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentItem?.id === action.payload.id) {
          state.currentItem = action.payload;
        }
      })
      // Delete post
      .addCase(deletePost.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
        if (state.currentItem?.id === action.payload) {
          state.currentItem = null;
        }
      })
      // Like post
      .addCase(likePost.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentItem?.id === action.payload.id) {
          state.currentItem = action.payload;
        }
      })
      // Add comment
      .addCase(addComment.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.postId);
        if (index !== -1) {
          state.items[index].comments.push(action.payload);
        }
        if (state.currentItem?.id === action.payload.postId) {
          state.currentItem.comments.push(action.payload);
        }
      })
      // Like comment
      .addCase(likeComment.fulfilled, (state, action) => {
        const itemIndex = state.items.findIndex(item => 
          item.comments.some(c => c.id === action.payload.id)
        );
        if (itemIndex !== -1) {
          const commentIndex = state.items[itemIndex].comments.findIndex(
            c => c.id === action.payload.id
          );
          if (commentIndex !== -1) {
            state.items[itemIndex].comments[commentIndex] = action.payload;
          }
        }
        if (state.currentItem) {
          const commentIndex = state.currentItem.comments.findIndex(
            c => c.id === action.payload.id
          );
          if (commentIndex !== -1) {
            state.currentItem.comments[commentIndex] = action.payload;
          }
        }
      })
      // Share post
      .addCase(sharePost.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      // Realtime connection
      .addCase(connectRealtime.fulfilled, (state) => {
        state.isRealtimeConnected = true;
      })
      .addCase(disconnectRealtime.fulfilled, (state) => {
        state.isRealtimeConnected = false;
      });
  },
});

export const { setFilter, setSort, clearError, setCurrentItem } = feedSlice.actions;
export default feedSlice.reducer;
