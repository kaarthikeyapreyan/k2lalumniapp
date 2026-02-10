import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme, Avatar, Card, Button, Divider, Badge } from '@rneui/themed';
import { Ionicons } from '@expo/vector-icons';
import { AppDispatch, RootState } from '../../store';
import {
  fetchGroupById,
  fetchGroupPosts,
  joinGroup,
  leaveGroup,
  likePost,
  addComment,
  clearError,
  setCurrentGroup,
} from '../../store/groupsSlice';
import { GroupMemberRole } from '../../types';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { theme } = useTheme();
  const { currentGroup, posts, isLoading } = useSelector((state: RootState) => state.groups);
  const { user } = useSelector((state: RootState) => state.auth);
  const [commentText, setCommentText] = useState('');
  const [activePostId, setActivePostId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadGroupData();
    }
    return () => {
      dispatch(setCurrentGroup(null));
    };
  }, [id]);

  const loadGroupData = () => {
    dispatch(fetchGroupById(id));
    dispatch(fetchGroupPosts(id));
  };

  const handleJoinLeave = async () => {
    if (currentGroup?.isJoined) {
      await dispatch(leaveGroup(id));
    } else {
      await dispatch(joinGroup(id));
    }
    dispatch(fetchGroupById(id));
  };

  const handleLikePost = async (postId: string) => {
    await dispatch(likePost(postId));
  };

  const handleAddComment = async (postId: string) => {
    if (!commentText.trim()) return;
    await dispatch(addComment({ postId, content: commentText }));
    setCommentText('');
    setActivePostId(null);
  };

  const isAdmin = currentGroup?.members.some(
    m => m.userId === user?.id && m.role === GroupMemberRole.ADMIN
  );
  const isModerator = currentGroup?.members.some(
    m => m.userId === user?.id && m.role === GroupMemberRole.MODERATOR
  );

  if (!currentGroup && isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.grey5, textAlign: 'center', marginTop: 100 }}>
          Loading...
        </Text>
      </View>
    );
  }

  if (!currentGroup) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.grey5, textAlign: 'center', marginTop: 100 }}>
          Group not found
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
        <TouchableOpacity onPress={() => router.push(`/groups/${id}/members` as any)}>
          <Ionicons name="people" size={24} color={theme.colors.black} />
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadGroupData} />}
      >
        {currentGroup.coverImage && (
          <Image source={{ uri: currentGroup.coverImage }} style={styles.coverImage} />
        )}

        <View style={styles.groupInfo}>
          <Text style={[styles.groupName, { color: theme.colors.black }]}>
            {currentGroup.name}
          </Text>
          <Text style={[styles.groupMeta, { color: theme.colors.grey5 }]}>
            {currentGroup.type} Group • {currentGroup.memberCount} members • {currentGroup.privacy}
          </Text>
          <Text style={[styles.description, { color: theme.colors.grey5 }]}>
            {currentGroup.description}
          </Text>

          <View style={styles.actionButtons}>
            {currentGroup.isJoined ? (
              <Button
                title="Leave Group"
                type="outline"
                onPress={handleJoinLeave}
                buttonStyle={{ borderColor: theme.colors.error }}
                titleStyle={{ color: theme.colors.error }}
                containerStyle={{ flex: 1, marginRight: 10 }}
              />
            ) : (
              <Button
                title={currentGroup.privacy === 'private' ? 'Request to Join' : 'Join Group'}
                onPress={handleJoinLeave}
                buttonStyle={{ backgroundColor: theme.colors.primary }}
                containerStyle={{ flex: 1, marginRight: 10 }}
              />
            )}
            {(isAdmin || isModerator) && (
              <Button
                title="Create Post"
                onPress={() => router.push(`/groups/${id}/post` as any)}
                buttonStyle={{ backgroundColor: theme.colors.success }}
                containerStyle={{ flex: 1 }}
              />
            )}
          </View>
        </View>

        <Divider style={{ marginVertical: 20 }} />

        <View style={styles.postsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.black }]}>Posts</Text>
          
          {posts.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.colors.grey5 }]}>
              No posts yet. Be the first to share!
            </Text>
          ) : (
            posts.map((post) => (
              <Card
                key={post.id}
                containerStyle={[styles.postCard, { backgroundColor: theme.colors.grey0 }]}
              >
                {post.isPinned && (
                  <View style={styles.pinnedBadge}>
                    <Ionicons name="pin" size={14} color={theme.colors.warning} />
                    <Text style={[styles.pinnedText, { color: theme.colors.warning }]}>
                      Pinned
                    </Text>
                  </View>
                )}
                {post.isAnnouncement && (
                  <Badge
                    value="Announcement"
                    status="error"
                    containerStyle={{ marginBottom: 10 }}
                  />
                )}
                
                <View style={styles.postHeader}>
                  <Avatar
                    size={40}
                    rounded
                    source={post.author?.avatar ? { uri: post.author.avatar } : undefined}
                    title={post.author?.name?.charAt(0)}
                    containerStyle={{ backgroundColor: theme.colors.primary }}
                  />
                  <View style={styles.postAuthorInfo}>
                    <Text style={[styles.authorName, { color: theme.colors.black }]}>
                      {post.author?.name}
                    </Text>
                    <Text style={[styles.postTime, { color: theme.colors.grey4 }]}>
                      {new Date(post.timestamp).toLocaleDateString()}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.postContent, { color: theme.colors.black }]}>
                  {post.content}
                </Text>

                {post.images && post.images.length > 0 && (
                  <Image source={{ uri: post.images[0] }} style={styles.postImage} />
                )}

                <View style={styles.postActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleLikePost(post.id)}
                  >
                    <Ionicons
                      name={post.likes.includes(user?.id || '') ? 'heart' : 'heart-outline'}
                      size={20}
                      color={post.likes.includes(user?.id || '') ? theme.colors.error : theme.colors.grey4}
                    />
                    <Text style={[styles.actionText, { color: theme.colors.grey5 }]}>
                      {post.likes.length}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => setActivePostId(activePostId === post.id ? null : post.id)}
                  >
                    <Ionicons name="chatbubble-outline" size={20} color={theme.colors.grey4} />
                    <Text style={[styles.actionText, { color: theme.colors.grey5 }]}>
                      {post.comments.length}
                    </Text>
                  </TouchableOpacity>
                </View>

                {post.comments.length > 0 && (
                  <View style={styles.commentsSection}>
                    {post.comments.map((comment) => (
                      <View key={comment.id} style={styles.comment}>
                        <Avatar
                          size={24}
                          rounded
                          source={comment.author?.avatar ? { uri: comment.author.avatar } : undefined}
                          title={comment.author?.name?.charAt(0)}
                          containerStyle={{ backgroundColor: theme.colors.grey3 }}
                        />
                        <View style={styles.commentContent}>
                          <Text style={[styles.commentAuthor, { color: theme.colors.black }]}>
                            {comment.author?.name}
                          </Text>
                          <Text style={[styles.commentText, { color: theme.colors.grey5 }]}>
                            {comment.content}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {activePostId === post.id && (
                  <View style={styles.commentInputContainer}>
                    <TextInput
                      style={[styles.commentInput, { color: theme.colors.black, backgroundColor: theme.colors.grey1 }]}
                      placeholder="Add a comment..."
                      placeholderTextColor={theme.colors.grey4}
                      value={commentText}
                      onChangeText={setCommentText}
                      multiline
                    />
                    <TouchableOpacity onPress={() => handleAddComment(post.id)}>
                      <Ionicons name="send" size={24} color={theme.colors.primary} />
                    </TouchableOpacity>
                  </View>
                )}
              </Card>
            ))
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
  },
  coverImage: {
    width: '100%',
    height: 200,
  },
  groupInfo: {
    padding: 20,
  },
  groupName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  groupMeta: {
    fontSize: 14,
    marginBottom: 12,
    textTransform: 'capitalize',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  postsSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  postCard: {
    borderRadius: 12,
    marginBottom: 15,
  },
  pinnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  pinnedText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  postAuthorInfo: {
    marginLeft: 10,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
  },
  postTime: {
    fontSize: 12,
  },
  postContent: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: 'row',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionText: {
    marginLeft: 6,
    fontSize: 14,
  },
  commentsSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  comment: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  commentContent: {
    flex: 1,
    marginLeft: 10,
    backgroundColor: '#F7FAFC',
    padding: 10,
    borderRadius: 12,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  commentText: {
    fontSize: 14,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  commentInput: {
    flex: 1,
    padding: 10,
    borderRadius: 20,
    marginRight: 10,
    maxHeight: 100,
  },
});
