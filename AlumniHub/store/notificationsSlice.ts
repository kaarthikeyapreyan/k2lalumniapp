import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { NotificationState, Notification, NotificationSettings, NotificationCategory } from '../types';
import * as notificationService from '../mock/services/notificationService';

const defaultPerCategory = {
  [NotificationCategory.CONNECTIONS]: {
    enabled: true,
    pushEnabled: true,
    soundEnabled: true,
    vibrationEnabled: true,
  },
  [NotificationCategory.MESSAGES]: {
    enabled: true,
    pushEnabled: true,
    soundEnabled: true,
    vibrationEnabled: true,
  },
  [NotificationCategory.GROUPS]: {
    enabled: true,
    pushEnabled: true,
    soundEnabled: true,
    vibrationEnabled: true,
  },
  [NotificationCategory.EVENTS]: {
    enabled: true,
    pushEnabled: true,
    soundEnabled: true,
    vibrationEnabled: true,
  },
  [NotificationCategory.JOBS]: {
    enabled: true,
    pushEnabled: true,
    soundEnabled: true,
    vibrationEnabled: true,
  },
  [NotificationCategory.ACHIEVEMENTS]: {
    enabled: true,
    pushEnabled: true,
    soundEnabled: false,
    vibrationEnabled: false,
  },
  [NotificationCategory.ADMIN]: {
    enabled: true,
    pushEnabled: true,
    soundEnabled: true,
    vibrationEnabled: true,
  },
};

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  settings: {
    globalEnabled: true,
    perCategory: defaultPerCategory,
    doNotDisturb: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00',
      timezone: 'local',
    },
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00',
    },
  },
  isLoading: false,
  error: null,
};

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      return await notificationService.getNotifications();
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
      await notificationService.markAsRead(notificationId);
      return notificationId;
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
  'notifications/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      return await notificationService.getSettings();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateNotificationSettings = createAsyncThunk(
  'notifications/updateSettings',
  async (settings: Partial<NotificationSettings>, { rejectWithValue }) => {
    try {
      return await notificationService.updateSettings(settings);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const toggleGlobalNotifications = createAsyncThunk(
  'notifications/toggleGlobal',
  async (enabled: boolean, { rejectWithValue }) => {
    try {
      return await notificationService.toggleGlobalNotifications(enabled);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const toggleCategoryNotifications = createAsyncThunk(
  'notifications/toggleCategory',
  async (
    { category, enabled }: { category: NotificationCategory; enabled: boolean },
    { rejectWithValue }
  ) => {
    try {
      return await notificationService.toggleCategoryNotifications(category, enabled);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateDoNotDisturb = createAsyncThunk(
  'notifications/updateDoNotDisturb',
  async (
    settings: { enabled: boolean; startTime?: string; endTime?: string },
    { rejectWithValue }
  ) => {
    try {
      return await notificationService.updateDoNotDisturb(settings);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateQuietHours = createAsyncThunk(
  'notifications/updateQuietHours',
  async (
    settings: { enabled: boolean; startTime?: string; endTime?: string },
    { rejectWithValue }
  ) => {
    try {
      return await notificationService.updateQuietHours(settings);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    receiveNotification: (state, action: PayloadAction<Notification>) => {
      const exists = state.notifications.find(n => n.id === action.payload.id);
      if (!exists) {
        state.notifications.unshift(action.payload);
        if (!action.payload.isRead) {
          state.unreadCount += 1;
        }
      }
    },
    updateUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter(n => !n.isRead).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n.id === action.payload);
        if (notification && !notification.isRead) {
          notification.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications.forEach(n => {
          n.isRead = true;
        });
        state.unreadCount = 0;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n.id === action.payload);
        if (notification && !notification.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications = state.notifications.filter(n => n.id !== action.payload);
      })
      .addCase(fetchNotificationSettings.fulfilled, (state, action) => {
        state.settings = { ...state.settings, ...action.payload };
      })
      .addCase(updateNotificationSettings.fulfilled, (state, action) => {
        state.settings = { ...state.settings, ...action.payload };
      })
      .addCase(toggleGlobalNotifications.fulfilled, (state, action) => {
        state.settings.globalEnabled = action.payload.enabled;
      })
      .addCase(toggleCategoryNotifications.fulfilled, (state, action) => {
        state.settings.perCategory[action.payload.category].enabled = action.payload.enabled;
      })
      .addCase(updateDoNotDisturb.fulfilled, (state, action) => {
        state.settings.doNotDisturb = { ...state.settings.doNotDisturb, ...action.payload };
      })
      .addCase(updateQuietHours.fulfilled, (state, action) => {
        state.settings.quietHours = { ...state.settings.quietHours, ...action.payload };
      });
  },
});

export const {
  clearError,
  receiveNotification,
  updateUnreadCount,
  clearAllNotifications,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
