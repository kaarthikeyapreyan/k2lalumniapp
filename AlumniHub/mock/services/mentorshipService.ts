import { mockDelay, shouldFail } from '../../utils/mockDelay';
import {
  Mentorship,
  MentorshipRequest,
  MentorshipRequestStatus,
  Resource,
  SkillEndorsement,
  Recommendation,
} from '../../types';
import {
  mockMentorships,
  mockMentorshipRequests,
  mockResources,
  mockSkillEndorsements,
  mockRecommendations,
} from '../data/mentorships';
import { currentUserProfile } from '../data/profiles';

let mentorships = [...mockMentorships];
let requests = [...mockMentorshipRequests];
let resources = [...mockResources];
let endorsements = [...mockSkillEndorsements];
let recommendations = [...mockRecommendations];

export const getMentorships = async (): Promise<Mentorship[]> => {
  await mockDelay();
  if (shouldFail()) throw new Error('Failed to fetch mentorships');
  return mentorships.filter(m => m.isActive);
};

export const getMentorshipById = async (mentorshipId: string): Promise<Mentorship> => {
  await mockDelay();
  if (shouldFail()) throw new Error('Failed to fetch mentorship details');
  
  const mentorship = mentorships.find(m => m.id === mentorshipId);
  if (!mentorship) throw new Error('Mentorship not found');
  return mentorship;
};

export const getMyMentorships = async (): Promise<Mentorship[]> => {
  await mockDelay();
  if (shouldFail()) throw new Error('Failed to fetch your mentorships');
  return mentorships.filter(m => m.mentorId === currentUserProfile.id);
};

export const createMentorship = async (data: {
  title: string;
  expertise: string[];
  availability: string;
  mentoringStyle: string;
  description: string;
  maxMentees: number;
}): Promise<Mentorship> => {
  await mockDelay(500, 1500);
  if (shouldFail()) throw new Error('Failed to create mentorship');
  
  const newMentorship: Mentorship = {
    id: `mentorship_${Date.now()}`,
    mentorId: currentUserProfile.id,
    title: data.title,
    expertise: data.expertise,
    availability: data.availability,
    mentoringStyle: data.mentoringStyle,
    description: data.description,
    isActive: true,
    maxMentees: data.maxMentees,
    currentMentees: 0,
    createdAt: Date.now(),
  };
  
  mentorships = [...mentorships, newMentorship];
  return newMentorship;
};

export const updateMentorship = async (
  mentorshipId: string,
  data: Partial<Mentorship>
): Promise<Mentorship> => {
  await mockDelay();
  if (shouldFail()) throw new Error('Failed to update mentorship');
  
  const mentorshipIndex = mentorships.findIndex(m => m.id === mentorshipId);
  if (mentorshipIndex === -1) throw new Error('Mentorship not found');
  
  const updatedMentorship = { ...mentorships[mentorshipIndex], ...data };
  mentorships = [
    ...mentorships.slice(0, mentorshipIndex),
    updatedMentorship,
    ...mentorships.slice(mentorshipIndex + 1),
  ];
  return updatedMentorship;
};

export const requestMentorship = async (
  mentorshipId: string,
  data: {
    message: string;
    goals: string[];
  }
): Promise<MentorshipRequest> => {
  await mockDelay(500, 1500);
  if (shouldFail()) throw new Error('Failed to send mentorship request');
  
  const mentorship = mentorships.find(m => m.id === mentorshipId);
  if (!mentorship) throw new Error('Mentorship not found');
  
  if (mentorship.currentMentees >= mentorship.maxMentees) {
    throw new Error('Mentor is at full capacity');
  }
  
  const existingRequest = requests.find(
    r => r.mentorshipId === mentorshipId && r.menteeId === currentUserProfile.id
  );
  
  if (existingRequest) {
    throw new Error('You have already requested mentorship from this mentor');
  }
  
  const newRequest: MentorshipRequest = {
    id: `request_${Date.now()}`,
    mentorshipId,
    mentorId: mentorship.mentorId,
    menteeId: currentUserProfile.id,
    message: data.message,
    goals: data.goals,
    status: MentorshipRequestStatus.PENDING,
    requestedAt: Date.now(),
  };
  
  requests = [...requests, newRequest];
  return newRequest;
};

export const respondToRequest = async (
  requestId: string,
  status: MentorshipRequestStatus
): Promise<MentorshipRequest> => {
  await mockDelay();
  if (shouldFail()) throw new Error('Failed to respond to request');
  
  const requestIndex = requests.findIndex(r => r.id === requestId);
  if (requestIndex === -1) throw new Error('Request not found');
  
  const request = requests[requestIndex];
  const updatedRequest = {
    ...request,
    status,
    respondedAt: Date.now(),
  };
  
  requests = [
    ...requests.slice(0, requestIndex),
    updatedRequest,
    ...requests.slice(requestIndex + 1),
  ];
  
  if (status === MentorshipRequestStatus.ACCEPTED) {
    const mentorshipIndex = mentorships.findIndex(m => m.id === request.mentorshipId);
    if (mentorshipIndex !== -1) {
      mentorships = [
        ...mentorships.slice(0, mentorshipIndex),
        {
          ...mentorships[mentorshipIndex],
          currentMentees: mentorships[mentorshipIndex].currentMentees + 1,
        },
        ...mentorships.slice(mentorshipIndex + 1),
      ];
    }
  }
  
  return updatedRequest;
};

export const getMyMentorshipRequests = async (): Promise<MentorshipRequest[]> => {
  await mockDelay();
  if (shouldFail()) throw new Error('Failed to fetch your requests');
  return requests.filter(r => r.menteeId === currentUserProfile.id);
};

export const getIncomingRequests = async (): Promise<MentorshipRequest[]> => {
  await mockDelay();
  if (shouldFail()) throw new Error('Failed to fetch incoming requests');
  
  const myMentorshipIds = mentorships
    .filter(m => m.mentorId === currentUserProfile.id)
    .map(m => m.id);
  
  return requests.filter(
    r => myMentorshipIds.includes(r.mentorshipId) && r.status === MentorshipRequestStatus.PENDING
  );
};

export const getResources = async (): Promise<Resource[]> => {
  await mockDelay();
  if (shouldFail()) throw new Error('Failed to fetch resources');
  return resources.sort((a, b) => b.createdAt - a.createdAt);
};

export const createResource = async (data: {
  title: string;
  description: string;
  type: Resource['type'];
  url?: string;
  skills: string[];
}): Promise<Resource> => {
  await mockDelay(500, 1500);
  if (shouldFail()) throw new Error('Failed to create resource');
  
  const newResource: Resource = {
    id: `resource_${Date.now()}`,
    title: data.title,
    description: data.description,
    type: data.type,
    url: data.url,
    authorId: currentUserProfile.id,
    skills: data.skills,
    createdAt: Date.now(),
    likes: [],
    shares: 0,
  };
  
  resources = [newResource, ...resources];
  return newResource;
};

export const likeResource = async (resourceId: string): Promise<Resource> => {
  await mockDelay();
  if (shouldFail()) throw new Error('Failed to like resource');
  
  const resourceIndex = resources.findIndex(r => r.id === resourceId);
  if (resourceIndex === -1) throw new Error('Resource not found');
  
  const resource = resources[resourceIndex];
  const isLiked = resource.likes.includes(currentUserProfile.id);
  
  const updatedResource = {
    ...resource,
    likes: isLiked
      ? resource.likes.filter(id => id !== currentUserProfile.id)
      : [...resource.likes, currentUserProfile.id],
  };
  
  resources = [
    ...resources.slice(0, resourceIndex),
    updatedResource,
    ...resources.slice(resourceIndex + 1),
  ];
  return updatedResource;
};

export const shareResource = async (resourceId: string): Promise<Resource> => {
  await mockDelay();
  if (shouldFail()) throw new Error('Failed to share resource');
  
  const resourceIndex = resources.findIndex(r => r.id === resourceId);
  if (resourceIndex === -1) throw new Error('Resource not found');
  
  const updatedResource = {
    ...resources[resourceIndex],
    shares: resources[resourceIndex].shares + 1,
  };
  
  resources = [
    ...resources.slice(0, resourceIndex),
    updatedResource,
    ...resources.slice(resourceIndex + 1),
  ];
  return updatedResource;
};

export const endorseSkill = async (
  userId: string,
  skill: string
): Promise<SkillEndorsement> => {
  await mockDelay();
  if (shouldFail()) throw new Error('Failed to endorse skill');
  
  const existingEndorsement = endorsements.find(
    e => e.endorsedUserId === userId && e.skill === skill && e.endorsedById === currentUserProfile.id
  );
  
  if (existingEndorsement) {
    throw new Error('You have already endorsed this skill');
  }
  
  const newEndorsement: SkillEndorsement = {
    id: `endorsement_${Date.now()}`,
    skill,
    endorsedUserId: userId,
    endorsedById: currentUserProfile.id,
    endorsedAt: Date.now(),
    weight: 1,
  };
  
  endorsements = [...endorsements, newEndorsement];
  return newEndorsement;
};

export const getSkillEndorsements = async (userId: string): Promise<SkillEndorsement[]> => {
  await mockDelay();
  if (shouldFail()) throw new Error('Failed to fetch endorsements');
  return endorsements.filter(e => e.endorsedUserId === userId);
};

export const giveRecommendation = async (data: {
  recipientId: string;
  relationship: string;
  content: string;
}): Promise<Recommendation> => {
  await mockDelay(500, 1500);
  if (shouldFail()) throw new Error('Failed to give recommendation');
  
  const existingRecommendation = recommendations.find(
    r => r.recipientId === data.recipientId && r.authorId === currentUserProfile.id
  );
  
  if (existingRecommendation) {
    throw new Error('You have already given a recommendation to this person');
  }
  
  const newRecommendation: Recommendation = {
    id: `recommendation_${Date.now()}`,
    recipientId: data.recipientId,
    authorId: currentUserProfile.id,
    relationship: data.relationship,
    content: data.content,
    createdAt: Date.now(),
  };
  
  recommendations = [...recommendations, newRecommendation];
  return newRecommendation;
};

export const getRecommendations = async (userId: string): Promise<Recommendation[]> => {
  await mockDelay();
  if (shouldFail()) throw new Error('Failed to fetch recommendations');
  return recommendations.filter(r => r.recipientId === userId);
};

export const getGivenRecommendations = async (): Promise<Recommendation[]> => {
  await mockDelay();
  if (shouldFail()) throw new Error('Failed to fetch recommendations');
  return recommendations.filter(r => r.authorId === currentUserProfile.id);
};

export const getMentorshipAreas = (): string[] => [
  'Product Management',
  'Engineering Management',
  'Career Development',
  'Leadership',
  'Entrepreneurship',
  'Fundraising',
  'Data Science',
  'Machine Learning',
  'UX Design',
  'Frontend Development',
  'Backend Development',
  'Cloud Architecture',
  'DevOps',
  'Interview Preparation',
  'Public Speaking',
  'Team Building',
  'Strategy',
  'Finance',
  'Investment Banking',
  'Consulting',
];
