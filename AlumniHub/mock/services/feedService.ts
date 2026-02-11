import { mockDelay, shouldFail } from '../../utils/mockDelay';
import {
  FeedItem,
  FeedComment,
  FeedSortOption,
  FeedFilter,
  FeedItemType,
  FeedItemVisibility,
  PollOption,
} from '../../types';
import { mockFeedItems, generateMoreFeedItems } from '../data/feed';
import { currentUserProfile } from '../data/profiles';

let feedItems = [...mockFeedItems];
const ITEMS_PER_PAGE = 10;

interface FeedResponse {
  items: FeedItem[];
  hasMore: boolean;
}

const filterFeedItems = (items: FeedItem[], filter: FeedFilter): FeedItem[] => {
  return items.filter(item => {
    if (filter.mutedUserIds.includes(item.authorId)) {
      return false;
    }
    
    const hasMutedKeyword = filter.mutedKeywords.some(keyword =>
      item.content.toLowerCase().includes(keyword.toLowerCase())
    );
    if (hasMutedKeyword) {
      return false;
    }
    
    switch (item.type) {
      case FeedItemType.POST:
      case FeedItemType.POLL:
      case FeedItemType.SURVEY:
        if (!filter.showPosts) return false;
        break;
      case FeedItemType.GROUP_ANNOUNCEMENT:
      case FeedItemType.GROUP_POST:
        if (!filter.showGroupActivity) return false;
        break;
      case FeedItemType.EVENT_INVITATION:
      case FeedItemType.EVENT_UPDATE:
        if (!filter.showEvents) return false;
        break;
      case FeedItemType.JOB_POSTING:
        if (!filter.showJobs) return false;
        break;
      case FeedItemType.ACHIEVEMENT:
      case FeedItemType.MILESTONE:
        if (!filter.showAchievements) return false;
        break;
    }
    
    return true;
  });
};

const sortFeedItems = (items: FeedItem[], sortBy: FeedSortOption): FeedItem[] => {
  const sorted = [...items];
  
  if (sortBy === FeedSortOption.CHRONOLOGICAL) {
    return sorted.sort((a, b) => b.timestamp - a.timestamp);
  }
  
  return sorted.sort((a, b) => {
    const scoreA = calculateAlgorithmicScore(a);
    const scoreB = calculateAlgorithmicScore(b);
    return scoreB - scoreA;
  });
};

const calculateAlgorithmicScore = (item: FeedItem): number => {
  const now = Date.now();
  const ageInHours = (now - item.timestamp) / (1000 * 60 * 60);
  const timeDecay = Math.exp(-ageInHours / 24);
  
  const engagementScore =
    item.likes.length * 2 +
    item.comments.length * 3 +
    item.shares.length * 4;
  
  const isConnection = item.authorId !== currentUserProfile.id;
  const connectionBoost = isConnection ? 1.5 : 1;
  
  const typeWeights: Record<FeedItemType, number> = {
    [FeedItemType.POST]: 1,
    [FeedItemType.GROUP_ANNOUNCEMENT]: 1.3,
    [FeedItemType.GROUP_POST]: 1.1,
    [FeedItemType.EVENT_INVITATION]: 1.2,
    [FeedItemType.EVENT_UPDATE]: 1.1,
    [FeedItemType.JOB_POSTING]: 1.15,
    [FeedItemType.ACHIEVEMENT]: 1.25,
    [FeedItemType.MILESTONE]: 1.2,
    [FeedItemType.POLL]: 1.1,
    [FeedItemType.SURVEY]: 0.9,
  };
  
  const pinnedBoost = item.isPinned ? 2 : 1;
  
  return (engagementScore * timeDecay * connectionBoost * typeWeights[item.type] * pinnedBoost);
};

export const getFeed = async (
  page: number,
  sortBy: FeedSortOption,
  filter: FeedFilter
): Promise<FeedResponse> => {
  await mockDelay(500, 1500);
  if (shouldFail()) throw new Error('Failed to fetch feed');
  
  let items = [...feedItems];
  
  if (page > 1) {
    const additionalItems = generateMoreFeedItems(page, ITEMS_PER_PAGE);
    items = [...items, ...additionalItems];
  }
  
  items = filterFeedItems(items, filter);
  items = sortFeedItems(items, sortBy);
  
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedItems = items.slice(startIndex, endIndex);
  
  return {
    items: paginatedItems,
    hasMore: endIndex < items.length || page < 5,
  };
};

export const createPost = async (data: {
  content: string;
  images?: string[];
  media?: string;
  mediaType?: 'video' | 'audio';
  visibility: string;
  pollOptions?: string[];
}): Promise<FeedItem> => {
  await mockDelay(500, 1500);
  if (shouldFail()) throw new Error('Failed to create post');
  
  const newPost: FeedItem = {
    id: `feed_${Date.now()}`,
    type: data.pollOptions ? FeedItemType.POLL : FeedItemType.POST,
    authorId: currentUserProfile.id,
    content: data.content,
    images: data.images,
    media: data.media,
    mediaType: data.mediaType,
    timestamp: Date.now(),
    visibility: data.visibility as FeedItemVisibility,
    likes: [],
    comments: [],
    shares: [],
    isPinned: false,
  };
  
  if (data.pollOptions) {
    newPost.pollOptions = data.pollOptions.map((text, index) => ({
      id: `poll_${Date.now()}_${index}`,
      text,
      votes: [],
    }));
    newPost.pollEndsAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
  }
  
  feedItems = [newPost, ...feedItems];
  return newPost;
};

export const likeItem = async (itemId: string): Promise<{ id: string; likes: string[] }> => {
  await mockDelay(200, 500);
  if (shouldFail()) throw new Error('Failed to like item');
  
  const itemIndex = feedItems.findIndex(item => item.id === itemId);
  if (itemIndex === -1) throw new Error('Item not found');
  
  const item = feedItems[itemIndex];
  if (!item.likes.includes(currentUserProfile.id)) {
    item.likes.push(currentUserProfile.id);
  }
  
  return { id: itemId, likes: item.likes };
};

export const unlikeItem = async (itemId: string): Promise<{ id: string; likes: string[] }> => {
  await mockDelay(200, 500);
  if (shouldFail()) throw new Error('Failed to unlike item');
  
  const itemIndex = feedItems.findIndex(item => item.id === itemId);
  if (itemIndex === -1) throw new Error('Item not found');
  
  const item = feedItems[itemIndex];
  item.likes = item.likes.filter(id => id !== currentUserProfile.id);
  
  return { id: itemId, likes: item.likes };
};

export const addComment = async (
  itemId: string,
  content: string
): Promise<FeedComment> => {
  await mockDelay(500, 1000);
  if (shouldFail()) throw new Error('Failed to add comment');
  
  const itemIndex = feedItems.findIndex(item => item.id === itemId);
  if (itemIndex === -1) throw new Error('Item not found');
  
  const newComment: FeedComment = {
    id: `comment_${Date.now()}`,
    feedItemId: itemId,
    authorId: currentUserProfile.id,
    content,
    timestamp: Date.now(),
    likes: [],
  };
  
  feedItems[itemIndex].comments.push(newComment);
  return newComment;
};

export const shareItem = async (itemId: string): Promise<{ id: string; shares: string[] }> => {
  await mockDelay(200, 500);
  if (shouldFail()) throw new Error('Failed to share item');
  
  const itemIndex = feedItems.findIndex(item => item.id === itemId);
  if (itemIndex === -1) throw new Error('Item not found');
  
  const item = feedItems[itemIndex];
  if (!item.shares.includes(currentUserProfile.id)) {
    item.shares.push(currentUserProfile.id);
  }
  
  return { id: itemId, shares: item.shares };
};

export const voteOnPoll = async (
  itemId: string,
  optionId: string
): Promise<{ itemId: string; options: PollOption[] }> => {
  await mockDelay(200, 500);
  if (shouldFail()) throw new Error('Failed to vote on poll');
  
  const itemIndex = feedItems.findIndex(item => item.id === itemId);
  if (itemIndex === -1) throw new Error('Poll not found');
  
  const item = feedItems[itemIndex];
  if (!item.pollOptions) throw new Error('Not a poll');
  
  item.pollOptions.forEach(option => {
    option.votes = option.votes.filter(id => id !== currentUserProfile.id);
  });
  
  const option = item.pollOptions.find(opt => opt.id === optionId);
  if (!option) throw new Error('Option not found');
  
  option.votes.push(currentUserProfile.id);
  
  return { itemId, options: item.pollOptions };
};

let mutedUserIds: string[] = [];
let mutedKeywords: string[] = [];

export const muteUser = async (userId: string): Promise<void> => {
  await mockDelay(200, 500);
  if (shouldFail()) throw new Error('Failed to mute user');
  
  if (!mutedUserIds.includes(userId)) {
    mutedUserIds.push(userId);
  }
};

export const unmuteUser = async (userId: string): Promise<void> => {
  await mockDelay(200, 500);
  if (shouldFail()) throw new Error('Failed to unmute user');
  
  mutedUserIds = mutedUserIds.filter(id => id !== userId);
};

export const addMutedKeyword = async (keyword: string): Promise<void> => {
  await mockDelay(200, 500);
  if (shouldFail()) throw new Error('Failed to add muted keyword');
  
  if (!mutedKeywords.includes(keyword.toLowerCase())) {
    mutedKeywords.push(keyword.toLowerCase());
  }
};

export const removeMutedKeyword = async (keyword: string): Promise<void> => {
  await mockDelay(200, 500);
  if (shouldFail()) throw new Error('Failed to remove muted keyword');
  
  mutedKeywords = mutedKeywords.filter(k => k !== keyword.toLowerCase());
};

export const reportContent = async (
  itemId: string,
  reason: string,
  details?: string
): Promise<void> => {
  await mockDelay(500, 1000);
  if (shouldFail()) throw new Error('Failed to report content');
  
  console.log('Content reported:', { itemId, reason, details });
};

export const getMutedUsers = async (): Promise<string[]> => {
  await mockDelay(200, 500);
  return [...mutedUserIds];
};

export const getMutedKeywords = async (): Promise<string[]> => {
  await mockDelay(200, 500);
  return [...mutedKeywords];
};
