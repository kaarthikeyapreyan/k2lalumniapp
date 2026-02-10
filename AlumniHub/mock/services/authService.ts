import { mockDelay, shouldFail } from '../../utils/mockDelay';
import { currentUserProfile } from '../data/profiles';
import { User, VerificationStatus } from '../../types';

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
  graduationYear: number;
  institution: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

const mockUsers = new Map<string, { password: string; user: User }>();

mockUsers.set('john.doe@example.com', {
  password: 'password123',
  user: {
    id: currentUserProfile.id,
    email: currentUserProfile.email,
    name: currentUserProfile.name,
    avatar: currentUserProfile.avatar,
    verificationStatus: currentUserProfile.verificationStatus,
  },
});

export const mockLogin = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  await mockDelay();
  
  if (shouldFail()) {
    throw new Error('Network error. Please try again.');
  }
  
  const userRecord = mockUsers.get(credentials.email);
  
  if (!userRecord || userRecord.password !== credentials.password) {
    throw new Error('Invalid email or password');
  }
  
  return {
    user: userRecord.user,
    token: `mock_token_${Date.now()}`,
  };
};

export const mockSignup = async (data: SignupData): Promise<AuthResponse> => {
  await mockDelay();
  
  if (shouldFail()) {
    throw new Error('Network error. Please try again.');
  }
  
  if (mockUsers.has(data.email)) {
    throw new Error('Email already exists');
  }
  
  const newUser: User = {
    id: `user_${Date.now()}`,
    email: data.email,
    name: data.name,
    verificationStatus: VerificationStatus.PENDING,
  };
  
  mockUsers.set(data.email, {
    password: data.password,
    user: newUser,
  });
  
  return {
    user: newUser,
    token: `mock_token_${Date.now()}`,
  };
};

export const mockOAuthLogin = async (provider: 'google' | 'linkedin'): Promise<AuthResponse> => {
  await mockDelay(500, 1500);
  
  if (shouldFail()) {
    throw new Error(`Failed to authenticate with ${provider}. Please try again.`);
  }
  
  const oauthUser: User = {
    id: `user_oauth_${provider}_${Date.now()}`,
    email: `user_${provider}@example.com`,
    name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
    avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
    verificationStatus: VerificationStatus.VERIFIED,
  };
  
  return {
    user: oauthUser,
    token: `mock_oauth_token_${Date.now()}`,
  };
};

export const mockLogout = async (): Promise<void> => {
  await mockDelay(100, 300);
};
