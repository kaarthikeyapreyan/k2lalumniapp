import { mockDelay, shouldFail } from '../../utils/mockDelay';
import { Profile, FilterOptions } from '../../types';
import { mockProfiles } from '../data/profiles';

export const getAlumni = async (): Promise<Profile[]> => {
  await mockDelay();
  
  if (shouldFail()) {
    throw new Error('Failed to load alumni. Please try again.');
  }
  
  return [...mockProfiles];
};

export const searchAlumni = async (query: string): Promise<Profile[]> => {
  await mockDelay(200, 500);
  
  if (shouldFail()) {
    throw new Error('Search failed. Please try again.');
  }
  
  const lowerQuery = query.toLowerCase().trim();
  
  if (!lowerQuery) {
    return [...mockProfiles];
  }
  
  return mockProfiles.filter(profile => {
    return (
      profile.name.toLowerCase().includes(lowerQuery) ||
      profile.company.toLowerCase().includes(lowerQuery) ||
      profile.jobTitle.toLowerCase().includes(lowerQuery) ||
      profile.industry.toLowerCase().includes(lowerQuery) ||
      profile.department.toLowerCase().includes(lowerQuery) ||
      profile.skills.some(skill => skill.toLowerCase().includes(lowerQuery)) ||
      profile.location.city.toLowerCase().includes(lowerQuery)
    );
  });
};

export const filterAlumni = async (filters: FilterOptions): Promise<Profile[]> => {
  await mockDelay(300, 600);
  
  if (shouldFail()) {
    throw new Error('Filter failed. Please try again.');
  }
  
  let filtered = [...mockProfiles];
  
  if (filters.yearRange) {
    filtered = filtered.filter(
      profile =>
        profile.graduationYear >= filters.yearRange!.min &&
        profile.graduationYear <= filters.yearRange!.max
    );
  }
  
  if (filters.departments && filters.departments.length > 0) {
    filtered = filtered.filter(profile =>
      filters.departments!.includes(profile.department)
    );
  }
  
  if (filters.locations && filters.locations.length > 0) {
    filtered = filtered.filter(profile =>
      filters.locations!.some(loc => profile.location.city.includes(loc))
    );
  }
  
  if (filters.industries && filters.industries.length > 0) {
    filtered = filtered.filter(profile =>
      filters.industries!.includes(profile.industry)
    );
  }
  
  if (filters.skills && filters.skills.length > 0) {
    filtered = filtered.filter(profile =>
      filters.skills!.some(skill =>
        profile.skills.some(profileSkill =>
          profileSkill.toLowerCase().includes(skill.toLowerCase())
        )
      )
    );
  }
  
  return filtered;
};
