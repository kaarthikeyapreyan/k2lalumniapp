import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme, Avatar, Button } from '@rneui/themed';
import { Ionicons } from '@expo/vector-icons';
import { AppDispatch, RootState } from '../../store';
import { createFeedPost } from '../../store/feedSlice';
import { FeedItemVisibility } from '../../types';

export default function CreatePostScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { theme } = useTheme();
  const { user } = useSelector((state: RootState) => state.auth);
  const { currentProfile } = useSelector((state: RootState) => state.profile);
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<FeedItemVisibility>(FeedItemVisibility.CONNECTIONS_ONLY);
  const [isCreatingPoll, setIsCreatingPoll] = useState(false);
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter some content for your post');
      return;
    }

    if (isCreatingPoll) {
      const validOptions = pollOptions.filter(opt => opt.trim());
      if (validOptions.length < 2) {
        Alert.alert('Error', 'Please provide at least 2 poll options');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      await dispatch(
        createFeedPost({
          content: content.trim(),
          visibility,
          pollOptions: isCreatingPoll ? pollOptions.filter(opt => opt.trim()) : undefined,
        })
      ).unwrap();

      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addPollOption = () => {
    if (pollOptions.length < 6) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const updatePollOption = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const getVisibilityIcon = (v: FeedItemVisibility): keyof typeof Ionicons.glyphMap => {
    switch (v) {
      case FeedItemVisibility.PUBLIC:
        return 'globe';
      case FeedItemVisibility.CONNECTIONS_ONLY:
        return 'people';
      case FeedItemVisibility.GROUP_MEMBERS:
        return 'people-circle';
      default:
        return 'people';
    }
  };

  const getVisibilityLabel = (v: FeedItemVisibility): string => {
    switch (v) {
      case FeedItemVisibility.PUBLIC:
        return 'Public';
      case FeedItemVisibility.CONNECTIONS_ONLY:
        return 'Connections';
      case FeedItemVisibility.GROUP_MEMBERS:
        return 'Group Members';
      default:
        return 'Connections';
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={28} color={theme.colors.black} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.black }]}>Create Post</Text>
        <Button
          title="Post"
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={!content.trim() || isSubmitting}
          buttonStyle={styles.postButton}
          titleStyle={styles.postButtonText}
        />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.userInfo}>
          <Avatar
            size={48}
            rounded
            source={currentProfile?.avatar ? { uri: currentProfile.avatar } : undefined}
            title={currentProfile?.name?.charAt(0)}
            containerStyle={{ backgroundColor: theme.colors.primary }}
          />
          <View style={styles.userDetails}>
            <Text style={[styles.userName, { color: theme.colors.black }]}>
              {currentProfile?.name || user?.name || 'User'}
            </Text>
            <TouchableOpacity
              style={[styles.visibilityButton, { backgroundColor: theme.colors.grey0 }]}
              onPress={() => {
                const visibilities = [
                  FeedItemVisibility.CONNECTIONS_ONLY,
                  FeedItemVisibility.PUBLIC,
                  FeedItemVisibility.GROUP_MEMBERS,
                ];
                const currentIndex = visibilities.indexOf(visibility);
                const nextIndex = (currentIndex + 1) % visibilities.length;
                setVisibility(visibilities[nextIndex]);
              }}
            >
              <Ionicons
                name={getVisibilityIcon(visibility)}
                size={14}
                color={theme.colors.grey5}
              />
              <Text style={[styles.visibilityText, { color: theme.colors.grey5 }]}>
                {getVisibilityLabel(visibility)}
              </Text>
              <Ionicons name="chevron-down" size={14} color={theme.colors.grey5} />
            </TouchableOpacity>
          </View>
        </View>

        <TextInput
          style={[styles.input, { color: theme.colors.black }]}
          placeholder="What's on your mind?"
          placeholderTextColor={theme.colors.grey4}
          value={content}
          onChangeText={setContent}
          multiline
          autoFocus
          textAlignVertical="top"
        />

        {isCreatingPoll && (
          <View style={styles.pollContainer}>
            <Text style={[styles.pollTitle, { color: theme.colors.grey5 }]}>Poll Options</Text>
            {pollOptions.map((option, index) => (
              <View key={index} style={styles.pollOptionRow}>
                <TextInput
                  style={[styles.pollOptionInput, { backgroundColor: theme.colors.grey0, color: theme.colors.black }]}
                  placeholder={`Option ${index + 1}`}
                  placeholderTextColor={theme.colors.grey4}
                  value={option}
                  onChangeText={(text) => updatePollOption(index, text)}
                />
                {pollOptions.length > 2 && (
                  <TouchableOpacity
                    onPress={() => removePollOption(index)}
                    style={styles.removeOptionButton}
                  >
                    <Ionicons name="close-circle" size={24} color={theme.colors.error} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
            {pollOptions.length < 6 && (
              <TouchableOpacity
                style={[styles.addOptionButton, { borderColor: theme.colors.primary }]}
                onPress={addPollOption}
              >
                <Ionicons name="add" size={20} color={theme.colors.primary} />
                <Text style={[styles.addOptionText, { color: theme.colors.primary }]}>
                  Add Option
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: theme.colors.grey1 }]}>
        <TouchableOpacity
          style={[styles.footerButton, { borderRightColor: theme.colors.grey1 }]}
          onPress={() => Alert.alert('Coming Soon', 'Image upload will be available soon!')}
        >
          <Ionicons name="image-outline" size={24} color={theme.colors.primary} />
          <Text style={[styles.footerButtonText, { color: theme.colors.grey5 }]}>Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.footerButton, { borderRightColor: theme.colors.grey1 }]}
          onPress={() => setIsCreatingPoll(!isCreatingPoll)}
        >
          <Ionicons
            name="bar-chart-outline"
            size={24}
            color={isCreatingPoll ? theme.colors.primary : theme.colors.grey5}
          />
          <Text
            style={[
              styles.footerButtonText,
              { color: isCreatingPoll ? theme.colors.primary : theme.colors.grey5 },
            ]}
          >
            Poll
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => Alert.alert('Coming Soon', 'Video upload will be available soon!')}
        >
          <Ionicons name="videocam-outline" size={24} color={theme.colors.primary} />
          <Text style={[styles.footerButtonText, { color: theme.colors.grey5 }]}>Video</Text>
        </TouchableOpacity>
      </View>
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
    padding: 16,
    paddingTop: 60,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  postButton: {
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#0066CC',
  },
  postButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  userDetails: {
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  visibilityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  visibilityText: {
    fontSize: 12,
    fontWeight: '500',
  },
  input: {
    fontSize: 18,
    lineHeight: 26,
    minHeight: 150,
  },
  pollContainer: {
    marginTop: 20,
  },
  pollTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  pollOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  pollOptionInput: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  removeOptionButton: {
    marginLeft: 10,
    padding: 4,
  },
  addOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  addOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingVertical: 12,
  },
  footerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRightWidth: 1,
  },
  footerButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
