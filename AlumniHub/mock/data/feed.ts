import { FeedItem, FeedItemType, FeedItemVisibility, Profile, Group, Event, Job } from '../../types';
import { mockProfiles, currentUserProfile } from './profiles';
import { mockGroups } from './groups';
import { mockEvents } from './events';
import { mockJobs } from './jobs';

const now = Date.now();
const oneHour = 60 * 60 * 1000;
const oneDay = 24 * oneHour;

const getRandomProfile = (): Profile => {
  const profiles = mockProfiles.filter(p => p.id !== currentUserProfile.id);
  return profiles[Math.floor(Math.random() * profiles.length)];
};

const getRandomGroup = (): Group => {
  return mockGroups[Math.floor(Math.random() * mockGroups.length)];
};

const getRandomEvent = (): Event => {
  return mockEvents[Math.floor(Math.random() * mockEvents.length)];
};

const getRandomJob = (): Job => {
  return mockJobs[Math.floor(Math.random() * mockJobs.length)];
};

export const mockFeedItems: FeedItem[] = [
  {
    id: 'feed_1',
    type: FeedItemType.POST,
    authorId: mockProfiles[1].id,
    author: mockProfiles[1],
    content: 'Just got promoted to Senior Software Engineer! 🎉 Grateful for all the mentorship and support from this amazing alumni community. Looking forward to giving back and helping others grow in their careers. #careerGrowth #alumniNetwork',
    timestamp: now - 30 * 60 * 1000,
    visibility: FeedItemVisibility.CONNECTIONS_ONLY,
    likes: [currentUserProfile.id, mockProfiles[2].id, mockProfiles[3].id],
    comments: [
      {
        id: 'comment_1',
        feedItemId: 'feed_1',
        authorId: mockProfiles[2].id,
        author: mockProfiles[2],
        content: 'Congratulations! Well deserved! 🎊',
        timestamp: now - 20 * 60 * 1000,
        likes: [mockProfiles[1].id],
      },
      {
        id: 'comment_2',
        feedItemId: 'feed_1',
        authorId: mockProfiles[3].id,
        author: mockProfiles[3],
        content: 'So happy for you! Let\'s celebrate soon!',
        timestamp: now - 15 * 60 * 1000,
        likes: [],
      },
    ],
    shares: [mockProfiles[4].id],
    isPinned: false,
  },
  {
    id: 'feed_2',
    type: FeedItemType.GROUP_POST,
    authorId: mockProfiles[2].id,
    author: mockProfiles[2],
    content: 'Sharing some photos from our batch reunion last weekend! It was amazing to see everyone after 10 years.',
    images: ['https://picsum.photos/400/300?random=1', 'https://picsum.photos/400/300?random=2'],
    timestamp: now - 2 * oneHour,
    visibility: FeedItemVisibility.GROUP_MEMBERS,
    groupId: mockGroups[0].id,
    group: mockGroups[0],
    likes: [currentUserProfile.id, mockProfiles[1].id, mockProfiles[4].id, mockProfiles[5].id],
    comments: [],
    shares: [],
    isPinned: false,
  },
  {
    id: 'feed_3',
    type: FeedItemType.GROUP_ANNOUNCEMENT,
    authorId: mockGroups[1].id,
    content: '📢 Important Announcement: Our annual tech meetup is happening next month! We have amazing speakers lined up from Google, Microsoft, and Meta. Early bird registration is now open.',
    timestamp: now - 4 * oneHour,
    visibility: FeedItemVisibility.GROUP_MEMBERS,
    groupId: mockGroups[1].id,
    group: mockGroups[1],
    likes: [currentUserProfile.id, mockProfiles[1].id, mockProfiles[2].id, mockProfiles[3].id, mockProfiles[4].id],
    comments: [
      {
        id: 'comment_3',
        feedItemId: 'feed_3',
        authorId: mockProfiles[1].id,
        author: mockProfiles[1],
        content: 'Can\'t wait! Already registered 😊',
        timestamp: now - 3 * oneHour,
        likes: [currentUserProfile.id],
      },
    ],
    shares: [currentUserProfile.id, mockProfiles[1].id],
    isPinned: true,
  },
  {
    id: 'feed_4',
    type: FeedItemType.EVENT_INVITATION,
    authorId: mockProfiles[3].id,
    author: mockProfiles[3],
    content: 'You\'re invited to our annual Alumni Networking Mixer! Join us for an evening of networking, drinks, and great conversations.',
    timestamp: now - 6 * oneHour,
    visibility: FeedItemVisibility.CONNECTIONS_ONLY,
    eventId: mockEvents[0].id,
    event: mockEvents[0],
    likes: [currentUserProfile.id, mockProfiles[1].id],
    comments: [],
    shares: [],
    isPinned: false,
  },
  {
    id: 'feed_5',
    type: FeedItemType.JOB_POSTING,
    authorId: mockProfiles[4].id,
    author: mockProfiles[4],
    content: 'We\'re hiring! My company is looking for talented software engineers to join our growing team. Great benefits and competitive salary. Feel free to DM me for referrals!',
    timestamp: now - 8 * oneHour,
    visibility: FeedItemVisibility.PUBLIC,
    jobId: mockJobs[0].id,
    job: mockJobs[0],
    likes: [currentUserProfile.id, mockProfiles[1].id, mockProfiles[2].id],
    comments: [
      {
        id: 'comment_4',
        feedItemId: 'feed_5',
        authorId: mockProfiles[5].id,
        author: mockProfiles[5],
        content: 'Just applied! Thanks for sharing.',
        timestamp: now - 7 * oneHour,
        likes: [mockProfiles[4].id],
      },
    ],
    shares: [mockProfiles[2].id],
    isPinned: false,
  },
  {
    id: 'feed_6',
    type: FeedItemType.ACHIEVEMENT,
    authorId: mockProfiles[5].id,
    author: mockProfiles[5],
    content: '🏆 Congratulations to Sarah Chen for completing her MBA from Harvard Business School! Your dedication and hard work continue to inspire us all.',
    timestamp: now - 12 * oneHour,
    visibility: FeedItemVisibility.PUBLIC,
    likes: [currentUserProfile.id, mockProfiles[1].id, mockProfiles[2].id, mockProfiles[3].id, mockProfiles[4].id],
    comments: [
      {
        id: 'comment_5',
        feedItemId: 'feed_6',
        authorId: mockProfiles[1].id,
        author: mockProfiles[1],
        content: 'Amazing achievement! Congratulations Sarah! 🎓',
        timestamp: now - 11 * oneHour,
        likes: [mockProfiles[5].id],
      },
    ],
    shares: [currentUserProfile.id, mockProfiles[1].id, mockProfiles[2].id],
    isPinned: false,
    metadata: {
      achievementType: 'education',
    },
  },
  {
    id: 'feed_7',
    type: FeedItemType.POLL,
    authorId: mockProfiles[1].id,
    author: mockProfiles[1],
    content: 'Which technology stack are you most excited to learn in 2025?',
    timestamp: now - 18 * oneHour,
    visibility: FeedItemVisibility.CONNECTIONS_ONLY,
    pollOptions: [
      { id: 'poll_1_opt_1', text: 'AI/ML with Python', votes: [currentUserProfile.id, mockProfiles[2].id, mockProfiles[3].id] },
      { id: 'poll_1_opt_2', text: 'Blockchain/Web3', votes: [mockProfiles[4].id] },
      { id: 'poll_1_opt_3', text: 'Rust Systems Programming', votes: [mockProfiles[5].id] },
      { id: 'poll_1_opt_4', text: 'React Native/Flutter', votes: [mockProfiles[1].id, mockProfiles[6]?.id || mockProfiles[0].id] },
    ],
    pollEndsAt: now + 5 * oneDay,
    likes: [currentUserProfile.id],
    comments: [
      {
        id: 'comment_6',
        feedItemId: 'feed_7',
        authorId: mockProfiles[2].id,
        author: mockProfiles[2],
        content: 'AI is definitely the future!',
        timestamp: now - 16 * oneHour,
        likes: [mockProfiles[1].id],
      },
    ],
    shares: [],
    isPinned: false,
  },
  {
    id: 'feed_8',
    type: FeedItemType.EVENT_UPDATE,
    authorId: mockEvents[1].id,
    content: 'Update: The venue for tomorrow\'s career workshop has been changed to the Main Auditorium. Same time, new location!',
    timestamp: now - 20 * oneHour,
    visibility: FeedItemVisibility.PUBLIC,
    eventId: mockEvents[1].id,
    event: mockEvents[1],
    likes: [currentUserProfile.id],
    comments: [],
    shares: [mockProfiles[1].id],
    isPinned: false,
  },
  {
    id: 'feed_9',
    type: FeedItemType.POST,
    authorId: mockProfiles[3].id,
    author: mockProfiles[3],
    content: 'Just published my first technical book! "Building Scalable Systems" is now available on Amazon. Thank you to everyone who supported me during this journey! 📚',
    images: ['https://picsum.photos/300/400?random=3'],
    timestamp: now - oneDay,
    visibility: FeedItemVisibility.PUBLIC,
    likes: [currentUserProfile.id, mockProfiles[1].id, mockProfiles[2].id, mockProfiles[4].id],
    comments: [
      {
        id: 'comment_7',
        feedItemId: 'feed_9',
        authorId: mockProfiles[1].id,
        author: mockProfiles[1],
        content: 'Ordered my copy! Can\'t wait to read it.',
        timestamp: now - 22 * oneHour,
        likes: [mockProfiles[3].id],
      },
      {
        id: 'comment_8',
        feedItemId: 'feed_9',
        authorId: mockProfiles[2].id,
        author: mockProfiles[2],
        content: 'Congratulations! This is huge! 🎉',
        timestamp: now - 21 * oneHour,
        likes: [mockProfiles[3].id],
      },
    ],
    shares: [currentUserProfile.id, mockProfiles[1].id, mockProfiles[2].id, mockProfiles[4].id],
    isPinned: false,
  },
  {
    id: 'feed_10',
    type: FeedItemType.MILESTONE,
    authorId: currentUserProfile.id,
    author: currentUserProfile,
    content: '🎊 Celebrating 5 years with the Alumni Network! It\'s been an incredible journey connecting with fellow graduates and watching everyone grow in their careers. Here\'s to many more years of meaningful connections!',
    timestamp: now - 2 * oneDay,
    visibility: FeedItemVisibility.CONNECTIONS_ONLY,
    likes: [mockProfiles[1].id, mockProfiles[2].id, mockProfiles[3].id, mockProfiles[4].id, mockProfiles[5].id],
    comments: [
      {
        id: 'comment_9',
        feedItemId: 'feed_10',
        authorId: mockProfiles[1].id,
        author: mockProfiles[1],
        content: 'Cheers to 5 years! 🥂',
        timestamp: now - 2 * oneDay + oneHour,
        likes: [currentUserProfile.id],
      },
    ],
    shares: [],
    isPinned: false,
    metadata: {
      milestoneCount: 5,
    },
  },
  {
    id: 'feed_11',
    type: FeedItemType.SURVEY,
    authorId: 'admin_system',
    content: '📊 We value your feedback! Please take a moment to complete our annual alumni satisfaction survey. Your input helps us improve our services and create better experiences for the community.',
    timestamp: now - 3 * oneDay,
    visibility: FeedItemVisibility.PUBLIC,
    likes: [currentUserProfile.id],
    comments: [],
    shares: [],
    isPinned: true,
    metadata: {
      surveyUrl: 'https://alumni-network.edu/survey/2025',
    },
  },
  {
    id: 'feed_12',
    type: FeedItemType.POST,
    authorId: mockProfiles[4].id,
    author: mockProfiles[4],
    content: 'Looking for advice: I\'m considering a career pivot from finance to tech. Has anyone made a similar transition? Would love to hear your experiences and any tips you might have!',
    timestamp: now - 4 * oneDay,
    visibility: FeedItemVisibility.CONNECTIONS_ONLY,
    likes: [currentUserProfile.id, mockProfiles[1].id],
    comments: [
      {
        id: 'comment_10',
        feedItemId: 'feed_12',
        authorId: mockProfiles[2].id,
        author: mockProfiles[2],
        content: 'I made the switch 3 years ago! Happy to chat - DM me.',
        timestamp: now - 4 * oneDay + 2 * oneHour,
        likes: [mockProfiles[4].id, currentUserProfile.id],
      },
      {
        id: 'comment_11',
        feedItemId: 'feed_12',
        authorId: mockProfiles[3].id,
        author: mockProfiles[3],
        content: 'Check out the mentorship program - great resources there!',
        timestamp: now - 4 * oneDay + 4 * oneHour,
        likes: [mockProfiles[4].id],
      },
    ],
    shares: [],
    isPinned: false,
  },
];

export const generateMoreFeedItems = (page: number, limit: number = 10): FeedItem[] => {
  const items: FeedItem[] = [];
  const startIndex = (page - 1) * limit;
  
  for (let i = 0; i < limit; i++) {
    const index = startIndex + i;
    const profile = getRandomProfile();
    const types = Object.values(FeedItemType);
    const type = types[Math.floor(Math.random() * types.length)];
    
    const baseItem: FeedItem = {
      id: `feed_generated_${index}`,
      type,
      authorId: profile.id,
      author: profile,
      content: `Generated feed item ${index}: ${getRandomContent(type)}`,
      timestamp: now - (index + 1) * oneDay,
      visibility: FeedItemVisibility.CONNECTIONS_ONLY,
      likes: [],
      comments: [],
      shares: [],
      isPinned: false,
    };
    
    if (type === FeedItemType.GROUP_POST || type === FeedItemType.GROUP_ANNOUNCEMENT) {
      const group = getRandomGroup();
      baseItem.groupId = group.id;
      baseItem.group = group;
    }
    
    if (type === FeedItemType.EVENT_INVITATION || type === FeedItemType.EVENT_UPDATE) {
      const event = getRandomEvent();
      baseItem.eventId = event.id;
      baseItem.event = event;
    }
    
    if (type === FeedItemType.JOB_POSTING) {
      const job = getRandomJob();
      baseItem.jobId = job.id;
      baseItem.job = job;
    }
    
    if (type === FeedItemType.POLL) {
      baseItem.pollOptions = [
        { id: `poll_${index}_1`, text: 'Option A', votes: [] },
        { id: `poll_${index}_2`, text: 'Option B', votes: [] },
        { id: `poll_${index}_3`, text: 'Option C', votes: [] },
      ];
    }
    
    items.push(baseItem);
  }
  
  return items;
};

const getRandomContent = (type: FeedItemType): string => {
  const contents: Record<FeedItemType, string[]> = {
    [FeedItemType.POST]: [
      'Sharing some thoughts on the latest industry trends...',
      'Great meeting with fellow alumni today!',
      'Excited about the new project I\'m working on!',
      'Thank you everyone for the birthday wishes! 🎂',
      'Just finished an amazing workshop on leadership.',
    ],
    [FeedItemType.GROUP_ANNOUNCEMENT]: [
      'New guidelines have been posted for the group.',
      'Monthly meetup schedule has been updated.',
      'Welcome to all new members joining this month!',
    ],
    [FeedItemType.GROUP_POST]: [
      'Sharing resources from our last session.',
      'Great discussion today everyone!',
      'Photos from our recent event are now available.',
    ],
    [FeedItemType.EVENT_INVITATION]: [
      'You\'re invited to our upcoming networking event!',
      'Join us for an exclusive alumni dinner.',
      'Special workshop invitation for tech alumni.',
    ],
    [FeedItemType.EVENT_UPDATE]: [
      'Event time has been updated.',
      'New speakers added to the lineup!',
      'Venue change notification.',
    ],
    [FeedItemType.JOB_POSTING]: [
      'Hiring! Looking for talented individuals.',
      'New opportunity available in my team.',
      'Referral bonuses available for these positions.',
    ],
    [FeedItemType.ACHIEVEMENT]: [
      'Celebrating an amazing achievement!',
      'Congratulations to our distinguished alumni!',
      'Recognition for outstanding contributions.',
    ],
    [FeedItemType.MILESTONE]: [
      'Celebrating a special milestone!',
      'Anniversary celebration in the community.',
      'Years of service recognition.',
    ],
    [FeedItemType.POLL]: [
      'What do you think about this topic?',
      'Quick poll for the community.',
      'Your opinion matters - cast your vote!',
    ],
    [FeedItemType.SURVEY]: [
      'Help us improve - take this survey!',
      'Your feedback is valuable to us.',
      'Quick survey for alumni insights.',
    ],
  };
  
  const typeContents = contents[type] || contents[FeedItemType.POST];
  return typeContents[Math.floor(Math.random() * typeContents.length)];
};
