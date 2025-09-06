// services/JobsService.tsx
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Job, JobFilters, UserProfile } from './AuthTypes';
import config from '@/constants/Config';

const supabaseClient = createClient(config.supabaseUrl, config.supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

class JobsService {
  private readonly DEFAULT_LIMIT = 20;
  private readonly MAX_LIMIT = 100;

  /**
   * Fetch jobs with filters - returns paginated results
   */
  async fetchJobs(
    filters: JobFilters = {},
    userProfile?: UserProfile | null
  ): Promise<{ jobs: Job[]; totalCount: number; hasMore: boolean }> {
    try {
      let query = supabaseClient
        .from('jobs')
        .select('*', { count: 'exact' })
        .order('date_posted', { ascending: false });

      // Apply filters
      query = this.applyFilters(query, filters, userProfile);

      // Apply pagination
      const limit = Math.min(filters.limit || this.DEFAULT_LIMIT, this.MAX_LIMIT);
      const offset = filters.offset || 0;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching jobs:', error);
        throw error;
      }

      const jobs = (data || []) as Job[];
      const totalCount = count || 0;
      const hasMore = offset + jobs.length < totalCount;

      return { jobs, totalCount, hasMore };
    } catch (error: any) {
      console.error('JobsService: fetchJobs failed:', error);
      throw error;
    }
  }

  /**
   * Get a single job by ID
   */
  async getJobById(jobId: string): Promise<Job | null> {
    try {
      const { data, error } = await supabaseClient
        .from('jobs')
        .select('*')
        .eq('job_id', jobId)
        .single();

      if (error) {
        console.error('Error fetching job by ID:', error);
        throw error;
      }

      return data as Job;
    } catch (error: any) {
      console.error('JobsService: getJobById failed:', error);
      throw error;
    }
  }

  /**
   * Search jobs with text search across multiple fields
   */
  async searchJobs(
    searchTerm: string,
    filters: JobFilters = {},
    userProfile?: UserProfile | null
  ): Promise<{ jobs: Job[]; totalCount: number; hasMore: boolean }> {
    try {
      // Use Supabase full-text search or ilike for partial matches
      let query = supabaseClient
        .from('jobs')
        .select('*', { count: 'exact' })
        .or(`job_title.ilike.%${searchTerm}%,company_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order('date_posted', { ascending: false });

      // Apply additional filters
      query = this.applyFilters(query, { ...filters, keywords: searchTerm }, userProfile);

      // Apply pagination
      const limit = Math.min(filters.limit || this.DEFAULT_LIMIT, this.MAX_LIMIT);
      const offset = filters.offset || 0;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('Error searching jobs:', error);
        throw error;
      }

      const jobs = (data || []) as Job[];
      const totalCount = count || 0;
      const hasMore = offset + jobs.length < totalCount;

      return { jobs, totalCount, hasMore };
    } catch (error: any) {
      console.error('JobsService: searchJobs failed:', error);
      throw error;
    }
  }

  /**
   * Get personalized job recommendations for a user
   */
  async getRecommendedJobs(
    userProfile: UserProfile,
    limit: number = 20
  ): Promise<{ jobs: Job[]; totalCount: number }> {
    try {
      let query = supabaseClient
        .from('jobs')
        .select('*', { count: 'exact' })
        .order('date_posted', { ascending: false });

      // Apply user-based filtering
      if (userProfile.applying_countries && userProfile.applying_countries.length > 0) {
        const countries = userProfile.applying_countries.map(c => c.country_name);
        query = query.or(
          `job_location.in.(${countries.join(',')}),remote.eq.true`
        );
      }

      if (userProfile.location) {
        query = query.or(`job_location.ilike.%${userProfile.location}%,remote.eq.true`);
      }

      // Filter by experience level if available
      if (userProfile.experiences && userProfile.experiences.length > 0) {
        // This would need custom logic based on how you store experience data
      }

      query = query.limit(limit);

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching recommended jobs:', error);
        throw error;
      }

      return {
        jobs: (data || []) as Job[],
        totalCount: count || 0
      };
    } catch (error: any) {
      console.error('JobsService: getRecommendedJobs failed:', error);
      throw error;
    }
  }

  /**
   * Apply filters to the query
   */
  private applyFilters(
    query: any,
    filters: JobFilters,
    userProfile?: UserProfile | null
  ) {
    // Location filter
    if (filters.location) {
      query = query.ilike('job_location', `%${filters.location}%`);
    }

    // Remote filter
    if (filters.remote !== undefined) {
      query = query.eq('remote', filters.remote);
    }

    // Industry filter
    if (filters.industry) {
      query = query.eq('industry', filters.industry);
    }

    // Employment type filter
    if (filters.employment_type) {
      query = query.eq('employment_type', filters.employment_type);
    }

    // Experience filter
    if (filters.experience) {
      query = query.eq('experience', filters.experience);
    }

    // Education filter
    if (filters.education) {
      query = query.eq('education', filters.education);
    }

    // Salary filter
    if (filters.salary_min) {
      // This might need custom logic depending on how salary is stored
      query = query.gte('salary_min', filters.salary_min);
    }

    // Filter out expired jobs
    const today = new Date().toISOString().split('T')[0];
    query = query.or(`date_validthru.is.null,date_validthru.gte.${today}`);

    return query;
  }

  /**
   * Get available filter options (for dropdowns, etc.)
   */
  async getFilterOptions(): Promise<{
    industries: string[];
    locations: string[];
    employmentTypes: string[];
    experienceLevels: string[];
    educationLevels: string[];
  }> {
    try {
      const [industries, locations, employmentTypes, experienceLevels, educationLevels] = await Promise.all([
        this.getDistinctValues('industry'),
        this.getDistinctValues('job_location'),
        this.getDistinctValues('employment_type'),
        this.getDistinctValues('experience'),
        this.getDistinctValues('education'),
      ]);

      return {
        industries: industries.filter(Boolean),
        locations: locations.filter(Boolean),
        employmentTypes: employmentTypes.filter(Boolean),
        experienceLevels: experienceLevels.filter(Boolean),
        educationLevels: educationLevels.filter(Boolean),
      };
    } catch (error: any) {
      console.error('JobsService: getFilterOptions failed:', error);
      throw error;
    }
  }

  /**
   * Get distinct values for a column (helper method)
   */
  private async getDistinctValues(column: string): Promise<string[]> {
    const { data, error } = await supabaseClient
      .from('jobs')
      .select(column)
      .not(column, 'is', null)
      .order(column);

    if (error) {
      console.error(`Error fetching distinct ${column}:`, error);
      return [];
    }

    const values = Array.from(new Set(data?.map(item => item[column]) || []));
    return values;
  }
}

// Create singleton instance
const jobsServiceInstance = new JobsService();

export default jobsServiceInstance;
export { JobsService };