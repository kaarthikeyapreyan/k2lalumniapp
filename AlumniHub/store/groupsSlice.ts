import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { GroupsState, Group, GroupPost, GroupPrivacy, GroupType } from '../types';
import * as groupService from '../mock/services/groupService';

const initialState: GroupsState = {
  groups: [],
  myGroups: [],
  currentGroup: null,
  posts: [],
  isLoading: false,
  error: null,
};

export const fetchGroups = createAsyncThunk(
  'groups/fetchGroups',
  async (_, { rejectWithValue }) => {
    try {
      return await groupService.getGroups();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMyGroups = createAsyncThunk(
  'groups/fetchMyGroups',
  async (_, { rejectWithValue }) => {
    try {
      return await groupService.getMyGroups();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchGroupById = createAsyncThunk(
  'groups/fetchGroupById',
  async (groupId: string, { rejectWithValue }) => {
    try {
      return await groupService.getGroupById(groupId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createGroup = createAsyncThunk(
  'groups/createGroup',
  async (data: {
    name: string;
    description: string;
    type: GroupType;
    privacy: GroupPrivacy;
    coverImage?: string;
  }, { rejectWithValue }) => {
    try {
      return await groupService.createGroup(data);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const joinGroup = createAsyncThunk(
  'groups/joinGroup',
  async (groupId: string, { rejectWithValue }) => {
    try {
      return await groupService.joinGroup(groupId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const leaveGroup = createAsyncThunk(
  'groups/leaveGroup',
  async (groupId: string, { rejectWithValue }) => {
    try {
      await groupService.leaveGroup(groupId);
      return groupId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchGroupPosts = createAsyncThunk(
  'groups/fetchGroupPosts',
  async (groupId: string, { rejectWithValue }) => {
    try {
      return await groupService.getGroupPosts(groupId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createPost = createAsyncThunk(
  'groups/createPost',
  async (data: {
    groupId: string;
    content: string;
    images?: string[];
    media?: string;
    isAnnouncement?: boolean;
  }, { rejectWithValue }) => {
    try {
      return await groupService.createPost(data.groupId, {
        content: data.content,
        images: data.images,
        media: data.media,
        isAnnouncement: data.isAnnouncement,
      });
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const likePost = createAsyncThunk(
  'groups/likePost',
  async (postId: string, { rejectWithValue }) => {
    try {
      return await groupService.likePost(postId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const addComment = createAsyncThunk(
  'groups/addComment',
  async (data: { postId: string; content: string }, { rejectWithValue }) => {
    try {
      return await groupService.addComment(data.postId, data.content);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const groupsSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentGroup: (state, action: PayloadAction<Group | null>) => {
      state.currentGroup = action.payload;
    },
    clearPosts: (state) => {
      state.posts = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch groups
      .addCase(fetchGroups.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.isLoading = false;
        state.groups = action.payload;
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch my groups
      .addCase(fetchMyGroups.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyGroups.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myGroups = action.payload;
      })
      .addCase(fetchMyGroups.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch group by id
      .addCase(fetchGroupById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGroupById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentGroup = action.payload;
      })
      .addCase(fetchGroupById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create group
      .addCase(createGroup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.groups.unshift(action.payload);
        state.myGroups.unshift(action.payload);
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Join group
      .addCase(joinGroup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(joinGroup.fulfilled, (state, action) => {
        state.isLoading = false;
        const groupIndex = state.groups.findIndex(g => g.id === action.payload.id);
        if (groupIndex !== -1) {
          state.groups[groupIndex] = action.payload;
        }
        if (!state.myGroups.find(g => g.id === action.payload.id)) {
          state.myGroups.push(action.payload);
        }
        if (state.currentGroup?.id === action.payload.id) {
          state.currentGroup = action.payload;
        }
      })
      .addCase(joinGroup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Leave group
      .addCase(leaveGroup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(leaveGroup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myGroups = state.myGroups.filter(g => g.id !== action.payload);
        if (state.currentGroup?.id === action.payload) {
          state.currentGroup = { ...state.currentGroup, isJoined: false };
        }
      })
      .addCase(leaveGroup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch posts
      .addCase(fetchGroupPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGroupPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.posts = action.payload;
      })
      .addCase(fetchGroupPosts.rejected, (state, action) => {
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
        state.posts.unshift(action.payload);
      })
      .addCase(createPost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Like post
      .addCase(likePost.fulfilled, (state, action) => {
        const postIndex = state.posts.findIndex(p => p.id === action.payload.id);
        if (postIndex !== -1) {
          state.posts[postIndex] = action.payload;
        }
      })
      // Add comment
      .addCase(addComment.fulfilled, (state, action) => {
        const postIndex = state.posts.findIndex(p => p.id === action.payload.postId);
        if (postIndex !== -1) {
          state.posts[postIndex].comments.push(action.payload);
        }
      });
  },
});

export const { clearError, setCurrentGroup, clearPosts } = groupsSlice.actions;
export default groupsSlice.reducer;
