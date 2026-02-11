import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
  TextInput,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme, Avatar, Card, Button, Icon } from '@rneui/themed';
import { Ionicons } from '@expo/vector-icons';
import { AppDispatch, RootState } from '../../store';
import {
  fetchFeed,
  fetchMoreFeed,
  likePost,
  addComment,
  sharePost,
  setFilter,
  setSort,
  connectRealtime,
  disconnectRealtime,
} from '../../store/feedSlice';
import { fetchUnreadCount } from '../../store/notificationsSlice';
import { FeedItem, FeedFilter, FeedSort, FeedComment } from '../../types';

const { width: screenWidth } = Dimensions.get('window');

export default function FeedScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { theme } = useTheme();
  
  const { 
    items, 
    isLoading, 
    hasMore, 
    filter, 
    sort, 
    page,
    isRealtimeConnected,
    error 
  } = useSelector((state: RootState) => state.feed);
  const { unreadCount } = useSelector((state: RootState) => state.notifications);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [refreshing, setRefreshing] = useState(false);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [shareText, setShareText] = useState('');

  useEffect(() => {
    dispatch(fetchFeed({ page: 1, filter, sort }));
    dispatch(fetchUnreadCount());
    dispatch(connectRealtime());

    return () => {
      dispatch(disconnectRealtime());
    };
  }, [dispatch, filter, sort]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchFeed({ page: 1, filter, sort }));
    await dispatch(fetchUnreadCount());
    setRefreshing(false);
  }, [dispatch, filter, sort]);

  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      dispatch(fetchMoreFeed({ page: page + 1, filter, sort }));
    }
  }, [dispatch, isLoading, hasMore, page, filter, sort]);

  const handleLike = useCallback((postId: string) => {
    dispatch(likePost(postId));
  }, [dispatch]);

  const handleComment = useCallback((postId: string) => {
    setSelectedPostId(postId);
    setCommentModalVisible(true);
  }, []);

  const submitComment = useCallback(() => {
    if (selectedPostId && commentText.trim()) {
      dispatch(addComment({ postId: selectedPostId, content: commentText.trim() }));
      setCommentText('');
      setCommentModalVisible(false);
      setSelectedPostId(null);
    }
  }, [dispatch, selectedPostId, commentText]);

  const handleShare = useCallback((postId: string) => {
    setSelectedPostId(postId);
    setShareModalVisible(true);
  }, []);

  const submitShare = useCallback(() => {
    if (selectedPostId) {
      dispatch(sharePost({ postId: selectedPostId, content: shareText.trim() || undefined }));
      setShareText('');
      setShareModalVisible(false);
      setSelectedPostId(null);
    }
  }, [dispatch, selectedPostId, shareText]);

  const formatTimestamp = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const getFilterLabel = (f: FeedFilter): string => {
    switch (f) {
      case FeedFilter.ALL: return 'All';
      case FeedFilter.POSTS: return 'Posts';
      case FeedFilter.EVENTS: return 'Events';
      case FeedFilter.JOBS: return 'Jobs';
      case FeedFilter.MEDIA: return 'Media';
      default: return 'All';
    }
  };

  const getSortLabel = (s: FeedSort): string => {
    switch (s) {
      case FeedSort.LATEST: return 'Latest';
      case FeedSort.TOP: return 'Top';
      case FeedSort.TRENDING: return 'Trending';
      default: return 'Latest';
    }
  };

  const renderComment = ({ item }: { item: FeedComment }) => (
    <View style={styles.commentItem}>
      <Avatar
        size={32}
        rounded
        source={item.author?.avatar ? { uri: item.author.avatar } : undefined}
        title={item.author?.name?.charAt(0) || 'U'}
        containerStyle={{ backgroundColor: theme.colors.primary }}
      />
      <View style={[styles.commentContent, { backgroundColor: theme.colors.grey0 }]}>
        <Text style={[styles.commentAuthor, { color: theme.colors.black }]}>
          {item.author?.name || 'Unknown'}
        </Text>
        <Text style={[styles.commentText, { color: theme.colors.grey5 }]}>
          {item.content}
        </Text>
        <Text style={[styles.commentTime, { color: theme.colors.grey3 }]}>
          {formatTimestamp(item.timestamp)}
        </Text>
      </View>
    </View>
  );

  const renderFeedItem = ({ item }: { item: FeedItem }) => {
    const isLiked = item.likes.includes(user?.id || '');
    const isShared = item.shares.includes(user?.id || '');

    return (
      <Card containerStyle={[styles.feedCard, { backgroundColor: theme.colors.grey0 }]}>
        {/* Header */}
        <View style={styles.header}>
          <Avatar
            size={44}
            rounded
            source={item.author?.avatar ? { uri: item.author.avatar } : undefined}
            title={item.author?.name?.charAt(0) || 'U'}
            containerStyle={{ backgroundColor: theme.colors.primary }}
          />
          <View style={styles.headerInfo}>
            <Text style={[styles.authorName, { color: theme.colors.black }]}>
              {item.author?.name || 'Unknown'}
            </Text>
            <Text style={[styles.timestamp, { color: theme.colors.grey4 }]}>
              {formatTimestamp(item.timestamp)}
              {item.isEdited && ' • Edited'}
            </Text>
          </View>
          {item.isPinned && (
            <Ionicons name="pin" size={18} color={theme.colors.primary} />
          )}
        </View>

        {/* Content */}
        <Text style={[styles.content, { color: theme.colors.black }]}>
          {item.content}
        </Text>

        {/* Images */}
        {item.images && item.images.length > 0 && (
          <View style={styles.imageContainer}>
            {item.images.length === 1 ? (
              <Image source={{ uri: item.images[0] }} style={styles.singleImage} />
            ) : (
              <View style={styles.imageGrid}>
                {item.images.slice(0, 4).map((img, index) => (
                  <Image
                    key={index}
                    source={{ uri: img }}
                    style={[
                      styles.gridImage,
                      { 
                        width: item.images!.length === 2 ? '48%' : '31%',
                        aspectRatio: 1,
                      }
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {/* Shared Post Preview */}
        {item.sharedPost && (
          <Card containerStyle={[styles.sharedPostCard, { backgroundColor: theme.colors.grey1 }]}>
            <View style={styles.header}>
              <Avatar
                size={32}
                rounded
                source={item.sharedPost.author?.avatar ? { uri: item.sharedPost.author.avatar } : undefined}
                title={item.sharedPost.author?.name?.charAt(0) || 'U'}
                containerStyle={{ backgroundColor: theme.colors.primary }}
              />
              <View style={styles.headerInfo}>
                <Text style={[styles.sharedAuthorName, { color: theme.colors.black }]}>
                  {item.sharedPost.author?.name || 'Unknown'}
                </Text>
                <Text style={[styles.timestamp, { color: theme.colors.grey4 }]}>
                  {formatTimestamp(item.sharedPost.timestamp)}
                </Text>
              </View>
            </View>
            <Text style={[styles.sharedContent, { color: theme.colors.grey5 }]} numberOfLines={3}>
              {item.sharedPost.content}
            </Text>
          </Card>
        )}

        {/* Stats */}
        <View style={styles.statsRow}>
          <Text style={[styles.statText, { color: theme.colors.grey4 }]}>
            {item.likes.length} likes
          </Text>
          <Text style={[styles.statText, { color: theme.colors.grey4 }]}>
            {item.comments.length} comments
          </Text>
          <Text style={[styles.statText, { color: theme.colors.grey4 }]}>
            {item.shares.length} shares
          </Text>
        </View>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: theme.colors.grey2 }]} />

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleLike(item.id)}
          >
            <Ionicons 
              name={isLiked ? "heart" : "heart-outline"} 
              size={22} 
              color={isLiked ? theme.colors.error : theme.colors.grey4} 
            />
            <Text style={[styles.actionText, { color: isLiked ? theme.colors.error : theme.colors.grey4 }]}>
              Like
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleComment(item.id)}
          >
            <Ionicons name="chatbubble-outline" size={20} color={theme.colors.grey4} />
            <Text style={[styles.actionText, { color: theme.colors.grey4 }]}>Comment</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleShare(item.id)}
          >
            <Ionicons 
              name={isShared ? "arrow-redo" : "arrow-redo-outline"} 
              size={20} 
              color={isShared ? theme.colors.primary : theme.colors.grey4} 
            />
            <Text style={[styles.actionText, { color: isShared ? theme.colors.primary : theme.colors.grey4 }]}>
              Share
            </Text>
          </TouchableOpacity>
        </View>

        {/* Comments Preview */}
        {item.comments.length > 0 && (
          <View style={styles.commentsPreview}>
            <FlatList
              data={item.comments.slice(-2)}
              renderItem={renderComment}
              keyExtractor={(comment) => comment.id}
              scrollEnabled={false}
            />
            {item.comments.length > 2 && (
              <TouchableOpacity onPress={() => handleComment(item.id)}>
                <Text style={[styles.viewAllComments, { color: theme.colors.grey4 }]}>
                  View all {item.comments.length} comments
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.headerContainer, { backgroundColor: theme.colors.background }]}>
        <View style={styles.headerTop}>
          <Text style={[styles.headerTitle, { color: theme.colors.black }]}>Feed</Text>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => router.push('/notifications')}
          >
            <Ionicons name="notifications-outline" size={24} color={theme.colors.black} />
            {unreadCount > 0 && (
              <View style={[styles.badge, { backgroundColor: theme.colors.error }]}>
                <Text style={styles.badgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={Object.values(FeedFilter)}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.filterTab,
                  filter === item && { backgroundColor: theme.colors.primary }
                ]}
                onPress={() => dispatch(setFilter(item))}
              >
                <Text style={[
                  styles.filterTabText,
                  { color: filter === item ? theme.colors.white : theme.colors.grey5 }
                ]}>
                  {getFilterLabel(item)}
                </Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.filterList}
          />
        </View>

        {/* Sort Options */}
        <View style={styles.sortContainer}>
          {Object.values(FeedSort).map((sortOption) => (
            <TouchableOpacity
              key={sortOption}
              style={[
                styles.sortButton,
                sort === sortOption && { borderBottomColor: theme.colors.primary, borderBottomWidth: 2 }
              ]}
              onPress={() => dispatch(setSort(sortOption))}
            >
              <Text style={[
                styles.sortButtonText,
                { color: sort === sortOption ? theme.colors.primary : theme.colors.grey4 }
              ]}>
                {getSortLabel(sortOption)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Feed List */}
      <FlatList
        data={items}
        renderItem={renderFeedItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.feedList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={isLoading && hasMore ? (
          <ActivityIndicator style={styles.loader} color={theme.colors.primary} />
        ) : null}
        ListEmptyComponent={!isLoading ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="newspaper-outline" size={64} color={theme.colors.grey3} />
            <Text style={[styles.emptyText, { color: theme.colors.grey4 }]}>
              No posts to show
            </Text>
          </View>
        ) : null}
      />

      {/* Create Post FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => router.push('/feed/create')}
      >
        <Ionicons name="add" size={28} color={theme.colors.white} />
      </TouchableOpacity>

      {/* Comment Modal */}
      {commentModalVisible && (
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.black }]}>Add Comment</Text>
            <TextInput
              style={[styles.commentInput, { 
                backgroundColor: theme.colors.grey0,
                color: theme.colors.black,
                borderColor: theme.colors.grey2
              }]}
              placeholder="Write a comment..."
              placeholderTextColor={theme.colors.grey4}
              value={commentText}
              onChangeText={setCommentText}
              multiline
              autoFocus
            />
            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                type="outline"
                onPress={() => {
                  setCommentModalVisible(false);
                  setCommentText('');
                  setSelectedPostId(null);
                }}
                containerStyle={styles.modalButton}
              />
              <Button
                title="Post"
                onPress={submitComment}
                disabled={!commentText.trim()}
                containerStyle={styles.modalButton}
              />
            </View>
          </View>
        </View>
      )}

      {/* Share Modal */}
      {shareModalVisible && (
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.black }]}>Share Post</Text>
            <TextInput
              style={[styles.commentInput, { 
                backgroundColor: theme.colors.grey0,
                color: theme.colors.black,
                borderColor: theme.colors.grey2
              }]}
              placeholder="Add a comment (optional)..."
              placeholderTextColor={theme.colors.grey4}
              value={shareText}
              onChangeText={setShareText}
              multiline
            />
            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                type="outline"
                onPress={() => {
                  setShareModalVisible(false);
                  setShareText('');
                  setSelectedPostId(null);
                }}
                containerStyle={styles.modalButton}
              />
              <Button
                title="Share"
                onPress={submitShare}
                containerStyle={styles.modalButton}
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingTop: 50,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  notificationButton: {
    padding: 8,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 4,
  },
  filterContainer: {
    marginBottom: 8,
  },
  filterList: {
    paddingVertical: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#F7FAFC',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sortContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 8,
  },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  feedList: {
    padding: 8,
  },
  feedCard: {
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    borderWidth: 0,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
    marginTop: 2,
  },
  content: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  imageContainer: {
    marginBottom: 12,
  },
  singleImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  gridImage: {
    borderRadius: 8,
  },
  sharedPostCard: {
    borderRadius: 8,
    marginBottom: 12,
    padding: 12,
    borderWidth: 0,
  },
  sharedAuthorName: {
    fontSize: 14,
    fontWeight: '600',
  },
  sharedContent: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statText: {
    fontSize: 12,
  },
  divider: {
    height: 1,
    marginBottom: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  actionText: {
    fontSize: 13,
    marginLeft: 6,
    fontWeight: '500',
  },
  commentsPreview: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  commentContent: {
    flex: 1,
    marginLeft: 8,
    padding: 8,
    borderRadius: 12,
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: '600',
  },
  commentText: {
    fontSize: 13,
    marginTop: 2,
  },
  commentTime: {
    fontSize: 11,
    marginTop: 4,
  },
  viewAllComments: {
    fontSize: 13,
    marginTop: 8,
  },
  loader: {
    paddingVertical: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    padding: 20,
    borderRadius: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  commentInput: {
    minHeight: 100,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    gap: 12,
  },
  modalButton: {
    minWidth: 100,
  },
});
