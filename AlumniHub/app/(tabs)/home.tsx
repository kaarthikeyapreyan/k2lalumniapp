import { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme, Avatar, Card } from '@rneui/themed';
import { Ionicons } from '@expo/vector-icons';
import { AppDispatch, RootState } from '../../store';
import { fetchCurrentProfile } from '../../store/profileSlice';
import { fetchConnections } from '../../store/connectionSlice';
import { fetchConversations } from '../../store/messagingSlice';

export default function HomeScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { theme } = useTheme();
  const { user } = useSelector((state: RootState) => state.auth);
  const { currentProfile, isLoading } = useSelector((state: RootState) => state.profile);
  const { connections } = useSelector((state: RootState) => state.connection);
  const { conversations } = useSelector((state: RootState) => state.messaging);

  useEffect(() => {
    if (user) {
      dispatch(fetchCurrentProfile(user.id));
      dispatch(fetchConnections(user.id));
      dispatch(fetchConversations(user.id));
    }
  }, [user, dispatch]);

  const handleRefresh = () => {
    if (user) {
      dispatch(fetchCurrentProfile(user.id));
      dispatch(fetchConnections(user.id));
      dispatch(fetchConversations(user.id));
    }
  };

  const unreadCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: theme.colors.grey5 }]}>Welcome back,</Text>
          <Text style={[styles.name, { color: theme.colors.black }]}>
            {currentProfile?.name || user?.name || 'User'}
          </Text>
        </View>
        <Avatar
          size={50}
          rounded
          source={
            currentProfile?.avatar
              ? { uri: currentProfile.avatar }
              : undefined
          }
          title={currentProfile?.name?.charAt(0) || 'U'}
          containerStyle={{ backgroundColor: theme.colors.primary }}
        />
      </View>

      <View style={styles.statsContainer}>
        <Card containerStyle={[styles.statCard, { backgroundColor: theme.colors.grey0 }]}>
          <TouchableOpacity onPress={() => router.push('/(tabs)/directory')}>
            <Ionicons name="people" size={32} color={theme.colors.primary} />
            <Text style={[styles.statNumber, { color: theme.colors.black }]}>
              {connections.length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.grey5 }]}>Connections</Text>
          </TouchableOpacity>
        </Card>

        <Card containerStyle={[styles.statCard, { backgroundColor: theme.colors.grey0 }]}>
          <TouchableOpacity onPress={() => router.push('/(tabs)/messages')}>
            <Ionicons name="chatbubbles" size={32} color={theme.colors.primary} />
            <Text style={[styles.statNumber, { color: theme.colors.black }]}>{unreadCount}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.grey5 }]}>Unread</Text>
          </TouchableOpacity>
        </Card>

        <Card containerStyle={[styles.statCard, { backgroundColor: theme.colors.grey0 }]}>
          <TouchableOpacity>
            <Ionicons name="calendar" size={32} color={theme.colors.primary} />
            <Text style={[styles.statNumber, { color: theme.colors.black }]}>3</Text>
            <Text style={[styles.statLabel, { color: theme.colors.grey5 }]}>Events</Text>
          </TouchableOpacity>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.black }]}>Quick Actions</Text>
        
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: theme.colors.grey0 }]}
          onPress={() => router.push('/(tabs)/directory')}
        >
          <Ionicons name="search" size={24} color={theme.colors.primary} />
          <View style={styles.actionContent}>
            <Text style={[styles.actionTitle, { color: theme.colors.black }]}>
              Find Alumni
            </Text>
            <Text style={[styles.actionSubtitle, { color: theme.colors.grey5 }]}>
              Search and connect with fellow alumni
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={theme.colors.grey3} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: theme.colors.grey0 }]}
          onPress={() => router.push('/profile/edit')}
        >
          <Ionicons name="person" size={24} color={theme.colors.primary} />
          <View style={styles.actionContent}>
            <Text style={[styles.actionTitle, { color: theme.colors.black }]}>
              Update Profile
            </Text>
            <Text style={[styles.actionSubtitle, { color: theme.colors.grey5 }]}>
              Keep your information current
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={theme.colors.grey3} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.black }]}>Upcoming Events</Text>
        <Card containerStyle={[styles.eventCard, { backgroundColor: theme.colors.grey0 }]}>
          <Text style={[styles.eventTitle, { color: theme.colors.black }]}>
            Alumni Networking Mixer
          </Text>
          <Text style={[styles.eventDate, { color: theme.colors.grey5 }]}>March 15, 2026 • 6:00 PM</Text>
          <Text style={[styles.eventLocation, { color: theme.colors.grey5 }]}>
            Downtown Convention Center
          </Text>
        </Card>
      </View>
    </ScrollView>
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
    padding: 20,
    paddingTop: 60,
  },
  greeting: {
    fontSize: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    margin: 5,
    padding: 15,
    borderRadius: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  actionContent: {
    flex: 1,
    marginLeft: 15,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  eventCard: {
    borderRadius: 12,
    padding: 15,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  eventDate: {
    fontSize: 14,
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 14,
  },
});
