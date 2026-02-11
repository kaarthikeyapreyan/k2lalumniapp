import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme, Avatar, Button } from '@rneui/themed';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { AppDispatch, RootState } from '../../store';
import { createPost } from '../../store/feedSlice';
import { FeedItemType } from '../../types';

export default function CreatePostScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { theme } = useTheme();
  
  const { user } = useSelector((state: RootState) => state.auth);
  const { currentProfile } = useSelector((state: RootState) => state.profile);
  const { isLoading } = useSelector((state: RootState) => state.feed);
  
  const [content, setContent] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [postType, setPostType] = useState<FeedItemType>(FeedItemType.POST);

  const pickImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 4,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map(asset => asset.uri);
      setSelectedImages(prev => [...prev, ...newImages].slice(0, 4));
    }
  }, []);

  const removeImage = useCallback((index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!content.trim() && selectedImages.length === 0) return;

    try {
      await dispatch(createPost({
        content: content.trim(),
        images: selectedImages.length > 0 ? selectedImages : undefined,
        type: postType,
      })).unwrap();
      
      router.back();
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  }, [dispatch, content, selectedImages, postType, router]);

  const getPostTypeLabel = (type: FeedItemType): string => {
    switch (type) {
      case FeedItemType.POST:
        return 'Post';
      case FeedItemType.MILESTONE:
        return 'Milestone';
      case FeedItemType.MEDIA:
        return 'Media';
      default:
        return 'Post';
    }
  };

  const isValid = content.trim().length > 0 || selectedImages.length > 0;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={28} color={theme.colors.black} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.black }]}>
          Create Post
        </Text>
        <Button
          title="Post"
          onPress={handleSubmit}
          disabled={!isValid || isLoading}
          loading={isLoading}
          buttonStyle={styles.postButton}
          titleStyle={styles.postButtonText}
        />
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        {/* User Info */}
        <View style={styles.userInfo}>
          <Avatar
            size={48}
            rounded
            source={currentProfile?.avatar ? { uri: currentProfile.avatar } : undefined}
            title={currentProfile?.name?.charAt(0) || user?.name?.charAt(0) || 'U'}
            containerStyle={{ backgroundColor: theme.colors.primary }}
          />
          <View style={styles.userInfoText}>
            <Text style={[styles.userName, { color: theme.colors.black }]}>
              {currentProfile?.name || user?.name || 'User'}
            </Text>
            <TouchableOpacity 
              style={[styles.visibilityBadge, { backgroundColor: theme.colors.grey1 }]}
            >
              <Ionicons name="earth" size={14} color={theme.colors.grey5} />
              <Text style={[styles.visibilityText, { color: theme.colors.grey5 }]}>
                Public
              </Text>
              <Ionicons name="chevron-down" size={14} color={theme.colors.grey5} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Post Type Selector */}
        <View style={styles.typeSelector}>
          {[FeedItemType.POST, FeedItemType.MILESTONE, FeedItemType.MEDIA].map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.typeButton,
                postType === type && { backgroundColor: theme.colors.primary }
              ]}
              onPress={() => setPostType(type)}
            >
              <Text style={[
                styles.typeButtonText,
                { color: postType === type ? theme.colors.white : theme.colors.grey5 }
              ]}>
                {getPostTypeLabel(type)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Text Input */}
        <TextInput
          style={[styles.textInput, { color: theme.colors.black }]}
          placeholder="What's on your mind?"
          placeholderTextColor={theme.colors.grey4}
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
          autoFocus
        />

        {/* Selected Images */}
        {selectedImages.length > 0 && (
          <View style={styles.imagesContainer}>
            {selectedImages.map((uri, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri }} style={styles.selectedImage} />
                <TouchableOpacity
                  style={[styles.removeImageButton, { backgroundColor: theme.colors.grey0 }]}
                  onPress={() => removeImage(index)}
                >
                  <Ionicons name="close" size={18} color={theme.colors.black} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Footer Actions */}
      <View style={[styles.footer, { backgroundColor: theme.colors.grey0 }]}>
        <Text style={[styles.addToPostText, { color: theme.colors.grey5 }]}>
          Add to your post
        </Text>
        <View style={styles.footerActions}>
          <TouchableOpacity style={styles.footerButton} onPress={pickImage}>
            <Ionicons name="image" size={24} color="#48BB78" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerButton}>
            <Ionicons name="person" size={24} color="#0066CC" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerButton}>
            <Ionicons name="happy" size={24} color="#ED8936" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerButton}>
            <Ionicons name="location" size={24} color="#F56565" />
          </TouchableOpacity>
        </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginLeft: 16,
  },
  postButton: {
    paddingHorizontal: 20,
    borderRadius: 20,
    minWidth: 80,
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
  userInfoText: {
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  visibilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  visibilityText: {
    fontSize: 12,
    marginHorizontal: 4,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#F7FAFC',
  },
  typeButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  textInput: {
    fontSize: 18,
    lineHeight: 26,
    minHeight: 150,
    textAlignVertical: 'top',
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  imageWrapper: {
    position: 'relative',
    width: '48%',
    aspectRatio: 1,
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  addToPostText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  footerActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  footerButton: {
    padding: 12,
  },
});
