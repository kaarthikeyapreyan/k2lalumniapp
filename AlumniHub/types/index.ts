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
