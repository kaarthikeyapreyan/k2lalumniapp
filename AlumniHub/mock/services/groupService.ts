import { mockDelay, shouldFail } from '../../utils/mockDelay';
import { Group, GroupPost, GroupComment, GroupPrivacy, GroupType, GroupMemberRole } from '../../types';
import { mockGroups, mockGroupPosts } from '../data/groups';
import { currentUserProfile } from '../data/profiles';

let groups = [...mockGroups];
let posts = [...mockGroupPosts];

export const getGroups = async (): Promise<Group[]> => {
  await mockDelay();
  if (shouldFail()) throw new Error('Failed to fetch groups');
  return [...groups];
};

export const getGroupById = async (groupId: string): Promise<Group> => {
  await mockDelay();
  if (shouldFail()) throw new Error('Failed to fetch group details');
  
  const group = groups.find(g => g.id === groupId);
  if (!group) throw new Error('Group not found');
  return group;
};

export const getMyGroups = async (): Promise<Group[]> => {
  await mockDelay();
  if (shouldFail()) throw new Error('Failed to fetch your groups');
  return groups.filter(g => g.isJoined);
};

export const createGroup = async (data: {
  name: string;
  description: string;
  type: GroupType;
  privacy: GroupPrivacy;
  coverImage?: string;
}): Promise<Group> => {
  await mockDelay(500, 1500);
  if (shouldFail()) throw new Error('Failed to create group');
  
  const newGroup: Group = {
    id: `group_${Date.now()}`,
    name: data.name,
    description: data.description,
    type: data.type,
    privacy: data.privacy,
    coverImage: data.coverImage,
    createdBy: currentUserProfile.id,
    createdAt: Date.now(),
    members: [
      { userId: currentUserProfile.id, role: GroupMemberRole.ADMIN, joinedAt: Date.now() },
    ],
    memberCount: 1,
    isJoined: true,
  };
  
  groups = [...groups, newGroup];
  return newGroup;
};

export const updateGroup = async (
  groupId: string,
  data: Partial<Group>
): Promise<Group> => {
  await mockDelay();
  if (shouldFail()) throw new Error('Failed to update group');
  
  const groupIndex = groups.findIndex(g => g.id === groupId);
  if (groupIndex === -1) throw new Error('Group not found');
  
  const updatedGroup = { ...groups[groupIndex], ...data };
  groups = [
    ...groups.slice(0, groupIndex),
    updatedGroup,
    ...groups.slice(groupIndex + 1),
  ];
  return updatedGroup;
};

export const joinGroup = async (groupId: string): Promise<Group> => {
  await mockDelay(500, 1000);
  if (shouldFail()) throw new Error('Failed to join group');
  
  const groupIndex = groups.findIndex(g => g.id === groupId);
  if (groupIndex === -1) throw new Error('Group not found');
  
  const group = groups[groupIndex];
  
  if (group.privacy === GroupPrivacy.PRIVATE) {
    const updatedGroup = { 
      ...group, 
      pendingJoinRequest: true 
    };
    groups = [
      ...groups.slice(0, groupIndex),
      updatedGroup,
      ...groups.slice(groupIndex + 1),
    ];
    return updatedGroup;
  }
  
  const updatedGroup = {
    ...group,
    isJoined: true,
    members: [
      ...group.members,
      { userId: currentUserProfile.id, role: GroupMemberRole.MEMBER, joinedAt: Date.now() },
    ],
    memberCount: group.memberCount + 1,
  };
  
  groups = [
    ...groups.slice(0, groupIndex),
    updatedGroup,
    ...groups.slice(groupIndex + 1),
  ];
  return updatedGroup;
};

export const leaveGroup = async (groupId: string): Promise<void> => {
  await mockDelay(500, 1000);
  if (shouldFail()) throw new Error('Failed to leave group');
  
  const groupIndex = groups.findIndex(g => g.id === groupId);
  if (groupIndex === -1) throw new Error('Group not found');
  
  const group = groups[groupIndex];
  const updatedGroup = {
    ...group,
    isJoined: false,
    members: group.members.filter(m => m.userId !== currentUserProfile.id),
    memberCount: Math.max(0, group.memberCount - 1),
  };
  
  groups = [
    ...groups.slice(0, groupIndex),
    updatedGroup,
    ...groups.slice(groupIndex + 1),
  ];
};

export const approveMember = async (
  groupId: string,
  userId: string
): Promise<Group> => {
  await mockDelay();
  if (shouldFail()) throw new Error('Failed to approve member');
  
  const groupIndex = groups.findIndex(g => g.id === groupId);
  if (groupIndex === -1) throw new Error('Group not found');
  
  const group = groups[groupIndex];
  const updatedGroup = {
    ...group,
    members: [
      ...group.members,
      { userId, role: GroupMemberRole.MEMBER, joinedAt: Date.now() },
    ],
    memberCount: group.memberCount + 1,
  };
  
  groups = [
    ...groups.slice(0, groupIndex),
    updatedGroup,
    ...groups.slice(groupIndex + 1),
  ];
  return updatedGroup;
};

export const removeMember = async (
  groupId: string,
  userId: string
): Promise<Group> => {
  await mockDelay();
  if (shouldFail()) throw new Error('Failed to remove member');
  
  const groupIndex = groups.findIndex(g => g.id === groupId);
  if (groupIndex === -1) throw new Error('Group not found');
  
  const group = groups[groupIndex];
  const updatedGroup = {
    ...group,
    members: group.members.filter(m => m.userId !== userId),
    memberCount: Math.max(0, group.memberCount - 1),
  };
  
  groups = [
    ...groups.slice(0, groupIndex),
    updatedGroup,
    ...groups.slice(groupIndex + 1),
  ];
  return updatedGroup;
};

export const getGroupPosts = async (groupId: string): Promise<GroupPost[]> => {
  await mockDelay();
  if (shouldFail()) throw new Error('Failed to fetch posts');
  return posts.filter(p => p.groupId === groupId).sort((a, b) => b.timestamp - a.timestamp);
};

export const createPost = async (
  groupId: string,
  data: {
    content: string;
    images?: string[];
    media?: string;
    isAnnouncement?: boolean;
  }
): Promise<GroupPost> => {
  await mockDelay(500, 1500);
  if (shouldFail()) throw new Error('Failed to create post');
  
  const newPost: GroupPost = {
    id: `post_${Date.now()}`,
    groupId,
    authorId: currentUserProfile.id,
    content: data.content,
    images: data.images,
    media: data.media,
    timestamp: Date.now(),
    likes: [],
    comments: [],
    isPinned: false,
    isAnnouncement: data.isAnnouncement || false,
  };
  
  posts = [newPost, ...posts];
  return newPost;
};

export const deletePost = async (postId: string): Promise<void> => {
  await mockDelay();
  if (shouldFail()) throw new Error('Failed to delete post');
  posts = posts.filter(p => p.id !== postId);
};

export const likePost = async (postId: string): Promise<GroupPost> => {
  await mockDelay();
  if (shouldFail()) throw new Error('Failed to like post');
  
  const postIndex = posts.findIndex(p => p.id === postId);
  if (postIndex === -1) throw new Error('Post not found');
  
  const post = posts[postIndex];
  const isLiked = post.likes.includes(currentUserProfile.id);
  
  const updatedPost = {
    ...post,
    likes: isLiked
      ? post.likes.filter(id => id !== currentUserProfile.id)
      : [...post.likes, currentUserProfile.id],
  };
  
  posts = [
    ...posts.slice(0, postIndex),
    updatedPost,
    ...posts.slice(postIndex + 1),
  ];
  return updatedPost;
};

export const addComment = async (
  postId: string,
  content: string
): Promise<GroupComment> => {
  await mockDelay(500, 1000);
  if (shouldFail()) throw new Error('Failed to add comment');
  
  const postIndex = posts.findIndex(p => p.id === postId);
  if (postIndex === -1) throw new Error('Post not found');
  
  const newComment: GroupComment = {
    id: `comment_${Date.now()}`,
    postId,
    authorId: currentUserProfile.id,
    content,
    timestamp: Date.now(),
  };
  
  const updatedPost = {
    ...posts[postIndex],
    comments: [...posts[postIndex].comments, newComment],
  };
  
  posts = [
    ...posts.slice(0, postIndex),
    updatedPost,
    ...posts.slice(postIndex + 1),
  ];
  return newComment;
};

export const pinPost = async (
  postId: string,
  isPinned: boolean
): Promise<GroupPost> => {
  await mockDelay();
  if (shouldFail()) throw new Error('Failed to update post');
  
  const postIndex = posts.findIndex(p => p.id === postId);
  if (postIndex === -1) throw new Error('Post not found');
  
  const updatedPost = { ...posts[postIndex], isPinned };
  posts = [
    ...posts.slice(0, postIndex),
    updatedPost,
    ...posts.slice(postIndex + 1),
  ];
  return updatedPost;
};
