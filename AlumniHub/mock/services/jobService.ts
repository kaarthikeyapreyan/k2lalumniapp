import { mockDelay, shouldFail } from '../../utils/mockDelay';
import { Job, JobApplication, SavedJob, JobFilterOptions, JobType, ExperienceLevel } from '../../types';
import { mockJobs, mockSavedJobs, mockApplications } from '../data/jobs';
import { currentUserProfile } from '../data/profiles';

let jobs = [...mockJobs];
let savedJobs = [...mockSavedJobs];
let applications = [...mockApplications];

export const getJobs = async (filters?: JobFilterOptions): Promise<Job[]> => {
  await mockDelay();
  if (shouldFail()) throw new Error('Failed to fetch jobs');
  
  let filteredJobs = jobs.filter(j => j.isActive);
  
  if (filters) {
    if (filters.industries?.length) {
      filteredJobs = filteredJobs.filter(j => 
        filters.industries!.includes(j.industry)
      );
    }
    if (filters.locations?.length) {
      filteredJobs = filteredJobs.filter(j =>
        j.location.city && filters.locations!.some(loc => 
          j.location.city!.toLowerCase().includes(loc.toLowerCase())
        )
      );
    }
    if (filters.experienceLevels?.length) {
      filteredJobs = filteredJobs.filter(j =>
        filters.experienceLevels!.includes(j.experienceLevel)
      );
    }
    if (filters.jobTypes?.length) {
      filteredJobs = filteredJobs.filter(j =>
        filters.jobTypes!.includes(j.jobType)
      );
    }
    if (filters.remote !== undefined) {
      filteredJobs = filteredJobs.filter(j => j.location.remote === filters.remote);
    }
    if (filters.skills?.length) {
      filteredJobs = filteredJobs.filter(j =>
        filters.skills!.some(skill => j.skills.includes(skill))
      );
    }
  }
  
  return filteredJobs.sort((a, b) => b.postedAt - a.postedAt);
};

export const getJobById = async (jobId: string): Promise<Job> => {
  await mockDelay();
  if (shouldFail()) throw new Error('Failed to fetch job details');
  
  const job = jobs.find(j => j.id === jobId);
  if (!job) throw new Error('Job not found');
  return job;
};

export const searchJobs = async (query: string): Promise<Job[]> => {
  await mockDelay();
  if (shouldFail()) throw new Error('Failed to search jobs');
  
  const searchTerms = query.toLowerCase().split(' ');
  
  return jobs
    .filter(j => j.isActive)
    .filter(j => {
      const searchableText = `
        ${j.title} ${j.company} ${j.description} ${j.skills.join(' ')}
        ${j.industry} ${j.location.city || ''} ${j.location.country}
      `.toLowerCase();
      return searchTerms.some(term => searchableText.includes(term));
    })
    .sort((a, b) => b.postedAt - a.postedAt);
};

export const createJob = async (data: {
  title: string;
  company: string;
  description: string;
  requirements: string[];
  salaryRange?: { min: number; max: number; currency: string };
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
  expiresAt?: number;
}): Promise<Job> => {
  await mockDelay(500, 1500);
  if (shouldFail()) throw new Error('Failed to create job posting');
  
  const newJob: Job = {
    id: `job_${Date.now()}`,
    ...data,
    postedBy: currentUserProfile.id,
    postedAt: Date.now(),
    isActive: true,
    applications: [],
    applicationCount: 0,
  };
  
  jobs = [...jobs, newJob];
  return newJob;
};

export const updateJob = async (
  jobId: string,
  data: Partial<Job>
): Promise<Job> => {
  await mockDelay();
  if (shouldFail()) throw new Error('Failed to update job');
  
  const jobIndex = jobs.findIndex(j => j.id === jobId);
  if (jobIndex === -1) throw new Error('Job not found');
  
  const updatedJob = { ...jobs[jobIndex], ...data };
  jobs = [
    ...jobs.slice(0, jobIndex),
    updatedJob,
    ...jobs.slice(jobIndex + 1),
  ];
  return updatedJob;
};

export const deleteJob = async (jobId: string): Promise<void> => {
  await mockDelay();
  if (shouldFail()) throw new Error('Failed to delete job');
  
  jobs = jobs.map(j => j.id === jobId ? { ...j, isActive: false } : j);
};

export const applyToJob = async (
  jobId: string,
  applicationData: {
    coverLetter?: string;
    resume?: string;
  }
): Promise<JobApplication> => {
  await mockDelay(500, 1500);
  if (shouldFail()) throw new Error('Failed to submit application');
  
  const jobIndex = jobs.findIndex(j => j.id === jobId);
  if (jobIndex === -1) throw new Error('Job not found');
  
  const newApplication: JobApplication = {
    id: `app_${Date.now()}`,
    jobId,
    applicantId: currentUserProfile.id,
    coverLetter: applicationData.coverLetter,
    resume: applicationData.resume,
    appliedAt: Date.now(),
    status: 'pending',
  };
  
  applications = [...applications, newApplication];
  
  const updatedJob = {
    ...jobs[jobIndex],
    applications: [...jobs[jobIndex].applications, newApplication],
    applicationCount: jobs[jobIndex].applicationCount + 1,
  };
  
  jobs = [
    ...jobs.slice(0, jobIndex),
    updatedJob,
    ...jobs.slice(jobIndex + 1),
  ];
  
  return newApplication;
};

export const getMyApplications = async (): Promise<JobApplication[]> => {
  await mockDelay();
  if (shouldFail()) throw new Error('Failed to fetch applications');
  
  return applications.filter(a => a.applicantId === currentUserProfile.id);
};

export const getMyJobPostings = async (): Promise<Job[]> => {
  await mockDelay();
  if (shouldFail()) throw new Error('Failed to fetch your job postings');
  
  return jobs.filter(j => j.postedBy === currentUserProfile.id);
};

export const saveJob = async (jobId: string): Promise<void> => {
  await mockDelay();
  if (shouldFail()) throw new Error('Failed to save job');
  
  const alreadySaved = savedJobs.some(sj => sj.jobId === jobId);
  if (!alreadySaved) {
    savedJobs = [...savedJobs, { jobId, savedAt: Date.now() }];
  }
};

export const unsaveJob = async (jobId: string): Promise<void> => {
  await mockDelay();
  if (shouldFail()) throw new Error('Failed to unsave job');
  
  savedJobs = savedJobs.filter(sj => sj.jobId !== jobId);
};

export const getSavedJobs = async (): Promise<SavedJob[]> => {
  await mockDelay();
  if (shouldFail()) throw new Error('Failed to fetch saved jobs');
  
  return savedJobs.map(sj => ({
    ...sj,
    job: jobs.find(j => j.id === sj.jobId),
  }));
};

export const isJobSaved = (jobId: string): boolean => {
  return savedJobs.some(sj => sj.jobId === jobId);
};

export const getIndustries = (): string[] => [
  'Technology',
  'Finance',
  'Healthcare',
  'Education',
  'Consulting',
  'E-commerce',
  'Media',
  'Telecommunications',
  'Automotive',
  'Aerospace',
  'Energy',
  'Real Estate',
  'Retail',
  'Manufacturing',
  'Biotechnology',
  'Fintech',
  'Entertainment',
  'Cloud Computing',
  'Travel',
];

export const getJobTypes = (): { value: JobType; label: string }[] => [
  { value: JobType.FULL_TIME, label: 'Full-time' },
  { value: JobType.PART_TIME, label: 'Part-time' },
  { value: JobType.CONTRACT, label: 'Contract' },
  { value: JobType.INTERNSHIP, label: 'Internship' },
  { value: JobType.FREELANCE, label: 'Freelance' },
];

export const getExperienceLevels = (): { value: ExperienceLevel; label: string }[] => [
  { value: ExperienceLevel.ENTRY, label: 'Entry Level' },
  { value: ExperienceLevel.MID, label: 'Mid Level' },
  { value: ExperienceLevel.SENIOR, label: 'Senior Level' },
  { value: ExperienceLevel.EXECUTIVE, label: 'Executive' },
];

export const getPopularSkills = (): string[] => [
  'JavaScript',
  'Python',
  'Java',
  'TypeScript',
  'React',
  'Node.js',
  'AWS',
  'Machine Learning',
  'SQL',
  'Product Management',
  'Data Science',
  'Leadership',
  'Agile',
  'Kubernetes',
  'Docker',
];
