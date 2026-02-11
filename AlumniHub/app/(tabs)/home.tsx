import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme, Avatar, Card, Button } from '@rneui/themed';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'react-native';
import { AppDispatch, RootState } from '../../store';
import {
  fetchFeed,
  fetchMoreFeed,
  setRefreshing,
  setSortBy,
  updateFilter,
  resetFilter,
  likeFeedItem,
  unlikeFeedItem,
  addComment,
  shareFeedItem,
  voteOnPoll,
  reportContent,
  muteUser,
} from '../../store/feedSlice';
import { fetchUnreadCount } from '../../store/notificationsSlice';
import { FeedItem, FeedItemType, FeedSortOption, FeedComment, PollOption, FeedFilter } from '../../types';

export default function HomeScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { theme } = useTheme();
  const { user } = useSelector((state: RootState) => state.auth);
  const { currentProfile } = useSelector((state: RootState) => state.profile);
  const { items, hasMore, page, sortBy, filter, isLoading, refreshing } = useSelector(
    (state: RootState) => state.feed
  );
  const { unreadCount } = useSelector((state: RootState) => state.notifications);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentingItemId, setCommentingItemId] = useState<string | null>(null);

  useEffect(() => {
    loadFeed();
    dispatch(fetchUnreadCount());
  }, []);

  const loadFeed = () => {
    dispatch(fetchFeed({ page: 1, sortBy, filter }));
  };

  const loadMore = () => {
    if (!isLoading && hasMore) {
      dispatch(fetchMoreFeed({ page: page + 1, sortBy, filter }));
    }
  };

  const onRefresh = useCallback(() => {
    dispatch(setRefreshing(true));
    dispatch(fetchFeed({ page: 1, sortBy, filter })).then(() => {
      dispatch(setRefreshing(false));
      dispatch(fetchUnreadCount());
    });
  }, [dispatch, sortBy, filter]);

  const handleLike = (itemId: string, isLiked: boolean) => {
    if (isLiked) {
      dispatch(unlikeFeedItem(itemId));
    } else {
      dispatch(likeFeedItem(itemId));
    }
  };

  const handleComment = (itemId: string) => {
    setCommentingItemId(itemId);
    setCommentModalVisible(true);
  };

  const submitComment = () => {
    if (commentingItemId && commentText.trim()) {
      dispatch(addComment({ itemId: commentingItemId, content: commentText.trim() }));
      setCommentText('');
      setCommentModalVisible(false);
      setCommentingItemId(null);
    }
  };

  const handleShare = (itemId: string) => {
    dispatch(shareFeedItem(itemId));
  };

  const handleVote = (itemId: string, optionId: string) => {
    dispatch(voteOnPoll({ itemId, optionId }));
  };

  const openReportModal = (itemId: string) => {
    setSelectedItemId(itemId);
    setReportModalVisible(true);
  };

  const submitReport = () => {
    if (selectedItemId && reportReason.trim()) {
      dispatch(reportContent({ itemId: selectedItemId, reason: reportReason.trim() }));
      setReportReason('');
      setReportModalVisible(false);
      setSelectedItemId(null);
      Alert.alert('Report Submitted', 'Thank you for your report. We will review it shortly.');
    }
  };

  const handleMuteUser = (userId: string, userName: string) => {
    Alert.alert(
      'Mute User',
      `Are you sure you want to mute ${userName}? You won't see their posts in your feed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mute',
          style: 'destructive',
          onPress: () => dispatch(muteUser(userId)),
        },
      ]
    );
  };

  const formatTimeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const getItemIcon = (type: FeedItemType): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case FeedItemType.GROUP_ANNOUNCEMENT:
        return 'megaphone';
      case FeedItemType.GROUP_POST:
        return 'people';
      case FeedItemType.EVENT_INVITATION:
      case FeedItemType.EVENT_UPDATE:
        return 'calendar';
      case FeedItemType.JOB_POSTING:
        return 'briefcase';
      case FeedItemType.ACHIEVEMENT:
      case FeedItemType.MILESTONE:
        return 'trophy';
      case FeedItemType.POLL:
        return 'bar-chart';
      case FeedItemType.SURVEY:
        return 'clipboard';
      default:
        return 'document-text';
    }
  };

  const getItemTypeLabel = (type: FeedItemType): string => {
    switch (type) {
      case FeedItemType.GROUP_ANNOUNCEMENT:
        return 'Announcement';
      case FeedItemType.GROUP_POST:
        return 'Group Post';
      case FeedItemType.EVENT_INVITATION:
        return 'Event Invitation';
      case FeedItemType.EVENT_UPDATE:
        return 'Event Update';
      case FeedItemType.JOB_POSTING:
        return 'Job Posting';
      case FeedItemType.ACHIEVEMENT:
        return 'Achievement';
      case FeedItemType.MILESTONE:
        return 'Milestone';
      case FeedItemType.POLL:
        return 'Poll';
      case FeedItemType.SURVEY:
        return 'Survey';
      default:
        return 'Post';
    }
  };

  const renderPoll = (item: FeedItem) => {
    if (!item.pollOptions) return null;

    const totalVotes = item.pollOptions.reduce((sum, opt) => sum + opt.votes.length, 0);
    const hasVoted = item.pollOptions.some(opt => opt.votes.includes(user?.id || ''));

    return (
      <View style={styles.pollContainer}>
        {item.pollOptions.map((option) => {
          const percentage = totalVotes > 0 ? Math.round((option.votes.length / totalVotes) * 100) : 0;
          return (
            <TouchableOpacity
              key={option.id}
              style={[styles.pollOption, { backgroundColor: theme.colors.grey0 }]}
              onPress={() => !hasVoted && handleVote(item.id, option.id)}
              disabled={hasVoted}
            >
              <View style={styles.pollOptionContent}>
                <Text style={[styles.pollOptionText, { color: theme.colors.black }]}>
                  {option.text}
                </Text>
                {hasVoted && (
                  <Text style={[styles.pollPercentage, { color: theme.colors.grey5 }]}>
                    {percentage}% ({option.votes.length})
                  </Text>
                )}
              </View>
              {hasVoted && (
                <View
                  style={[
                    styles.pollBar,
                    { width: `${percentage}%`, backgroundColor: theme.colors.primary + '40' },
                  ]}
                />
              )}
            </TouchableOpacity>
          );
        })}
        <Text style={[styles.pollTotal, { color: theme.colors.grey5 }]}>
          {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
        </Text>
      </View>
    );
  };

  const renderComments = (comments: FeedComment[]) => {
    if (comments.length === 0) return null;

    return (
      <View style={styles.commentsContainer}>
        {comments.slice(0, 2).map((comment) => (
          <View key={comment.id} style={styles.commentItem}>
            <Avatar
              size={24}
              rounded
              source={comment.author?.avatar ? { uri: comment.author.avatar } : undefined}
              title={comment.author?.name?.charAt(0)}
              containerStyle={{ backgroundColor: theme.colors.primary }}
            />
            <View style={styles.commentContent}>
              <Text style={[styles.commentAuthor, { color: theme.colors.black }]}>
                {comment.author?.name}
              </Text>
              <Text style={[styles.commentText, { color: theme.colors.grey5 }]} numberOfLines={2}>
                {comment.content}
              </Text>
            </View>
          </View>
        ))}
        {comments.length > 2 && (
          <Text style={[styles.moreComments, { color: theme.colors.primary }]}>
            View all {comments.length} comments
          </Text>
        )}
      </View>
    );
  };

  const renderFeedItem = ({ item }: { item: FeedItem }) => {
    const isLiked = user ? item.likes.includes(user.id) : false;
    const isShared = user ? item.shares.includes(user.id) : false;

    return (
      <Card
        containerStyle={[
          styles.feedCard,
          { backgroundColor: theme.colors.grey0, borderColor: theme.colors.grey1 },
        ]}
      >
        {item.isPinned && (
          <View style={styles.pinnedBadge}>
            <Ionicons name="pin" size={12} color={theme.colors.primary} />
            <Text style={[styles.pinnedText, { color: theme.colors.primary }]}>Pinned</Text>
          </View>
        )}

        <View style={styles.feedHeader}>
          <Avatar
            size={40}
            rounded
            source={item.author?.avatar ? { uri: item.author.avatar } : undefined}
            title={item.author?.name?.charAt(0)}
            containerStyle={{ backgroundColor: theme.colors.primary }}
          />
          <View style={styles.feedHeaderContent}>
            <Text style={[styles.feedAuthor, { color: theme.colors.black }]}>
              {item.author?.name || 'Unknown'}
            </Text>
            <View style={styles.feedMeta}>
              <Text style={[styles.feedTime, { color: theme.colors.grey5 }]}>
                {formatTimeAgo(item.timestamp)}
              </Text>
              <View style={styles.typeBadge}>
                <Ionicons
                  name={getItemIcon(item.type)}
                  size={10}
                  color={theme.colors.grey5}
                />
                <Text style={[styles.typeText, { color: theme.colors.grey5 }]}>
                  {getItemTypeLabel(item.type)}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            onPress={() =>
              item.author && handleMuteUser(item.authorId, item.author.name)
            }
          >
            <Ionicons name="ellipsis-horizontal" size={20} color={theme.colors.grey5} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.feedContent, { color: theme.colors.black }]}>{item.content}</Text>

        {item.images && item.images.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesContainer}>
            {item.images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={styles.feedImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        )}

        {item.type === FeedItemType.POLL && renderPoll(item)}

        {item.event && (
          <TouchableOpacity
            style={[styles.linkedCard, { backgroundColor: theme.colors.background }]}
            onPress={() => router.push(`/events/${item.eventId}` as any)}
          >
            <Ionicons name="calendar" size={20} color={theme.colors.primary} />
            <View style={styles.linkedCardContent}>
              <Text style={[styles.linkedCardTitle, { color: theme.colors.black }]}>
                {item.event.title}
              </Text>
              <Text style={[styles.linkedCardSubtitle, { color: theme.colors.grey5 }]}>
                {new Date(item.event.startDate).toLocaleDateString()}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.grey5} />
          </TouchableOpacity>
        )}

        {item.job && (
          <TouchableOpacity
            style={[styles.linkedCard, { backgroundColor: theme.colors.background }]}
            onPress={() => router.push(`/jobs/${item.jobId}` as any)}
          >
            <Ionicons name="briefcase" size={20} color={theme.colors.primary} />
            <View style={styles.linkedCardContent}>
              <Text style={[styles.linkedCardTitle, { color: theme.colors.black }]}>
                {item.job.title}
              </Text>
              <Text style={[styles.linkedCardSubtitle, { color: theme.colors.grey5 }]}>
                {item.job.company}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.grey5} />
          </TouchableOpacity>
        )}

        {item.group && (
          <View style={[styles.linkedCard, { backgroundColor: theme.colors.background }]}>
            <Ionicons name="people" size={20} color={theme.colors.primary} />
            <View style={styles.linkedCardContent}>
              <Text style={[styles.linkedCardTitle, { color: theme.colors.black }]}>
                {item.group.name}
              </Text>
              <Text style={[styles.linkedCardSubtitle, { color: theme.colors.grey5 }]}>
                {item.group.memberCount} members
              </Text>
            </View>
          </View>
        )}

        {renderComments(item.comments)}

        <View style={styles.feedActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleLike(item.id, isLiked)}>
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={22}
              color={isLiked ? '#EF4444' : theme.colors.grey5}
            />
            <Text style={[styles.actionText, { color: theme.colors.grey5 }]}>
              {item.likes.length}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => handleComment(item.id)}>
            <Ionicons name="chatbubble-outline" size={20} color={theme.colors.grey5} />
            <Text style={[styles.actionText, { color: theme.colors.grey5 }]}>
              {item.comments.length}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => handleShare(item.id)}>
            <Ionicons
              name={isShared ? 'share' : 'share-outline'}
              size={20}
              color={isShared ? theme.colors.primary : theme.colors.grey5}
            />
            <Text style={[styles.actionText, { color: theme.colors.grey5 }]}>
              {item.shares.length}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => openReportModal(item.id)}>
            <Ionicons name="flag-outline" size={20} color={theme.colors.grey5} />
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: theme.colors.black }]}>Activity Feed</Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.grey5 }]}>
            Stay updated with your network
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: theme.colors.grey0 }]}
            onPress={() => setFilterModalVisible(true)}
          >
            <Ionicons name="options-outline" size={22} color={theme.colors.grey5} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: theme.colors.grey0 }]}
            onPress={() => router.push('/notifications' as any)}
          >
            <Ionicons name="notifications-outline" size={22} color={theme.colors.grey5} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.sortContainer}>
        <TouchableOpacity
          style={[
            styles.sortButton,
            {
              backgroundColor:
                sortBy === FeedSortOption.CHRONOLOGICAL
                  ? theme.colors.primary
                  : theme.colors.grey0,
            },
          ]}
          onPress={() => dispatch(setSortBy(FeedSortOption.CHRONOLOGICAL))}
        >
          <Text
            style={[
              styles.sortButtonText,
              {
                color:
                  sortBy === FeedSortOption.CHRONOLOGICAL
                    ? '#FFFFFF'
                    : theme.colors.grey5,
              },
            ]}
          >
            Recent
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.sortButton,
            {
              backgroundColor:
                sortBy === FeedSortOption.ALGORITHMIC
                  ? theme.colors.primary
                  : theme.colors.grey0,
            },
          ]}
          onPress={() => dispatch(setSortBy(FeedSortOption.ALGORITHMIC))}
        >
          <Text
            style={[
              styles.sortButtonText,
              {
                color:
                  sortBy === FeedSortOption.ALGORITHMIC
                    ? '#FFFFFF'
                    : theme.colors.grey5,
              },
            ]}
          >
            Top Posts
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        renderItem={renderFeedItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.feedList}
        ListFooterComponent={
          isLoading && items.length > 0 ? (
            <ActivityIndicator style={styles.loadMoreIndicator} color={theme.colors.primary} />
          ) : null
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="newspaper-outline" size={64} color={theme.colors.grey3} />
              <Text style={[styles.emptyText, { color: theme.colors.grey5 }]}>
                No posts to show
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.colors.grey4 }]}>
                Adjust your filters or check back later
              </Text>
            </View>
          ) : null
        }
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.black }]}>Feed Filters</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.grey5} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterContent}>
              <Text style={[styles.filterSection, { color: theme.colors.grey5 }]}>Show Content</Text>

              {[
                { key: 'showPosts', label: 'Posts & Polls' },
                { key: 'showGroupActivity', label: 'Group Activity' },
                { key: 'showEvents', label: 'Events' },
                { key: 'showJobs', label: 'Job Postings' },
                { key: 'showAchievements', label: 'Achievements' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={styles.filterOption}
                  onPress={() =>
                    dispatch(updateFilter({ [option.key]: !filter[option.key as keyof FeedFilter] }))
                  }
                >
                  <Text style={[styles.filterOptionText, { color: theme.colors.black }]}>
                    {option.label}
                  </Text>
                  <Ionicons
                    name={filter[option.key as keyof FeedFilter] ? 'checkbox' : 'square-outline'}
                    size={24}
                    color={filter[option.key as keyof FeedFilter] ? theme.colors.primary : theme.colors.grey3}
                  />
                </TouchableOpacity>
              ))}

              {filter.mutedKeywords.length > 0 && (
                <>
                  <Text style={[styles.filterSection, { color: theme.colors.grey5, marginTop: 20 }]}>
                    Muted Keywords
                  </Text>
                  {filter.mutedKeywords.map((keyword) => (
                    <View key={keyword} style={styles.mutedItem}>
                      <Text style={{ color: theme.colors.black }}>{keyword}</Text>
                    </View>
                  ))}
                </>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                title="Reset Filters"
                type="outline"
                onPress={() => dispatch(resetFilter())}
                containerStyle={styles.modalButton}
              />
              <Button
                title="Apply"
                onPress={() => {
                  setFilterModalVisible(false);
                  loadFeed();
                }}
                containerStyle={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={reportModalVisible}
        onRequestClose={() => setReportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.reportModalContent, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.black }]}>Report Content</Text>
            <Text style={[styles.reportSubtitle, { color: theme.colors.grey5 }]}>
              Please tell us why you're reporting this content
            </Text>
            <TextInput
              style={[
                styles.reportInput,
                { backgroundColor: theme.colors.grey0, color: theme.colors.black },
              ]}
              placeholder="Enter your reason..."
              placeholderTextColor={theme.colors.grey4}
              value={reportReason}
              onChangeText={setReportReason}
              multiline
              numberOfLines={4}
            />
            <View style={styles.reportButtons}>
              <Button
                title="Cancel"
                type="clear"
                onPress={() => {
                  setReportModalVisible(false);
                  setReportReason('');
                }}
              />
              <Button
                title="Submit Report"
                onPress={submitReport}
                disabled={!reportReason.trim()}
              />
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={commentModalVisible}
        onRequestClose={() => setCommentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.commentModalContent, { backgroundColor: theme.colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.black }]}>Add Comment</Text>
              <TouchableOpacity onPress={() => setCommentModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.grey5} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={[
                styles.commentInput,
                { backgroundColor: theme.colors.grey0, color: theme.colors.black },
              ]}
              placeholder="Write a comment..."
              placeholderTextColor={theme.colors.grey4}
              value={commentText}
              onChangeText={setCommentText}
              multiline
              autoFocus
            />
            <Button
              title="Post Comment"
              onPress={submitComment}
              disabled={!commentText.trim()}
              containerStyle={styles.commentButton}
            />
          </View>
        </View>
      </Modal>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => router.push('/create-post' as any)}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
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
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 4,
  },
  sortContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 10,
    gap: 10,
  },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  feedList: {
    padding: 10,
    paddingBottom: 100,
  },
  feedCard: {
    borderRadius: 16,
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
  },
  pinnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 4,
  },
  pinnedText: {
    fontSize: 12,
    fontWeight: '600',
  },
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  feedHeaderContent: {
    flex: 1,
    marginLeft: 12,
  },
  feedAuthor: {
    fontSize: 16,
    fontWeight: '600',
  },
  feedMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 8,
  },
  feedTime: {
    fontSize: 12,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typeText: {
    fontSize: 11,
  },
  feedContent: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  imagesContainer: {
    marginBottom: 12,
  },
  feedImage: {
    width: 280,
    height: 200,
    borderRadius: 12,
    marginRight: 8,
  },
  pollContainer: {
    marginBottom: 12,
  },
  pollOption: {
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  pollOptionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    zIndex: 1,
  },
  pollOptionText: {
    fontSize: 14,
    flex: 1,
  },
  pollPercentage: {
    fontSize: 12,
    fontWeight: '600',
  },
  pollBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 0,
  },
  pollTotal: {
    fontSize: 12,
    marginTop: 4,
  },
  linkedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  linkedCardContent: {
    flex: 1,
    marginLeft: 12,
  },
  linkedCardTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  linkedCardSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  commentsContainer: {
    marginBottom: 12,
  },
  commentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  commentContent: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: 'rgba(0,0,0,0.03)',
    padding: 8,
    borderRadius: 8,
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: '600',
  },
  commentText: {
    fontSize: 13,
    marginTop: 2,
  },
  moreComments: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  feedActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loadMoreIndicator: {
    padding: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  filterContent: {
    padding: 20,
  },
  filterSection: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  filterOptionText: {
    fontSize: 16,
  },
  mutedItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    marginBottom: 8,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
  reportModalContent: {
    margin: 40,
    borderRadius: 16,
    padding: 20,
  },
  reportSubtitle: {
    fontSize: 14,
    marginTop: 8,
    marginBottom: 16,
  },
  reportInput: {
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  reportButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    gap: 12,
  },
  commentModalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  commentInput: {
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginTop: 16,
  },
  commentButton: {
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 100,
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
});
