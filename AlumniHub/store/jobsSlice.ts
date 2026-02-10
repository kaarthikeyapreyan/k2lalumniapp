import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { JobsState, Job, JobFilterOptions, JobType, ExperienceLevel, JobApplication } from '../types';
import * as jobService from '../mock/services/jobService';

const initialState: JobsState = {
  jobs: [],
  myApplications: [],
  savedJobs: [],
  myJobPostings: [],
  currentJob: null,
  filters: {},
  isLoading: false,
  error: null,
};

export const fetchJobs = createAsyncThunk(
  'jobs/fetchJobs',
  async (filters: JobFilterOptions | undefined, { rejectWithValue }) => {
    try {
      return await jobService.getJobs(filters);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const searchJobs = createAsyncThunk(
  'jobs/searchJobs',
  async (query: string, { rejectWithValue }) => {
    try {
      return await jobService.searchJobs(query);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchJobById = createAsyncThunk(
  'jobs/fetchJobById',
  async (jobId: string, { rejectWithValue }) => {
    try {
      return await jobService.getJobById(jobId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createJob = createAsyncThunk(
  'jobs/createJob',
  async (data: {
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
  }, { rejectWithValue }) => {
    try {
      return await jobService.createJob(data);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const applyToJob = createAsyncThunk(
  'jobs/applyToJob',
  async (data: {
    jobId: string;
    coverLetter?: string;
    resume?: string;
  }, { rejectWithValue }) => {
    try {
      return await jobService.applyToJob(data.jobId, {
        coverLetter: data.coverLetter,
        resume: data.resume,
      });
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMyApplications = createAsyncThunk(
  'jobs/fetchMyApplications',
  async (_, { rejectWithValue }) => {
    try {
      return await jobService.getMyApplications();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMyJobPostings = createAsyncThunk(
  'jobs/fetchMyJobPostings',
  async (_, { rejectWithValue }) => {
    try {
      return await jobService.getMyJobPostings();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const saveJob = createAsyncThunk(
  'jobs/saveJob',
  async (jobId: string, { rejectWithValue }) => {
    try {
      await jobService.saveJob(jobId);
      return jobId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const unsaveJob = createAsyncThunk(
  'jobs/unsaveJob',
  async (jobId: string, { rejectWithValue }) => {
    try {
      await jobService.unsaveJob(jobId);
      return jobId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchSavedJobs = createAsyncThunk(
  'jobs/fetchSavedJobs',
  async (_, { rejectWithValue }) => {
    try {
      return await jobService.getSavedJobs();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentJob: (state, action: PayloadAction<Job | null>) => {
      state.currentJob = action.payload;
    },
    setFilters: (state, action: PayloadAction<JobFilterOptions>) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch jobs
      .addCase(fetchJobs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.jobs = action.payload;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Search jobs
      .addCase(searchJobs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchJobs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.jobs = action.payload;
      })
      .addCase(searchJobs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch job by id
      .addCase(fetchJobById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchJobById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentJob = action.payload;
      })
      .addCase(fetchJobById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create job
      .addCase(createJob.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.isLoading = false;
        state.jobs.unshift(action.payload);
        state.myJobPostings.unshift(action.payload);
      })
      .addCase(createJob.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Apply to job
      .addCase(applyToJob.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(applyToJob.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myApplications.push(action.payload);
        if (state.currentJob && state.currentJob.id === action.payload.jobId) {
          state.currentJob.applications.push(action.payload);
          state.currentJob.applicationCount += 1;
        }
      })
      .addCase(applyToJob.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch my applications
      .addCase(fetchMyApplications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyApplications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myApplications = action.payload;
      })
      .addCase(fetchMyApplications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch my job postings
      .addCase(fetchMyJobPostings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyJobPostings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myJobPostings = action.payload;
      })
      .addCase(fetchMyJobPostings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Save job
      .addCase(saveJob.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(saveJob.fulfilled, (state, action) => {
        state.isLoading = false;
        if (!state.savedJobs.find(sj => sj.jobId === action.payload)) {
          state.savedJobs.push({ jobId: action.payload, savedAt: Date.now() });
        }
      })
      .addCase(saveJob.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Unsave job
      .addCase(unsaveJob.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(unsaveJob.fulfilled, (state, action) => {
        state.isLoading = false;
        state.savedJobs = state.savedJobs.filter(sj => sj.jobId !== action.payload);
      })
      .addCase(unsaveJob.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch saved jobs
      .addCase(fetchSavedJobs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSavedJobs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.savedJobs = action.payload;
      })
      .addCase(fetchSavedJobs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentJob, setFilters, clearFilters } = jobsSlice.actions;
export default jobsSlice.reducer;
