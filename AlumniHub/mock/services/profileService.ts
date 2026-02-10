import { mockDelay, shouldFail } from '../../utils/mockDelay';
import { Profile, PrivacySettings } from '../../types';
import { mockProfiles, currentUserProfile } from '../data/profiles';

const profilesMap = new Map<string, Profile>();
mockProfiles.forEach(profile => profilesMap.set(profile.id, profile));
profilesMap.set(currentUserProfile.id, currentUserProfile);

export const getProfile = async (userId: string): Promise<Profile> => {
  await mockDelay();
  
  if (shouldFail()) {
    throw new Error('Failed to load profile. Please try again.');
  }
  
  const profile = profilesMap.get(userId);
  
  if (!profile) {
    throw new Error('Profile not found');
  }
  
  return profile;
};

export const updateProfile = async (
  userId: string,
  updates: Partial<Profile>
): Promise<Profile> => {
  await mockDelay();
  
  if (shouldFail()) {
    throw new Error('Failed to update profile. Please try again.');
  }
  
  const profile = profilesMap.get(userId);
  
  if (!profile) {
    throw new Error('Profile not found');
  }
  
  const updatedProfile = { ...profile, ...updates };
  profilesMap.set(userId, updatedProfile);
  
  return updatedProfile;
};

export const updatePrivacySettings = async (
  userId: string,
  settings: PrivacySettings
): Promise<Profile> => {
  await mockDelay();
  
  if (shouldFail()) {
    throw new Error('Failed to update privacy settings. Please try again.');
  }
  
  const profile = profilesMap.get(userId);
  
  if (!profile) {
    throw new Error('Profile not found');
  }
  
  const updatedProfile = {
    ...profile,
    privacySettings: settings,
  };
  
  profilesMap.set(userId, updatedProfile);
  
  return updatedProfile;
};
