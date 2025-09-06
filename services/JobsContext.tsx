// services/JobsContext.tsx
import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { 
  Job, 
  JobFilters, 
  JobsContextValue, 
  UserJobInteraction,
  UserJobInteractionType,
  JobWithInteraction 
} from './AuthTypes';
import jobsService from './JobsService';
import userJobInteractionService from './UserJobInteractionService';
import { useAuth } from './AuthContext';

// Jobs state interface
interface JobsState {
  currentJobs: Job[];
  isLoading: boolean;
  hasMore: boolean;
  error: string | null;
  totalCount: number;
  currentFilters: JobFilters;
}

// Initial state
const initialState: JobsState = {
  currentJobs: [],
  isLoading: false,
  hasMore: true,
  error: null,
  totalCount: 0,
  currentFilters: {},
};

// Action types
type JobsAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_JOBS'; payload: { jobs: Job[]; totalCount: number; hasMore: boolean } }
  | { type: 'APPEND_JOBS'; payload: { jobs: Job[]; hasMore: boolean } }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_FILTERS'; payload: JobFilters }
  | { type: 'CLEAR_JOBS' }
  | { type: 'RESET_STATE' };

// Reducer function
const jobsReducer = (state: JobsState, action: JobsAction): JobsState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_JOBS':
      return {
        ...state,
        currentJobs: action.payload.jobs,
        totalCount: action.payload.totalCount,
        hasMore: action.payload.hasMore,
        isLoading: false,
        error: null,
      };
    case 'APPEND_JOBS':
      return {
        ...state,
        currentJobs: [...state.currentJobs, ...action.payload.jobs],
        hasMore: action.payload.hasMore,
        isLoading: false,
        error: null,
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_FILTERS':
      return { ...state, currentFilters: action.payload };
    case 'CLEAR_JOBS':
      return { ...state, currentJobs: [], totalCount: 0, hasMore: true };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
};

// Create the jobs context
const JobsContext = createContext<JobsContextValue | undefined>(undefined);

// JobsProvider component
interface JobsProviderProps {
  children: ReactNode;
}

export const JobsProvider: React.FC<JobsProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(jobsReducer, initialState);
  const { userProfile } = useAuth();

  // Fetch jobs with optional filters
  const fetchJobs = useCallback(async (filters: JobFilters = {}): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      // Reset offset for new search
      const searchFilters = { ...filters, offset: 0 };
      
      const result = await jobsService.fetchJobs(searchFilters, userProfile);
      
      dispatch({ type: 'SET_JOBS', payload: result });
      dispatch({ type: 'SET_FILTERS', payload: searchFilters });
      
    } catch (error: any) {
      console.error('JobsContext: fetchJobs failed:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to fetch jobs' });
    }
  }, [userProfile]);

  // Load more jobs for pagination
  const loadMoreJobs = useCallback(async (): Promise<void> => {
    if (!state.hasMore || state.isLoading) {
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const offset = state.currentJobs.length;
      const paginationFilters = { ...state.currentFilters, offset };

      const result = await jobsService.fetchJobs(paginationFilters, userProfile);

      dispatch({ type: 'APPEND_JOBS', payload: result });
      
    } catch (error: any) {
      console.error('JobsContext: loadMoreJobs failed:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to load more jobs' });
    }
  }, [state.hasMore, state.isLoading, state.currentJobs.length, state.currentFilters, userProfile]);

  // Refresh jobs (pull-to-refresh)
  const refreshJobs = useCallback(async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // Use current filters but reset offset
      const refreshFilters = { ...state.currentFilters, offset: 0 };

      const result = await jobsService.fetchJobs(refreshFilters, userProfile);

      dispatch({ type: 'SET_JOBS', payload: result });
      
    } catch (error: any) {
      console.error('JobsContext: refreshJobs failed:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to refresh jobs' });
    }
  }, [state.currentFilters, userProfile]);

  // Update filters and fetch new results
  const updateFilters = useCallback(async (newFilters: Partial<JobFilters>): Promise<void> => {
    const updatedFilters = { ...state.currentFilters, ...newFilters };
    
    // Clear current jobs when filters change
    dispatch({ type: 'CLEAR_JOBS' });
    
    await fetchJobs(updatedFilters);
  }, [state.currentFilters, fetchJobs]);

  // Clear all filters
  const clearFilters = useCallback(async (): Promise<void> => {
    dispatch({ type: 'CLEAR_JOBS' });
    dispatch({ type: 'SET_FILTERS', payload: {} });
    await fetchJobs({});
  }, [fetchJobs]);

  // Get job by ID from current jobs list
  const getJobById = useCallback((jobId: string): Job | null => {
    return state.currentJobs.find(job => job.job_id === jobId) || null;
  }, [state.currentJobs]);

  // Search jobs with text query
  const searchJobs = useCallback(async (searchTerm: string, filters: JobFilters = {}): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      dispatch({ type: 'CLEAR_JOBS' });

      const searchFilters = { ...filters, keywords: searchTerm, offset: 0 };

      const result = await jobsService.searchJobs(searchTerm, searchFilters, userProfile);

      dispatch({ type: 'SET_JOBS', payload: result });
      dispatch({ type: 'SET_FILTERS', payload: searchFilters });
      
    } catch (error: any) {
      console.error('JobsContext: searchJobs failed:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to search jobs' });
    }
  }, [userProfile]);

  // Fetch queued jobs for user
  const fetchQueuedJobs = useCallback(async (): Promise<void> => {
    if (!userProfile?.id) {
      console.warn('JobsContext: No user profile available for fetching queued jobs');
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const jobsWithInteractions = await userJobInteractionService.getJobsWithInteractions(
        userProfile.id,
        UserJobInteractionType.QUEUED,
        20
      );

      const jobs = jobsWithInteractions.map(item => ({
        ...item,
        interaction: undefined // Remove interaction data for display
      })) as Job[];

      dispatch({ 
        type: 'SET_JOBS', 
        payload: { 
          jobs, 
          totalCount: jobs.length, 
          hasMore: jobs.length >= 20 
        } 
      });
      dispatch({ type: 'SET_FILTERS', payload: { keywords: 'queued' } });
      
    } catch (error: any) {
      console.error('JobsContext: fetchQueuedJobs failed:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to fetch queued jobs' });
    }
  }, [userProfile?.id]);

  // Add jobs to user's queue
  const addJobsToQueue = useCallback(async (jobIds: string[]): Promise<void> => {
    if (!userProfile?.id) {
      console.warn('JobsContext: No user profile available for adding jobs to queue');
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      await userJobInteractionService.addJobsToQueue(userProfile.id, jobIds);
      
      // Refresh the queued jobs after adding
      await fetchQueuedJobs();
      
    } catch (error: any) {
      console.error('JobsContext: addJobsToQueue failed:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to add jobs to queue' });
    }
  }, [userProfile?.id, fetchQueuedJobs]);

  // Mark job as applied
  const markJobAsApplied = useCallback(async (jobId: string): Promise<void> => {
    if (!userProfile?.id) {
      console.warn('JobsContext: No user profile available');
      return;
    }

    try {
      await userJobInteractionService.updateInteraction(
        userProfile.id,
        jobId,
        UserJobInteractionType.APPLIED
      );
      
    } catch (error: any) {
      console.error('JobsContext: markJobAsApplied failed:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to mark job as applied' });
    }
  }, [userProfile?.id, state.currentJobs, state.totalCount, state.hasMore]);

  // Mark job as passed
  const markJobAsPassed = useCallback(async (jobId: string): Promise<void> => {
    if (!userProfile?.id) {
      console.warn('JobsContext: No user profile available');
      return;
    }

    try {
      await userJobInteractionService.updateInteraction(
        userProfile.id,
        jobId,
        UserJobInteractionType.PASSED
      );
      
    } catch (error: any) {
      console.error('JobsContext: markJobAsPassed failed:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to mark job as passed' });
    }
  }, [userProfile?.id, state.currentJobs, state.totalCount, state.hasMore]);

  // Mark job as application failed
  const markJobAsApplicationFailed = useCallback(async (jobId: string): Promise<void> => {
    if (!userProfile?.id) {
      console.warn('JobsContext: No user profile available');
      return;
    }

    try {
      await userJobInteractionService.updateInteraction(
        userProfile.id,
        jobId,
        UserJobInteractionType.APPLICATION_FAILED
      );

      // Keep job in display but could add visual indicator
      console.log('Job marked as application failed:', jobId);
      
    } catch (error: any) {
      console.error('JobsContext: markJobAsApplicationFailed failed:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to mark job as application failed' });
    }
  }, [userProfile?.id]);

  // Clear job queue
  const clearJobQueue = useCallback(async (): Promise<void> => {
    if (!userProfile?.id) {
      console.warn('JobsContext: No user profile available');
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      await userJobInteractionService.clearInteractionsByType(
        userProfile.id,
        UserJobInteractionType.QUEUED
      );

      // Clear current jobs from state
      dispatch({ type: 'CLEAR_JOBS' });
      
    } catch (error: any) {
      console.error('JobsContext: clearJobQueue failed:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to clear job queue' });
    }
  }, [userProfile?.id]);

  // Refresh job queue with new search
  const refreshJobQueue = useCallback(async (): Promise<void> => {
    if (!userProfile?.id) {
      console.warn('JobsContext: No user profile available');
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // Clear existing queue
      await clearJobQueue();

      // Get fresh jobs that user hasn't interacted with
      const availableJobs = await userJobInteractionService.getAvailableJobs(
        userProfile.id,
        state.currentFilters,
        50
      );

      if (availableJobs.length > 0) {
        const jobIds = availableJobs.map(job => job.job_id);
        await addJobsToQueue(jobIds);
      } else {
        // No more jobs available
        dispatch({ 
          type: 'SET_JOBS', 
          payload: { jobs: [], totalCount: 0, hasMore: false } 
        });
      }
      
    } catch (error: any) {
      console.error('JobsContext: refreshJobQueue failed:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to refresh job queue' });
    }
  }, [userProfile?.id, state.currentFilters, clearJobQueue, addJobsToQueue]);

  // Get applied jobs
  const getAppliedJobs = useCallback(async (): Promise<Job[]> => {
    if (!userProfile?.id) {
      console.warn('JobsContext: No user profile available');
      return [];
    }

    try {
      const jobsWithInteractions = await userJobInteractionService.getJobsWithInteractions(
        userProfile.id,
        UserJobInteractionType.APPLIED,
        100
      );

      return jobsWithInteractions.map(item => ({
        ...item,
        interaction: undefined
      })) as Job[];
      
    } catch (error: any) {
      console.error('JobsContext: getAppliedJobs failed:', error);
      return [];
    }
  }, [userProfile?.id]);

  // Get passed jobs
  const getPassedJobs = useCallback(async (): Promise<Job[]> => {
    if (!userProfile?.id) {
      console.warn('JobsContext: No user profile available');
      return [];
    }

    try {
      const jobsWithInteractions = await userJobInteractionService.getJobsWithInteractions(
        userProfile.id,
        UserJobInteractionType.PASSED,
        100
      );

      return jobsWithInteractions.map(item => ({
        ...item,
        interaction: undefined
      })) as Job[];
      
    } catch (error: any) {
      console.error('JobsContext: getPassedJobs failed:', error);
      return [];
    }
  }, [userProfile?.id]);

  // Get user job interaction
  const getUserJobInteraction = useCallback((jobId: string): UserJobInteraction | null => {
    // This would need to be implemented with local state caching or direct service call
    // For now, return null - could be enhanced later for better performance
    return null;
  }, []);

  // Get recommended jobs for user (original method kept for compatibility)
  const fetchRecommendedJobs = useCallback(async (): Promise<void> => {
    if (!userProfile) {
      console.warn('JobsContext: No user profile available for recommendations');
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      dispatch({ type: 'CLEAR_JOBS' });

      // Get recommended jobs that user hasn't interacted with
      const availableJobs = await userJobInteractionService.getAvailableJobs(
        userProfile.id,
        {}, // No specific filters for recommendations
        20
      );

      if (availableJobs.length > 0) {
        // Add top recommendations to queue
        const topJobs = availableJobs.slice(0, 20);
        const jobIds = topJobs.map(job => job.job_id);
        await userJobInteractionService.addJobsToQueue(userProfile.id, jobIds);
        
        // Then fetch the queued jobs for display
        await fetchQueuedJobs();
      } else {
        dispatch({ 
          type: 'SET_JOBS', 
          payload: { jobs: [], totalCount: 0, hasMore: false } 
        });
      }
      
    } catch (error: any) {
      console.error('JobsContext: fetchRecommendedJobs failed:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to fetch recommended jobs' });
    }
  }, [userProfile, fetchQueuedJobs]);

  // Context value object
  const contextValue: JobsContextValue = {
    // State
    currentJobs: state.currentJobs,
    isLoading: state.isLoading,
    hasMore: state.hasMore,
    error: state.error,
    totalCount: state.totalCount,
    currentFilters: state.currentFilters,
    
    // Original actions
    fetchJobs,
    loadMoreJobs,
    refreshJobs,
    updateFilters,
    clearFilters,
    getJobById,
    searchJobs,
    fetchRecommendedJobs,
    
    // New interaction-based methods
    fetchQueuedJobs,
    addJobsToQueue,
    markJobAsApplied,
    markJobAsPassed,
    markJobAsApplicationFailed,
    clearJobQueue,
    refreshJobQueue,
    getAppliedJobs,
    getPassedJobs,
    getUserJobInteraction,
  };

  return (
    <JobsContext.Provider value={contextValue}>
      {children}
    </JobsContext.Provider>
  );
};

// Custom hook to use the jobs context
export const useJobs = (): JobsContextValue => {
  const context = useContext(JobsContext);
  if (!context) {
    throw new Error('useJobs must be used within a JobsProvider');
  }
  return context;
};

export default JobsContext;