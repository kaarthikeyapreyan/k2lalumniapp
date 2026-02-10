import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme, Card, Badge, Button } from '@rneui/themed';
import { Ionicons } from '@expo/vector-icons';
import { AppDispatch, RootState } from '../../store';
import { RSVPStatus, EventType } from '../../types';
import * as eventService from '../../mock/services/eventService';
import { Event } from '../../types';

const eventTypeColors: Record<EventType, string> = {
  [EventType.REUNION]: '#8B5CF6',
  [EventType.CAREER]: '#10B981',
  [EventType.NETWORKING]: '#3B82F6',
  [EventType.SOCIAL]: '#F59E0B',
  [EventType.EDUCATIONAL]: '#EC4899',
  [EventType.SPORTS]: '#EF4444',
  [EventType.CHARITY]: '#14B8A6',
};

const eventTypeLabels: Record<EventType, string> = {
  [EventType.REUNION]: 'Reunion',
  [EventType.CAREER]: 'Career',
  [EventType.NETWORKING]: 'Networking',
  [EventType.SOCIAL]: 'Social',
  [EventType.EDUCATIONAL]: 'Educational',
  [EventType.SPORTS]: 'Sports',
  [EventType.CHARITY]: 'Charity',
};

const filterOptions = [
  { value: 'all', label: 'All' },
  { value: EventType.NETWORKING, label: 'Networking' },
  { value: EventType.CAREER, label: 'Career' },
  { value: EventType.SOCIAL, label: 'Social' },
  { value: EventType.REUNION, label: 'Reunion' },
];

export default function EventsScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { theme } = useTheme();
  const [events, setEvents] = useState<Event[]>([]);
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'my-events'>('upcoming');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const [allEvents, userEvents] = await Promise.all([
        eventService.getEvents(),
        eventService.getMyEvents(),
      ]);
      setEvents(allEvents);
      setMyEvents(userEvents);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRSVPBadge = (status?: RSVPStatus) => {
    switch (status) {
      case RSVPStatus.GOING:
        return <Badge value="Going" status="success" />;
      case RSVPStatus.INTERESTED:
        return <Badge value="Interested" status="warning" />;
      case RSVPStatus.NOT_GOING:
        return <Badge value="Not Going" status="error" />;
      default:
        return null;
    }
  };

  const filteredEvents = (activeTab === 'upcoming' ? events : myEvents).filter(event => {
    if (selectedFilter === 'all') return true;
    return event.type === selectedFilter;
  });

  const renderEventCard = ({ item }: { item: Event }) => (
    <TouchableOpacity
      onPress={() => router.push(`/events/${item.id}` as any)}
    >
      <Card containerStyle={[styles.card, { backgroundColor: theme.colors.grey0 }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.typeBadge, { backgroundColor: eventTypeColors[item.type] }]}>
            <Text style={styles.typeText}>{eventTypeLabels[item.type]}</Text>
          </View>
          {getRSVPBadge(item.userRSVP)}
        </View>

        <Text style={[styles.eventTitle, { color: theme.colors.black }]} numberOfLines={2}>
          {item.title}
        </Text>

        <View style={styles.eventDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color={theme.colors.grey5} />
            <Text style={[styles.detailText, { color: theme.colors.grey5 }]}>
              {formatDate(item.startDate)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={16} color={theme.colors.grey5} />
            <Text style={[styles.detailText, { color: theme.colors.grey5 }]} numberOfLines={1}>
              {item.location.virtual ? 'Virtual Event' : item.location.city || item.location.name}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="people-outline" size={16} color={theme.colors.grey5} />
            <Text style={[styles.detailText, { color: theme.colors.grey5 }]}>
              {item.attendeeCount} {item.capacity ? `/ ${item.capacity}` : ''} attending
            </Text>
          </View>
        </View>

        {item.categories.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
            {item.categories.map((category, index) => (
              <View
                key={index}
                style={[styles.categoryBadge, { backgroundColor: theme.colors.grey1 }]}
              >
                <Text style={[styles.categoryText, { color: theme.colors.grey5 }]}>
                  {category}
                </Text>
              </View>
            ))}
          </ScrollView>
        )}
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.black }]}>Events</Text>
        <TouchableOpacity onPress={() => router.push('/events/create' as any)}>
          <Ionicons name="add-circle" size={32} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'upcoming' && { borderBottomWidth: 2, borderBottomColor: theme.colors.primary },
          ]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'upcoming' ? theme.colors.primary : theme.colors.grey5 },
            ]}
          >
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'my-events' && { borderBottomWidth: 2, borderBottomColor: theme.colors.primary },
          ]}
          onPress={() => setActiveTab('my-events')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'my-events' ? theme.colors.primary : theme.colors.grey5 },
            ]}
          >
            My Events
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {filterOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.filterChip,
              {
                backgroundColor:
                  selectedFilter === option.value ? theme.colors.primary : theme.colors.grey0,
              },
            ]}
            onPress={() => setSelectedFilter(option.value)}
          >
            <Text
              style={[
                styles.filterText,
                {
                  color: selectedFilter === option.value ? '#fff' : theme.colors.grey5,
                },
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredEvents}
        renderItem={renderEventCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadEvents} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color={theme.colors.grey3} />
            <Text style={[styles.emptyText, { color: theme.colors.grey5 }]}>
              {activeTab === 'upcoming' ? 'No upcoming events' : 'You haven\'t joined any events'}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  filterContainer: {
    maxHeight: 60,
    marginVertical: 10,
  },
  filterContent: {
    paddingHorizontal: 20,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  eventDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    marginLeft: 8,
  },
  categories: {
    flexDirection: 'row',
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 15,
  },
});
