export enum VerificationStatus {
  VERIFIED = 'verified',
  PENDING = 'pending',
  UNVERIFIED = 'unverified',
}

export enum ConnectionStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
}

export enum PrivacyLevel {
  PUBLIC = 'public',
  CONNECTIONS_ONLY = 'connections_only',
  PRIVATE = 'private',
}

export enum GroupPrivacy {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

export enum GroupType {
  BATCH = 'batch',
  INTEREST = 'interest',
  LOCATION = 'location',
}

export enum GroupMemberRole {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  MEMBER = 'member',
}

export enum EventType {
  REUNION = 'reunion',
  CAREER = 'career',
  NETWORKING = 'networking',
  SOCIAL = 'social',
  EDUCATIONAL = 'educational',
  SPORTS = 'sports',
  CHARITY = 'charity',
}

export enum RSVPStatus {
  INTERESTED = 'interested',
  GOING = 'going',
  NOT_GOING = 'not_going',
}

export enum JobType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACT = 'contract',
  INTERNSHIP = 'internship',
  FREELANCE = 'freelance',
}

export enum ExperienceLevel {
  ENTRY = 'entry',
  MID = 'mid',
  SENIOR = 'senior',
  EXECUTIVE = 'executive',
}

export enum MentorshipStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum MentorshipRequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
}

export enum NotificationType {
  GROUP_INVITE = 'group_invite',
  GROUP_JOIN_REQUEST = 'group_join_request',
  EVENT_REMINDER = 'event_reminder',
  EVENT_INVITE = 'event_invite',
  JOB_MATCH = 'job_match',
  MENTORSHIP_REQUEST = 'mentorship_request',
  MENTORSHIP_ACCEPTED = 'mentorship_accepted',
  SKILL_ENDORSEMENT = 'skill_endorsement',
  RECOMMENDATION = 'recommendation',
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  verificationStatus: VerificationStatus;
}

export interface PrivacySettings {
  emailVisibility: PrivacyLevel;
  phoneVisibility: PrivacyLevel;
  locationVisibility: PrivacyLevel;
  whoCanConnect: PrivacyLevel;
  whoCanMessage: PrivacyLevel;
}

export interface Profile extends User {
  jobTitle: string;
  company: string;
  industry: string;
  graduationYear: number;
  degree: string;
  department: string;
  bio: string;
  skills: string[];
  location: {
    city: string;
    state: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  privacySettings: PrivacySettings;
  phone?: string;
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: number;
  type: MessageType;
  reactions: { [emoji: string]: string[] };
  read: boolean;
  status?: 'sending' | 'sent' | 'delivered' | 'failed';
}

export interface Conversation {
  id: string;
  participants: string[];
  messages: Message[];
  lastMessage?: Message;
  unreadCount: number;
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
}

export interface Connection {
  id: string;
  userId: string;
  connectedUserId: string;
  status: ConnectionStatus;
  requestedAt: number;
  acceptedAt?: number;
}

export interface GroupMember {
  userId: string;
  role: GroupMemberRole;
  joinedAt: number;
  user?: Profile;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  coverImage?: string;
  type: GroupType;
  privacy: GroupPrivacy;
  createdBy: string;
  createdAt: number;
  members: GroupMember[];
  memberCount: number;
  isJoined?: boolean;
  pendingJoinRequest?: boolean;
}

export interface GroupPost {
  id: string;
  groupId: string;
  authorId: string;
  content: string;
  images?: string[];
  media?: string;
  timestamp: number;
  likes: string[];
  comments: GroupComment[];
  isPinned: boolean;
  isAnnouncement: boolean;
  author?: Profile;
}

export interface GroupComment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  timestamp: number;
  author?: Profile;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  image?: string;
  type: EventType;
  startDate: number;
  endDate: number;
  location: {
    name: string;
    address?: string;
    city?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    virtual?: boolean;
    virtualLink?: string;
  };
  capacity?: number;
  categories: string[];
  speakers?: Profile[];
  hosts: string[];
  attendees: EventAttendee[];
  attendeeCount: number;
  createdBy: string;
  groupId?: string;
  createdAt: number;
  userRSVP?: RSVPStatus;
}

export interface EventAttendee {
  userId: string;
  status: RSVPStatus;
  rsvpAt: number;
  user?: Profile;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
  location: {
    city?: string;
    state?: string;
    country: string;
    remote: boolean;
  };
  jobType: JobType;
  experienceLevel: ExperienceLevel;
  industry: string;
  skills: string[];
  postedBy: string;
  postedAt: number;
  expiresAt?: number;
  isActive: boolean;
  applications: JobApplication[];
  applicationCount: number;
  poster?: Profile;
}

export interface JobApplication {
  id: string;
  jobId: string;
  applicantId: string;
  coverLetter?: string;
  resume?: string;
  appliedAt: number;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  applicant?: Profile;
}

export interface SavedJob {
  jobId: string;
  savedAt: number;
  job?: Job;
}

export interface Mentorship {
  id: string;
  mentorId: string;
  title: string;
  expertise: string[];
  availability: string;
  mentoringStyle: string;
  description: string;
  isActive: boolean;
  maxMentees: number;
  currentMentees: number;
  createdAt: number;
  mentor?: Profile;
}

export interface MentorshipRequest {
  id: string;
  mentorshipId: string;
  mentorId: string;
  menteeId: string;
  message: string;
  goals: string[];
  status: MentorshipRequestStatus;
  requestedAt: number;
  respondedAt?: number;
  mentorship?: Mentorship;
  mentor?: Profile;
  mentee?: Profile;
}

export interface SkillEndorsement {
  id: string;
  skill: string;
  endorsedUserId: string;
  endorsedById: string;
  endorsedAt: number;
  weight: number;
  endorsedBy?: Profile;
}

export interface Recommendation {
  id: string;
  recipientId: string;
  authorId: string;
  relationship: string;
  content: string;
  createdAt: number;
  author?: Profile;
  recipient?: Profile;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'course' | 'certification' | 'video' | 'book';
  url?: string;
  authorId: string;
  skills: string[];
  createdAt: number;
  likes: string[];
  shares: number;
  author?: Profile;
}

export interface FilterOptions {
  yearRange?: {
    min: number;
    max: number;
  };
  departments?: string[];
  locations?: string[];
  industries?: string[];
  skills?: string[];
}

export interface JobFilterOptions {
  industries?: string[];
  locations?: string[];
  experienceLevels?: ExperienceLevel[];
  jobTypes?: JobType[];
  remote?: boolean;
  skills?: string[];
}

export interface EventFilterOptions {
  types?: EventType[];
  dateRange?: {
    start: number;
    end: number;
  };
  locations?: string[];
  virtual?: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface ProfileState {
  currentProfile: Profile | null;
  viewedProfile: Profile | null;
  isLoading: boolean;
  error: string | null;
}

export interface DirectoryState {
  alumni: Profile[];
  filteredAlumni: Profile[];
  filters: FilterOptions;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
}

export interface MessagingState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  isLoading: boolean;
  error: string | null;
  typingUsers: { [conversationId: string]: string[] };
}

export interface ConnectionState {
  connections: Connection[];
  pendingRequests: Connection[];
  sentRequests: Connection[];
  isLoading: boolean;
  error: string | null;
}

export interface GroupsState {
  groups: Group[];
  myGroups: Group[];
  currentGroup: Group | null;
  posts: GroupPost[];
  isLoading: boolean;
  error: string | null;
}

export interface EventsState {
  events: Event[];
  myEvents: Event[];
  currentEvent: Event | null;
  isLoading: boolean;
  error: string | null;
}

export interface JobsState {
  jobs: Job[];
  myApplications: JobApplication[];
  savedJobs: SavedJob[];
  myJobPostings: Job[];
  currentJob: Job | null;
  filters: JobFilterOptions;
  isLoading: boolean;
  error: string | null;
}

export interface MentorshipState {
  mentorships: Mentorship[];
  myMentorships: Mentorship[];
  requests: MentorshipRequest[];
  myRequests: MentorshipRequest[];
  currentMentorship: Mentorship | null;
  isLoading: boolean;
  error: string | null;
}

export enum FeedItemType {
  POST = 'post',
  GROUP_ANNOUNCEMENT = 'group_announcement',
  GROUP_POST = 'group_post',
  EVENT_INVITATION = 'event_invitation',
  EVENT_UPDATE = 'event_update',
  JOB_POSTING = 'job_posting',
  ACHIEVEMENT = 'achievement',
  MILESTONE = 'milestone',
  POLL = 'poll',
  SURVEY = 'survey',
}

export enum FeedItemVisibility {
  CONNECTIONS_ONLY = 'connections_only',
  PUBLIC = 'public',
  GROUP_MEMBERS = 'group_members',
}

export enum FeedSortOption {
  CHRONOLOGICAL = 'chronological',
  ALGORITHMIC = 'algorithmic',
}

export interface PollOption {
  id: string;
  text: string;
  votes: string[];
}

export interface FeedItem {
  id: string;
  type: FeedItemType;
  authorId: string;
  author?: Profile;
  content: string;
  images?: string[];
  media?: string;
  mediaType?: 'video' | 'audio';
  timestamp: number;
  visibility: FeedItemVisibility;
  groupId?: string;
  group?: Group;
  eventId?: string;
  event?: Event;
  jobId?: string;
  job?: Job;
  likes: string[];
  comments: FeedComment[];
  shares: string[];
  isPinned: boolean;
  pollOptions?: PollOption[];
  pollEndsAt?: number;
  metadata?: {
    achievementType?: string;
    milestoneCount?: number;
    surveyUrl?: string;
  };
}

export interface FeedComment {
  id: string;
  feedItemId: string;
  authorId: string;
  author?: Profile;
  content: string;
  timestamp: number;
  likes: string[];
  replies?: FeedComment[];
}

export interface FeedFilter {
  showPosts: boolean;
  showGroupActivity: boolean;
  showEvents: boolean;
  showJobs: boolean;
  showAchievements: boolean;
  mutedKeywords: string[];
  mutedUserIds: string[];
}

export interface FeedState {
  items: FeedItem[];
  hasMore: boolean;
  page: number;
  sortBy: FeedSortOption;
  filter: FeedFilter;
  isLoading: boolean;
  error: string | null;
  refreshing: boolean;
}

export enum NotificationCategory {
  CONNECTIONS = 'connections',
  MESSAGES = 'messages',
  GROUPS = 'groups',
  EVENTS = 'events',
  JOBS = 'jobs',
  ACHIEVEMENTS = 'achievements',
  ADMIN = 'admin',
}

export interface Notification {
  id: string;
  userId: string;
  category: NotificationCategory;
  type: string;
  title: string;
  message: string;
  image?: string;
  actionUrl?: string;
  relatedUserId?: string;
  relatedUser?: Profile;
  relatedEntityId?: string;
  relatedEntityType?: string;
  isRead: boolean;
  isActioned: boolean;
  createdAt: number;
  priority: 'low' | 'normal' | 'high';
}

export interface NotificationSettings {
  globalEnabled: boolean;
  perCategory: {
    [key in NotificationCategory]: {
      enabled: boolean;
      pushEnabled: boolean;
      soundEnabled: boolean;
      vibrationEnabled: boolean;
    };
  };
  doNotDisturb: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    timezone: string;
  };
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  settings: NotificationSettings;
  isLoading: boolean;
  error: string | null;
}
