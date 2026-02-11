import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Modal,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme, Avatar, Button } from '@rneui/themed';
import { Ionicons } from '@expo/vector-icons';
import { AppDispatch, RootState } from '../store';
import {
  fetchNotifications,
  fetchNotificationSettings,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  toggleGlobalNotifications,
  toggleCategoryNotifications,
  updateDoNotDisturb,
  updateQuietHours,
  updateNotificationSettings,
} from '../store/notificationsSlice';
import { Notification, NotificationCategory } from '../types';

export default function NotificationsScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { theme } = useTheme();
  const { notifications, unreadCount, settings, isLoading } = useSelector(
    (state: RootState) => state.notifications
  );
  const [refreshing, setRefreshing] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    dispatch(fetchNotifications());
    dispatch(fetchNotificationSettings());
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    dispatch(fetchNotifications()).then(() => setRefreshing(false));
  }, [dispatch]);

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.isRead) {
      dispatch(markAsRead(notification.id));
    }

    if (notification.actionUrl) {
      router.push(notification.actionUrl as any);
    }
  };

  const handleDeleteNotification = (notificationId: string) => {
    Alert.alert('Delete Notification', 'Are you sure you want to delete this notification?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => dispatch(deleteNotification(notificationId)),
      },
    ]);
  };

  const getNotificationIcon = (category: NotificationCategory): keyof typeof Ionicons.glyphMap => {
    switch (category) {
      case NotificationCategory.CONNECTIONS:
        return 'people';
      case NotificationCategory.MESSAGES:
        return 'chatbubble';
      case NotificationCategory.GROUPS:
        return 'people-circle';
      case NotificationCategory.EVENTS:
        return 'calendar';
      case NotificationCategory.JOBS:
        return 'briefcase';
      case NotificationCategory.ACHIEVEMENTS:
        return 'trophy';
      case NotificationCategory.ADMIN:
        return 'megaphone';
      default:
        return 'notifications';
    }
  };

  const formatTimeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'unread') return !n.isRead;
    return true;
  });

  const groupedNotifications = filteredNotifications.reduce((groups, notification) => {
    const date = new Date(notification.createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let groupKey: string;
    if (date.toDateString() === today.toDateString()) {
      groupKey = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      groupKey = 'Yesterday';
    } else if (Date.now() - notification.createdAt < 7 * 24 * 60 * 60 * 1000) {
      groupKey = date.toLocaleDateString('en-US', { weekday: 'long' });
    } else {
      groupKey = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(notification);
    return groups;
  }, {} as Record<string, Notification[]>);

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        { backgroundColor: item.isRead ? theme.colors.background : theme.colors.grey0 + '80' },
      ]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
        {item.relatedUser?.avatar ? (
          <Avatar
            size={40}
            rounded
            source={{ uri: item.relatedUser.avatar }}
            containerStyle={{ backgroundColor: theme.colors.primary }}
          />
        ) : (
          <Ionicons name={getNotificationIcon(item.category)} size={24} color={theme.colors.primary} />
        )}
      </View>

      <View style={styles.notificationContent}>
        <Text style={[styles.notificationTitle, { color: theme.colors.black }]}>{item.title}</Text>
        <Text style={[styles.notificationMessage, { color: theme.colors.grey5 }]} numberOfLines={2}>
          {item.message}
        </Text>
        <View style={styles.notificationMeta}>
          <Text style={[styles.notificationTime, { color: theme.colors.grey4 }]}>
            {formatTimeAgo(item.createdAt)}
          </Text>
          {item.priority === 'high' && (
            <View style={[styles.priorityBadge, { backgroundColor: theme.colors.error + '20' }]}>
              <Text style={[styles.priorityText, { color: theme.colors.error }]}>High Priority</Text>
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteNotification(item.id)}
      >
        <Ionicons name="close" size={20} color={theme.colors.grey4} />
      </TouchableOpacity>

      {!item.isRead && <View style={[styles.unreadDot, { backgroundColor: theme.colors.primary }]} />}
    </TouchableOpacity>
  );

  const renderSectionHeader = (title: string) => (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: theme.colors.grey5 }]}>{title}</Text>
    </View>
  );

  const renderSettingsModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={settingsModalVisible}
      onRequestClose={() => setSettingsModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.black }]}>Notification Settings</Text>
            <TouchableOpacity onPress={() => setSettingsModalVisible(false)}>
              <Ionicons name="close" size={24} color={theme.colors.grey5} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.settingsContent}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: theme.colors.black }]}>
                  Enable Notifications
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.grey5 }]}>
                  Receive all notifications
                </Text>
              </View>
              <Switch
                value={settings.globalEnabled}
                onValueChange={(value) => { void dispatch(toggleGlobalNotifications(value)); }}
                trackColor={{ false: theme.colors.grey3, true: theme.colors.primary }}
              />
            </View>

            <Text style={[styles.settingsSection, { color: theme.colors.grey5 }]}>
              Notification Categories
            </Text>

            {Object.entries(settings.perCategory).map(([category, config]) => (
              <View key={category} style={styles.categoryItem}>
                <View style={styles.categoryHeader}>
                  <Ionicons
                    name={getNotificationIcon(category as NotificationCategory)}
                    size={20}
                    color={theme.colors.primary}
                  />
                  <Text style={[styles.categoryName, { color: theme.colors.black }]}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Text>
                  <Switch
                    value={config.enabled}
                    onValueChange={(value) => {
                      void dispatch(
                        toggleCategoryNotifications({
                          category: category as NotificationCategory,
                          enabled: value,
                        })
                      );
                    }}
                    trackColor={{ false: theme.colors.grey3, true: theme.colors.primary }}
                  />
                </View>
                {config.enabled && (
                  <View style={styles.categoryOptions}>
                    <View style={styles.optionRow}>
                      <Text style={[styles.optionText, { color: theme.colors.grey5 }]}>Push</Text>
                      <Switch
                        value={config.pushEnabled}
                        onValueChange={(value) => {
                          void dispatch(
                            updateNotificationSettings({
                              perCategory: {
                                ...settings.perCategory,
                                [category]: { ...config, pushEnabled: value },
                              },
                            })
                          );
                        }}
                        trackColor={{ false: theme.colors.grey3, true: theme.colors.primary }}
                      />
                    </View>
                    <View style={styles.optionRow}>
                      <Text style={[styles.optionText, { color: theme.colors.grey5 }]}>Sound</Text>
                      <Switch
                        value={config.soundEnabled}
                        onValueChange={(value) => {
                          void dispatch(
                            updateNotificationSettings({
                              perCategory: {
                                ...settings.perCategory,
                                [category]: { ...config, soundEnabled: value },
                              },
                            })
                          );
                        }}
                        trackColor={{ false: theme.colors.grey3, true: theme.colors.primary }}
                      />
                    </View>
                    <View style={styles.optionRow}>
                      <Text style={[styles.optionText, { color: theme.colors.grey5 }]}>
                        Vibration
                      </Text>
                      <Switch
                        value={config.vibrationEnabled}
                        onValueChange={(value) => {
                          void dispatch(
                            updateNotificationSettings({
                              perCategory: {
                                ...settings.perCategory,
                                [category]: { ...config, vibrationEnabled: value },
                              },
                            })
                          );
                        }}
                        trackColor={{ false: theme.colors.grey3, true: theme.colors.primary }}
                      />
                    </View>
                  </View>
                )}
              </View>
            ))}

            <Text style={[styles.settingsSection, { color: theme.colors.grey5, marginTop: 20 }]}>
              Do Not Disturb
            </Text>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: theme.colors.black }]}>
                  Enable Do Not Disturb
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.grey5 }]}>
                  Silence notifications during set hours
                </Text>
              </View>
              <Switch
                value={settings.doNotDisturb.enabled}
                onValueChange={(value) => {
                  void dispatch(updateDoNotDisturb({ enabled: value }));
                }}
                trackColor={{ false: theme.colors.grey3, true: theme.colors.primary }}
              />
            </View>

            {settings.doNotDisturb.enabled && (
              <View style={styles.timeRangeContainer}>
                <Text style={[styles.timeLabel, { color: theme.colors.grey5 }]}>
                  From: {settings.doNotDisturb.startTime}
                </Text>
                <Text style={[styles.timeLabel, { color: theme.colors.grey5 }]}>
                  To: {settings.doNotDisturb.endTime}
                </Text>
              </View>
            )}

            <Text style={[styles.settingsSection, { color: theme.colors.grey5, marginTop: 20 }]}>
              Quiet Hours
            </Text>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: theme.colors.black }]}>
                  Enable Quiet Hours
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.grey5 }]}>
                  Reduce notification sounds and vibrations
                </Text>
              </View>
              <Switch
                value={settings.quietHours.enabled}
                onValueChange={(value) => {
                  void dispatch(updateQuietHours({ enabled: value }));
                }}
                trackColor={{ false: theme.colors.grey3, true: theme.colors.primary }}
              />
            </View>

            {settings.quietHours.enabled && (
              <View style={styles.timeRangeContainer}>
                <Text style={[styles.timeLabel, { color: theme.colors.grey5 }]}>
                  From: {settings.quietHours.startTime}
                </Text>
                <Text style={[styles.timeLabel, { color: theme.colors.grey5 }]}>
                  To: {settings.quietHours.endTime}
                </Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button
              title="Done"
              onPress={() => setSettingsModalVisible(false)}
              containerStyle={styles.doneButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.black} />
        </TouchableOpacity>
        <View>
          <Text style={[styles.headerTitle, { color: theme.colors.black }]}>Notifications</Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.grey5 }]}>
            {unreadCount} unread
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: theme.colors.grey0 }]}
            onPress={() => setSettingsModalVisible(true)}
          >
            <Ionicons name="settings-outline" size={22} color={theme.colors.grey5} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'all' ? theme.colors.primary : theme.colors.grey5 },
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'unread' && styles.activeTab]}
          onPress={() => setActiveTab('unread')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'unread' ? theme.colors.primary : theme.colors.grey5 },
            ]}
          >
            Unread ({unreadCount})
          </Text>
        </TouchableOpacity>
      </View>

      {unreadCount > 0 && (
        <TouchableOpacity
          style={[styles.markAllButton, { backgroundColor: theme.colors.grey0 }]}
          onPress={() => dispatch(markAllAsRead())}
        >
          <Ionicons name="checkmark-done" size={18} color={theme.colors.primary} />
          <Text style={[styles.markAllText, { color: theme.colors.primary }]}>
            Mark all as read
          </Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={Object.entries(groupedNotifications).flatMap(([date, items]) => [
          { type: 'header' as const, title: date },
          ...items.map((item) => ({ ...item, itemType: 'notification' as const })),
        ])}
        renderItem={({ item }: { item: any }) =>
          item.type === 'header'
            ? renderSectionHeader(item.title)
            : renderNotification({ item: item as Notification })
        }
        keyExtractor={(item: any) => (item.type === 'header' ? item.title : item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off-outline" size={64} color={theme.colors.grey3} />
              <Text style={[styles.emptyText, { color: theme.colors.grey5 }]}>
                No notifications
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.colors.grey4 }]}>
                {activeTab === 'unread'
                  ? 'You have read all your notifications'
                  : 'Check back later for updates'}
              </Text>
            </View>
          ) : null
        }
      />

      {renderSettingsModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  headerActions: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 12,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  markAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 20,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 12,
    position: 'relative',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
  notificationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notificationTime: {
    fontSize: 12,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  unreadDot: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  settingsContent: {
    padding: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
  },
  settingsSection: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: 24,
    marginBottom: 12,
  },
  categoryItem: {
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  categoryName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  categoryOptions: {
    paddingLeft: 32,
    paddingBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  optionText: {
    fontSize: 14,
  },
  timeRangeContainer: {
    paddingLeft: 16,
    paddingVertical: 8,
  },
  timeLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  modalFooter: {
    padding: 20,
  },
  doneButton: {
    borderRadius: 12,
  },
});
