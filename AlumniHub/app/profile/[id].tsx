import { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme, Avatar, Button, Chip } from '@rneui/themed';
import { Ionicons } from '@expo/vector-icons';
import { AppDispatch, RootState } from '../../store';
import { fetchProfileById } from '../../store/profileSlice';
import { sendRequest } from '../../store/connectionSlice';
import { startConversation } from '../../store/messagingSlice';

export default function ProfileViewScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { theme } = useTheme();
  const { user } = useSelector((state: RootState) => state.auth);
  const { viewedProfile, isLoading } = useSelector((state: RootState) => state.profile);

  useEffect(() => {
    if (id && typeof id === 'string') {
      dispatch(fetchProfileById(id));
    }
  }, [id, dispatch]);

  const handleConnect = async () => {
    if (user && viewedProfile) {
      await dispatch(sendRequest({ userId: user.id, targetUserId: viewedProfile.id }));
    }
  };

  const handleMessage = async () => {
    if (user && viewedProfile) {
      const result = await dispatch(
        startConversation({ currentUserId: user.id, otherUserId: viewedProfile.id })
      );
      if (result.payload && typeof result.payload === 'object' && 'id' in result.payload) {
        router.push(`/chat/${result.payload.id}` as any);
      }
    }
  };

  if (isLoading || !viewedProfile) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.grey5 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.black} />
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <Avatar
          size={100}
          rounded
          source={viewedProfile.avatar ? { uri: viewedProfile.avatar } : undefined}
          title={viewedProfile.name.charAt(0)}
          containerStyle={{ backgroundColor: theme.colors.primary }}
        />
        <View style={styles.nameSection}>
          <Text style={[styles.name, { color: theme.colors.black }]}>{viewedProfile.name}</Text>
          {viewedProfile.verificationStatus === 'verified' && (
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
          )}
        </View>
        <View style={styles.gradBadge}>
          <Text style={[styles.gradText, { color: theme.colors.primary }]}>
            Class of {viewedProfile.graduationYear}
          </Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons name="briefcase" size={20} color={theme.colors.grey4} />
          <View style={styles.infoTextContainer}>
            <Text style={[styles.infoTitle, { color: theme.colors.black }]}>
              {viewedProfile.jobTitle}
            </Text>
            <Text style={[styles.infoSubtitle, { color: theme.colors.grey5 }]}>
              {viewedProfile.company}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="business" size={20} color={theme.colors.grey4} />
          <View style={styles.infoTextContainer}>
            <Text style={[styles.infoSubtitle, { color: theme.colors.grey5 }]}>
              {viewedProfile.industry}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="location" size={20} color={theme.colors.grey4} />
          <View style={styles.infoTextContainer}>
            <Text style={[styles.infoSubtitle, { color: theme.colors.grey5 }]}>
              {viewedProfile.location.city}, {viewedProfile.location.state}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="school" size={20} color={theme.colors.grey4} />
          <View style={styles.infoTextContainer}>
            <Text style={[styles.infoSubtitle, { color: theme.colors.grey5 }]}>
              {viewedProfile.degree} in {viewedProfile.department}
            </Text>
          </View>
        </View>
      </View>

      {viewedProfile.bio && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.black }]}>About</Text>
          <Text style={[styles.bio, { color: theme.colors.grey5 }]}>{viewedProfile.bio}</Text>
        </View>
      )}

      {viewedProfile.skills.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.black }]}>Skills</Text>
          <View style={styles.skillsContainer}>
            {viewedProfile.skills.map((skill, index) => (
              <Chip
                key={index}
                title={skill}
                containerStyle={styles.chip}
                buttonStyle={{ backgroundColor: theme.colors.grey1 }}
                titleStyle={{ color: theme.colors.grey5, fontSize: 12 }}
              />
            ))}
          </View>
        </View>
      )}

      <View style={styles.actionButtons}>
        <Button
          title="Connect"
          icon={<Ionicons name="person-add" size={18} color="#fff" style={{ marginRight: 8 }} />}
          onPress={handleConnect}
          buttonStyle={[styles.button, { backgroundColor: theme.colors.primary }]}
          containerStyle={styles.buttonContainer}
        />
        <Button
          title="Message"
          icon={<Ionicons name="chatbubble" size={18} color="#fff" style={{ marginRight: 8 }} />}
          onPress={handleMessage}
          buttonStyle={[styles.button, { backgroundColor: theme.colors.secondary }]}
          containerStyle={styles.buttonContainer}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 5,
  },
  profileSection: {
    alignItems: 'center',
    padding: 20,
  },
  nameSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 8,
  },
  gradBadge: {
    marginTop: 8,
  },
  gradText: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoCard: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoSubtitle: {
    fontSize: 14,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  bio: {
    fontSize: 14,
    lineHeight: 20,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
});
