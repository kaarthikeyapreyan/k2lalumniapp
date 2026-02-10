import { Group, GroupType, GroupPrivacy, GroupMemberRole, GroupPost, GroupComment } from '../../types';
import { mockProfiles } from './profiles';

export const mockGroups: Group[] = [
  {
    id: 'group_1',
    name: 'Class of 2015',
    description: 'Official batch group for the graduating class of 2015. Connect with your batchmates, share memories, and stay updated on reunion plans.',
    coverImage: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800',
    type: GroupType.BATCH,
    privacy: GroupPrivacy.PUBLIC,
    createdBy: 'alumni_1',
    createdAt: Date.now() - 86400000 * 1000,
    members: [
      { userId: 'alumni_1', role: GroupMemberRole.ADMIN, joinedAt: Date.now() - 86400000 * 1000 },
      { userId: 'alumni_2', role: GroupMemberRole.MEMBER, joinedAt: Date.now() - 86400000 * 900 },
      { userId: 'alumni_3', role: GroupMemberRole.MEMBER, joinedAt: Date.now() - 86400000 * 800 },
      { userId: 'current_user', role: GroupMemberRole.MEMBER, joinedAt: Date.now() - 86400000 * 700 },
      { userId: 'alumni_5', role: GroupMemberRole.MODERATOR, joinedAt: Date.now() - 86400000 * 600 },
    ],
    memberCount: 245,
  },
  {
    id: 'group_2',
    name: 'Tech Entrepreneurs Network',
    description: 'A community for alumni working in technology and entrepreneurship. Share insights, find co-founders, and grow your network.',
    coverImage: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800',
    type: GroupType.INTEREST,
    privacy: GroupPrivacy.PUBLIC,
    createdBy: 'alumni_10',
    createdAt: Date.now() - 86400000 * 500,
    members: [
      { userId: 'alumni_10', role: GroupMemberRole.ADMIN, joinedAt: Date.now() - 86400000 * 500 },
      { userId: 'alumni_15', role: GroupMemberRole.MEMBER, joinedAt: Date.now() - 86400000 * 400 },
      { userId: 'current_user', role: GroupMemberRole.MEMBER, joinedAt: Date.now() - 86400000 * 300 },
      { userId: 'alumni_20', role: GroupMemberRole.MODERATOR, joinedAt: Date.now() - 86400000 * 200 },
    ],
    memberCount: 128,
  },
  {
    id: 'group_3',
    name: 'Chennai Alumni Chapter',
    description: 'Connect with fellow alumni based in Chennai. Organize meetups, share local opportunities, and build your local network.',
    coverImage: 'https://images.unsplash.com/photo-1582510003544-4d00b7e74208?w=800',
    type: GroupType.LOCATION,
    privacy: GroupPrivacy.PUBLIC,
    createdBy: 'alumni_25',
    createdAt: Date.now() - 86400000 * 400,
    members: [
      { userId: 'alumni_25', role: GroupMemberRole.ADMIN, joinedAt: Date.now() - 86400000 * 400 },
      { userId: 'alumni_30', role: GroupMemberRole.MEMBER, joinedAt: Date.now() - 86400000 * 350 },
      { userId: 'alumni_35', role: GroupMemberRole.MEMBER, joinedAt: Date.now() - 86400000 * 300 },
    ],
    memberCount: 89,
  },
  {
    id: 'group_4',
    name: 'Finance & Investment Club',
    description: 'For alumni in banking, investment, fintech, and financial services. Share market insights and career opportunities.',
    coverImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    type: GroupType.INTEREST,
    privacy: GroupPrivacy.PRIVATE,
    createdBy: 'alumni_40',
    createdAt: Date.now() - 86400000 * 300,
    members: [
      { userId: 'alumni_40', role: GroupMemberRole.ADMIN, joinedAt: Date.now() - 86400000 * 300 },
      { userId: 'alumni_45', role: GroupMemberRole.MODERATOR, joinedAt: Date.now() - 86400000 * 250 },
      { userId: 'alumni_50', role: GroupMemberRole.MEMBER, joinedAt: Date.now() - 86400000 * 200 },
    ],
    memberCount: 67,
  },
  {
    id: 'group_5',
    name: 'Class of 2018',
    description: 'Official batch group for the Class of 2018. Share updates, plan reunions, and stay connected with your batchmates.',
    coverImage: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?w=800',
    type: GroupType.BATCH,
    privacy: GroupPrivacy.PUBLIC,
    createdBy: 'alumni_55',
    createdAt: Date.now() - 86400000 * 200,
    members: [
      { userId: 'alumni_55', role: GroupMemberRole.ADMIN, joinedAt: Date.now() - 86400000 * 200 },
      { userId: 'alumni_58', role: GroupMemberRole.MEMBER, joinedAt: Date.now() - 86400000 * 150 },
    ],
    memberCount: 312,
  },
  {
    id: 'group_6',
    name: 'Bangalore Tech Hub',
    description: 'Alumni working in Bangalore\'s tech industry. Connect, collaborate, and grow together in India\'s Silicon Valley.',
    coverImage: 'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?w=800',
    type: GroupType.LOCATION,
    privacy: GroupPrivacy.PUBLIC,
    createdBy: 'alumni_12',
    createdAt: Date.now() - 86400000 * 150,
    members: [
      { userId: 'alumni_12', role: GroupMemberRole.ADMIN, joinedAt: Date.now() - 86400000 * 150 },
      { userId: 'alumni_18', role: GroupMemberRole.MEMBER, joinedAt: Date.now() - 86400000 * 100 },
      { userId: 'current_user', role: GroupMemberRole.MEMBER, joinedAt: Date.now() - 86400000 * 50 },
    ],
    memberCount: 156,
  },
  {
    id: 'group_7',
    name: 'Data Science & AI Community',
    description: 'For alumni passionate about data science, machine learning, and artificial intelligence. Share projects, papers, and opportunities.',
    coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    type: GroupType.INTEREST,
    privacy: GroupPrivacy.PRIVATE,
    createdBy: 'alumni_22',
    createdAt: Date.now() - 86400000 * 100,
    members: [
      { userId: 'alumni_22', role: GroupMemberRole.ADMIN, joinedAt: Date.now() - 86400000 * 100 },
      { userId: 'alumni_28', role: GroupMemberRole.MODERATOR, joinedAt: Date.now() - 86400000 * 80 },
    ],
    memberCount: 94,
  },
];

export const mockGroupPosts: GroupPost[] = [
  {
    id: 'post_1',
    groupId: 'group_1',
    authorId: 'alumni_1',
    content: '🎉 Exciting news! Our 10-year reunion is officially scheduled for June 15th, 2025. Mark your calendars and start planning your trip! More details coming soon.',
    timestamp: Date.now() - 86400000 * 2,
    likes: ['alumni_2', 'alumni_3', 'current_user', 'alumni_5'],
    comments: [
      {
        id: 'comment_1',
        postId: 'post_1',
        authorId: 'alumni_2',
        content: 'Can\'t wait to see everyone! 🎓',
        timestamp: Date.now() - 86400000 * 1.9,
      },
      {
        id: 'comment_2',
        postId: 'post_1',
        authorId: 'alumni_3',
        content: 'This is going to be amazing! Count me in.',
        timestamp: Date.now() - 86400000 * 1.8,
      },
    ],
    isPinned: true,
    isAnnouncement: true,
  },
  {
    id: 'post_2',
    groupId: 'group_1',
    authorId: 'alumni_5',
    content: 'Looking for referrals to Google. I have 5 years of experience in product management. Happy to share my resume and chat more!',
    timestamp: Date.now() - 86400000 * 1,
    likes: ['alumni_1', 'alumni_2'],
    comments: [],
    isPinned: false,
    isAnnouncement: false,
  },
  {
    id: 'post_3',
    groupId: 'group_2',
    authorId: 'alumni_10',
    content: 'Just launched my startup after 3 years of development! It\'s a platform connecting freelancers with tech companies. Would love your feedback and support. Check it out: https://example.com',
    images: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800'],
    timestamp: Date.now() - 86400000 * 0.5,
    likes: ['alumni_15', 'alumni_20', 'current_user', 'alumni_30'],
    comments: [
      {
        id: 'comment_3',
        postId: 'post_3',
        authorId: 'current_user',
        content: 'Congratulations! This looks amazing. Best of luck with the launch! 🚀',
        timestamp: Date.now() - 86400000 * 0.4,
      },
    ],
    isPinned: false,
    isAnnouncement: false,
  },
  {
    id: 'post_4',
    groupId: 'group_3',
    authorId: 'alumni_25',
    content: '📍 Monthly Chennai meetup this Saturday at 6 PM at Brew Room, Nungambakkam. All alumni welcome! RSVP in the comments.',
    timestamp: Date.now() - 86400000 * 0.2,
    likes: ['alumni_30', 'alumni_35'],
    comments: [
      {
        id: 'comment_4',
        postId: 'post_4',
        authorId: 'alumni_30',
        content: 'I\'ll be there! Looking forward to meeting everyone.',
        timestamp: Date.now() - 86400000 * 0.15,
      },
    ],
    isPinned: true,
    isAnnouncement: true,
  },
  {
    id: 'post_5',
    groupId: 'group_6',
    authorId: 'alumni_12',
    content: 'Hosting a tech talk on "Building Scalable Microservices" next week. We have a senior architect from Flipkart joining us. DM me if you\'re interested in attending!',
    timestamp: Date.now() - 86400000 * 0.1,
    likes: ['alumni_18', 'current_user'],
    comments: [],
    isPinned: false,
    isAnnouncement: false,
  },
];

// Helper to populate user data in groups and posts
export const populateGroupData = (groups: Group[], posts: GroupPost[], profiles: typeof mockProfiles) => {
  const profileMap = new Map(profiles.map(p => [p.id, p]));
  
  groups.forEach(group => {
    group.members = group.members.map(member => ({
      ...member,
      user: profileMap.get(member.userId),
    }));
    
    const currentUserMember = group.members.find(m => m.userId === 'current_user');
    group.isJoined = !!currentUserMember;
  });
  
  posts.forEach(post => {
    post.author = profileMap.get(post.authorId);
    post.comments = post.comments.map(comment => ({
      ...comment,
      author: profileMap.get(comment.authorId),
    }));
  });
};

populateGroupData(mockGroups, mockGroupPosts, mockProfiles);
