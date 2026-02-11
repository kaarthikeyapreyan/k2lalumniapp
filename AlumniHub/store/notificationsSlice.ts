import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { NotificationsState, Notification, NotificationSettings } from '../types';
import * as notificationService from '../mock/services/notificationService';
import websocketService, { WebSocketEvent } from '../mock/services/websocketService';

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  settings: {
    globalEnabled: true,
    doNotDisturb: false,
    soundEnabled: true,
    vibrationEnabled: true,
    features: {
      connections: { push: true, inApp: true, email: true },
      messages: { push: true, inApp: true, email: false },
      groups: { push: true, inApp: true, email: true },
      events: { push: true, inApp: true, email: true },
      jobs: { push: true, inApp: true, email: true },
      mentorship: { push: true, inApp: true, email: true },
      mentions: { push: true, inApp: true, email: false },
      postInteractions: { push: true, inApp: true, email: false },
      system: { push: true, inApp: true, email: true },
    },
  },
  isLoading: false,
  error: string | null,
};

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async ({ page, limit }: { page: number; limit?: number }, { rejectWithValue }) => {
    try {
      return await notificationService.getNotifications(page, limit);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      return await notificationService.getUnreadCount();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      return await notificationService.markAsRead(notificationId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await notificationService.markAllAsRead();
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      await notificationService.deleteNotification(notificationId);
      return notificationId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchNotificationSettings = createAsyncThunk(
  'notifications/fetchNotificationSettings',
  async (_, { rejectWithValue }) => {
    try {
      return await notificationService.getNotificationSettings();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateNotificationSettings = createAsyncThunk(
  'notifications/updateNotificationSettings',
  async (settings: Partial<NotificationSettings>, { rejectWithValue }) => {
    try {
      return await notificationService.updateNotificationSettings(settings);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateFeatureSettings = createAsyncThunk(
  'notifications/updateFeatureSettings',
  async (
    { feature, settings }: { feature: keyof NotificationSettings['features']; settings: Partial<NotificationFeatureSettings> },
    { rejectWithValue }
  ) => {
    try {
      return await notificationService.updateFeatureSettings(feature, settings);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const toggleDoNotDisturb = createAsyncThunk(
  'notifications/toggleDoNotDisturb',
  async (enabled: boolean, { rejectWithValue }) => {
    try {
      return await notificationService.toggleDoNotDisturb(enabled);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const setQuietHours = createAsyncThunk(
  'notifications/setQuietHours',
  async ({ start, end }: { start: number; end: number }, { rejectWithValue }) => {
    try {
      return await notificationService.setQuietHours(start, end);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const connectNotificationRealtime = createAsyncThunk(
  'notifications/connectRealtime',
  async (_, { dispatch }) => {
    await websocketService.connect();
    
    // Subscribe to WebSocket events
    websocketService.subscribe('notification', (event: WebSocketEvent) => {
      dispatch(notificationsSlice.actions.handleRealtimeNotification(event.data as Notification));
    });
    
    return true;
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    handleRealtimeNotification: (state, action: PayloadAction<Notification>) => {
      const newNotification = action.payload;
      // Only add if it should be shown based on current settings
      if (notificationService.shouldShowNotification(newNotification.type)) {
        state.notifications = [newNotification, ...state.notifications];
        state.unreadCount += 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload.items;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch unread count
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      // Mark as read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const index = state.notifications.findIndex(n => n.id === action.payload.id);
        if (index !== -1) {
          state.notifications[index] = action.payload;
        }
        // Recalculate unread count
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      })
      // Mark all as read
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map(n => ({ ...n, isRead: true }));
        state.unreadCount = 0;
      })
      // Delete notification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const deletedNotification = state.notifications.find(n => n.id === action.payload);
        state.notifications = state.notifications.filter(n => n.id !== action.payload);
        if (deletedNotification && !deletedNotification.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      // Fetch notification settings
      .addCase(fetchNotificationSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotificationSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload;
      })
      .addCase(fetchNotificationSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update notification settings
      .addCase(updateNotificationSettings.fulfilled, (state, action) => {
        state.settings = action.payload;
      })
      // Update feature settings
      .addCase(updateFeatureSettings.fulfilled, (state, action) => {
        state.settings = action.payload;
      })
      // Toggle do not disturb
      .addCase(toggleDoNotDisturb.fulfilled, (state, action) => {
        state.settings = action.payload;
      })
      // Set quiet hours
      .addCase(setQuietHours.fulfilled, (state, action) => {
        state.settings = action.payload;
      });
  },
});

export const { clearError, handleRealtimeNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer;
