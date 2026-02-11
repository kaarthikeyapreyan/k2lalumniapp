import { mockDelay, shouldFail } from '../../utils/mockDelay';
import { Notification, NotificationSettings, NotificationCategory } from '../../types';
import { mockNotifications } from '../data/notifications';
import { currentUserProfile } from '../data/profiles';

let notifications = [...mockNotifications];

let settings: NotificationSettings = {
  globalEnabled: true,
  perCategory: {
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
  },
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
  await mockDelay(200, 500);
  if (shouldFail()) throw new Error('Failed to mark notification as read');
  
  const notification = notifications.find(n => n.id === notificationId);
  if (notification) {
    notification.isRead = true;
  }
};

export const markAllAsRead = async (): Promise<void> => {
  await mockDelay(500, 1000);
  if (shouldFail()) throw new Error('Failed to mark all notifications as read');
  
  notifications.forEach(n => {
    if (n.userId === currentUserProfile.id) {
      n.isRead = true;
    }
  });
};

export const deleteNotification = async (notificationId: string): Promise<void> => {
  await mockDelay(200, 500);
  if (shouldFail()) throw new Error('Failed to delete notification');
  
  notifications = notifications.filter(n => n.id !== notificationId);
};

export const getSettings = async (): Promise<NotificationSettings> => {
  await mockDelay(200, 500);
  if (shouldFail()) throw new Error('Failed to fetch notification settings');
  
  return { ...settings };
};

export const updateSettings = async (
  newSettings: Partial<NotificationSettings>
): Promise<NotificationSettings> => {
  await mockDelay(500, 1000);
  if (shouldFail()) throw new Error('Failed to update notification settings');
  
  settings = { ...settings, ...newSettings };
  return { ...settings };
};

export const toggleGlobalNotifications = async (
  enabled: boolean
): Promise<{ enabled: boolean }> => {
  await mockDelay(200, 500);
  if (shouldFail()) throw new Error('Failed to toggle global notifications');
  
  settings.globalEnabled = enabled;
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
  return { category, enabled };
};

export const updateCategorySettings = async (
  category: NotificationCategory,
  categorySettings: Partial<NotificationSettings['perCategory'][NotificationCategory]>
): Promise<NotificationSettings> => {
  await mockDelay(200, 500);
  if (shouldFail()) throw new Error('Failed to update category settings');
  
  if (settings.perCategory[category]) {
    settings.perCategory[category] = { ...settings.perCategory[category], ...categorySettings };
  }
  return { ...settings };
};

export const updateDoNotDisturb = async (
  doNotDisturbSettings: Partial<NotificationSettings['doNotDisturb']>
): Promise<NotificationSettings['doNotDisturb']> => {
  await mockDelay(200, 500);
  if (shouldFail()) throw new Error('Failed to update Do Not Disturb settings');
  
  settings.doNotDisturb = { ...settings.doNotDisturb, ...doNotDisturbSettings };
  return { ...settings.doNotDisturb };
};

export const updateQuietHours = async (
  quietHoursSettings: Partial<NotificationSettings['quietHours']>
): Promise<NotificationSettings['quietHours']> => {
  await mockDelay(200, 500);
  if (shouldFail()) throw new Error('Failed to update Quiet Hours settings');
  
  settings.quietHours = { ...settings.quietHours, ...quietHoursSettings };
  return { ...settings.quietHours };
};

export const shouldShowNotification = async (): Promise<boolean> => {
  if (!settings.globalEnabled) {
    return false;
  }
  
  if (settings.doNotDisturb.enabled) {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    if (isTimeInRange(currentTime, settings.doNotDisturb.startTime, settings.doNotDisturb.endTime)) {
      return false;
    }
  }
  
  return true;
};

const isTimeInRange = (current: string, start: string, end: string): boolean => {
  const currentMinutes = timeToMinutes(current);
  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);
  
  if (startMinutes <= endMinutes) {
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  } else {
    return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
  }
};

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

export const createNotification = async (
  notification: Omit<Notification, 'id' | 'createdAt'>
): Promise<Notification> => {
  await mockDelay(200, 500);
  if (shouldFail()) throw new Error('Failed to create notification');
  
  const newNotification: Notification = {
    ...notification,
    id: `notif_${Date.now()}`,
    createdAt: Date.now(),
  };
  
  notifications.unshift(newNotification);
  return newNotification;
};
