// services/GoogleDriveService.tsx

import { GoogleSignin } from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthError } from './AuthTypes';

// Storage keys for Drive tokens
const DRIVE_STORAGE_KEYS = {
  ACCESS_TOKEN: 'google_drive_access_token',
  USER_INFO: 'google_drive_user_info',
  EXPIRES_AT: 'google_drive_expires_at',
};

export interface DriveFile {
  id: string;
  name: string;
  size?: number;
  modifiedTime: string;
  webViewLink: string;
  mimeType: string;
}

export interface DriveAuthResult {
  success: boolean;
  accessToken?: string;
  userEmail?: string;
  error?: string;
}

export interface DriveFilesResult {
  success: boolean;
  files?: DriveFile[];
  error?: string;
  nextPageToken?: string;
}

class GoogleDriveService {
  
  /**
   * Configure Google Sign-In specifically for Drive access
   */
  private async configureDriveAccess() {
    try {
      GoogleSignin.configure({
        iosClientId: '346171187215-vfgtbu835ma7httdf6fg8an83a8h46nr.apps.googleusercontent.com',
        //androidClientId: '346171187215-3t64043lpsrhdgj7hhfr5rkasp8iia5p.apps.googleusercontent.com',
        offlineAccess: false, // Need this for refresh tokens
        scopes: [
          'profile', 
          'email', 
          'https://www.googleapis.com/auth/drive.readonly'
        ],
      });
      console.log('DEBUG: Google Drive access configured');
    } catch (error) {
      console.error('DEBUG: Google Drive configuration failed:', error);
      throw error;
    }
  }

  /**
   * Check if user has valid Drive access token
   */
  async hasDriveAccess(): Promise<boolean> {
    try {
      const accessToken = await AsyncStorage.getItem(DRIVE_STORAGE_KEYS.ACCESS_TOKEN);
      const expiresAt = await AsyncStorage.getItem(DRIVE_STORAGE_KEYS.EXPIRES_AT);
      
      if (!accessToken || !expiresAt) {
        return false;
      }
      
      // Check if token is expired
      const now = Date.now();
      const expiration = parseInt(expiresAt);
      
      if (now >= expiration) {
        console.log('DEBUG: Drive access token expired');
        await this.clearDriveTokens();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('DEBUG: Error checking Drive access:', error);
      return false;
    }
  }

/**
 * Authenticate user for Google Drive access with retry logic
 */
async authenticateForDrive(): Promise<DriveAuthResult> {
  try {
    console.log('DEBUG: Starting Google Drive authentication');
    
    // Configure for Drive access
    await this.configureDriveAccess();
    
    // Check if already signed in with Drive access
    const currentUser = await GoogleSignin.getCurrentUser();
    if (currentUser?.scopes?.includes('https://www.googleapis.com/auth/drive.readonly')) {
      console.log('DEBUG: User already has Drive access');
      
      // Try to get fresh access token with retry
      const tokens = await this.getTokensWithRetry();
      if (tokens) {
        await this.storeDriveTokens(tokens.accessToken, currentUser.user.email);
        return {
          success: true,
          accessToken: tokens.accessToken,
          userEmail: currentUser.user.email
        };
      }
    }
    
    // Sign in with Drive permissions
    const result = await GoogleSignin.signIn();
    
    if (!result.data?.user) {
      throw new Error('No user data received from Google Sign-In');
    }
    
    // Get access tokens after sign in with retry
    const tokens = await this.getTokensWithRetry();
    if (!tokens) {
      throw new Error('No access token received from Google after multiple attempts');
    }
    
    // Store tokens
    await this.storeDriveTokens(tokens.accessToken, result.data.user.email);
    
    console.log('DEBUG: Google Drive authentication successful');
    
    return {
      success: true,
      accessToken: tokens.accessToken,
      userEmail: result.data.user.email
    };
    
  } catch (error: any) {
    console.error('DEBUG: Google Drive authentication failed:', error);
    
    if (error.message === AuthError.USER_CANCELLED || error.code === 'SIGN_IN_CANCELLED') {
      return {
        success: false,
        error: 'User cancelled Google Drive authentication'
      };
    }
    
    return {
      success: false,
      error: `Drive authentication failed: ${error.message}`
    };
  }
}

/**
 * Get tokens with retry logic to handle timing issues
 */
private async getTokensWithRetry(maxRetries: number = 3, delayMs: number = 1000): Promise<any> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`DEBUG: Attempting to get tokens (attempt ${attempt}/${maxRetries})`);
      const tokens = await GoogleSignin.getTokens();
      
      if (tokens?.accessToken) {
        console.log('DEBUG: Successfully got access tokens');
        return tokens;
      } else {
        console.log('DEBUG: No access token in response, retrying...');
      }
    } catch (error) {
      console.log(`DEBUG: Token retrieval attempt ${attempt} failed:`, error);
    }
    
    // Wait before retrying (except on last attempt)
    if (attempt < maxRetries) {
      console.log(`DEBUG: Waiting ${delayMs}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  console.error('DEBUG: Failed to get tokens after all retry attempts');
  return null;
}

  /**
   * Store Drive access tokens securely
   */
  private async storeDriveTokens(accessToken: string, userEmail: string): Promise<void> {
    try {
      // Google tokens typically expire in 1 hour
      const expiresAt = Date.now() + (60 * 60 * 1000); // 1 hour from now
      
      await AsyncStorage.multiSet([
        [DRIVE_STORAGE_KEYS.ACCESS_TOKEN, accessToken],
        [DRIVE_STORAGE_KEYS.USER_INFO, userEmail],
        [DRIVE_STORAGE_KEYS.EXPIRES_AT, expiresAt.toString()],
      ]);
      
      console.log('DEBUG: Drive tokens stored successfully');
    } catch (error) {
      console.error('DEBUG: Error storing Drive tokens:', error);
      throw error;
    }
  }

  /**
   * Get stored Drive access token
   */
  private async getDriveAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(DRIVE_STORAGE_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error('DEBUG: Error getting Drive access token:', error);
      return null;
    }
  }

  /**
   * Clear stored Drive tokens
   */
  async clearDriveTokens(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        DRIVE_STORAGE_KEYS.ACCESS_TOKEN,
        DRIVE_STORAGE_KEYS.USER_INFO,
        DRIVE_STORAGE_KEYS.EXPIRES_AT,
      ]);
      console.log('DEBUG: Drive tokens cleared');
    } catch (error) {
      console.error('DEBUG: Error clearing Drive tokens:', error);
    }
  }


    /**
     * List PDF files from Google Drive with optional search
     */
    async listPDFFiles(pageToken?: string, searchQuery?: string): Promise<DriveFilesResult> {
    try {
        const logPrefix = searchQuery ? `[SEARCH: "${searchQuery}"]` : '[ALL FILES]';
        console.log(`DEBUG: ${logPrefix} Listing PDF files from Google Drive`);
        
        // Check authentication
        if (!(await this.hasDriveAccess())) {
        return {
            success: false,
            error: 'Not authenticated for Drive access'
        };
        }
        
        const accessToken = await this.getDriveAccessToken();
        if (!accessToken) {
        return {
            success: false,
            error: 'No access token available'
        };
        }
        
        // Build Drive API query with improved search
        let query = "mimeType='application/pdf' and trashed=false";
        
        // Add search term to query if provided
        if (searchQuery && searchQuery.trim().length > 0) {
        const searchTerm = searchQuery.trim();
        // Try both exact and fuzzy matching
        query += ` and (name contains '${searchTerm}' or fullText contains '${searchTerm}')`;
        }
        
        const params = new URLSearchParams({
        q: query,
        fields: 'nextPageToken,files(id,name,size,modifiedTime,webViewLink,mimeType)',
        pageSize: '50', // Increased to see more results
        orderBy: 'modifiedTime desc'
        });
        
        if (pageToken) {
        params.append('pageToken', pageToken);
        }
        
        console.log(`DEBUG: ${logPrefix} Drive API query:`, query);
        console.log(`DEBUG: ${logPrefix} Full API URL:`, `https://www.googleapis.com/drive/v3/files?${params.toString()}`);
        
        // Call Google Drive API
        const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?${params.toString()}`,
        {
            headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            },
        }
        );
        
        if (!response.ok) {
        const errorBody = await response.text();
        console.error(`DEBUG: ${logPrefix} API Error Response:`, errorBody);
        
        // Check if it's an auth error
        const authCleared = await this.handleApiError({ message: `${response.status}` });
        if (authCleared) {
            return {
            success: false,
            error: 'Authentication expired. Please sign in again.'
            };
        }
        
        throw new Error(`Drive API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        console.log(`DEBUG: ${logPrefix} Found ${data.files?.length || 0} PDF files`);
        if (data.files?.length > 0) {
        console.log(`DEBUG: ${logPrefix} File names:`, data.files.map((f: any) => f.name));
        }
        
        return {
        success: true,
        files: data.files || [],
        nextPageToken: data.nextPageToken
        };
        
    } catch (error: any) {
        console.error('DEBUG: Error listing Drive files:', error);
        // Check if it's an auth error
        const authCleared = await this.handleApiError(error);
        if (authCleared) {
        return {
            success: false,
            error: 'Authentication expired. Please sign in again.'
        };
        }
        return {
          success: false,
          error: `Failed to list files: Google sign in error`
        };
    }
    }

private async handleApiError(error: any): Promise<boolean> {
  if (error.message?.includes('401') || error.message?.includes('Invalid Credentials')) {
    console.log('DEBUG: Token expired or invalid, clearing auth');
    await this.clearDriveTokens();
    return true; // Indicates auth was cleared
  }
  return false; // No auth issue
}

/**
 * Complete auth reset for testing - clears everything
 */
async debugResetEverything(): Promise<void> {
  try {
    console.log('DEBUG: Starting complete auth reset...');
    
    // 1. Configure Google Sign-In first (needed for revoke/signout)
    try {
      await this.configureDriveAccess();
      console.log('DEBUG: Google Sign-In configured');
    } catch (error) {
      console.log('DEBUG: Configuration error:', error);
    }
    
    // 2. Get current tokens before clearing (if available)
    let accessToken = null;
    try {
      const tokens = await GoogleSignin.getTokens();
      accessToken = tokens.accessToken;
      console.log('DEBUG: Got current access token for clearing');
    } catch (error) {
      console.log('DEBUG: No tokens to get (user might not be signed in)');
    }
    
    // 3. Clear cached access token if we have one
    if (accessToken) {
      try {
        await GoogleSignin.clearCachedAccessToken(accessToken);
        console.log('DEBUG: Cached access token cleared');
      } catch (error) {
        console.log('DEBUG: Clear cache token error:', error);
      }
    }
    
    // 4. Revoke access (this is the key step!)
    try {
      await GoogleSignin.revokeAccess();
      console.log('DEBUG: Google access revoked');
    } catch (error) {
      console.log('DEBUG: Revoke access error:', error);
    }
    
    // 5. Sign out from Google Sign-In
    try {
      await GoogleSignin.signOut();
      console.log('DEBUG: Google Sign-In signOut completed');
    } catch (error) {
      console.log('DEBUG: Sign out error:', error);
    }
    
    // 6. Clear our stored tokens
    await this.clearDriveTokens();
    
    // 7. Force clear any persistent Google auth in the system
    try {
      // This clears the Google Play Services cache on Android
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: false });
      console.log('DEBUG: Play Services checked');
    } catch (error) {
      console.log('DEBUG: Play Services error:', error);
    }
    
    console.log('DEBUG: Complete auth reset finished');
  } catch (error) {
    console.error('DEBUG: Error during complete reset:', error);
  }
}

  /**
   * Download file from Google Drive
   */
  async downloadFile(fileId: string): Promise<{ success: boolean; data?: ArrayBuffer; error?: string }> {
    try {
      console.log('DEBUG: Downloading file from Google Drive:', fileId);
      
      // Check authentication
      if (!(await this.hasDriveAccess())) {
        return {
          success: false,
          error: 'Not authenticated for Drive access'
        };
      }
      
      const accessToken = await this.getDriveAccessToken();
      if (!accessToken) {
        return {
          success: false,
          error: 'No access token available'
        };
      }
      
      // Download file content
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      
      console.log('DEBUG: File downloaded successfully, size:', arrayBuffer.byteLength);
      
      return {
        success: true,
        data: arrayBuffer
      };
      
    } catch (error: any) {
      console.error('DEBUG: Error downloading file:', error);
      return {
        success: false,
        error: `Download failed: ${error.message}`
      };
    }
  }

  /**
   * Get Drive user info
   */
  async getDriveUserInfo(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(DRIVE_STORAGE_KEYS.USER_INFO);
    } catch (error) {
      console.error('DEBUG: Error getting Drive user info:', error);
      return null;
    }
  }

/**
 * Force sign out and clear all tokens (for testing)
 */
async forceClearAuth(): Promise<void> {
  try {
    console.log('DEBUG: Forcing clear of all Google auth');
    
    // Sign out from Google
    await GoogleSignin.signOut();
    
    // Clear stored Drive tokens
    await this.clearDriveTokens();
    
    console.log('DEBUG: All Google auth cleared');
  } catch (error) {
    console.error('DEBUG: Error clearing auth:', error);
  }
}
}

// Create singleton instance
const googleDriveService = new GoogleDriveService();

export default googleDriveService;
export { GoogleDriveService };