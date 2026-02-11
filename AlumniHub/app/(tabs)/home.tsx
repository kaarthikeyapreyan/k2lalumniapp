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
import { fetchMyGroups } from '../../store/groupsSlice';
import { fetchMyEvents } from '../../store/eventsSlice';
import { fetchUnreadCount } from '../../store/notificationsSlice';

export default function HomeScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { theme } = useTheme();
  const { user } = useSelector((state: RootState) => state.auth);
  const { currentProfile, isLoading: profileLoading } = useSelector((state: RootState) => state.profile);
  const { connections } = useSelector((state: RootState) => state.connection);
  const { conversations } = useSelector((state: RootState) => state.messaging);
  const { myGroups } = useSelector((state: RootState) => state.groups);
  const { myEvents } = useSelector((state: RootState) => state.events);
  const { unreadCount: notificationUnreadCount } = useSelector((state: RootState) => state.notifications);

  useEffect(() => {
    if (user) {
      dispatch(fetchCurrentProfile(user.id));
      dispatch(fetchConnections(user.id));
      dispatch(fetchConversations(user.id));
      dispatch(fetchMyGroups());
      dispatch(fetchMyEvents());
      dispatch(fetchUnreadCount());
    }
  }, [user, dispatch]);

  const handleRefresh = () => {
    if (user) {
      dispatch(fetchCurrentProfile(user.id));
      dispatch(fetchConnections(user.id));
      dispatch(fetchConversations(user.id));
      dispatch(fetchMyGroups());
      dispatch(fetchMyEvents());
      dispatch(fetchUnreadCount());
    }
  };

  const unreadCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
  const upcomingEventsCount = myEvents.filter(e => e.startDate > Date.now()).length;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl refreshing={profileLoading} onRefresh={handleRefresh} />
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
          <TouchableOpacity onPress={() => router.push('/(tabs)/events')}>
            <Ionicons name="calendar" size={32} color={theme.colors.primary} />
            <Text style={[styles.statNumber, { color: theme.colors.black }]}>
              {upcomingEventsCount}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.grey5 }]}>Events</Text>
          </TouchableOpacity>
        </Card>
      </View>

      <View style={styles.statsContainer}>
        <Card containerStyle={[styles.statCard, { backgroundColor: theme.colors.grey0 }]}>
          <TouchableOpacity onPress={() => router.push('/notifications')}>
            <Ionicons name="notifications" size={32} color={theme.colors.primary} />
            <Text style={[styles.statNumber, { color: theme.colors.black }]}>
              {notificationUnreadCount}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.grey5 }]}>Alerts</Text>
          </TouchableOpacity>
        </Card>

        <Card containerStyle={[styles.statCard, { backgroundColor: theme.colors.grey0 }]}>
          <TouchableOpacity onPress={() => router.push('/(tabs)/groups')}>
            <Ionicons name="chatbubbles-outline" size={32} color={theme.colors.primary} />
            <Text style={[styles.statNumber, { color: theme.colors.black }]}>
              {myGroups.length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.grey5 }]}>My Groups</Text>
          </TouchableOpacity>
        </Card>

        <Card containerStyle={[styles.statCard, { backgroundColor: theme.colors.grey0 }]}>
          <TouchableOpacity onPress={() => router.push('/(tabs)/jobs')}>
            <Ionicons name="briefcase" size={32} color={theme.colors.primary} />
            <Text style={[styles.statNumber, { color: theme.colors.black }]}>Jobs</Text>
            <Text style={[styles.statLabel, { color: theme.colors.grey5 }]}>Career</Text>
          </TouchableOpacity>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.black }]}>Quick Actions</Text>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: theme.colors.grey0 }]}
          onPress={() => router.push('/(tabs)/feed')}
        >
          <Ionicons name="newspaper" size={24} color={theme.colors.primary} />
          <View style={styles.actionContent}>
            <Text style={[styles.actionTitle, { color: theme.colors.black }]}>
              Activity Feed
            </Text>
            <Text style={[styles.actionSubtitle, { color: theme.colors.grey5 }]}>
              See what your network is sharing
            </Text>
          </View>
          <View style={styles.actionBadge}>
            {notificationUnreadCount > 0 && (
              <View style={[styles.badge, { backgroundColor: theme.colors.error }]}>
                <Text style={styles.badgeText}>
                  {notificationUnreadCount > 99 ? '99+' : notificationUnreadCount}
                </Text>
              </View>
            )}
            <Ionicons name="chevron-forward" size={24} color={theme.colors.grey3} />
          </View>
        </TouchableOpacity>
        
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
          onPress={() => router.push('/(tabs)/groups')}
        >
          <Ionicons name="people-circle" size={24} color={theme.colors.primary} />
          <View style={styles.actionContent}>
            <Text style={[styles.actionTitle, { color: theme.colors.black }]}>
              Join Groups
            </Text>
            <Text style={[styles.actionSubtitle, { color: theme.colors.grey5 }]}>
              Connect with batchmates, interest groups, and location communities
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={theme.colors.grey3} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: theme.colors.grey0 }]}
          onPress={() => router.push('/(tabs)/events')}
        >
          <Ionicons name="calendar-clear" size={24} color={theme.colors.primary} />
          <View style={styles.actionContent}>
            <Text style={[styles.actionTitle, { color: theme.colors.black }]}>
              Discover Events
            </Text>
            <Text style={[styles.actionSubtitle, { color: theme.colors.grey5 }]}>
              Networking mixers, reunions, career talks, and more
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={theme.colors.grey3} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: theme.colors.grey0 }]}
          onPress={() => router.push('/(tabs)/jobs')}
        >
          <Ionicons name="briefcase" size={24} color={theme.colors.primary} />
          <View style={styles.actionContent}>
            <Text style={[styles.actionTitle, { color: theme.colors.black }]}>
              Browse Jobs
            </Text>
            <Text style={[styles.actionSubtitle, { color: theme.colors.grey5 }]}>
              Find career opportunities from alumni network
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

      {upcomingEventsCount > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.black }]}>Your Upcoming Events</Text>
          {myEvents
            .filter(e => e.startDate > Date.now())
            .slice(0, 3)
            .map(event => (
              <TouchableOpacity
                key={event.id}
                onPress={() => router.push(`/events/${event.id}` as any)}
              >
                <Card containerStyle={[styles.eventCard, { backgroundColor: theme.colors.grey0 }]}>
                  <Text style={[styles.eventTitle, { color: theme.colors.black }]}>
                    {event.title}
                  </Text>
                  <Text style={[styles.eventDate, { color: theme.colors.grey5 }]}>
                    {new Date(event.startDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                  <Text style={[styles.eventLocation, { color: theme.colors.grey5 }]}>
                    {event.location.virtual ? 'Virtual Event' : event.location.city}
                  </Text>
                </Card>
              </TouchableOpacity>
            ))}
        </View>
      )}
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
    fontSize: 20,
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
  actionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
    paddingHorizontal: 4,
  },
  eventCard: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
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
