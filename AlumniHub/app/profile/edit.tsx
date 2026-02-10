import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme, Input, Button, Avatar } from '@rneui/themed';
import { Ionicons } from '@expo/vector-icons';
import { AppDispatch, RootState } from '../../store';
import { saveProfile } from '../../store/profileSlice';

export default function EditProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { theme } = useTheme();
  const { currentProfile, isLoading } = useSelector((state: RootState) => state.profile);
  const { user } = useSelector((state: RootState) => state.auth);

  const [name, setName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    if (currentProfile) {
      setName(currentProfile.name);
      setJobTitle(currentProfile.jobTitle);
      setCompany(currentProfile.company);
      setBio(currentProfile.bio);
    }
  }, [currentProfile]);

  const handleSave = async () => {
    if (!name || !jobTitle || !company) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (user) {
      try {
        await dispatch(
          saveProfile({
            userId: user.id,
            updates: { name, jobTitle, company, bio },
          })
        ).unwrap();
        Alert.alert('Success', 'Profile updated successfully');
        router.back();
      } catch (error) {
        Alert.alert('Error', 'Failed to update profile');
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.black} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.black }]}>Edit Profile</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.avatarSection}>
          <Avatar
            size={100}
            rounded
            source={currentProfile?.avatar ? { uri: currentProfile.avatar } : undefined}
            title={currentProfile?.name?.charAt(0) || 'U'}
            containerStyle={{ backgroundColor: theme.colors.primary }}
          />
          <TouchableOpacity style={styles.changePhotoButton}>
            <Text style={[styles.changePhotoText, { color: theme.colors.primary }]}>
              Change Photo
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <Input
            label="Full Name *"
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            leftIcon={<Ionicons name="person-outline" size={20} color={theme.colors.grey3} />}
            inputStyle={{ color: theme.colors.black }}
            labelStyle={{ color: theme.colors.grey5 }}
          />

          <Input
            label="Job Title *"
            value={jobTitle}
            onChangeText={setJobTitle}
            placeholder="e.g., Software Engineer"
            leftIcon={<Ionicons name="briefcase-outline" size={20} color={theme.colors.grey3} />}
            inputStyle={{ color: theme.colors.black }}
            labelStyle={{ color: theme.colors.grey5 }}
          />

          <Input
            label="Company *"
            value={company}
            onChangeText={setCompany}
            placeholder="e.g., Google"
            leftIcon={<Ionicons name="business-outline" size={20} color={theme.colors.grey3} />}
            inputStyle={{ color: theme.colors.black }}
            labelStyle={{ color: theme.colors.grey5 }}
          />

          <Input
            label="Bio"
            value={bio}
            onChangeText={setBio}
            placeholder="Tell us about yourself"
            multiline
            numberOfLines={4}
            leftIcon={<Ionicons name="create-outline" size={20} color={theme.colors.grey3} />}
            inputStyle={[styles.bioInput, { color: theme.colors.black }]}
            labelStyle={{ color: theme.colors.grey5 }}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Save Changes"
            onPress={handleSave}
            loading={isLoading}
            disabled={isLoading}
            buttonStyle={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
          />
          <Button
            title="Cancel"
            onPress={() => router.back()}
            type="outline"
            buttonStyle={[styles.cancelButton, { borderColor: theme.colors.grey3 }]}
            titleStyle={{ color: theme.colors.grey5 }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  changePhotoButton: {
    marginTop: 10,
  },
  changePhotoText: {
    fontSize: 16,
    fontWeight: '600',
  },
  form: {
    paddingHorizontal: 20,
  },
  bioInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  saveButton: {
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  cancelButton: {
    paddingVertical: 12,
    borderRadius: 8,
  },
});
