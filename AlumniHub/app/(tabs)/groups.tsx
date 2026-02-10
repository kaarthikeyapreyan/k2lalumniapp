import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme, Avatar, Card, Button, Badge } from '@rneui/themed';
import { Ionicons } from '@expo/vector-icons';
import { AppDispatch, RootState } from '../../store';
import { fetchGroups, fetchMyGroups, joinGroup, clearError } from '../../store/groupsSlice';
import { Group, GroupType } from '../../types';

const groupTypeLabels: Record<GroupType, string> = {
  [GroupType.BATCH]: 'Batch',
  [GroupType.INTEREST]: 'Interest',
  [GroupType.LOCATION]: 'Location',
};

export default function GroupsScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { theme } = useTheme();
  const { groups, myGroups, isLoading, error } = useSelector((state: RootState) => state.groups);
  const [activeTab, setActiveTab] = useState<'discover' | 'my-groups'>('discover');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = () => {
    dispatch(fetchGroups());
    dispatch(fetchMyGroups());
  };

  const handleJoinGroup = async (groupId: string) => {
    await dispatch(joinGroup(groupId));
    dispatch(fetchMyGroups());
  };

  const filteredGroups = (activeTab === 'discover' ? groups : myGroups).filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderGroupCard = ({ item }: { item: Group }) => (
    <TouchableOpacity
      onPress={() => router.push(`/groups/${item.id}` as any)}
    >
      <Card containerStyle={[styles.card, { backgroundColor: theme.colors.grey0 }]}>
        <View style={styles.cardHeader}>
          <Avatar
            size={60}
            rounded
            source={item.coverImage ? { uri: item.coverImage } : undefined}
            title={item.name.charAt(0)}
            containerStyle={{ backgroundColor: theme.colors.primary }}
          />
          <View style={styles.cardInfo}>
            <View style={styles.cardTitleRow}>
              <Text style={[styles.groupName, { color: theme.colors.black }]} numberOfLines={1}>
                {item.name}
              </Text>
              {item.isJoined && (
                <Badge
                  value="Joined"
                  status="success"
                  badgeStyle={{ backgroundColor: theme.colors.success }}
                />
              )}
              {item.privacy === 'private' && (
                <Ionicons name="lock-closed" size={16} color={theme.colors.grey4} />
              )}
            </View>
            <Text style={[styles.groupType, { color: theme.colors.grey5 }]}>
              {groupTypeLabels[item.type]} • {item.memberCount} members
            </Text>
          </View>
        </View>
        <Text style={[styles.description, { color: theme.colors.grey5 }]} numberOfLines={2}>
          {item.description}
        </Text>
        {!item.isJoined && (
          <Button
            title={item.privacy === 'private' ? 'Request to Join' : 'Join Group'}
            onPress={() => handleJoinGroup(item.id)}
            buttonStyle={{ backgroundColor: theme.colors.primary, marginTop: 10 }}
            size="sm"
          />
        )}
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.black }]}>Groups & Communities</Text>
        <TouchableOpacity onPress={() => router.push('/groups/create' as any)}>
          <Ionicons name="add-circle" size={32} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: theme.colors.grey0 }]}>
        <Ionicons name="search" size={20} color={theme.colors.grey3} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.black }]}
          placeholder="Search groups..."
          placeholderTextColor={theme.colors.grey3}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery !== '' && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={theme.colors.grey3} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'discover' && { borderBottomWidth: 2, borderBottomColor: theme.colors.primary },
          ]}
          onPress={() => setActiveTab('discover')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'discover' ? theme.colors.primary : theme.colors.grey5 },
            ]}
          >
            Discover
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'my-groups' && { borderBottomWidth: 2, borderBottomColor: theme.colors.primary },
          ]}
          onPress={() => setActiveTab('my-groups')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'my-groups' ? theme.colors.primary : theme.colors.grey5 },
            ]}
          >
            My Groups ({myGroups.length})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredGroups}
        renderItem={renderGroupCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadGroups} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color={theme.colors.grey3} />
            <Text style={[styles.emptyText, { color: theme.colors.grey5 }]}>
              {activeTab === 'discover'
                ? 'No groups found'
                : 'You haven\'t joined any groups yet'}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 12,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 10,
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
    alignItems: 'center',
    marginBottom: 10,
  },
  cardInfo: {
    flex: 1,
    marginLeft: 15,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  groupName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  groupType: {
    fontSize: 14,
    marginTop: 2,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
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
