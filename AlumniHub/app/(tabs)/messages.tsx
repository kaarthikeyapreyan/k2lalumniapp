import { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme, Avatar, Badge } from '@rneui/themed';
import { Ionicons } from '@expo/vector-icons';
import { AppDispatch, RootState } from '../../store';
import { fetchConversations } from '../../store/messagingSlice';
import { fetchProfileById } from '../../store/profileSlice';
import { Conversation } from '../../types';
import { mockProfiles } from '../../mock/data/profiles';

export default function MessagesScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { theme } = useTheme();
  const { user } = useSelector((state: RootState) => state.auth);
  const { conversations, isLoading } = useSelector((state: RootState) => state.messaging);

  useEffect(() => {
    if (user) {
      dispatch(fetchConversations(user.id));
    }
  }, [user, dispatch]);

  const handleRefresh = () => {
    if (user) {
      dispatch(fetchConversations(user.id));
    }
  };

  const getOtherParticipant = (conv: Conversation) => {
    if (conv.isGroup) {
      return null;
    }
    const otherId = conv.participants.find((p) => p !== user?.id);
    return mockProfiles.find((profile) => profile.id === otherId);
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => {
    const otherUser = getOtherParticipant(item);
    const displayName = item.isGroup ? item.groupName : otherUser?.name || 'Unknown';
    const displayAvatar = item.isGroup ? item.groupAvatar : otherUser?.avatar;

    return (
      <TouchableOpacity
        onPress={() => router.push(`/chat/${item.id}` as any)}
        style={[styles.conversationItem, { backgroundColor: theme.colors.background }]}
      >
        <View>
          <Avatar
            size={55}
            rounded
            source={displayAvatar ? { uri: displayAvatar } : undefined}
            title={displayName?.charAt(0)}
            containerStyle={{ backgroundColor: theme.colors.primary }}
          />
          {item.unreadCount > 0 && (
            <Badge
              value={item.unreadCount}
              status="error"
              containerStyle={styles.badge}
            />
          )}
        </View>

        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text
              style={[
                styles.conversationName,
                { color: theme.colors.black },
                item.unreadCount > 0 && styles.unreadName,
              ]}
              numberOfLines={1}
            >
              {displayName}
            </Text>
            <Text style={[styles.timestamp, { color: theme.colors.grey4 }]}>
              {item.lastMessage ? formatTimestamp(item.lastMessage.timestamp) : ''}
            </Text>
          </View>
          <Text
            style={[
              styles.lastMessage,
              { color: theme.colors.grey5 },
              item.unreadCount > 0 && styles.unreadMessage,
            ]}
            numberOfLines={2}
          >
            {item.lastMessage?.content || 'No messages yet'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.black }]}>Messages</Text>
      </View>

      <FlatList
        data={conversations}
        renderItem={renderConversationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />}
        ItemSeparatorComponent={() => (
          <View style={[styles.separator, { backgroundColor: theme.colors.grey1 }]} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color={theme.colors.grey3} />
            <Text style={[styles.emptyText, { color: theme.colors.grey5 }]}>
              No messages yet
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.colors.grey4 }]}>
              Start a conversation with an alumni
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  list: {
    paddingBottom: 20,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 15,
    paddingHorizontal: 20,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
  },
  conversationContent: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 16,
    flex: 1,
  },
  unreadName: {
    fontWeight: 'bold',
  },
  timestamp: {
    fontSize: 12,
    marginLeft: 10,
  },
  lastMessage: {
    fontSize: 14,
  },
  unreadMessage: {
    fontWeight: '600',
  },
  separator: {
    height: 1,
    marginLeft: 90,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 5,
  },
});
