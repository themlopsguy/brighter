// components/DriveFileBrowser.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
  SafeAreaView,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PrepTalkTheme } from '@/constants/Theme';
import googleDriveService, { DriveFile } from '@/services/GoogleDriveService';

interface DriveFileBrowserProps {
  isVisible: boolean;
  onClose: () => void;
  onFileSelected: (file: DriveFile, fileData: ArrayBuffer) => void;
}

export default function DriveFileBrowser({ 
  isVisible, 
  onClose, 
  onFileSelected 
}: DriveFileBrowserProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Check authentication status when modal opens
  useEffect(() => {
    if (isVisible) {
      checkAuthAndLoadFiles();
    }
  }, [isVisible]);

  const checkAuthAndLoadFiles = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if user has Drive access
      const hasAccess = await googleDriveService.hasDriveAccess();
      
      if (hasAccess) {
        setIsAuthenticated(true);
        await loadFiles();
      } else {
        // Need to authenticate
        await authenticateAndLoadFiles();
      }
    } catch (error) {
      console.error('Error checking auth and loading files:', error);
      setError('Failed to load Google Drive files');
    } finally {
      setIsLoading(false);
    }
  };

  const authenticateAndLoadFiles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const authResult = await googleDriveService.authenticateForDrive();
      
      if (authResult.success) {
        setIsAuthenticated(true);
        await new Promise(resolve => setTimeout(resolve, 500)); // Add a small delay to ensure tokens are fully available
        await loadFiles();
      } else {
        if (authResult.error?.includes('cancelled')) {
          // User cancelled - just close modal
          onClose();
        } else {
          setError(authResult.error || 'Authentication failed');
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setError('Failed to authenticate with Google Drive');
    } finally {
      setIsLoading(false);
    }
  };

  const loadFiles = async (pageToken?: string, searchTerm?: string) => {
    try {
      if (!pageToken) {
        setIsLoading(true);
      }

      // Use searchTerm if provided, otherwise use current searchQuery
      const query = searchTerm !== undefined ? searchTerm : searchQuery;
      
      const result = await googleDriveService.listPDFFiles(pageToken, query);
      
      if (result.success && result.files) {
        if (pageToken) {
          // Append to existing files (pagination)
          setFiles(prev => [...prev, ...result.files!]);
        } else {
          // Replace files (refresh)
          setFiles(result.files);
        }
        setNextPageToken(result.nextPageToken);
      } else {
        setError(result.error || 'Failed to load files');
      }
    } catch (error) {
      console.error('Error loading files:', error);
      setError('Failed to load files from Google Drive');
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  const handleFileSelect = async (file: DriveFile) => {
    try {
      setIsDownloading(true);
      setDownloadingFileId(file.id);
      
      const downloadResult = await googleDriveService.downloadFile(file.id);
      
      if (downloadResult.success && downloadResult.data) {
        onFileSelected(file, downloadResult.data);
        onClose(); // Close modal after successful selection
      } else {
        Alert.alert('Download Error', downloadResult.error || 'Failed to download file');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      Alert.alert('Download Error', 'Failed to download file from Google Drive');
    } finally {
      setIsDownloading(false);
      setDownloadingFileId(null);
    }
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'Unknown size';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Unknown date';
    }
  };

  const loadMoreFiles = () => {
    if (nextPageToken && !isLoading) {
      loadFiles(nextPageToken, searchQuery);
    }
  };

    const handleSearch = async (query: string) => {
      setSearchQuery(query);
      if (query.trim().length > 0) {
        setIsSearching(true);
        await loadFiles(undefined, query.trim());
      } else {
        // If search is cleared, reload all files
        await loadFiles(undefined, '');
      }
    };

    const clearSearch = async () => {
      setSearchQuery('');
      setIsSearching(true);
      await loadFiles(undefined, '');
    };

    const renderFileItem = ({ item }: { item: DriveFile }) => (
    <TouchableOpacity
        style={styles.gridItem}
        onPress={() => handleFileSelect(item)}
        disabled={isDownloading}
        activeOpacity={0.7}
    >
        <View style={styles.fileIconContainer}>
        {downloadingFileId === item.id ? (
            <ActivityIndicator size="large" color={PrepTalkTheme.colors.primary} />
        ) : (
            <Ionicons name="document" size={40} color={PrepTalkTheme.colors.primary} />
        )}
        </View>
        
        <Text style={styles.gridFileName} numberOfLines={1} ellipsizeMode="tail">
        {item.name}
        </Text>

        <Text style={styles.gridFileDate}>
        {formatDate(item.modifiedTime)}
        </Text>
        
        <Text style={styles.gridFileSize}>
        {formatFileSize(item.size)}
        </Text>
    </TouchableOpacity>
    );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Ionicons name="folder-open" size={64} color={PrepTalkTheme.colors.mediumGray} />
      <Text style={styles.emptyTitle}>No PDF files found</Text>
      <Text style={styles.emptySubtitle}>
        No PDF files were found in your Google Drive
      </Text>
    </View>
  );

  const renderError = () => (
    <View style={styles.errorState}>
      <Ionicons name="alert-circle" size={64} color={PrepTalkTheme.colors.error || '#FF6B6B'} />
      <Text style={styles.errorTitle}>Error Loading Files</Text>
      <Text style={styles.errorSubtitle}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={checkAuthAndLoadFiles}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={PrepTalkTheme.colors.text} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Google Drive</Text>
          
          <TouchableOpacity 
            onPress={() => loadFiles()} 
            style={styles.refreshButton}
            disabled={isLoading}
          >
            <Ionicons name="refresh" size={24} color={PrepTalkTheme.colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Add search bar after header */}
        <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
                <Ionicons 
                name="search" 
                size={20} 
                color={PrepTalkTheme.colors.mediumGray} 
                style={styles.searchIcon}
                />
                <TextInput
                style={styles.searchInput}
                placeholder="Search PDF files..."
                placeholderTextColor={PrepTalkTheme.colors.mediumGray}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={() => handleSearch(searchQuery)}
                returnKeyType="search"
                autoCapitalize="none"
                autoCorrect={false}
                />
                {searchQuery.length > 0 && (
                <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                    <Ionicons name="close-circle" size={20} color={PrepTalkTheme.colors.mediumGray} />
                </TouchableOpacity>
                )}
            </View>
        
            <TouchableOpacity 
                style={styles.searchButton}
                onPress={() => handleSearch(searchQuery)}
                disabled={isSearching}
            >
                {isSearching ? (
                <ActivityIndicator size="small" color="white" />
                ) : (
                <Text style={styles.searchButtonText}>Search</Text>
                )}
            </TouchableOpacity>
        </View>

        {isLoading && files.length === 0 ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color={PrepTalkTheme.colors.primary} />
            <Text style={styles.loadingText}>
              {isAuthenticated ? 'Loading PDF files...' : 'Connecting to Google Drive...'}
            </Text>
          </View>
        ) : error ? (
          renderError()
        ) : (
            <FlatList
            data={files}
            renderItem={renderFileItem}
            keyExtractor={(item) => item.id}
            numColumns={3} // Add this for 3-column grid
            key="grid" // Add this to force re-render when switching layouts
            columnWrapperStyle={styles.gridRow} // Add this for row spacing
            contentContainerStyle={[
                styles.filesList,
                files.length === 0 && styles.centeredContent
            ]}
            ListEmptyComponent={renderEmpty}
            refreshControl={
                <RefreshControl
                refreshing={isLoading && files.length > 0}
                onRefresh={() => loadFiles()}
                colors={[PrepTalkTheme.colors.primary]}
                />
            }
            onEndReached={loadMoreFiles}
            onEndReachedThreshold={0.1}
            ListFooterComponent={
                isLoading && files.length > 0 ? (
                <View style={styles.loadingMore}>
                    <ActivityIndicator size="small" color={PrepTalkTheme.colors.primary} />
                </View>
                ) : null
            }
            />
        )}

        {isDownloading && (
          <View style={styles.downloadingOverlay}>
            <View style={styles.downloadingModal}>
              <ActivityIndicator size="large" color={PrepTalkTheme.colors.primary} />
              <Text style={styles.downloadingText}>Downloading file...</Text>
            </View>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PrepTalkTheme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: PrepTalkTheme.colors.border || '#E5E5E5',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Lexend-Medium',
    color: PrepTalkTheme.colors.text,
  },
  refreshButton: {
    padding: 8,
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: PrepTalkTheme.colors.mediumGray,
    textAlign: 'center',
  },
searchContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 16,
  paddingVertical: 12,
  backgroundColor: PrepTalkTheme.colors.background,
  borderBottomWidth: 1,
  borderBottomColor: PrepTalkTheme.colors.border || '#E5E5E5',
  gap: 12,
},
searchInputContainer: {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: PrepTalkTheme.colors.cardBackground || '#F8F9FA',
  borderRadius: 8,
  paddingHorizontal: 12,
  minHeight: 40,
},
searchIcon: {
  marginRight: 8,
},
searchInput: {
  flex: 1,
  fontSize: 16,
  fontFamily: 'Nunito-Regular',
  color: PrepTalkTheme.colors.text,
  paddingVertical: 8,
},
clearButton: {
  padding: 4,
  marginLeft: 4,
},
searchButton: {
  backgroundColor: PrepTalkTheme.colors.primary,
  paddingHorizontal: 16,
  paddingVertical: 10,
  borderRadius: 8,
  minWidth: 70,
  alignItems: 'center',
  justifyContent: 'center',
},
searchButtonText: {
  color: 'white',
  fontSize: 14,
  fontFamily: 'Nunito-Bold',
},
filesList: {
  paddingHorizontal: 8, // Reduced padding for grid
  paddingTop: 8,
},
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: PrepTalkTheme.colors.cardBackground || '#FFFFFF',
    borderRadius: 12,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  fileIcon: {
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontFamily: 'Nunito-Medium',
    color: PrepTalkTheme.colors.text,
    marginBottom: 4,
  },
  fileDetails: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: PrepTalkTheme.colors.mediumGray,
  },
  fileAction: {
    padding: 8,
  },
gridRow: {
  justifyContent: 'space-around',
  paddingHorizontal: 8,
},
gridItem: {
  flex: 1,
  alignItems: 'center',
  paddingVertical: 16,
  paddingHorizontal: 8,
  marginVertical: 8,
  marginHorizontal: 4,
  backgroundColor: PrepTalkTheme.colors.cardBackground || '#FFFFFF',
  borderRadius: 12,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 2,
  elevation: 2,
  maxWidth: '31%', // Ensures 3 items per row with spacing
},
fileIconContainer: {
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 8,
  height: 50, // Fixed height for consistent layout
},
gridFileName: {
  fontSize: 12,
  fontFamily: 'Nunito-Medium',
  color: PrepTalkTheme.colors.text,
  textAlign: 'center',
  marginBottom: 4,
  minHeight: 16, // Reserve space for 2 lines of text
},
gridFileDate: {
  fontSize: 10,
  fontFamily: 'Nunito-Regular',
  color: PrepTalkTheme.colors.mediumGray,
  textAlign: 'center',
  marginBottom: 2,
},
gridFileSize: {
  fontSize: 10,
  fontFamily: 'Nunito-Regular',
  color: PrepTalkTheme.colors.mediumGray,
  textAlign: 'center',
},
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Lexend-Medium',
    color: PrepTalkTheme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: PrepTalkTheme.colors.mediumGray,
    textAlign: 'center',
    lineHeight: 24,
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: 'Lexend-Medium',
    color: PrepTalkTheme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: PrepTalkTheme.colors.mediumGray,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: PrepTalkTheme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
  },
  loadingMore: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  downloadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadingModal: {
    backgroundColor: 'white',
    paddingHorizontal: 32,
    paddingVertical: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  downloadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Nunito-Medium',
    color: PrepTalkTheme.colors.text,
  },
});