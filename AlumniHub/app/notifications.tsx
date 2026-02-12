import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Modal, Switch, Button as RNButton } from 'react-native';
import { Text, Icon, ListItem, Avatar, Button, useTheme } from '@rneui/themed';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  connectNotificationRealtime,
  toggleGlobalNotifications,
  toggleCategoryNotifications
} from '../store/notificationsSlice';
import { NotificationCategory } from '../types';

function NotificationsScreen() {
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const { notifications, unreadCount, settings, isLoading } = useAppSelector(state => state.notifications);
  const [isSettingsVisible, setSettingsVisible] = useState(false);

  useEffect(() => {
    dispatch(fetchNotifications());
    dispatch(connectNotificationRealtime());
  }, []);

  const renderNotification = ({ item }: { item: any }) => (
    <ListItem
      bottomDivider
      onPress={() => dispatch(markAsRead(item.id))}
      containerStyle={item.isRead ? undefined : styles.unreadItem}
    >
      <Avatar
        rounded
        source={{ uri: item.relatedUser?.avatar || 'https://via.placeholder.com/40' }}
        size={40}
      />
      <ListItem.Content>
        <ListItem.Title style={styles.title}>{item.title}</ListItem.Title>
        <ListItem.Subtitle style={styles.message}>{item.message}</ListItem.Subtitle>
        <Text style={styles.time}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </ListItem.Content>
      {!item.isRead && <View style={styles.unreadDot} />}
    </ListItem>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text h4>Notifications ({unreadCount})</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => dispatch(markAllAsRead())}>
            <Text style={styles.actionText}>Mark all as read</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSettingsVisible(true)} style={styles.settingsBtn}>
            <Icon name="settings" type="feather" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        refreshing={isLoading}
        onRefresh={() => dispatch(fetchNotifications())}
      />

      <Modal
        visible={isSettingsVisible}
        animationType="slide"
        onRequestClose={() => setSettingsVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text h4>Notification Settings</Text>
            <TouchableOpacity onPress={() => setSettingsVisible(false)}>
              <Icon name="x" type="feather" />
            </TouchableOpacity>
          </View>

          <ListItem bottomDivider>
            <ListItem.Content>
              <ListItem.Title>Global Notifications</ListItem.Title>
            </ListItem.Content>
            <Switch
              value={!!settings.globalEnabled}
              onValueChange={(val) => { dispatch(toggleGlobalNotifications(val)); }}
            />
          </ListItem>

          {Object.values(NotificationCategory).map((category) => (
            <ListItem key={category} bottomDivider>
              <ListItem.Content>
                <ListItem.Title style={{ textTransform: 'capitalize' }}>
                  {category}
                </ListItem.Title>
              </ListItem.Content>
              <Switch
                value={!!settings.perCategory?.[category]?.enabled}
                onValueChange={(val) => { dispatch(toggleCategoryNotifications({ category, enabled: !!val })); }
                }
              />
            </ListItem>
          ))}

          <TouchableOpacity
            onPress={() => setSettingsVisible(false)}
            style={[styles.closeBtn, { backgroundColor: theme.colors.primary, padding: 15, borderRadius: 10, alignItems: 'center' }]}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    color: '#007AFF',
    marginRight: 15,
  },
  settingsBtn: {
    padding: 5,
  },
  unreadItem: {
    backgroundColor: '#f0f8ff',
  },
  title: {
    fontWeight: 'bold',
  },
  message: {
    color: '#444',
  },
  time: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
  },
  modalContainer: {
    flex: 1,
    paddingTop: 50,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    alignItems: 'center',
  },
  closeBtn: {
    margin: 20,
  }
});

export default NotificationsScreen;
