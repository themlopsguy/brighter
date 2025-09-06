// services/ResumeService.tsx

import { supabase } from '@/services/AuthContext';
import * as FileSystem from 'expo-file-system';

// Types for resume upload
export interface ResumeUploadResult {
  success: boolean;
  resumeUrl?: string;
  localPath?: string;
  error?: string;
}

export interface ResumeRecord {
  id: string;
  user_id: string;
  file_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export class ResumeService {

  /**
   * Upload resume to Supabase Storage and update database
   * @param file - PDF file object from DocumentPicker
   * @param userId - Current user's ID
   * @returns Upload result with success status and resume URL
   */
  static async uploadResume(file: any, userId: string): Promise<ResumeUploadResult> {
    try {
      console.log('Starting resume upload for user:', userId);
      console.log('File details:', { 
        name: file.name, 
        size: file.size, 
        mimeType: file.mimeType || file.type 
      });

      // Step 1: Validate file
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error
        };
      }

      // Step 2: Generate filename with timestamp
      const timestamp = Date.now();
      const fileName = `${userId}_${timestamp}.pdf`;
      
      console.log('Generated filename:', fileName);

      // Step 3: Read file as ArrayBuffer for upload
      const fileUri = file.uri;
      const fileData = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log('Storing resume locally...');
      const localPath = await this.storeResumeLocally(fileUri, userId);

      // Convert base64 to ArrayBuffer
      const binaryString = atob(fileData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      console.log('File processed for upload, size:', bytes.length);

      // Step 4: Get existing resume info (but don't delete yet)
      const existingResume = await this.getExistingResumeInfo(userId);

      console.log('Existing resume - ', existingResume)

      // Step 5: Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, bytes, {
          contentType: 'application/pdf',
          upsert: false // Don't overwrite
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return {
          success: false,
          error: `Upload failed: ${uploadError.message}`
        };
      }

      console.log('File uploaded successfully:', uploadData.path);

        // Step 6: Get signed URL (valid for 1 year for backend processing)
        const { data: urlData, error: urlError } = await supabase.storage
        .from('resumes')
        .createSignedUrl(fileName, 31536000); // 1 year in seconds

        if (urlError) {
        console.error('Error creating signed URL:', urlError);
        // Clean up uploaded file
        await this.deleteStorageFile(fileName);
        return {
            success: false,
            error: `Failed to create signed URL: ${urlError.message}`
        };
        }

        const resumeUrl = urlData.signedUrl;
      console.log('Generated resume URL:', resumeUrl);

      // Step 7: Insert/Update resume record in database
      const dbResult = await this.updateResumeRecord(userId, resumeUrl);
      if (!dbResult.success) {
        // If database update fails, try to clean up uploaded file
        await this.deleteStorageFile(fileName);
        return {
          success: false,
          error: dbResult.error
        };
      }

      // Step 8: Now that new resume is successfully uploaded and saved, delete the old one
      if (existingResume) {
        await this.deleteOldResume(existingResume);

        // Verify deletion worked
        const { data: remainingResumes } = await supabase
            .from('resumes')
            .select('*')
            .eq('user_id', userId);
        console.log('Remaining resumes after deletion:', remainingResumes);
      }

      console.log('Resume upload completed successfully');

      return {
        success: true,
        resumeUrl: resumeUrl,
        localPath: localPath
      };

    } catch (error) {
      console.error('Resume upload failed:', error);
      return {
        success: false,
        error: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Validate uploaded file
   * @param file - File object to validate
   * @returns Validation result
   */
  private static validateFile(file: any): { isValid: boolean; error?: string } {
    // Check if file exists
    if (!file) {
      return { isValid: false, error: 'No file selected' };
    }

    // Check file type
    if (!file.mimeType || file.mimeType !== 'application/pdf') {
      return { isValid: false, error: 'Please select a PDF file' };
    }

    // Check file name
    const fileType = file.mimeType || file.type;
    if (!fileType || fileType !== 'application/pdf') {
      return { isValid: false, error: 'Please select a PDF file' };
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size && file.size > maxSize) {
      return { isValid: false, error: 'File size must be less than 10MB' };
    }

    return { isValid: true };
  }

  /**
   * Get existing resume info without deleting
   * @param userId - User ID
   * @returns Existing resume info or null
   */
  private static async getExistingResumeInfo(userId: string): Promise<{ id: string; file_url: string } | null> {
    try {
      console.log('Checking for existing resume...');

        // First, let's see what's in the table
        const { data: allResumes, error: allError } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', userId);

        console.log('All resumes for user:', allResumes);
        console.log('Query error (if any):', allError);

      const { data: existingResume, error: fetchError } = await supabase
        .from('resumes')
        .select('id, file_url')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

        console.log('Active resume query result:', existingResume);
        console.log('Active resume query error:', fetchError);

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error fetching existing resume:', fetchError);
        return null;
      }

      if (existingResume?.file_url) {
        console.log('Found existing resume:', existingResume.file_url);
        return existingResume;
      }

      return null;
    } catch (error) {
      console.error('Error in getExistingResumeInfo:', error);
      return null;
    }
  }

  /**
   * Delete old resume after new one is successfully uploaded
   * @param existingResume - Existing resume info
   */
private static async deleteOldResume(existingResume: { id: string; file_url: string }): Promise<void> {
  try {
    console.log('Deleting old resume with ID:', existingResume.id);
    
    // Delete from database first (easier to debug)
    const { data: dbDeleteData, error: deleteError } = await supabase
      .from('resumes')
      .delete()
      .eq('id', existingResume.id)
      .select();

    console.log('Database deletion result:', { data: dbDeleteData, error: deleteError });

    if (deleteError) {
      console.error('Database deletion failed:', deleteError);
      return; // Don't try storage deletion if DB deletion failed
    }

    if (!dbDeleteData || dbDeleteData.length === 0) {
      console.error('No database records were deleted - possible RLS issue');
      return;
    }

    // Only delete from storage if database deletion succeeded
    const url = new URL(existingResume.file_url);
    const pathParts = url.pathname.split('/');
    const fileName = pathParts[pathParts.length - 1];
    console.log('Extracted filename for deletion:', fileName);

    const { data: storageDeleteData, error: storageDeleteError } = await supabase.storage
      .from('resumes')
      .remove([fileName]);
    
    console.log('Storage deletion result:', { data: storageDeleteData, error: storageDeleteError });

    console.log('Old resume deleted successfully');
  } catch (error) {
    console.error('Error in deleteOldResume:', error);
  }
}

  /**
   * Delete file from storage
   * @param fileName - Name of file to delete
   */
  private static async deleteStorageFile(fileName: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from('resumes')
        .remove([fileName]);

      if (error) {
        console.error('Error deleting storage file:', error);
      } else {
        console.log('Storage file deleted:', fileName);
      }
    } catch (error) {
      console.error('Error in deleteStorageFile:', error);
    }
  }

  /**
   * Update resume record in database
   * @param userId - User ID
   * @param resumeUrl - URL of uploaded resume
   * @returns Update result
   */
private static async updateResumeRecord(userId: string, resumeUrl: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('Updating resume record in database...');

    // First, mark any existing resumes as inactive - with more explicit logging
    const { data: updateData, error: updateError } = await supabase
      .from('resumes')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('is_active', true)
      .select(); // Add select to see what was updated

    console.log('Deactivation result:', { data: updateData, error: updateError });

    if (updateError) {
      console.error('Error deactivating old resumes:', updateError);
      // Continue anyway - this might just mean no existing resumes
    }

    // Then insert the new resume record
    const { data, error } = await supabase
      .from('resumes')
      .insert({
        user_id: userId,
        file_url: resumeUrl,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Database insert error:', error);
      return {
        success: false,
        error: `Database error: ${error.message}`
      };
    }

    console.log('Resume record created:', data.id);
    return { success: true };

  } catch (error) {
    console.error('Error updating resume record:', error);
    return {
      success: false,
      error: `Database error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

  /**
   * Get user's active resume
   * @param userId - User ID
   * @returns Resume record if found
   */
  static async getActiveResume(userId: string): Promise<ResumeRecord | null> {
    try {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching active resume:', error);
      return null;
    }
  }

    /**
     * Get the local resume directory path
     */
    private static getLocalResumeDirectory(): string {
        return `${FileSystem.documentDirectory}resumes/`;
    }

    /**
     * Get local file path for user's resume
     */
    private static buildLocalResumePath(userId: string): string {
        return `${this.getLocalResumeDirectory()}${userId}_resume.pdf`;
    }

    /**
     * Ensure resume directory exists
     */
    private static async ensureResumeDirectoryExists(): Promise<void> {
    const resumeDir = this.getLocalResumeDirectory();
    const dirInfo = await FileSystem.getInfoAsync(resumeDir);
    
    if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(resumeDir, { intermediates: true });
        console.log('Created resume directory:', resumeDir);
    }
    }

    /**
     * Store resume file locally
     */
    private static async storeResumeLocally(sourceUri: string, userId: string): Promise<string> {
    try {
        console.log('Storing resume locally for user:', userId);
        
        // Ensure directory exists
        await this.ensureResumeDirectoryExists();
        
        // Get local file path
        const localPath = this.buildLocalResumePath(userId);
        
        // Delete existing file if it exists
        const existingFile = await FileSystem.getInfoAsync(localPath);
        if (existingFile.exists) {
        await FileSystem.deleteAsync(localPath);
        console.log('Deleted existing local resume');
        }
        
        // Copy file to local storage
        await FileSystem.copyAsync({
        from: sourceUri,
        to: localPath
        });
        
        // Verify file was copied
        const copiedFile = await FileSystem.getInfoAsync(localPath);
        if (!copiedFile.exists) {
        throw new Error('Failed to copy file to local storage');
        }
        
        console.log('Resume stored locally at:', localPath);
        console.log('Local file size:', copiedFile.size);
        
        return localPath;
        
    } catch (error) {
        console.error('Error storing resume locally:', error);
        throw new Error(`Failed to store resume locally: ${error}`);
    }
    }

    /**
     * Get locally stored resume path
     */
    static async getLocalResumePath(userId: string): Promise<string | null> {
    try {
        const localPath = this.buildLocalResumePath(userId);
        const fileInfo = await FileSystem.getInfoAsync(localPath);
        
        if (fileInfo.exists) {
        console.log('Found local resume at:', localPath);
        return localPath;
        }
        
        console.log('No local resume found for user:', userId);
        return null;
        
    } catch (error) {
        console.error('Error checking for local resume:', error);
        return null;
    }
    }

    /**
     * Delete locally stored resume
     */
    private static async deleteLocalResume(userId: string): Promise<void> {
    try {
        const localPath = this.buildLocalResumePath(userId);
        const fileInfo = await FileSystem.getInfoAsync(localPath);
        
        if (fileInfo.exists) {
        await FileSystem.deleteAsync(localPath);
        console.log('Deleted local resume for user:', userId);
        }
    } catch (error) {
        console.error('Error deleting local resume:', error);
        // Don't throw - this is cleanup
    }
    }

/**
 * Upload resume from Google Drive ArrayBuffer data
 * @param driveFile - Drive file object with ArrayBuffer data
 * @param userId - Current user's ID
 * @returns Upload result with success status and resume URL
 */
static async uploadDriveFile(driveFile: any, userId: string): Promise<ResumeUploadResult> {
  try {
    console.log('Starting Drive file upload for user:', userId);
    console.log('Drive file details:', { name: driveFile.name, size: driveFile.size });

    // Step 1: Validate file
    const validation = this.validateDriveFile(driveFile);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error
      };
    }

    // Step 2: Generate filename with timestamp
    const timestamp = Date.now();
    const fileName = `${userId}_${timestamp}.pdf`;
    
    console.log('Generated filename:', fileName);

    // Step 3: Convert ArrayBuffer to Uint8Array for Supabase upload
    const uint8Array = new Uint8Array(driveFile.arrayBuffer);
    console.log('File processed for upload, size:', uint8Array.length);

    // Step 4: Store file locally BEFORE uploading to Supabase
    console.log('Storing Drive file locally...');
    const localPath = await this.storeDriveFileLocally(driveFile.arrayBuffer, userId);

    // Step 5: Get existing resume info (but don't delete yet)
    const existingResume = await this.getExistingResumeInfo(userId);

    // Step 6: Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(fileName, uint8Array, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      // Clean up local file if upload fails
      await this.deleteLocalResume(userId);
      return {
        success: false,
        error: `Upload failed: ${uploadError.message}`
      };
    }

    console.log('File uploaded successfully:', uploadData.path);

    // Step 7: Get signed URL
    const { data: urlData, error: urlError } = await supabase.storage
      .from('resumes')
      .createSignedUrl(fileName, 31536000); // 1 year

    if (urlError) {
      console.error('Error creating signed URL:', urlError);
      await this.deleteStorageFile(fileName);
      await this.deleteLocalResume(userId);
      return {
        success: false,
        error: `Failed to create signed URL: ${urlError.message}`
      };
    }

    const resumeUrl = urlData.signedUrl;
    console.log('Generated resume URL:', resumeUrl);

    // Step 8: Insert/Update resume record in database
    const dbResult = await this.updateResumeRecord(userId, resumeUrl);
    if (!dbResult.success) {
      // Clean up on database failure
      await this.deleteStorageFile(fileName);
      await this.deleteLocalResume(userId);
      return {
        success: false,
        error: dbResult.error
      };
    }

    // Step 9: Delete old resume after successful upload
    if (existingResume) {
      await this.deleteOldResume(existingResume);
    }

    console.log('Drive file upload completed successfully');

    return {
      success: true,
      resumeUrl: resumeUrl,
      localPath: localPath
    };

  } catch (error) {
    console.error('Drive file upload failed:', error);
    return {
      success: false,
      error: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Validate Drive file
 * @param driveFile - Drive file object to validate
 * @returns Validation result
 */
private static validateDriveFile(driveFile: any): { isValid: boolean; error?: string } {
  // Check if file exists
  if (!driveFile) {
    return { isValid: false, error: 'No file selected' };
  }

  // Check file name
  if (!driveFile.name || !driveFile.name.toLowerCase().endsWith('.pdf')) {
    return { isValid: false, error: 'File must be a PDF' };
  }

  // Check if we have file data
  if (!driveFile.arrayBuffer) {
    return { isValid: false, error: 'No file data available' };
  }

  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (driveFile.size && driveFile.size > maxSize) {
    return { isValid: false, error: 'File size must be less than 10MB' };
  }

  return { isValid: true };
}

/**
 * Store Drive file (ArrayBuffer) locally
 */
private static async storeDriveFileLocally(arrayBuffer: ArrayBuffer, userId: string): Promise<string> {
  try {
    console.log('Storing Drive file locally for user:', userId);
    
    // Ensure directory exists
    await this.ensureResumeDirectoryExists();
    
    // Get local file path
    const localPath = this.buildLocalResumePath(userId);
    
    // Delete existing file if it exists
    const existingFile = await FileSystem.getInfoAsync(localPath);
    if (existingFile.exists) {
      await FileSystem.deleteAsync(localPath);
      console.log('Deleted existing local resume');
    }
    
    // Convert ArrayBuffer to base64 for FileSystem
    const uint8Array = new Uint8Array(arrayBuffer);
    const binaryString = String.fromCharCode.apply(null, Array.from(uint8Array));
    const base64String = btoa(binaryString);
    
    // Write file to local storage
    await FileSystem.writeAsStringAsync(localPath, base64String, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    // Verify file was written
    const savedFile = await FileSystem.getInfoAsync(localPath);
    if (!savedFile.exists) {
      throw new Error('Failed to save file to local storage');
    }
    
    console.log('Drive file stored locally at:', localPath);
    console.log('Local file size:', savedFile.size);
    
    return localPath;
    
  } catch (error) {
    console.error('Error storing Drive file locally:', error);
    throw new Error(`Failed to store Drive file locally: ${error}`);
  }
}
}

export default ResumeService;