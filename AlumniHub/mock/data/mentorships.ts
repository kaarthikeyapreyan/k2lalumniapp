import { Mentorship, MentorshipRequest, MentorshipRequestStatus, Resource, SkillEndorsement, Recommendation } from '../../types';
import { mockProfiles, currentUserProfile } from './profiles';

const now = Date.now();

export const mockMentorships: Mentorship[] = [
  {
    id: 'mentorship_1',
    mentorId: 'alumni_1',
    title: 'Career Transition to Product Management',
    expertise: ['Product Management', 'Career Development', 'Leadership'],
    availability: '2 hours per week, evenings PST',
    mentoringStyle: 'I focus on practical advice and real-world examples. I believe in setting clear goals and working through challenges together.',
    description: 'I help engineers and other professionals transition into product management roles. With 8 years of PM experience at Google and Facebook, I can guide you through the transition process.',
    isActive: true,
    maxMentees: 3,
    currentMentees: 2,
    createdAt: now - 86400000 * 100,
  },
  {
    id: 'mentorship_2',
    mentorId: 'alumni_5',
    title: 'Startup Founder Mentorship',
    expertise: ['Entrepreneurship', 'Fundraising', 'Growth Strategy', 'B2B SaaS'],
    availability: '1 hour per week, flexible scheduling',
    mentoringStyle: 'Hands-on and action-oriented. I help founders focus on what matters and avoid common pitfalls.',
    description: 'I have founded two successful startups and raised over $50M in funding. I mentor early-stage founders on product-market fit, fundraising, and scaling.',
    isActive: true,
    maxMentees: 2,
    currentMentees: 2,
    createdAt: now - 86400000 * 80,
  },
  {
    id: 'mentorship_3',
    mentorId: 'alumni_10',
    title: 'Data Science Career Guidance',
    expertise: ['Data Science', 'Machine Learning', 'Career Development', 'Interview Prep'],
    availability: '3 hours per week, weekends preferred',
    mentoringStyle: 'Structured approach with regular check-ins. I help set milestones and track progress.',
    description: 'Senior Data Scientist at Netflix with 6 years of experience. I help aspiring data scientists break into the field and advance their careers.',
    isActive: true,
    maxMentees: 4,
    currentMentees: 3,
    createdAt: now - 86400000 * 60,
  },
  {
    id: 'mentorship_4',
    mentorId: 'alumni_15',
    title: 'Engineering Leadership Coaching',
    expertise: ['Engineering Management', 'Leadership', 'Team Building', 'Career Growth'],
    availability: '2 hours per week, weekday evenings',
    mentoringStyle: 'I focus on developing leadership skills through real scenarios and feedback. I believe in building confidence through practice.',
    description: 'Engineering Director with 10+ years of experience. I help engineers transition into management and develop their leadership skills.',
    isActive: true,
    maxMentees: 3,
    currentMentees: 1,
    createdAt: now - 86400000 * 90,
  },
  {
    id: 'mentorship_5',
    mentorId: 'alumni_20',
    title: 'Finance Career Mentorship',
    expertise: ['Investment Banking', 'Private Equity', 'Financial Analysis', 'Career Strategy'],
    availability: '1 hour per week, early mornings or weekends',
    mentoringStyle: 'Direct and honest feedback. I help mentees understand the industry and navigate their career paths.',
    description: 'Partner at a leading private equity firm. I mentor those interested in finance careers, from undergrads to mid-career professionals.',
    isActive: true,
    maxMentees: 2,
    currentMentees: 2,
    createdAt: now - 86400000 * 70,
  },
  {
    id: 'mentorship_6',
    mentorId: 'alumni_25',
    title: 'UX/UI Design Mentorship',
    expertise: ['UX Design', 'UI Design', 'Design Systems', 'Portfolio Review'],
    availability: '2 hours per week, flexible',
    mentoringStyle: 'Creative and collaborative. I help designers find their unique voice and build strong portfolios.',
    description: 'Senior Product Designer at Airbnb. I mentor aspiring and early-career designers on building skills, portfolios, and navigating the design industry.',
    isActive: true,
    maxMentees: 3,
    currentMentees: 0,
    createdAt: now - 86400000 * 50,
  },
  {
    id: 'mentorship_7',
    mentorId: 'alumni_30',
    title: 'Cloud Architecture & DevOps',
    expertise: ['Cloud Architecture', 'AWS', 'DevOps', 'System Design'],
    availability: '2 hours per week, weekday evenings',
    mentoringStyle: 'Technical and practical. I help mentees build real skills through hands-on projects and architecture reviews.',
    description: 'Principal Engineer at AWS with expertise in cloud architecture. I help engineers level up their cloud and DevOps skills.',
    isActive: true,
    maxMentees: 2,
    currentMentees: 1,
    createdAt: now - 86400000 * 40,
  },
  {
    id: 'mentorship_8',
    mentorId: 'current_user',
    title: 'Full-Stack Development Mentorship',
    expertise: ['React', 'Node.js', 'TypeScript', 'Career Development'],
    availability: '2 hours per week, weekends',
    mentoringStyle: 'Patient and encouraging. I help developers build confidence and practical skills through guided projects.',
    description: 'Senior Software Engineer with expertise in full-stack development. I help junior and mid-level developers grow their technical skills and advance their careers.',
    isActive: true,
    maxMentees: 3,
    currentMentees: 1,
    createdAt: now - 86400000 * 30,
  },
];

export const mockMentorshipRequests: MentorshipRequest[] = [
  {
    id: 'request_1',
    mentorshipId: 'mentorship_1',
    mentorId: 'alumni_1',
    menteeId: 'current_user',
    message: 'Hi! I am currently a software engineer looking to transition into product management. I would love your guidance on making this career change. I have 4 years of engineering experience and have been leading some small projects.',
    goals: ['Transition to PM role', 'Learn product strategy', 'Build PM skills'],
    status: MentorshipRequestStatus.PENDING,
    requestedAt: now - 86400000 * 5,
  },
  {
    id: 'request_2',
    mentorshipId: 'mentorship_3',
    mentorId: 'alumni_10',
    menteeId: 'current_user',
    message: 'I am interested in breaking into data science. I have some Python experience and have taken online courses, but I need guidance on building a strong portfolio and preparing for interviews.',
    goals: ['Build data science portfolio', 'Prepare for DS interviews', 'Understand industry expectations'],
    status: MentorshipRequestStatus.ACCEPTED,
    requestedAt: now - 86400000 * 30,
    respondedAt: now - 86400000 * 28,
  },
  {
    id: 'request_3',
    mentorshipId: 'mentorship_4',
    mentorId: 'alumni_15',
    menteeId: 'alumni_35',
    message: 'I am a senior engineer considering the move to management. I would appreciate your perspective on whether this is the right path for me and how to prepare.',
    goals: ['Evaluate management path', 'Develop leadership skills', 'Prepare for EM role'],
    status: MentorshipRequestStatus.PENDING,
    requestedAt: now - 86400000 * 3,
  },
  {
    id: 'request_4',
    mentorshipId: 'mentorship_8',
    mentorId: 'current_user',
    menteeId: 'alumni_55',
    message: 'Hi! I am a recent bootcamp graduate looking to improve my React and Node.js skills. I would love to work with you on building real projects and learning best practices.',
    goals: ['Improve React skills', 'Learn Node.js best practices', 'Build portfolio projects'],
    status: MentorshipRequestStatus.ACCEPTED,
    requestedAt: now - 86400000 * 20,
    respondedAt: now - 86400000 * 18,
  },
  {
    id: 'request_5',
    mentorshipId: 'mentorship_8',
    mentorId: 'current_user',
    menteeId: 'alumni_58',
    message: 'I am currently in my final year of CS and would love guidance on preparing for frontend engineering interviews and building a strong foundation.',
    goals: ['Interview preparation', 'Build strong foundation', 'Career guidance'],
    status: MentorshipRequestStatus.PENDING,
    requestedAt: now - 86400000 * 2,
  },
];

export const mockResources: Resource[] = [
  {
    id: 'resource_1',
    title: 'The Ultimate Guide to System Design Interviews',
    description: 'A comprehensive guide covering all aspects of system design interviews, from basic concepts to advanced topics. Includes real interview questions and solutions.',
    type: 'article',
    url: 'https://example.com/system-design-guide',
    authorId: 'alumni_1',
    skills: ['System Design', 'Interviews', 'Architecture'],
    createdAt: now - 86400000 * 20,
    likes: ['alumni_2', 'alumni_3', 'current_user'],
    shares: 45,
  },
  {
    id: 'resource_2',
    title: 'Machine Learning Specialization - Coursera',
    description: 'Highly recommended ML course by Andrew Ng. Great foundation for anyone looking to break into data science or ML engineering.',
    type: 'course',
    url: 'https://coursera.org/ml-specialization',
    authorId: 'alumni_10',
    skills: ['Machine Learning', 'Python', 'Data Science'],
    createdAt: now - 86400000 * 30,
    likes: ['alumni_15', 'alumni_20', 'current_user'],
    shares: 89,
  },
  {
    id: 'resource_3',
    title: 'AWS Solutions Architect Certification',
    description: 'Essential certification for cloud professionals. Covers all AWS core services and architectural best practices.',
    type: 'certification',
    url: 'https://aws.amazon.com/certification',
    authorId: 'alumni_30',
    skills: ['AWS', 'Cloud Architecture', 'DevOps'],
    createdAt: now - 86400000 * 15,
    likes: ['alumni_35', 'alumni_40'],
    shares: 32,
  },
  {
    id: 'resource_4',
    title: 'Cracking the PM Interview',
    description: 'The definitive book for product management interviews. Covers everything from strategy questions to case studies.',
    type: 'book',
    url: 'https://example.com/pm-interview-book',
    authorId: 'alumni_5',
    skills: ['Product Management', 'Interviews', 'Strategy'],
    createdAt: now - 86400000 * 40,
    likes: ['alumni_1', 'current_user', 'alumni_25'],
    shares: 67,
  },
  {
    id: 'resource_5',
    title: 'React Patterns and Best Practices',
    description: 'Video series covering advanced React patterns, performance optimization, and modern development practices.',
    type: 'video',
    url: 'https://youtube.com/react-patterns',
    authorId: 'current_user',
    skills: ['React', 'JavaScript', 'Frontend'],
    createdAt: now - 86400000 * 10,
    likes: ['alumni_55', 'alumni_58'],
    shares: 23,
  },
];

export const mockSkillEndorsements: SkillEndorsement[] = [
  {
    id: 'endorsement_1',
    skill: 'JavaScript',
    endorsedUserId: 'current_user',
    endorsedById: 'alumni_1',
    endorsedAt: now - 86400000 * 30,
    weight: 3,
  },
  {
    id: 'endorsement_2',
    skill: 'React',
    endorsedUserId: 'current_user',
    endorsedById: 'alumni_1',
    endorsedAt: now - 86400000 * 30,
    weight: 3,
  },
  {
    id: 'endorsement_3',
    skill: 'TypeScript',
    endorsedUserId: 'current_user',
    endorsedById: 'alumni_5',
    endorsedAt: now - 86400000 * 20,
    weight: 2,
  },
  {
    id: 'endorsement_4',
    skill: 'Node.js',
    endorsedUserId: 'current_user',
    endorsedById: 'alumni_10',
    endorsedAt: now - 86400000 * 15,
    weight: 2,
  },
  {
    id: 'endorsement_5',
    skill: 'Product Management',
    endorsedUserId: 'alumni_1',
    endorsedById: 'current_user',
    endorsedAt: now - 86400000 * 10,
    weight: 1,
  },
];

export const mockRecommendations: Recommendation[] = [
  {
    id: 'recommendation_1',
    recipientId: 'current_user',
    authorId: 'alumni_1',
    relationship: 'Worked together on several projects',
    content: 'John is an exceptional engineer with strong problem-solving skills. He consistently delivers high-quality code and is a great team player. I highly recommend him for any senior engineering role.',
    createdAt: now - 86400000 * 60,
  },
  {
    id: 'recommendation_2',
    recipientId: 'current_user',
    authorId: 'alumni_5',
    relationship: 'Mentor relationship',
    content: 'I have mentored John for the past year and have been impressed by his growth mindset and dedication. He quickly grasps complex concepts and applies them effectively.',
    createdAt: now - 86400000 * 30,
  },
  {
    id: 'recommendation_3',
    recipientId: 'alumni_1',
    authorId: 'current_user',
    relationship: 'Collaborated on cross-functional initiatives',
    content: 'Sarah is an outstanding product leader. Her ability to balance user needs with business goals is exceptional. She is also a great mentor and always takes time to help others grow.',
    createdAt: now - 86400000 * 45,
  },
];

// Helper to populate user data
export const populateMentorshipData = (
  mentorships: Mentorship[],
  requests: MentorshipRequest[],
  resources: Resource[],
  endorsements: SkillEndorsement[],
  recommendations: Recommendation[],
  profiles: typeof mockProfiles
) => {
  const profileMap = new Map(profiles.map(p => [p.id, p]));
  
  mentorships.forEach(m => {
    m.mentor = profileMap.get(m.mentorId);
  });
  
  requests.forEach(r => {
    r.mentorship = mentorships.find(m => m.id === r.mentorshipId);
    r.mentor = profileMap.get(r.mentorId);
    r.mentee = profileMap.get(r.menteeId);
  });
  
  resources.forEach(r => {
    r.author = profileMap.get(r.authorId);
  });
  
  endorsements.forEach(e => {
    e.endorsedBy = profileMap.get(e.endorsedById);
  });
  
  recommendations.forEach(r => {
    r.author = profileMap.get(r.authorId);
    r.recipient = profileMap.get(r.recipientId);
  });
};

populateMentorshipData(
  mockMentorships,
  mockMentorshipRequests,
  mockResources,
  mockSkillEndorsements,
  mockRecommendations,
  mockProfiles
);
