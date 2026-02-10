import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Alert,
  Share,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme, Avatar, Button, Badge, Divider, Card } from '@rneui/themed';
import { Ionicons } from '@expo/vector-icons';
import * as eventService from '../../mock/services/eventService';
import { Event, RSVPStatus, EventType } from '../../types';

const eventTypeLabels: Record<EventType, string> = {
  [EventType.REUNION]: 'Reunion',
  [EventType.CAREER]: 'Career',
  [EventType.NETWORKING]: 'Networking',
  [EventType.SOCIAL]: 'Social',
  [EventType.EDUCATIONAL]: 'Educational',
  [EventType.SPORTS]: 'Sports',
  [EventType.CHARITY]: 'Charity',
};

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme } = useTheme();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadEvent();
    }
  }, [id]);

  const loadEvent = async () => {
    setIsLoading(true);
    try {
      const eventData = await eventService.getEventById(id);
      setEvent(eventData);
    } catch (error) {
      console.error('Failed to load event:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRSVP = async (status: RSVPStatus) => {
    try {
      const updatedEvent = await eventService.rsvpToEvent(id, status);
      setEvent(updatedEvent);
      Alert.alert('Success', `You are ${status.replace('_', ' ')} for this event`);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleShare = async () => {
    if (!event) return;
    try {
      await Share.share({
        message: `Join me at ${event.title} on ${formatDate(event.startDate)}. ${event.description.slice(0, 100)}...`,
        title: event.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRSVPButtons = () => {
    if (!event) return null;

    const buttons = [
      { status: RSVPStatus.GOING, label: 'Going', icon: 'checkmark-circle', color: theme.colors.success },
      { status: RSVPStatus.INTERESTED, label: 'Interested', icon: 'star', color: theme.colors.warning },
      { status: RSVPStatus.NOT_GOING, label: 'Can\'t Go', icon: 'close-circle', color: theme.colors.error },
    ];

    return (
      <View style={styles.rsvpContainer}>
        <Text style={[styles.rsvpTitle, { color: theme.colors.black }]}>
          Are you going?
        </Text>
        <View style={styles.rsvpButtons}>
          {buttons.map((btn) => (
            <TouchableOpacity
              key={btn.status}
              style={[
                styles.rsvpButton,
                {
                  backgroundColor: event.userRSVP === btn.status ? btn.color : theme.colors.grey0,
                },
              ]}
              onPress={() => handleRSVP(btn.status)}
            >
              <Ionicons
                name={btn.icon as any}
                size={24}
                color={event.userRSVP === btn.status ? '#fff' : btn.color}
              />
              <Text
                style={[
                  styles.rsvpButtonText,
                  { color: event.userRSVP === btn.status ? '#fff' : btn.color },
                ]}
              >
                {btn.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  if (!event && isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.grey5, textAlign: 'center', marginTop: 100 }}>
          Loading...
        </Text>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.grey5, textAlign: 'center', marginTop: 100 }}>
          Event not found
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.black} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleShare}>
          <Ionicons name="share-outline" size={24} color={theme.colors.black} />
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadEvent} />}
      >
        {event.image && (
          <Image source={{ uri: event.image }} style={styles.eventImage} />
        )}

        <View style={styles.content}>
          <View style={styles.typeContainer}>
            <Badge
              value={eventTypeLabels[event.type]}
              badgeStyle={{ backgroundColor: theme.colors.primary, paddingHorizontal: 10 }}
            />
            {event.categories.map((cat, index) => (
              <View
                key={index}
                style={[
                  styles.categoryBadge,
                  { borderColor: theme.colors.grey3, marginLeft: 5 },
                ]}
              >
                <Text style={{ fontSize: 12, color: theme.colors.grey5 }}>{cat}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.title, { color: theme.colors.black }]}>
            {event.title}
          </Text>

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.grey0 }]}>
                <Ionicons name="calendar" size={20} color={theme.colors.primary} />
              </View>
              <View>
                <Text style={[styles.infoLabel, { color: theme.colors.black }]}>
                  Date & Time
                </Text>
                <Text style={[styles.infoValue, { color: theme.colors.grey5 }]}>
                  {formatDate(event.startDate)}
                </Text>
                <Text style={[styles.infoSubtext, { color: theme.colors.grey4 }]}>
                  Ends {formatDate(event.endDate)}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.grey0 }]}>
                <Ionicons name="location" size={20} color={theme.colors.primary} />
              </View>
              <View>
                <Text style={[styles.infoLabel, { color: theme.colors.black }]}>
                  Location
                </Text>
                <Text style={[styles.infoValue, { color: theme.colors.grey5 }]}>
                  {event.location.name}
                </Text>
                {event.location.address && (
                  <Text style={[styles.infoSubtext, { color: theme.colors.grey4 }]}>
                    {event.location.address}
                  </Text>
                )}
                {event.location.virtual && event.location.virtualLink && (
                  <Text style={[styles.virtualLink, { color: theme.colors.primary }]}>
                    Virtual Event Link
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.grey0 }]}>
                <Ionicons name="people" size={20} color={theme.colors.primary} />
              </View>
              <View>
                <Text style={[styles.infoLabel, { color: theme.colors.black }]}>
                  Attendees
                </Text>
                <Text style={[styles.infoValue, { color: theme.colors.grey5 }]}>
                  {event.attendeeCount} {event.capacity ? `/ ${event.capacity}` : ''} attending
                </Text>
              </View>
            </View>
          </View>

          <Divider style={{ marginVertical: 20 }} />

          {getRSVPButtons()}

          <Divider style={{ marginVertical: 20 }} />

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.black }]}>
              About This Event
            </Text>
            <Text style={[styles.description, { color: theme.colors.grey5 }]}>
              {event.description}
            </Text>
          </View>

          {event.speakers && event.speakers.length > 0 && (
            <>
              <Divider style={{ marginVertical: 20 }} />
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.black }]}>
                  Speakers & Hosts
                </Text>
                {event.speakers.map((speaker) => (
                  <Card
                    key={speaker.id}
                    containerStyle={[styles.speakerCard, { backgroundColor: theme.colors.grey0 }]}
                  >
                    <View style={styles.speakerRow}>
                      <Avatar
                        size={50}
                        rounded
                        source={speaker.avatar ? { uri: speaker.avatar } : undefined}
                        title={speaker.name.charAt(0)}
                        containerStyle={{ backgroundColor: theme.colors.primary }}
                      />
                      <View style={styles.speakerInfo}>
                        <Text style={[styles.speakerName, { color: theme.colors.black }]}>
                          {speaker.name}
                        </Text>
                        <Text style={[styles.speakerRole, { color: theme.colors.grey5 }]}>
                          {speaker.jobTitle} at {speaker.company}
                        </Text>
                      </View>
                    </View>
                  </Card>
                ))}
              </View>
            </>
          )}

          {event.attendees.length > 0 && (
            <>
              <Divider style={{ marginVertical: 20 }} />
              <View style={styles.section}>
                <View style={styles.attendeesHeader}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.black }]}>
                    Who's Attending
                  </Text>
                  <TouchableOpacity onPress={() => router.push(`/events/${id}/attendees` as any)}>
                    <Text style={[styles.seeAll, { color: theme.colors.primary }]}>
                      See All
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.attendeesList}>
                  {event.attendees.slice(0, 8).map((attendee) => (
                    <View key={attendee.userId} style={styles.attendeeItem}>
                      <Avatar
                        size={40}
                        rounded
                        source={attendee.user?.avatar ? { uri: attendee.user.avatar } : undefined}
                        title={attendee.user?.name?.charAt(0)}
                        containerStyle={{ backgroundColor: theme.colors.grey3 }}
                      />
                      {attendee.status === RSVPStatus.GOING && (
                        <View style={[styles.statusDot, { backgroundColor: theme.colors.success }]} />
                      )}
                    </View>
                  ))}
                  {event.attendees.length > 8 && (
                    <View style={[styles.moreAttendees, { backgroundColor: theme.colors.grey2 }]}>
                      <Text style={{ color: theme.colors.black, fontWeight: 'bold' }}>
                        +{event.attendees.length - 8}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  eventImage: {
    width: '100%',
    height: 250,
  },
  content: {
    padding: 20,
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  infoSection: {
    marginTop: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    marginTop: 2,
  },
  infoSubtext: {
    fontSize: 12,
    marginTop: 2,
  },
  virtualLink: {
    fontSize: 14,
    marginTop: 4,
    fontWeight: '600',
  },
  rsvpContainer: {
    marginBottom: 10,
  },
  rsvpTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  rsvpButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rsvpButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 5,
  },
  rsvpButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  speakerCard: {
    borderRadius: 12,
    marginBottom: 10,
    marginHorizontal: 0,
  },
  speakerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  speakerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  speakerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  speakerRole: {
    fontSize: 14,
    marginTop: 2,
  },
  attendeesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  attendeesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  attendeeItem: {
    position: 'relative',
    marginRight: 8,
    marginBottom: 8,
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  moreAttendees: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
