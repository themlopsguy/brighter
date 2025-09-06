// AuthTypes.tsx

// Auth state enum - using const assertion for better type safety
export const AuthState = {
  SIGNED_OUT: 'signedOut',
  SIGNED_IN: 'signedIn',
  LOADING: 'loading'
} as const;

export type AuthStateType = typeof AuthState[keyof typeof AuthState];

// Post authentication flow enum
export const PostAuthenticationFlow = {
  DASHBOARD: 'dashboard',
  INTRO_FLOW: 'introFlow'
} as const;

export type PostAuthenticationFlowType = typeof PostAuthenticationFlow[keyof typeof PostAuthenticationFlow];

// Auth error types
export const AuthError = {
  INVALID_CREDENTIAL: 'invalidCredential',
  SIGN_IN_FAILED: 'signInFailed',
  EMAIL_CONFIRMATION_REQUIRED: 'emailConfirmationRequired',
  VERIFICATION_FAILED: 'verificationFailed',
  USER_CANCELLED: 'userCancelled',
  RESET_PASSWORD_FAILED: 'resetPasswordFailed',
  USER_NOT_FOUND: 'userNotFound',
  SESSION_DISCONTINUITY: 'sessionDiscontinuity',
  SUPABASE_ERROR: 'supabaseError'
} as const;

export type AuthErrorType = typeof AuthError[keyof typeof AuthError];

// User job interaction types
export const UserJobInteractionType = {
  QUEUED: 'queued',
  APPLIED: 'applied', 
  PASSED: 'passed',
  APPLICATION_FAILED: 'application_failed',
  EXPIRED: 'expired'
} as const;

export type UserJobInteractionTypeValue = typeof UserJobInteractionType[keyof typeof UserJobInteractionType];

// User job interaction interface
export interface UserJobInteraction {
  id: string;
  user_id: string;
  job_id: string;
  interaction_type: UserJobInteractionTypeValue;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

// Extended job interface that includes interaction data when queried together
export interface JobWithInteraction extends Job {
  interaction?: UserJobInteraction;
}

// User interface
export interface User {
  id: string;
  email?: string;
  user_metadata?: any;
  app_metadata?: any;
  created_at?: string;
  updated_at?: string;
}

// Session interface
export interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: User;
}

// Auth state interface
export interface AuthStateInterface {
  currentUser: User | null;
  userProfile: UserProfile | null;
  authState: AuthStateType;
  didSync: boolean;
  isAuthenticating: boolean;
  shouldNavigateToMain: boolean;
  postAuthFlow: PostAuthenticationFlowType | null;
}

// Auth context value interface
export interface AuthContextValue extends AuthStateInterface {
  isAuthenticated: boolean;
  setAuthState: (authState: AuthStateType) => void;
  setCurrentUser: (user: User | null) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  setPostAuthFlow: (flow: PostAuthenticationFlowType | null) => void;
  setDidSync: (didSync: boolean) => void;
  setIsAuthenticating: (isAuthenticating: boolean) => void;
  setShouldNavigateToMain: (shouldNavigate: boolean) => void;
  resetAuth: () => void;
  checkSession: () => Promise<void>;
  wasAppTerminated: () => Promise<boolean>;
  recordAppLaunchTimestamp: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithApple: () => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  syncUserProfile: (userId: string) => Promise<UserProfile | null>;
  resetPassword: (email: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

export interface UserProfile {
  id: string;
  created_at?: string;
  updated_at?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  resume_url?: string;
  resume_local_path?: string;
  title?: string;
  location?: string;
  applying_countries?: Array<{
    citizen: boolean;
    country_name: string;
    requires_sponsorship: boolean;
    work_authorization_status: boolean;
  }>;
  country_code?: string;
  phone_country?: string;
  date_of_birth?: string;
  drivers_license_number?: string;
  email?: string;
  phone_number?: string;
  age?: string;
  gender?: string;
  race?: string;
  veteran?: string;
  disability?: string;
  linkedin?: string;
  github?: string;
  x_twitter?: string;
  portfolio?: string;
  experiences?: any[];
  education?: any[];
  projects?: any[];
  interview_language?: string;
  prepscore?: number;
  interview_count?: number;
  successful_applications?: number;
  failed_applications?: number;
  swipes_available?: number;
  gift_available?: boolean;
  referral_code?: string;
  partner_code?: string;
  creator_code?: string;
  referrer_first_name?: string;
  skills?: string[];
  exams?: string[];
  certifications?: string[];
  languages?: string[];
  awards?: string[];
  interests?: string[];
  relevant_coursework?: string[];
  onboarding_completed?: boolean;
  intro_completed?: boolean
  rating?: string;
  title_requests?: string[];
}

export interface Job {
  job_id: string;
  company_name: string;
  job_title: string;
  job_location?: string;
  date_posted: string; // ISO date string
  date_validthru?: string; // ISO date string
  salary_min?: string;
  salary_max?: string;
  salary_currency?: string;
  salary_time?: string;
  employment_type?: string;
  remote?: boolean;
  url?: string;
  source?: string;
  logo_url?: string;
  description?: string;
  experience?: string;
  education?: string;
  industry?: string;
  short_summary?: string;
  requirements?: string[];
  preferences?: string[];
  restrictions?: string[];
  additional_info?: string[];
  work_arrangement?: string;
}

// Job filter interface for search/filtering
export interface JobFilters {
  location?: string;
  remote?: boolean;
  industry?: string;
  employment_type?: string;
  salary_min?: string;
  experience?: string;
  education?: string;
  keywords?: string;
  limit?: number;
  offset?: number;
}

// Job context state interface
export interface JobsContextValue {
  // State
  currentJobs: Job[];
  isLoading: boolean;
  hasMore: boolean;
  error: string | null;
  totalCount: number;
  currentFilters: JobFilters;
  
  // Actions
  fetchJobs: (filters?: JobFilters) => Promise<void>;
  loadMoreJobs: () => Promise<void>;
  refreshJobs: () => Promise<void>;
  updateFilters: (filters: Partial<JobFilters>) => void;
  clearFilters: () => void;
  getJobById: (jobId: string) => Job | null;
  searchJobs: (searchTerm: string, filters?: JobFilters) => Promise<void>;
  fetchRecommendedJobs: () => Promise<void>;

  // New interaction-based methods
  fetchQueuedJobs: () => Promise<void>;
  addJobsToQueue: (jobIds: string[]) => Promise<void>;
  markJobAsApplied: (jobId: string) => Promise<void>;
  markJobAsPassed: (jobId: string) => Promise<void>;
  markJobAsApplicationFailed: (jobId: string) => Promise<void>;
  clearJobQueue: () => Promise<void>;
  refreshJobQueue: () => Promise<void>;
  
  // Interaction history methods
  getAppliedJobs: () => Promise<Job[]>;
  getPassedJobs: () => Promise<Job[]>;
  getUserJobInteraction: (jobId: string) => UserJobInteraction | null;
}