import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme, Avatar, Card, Badge, Button } from '@rneui/themed';
import { Ionicons } from '@expo/vector-icons';
import * as mentorshipService from '../mock/services/mentorshipService';
import { Mentorship, MentorshipRequest, MentorshipRequestStatus, Resource } from '../types';

export default function MentorshipScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [mentorships, setMentorships] = useState<Mentorship[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [myRequests, setMyRequests] = useState<MentorshipRequest[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<MentorshipRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'browse' | 'my-mentorships' | 'requests'>('browse');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [allMentorships, allResources, requests, incoming] = await Promise.all([
        mentorshipService.getMentorships(),
        mentorshipService.getResources(),
        mentorshipService.getMyMentorshipRequests(),
        mentorshipService.getIncomingRequests(),
      ]);
      setMentorships(allMentorships);
      setResources(allResources);
      setMyRequests(requests);
      setIncomingRequests(incoming);
    } catch (error) {
      console.error('Failed to load mentorship data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestMentorship = (mentorship: Mentorship) => {
    Alert.alert(
      'Request Mentorship',
      `Send a mentorship request to ${mentorship.mentor?.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request',
          onPress: async () => {
            try {
              await mentorshipService.requestMentorship(mentorship.id, {
                message: 'I would love to learn from your experience.',
                goals: ['Career growth', 'Skill development'],
              });
              Alert.alert('Success', 'Mentorship request sent!');
              loadData();
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const handleRespondToRequest = (requestId: string, status: MentorshipRequestStatus) => {
    Alert.alert(
      status === MentorshipRequestStatus.ACCEPTED ? 'Accept Request' : 'Decline Request',
      status === MentorshipRequestStatus.ACCEPTED
        ? 'Accept this mentorship request?'
        : 'Decline this mentorship request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: status === MentorshipRequestStatus.ACCEPTED ? 'Accept' : 'Decline',
          onPress: async () => {
            try {
              await mentorshipService.respondToRequest(requestId, status);
              loadData();
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const renderMentorshipCard = ({ item }: { item: Mentorship }) => (
    <Card containerStyle={[styles.card, { backgroundColor: theme.colors.grey0 }]}>
      <View style={styles.mentorshipHeader}>
        <Avatar
          size={50}
          rounded
          source={item.mentor?.avatar ? { uri: item.mentor.avatar } : undefined}
          title={item.mentor?.name?.charAt(0)}
          containerStyle={{ backgroundColor: theme.colors.primary }}
        />
        <View style={styles.mentorshipInfo}>
          <Text style={[styles.mentorName, { color: theme.colors.black }]}>
            {item.mentor?.name}
          </Text>
          <Text style={[styles.mentorTitle, { color: theme.colors.grey5 }]}>
            {item.mentor?.jobTitle} at {item.mentor?.company}
          </Text>
        </View>
      </View>
      
      <Text style={[styles.mentorshipTitle, { color: theme.colors.black }]}>
        {item.title}
      </Text>
      
      <Text style={[styles.description, { color: theme.colors.grey5 }]} numberOfLines={2}>
        {item.description}
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.expertiseContainer}>
        {item.expertise.map((skill, index) => (
          <View
            key={index}
            style={[styles.expertiseBadge, { backgroundColor: theme.colors.grey1 }]}
          >
            <Text style={[styles.expertiseText, { color: theme.colors.grey5 }]}>
              {skill}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.availabilityRow}>
        <Ionicons name="time-outline" size={16} color={theme.colors.grey5} />
        <Text style={[styles.availabilityText, { color: theme.colors.grey5 }]}>
          {item.availability}
        </Text>
      </View>

      <View style={styles.mentorshipFooter}>
        <Text style={[styles.menteesText, { color: theme.colors.grey4 }]}>
          {item.currentMentees}/{item.maxMentees} mentees
        </Text>
        {item.currentMentees < item.maxMentees && (
          <Button
            title="Request"
            onPress={() => handleRequestMentorship(item)}
            buttonStyle={{ backgroundColor: theme.colors.primary }}
            size="sm"
          />
        )}
      </View>
    </Card>
  );

  const renderResourceCard = ({ item }: { item: Resource }) => (
    <TouchableOpacity>
      <Card containerStyle={[styles.resourceCard, { backgroundColor: theme.colors.grey0 }]}>
        <View style={styles.resourceHeader}>
          <View style={[styles.resourceIcon, { backgroundColor: theme.colors.primary + '20' }]}>
            <Ionicons
              name={
                item.type === 'article' ? 'document-text' :
                item.type === 'course' ? 'play-circle' :
                item.type === 'certification' ? 'ribbon' :
                item.type === 'video' ? 'videocam' : 'book'
              }
              size={24}
              color={theme.colors.primary}
            />
          </View>
          <View style={styles.resourceInfo}>
            <Text style={[styles.resourceTitle, { color: theme.colors.black }]} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={[styles.resourceType, { color: theme.colors.grey5 }]}>
              {item.type.charAt(0).toUpperCase() + item.type.slice(1)} • {item.author?.name}
            </Text>
          </View>
        </View>
        
        <View style={styles.resourceFooter}>
          <View style={styles.resourceStats}>
            <Ionicons name="heart" size={14} color={theme.colors.grey4} />
            <Text style={[styles.statText, { color: theme.colors.grey4 }]}>
              {item.likes.length}
            </Text>
            <Ionicons name="share-outline" size={14} color={theme.colors.grey4} style={{ marginLeft: 12 }} />
            <Text style={[styles.statText, { color: theme.colors.grey4 }]}>
              {item.shares}
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderRequestCard = ({ item }: { item: MentorshipRequest }) => (
    <Card containerStyle={[styles.card, { backgroundColor: theme.colors.grey0 }]}>
      <View style={styles.requestHeader}>
        <Avatar
          size={40}
          rounded
          source={item.mentee?.avatar ? { uri: item.mentee.avatar } : undefined}
          title={item.mentee?.name?.charAt(0)}
          containerStyle={{ backgroundColor: theme.colors.primary }}
        />
        <View style={styles.requestInfo}>
          <Text style={[styles.requestName, { color: theme.colors.black }]}>
            {item.mentee?.name}
          </Text>
          <Text style={[styles.requestGoal, { color: theme.colors.grey5 }]}>
            {item.goals.join(', ')}
          </Text>
        </View>
      </View>
      
      <Text style={[styles.requestMessage, { color: theme.colors.grey5 }]}>
        "{item.message}"
      </Text>

      {item.status === MentorshipRequestStatus.PENDING && (
        <View style={styles.requestActions}>
          <Button
            title="Accept"
            onPress={() => handleRespondToRequest(item.id, MentorshipRequestStatus.ACCEPTED)}
            buttonStyle={{ backgroundColor: theme.colors.success, flex: 1, marginRight: 10 }}
          />
          <Button
            title="Decline"
            onPress={() => handleRespondToRequest(item.id, MentorshipRequestStatus.DECLINED)}
            type="outline"
            buttonStyle={{ borderColor: theme.colors.error, flex: 1 }}
            titleStyle={{ color: theme.colors.error }}
          />
        </View>
      )}

      {item.status !== MentorshipRequestStatus.PENDING && (
        <Badge
          value={item.status}
          status={item.status === MentorshipRequestStatus.ACCEPTED ? 'success' : 'error'}
          containerStyle={{ alignSelf: 'flex-start' }}
        />
      )}
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.black }]}>Mentorship</Text>
        <TouchableOpacity onPress={() => router.push('/mentorship/create' as any)}>
          <Ionicons name="add-circle" size={32} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'browse' && { borderBottomWidth: 2, borderBottomColor: theme.colors.primary },
          ]}
          onPress={() => setActiveTab('browse')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'browse' ? theme.colors.primary : theme.colors.grey5 },
            ]}
          >
            Browse
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'my-mentorships' && { borderBottomWidth: 2, borderBottomColor: theme.colors.primary },
          ]}
          onPress={() => setActiveTab('my-mentorships')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'my-mentorships' ? theme.colors.primary : theme.colors.grey5 },
            ]}
          >
            My Requests
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'requests' && { borderBottomWidth: 2, borderBottomColor: theme.colors.primary },
          ]}
          onPress={() => setActiveTab('requests')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'requests' ? theme.colors.primary : theme.colors.grey5 },
            ]}
          >
            Incoming {incomingRequests.length > 0 && `(${incomingRequests.length})`}
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'browse' && (
        <ScrollView
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadData} />}
        >
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.black }]}>
              Available Mentors
            </Text>
            {mentorships.length === 0 ? (
              <Text style={[styles.emptyText, { color: theme.colors.grey5 }]}>
                No mentorship opportunities available
              </Text>
            ) : (
              mentorships.map((mentorship) => (
                <View key={mentorship.id}>
                  {renderMentorshipCard({ item: mentorship })}
                </View>
              ))
            )}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.black }]}>
              Resources & Learning
            </Text>
            {resources.length === 0 ? (
              <Text style={[styles.emptyText, { color: theme.colors.grey5 }]}>
                No resources available
              </Text>
            ) : (
              resources.slice(0, 5).map((resource) => (
                <View key={resource.id}>
                  {renderResourceCard({ item: resource })}
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}

      {activeTab === 'my-mentorships' && (
        <FlatList
          data={myRequests}
          renderItem={({ item }) => (
            <Card containerStyle={[styles.card, { backgroundColor: theme.colors.grey0 }]}>
              <View style={styles.requestHeader}>
                <Avatar
                  size={40}
                  rounded
                  source={item.mentor?.avatar ? { uri: item.mentor.avatar } : undefined}
                  title={item.mentor?.name?.charAt(0)}
                  containerStyle={{ backgroundColor: theme.colors.primary }}
                />
                <View style={styles.requestInfo}>
                  <Text style={[styles.requestName, { color: theme.colors.black }]}>
                    {item.mentor?.name}
                  </Text>
                  <Text style={[styles.requestMentorshipTitle, { color: theme.colors.grey5 }]}>
                    {item.mentorship?.title}
                  </Text>
                </View>
              </View>
              <Badge
                value={item.status}
                status={
                  item.status === MentorshipRequestStatus.ACCEPTED
                    ? 'success'
                    : item.status === MentorshipRequestStatus.DECLINED
                    ? 'error'
                    : 'warning'
                }
                containerStyle={{ alignSelf: 'flex-start', marginTop: 10 }}
              />
            </Card>
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadData} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="school-outline" size={64} color={theme.colors.grey3} />
              <Text style={[styles.emptyText, { color: theme.colors.grey5 }]}>
                You haven't sent any mentorship requests
              </Text>
            </View>
          }
        />
      )}

      {activeTab === 'requests' && (
        <FlatList
          data={incomingRequests}
          renderItem={renderRequestCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadData} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="mail-outline" size={64} color={theme.colors.grey3} />
              <Text style={[styles.emptyText, { color: theme.colors.grey5 }]}>
                No incoming requests
              </Text>
            </View>
          }
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
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  mentorshipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  mentorshipInfo: {
    marginLeft: 12,
    flex: 1,
  },
  mentorName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  mentorTitle: {
    fontSize: 14,
    marginTop: 2,
  },
  mentorshipTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  expertiseContainer: {
    flexDirection: 'row',
  },
  expertiseBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
  },
  expertiseText: {
    fontSize: 12,
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  availabilityText: {
    fontSize: 14,
    marginLeft: 6,
  },
  mentorshipFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  menteesText: {
    fontSize: 14,
  },
  resourceCard: {
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  resourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resourceIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resourceInfo: {
    marginLeft: 12,
    flex: 1,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  resourceType: {
    fontSize: 14,
    marginTop: 2,
  },
  resourceFooter: {
    marginTop: 12,
  },
  resourceStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    marginLeft: 4,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requestInfo: {
    marginLeft: 12,
    flex: 1,
  },
  requestName: {
    fontSize: 16,
    fontWeight: '600',
  },
  requestGoal: {
    fontSize: 14,
    marginTop: 2,
  },
  requestMentorshipTitle: {
    fontSize: 14,
    marginTop: 2,
  },
  requestMessage: {
    fontSize: 14,
    fontStyle: 'italic',
    marginVertical: 12,
    lineHeight: 20,
  },
  requestActions: {
    flexDirection: 'row',
    marginTop: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 15,
    textAlign: 'center',
  },
});
