import { mockDelay, shouldFail } from '../../utils/mockDelay';
import { FeedItem, FeedComment, FeedItemType, FeedFilter, FeedSort } from '../../types';
import { mockFeedItems, mockFeedComments, currentUserId, enrichFeedItems } from '../data/feed';
import { mockProfiles } from '../data/profiles';
import websocketService from './websocketService';

let feedItems = [...mockFeedItems];
let comments = [...mockFeedComments];

const ITEMS_PER_PAGE = 10;

export interface FeedFilters {
  filter?: FeedFilter;
  sort?: FeedSort;
}

// Algorithmic scoring for "Top" and "Trending" sorts
const calculatePostScore = (item: FeedItem): number => {
  const now = Date.now();
  const ageInHours = (now - item.timestamp) / (60 * 60 * 1000);
  
  // Base engagement score
  const engagementScore = 
    (item.likes.length * 2) + 
    (item.comments.length * 3) + 
    (item.shares.length * 4) + 
    (item.views * 0.01);
  
  // Time decay factor (newer posts get higher scores)
  const timeDecay = Math.max(0.1, 1 / (1 + Math.log1p(ageInHours)));
  
  // Pinned posts get a boost
  const pinnedBoost = item.isPinned ? 100 : 0;
  
  return (engagementScore * timeDecay) + pinnedBoost;
};

export const getFeed = async (
  page: number = 1,
  filters: FeedFilters = {}
): Promise<{ items: FeedItem[]; hasMore: boolean }> => {
  await mockDelay();
  if (shouldFail()) throw new Error('Failed to fetch feed');

  let filteredItems = [...feedItems];

  // Apply filter
  if (filters.filter && filters.filter !== FeedFilter.ALL) {
    switch (filters.filter) {
      case FeedFilter.POSTS:
        filteredItems = filteredItems.filter(item => 
          item.type === FeedItemType.POST || item.type === FeedItemType.MILESTONE
        );
        break;
      case FeedFilter.EVENTS:
        filteredItems = filteredItems.filter(item => item.type === FeedItemType.EVENT);
        break;
      case FeedFilter.JOBS:
        filteredItems = filteredItems.filter(item => item.type === FeedItemType.JOB);
        break;
      case FeedFilter.MEDIA:
        filteredItems = filteredItems.filter(item => 
          item.type === FeedItemType.MEDIA || item.images?.length
        );
        break;
    }
  }

  // Apply sort
  const sort = filters.sort || FeedSort.LATEST;
  switch (sort) {
    case FeedSort.LATEST:
      filteredItems.sort((a, b) => b.timestamp - a.timestamp);
      break;
    case FeedSort.TOP:
      filteredItems = filteredItems.map(item => ({
        ...item,
        score: calculatePostScore(item),
      })).sort((a, b) => (b.score || 0) - (a.score || 0));
      break;
    case FeedSort.TRENDING:
      // Trending considers recent activity more heavily
      filteredItems = filteredItems.map(item => {
        const hoursSincePost = (Date.now() - item.timestamp) / (60 * 60 * 1000);
        const recentEngagement = 
          item.likes.length + 
          item.comments.length * 2 + 
          item.shares.length * 3;
        // Higher score for posts with engagement in last 24 hours
        const trendingScore = hoursSincePost < 24 ? recentEngagement * 2 : recentEngagement;
        return { ...item, score: trendingScore };
      }).sort((a, b) => (b.score || 0) - (a.score || 0));
      break;
  }

  // Paginate
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);
  const hasMore = endIndex < filteredItems.length;

  return {
    items: enrichFeedItems(paginatedItems),
    hasMore,
  };
};

export const getFeedItemById = async (itemId: string): Promise<FeedItem> => {
  await mockDelay();
  if (shouldFail()) throw new Error('Failed to fetch post');

  const item = feedItems.find(i => i.id === itemId);
  if (!item) throw new Error('Post not found');

  const enriched = enrichFeedItems([item])[0];
  return enriched;
};

export const createPost = async (data: {
  content: string;
  images?: string[];
  mediaUrl?: string;
  type?: FeedItemType;
}): Promise<FeedItem> => {
  await mockDelay(500, 1500);
  if (shouldFail()) throw new Error('Failed to create post');

  const newPost: FeedItem = {
    id: `feed_${Date.now()}`,
    type: data.type || FeedItemType.POST,
    authorId: currentUserId,
    content: data.content,
    images: data.images,
    mediaUrl: data.mediaUrl,
    timestamp: Date.now(),
    likes: [],
    comments: [],
    shares: [],
    views: 0,
    isPinned: false,
    isEdited: false,
  };

  feedItems = [newPost, ...feedItems];
  
  // Emit WebSocket event
  websocketService.triggerNewPost(newPost);

  const enriched = enrichFeedItems([newPost])[0];
  return enriched;
};

export const updatePost = async (
  postId: string,
  data: { content?: string; images?: string[] }
): Promise<FeedItem> => {
  await mockDelay(500, 1000);
  if (shouldFail()) throw new Error('Failed to update post');

  const postIndex = feedItems.findIndex(p => p.id === postId);
  if (postIndex === -1) throw new Error('Post not found');

  const updatedPost: FeedItem = {
    ...feedItems[postIndex],
    ...data,
    isEdited: true,
    editedAt: Date.now(),
  };

  feedItems = [
    ...feedItems.slice(0, postIndex),
    updatedPost,
    ...feedItems.slice(postIndex + 1),
  ];

  return enrichFeedItems([updatedPost])[0];
};

export const deletePost = async (postId: string): Promise<void> => {
  await mockDelay(500, 1000);
  if (shouldFail()) throw new Error('Failed to delete post');

  feedItems = feedItems.filter(p => p.id !== postId);
};

export const likePost = async (postId: string): Promise<FeedItem> => {
  await mockDelay();
  if (shouldFail()) throw new Error('Failed to like post');

  const postIndex = feedItems.findIndex(p => p.id === postId);
  if (postIndex === -1) throw new Error('Post not found');

  const post = feedItems[postIndex];
  const isLiked = post.likes.includes(currentUserId);

  const updatedPost: FeedItem = {
    ...post,
    likes: isLiked
      ? post.likes.filter(id => id !== currentUserId)
      : [...post.likes, currentUserId],
  };

  feedItems = [
    ...feedItems.slice(0, postIndex),
    updatedPost,
    ...feedItems.slice(postIndex + 1),
  ];

  // Emit WebSocket event
  if (!isLiked) {
    websocketService.triggerPostLike(postId, currentUserId);
  }

  return enrichFeedItems([updatedPost])[0];
};

export const addComment = async (
  postId: string,
  content: string
): Promise<FeedComment> => {
  await mockDelay(500, 1000);
  if (shouldFail()) throw new Error('Failed to add comment');

  const postIndex = feedItems.findIndex(p => p.id === postId);
  if (postIndex === -1) throw new Error('Post not found');

  const newComment: FeedComment = {
    id: `comment_${Date.now()}`,
    postId,
    authorId: currentUserId,
    content,
    timestamp: Date.now(),
    likes: [],
  };

  comments = [...comments, newComment];

  const updatedPost: FeedItem = {
    ...feedItems[postIndex],
    comments: [...feedItems[postIndex].comments, newComment],
  };

  feedItems = [
    ...feedItems.slice(0, postIndex),
    updatedPost,
    ...feedItems.slice(postIndex + 1),
  ];

  // Emit WebSocket event
  websocketService.triggerPostComment(newComment);

  const enrichedComment = {
    ...newComment,
    author: mockProfiles.find(p => p.id === currentUserId),
  };

  return enrichedComment;
};

export const likeComment = async (commentId: string): Promise<FeedComment> => {
  await mockDelay();
  if (shouldFail()) throw new Error('Failed to like comment');

  const commentIndex = comments.findIndex(c => c.id === commentId);
  if (commentIndex === -1) throw new Error('Comment not found');

  const comment = comments[commentIndex];
  const isLiked = comment.likes.includes(currentUserId);

  const updatedComment: FeedComment = {
    ...comment,
    likes: isLiked
      ? comment.likes.filter(id => id !== currentUserId)
      : [...comment.likes, currentUserId],
  };

  comments = [
    ...comments.slice(0, commentIndex),
    updatedComment,
    ...comments.slice(commentIndex + 1),
  ];

  // Update comment in feed items as well
  feedItems = feedItems.map(item => ({
    ...item,
    comments: item.comments.map(c => 
      c.id === commentId ? updatedComment : c
    ),
  }));

  return {
    ...updatedComment,
    author: mockProfiles.find(p => p.id === updatedComment.authorId),
  };
};

export const sharePost = async (postId: string, content?: string): Promise<FeedItem> => {
  await mockDelay(500, 1000);
  if (shouldFail()) throw new Error('Failed to share post');

  const originalPost = feedItems.find(p => p.id === postId);
  if (!originalPost) throw new Error('Post not found');

  // Update share count on original post
  const originalIndex = feedItems.findIndex(p => p.id === postId);
  const updatedOriginal: FeedItem = {
    ...originalPost,
    shares: [...originalPost.shares, currentUserId],
  };

  feedItems = [
    ...feedItems.slice(0, originalIndex),
    updatedOriginal,
    ...feedItems.slice(originalIndex + 1),
  ];

  // Create shared post
  const sharedPost: FeedItem = {
    id: `feed_${Date.now()}`,
    type: FeedItemType.SHARED_POST,
    authorId: currentUserId,
    content: content || '',
    sharedPostId: postId,
    timestamp: Date.now(),
    likes: [],
    comments: [],
    shares: [],
    views: 0,
    isPinned: false,
    isEdited: false,
  };

  feedItems = [sharedPost, ...feedItems];

  // Emit WebSocket event
  websocketService.triggerNewPost(sharedPost);

  return enrichFeedItems([sharedPost])[0];
};

export const incrementViews = async (postId: string): Promise<void> => {
  const postIndex = feedItems.findIndex(p => p.id === postId);
  if (postIndex === -1) return;

  const updatedPost: FeedItem = {
    ...feedItems[postIndex],
    views: feedItems[postIndex].views + 1,
  };

  feedItems = [
    ...feedItems.slice(0, postIndex),
    updatedPost,
    ...feedItems.slice(postIndex + 1),
  ];
};
