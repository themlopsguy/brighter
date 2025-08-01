import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import { AuthError } from './AuthTypes';

class AppleSignInService {
    private currentNonce: string | null = null;

    // Check if Apple Sign In is available
    async isAppleSignInAvailable(): Promise<boolean> {
        if (Platform.OS !== 'ios') {
        return false;
        }
        
        try {
        return await AppleAuthentication.isAvailableAsync();
        } catch (error) {
        console.log('DEBUG: Apple Sign In availability check failed:', error);
        return false;
        }
    }

    // Generate nonce
    generateNonce(length: number = 32): string {
        const charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._';
        let result = '';
        
        for (let i = 0; i < length; i++) {
        result += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        
        return result;
    }

    // SHA256 hash function
    async sha256(input: string): Promise<string> {
        try {
        const digest = await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA256,
            input
        );
        return digest;
        } catch (error) {
        console.log('DEBUG: SHA256 hashing failed:', error);
        throw error;
        }
    }

  // Main Apple Sign In flow (equivalent to your startSignInWithAppleFlow Swift method)
  async startSignInWithAppleFlow() {
    try {
      // Check if Apple Sign In is available
      const isAvailable = await this.isAppleSignInAvailable();
      if (!isAvailable) {
        throw new Error('Apple Sign In is not available on this device');
      }

      // Generate nonce
      const nonce = this.generateNonce();
      this.currentNonce = nonce;

      // Hash the nonce
      const hashedNonce = await this.sha256(nonce);

      // Request Apple authentication
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });

      // Validate the response
      if (!credential.identityToken) {
        throw new Error(AuthError.INVALID_CREDENTIAL);
      }

      console.log('DEBUG: Apple Sign In successful');
      
      return {
        idToken: credential.identityToken,
        nonce: nonce,
        email: credential.email,
        fullName: credential.fullName,
      };

    } catch (error: any) {
    console.log('DEBUG: Apple Sign In failed:', error);
    
    // Handle user cancellation
    if (error.code === 'ERR_CANCELED' || error.code === 'ERR_REQUEST_CANCELED') {
        throw new Error(AuthError.USER_CANCELLED);
    }
    
    throw error;
    }
  }
  
    // Helper method to extract user info from Apple response
    extractUserInfo(credential: {
    email: string | null;
    fullName: {
        givenName: string | null;
        familyName: string | null;
    } | null;
    }) {
    const userInfo = {
        email: credential.email,
        firstName: credential.fullName?.givenName || '',
        lastName: credential.fullName?.familyName || '',
    };

    return userInfo;
    }

  // Sign in with Apple (main method that combines everything)
  async signInWithApple() {
    try {
      console.log('DEBUG: Starting Apple Sign In process');
      
      const appleCredential = await this.startSignInWithAppleFlow();
      
      // Extract user information
      const userInfo = this.extractUserInfo({
        email: appleCredential.email,
        fullName: appleCredential.fullName,
      });

      return {
        idToken: appleCredential.idToken,
        nonce: appleCredential.nonce,
        userInfo,
      };

    } catch (error) {
      console.log('DEBUG: Apple Sign In process failed:', error);
      throw error;
    }
  }

  // Clean up method
  cleanup() {
    this.currentNonce = null;
  }
}

// Create singleton instance
const appleSignInServiceInstance = new AppleSignInService();

export default appleSignInServiceInstance;
export { AppleSignInService };