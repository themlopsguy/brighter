// services/UserJobInteractionService.tsx
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  UserJobInteraction, 
  UserJobInteractionType, 
  UserJobInteractionTypeValue,
  Job,
  JobWithInteraction 
} from './AuthTypes';
import config from '@/constants/Config';

const supabaseClient = createClient(config.supabaseUrl, config.supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

class UserJobInteractionService {
  
  /**
   * Add a single job interaction
   */
  async addInteraction(
    userId: string,
    jobId: string,
    interactionType: UserJobInteractionTypeValue
  ): Promise<UserJobInteraction> {
    try {
      const { data, error } = await supabaseClient
        .from('user_job_interactions')
        .insert({
          user_id: userId,
          job_id: jobId,
          interaction_type: interactionType
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding job interaction:', error);
        throw error;
      }

      return data as UserJobInteraction;
    } catch (error: any) {
      console.error('UserJobInteractionService: addInteraction failed:', error);
      throw error;
    }
  }

  /**
   * Bulk add multiple jobs to queue
   */
  async addJobsToQueue(userId: string, jobIds: string[]): Promise<UserJobInteraction[]> {
    try {
      const interactions = jobIds.map(jobId => ({
        user_id: userId,
        job_id: jobId,
        interaction_type: UserJobInteractionType.QUEUED
      }));

      const { data, error } = await supabaseClient
        .from('user_job_interactions')
        .insert(interactions)
        .select();

      if (error) {
        console.error('Error bulk adding jobs to queue:', error);
        throw error;
      }

      return (data || []) as UserJobInteraction[];
    } catch (error: any) {
      console.error('UserJobInteractionService: addJobsToQueue failed:', error);
      throw error;
    }
  }

  /**
   * Update an existing interaction type (e.g., queued -> applied)
   */
  async updateInteraction(
    userId: string,
    jobId: string,
    newInteractionType: UserJobInteractionTypeValue
  ): Promise<UserJobInteraction> {
    try {
      // First, try to update existing interaction
      const { data: updateData, error: updateError } = await supabaseClient
        .from('user_job_interactions')
        .update({ 
          interaction_type: newInteractionType,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('job_id', jobId)
        .select()
        .single();

      if (updateError && updateError.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error updating job interaction:', updateError);
        throw updateError;
      }

      // If no existing interaction found, create new one
      if (!updateData) {
        return await this.addInteraction(userId, jobId, newInteractionType);
      }

      return updateData as UserJobInteraction;
    } catch (error: any) {
      console.error('UserJobInteractionService: updateInteraction failed:', error);
      throw error;
    }
  }

  /**
   * Get all interactions for a user by type
   */
  async getInteractionsByType(
    userId: string,
    interactionType: UserJobInteractionTypeValue,
    limit?: number
  ): Promise<UserJobInteraction[]> {
    try {
      let query = supabaseClient
        .from('user_job_interactions')
        .select('*')
        .eq('user_id', userId)
        .eq('interaction_type', interactionType)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching interactions by type:', error);
        throw error;
      }

      return (data || []) as UserJobInteraction[];
    } catch (error: any) {
      console.error('UserJobInteractionService: getInteractionsByType failed:', error);
      throw error;
    }
  }

  /**
   * Get jobs with their interaction data for a user
   */
  async getJobsWithInteractions(
    userId: string,
    interactionType: UserJobInteractionTypeValue,
    limit: number = 20
  ): Promise<JobWithInteraction[]> {
    try {
      const { data, error } = await supabaseClient
        .from('user_job_interactions')
        .select(`
          *,
          jobs (*)
        `)
        .eq('user_id', userId)
        .eq('interaction_type', interactionType)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching jobs with interactions:', error);
        throw error;
      }

      // Transform the data to match JobWithInteraction interface
      const jobsWithInteractions = (data || []).map((item: any) => ({
        ...item.jobs,
        interaction: {
          id: item.id,
          user_id: item.user_id,
          job_id: item.job_id,
          interaction_type: item.interaction_type,
          created_at: item.created_at,
          updated_at: item.updated_at
        }
      }));

      return jobsWithInteractions as JobWithInteraction[];
    } catch (error: any) {
      console.error('UserJobInteractionService: getJobsWithInteractions failed:', error);
      throw error;
    }
  }

  /**
   * Check if user has specific interaction with a job
   */
  async getUserJobInteraction(
    userId: string,
    jobId: string,
    interactionType?: UserJobInteractionTypeValue
  ): Promise<UserJobInteraction | null> {
    try {
      let query = supabaseClient
        .from('user_job_interactions')
        .select('*')
        .eq('user_id', userId)
        .eq('job_id', jobId);

      if (interactionType) {
        query = query.eq('interaction_type', interactionType);
      }

      const { data, error } = await query.single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error checking user job interaction:', error);
        throw error;
      }

      return data as UserJobInteraction | null;
    } catch (error: any) {
      console.error('UserJobInteractionService: getUserJobInteraction failed:', error);
      throw error;
    }
  }

  /**
   * Clear all interactions of a specific type for a user
   */
  async clearInteractionsByType(
    userId: string,
    interactionType: UserJobInteractionTypeValue
  ): Promise<void> {
    try {
      const { error } = await supabaseClient
        .from('user_job_interactions')
        .delete()
        .eq('user_id', userId)
        .eq('interaction_type', interactionType);

      if (error) {
        console.error('Error clearing interactions:', error);
        throw error;
      }

      console.log(`Cleared all ${interactionType} interactions for user ${userId}`);
    } catch (error: any) {
      console.error('UserJobInteractionService: clearInteractionsByType failed:', error);
      throw error;
    }
  }

  /**
   * Get jobs that user hasn't interacted with (for fresh searches)
   */
  async getAvailableJobs(
    userId: string,
    filters: any = {},
    limit: number = 20
  ): Promise<Job[]> {
    try {
      // First get all job IDs user has interacted with
      const { data: interactions, error: interactionError } = await supabaseClient
        .from('user_job_interactions')
        .select('job_id')
        .eq('user_id', userId);

      if (interactionError) {
        console.error('Error fetching user interactions:', interactionError);
        throw interactionError;
      }

      const interactedJobIds = (interactions || []).map(i => i.job_id);

      // Query jobs excluding ones user has interacted with
      let jobQuery = supabaseClient
        .from('jobs')
        .select('*')
        .order('date_posted', { ascending: false })
        .limit(limit);

      // Exclude jobs user has already interacted with
      if (interactedJobIds.length > 0) {
        jobQuery = jobQuery.not('job_id', 'in', `(${interactedJobIds.join(',')})`);
      }

      // Apply additional filters if provided
      if (filters.location) {
        jobQuery = jobQuery.ilike('job_location', `%${filters.location}%`);
      }
      if (filters.remote !== undefined) {
        jobQuery = jobQuery.eq('remote', filters.remote);
      }
      if (filters.industry) {
        jobQuery = jobQuery.eq('industry', filters.industry);
      }

      // Filter out expired jobs
      const today = new Date().toISOString().split('T')[0];
      jobQuery = jobQuery.or(`date_validthru.is.null,date_validthru.gte.${today}`);

      const { data: jobs, error: jobError } = await jobQuery;

      if (jobError) {
        console.error('Error fetching available jobs:', jobError);
        throw jobError;
      }

      return (jobs || []) as Job[];
    } catch (error: any) {
      console.error('UserJobInteractionService: getAvailableJobs failed:', error);
      throw error;
    }
  }

    // Add these methods to your UserJobInteractionService class

    /**
     * Search jobs using PostgreSQL full-text search with title requests
     */
    async searchJobsByTitleRequests(
    userId: string,
    titleRequests: string[],
    limit: number = 50
    ): Promise<Job[]> {
    try {
        // Convert title requests into search terms
        const searchTerms = titleRequests
        .map(title => title.trim().toLowerCase())
        .filter(title => title.length > 0);

        if (searchTerms.length === 0) {
        return [];
        }

        // Create OR query for multiple titles: "software engineer" | "data analyst" | "product manager"
        const tsqueryString = searchTerms
        .map(term => {
            // Replace spaces with & for phrase matching
            return `"${term.replace(/\s+/g, ' & ')}"`;
        })
        .join(' | ');

        console.log('Full-text search query:', tsqueryString);

        // Get job IDs user has already interacted with to exclude them
        const { data: interactions, error: interactionError } = await supabaseClient
        .from('user_job_interactions')
        .select('job_id')
        .eq('user_id', userId);

        if (interactionError) {
        console.error('Error fetching user interactions:', interactionError);
        throw interactionError;
        }

        const interactedJobIds = (interactions || []).map(i => i.job_id);

        // Build the full-text search query
        let query = supabaseClient
        .from('jobs')
        .select(`
            *,
            ts_rank(
            to_tsvector('english', coalesce(job_title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(short_summary, '')),
            to_tsquery('english', $1)
            ) as relevance_score
        `)
        .textSearch('job_title,description,short_summary', tsqueryString, {
            type: 'websearch',
            config: 'english'
        });

        // Exclude jobs user has already interacted with
        if (interactedJobIds.length > 0) {
        query = query.not('job_id', 'in', `(${interactedJobIds.join(',')})`);
        }

        // Filter out expired jobs
        const today = new Date().toISOString().split('T')[0];
        query = query.or(`date_validthru.is.null,date_validthru.gte.${today}`);

        // Order by relevance score and limit results
        query = query.order('relevance_score', { ascending: false }).limit(limit);

        const { data: jobs, error: jobError } = await query;

        if (jobError) {
        console.error('Error in full-text search:', jobError);
        throw jobError;
        }

        return (jobs || []) as Job[];
    } catch (error: any) {
        console.error('UserJobInteractionService: searchJobsByTitleRequests failed:', error);
        throw error;
    }
    }

    /**
     * Get jobs filtered by user profile (location, countries, etc.) when no title requests
     */
    async getJobsByUserProfile(
    userId: string,
    userProfile: any,
    limit: number = 50
    ): Promise<Job[]> {
    try {
        // Get job IDs user has already interacted with to exclude them
        const { data: interactions, error: interactionError } = await supabaseClient
        .from('user_job_interactions')
        .select('job_id')
        .eq('user_id', userId);

        if (interactionError) {
        console.error('Error fetching user interactions:', interactionError);
        throw interactionError;
        }

        const interactedJobIds = (interactions || []).map(i => i.job_id);

        // Build location-based query
        let query = supabaseClient
        .from('jobs')
        .select('*')
        .order('date_posted', { ascending: false })
        .limit(limit);

        // Exclude jobs user has already interacted with
        if (interactedJobIds.length > 0) {
        query = query.not('job_id', 'in', `(${interactedJobIds.join(',')})`);
        }

        // Location filtering
        if (userProfile.applying_countries && userProfile.applying_countries.length > 0) {
        const countries = userProfile.applying_countries.map((c: any) => c.country_name);
        const locationConditions = countries.map(country => `job_location.ilike.%${country}%`);
        
        // Include remote jobs OR jobs in applying countries
        query = query.or(`remote.eq.true,${locationConditions.join(',')}`);
        } else if (userProfile.location) {
        // Fallback to user's current location + remote jobs
        query = query.or(`job_location.ilike.%${userProfile.location}%,remote.eq.true`);
        } else {
        // If no location info, show remote jobs only
        query = query.eq('remote', true);
        }

        // Filter out expired jobs
        const today = new Date().toISOString().split('T')[0];
        query = query.or(`date_validthru.is.null,date_validthru.gte.${today}`);

        const { data: jobs, error: jobError } = await query;

        if (jobError) {
        console.error('Error fetching jobs by user profile:', jobError);
        throw jobError;
        }

        return (jobs || []) as Job[];
    } catch (error: any) {
        console.error('UserJobInteractionService: getJobsByUserProfile failed:', error);
        throw error;
    }
    }

    /**
     * Main method to get recommended jobs (combines both strategies)
     */
    async getRecommendedJobsForUser(
    userId: string,
    userProfile: any,
    limit: number = 50
    ): Promise<Job[]> {
    try {
        let jobs: Job[] = [];

        // Check if user has title requests from resume parsing
        if (userProfile.title_requests && Array.isArray(userProfile.title_requests) && userProfile.title_requests.length > 0) {
        console.log('Using title-based job search for user:', userId);
        jobs = await this.searchJobsByTitleRequests(userId, userProfile.title_requests, limit);
        
        // If title search doesn't return enough results, supplement with profile-based search
        if (jobs.length < Math.floor(limit / 2)) {
            console.log('Supplementing with profile-based search');
            const supplementJobs = await this.getJobsByUserProfile(userId, userProfile, limit - jobs.length);
            jobs = [...jobs, ...supplementJobs];
        }
        } else {
        console.log('Using profile-based job search for user:', userId);
        jobs = await this.getJobsByUserProfile(userId, userProfile, limit);
        }

        // Remove duplicates based on job_id
        const uniqueJobs = jobs.filter((job, index, self) => 
        index === self.findIndex(j => j.job_id === job.job_id)
        );

        return uniqueJobs.slice(0, limit);
    } catch (error: any) {
        console.error('UserJobInteractionService: getRecommendedJobsForUser failed:', error);
        throw error;
    }
    }

  /**
   * Get interaction statistics for a user
   */
  async getUserInteractionStats(userId: string): Promise<{
    queued: number;
    applied: number;
    passed: number;
    application_failed: number;
    expired: number;
  }> {
    try {
      const { data, error } = await supabaseClient
        .from('user_job_interactions')
        .select('interaction_type')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user interaction stats:', error);
        throw error;
      }

      const stats = {
        queued: 0,
        applied: 0,
        passed: 0,
        application_failed: 0,
        expired: 0
      };

      (data || []).forEach((interaction: { interaction_type: string }) => {
        if (interaction.interaction_type in stats) {
          stats[interaction.interaction_type as keyof typeof stats]++;
        }
      });

      return stats;
    } catch (error: any) {
      console.error('UserJobInteractionService: getUserInteractionStats failed:', error);
      throw error;
    }
  }
}

// Create singleton instance
const userJobInteractionServiceInstance = new UserJobInteractionService();

export default userJobInteractionServiceInstance;
export { UserJobInteractionService };