import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Notification, NotificationState, NotificationSettings, NotificationCategory } from '../types';
import * as notificationService from '../mock/services/notificationService';
import { websocketService } from '../mock/services/websocketService';

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  settings: {
    globalEnabled: true,
    perCategory: {
      [NotificationCategory.CONNECTIONS]: { enabled: true, pushEnabled: true, soundEnabled: true, vibrationEnabled: true },
      [NotificationCategory.MESSAGES]: { enabled: true, pushEnabled: true, soundEnabled: true, vibrationEnabled: true },
      [NotificationCategory.GROUPS]: { enabled: true, pushEnabled: true, soundEnabled: true, vibrationEnabled: true },
      [NotificationCategory.EVENTS]: { enabled: true, pushEnabled: true, soundEnabled: true, vibrationEnabled: true },
      [NotificationCategory.JOBS]: { enabled: true, pushEnabled: true, soundEnabled: true, vibrationEnabled: true },
      [NotificationCategory.ACHIEVEMENTS]: { enabled: true, pushEnabled: true, soundEnabled: true, vibrationEnabled: true },
      [NotificationCategory.ADMIN]: { enabled: true, pushEnabled: true, soundEnabled: true, vibrationEnabled: true },
    },
    doNotDisturb: { enabled: false, startTime: '22:00', endTime: '07:00', timezone: 'UTC' },
    quietHours: { enabled: false, startTime: '23:00', endTime: '06:00' },
  },
  isLoading: false,
  error: null,
};

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async () => {
    const notifications = await notificationService.getNotifications();
    const unreadCount = await notificationService.getUnreadCount();
    const settings = await notificationService.getSettings();
    return { notifications, unreadCount, settings };
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async () => {
    return await notificationService.getUnreadCount();
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId: string) => {
    await notificationService.markAsRead(notificationId);
    return notificationId;
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async () => {
    await notificationService.markAllAsRead();
  }
);

export const updateSettings = createAsyncThunk(
  'notifications/updateSettings',
  async (settings: Partial<NotificationSettings>) => {
    return await notificationService.updateSettings(settings);
  }
);

export const connectNotificationRealtime = createAsyncThunk(
  'notifications/connectRealtime',
  async (_, { dispatch }) => {
    const unsubscribe = websocketService.subscribe('notification_received', (event) => {
      dispatch(receiveNotification(event.data as Notification));
    });
    return true;
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    receiveNotification: (state, action: PayloadAction<Notification>) => {
      const exists = state.notifications.find(n => n.id === action.payload.id);
      if (!exists) {
        state.notifications.unshift(action.payload);
        if (!action.payload.isRead) {
          state.unreadCount += 1;
        }
      }
    },
    toggleGlobalNotifications: (state, action: PayloadAction<boolean>) => {
      state.settings.globalEnabled = !!action.payload;
    },
    toggleCategoryNotifications: (
      state,
      action: PayloadAction<{ category: NotificationCategory; enabled: boolean }>
    ) => {
      const category = action.payload.category;
      if (state.settings.perCategory && state.settings.perCategory[category]) {
        state.settings.perCategory[category].enabled = !!action.payload.enabled;
      }
    },
    updateDoNotDisturb: (
      state,
      action: PayloadAction<Partial<NotificationSettings['doNotDisturb']>>
    ) => {
      state.settings.doNotDisturb = { ...state.settings.doNotDisturb, ...action.payload };
    },
    updateQuietHours: (
      state,
      action: PayloadAction<Partial<NotificationSettings['quietHours']>>
    ) => {
      state.settings.quietHours = { ...state.settings.quietHours, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
        state.settings = action.payload.settings;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch notifications';
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
        state.notifications.forEach(n => (n.isRead = true));
        state.unreadCount = 0;
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.settings = action.payload;
      });
  },
});

export const {
  receiveNotification,
  toggleGlobalNotifications,
  toggleCategoryNotifications,
  updateDoNotDisturb,
  updateQuietHours
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
