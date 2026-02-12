import AsyncStorage from '@react-native-async-storage/async-storage';
import { Notification, NotificationSettings, NotificationCategory } from '../../types';
import { notifications as initialNotifications, settings as initialSettings } from '../data/notifications';
import { currentUserProfile } from '../data/profiles';
import { websocketService } from './websocketService';

const STORAGE_KEY = '@alumni_notifications';
const SETTINGS_KEY = '@alumni_notification_settings';

const mockDelay = (min = 200, max = 800) =>
  new Promise(resolve => setTimeout(resolve, Math.random() * (max - min) + min));

const shouldFail = () => Math.random() < 0.05;

let notifications = [...initialNotifications];
let settings = { ...initialSettings };

// Persistence helpers
const saveToStorage = async () => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save notifications to storage', e);
  }
};

import { sanitizeNotificationSettings } from '../../utils/sanitizer';

export const loadFromStorage = async () => {
  try {
    const savedNotifications = await AsyncStorage.getItem(STORAGE_KEY);
    const savedSettings = await AsyncStorage.getItem(SETTINGS_KEY);
    if (savedNotifications) notifications = JSON.parse(savedNotifications);
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      settings = sanitizeNotificationSettings(parsedSettings);
    }
  } catch (e) {
    console.error('Failed to load notifications from storage', e);
  }
};

export const getNotifications = async (): Promise<Notification[]> => {
  await mockDelay(500, 1000);
  if (shouldFail()) throw new Error('Failed to fetch notifications');

  return [...notifications].sort((a, b) => b.createdAt - a.createdAt);
};

export const getUnreadCount = async (): Promise<number> => {
  await mockDelay(200, 500);
  if (shouldFail()) throw new Error('Failed to fetch unread count');

  return notifications.filter(n => !n.isRead && n.userId === currentUserProfile.id).length;
};

export const markAsRead = async (notificationId: string): Promise<void> => {
  await mockDelay(100, 300);
  const notification = notifications.find(n => n.id === notificationId);
  if (notification) {
    notification.isRead = true;
    await saveToStorage();
  }
};

export const markAllAsRead = async (): Promise<void> => {
  await mockDelay(300, 700);
  notifications = notifications.map(n =>
    n.userId === currentUserProfile.id ? { ...n, isRead: true } : n
  );
  await saveToStorage();
};

export const deleteNotification = async (notificationId: string): Promise<void> => {
  await mockDelay(200, 500);
  notifications = notifications.filter(n => n.id !== notificationId);
  await saveToStorage();
};

export const getSettings = async (): Promise<NotificationSettings> => {
  await mockDelay(300, 600);
  return { ...settings };
};

export const updateSettings = async (
  newSettings: Partial<NotificationSettings>
): Promise<NotificationSettings> => {
  await mockDelay(500, 1000);
  if (shouldFail()) throw new Error('Failed to update notification settings');

  settings = { ...settings, ...newSettings };
  await saveToStorage();
  return { ...settings };
};

export const toggleGlobalNotifications = async (
  enabled: boolean
): Promise<{ enabled: boolean }> => {
  await mockDelay(200, 500);
  if (shouldFail()) throw new Error('Failed to toggle global notifications');

  settings.globalEnabled = enabled;
  await saveToStorage();
  return { enabled };
};

export const toggleCategoryNotifications = async (
  category: NotificationCategory,
  enabled: boolean
): Promise<{ category: NotificationCategory; enabled: boolean }> => {
  await mockDelay(200, 500);
  if (shouldFail()) throw new Error('Failed to toggle category notifications');

  if (settings.perCategory[category]) {
    settings.perCategory[category].enabled = enabled;
  }
  await saveToStorage();
  return { category, enabled };
};

export const updateDoNotDisturb = async (
  doNotDisturbSettings: Partial<NotificationSettings['doNotDisturb']>
): Promise<NotificationSettings['doNotDisturb']> => {
  await mockDelay(200, 500);
  if (shouldFail()) throw new Error('Failed to update Do Not Disturb settings');

  settings.doNotDisturb = { ...settings.doNotDisturb, ...doNotDisturbSettings };
  await saveToStorage();
  return { ...settings.doNotDisturb };
};

export const updateQuietHours = async (
  quietHoursSettings: Partial<NotificationSettings['quietHours']>
): Promise<NotificationSettings['quietHours']> => {
  await mockDelay(200, 500);
  if (shouldFail()) throw new Error('Failed to update Quiet Hours settings');

  settings.quietHours = { ...settings.quietHours, ...quietHoursSettings };
  await saveToStorage();
  return { ...settings.quietHours };
};

// Check if a notification should be shown based on current settings
export const shouldShowNotification = (notification: Notification): boolean => {
  if (!settings.globalEnabled) return false;

  const categorySetting = settings.perCategory[notification.category];
  if (!categorySetting || !categorySetting.enabled) return false;

  if (settings.doNotDisturb.enabled) return false;

  if (settings.quietHours.enabled) {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;

    if (currentTime >= settings.quietHours.startTime || currentTime <= settings.quietHours.endTime) {
      return false;
    }
  }

  return true;
};

// Realtime handlers
websocketService.on('notification_received', async (event: any) => {
  const notification = event.data as Notification;
  if (notification.userId === currentUserProfile.id) {
    notifications.unshift(notification);
    await saveToStorage();
  }
});
