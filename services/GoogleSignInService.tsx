// Replace your entire GoogleSignInService.tsx with this:

import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { AuthError } from './AuthTypes';

class GoogleSignInService {
  
  // Configure Google Sign In
  async configure() {
    try {
      GoogleSignin.configure({
        iosClientId: '346171187215-vfgtbu835ma7httdf6fg8an83a8h46nr.apps.googleusercontent.com',
        offlineAccess: false,
        scopes: ['profile', 'email'],
      });
      console.log('DEBUG: Google Sign In configured');
    } catch (error) {
      console.log('DEBUG: Google Sign In configuration failed:', error);
      throw error;
    }
  }

  // Check if Google Play Services are available (Android)
  async isSignInAvailable(): Promise<boolean> {
    try {
      return await GoogleSignin.hasPlayServices();
    } catch (error) {
      console.log('DEBUG: Google Play Services check failed:', error);
      return false;
    }
  }

  // Sign in with Google
  async signInWithGoogle() {
    try {
      console.log('DEBUG: Starting Google Sign In process');
      
      // Configure first
      await this.configure();

      // Perform sign in
      const result = await GoogleSignin.signIn();
      
      if (!result.data?.idToken) {
        throw new Error('No ID token received from Google');
      }

      console.log('DEBUG: Google Sign In successful, user:', result.data.user.email);
      
      return {
        idToken: result.data.idToken,
        user: result.data.user,
      };

    } catch (error: any) {
      console.log('DEBUG: Google Sign In failed:', error);
      
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        throw new Error(AuthError.USER_CANCELLED);
      } else if (error.code === statusCodes.IN_PROGRESS) {
        throw new Error('Google Sign In already in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error('Google Play Services not available');
      } else {
        throw error;
      }
    }
  }

  // Sign out
  async signOut() {
    try {
      await GoogleSignin.signOut();
      console.log('DEBUG: Google Sign Out successful');
    } catch (error) {
      console.log('DEBUG: Google Sign Out failed:', error);
      throw error;
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      return await GoogleSignin.getCurrentUser();
    } catch (error) {
      console.log('DEBUG: Get current Google user failed:', error);
      return null;
    }
  }

  // Clean up method
  cleanup() {
    // No cleanup needed for official library
  }
}

// Create singleton instance
const googleSignInServiceInstance = new GoogleSignInService();

export default googleSignInServiceInstance;
export { GoogleSignInService };