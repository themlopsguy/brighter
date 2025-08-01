import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthError, AuthStateType, PostAuthenticationFlow, PostAuthenticationFlowType, User, Session } from './AuthTypes';
import config from '@/constants/Config';

const supabaseClient = createClient(config.supabaseUrl, config.supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// AuthService class
class AuthService {
  private pendingCredentials: any = null;
  private pendingOTPEmail: string | null = null;

  // Helper method to determine post-auth flow
  determinePostAuthFlow(hasActiveSubscription: boolean): PostAuthenticationFlowType {
    if (hasActiveSubscription) {
      return PostAuthenticationFlow.DASHBOARD;
    }
    return PostAuthenticationFlow.INTRO_FLOW;
  }

  // Sign up method
  async signUp(email: string, password: string): Promise<{ user: User; session: Session | null }> {
    try {
      console.log('DEBUG: Starting sign up process for email:', email);
      
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.log('DEBUG: Sign up failed with error:', error);
        if (error.message.includes('User already registered')) {
          throw new Error(AuthError.SUPABASE_ERROR + ': Email already registered');
        }
        throw error;
      }

      if (!data.user) {
        throw new Error('No user returned from sign up');
      }

      console.log('DEBUG: User created successfully, ID:', data.user.id);
      return { user: data.user as User, session: data.session as Session | null };
      
    } catch (error: any) {
      console.log('DEBUG: Sign up failed:', error);
      throw error;
    }
  }

  // Sign in method
  async signIn(email: string, password: string): Promise<{ user: User; session: Session }> {
    try {
      console.log('DEBUG: Starting sign in process');
      
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.log('DEBUG: Sign in failed with error:', error);
        
        if (error.message.includes('Invalid login credentials')) {
          throw new Error(AuthError.USER_NOT_FOUND);
        }
        throw error;
      }

      if (!data.user || !data.session) {
        throw new Error('No user or session returned from sign in');
      }

      console.log('DEBUG: Sign in successful, user ID:', data.user.id);
      return { user: data.user as User, session: data.session as Session };
      
    } catch (error: any) {
      console.log('DEBUG: Sign in error:', error);
      throw error;
    }
  }

  // Get current session method
  async getCurrentSession(): Promise<Session | null> {
    try {
      const { data: { session }, error } = await supabaseClient.auth.getSession();
      
      if (error) {
        throw error;
      }
      
      return session as Session | null;
    } catch (error: any) {
      console.log('DEBUG: Failed to get current session:', error);
      throw error;
    }
  }

  // Sign out method
  async signOut(): Promise<void> {
    try {
      const { error } = await supabaseClient.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      console.log('DEBUG: Successfully signed out');
      
    } catch (error: any) {
      console.log('DEBUG: Sign out failed:', error);
      throw error;
    }
  }

  // Reset password method
  async resetPassword(email: string): Promise<void> {
    try {
      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: 'your-app-scheme://reset-password', // You'll need to configure this
      });

      if (error) {
        console.log('DEBUG: Password reset failed with error:', error);
        throw new Error(AuthError.RESET_PASSWORD_FAILED);
      }

      console.log('DEBUG: Password reset email sent successfully');
      
    } catch (error: any) {
      console.log('DEBUG: Password reset failed:', error);
      throw error;
    }
  }

  // Delete account method
  async deleteAccount(userId: string): Promise<void> {
    try {
      if (!userId) {
        throw new Error('No user logged in');
      }

      // Note: Supabase account deletion will need to be implemented 
      // via RPC call or backend function
      
      // For now, we'll just sign out
      await this.signOut();
      
      console.log('DEBUG: Account deletion process initiated');
      
    } catch (error: any) {
      console.log('DEBUG: Error in deleteAccount:', error);
      throw error;
    }
  }

  // Session validation method
  async validateSession(session: Session): Promise<Session> {
    try {
      if (!session || !session.user) {
        throw new Error('No valid session found');
      }

      console.log('DEBUG: Validating session for user:', session.user.id);
      
      return session;
      
    } catch (error: any) {
      console.log('DEBUG: Session validation failed:', error);
      throw error;
    }
  }

  // Listen for auth state changes
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabaseClient.auth.onAuthStateChange((event, session) => {
      console.log('DEBUG: Auth state changed:', event);
      callback(event, session as Session | null);
    });
  }
}

// Create singleton instance
const authServiceInstance = new AuthService();

export default authServiceInstance;
export { AuthService };