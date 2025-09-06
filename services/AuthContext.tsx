import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  AuthState, 
  AuthStateType, 
  PostAuthenticationFlowType, 
  AuthError, 
  AuthStateInterface, 
  AuthContextValue,
  User,
  Session,
  UserProfile
} from './AuthTypes';
import authService from './AuthService';
import appleSignInService from './AppleSignInService';
import googleSignInService from './GoogleSignInService';
import { createClient } from '@supabase/supabase-js';
import config from '@/constants/Config';
import { router } from 'expo-router';

const supabaseClient = createClient(config.supabaseUrl, config.supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Create the auth context
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Initial state
const initialState: AuthStateInterface = {
  currentUser: null,
  userProfile: null,
  authState: AuthState.LOADING,
  didSync: false,
  isAuthenticating: false,
  shouldNavigateToMain: false,
  postAuthFlow: null,
};

// Storage keys
const STORAGE_KEYS = {
  SESSION_ID: 'current_session_id',
  APP_LAUNCH_TIMESTAMP: 'app_launch_timestamp',
  PREVIOUS_LAUNCH_TIMESTAMP: 'previous_launch_timestamp',
  LAST_APP_OPEN_TIMESTAMP: 'lastAppOpenTimestamp',
};

// Action types
type AuthAction = 
  | { type: 'SET_AUTH_STATE'; payload: AuthStateType }
  | { type: 'SET_CURRENT_USER'; payload: User | null }
  | { type: 'SET_USER_PROFILE'; payload: UserProfile | null }
  | { type: 'SET_POST_AUTH_FLOW'; payload: PostAuthenticationFlowType | null }
  | { type: 'SET_DID_SYNC'; payload: boolean }
  | { type: 'SET_IS_AUTHENTICATING'; payload: boolean }
  | { type: 'SET_SHOULD_NAVIGATE_TO_MAIN'; payload: boolean }
  | { type: 'RESET_AUTH' };

// Reducer function
const authReducer = (state: AuthStateInterface, action: AuthAction): AuthStateInterface => {
  switch (action.type) {
    case 'SET_AUTH_STATE':
      return { ...state, authState: action.payload };
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };
    case 'SET_USER_PROFILE':
      return { ...state, userProfile: action.payload };
    case 'SET_POST_AUTH_FLOW':
      return { ...state, postAuthFlow: action.payload };
    case 'SET_DID_SYNC':
      return { ...state, didSync: action.payload };
    case 'SET_IS_AUTHENTICATING':
      return { ...state, isAuthenticating: action.payload };
    case 'SET_SHOULD_NAVIGATE_TO_MAIN':
      return { ...state, shouldNavigateToMain: action.payload };
    case 'RESET_AUTH':
      return { ...initialState, authState: AuthState.SIGNED_OUT };
    default:
      return state;
  }
};

// AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Helper functions to update state
  const setAuthState = (authState: AuthStateType) => {
    dispatch({ type: 'SET_AUTH_STATE', payload: authState });
  };

  const setCurrentUser = (user: User | null) => {
    dispatch({ type: 'SET_CURRENT_USER', payload: user });
  };

  const setUserProfile = (profile: UserProfile | null) => {
    dispatch({ type: 'SET_USER_PROFILE', payload: profile });
  };

  const setPostAuthFlow = (flow: PostAuthenticationFlowType | null) => {
    dispatch({ type: 'SET_POST_AUTH_FLOW', payload: flow });
  };

  const setDidSync = (didSync: boolean) => {
    dispatch({ type: 'SET_DID_SYNC', payload: didSync });
  };

  const setIsAuthenticating = (isAuthenticating: boolean) => {
    dispatch({ type: 'SET_IS_AUTHENTICATING', payload: isAuthenticating });
  };

  const setShouldNavigateToMain = (shouldNavigate: boolean) => {
    dispatch({ type: 'SET_SHOULD_NAVIGATE_TO_MAIN', payload: shouldNavigate });
  };

  const resetAuth = () => {
    dispatch({ type: 'SET_CURRENT_USER', payload: null });
    dispatch({ type: 'SET_USER_PROFILE', payload: null }); // Add this line
    dispatch({ type: 'SET_AUTH_STATE', payload: AuthState.SIGNED_OUT });
    dispatch({ type: 'SET_POST_AUTH_FLOW', payload: null });
    dispatch({ type: 'SET_DID_SYNC', payload: false });
    dispatch({ type: 'SET_IS_AUTHENTICATING', payload: false });
    dispatch({ type: 'SET_SHOULD_NAVIGATE_TO_MAIN', payload: false });
  };

  // Computed properties
  const isAuthenticated = state.currentUser !== null;

  // Timestamp management functions
  const recordAppLaunchTimestamp = async (): Promise<void> => {
    try {
      const now = Date.now();
      
      const currentTimestamp = await AsyncStorage.getItem(STORAGE_KEYS.APP_LAUNCH_TIMESTAMP);
      if (currentTimestamp) {
        await AsyncStorage.setItem(STORAGE_KEYS.PREVIOUS_LAUNCH_TIMESTAMP, currentTimestamp);
      }
      
      await AsyncStorage.setItem(STORAGE_KEYS.APP_LAUNCH_TIMESTAMP, now.toString());
    } catch (error: any) {
      console.error('Failed to record app launch timestamp:', error);
    }
  };

  const wasAppTerminated = async (): Promise<boolean> => {
    try {
      const previousTimestamp = await AsyncStorage.getItem(STORAGE_KEYS.PREVIOUS_LAUNCH_TIMESTAMP);
      const lastActiveTimestamp = await AsyncStorage.getItem(STORAGE_KEYS.LAST_APP_OPEN_TIMESTAMP);
      
      if (!previousTimestamp) {
        return false;
      }
      
      if (!lastActiveTimestamp) {
        return true;
      }
      
      const timeSinceLastActive = (Date.now() - parseInt(lastActiveTimestamp)) / 1000;
      console.log('DEBUG: Time since last active:', timeSinceLastActive, 'seconds');
      
      return timeSinceLastActive > 60;
    } catch (error: any) {
      console.error('Failed to check app termination:', error);
      return false;
    }
  };

  // Initialize auth service on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await recordAppLaunchTimestamp();
        await checkSession();
      } catch (error: any) {
        console.log('No existing session:', error);
        setAuthState(AuthState.SIGNED_OUT);
      }
    };

    initializeAuth();
  }, []);

    // Session check function
    const checkSession = async (): Promise<void> => {
    try {
        setAuthState(AuthState.LOADING);
        
        const session = await authService.getCurrentSession();

        if (!session || !session.user) {
        setAuthState(AuthState.SIGNED_OUT);
        return;
        }

        const validatedSession = await authService.validateSession(session);
        
        setCurrentUser(validatedSession.user);
        
        // Sync profile data for existing session
        const profile = await syncUserProfile(validatedSession.user.id);
        
        setDidSync(true);
        setAuthState(AuthState.SIGNED_IN);
        
        console.log('DEBUG: Session check completed successfully with profile sync');
        
    } catch (error: any) {
        setAuthState(AuthState.SIGNED_OUT);
        throw error;
    }
    };

    const signIn = async (email: string, password: string): Promise<void> => {
    try {
        setIsAuthenticating(true);
        setAuthState(AuthState.LOADING);
        
        const result = await authService.signIn(email, password);
        
        if (result?.user) {
        setCurrentUser(result.user);
        
        // Sync profile data after setting user
        const profile = await syncUserProfile(result.user.id);
        
        setAuthState(AuthState.SIGNED_IN);
        console.log('DEBUG: Sign in completed, profile synced');
        }
        
    } catch (error: any) {
        setAuthState(AuthState.SIGNED_OUT);
        throw error;
    } finally {
        setIsAuthenticating(false);
    }
    };

    const signUp = async (email: string, password: string): Promise<void> => {
    try {
        setIsAuthenticating(true);
        setAuthState(AuthState.LOADING);
        
        const result = await authService.signUp(email, password);
        
        if (result?.user) {
        setCurrentUser(result.user);
        
        // Sync profile data after setting user (will have defaults for new user)
        const profile = await syncUserProfile(result.user.id);
        
        setAuthState(AuthState.SIGNED_IN);
        console.log('DEBUG: Sign up completed, profile synced');
        }
        
    } catch (error: any) {
        setAuthState(AuthState.SIGNED_OUT);
        throw error;
    } finally {
        setIsAuthenticating(false);
    }
    };

    // Apple Sign In method
    const signInWithApple = async (): Promise<boolean> => {
    try {
        setIsAuthenticating(true);
        setAuthState(AuthState.LOADING);
        
        const appleCredential = await appleSignInService.signInWithApple();
        
        // Sign in with Supabase using the Apple ID token
        const { data, error } = await supabaseClient.auth.signInWithIdToken({
        provider: 'apple',
        token: appleCredential.idToken,
        nonce: appleCredential.nonce,
        });
        
        if (error) {
        console.log('DEBUG: Supabase Apple Sign In failed:', error);
        throw error;
        }
        
        if (data?.user) {
        setCurrentUser(data.user);
        
        // Sync profile data after setting user
        const profile = await syncUserProfile(data.user.id);
        
        setAuthState(AuthState.SIGNED_IN);
        console.log('DEBUG: Apple Sign In successful, user:', data.user.id);
        return true;
        }
        
        throw new Error('No user returned from Supabase');
        
    } catch (error: any) {
        console.log('DEBUG: Apple Sign In failed:', error);
        setAuthState(AuthState.SIGNED_OUT);
        
        if (error.message === AuthError.USER_CANCELLED) {
        return false;
        }
        
        throw error;
    } finally {
        setIsAuthenticating(false);
    }
    };

    const signInWithGoogle = async (): Promise<boolean> => {
    try {
        setIsAuthenticating(true);
        setAuthState(AuthState.LOADING);
        
        const googleCredential = await googleSignInService.signInWithGoogle();
        
        // Sign in with Supabase using the Google ID token (no nonce for official library)
        const { data, error } = await supabaseClient.auth.signInWithIdToken({
        provider: 'google',
        token: googleCredential.idToken,
        // Don't pass nonce - the official Google library doesn't provide one
        });
        
        if (error) {
        console.log('DEBUG: Supabase Google Sign In failed:', error);
        throw error;
        }
        
        if (data?.user) {
        setCurrentUser(data.user);
        
        // Sync profile data after setting user
        const profile = await syncUserProfile(data.user.id);
        
        setAuthState(AuthState.SIGNED_IN);
        console.log('DEBUG: Google Sign In successful, user:', data.user.id);
        return true;
        }
        
        throw new Error('No user returned from Supabase');
        
    } catch (error: any) {
        console.log('DEBUG: Google Sign In failed:', error);
        setAuthState(AuthState.SIGNED_OUT);
        
        if (error.message === AuthError.USER_CANCELLED) {
        return false;
        }
        
        throw error;
    } finally {
        setIsAuthenticating(false);
    }
    };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (state.userProfile && state.currentUser) {
      // Update local state with all fields
      const updatedProfile = { ...state.userProfile, ...updates };
      setUserProfile(updatedProfile);
      
      // Define fields that exist in Supabase profiles table
      const supabaseFields = new Set([
        'first_name', 'middle_name', 'last_name', 'title', 'location', 
        'applying_countries', 'date_of_birth', 'drivers_license_number', 
        'email', 'phone_number', 'age', 'gender', 'race', 'veteran', 
        'disability', 'linkedin', 'github', 'x_twitter', 'portfolio', 
        'experiences', 'education', 'projects', 'interview_language', 
        'prepscore', 'interview_count', 'successful_applications', 
        'failed_applications', 'swipes_available', 'gift_available', 
        'referral_code', 'partner_code', 'creator_code', 'skills', 
        'exams', 'certifications', 'languages', 'awards', 'interests', 
        'relevant_coursework', 'onboarding_completed', 'country_code', 
        'phone_country', 'resume_url', 'intro_completed', 'title_requests'
      ]);
      
      // Filter updates to only include Supabase fields
      const supabaseUpdates = Object.fromEntries(
        Object.entries(updates).filter(([key]) => supabaseFields.has(key))
      );
      
      // Only sync to Supabase if there are valid fields to update
      if (Object.keys(supabaseUpdates).length > 0) {
        try {
          const { error } = await supabaseClient
            .from('profiles')
            .update(supabaseUpdates)
            .eq('id', state.currentUser.id);
          
          if (error) {
            console.error('Failed to update profile in Supabase:', error);
          }
        } catch (error) {
          console.error('Error updating profile:', error);
        }
      }
    }
  };

    const syncUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
        console.log('DEBUG: Syncing user profile for:', userId);
        
        const { data: profile, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
        if (error) {
        console.log('DEBUG: Profile sync failed:', error);
        throw error;
        }
        
        if (profile) {
        setUserProfile(profile);
        console.log('DEBUG: Profile synced successfully, onboarding_completed:', profile.onboarding_completed);
        
        // Navigate based on onboarding status (only once per sync)
        setTimeout(() => {
          if (profile.onboarding_completed) {
            router.push('/(tabs)/apply');
          } else if (profile.intro_completed) {
            const firstIncompleteStep = findFirstIncompleteStep(profile);
            router.push(`/onboarding/${firstIncompleteStep}`);
          } else {
            router.push('/intro');
          }
        }, 100);
        
        return profile;
        }
        
        return null;
    } catch (error: any) {
        console.log('DEBUG: Error syncing profile:', error);
        throw error;
    }
    };

  // Helper function to find first incomplete step
  const findFirstIncompleteStep = (profile: UserProfile): string => {
    const stepOrder = [
      'firstName', 'lastName', 'email', 'phoneNumber', 'gender', 'race', 
      'veteranStatus', 'disabilityStatus', 'age', 'countries', 'location', 
      'rating', 'resume', 'referral'
    ];
    
    const isStepComplete = (step: string): boolean => {
      switch (step) {
        case 'firstName': 
          return (profile.first_name || '').trim().length > 0;
        case 'lastName': 
          return (profile.last_name || '').trim().length > 0;
        case 'email': 
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email || '');
        case 'phoneNumber': 
          return (profile.phone_number || '').replace(/\D/g, '').length >= 10;
        case 'gender': 
          return (profile.gender || '').trim().length > 0;
        case 'race': 
          return (profile.race || '').trim().length > 0;
        case 'veteranStatus': 
          return (profile.veteran || '').trim().length > 0;
        case 'disabilityStatus': 
          return (profile.disability || '').trim().length > 0;
        case 'age': 
          return (profile.age || '').trim().length > 0;
        case 'countries': 
          return !!(profile.applying_countries && Array.isArray(profile.applying_countries) && profile.applying_countries.length > 0);
        case 'location': 
          return (profile.location || '').trim().length > 0;
        case 'rating': 
          return true; // Rating is always optional/complete
        case 'resume':
          return (profile.resume_url || '').trim().length > 0;
        case 'referral':
          return true; // Referral is always optional/complete
        default: 
          return false;
      }
    };
    
    // Find first incomplete step, default to firstName if all are complete
    return stepOrder.find(step => !isStepComplete(step)) || 'firstName';
  };

    const signOut = async (): Promise<void> => {
    try {
        setAuthState(AuthState.LOADING);
        
        await authService.signOut();
        
        setCurrentUser(null);
        setUserProfile(null);
        setPostAuthFlow(null);
        setShouldNavigateToMain(false);
        setDidSync(false);
        
        setAuthState(AuthState.SIGNED_OUT);

        setTimeout(() => {
        router.dismissAll();
        }, 100);

        console.log('DEBUG: Successfully set auth state to signed out');
        
    } catch (error: any) {
        console.log('DEBUG: Sign out failed:', error);
        resetAuth();
        // Also dismiss on error to ensure user gets back to welcome
        setTimeout(() => {
        router.dismissAll();
        }, 100);
        throw error;
        }
    };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      await authService.resetPassword(email);
      console.log('DEBUG: Password reset email sent');
    } catch (error: any) {
      console.log('DEBUG: Password reset failed:', error);
      throw error;
    }
  };

  const deleteAccount = async (): Promise<void> => {
    try {
      if (!state.currentUser?.id) {
        throw new Error('No user logged in');
      }
      
      await authService.deleteAccount(state.currentUser.id);
      resetAuth();
      
      console.log('DEBUG: Account deleted successfully');
      
    } catch (error: any) {
      console.log('DEBUG: Account deletion failed:', error);
      throw error;
    }
  };

  // Context value object
  const contextValue: AuthContextValue = {
    ...state,
    isAuthenticated,
    setAuthState,
    setCurrentUser,
    setUserProfile,
    updateUserProfile,
    setPostAuthFlow,
    setDidSync,
    setIsAuthenticating,
    setShouldNavigateToMain,
    resetAuth,
    checkSession,
    wasAppTerminated,
    recordAppLaunchTimestamp,
    signIn, 
    signUp, 
    signOut,
    signInWithApple,
    signInWithGoogle,
    syncUserProfile,
    resetPassword,
    deleteAccount,
  };

  // Set up auth state listener
  useEffect(() => {
    const { data: { subscription } } = authService.onAuthStateChange((event: string, session: Session | null) => {
      console.log('DEBUG: Auth state change event:', event);
      
      switch (event) {
        case 'SIGNED_IN':
          if (session?.user) {
            setCurrentUser(session.user);
            setAuthState(AuthState.SIGNED_IN);
          }
          break;
        case 'SIGNED_OUT':
          setCurrentUser(null);
          setAuthState(AuthState.SIGNED_OUT);
          setPostAuthFlow(null);
          setDidSync(false);
          break;
        case 'TOKEN_REFRESHED':
          console.log('DEBUG: Token refreshed');
          break;
        default:
          break;
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { supabaseClient as supabase };