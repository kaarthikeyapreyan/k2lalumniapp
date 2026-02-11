import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme, Avatar, Card, Button, Icon } from '@rneui/themed';
import { Ionicons } from '@expo/vector-icons';
import { AppDispatch, RootState } from '../store';
import {
  fetchNotifications,
  fetchUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  fetchNotificationSettings,
  toggleDoNotDisturb,
  connectNotificationRealtime,
  updateNotificationSettings,
  updateFeatureSettings,
} from '../store/notificationsSlice';
import { Notification, NotificationType, NotificationFeatureSettings } from '../types';

export default function NotificationsScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { theme } = useTheme();
  
  const { notifications, unreadCount, settings, isLoading, error } = useSelector(
    (state: RootState) => state.notifications
  );
  
  const [refreshing, setRefreshing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    dispatch(fetchNotifications({ page: 1 }));
    dispatch(fetchUnreadCount());
    dispatch(fetchNotificationSettings());
    dispatch(connectNotificationRealtime());
  }, [dispatch]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchNotifications({ page: 1 }));
    await dispatch(fetchUnreadCount());
    setRefreshing(false);
  }, [dispatch]);

  const handleMarkAsRead = useCallback((notificationId: string) => {
    dispatch(markAsRead(notificationId));
  }, [dispatch]);

  const handleMarkAllAsRead = useCallback(() => {
    dispatch(markAllAsRead());
  }, [dispatch]);

  const handleDelete = useCallback((notificationId: string) => {
    dispatch(deleteNotification(notificationId));
  }, [dispatch]);

  const handleToggleDND = useCallback((value: boolean) => {
    dispatch(toggleDoNotDisturb(value));
  }, [dispatch]);

  const getNotificationIcon = (type: NotificationType): string => {
    switch (type) {
      case NotificationType.POST_LIKE:
        return 'heart';
      case NotificationType.POST_COMMENT:
        return 'chatbubble';
      case NotificationType.POST_SHARE:
        return 'arrow-redo';
      case NotificationType.CONNECTION_REQUEST:
      case NotificationType.CONNECTION_ACCEPTED:
        return 'people';
      case NotificationType.EVENT_REMINDER:
      case NotificationType.EVENT_INVITE:
        return 'calendar';
      case NotificationType.GROUP_INVITE:
      case NotificationType.GROUP_JOIN_REQUEST:
        return 'people-circle';
      case NotificationType.JOB_MATCH:
        return 'briefcase';
      case NotificationType.MENTORSHIP_REQUEST:
      case NotificationType.MENTORSHIP_ACCEPTED:
        return 'school';
      case NotificationType.MENTION:
        return 'at';
      case NotificationType.SKILL_ENDORSEMENT:
        return 'star';
      case NotificationType.RECOMMENDATION:
        return 'thumbs-up';
      case NotificationType.SYSTEM:
        return 'information-circle';
      default:
        return 'notifications';
    }
  };

  const formatTimestamp = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const renderNotification = ({ item }: { item: Notification }) => {
    const isUnread = !item.isRead;
    const iconName = getNotificationIcon(item.type);

    return (
      <TouchableOpacity
        onPress={() => {
          if (isUnread) {
            handleMarkAsRead(item.id);
          }
          if (item.actionUrl) {
            router.push(item.actionUrl as any);
          }
        }}
        style={[
          styles.notificationItem,
          { backgroundColor: isUnread ? theme.colors.grey0 : theme.colors.background }
        ]}
      >
        <View style={[
          styles.iconContainer, 
          { backgroundColor: isUnread ? theme.colors.primary : theme.colors.grey1 }
        ]}>
          <Ionicons 
            name={iconName as any} 
            size={20} 
            color={isUnread ? theme.colors.white : theme.colors.grey4} 
          />
        </View>

        <View style={styles.notificationContent}>
          <Text style={[styles.notificationTitle, { color: theme.colors.black }]}>
            {item.title}
          </Text>
          <Text style={[styles.notificationMessage, { color: theme.colors.grey5 }]} numberOfLines={2}>
            {item.sender?.name ? `${item.sender.name} ` : ''}{item.message}
          </Text>
          <Text style={[styles.notificationTime, { color: theme.colors.grey4 }]}>
            {formatTimestamp(item.timestamp)}
          </Text>
        </View>

        <View style={styles.notificationActions}>
          {isUnread && (
            <View style={[styles.unreadDot, { backgroundColor: theme.colors.primary }]} />
          )}
          <TouchableOpacity
            onPress={() => handleDelete(item.id)}
            style={styles.deleteButton}
          >
            <Ionicons name="close" size={18} color={theme.colors.grey4} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSettings = () => (
    <View style={[styles.settingsContainer, { backgroundColor: theme.colors.background }]}>
      <Card containerStyle={[styles.settingsCard, { backgroundColor: theme.colors.grey0 }]}>
        <Text style={[styles.settingsSectionTitle, { color: theme.colors.black }]}>
          General Settings
        </Text>

        {/* Global Toggle */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: theme.colors.black }]}>
              Enable Notifications
            </Text>
            <Text style={[styles.settingDescription, { color: theme.colors.grey4 }]}>
              Receive all notifications
            </Text>
          </View>
          <Switch
            value={settings.globalEnabled}
            onValueChange={(value) => 
              dispatch(updateNotificationSettings({ globalEnabled: value }))
            }
            trackColor={{ false: theme.colors.grey3, true: theme.colors.primary }}
          />
        </View>

        {/* Do Not Disturb */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: theme.colors.black }]}>
              Do Not Disturb
            </Text>
            <Text style={[styles.settingDescription, { color: theme.colors.grey4 }]}>
              Pause notifications during quiet hours
            </Text>
          </View>
          <Switch
            value={settings.doNotDisturb}
            onValueChange={handleToggleDND}
            trackColor={{ false: theme.colors.grey3, true: theme.colors.primary }}
          />
        </View>

        {/* Quiet Hours */}
        {settings.doNotDisturb && (
          <View style={styles.quietHoursContainer}>
            <Text style={[styles.quietHoursLabel, { color: theme.colors.grey5 }]}>
              Quiet Hours: {settings.quietHoursStart}:00 - {settings.quietHoursEnd}:00
            </Text>
          </View>
        )}

        {/* Sound Toggle */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: theme.colors.black }]}>
              Sound
            </Text>
            <Text style={[styles.settingDescription, { color: theme.colors.grey4 }]}>
              Play sound for notifications
            </Text>
          </View>
          <Switch
            value={settings.soundEnabled}
            onValueChange={(value) => 
              dispatch(updateNotificationSettings({ soundEnabled: value }))
            }
            trackColor={{ false: theme.colors.grey3, true: theme.colors.primary }}
          />
        </View>

        {/* Vibration Toggle */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: theme.colors.black }]}>
              Vibration
            </Text>
            <Text style={[styles.settingDescription, { color: theme.colors.grey4 }]}>
              Vibrate for notifications
            </Text>
          </View>
          <Switch
            value={settings.vibrationEnabled}
            onValueChange={(value) => 
              dispatch(updateNotificationSettings({ vibrationEnabled: value }))
            }
            trackColor={{ false: theme.colors.grey3, true: theme.colors.primary }}
          />
        </View>
      </Card>

      <Card containerStyle={[styles.settingsCard, { backgroundColor: theme.colors.grey0 }]}>
        <Text style={[styles.settingsSectionTitle, { color: theme.colors.black }]}>
          Feature Notifications
        </Text>

        {Object.entries(settings.features).map(([feature, featureSettings]) => (
          <View key={feature} style={styles.featureSettings}>
            <Text style={[styles.featureTitle, { color: theme.colors.black }]}>
              {feature.charAt(0).toUpperCase() + feature.slice(1)}
            </Text>
            <View style={styles.featureToggles}>
              <View style={styles.featureToggle}>
                <Text style={[styles.featureToggleLabel, { color: theme.colors.grey5 }]}>
                  Push
                </Text>
                <Switch
                  value={featureSettings.push}
                  onValueChange={(value) => 
                    dispatch(updateFeatureSettings({ 
                      feature: feature as any, 
                      settings: { push: value } 
                    }))
                  }
                  trackColor={{ false: theme.colors.grey3, true: theme.colors.primary }}
                />
              </View>
              <View style={styles.featureToggle}>
                <Text style={[styles.featureToggleLabel, { color: theme.colors.grey5 }]}>
                  In-App
                </Text>
                <Switch
                  value={featureSettings.inApp}
                  onValueChange={(value) => 
                    dispatch(updateFeatureSettings({ 
                      feature: feature as any, 
                      settings: { inApp: value } 
                    }))
                  }
                  trackColor={{ false: theme.colors.grey3, true: theme.colors.primary }}
                />
              </View>
            </View>
          </View>
        ))}
      </Card>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.black} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.black }]}>
            {showSettings ? 'Settings' : 'Notifications'}
          </Text>
        </View>
        <View style={styles.headerRight}>
          {!showSettings && unreadCount > 0 && (
            <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.markAllButton}>
              <Text style={[styles.markAllText, { color: theme.colors.primary }]}>
                Mark all read
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            onPress={() => setShowSettings(!showSettings)}
            style={styles.settingsButton}
          >
            <Ionicons 
              name={showSettings ? "notifications-outline" : "settings-outline"} 
              size={24} 
              color={theme.colors.black} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Bar */}
      {!showSettings && (
        <View style={[styles.statsBar, { backgroundColor: theme.colors.grey0 }]}>
          <View style={styles.stat}>
            <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
              {unreadCount}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.grey5 }]}>Unread</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.colors.grey2 }]} />
          <View style={styles.stat}>
            <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
              {notifications.length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.grey5 }]}>Total</Text>
          </View>
          {settings.doNotDisturb && (
            <>
              <View style={[styles.statDivider, { backgroundColor: theme.colors.grey2 }]} />
              <View style={styles.stat}>
                <Ionicons name="moon" size={20} color={theme.colors.warning} />
                <Text style={[styles.statLabel, { color: theme.colors.warning }]}>DND On</Text>
              </View>
            </>
          )}
        </View>
      )}

      {/* Content */}
      {showSettings ? (
        <FlatList
          data={[{ key: 'settings' }]}
          renderItem={() => renderSettings()}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.settingsList}
        />
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.notificationsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={!isLoading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off-outline" size={64} color={theme.colors.grey3} />
              <Text style={[styles.emptyText, { color: theme.colors.grey4 }]}>
                No notifications yet
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.colors.grey4 }]}>
                We'll notify you when something happens
              </Text>
            </View>
          ) : null}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  markAllButton: {
    marginRight: 16,
  },
  markAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  settingsButton: {
    padding: 4,
  },
  statsBar: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    marginHorizontal: 16,
  },
  notificationsList: {
    padding: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
  },
  notificationActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  deleteButton: {
    padding: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
  },
  settingsList: {
    padding: 16,
  },
  settingsContainer: {
    gap: 16,
  },
  settingsCard: {
    borderRadius: 12,
    padding: 16,
    margin: 0,
    borderWidth: 0,
  },
  settingsSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  quietHoursContainer: {
    paddingVertical: 8,
    paddingLeft: 16,
  },
  quietHoursLabel: {
    fontSize: 13,
  },
  featureSettings: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  featureToggles: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  featureToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  featureToggleLabel: {
    fontSize: 13,
    marginRight: 8,
  },
});
