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
  title?: string;
  location?: string;
  countries?: any;
  date_of_birth?: string;
  drivers_license_number?: string;
  email?: string;
  phone_number?: string;
  age?: number;
  gender?: string;
  race?: string;
  veteran?: boolean;
  disability?: boolean;
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
  skills?: string[];
  exams?: string[];
  certifications?: string[];
  languages?: string[];
  awards?: string[];
  interests?: string[];
  relevant_coursework?: string[];
  onboarding_completed?: boolean;
}