import { FeedItem, FeedResponse, FeedSort, FeedFilter, FeedItemType, FeedItemVisibility } from '../../types';
import { mockFeedItems } from '../data/feed';
import { currentUserProfile } from '../data/profiles';
import { websocketService } from './websocketService';

const ITEMS_PER_PAGE = 10;

const mockDelay = (min = 200, max = 800) =>
  new Promise(resolve => setTimeout(resolve, Math.random() * (max - min) + min));

const shouldFail = () => Math.random() < 0.05;

// Helper to filter items based on FeedFilter enum
const filterFeedItems = (items: FeedItem[], filter: FeedFilter): FeedItem[] => {
  if (filter === FeedFilter.ALL) return items;

  return items.filter(item => {
    switch (filter) {
      case FeedFilter.POSTS:
        return item.type === FeedItemType.POST || item.type === FeedItemType.GROUP_POST;
      case FeedFilter.EVENTS:
        return item.type === FeedItemType.EVENT_INVITATION || item.type === FeedItemType.EVENT_UPDATE;
      case FeedFilter.JOBS:
        return item.type === FeedItemType.JOB_POSTING;
      case FeedFilter.MEDIA:
        return !!item.images?.length;
      default:
        return true;
    }
  });
};

// Helper to sort items
const sortFeedItems = (items: FeedItem[], sort: FeedSort): FeedItem[] => {
  if (sort === FeedSort.TOP || sort === FeedSort.TRENDING) {
    return [...items].sort((a, b) => (b.score || 0) - (a.score || 0));
  }
  return [...items].sort((a, b) => b.timestamp - a.timestamp);
};

// Internal state to track added items across mock session
let sessionItems = [...mockFeedItems];

export const getFeed = async (
  page: number,
  sort: FeedSort,
  filter: FeedFilter
): Promise<FeedResponse> => {
  await mockDelay(500, 1500);
  if (shouldFail()) throw new Error('Failed to fetch feed');

  let items = filterFeedItems(sessionItems, filter);
  items = sortFeedItems(items, sort);

  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedItems = items.slice(startIndex, endIndex);

  return {
    items: paginatedItems,
    hasMore: endIndex < items.length,
  };
};

export const createPost = async (
  content: string,
  images?: string[],
  visibility: FeedItemVisibility = FeedItemVisibility.PUBLIC,
  groupId?: string
): Promise<FeedItem> => {
  await mockDelay(800, 2000);
  if (shouldFail()) throw new Error('Failed to create post');

  const newPost: FeedItem = {
    id: `post-${Date.now()}`,
    type: groupId ? FeedItemType.GROUP_POST : FeedItemType.POST,
    authorId: currentUserProfile.id,
    author: currentUserProfile,
    content,
    images,
    timestamp: Date.now(),
    visibility,
    groupId,
    likes: [],
    comments: [],
    shares: [],
    isPinned: false,
    score: 1.0,
    views: 0,
  };

  sessionItems.unshift(newPost);

  // Notify others via websocket
  websocketService.triggerNewPost(newPost);

  return newPost;
};

export const likeItem = async (itemId: string): Promise<{ likes: string[] }> => {
  await mockDelay(200, 500);
  const item = sessionItems.find(i => i.id === itemId);
  if (!item) throw new Error('Item not found');

  const index = item.likes.indexOf(currentUserProfile.id);
  if (index === -1) {
    item.likes.push(currentUserProfile.id);
  } else {
    item.likes.splice(index, 1);
  }

  websocketService.triggerPostLike(itemId, currentUserProfile.id);
  return { likes: item.likes };
};

export const addComment = async (
  itemId: string,
  content: string
): Promise<FeedItem> => {
  await mockDelay(500, 1000);
  const item = sessionItems.find(i => i.id === itemId);
  if (!item) throw new Error('Item not found');

  const newComment = {
    id: `c-${Date.now()}`,
    postId: itemId,
    authorId: currentUserProfile.id,
    author: currentUserProfile,
    content,
    timestamp: Date.now(),
    likes: [],
  };

  item.comments.push(newComment);

  websocketService.triggerPostComment(newComment);
  return { ...item };
};

export const sharePost = async (
  itemId: string,
  content?: string
): Promise<FeedItem> => {
  await mockDelay(500, 1000);
  const originalItem = sessionItems.find(i => i.id === itemId);
  if (!originalItem) throw new Error('Item not found');

  const shareItem: FeedItem = {
    id: `share-${Date.now()}`,
    type: FeedItemType.POST,
    authorId: currentUserProfile.id,
    author: currentUserProfile,
    content: content || `Shared a post from ${originalItem.author?.name}`,
    timestamp: Date.now(),
    visibility: FeedItemVisibility.PUBLIC,
    likes: [],
    comments: [],
    shares: [],
    isPinned: false,
    score: 0.8,
    sharedPostId: itemId,
    sharedPost: originalItem,
    views: 0,
  };

  sessionItems.unshift(shareItem);
  originalItem.shares.push(currentUserProfile.id);

  return shareItem;
};
