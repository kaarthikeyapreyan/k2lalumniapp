import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme, Avatar, Card } from '@rneui/themed';
import { Ionicons } from '@expo/vector-icons';
import { AppDispatch, RootState } from '../../store';
import { fetchAlumni, searchDirectory, setSearchQuery } from '../../store/directorySlice';
import { Profile } from '../../types';

export default function DirectoryScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { theme } = useTheme();
  const { filteredAlumni, searchQuery, isLoading } = useSelector(
    (state: RootState) => state.directory
  );
  const [localQuery, setLocalQuery] = useState(searchQuery);

  useEffect(() => {
    dispatch(fetchAlumni());
  }, [dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(setSearchQuery(localQuery));
      if (localQuery) {
        dispatch(searchDirectory(localQuery));
      } else {
        dispatch(fetchAlumni());
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localQuery, dispatch]);

  const handleRefresh = () => {
    if (searchQuery) {
      dispatch(searchDirectory(searchQuery));
    } else {
      dispatch(fetchAlumni());
    }
  };

  const renderAlumniCard = ({ item }: { item: Profile }) => (
    <TouchableOpacity
      onPress={() => router.push(`/profile/${item.id}` as any)}
    >
      <Card containerStyle={[styles.card, { backgroundColor: theme.colors.grey0 }]}>
        <View style={styles.cardContent}>
          <Avatar
            size={60}
            rounded
            source={item.avatar ? { uri: item.avatar } : undefined}
            title={item.name.charAt(0)}
            containerStyle={{ backgroundColor: theme.colors.primary }}
          />
          <View style={styles.cardInfo}>
            <View style={styles.cardHeader}>
              <Text style={[styles.name, { color: theme.colors.black }]}>{item.name}</Text>
              {item.verificationStatus === 'verified' && (
                <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
              )}
            </View>
            <Text style={[styles.jobTitle, { color: theme.colors.grey5 }]}>
              {item.jobTitle}
            </Text>
            <Text style={[styles.company, { color: theme.colors.grey5 }]}>{item.company}</Text>
            <View style={styles.gradYear}>
              <Ionicons name="school-outline" size={14} color={theme.colors.grey4} />
              <Text style={[styles.gradYearText, { color: theme.colors.grey4 }]}>
                Class of {item.graduationYear}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.connectButton}>
            <Ionicons name="person-add-outline" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.black }]}>Alumni Directory</Text>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: theme.colors.grey0 }]}>
        <Ionicons name="search" size={20} color={theme.colors.grey3} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.black }]}
          placeholder="Search alumni..."
          placeholderTextColor={theme.colors.grey3}
          value={localQuery}
          onChangeText={setLocalQuery}
        />
        {localQuery !== '' && (
          <TouchableOpacity onPress={() => setLocalQuery('')}>
            <Ionicons name="close-circle" size={20} color={theme.colors.grey3} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.resultHeader}>
        <Text style={[styles.resultCount, { color: theme.colors.grey5 }]}>
          {filteredAlumni.length} alumni found
        </Text>
      </View>

      <FlatList
        data={filteredAlumni}
        renderItem={renderAlumniCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color={theme.colors.grey3} />
            <Text style={[styles.emptyText, { color: theme.colors.grey5 }]}>
              No alumni found
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
  resultHeader: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  resultCount: {
    fontSize: 14,
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
    marginLeft: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 6,
  },
  jobTitle: {
    fontSize: 14,
    marginBottom: 2,
  },
  company: {
    fontSize: 14,
    marginBottom: 4,
  },
  gradYear: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gradYearText: {
    fontSize: 12,
    marginLeft: 4,
  },
  connectButton: {
    padding: 8,
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
