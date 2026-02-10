import { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme, Avatar, ListItem } from '@rneui/themed';
import { Ionicons } from '@expo/vector-icons';
import { AppDispatch, RootState } from '../../store';
import { fetchCurrentProfile } from '../../store/profileSlice';
import { logout } from '../../store/authSlice';

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { theme } = useTheme();
  const { user } = useSelector((state: RootState) => state.auth);
  const { currentProfile } = useSelector((state: RootState) => state.profile);

  useEffect(() => {
    if (user) {
      dispatch(fetchCurrentProfile(user.id));
    }
  }, [user, dispatch]);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await dispatch(logout());
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <View style={styles.profileHeader}>
          <Avatar
            size={80}
            rounded
            source={currentProfile?.avatar ? { uri: currentProfile.avatar } : undefined}
            title={currentProfile?.name?.charAt(0) || 'U'}
            containerStyle={{ backgroundColor: theme.colors.primary }}
          />
          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={[styles.name, { color: theme.colors.black }]}>
                {currentProfile?.name || 'User'}
              </Text>
              {currentProfile?.verificationStatus === 'verified' && (
                <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
              )}
            </View>
            <Text style={[styles.email, { color: theme.colors.grey5 }]}>
              {currentProfile?.email || user?.email}
            </Text>
            <Text style={[styles.gradYear, { color: theme.colors.grey5 }]}>
              Class of {currentProfile?.graduationYear || '2020'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => router.push('/profile/edit' as any)}
        >
          <Ionicons name="create-outline" size={18} color="#fff" />
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoSection}>
        {currentProfile?.jobTitle && (
          <View style={styles.infoRow}>
            <Ionicons name="briefcase-outline" size={20} color={theme.colors.grey4} />
            <Text style={[styles.infoText, { color: theme.colors.grey5 }]}>
              {currentProfile.jobTitle} at {currentProfile.company}
            </Text>
          </View>
        )}
        {currentProfile?.location && (
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color={theme.colors.grey4} />
            <Text style={[styles.infoText, { color: theme.colors.grey5 }]}>
              {currentProfile.location.city}, {currentProfile.location.state}
            </Text>
          </View>
        )}
        {currentProfile?.department && (
          <View style={styles.infoRow}>
            <Ionicons name="school-outline" size={20} color={theme.colors.grey4} />
            <Text style={[styles.infoText, { color: theme.colors.grey5 }]}>
              {currentProfile.department}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.black }]}>Settings</Text>

        <ListItem
          containerStyle={[styles.listItem, { backgroundColor: theme.colors.grey0 }]}
          onPress={() => {}}
        >
          <Ionicons name="shield-checkmark-outline" size={24} color={theme.colors.grey5} />
          <ListItem.Content>
            <ListItem.Title style={{ color: theme.colors.black }}>Privacy Settings</ListItem.Title>
          </ListItem.Content>
          <ListItem.Chevron />
        </ListItem>

        <ListItem
          containerStyle={[styles.listItem, { backgroundColor: theme.colors.grey0 }]}
          onPress={() => {}}
        >
          <Ionicons name="notifications-outline" size={24} color={theme.colors.grey5} />
          <ListItem.Content>
            <ListItem.Title style={{ color: theme.colors.black }}>Notifications</ListItem.Title>
          </ListItem.Content>
          <ListItem.Chevron />
        </ListItem>

        <ListItem
          containerStyle={[styles.listItem, { backgroundColor: theme.colors.grey0 }]}
          onPress={() => {}}
        >
          <Ionicons name="moon-outline" size={24} color={theme.colors.grey5} />
          <ListItem.Content>
            <ListItem.Title style={{ color: theme.colors.black }}>Dark Mode</ListItem.Title>
            <ListItem.Subtitle style={{ color: theme.colors.grey4 }}>
              System Default
            </ListItem.Subtitle>
          </ListItem.Content>
          <ListItem.Chevron />
        </ListItem>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.black }]}>About</Text>

        <ListItem
          containerStyle={[styles.listItem, { backgroundColor: theme.colors.grey0 }]}
          onPress={() => {}}
        >
          <Ionicons name="help-circle-outline" size={24} color={theme.colors.grey5} />
          <ListItem.Content>
            <ListItem.Title style={{ color: theme.colors.black }}>Help & Support</ListItem.Title>
          </ListItem.Content>
          <ListItem.Chevron />
        </ListItem>

        <ListItem
          containerStyle={[styles.listItem, { backgroundColor: theme.colors.grey0 }]}
          onPress={() => {}}
        >
          <Ionicons name="document-text-outline" size={24} color={theme.colors.grey5} />
          <ListItem.Content>
            <ListItem.Title style={{ color: theme.colors.black }}>Terms of Service</ListItem.Title>
          </ListItem.Content>
          <ListItem.Chevron />
        </ListItem>

        <ListItem
          containerStyle={[styles.listItem, { backgroundColor: theme.colors.grey0 }]}
          onPress={() => {}}
        >
          <Ionicons name="information-circle-outline" size={24} color={theme.colors.grey5} />
          <ListItem.Content>
            <ListItem.Title style={{ color: theme.colors.black }}>About AlumniHub</ListItem.Title>
            <ListItem.Subtitle style={{ color: theme.colors.grey4 }}>Version 1.0.0</ListItem.Subtitle>
          </ListItem.Content>
          <ListItem.Chevron />
        </ListItem>
      </View>

      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: theme.colors.error }]}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      <View style={styles.bottomSpacing} />
    </ScrollView>
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
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 15,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginRight: 6,
  },
  email: {
    fontSize: 14,
    marginBottom: 2,
  },
  gradYear: {
    fontSize: 14,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    marginLeft: 10,
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  listItem: {
    borderRadius: 8,
    marginBottom: 5,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 40,
  },
});
