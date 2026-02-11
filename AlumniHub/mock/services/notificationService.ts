import { mockDelay, shouldFail } from '../../utils/mockDelay';
import { Notification, NotificationSettings, NotificationType, NotificationFeatureSettings } from '../../types';
import { mockNotifications, defaultNotificationSettings } from '../data/notifications';
import { mockProfiles } from '../data/profiles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import websocketService from './websocketService';

const SETTINGS_STORAGE_KEY = '@notification_settings';

let notifications = [...mockNotifications];
let settings: NotificationSettings = { ...defaultNotificationSettings };

// Load settings from storage on init
const loadSettingsFromStorage = async (): Promise<void> => {
  try {
    const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored) {
      settings = JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load notification settings:', error);
  }
};

// Initialize settings
loadSettingsFromStorage();

const saveSettingsToStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save notification settings:', error);
  }
};

const enrichNotifications = (items: Notification[]): Notification[] => {
  return items.map(item => ({
    ...item,
    sender: item.senderId ? mockProfiles.find(p => p.id === item.senderId) : undefined,
  }));
};

export const getNotifications = async (
  page: number = 1,
  limit: number = 20
): Promise<{ items: Notification[]; hasMore: boolean }> => {
  await mockDelay();
  if (shouldFail()) throw new Error('Failed to fetch notifications');

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedItems = notifications.slice(startIndex, endIndex);
  const hasMore = endIndex < notifications.length;

  return {
    items: enrichNotifications(paginatedItems),
    hasMore,
  };
};

export const getUnreadCount = async (): Promise<number> => {
  await mockDelay(100, 300);
  return notifications.filter(n => !n.isRead).length;
};

export const markAsRead = async (notificationId: string): Promise<Notification> => {
  await mockDelay();
  if (shouldFail()) throw new Error('Failed to mark notification as read');

  const index = notifications.findIndex(n => n.id === notificationId);
  if (index === -1) throw new Error('Notification not found');

  const updatedNotification: Notification = {
    ...notifications[index],
    isRead: true,
  };

  notifications = [
    ...notifications.slice(0, index),
    updatedNotification,
    ...notifications.slice(index + 1),
  ];

  return enrichNotifications([updatedNotification])[0];
};

export const markAllAsRead = async (): Promise<void> => {
  await mockDelay(500, 1000);
  if (shouldFail()) throw new Error('Failed to mark all notifications as read');

  notifications = notifications.map(n => ({ ...n, isRead: true }));
};

export const deleteNotification = async (notificationId: string): Promise<void> => {
  await mockDelay();
  if (shouldFail()) throw new Error('Failed to delete notification');

  notifications = notifications.filter(n => n.id !== notificationId);
};

export const getNotificationSettings = async (): Promise<NotificationSettings> => {
  await mockDelay(100, 300);
  return { ...settings };
};

export const updateNotificationSettings = async (
  newSettings: Partial<NotificationSettings>
): Promise<NotificationSettings> => {
  await mockDelay(300, 600);
  if (shouldFail()) throw new Error('Failed to update settings');

  settings = { ...settings, ...newSettings };
  await saveSettingsToStorage();

  return { ...settings };
};

export const updateFeatureSettings = async (
  feature: keyof NotificationSettings['features'],
  featureSettings: Partial<NotificationFeatureSettings>
): Promise<NotificationSettings> => {
  await mockDelay(300, 600);
  if (shouldFail()) throw new Error('Failed to update feature settings');

  settings = {
    ...settings,
    features: {
      ...settings.features,
      [feature]: {
        ...settings.features[feature],
        ...featureSettings,
      },
    },
  };

  await saveSettingsToStorage();
  return { ...settings };
};

export const toggleDoNotDisturb = async (enabled: boolean): Promise<NotificationSettings> => {
  await mockDelay(200, 400);
  
  settings = {
    ...settings,
    doNotDisturb: enabled,
  };

  await saveSettingsToStorage();
  return { ...settings };
};

export const setQuietHours = async (
  start: number,
  end: number
): Promise<NotificationSettings> => {
  await mockDelay(200, 400);
  
  settings = {
    ...settings,
    quietHoursStart: start,
    quietHoursEnd: end,
  };

  await saveSettingsToStorage();
  return { ...settings };
};

export const isInQuietHours = (): boolean => {
  if (!settings.doNotDisturb) return false;
  
  const now = new Date();
  const currentHour = now.getHours();
  const { quietHoursStart, quietHoursEnd } = settings;
  
  if (quietHoursStart === undefined || quietHoursEnd === undefined) return false;
  
  if (quietHoursStart <= quietHoursEnd) {
    return currentHour >= quietHoursStart && currentHour < quietHoursEnd;
  } else {
    // Handles overnight quiet hours (e.g., 22:00 to 08:00)
    return currentHour >= quietHoursStart || currentHour < quietHoursEnd;
  }
};

export const shouldShowNotification = (
  notificationType: NotificationType
): boolean => {
  if (!settings.globalEnabled) return false;
  if (isInQuietHours()) return false;

  // Map notification types to feature categories
  let feature: keyof NotificationSettings['features'] | null = null;
  
  switch (notificationType) {
    case NotificationType.CONNECTION_REQUEST:
    case NotificationType.CONNECTION_ACCEPTED:
      feature = 'connections';
      break;
    case NotificationType.GROUP_INVITE:
    case NotificationType.GROUP_JOIN_REQUEST:
      feature = 'groups';
      break;
    case NotificationType.EVENT_REMINDER:
    case NotificationType.EVENT_INVITE:
      feature = 'events';
      break;
    case NotificationType.JOB_MATCH:
      feature = 'jobs';
      break;
    case NotificationType.MENTORSHIP_REQUEST:
    case NotificationType.MENTORSHIP_ACCEPTED:
      feature = 'mentorship';
      break;
    case NotificationType.MENTION:
      feature = 'mentions';
      break;
    case NotificationType.POST_LIKE:
    case NotificationType.POST_COMMENT:
    case NotificationType.POST_SHARE:
    case NotificationType.NEW_POST:
      feature = 'postInteractions';
      break;
    case NotificationType.SYSTEM:
      feature = 'system';
      break;
    default:
      return true;
  }

  if (feature && settings.features[feature]) {
    return settings.features[feature].inApp;
  }

  return true;
};

export const createNotification = async (
  data: Omit<Notification, 'id' | 'timestamp' | 'isRead'>
): Promise<Notification | null> => {
  if (!shouldShowNotification(data.type)) return null;

  const newNotification: Notification = {
    ...data,
    id: `notif_${Date.now()}`,
    timestamp: Date.now(),
    isRead: false,
  };

  notifications = [newNotification, ...notifications];

  // Emit WebSocket event
  websocketService.triggerNotification(newNotification);

  return enrichNotifications([newNotification])[0];
};

export const registerPushToken = async (token: string): Promise<void> => {
  await mockDelay(300, 600);
  console.log('[Notifications] Push token registered:', token);
};

export const unregisterPushToken = async (): Promise<void> => {
  await mockDelay(300, 600);
  console.log('[Notifications] Push token unregistered');
};
