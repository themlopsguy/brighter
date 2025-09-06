// app/onboarding/resume.tsx

import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  useWindowDimensions,
  Alert,
  ActivityIndicator,
  Animated,
  Image,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { 
  PrepTalkTheme, 
  useResponsiveFontSize, 
  useResponsiveSpacing, 
  useResponsiveHeaderPadding,
  getResponsiveValue 
} from '@/constants/Theme';
//import { useOnboardingData } from './_layout';
import { useAuth } from '@/services/AuthContext';
import ResumeService from '@/services/ResumeService';
import DriveFileBrowser from '@/components/DriveFileBrowser';
import { DriveFile } from '@/services/GoogleDriveService';
import { useRouter } from 'expo-router';
import Rive from 'rive-react-native';
import { Asset } from 'expo-asset';
import CustomAlert from '@/components/CustomAlert';

const API_BASE_URL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:3000'  // Android emulator
  : 'http://localhost:3000'; // iOS simulator  // 'https://your-production-api-url.com';

export default function OnboardingResume() {
  const router = useRouter();
  const { userProfile, updateUserProfile } = useAuth();
  const { currentUser } = useAuth();
  const { width } = useWindowDimensions();
  
  // State management
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedResume, setUploadedResume] = useState<string>(''); // Resume filename or URL
  const [showDriveBrowser, setShowDriveBrowser] = useState(false);
  const [showUploadingOverlay, setShowUploadingOverlay] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  
  // Animation refs
  const buttonAnimationRefs = useRef<Animated.Value[]>([]);
  const successAnimationRef = useRef(new Animated.Value(0));

  // Use responsive utilities
  const titleFontSize = useResponsiveFontSize('title');
  const subtitleFontSize = useResponsiveFontSize('subtitle');
  const headerPadding = useResponsiveHeaderPadding();
  const mediumSpacing = useResponsiveSpacing('medium');

  const riveAsset = Asset.fromModule(require('@/assets/animations/loading.riv'));

  // Custom responsive values for this specific component
  const responsiveValues = {
    animationSize: getResponsiveValue({
      small: 140,
      medium: 160,
      large: 180,
      xlarge: 200
    }),
    subtitleWidth: getResponsiveValue({
      small: 260,
      medium: 280,
      large: 310,
      xlarge: 340
    }),
    buttonFontSize: getResponsiveValue({
      small: 14,
      medium: 16,
      large: 18,
      xlarge: 20
    }),
    buttonPaddingVertical: getResponsiveValue({
      small: 30,
      medium: 40,
      large: 50,
      xlarge: 18
    }),
    buttonPaddingHorizontal: getResponsiveValue({
      small: 24,
      medium: 26,
      large: 28,
      xlarge: 30
    }),
    buttonInternalGap: getResponsiveValue({
      small: 5,
      medium: 5,
      large: 5,
      xlarge: 5
    }),
    buttonGap: getResponsiveValue({
      small: 12,
      medium: 14,
      large: 16,
      xlarge: 18
    }),
    horizontalPaddingPercent: getResponsiveValue({
      small: 0.12,
      medium: 0.10,
      large: 0.08,
      xlarge: 0.06
    }),
    iconSize: getResponsiveValue({
      small: 30,
      medium: 35,
      large: 42,
      xlarge: 26
    }),
    successContainerVerticalPadding: getResponsiveValue({
      small: 15,
      medium: 30,
      large: 30,
      xlarge: 30
    }),
    successContainerHorizontalPadding: getResponsiveValue({
      small: 15,
      medium: 20,
      large: 20,
      xlarge: 20
    }),
    successIconSize: getResponsiveValue({
      small: 30,
      medium: 40,
      large: 40,
      xlarge: 40
    }),
    successIconMarginBottom: getResponsiveValue({
      small: 10,
      medium: 15,
      large: 15,
      xlarge: 15
    }),
    successTitleFontSize: getResponsiveValue({
      small: 18,
      medium: 18,
      large: 18,
      xlarge: 18
    }),
    successTitleMarginBottom: getResponsiveValue({
      small: 8,
      medium: 8,
      large: 8,
      xlarge: 8
    }),
    successSubtitleFontSize: getResponsiveValue({
      small: 14,
      medium: 14,
      large: 14,
      xlarge: 14
    }),
    successSubtitleMarginBottom: getResponsiveValue({
      small: 8,
      medium: 8,
      large: 8,
      xlarge: 8
    })
  };

  // Calculate actual pixel value for horizontal padding
  const horizontalPadding = width * responsiveValues.horizontalPaddingPercent;

  // Handler for skip action
  const handleSkip = () => {
    setShowAlert(false);
    // Navigate to your desired screen
    router.push('/onboarding/referral'); // Replace with your actual route
  };

  // Handler for cancel action
  const handleCancel = () => {
    setShowAlert(false);
    // Just dismiss the alert, no navigation
  };

// In your useEffect:
useEffect(() => {
  const hasUploadedResume = userProfile?.resume_url && userProfile.resume_url !== '';
  if (hasUploadedResume) {
    try {
      const resumeData = JSON.parse(userProfile.resume_url || '');
      setUploadedResume(resumeData.fileName);
    } catch {
      // Fallback for old format (just URL)
      setUploadedResume('Previously uploaded resume');
    }
  }
}, [userProfile?.resume_url]);

  // Animation setup
  useEffect(() => {
    // Determine number of buttons to animate
    const buttonCount = uploadedResume ? 1 : 2; // 1 for success state, 2 for upload buttons
    
    // Reset animation refs
    buttonAnimationRefs.current = Array.from({ length: buttonCount }, () => new Animated.Value(0));

    // Animate main buttons
    const buttonAnimations = buttonAnimationRefs.current.map((animValue, index) =>
      Animated.spring(animValue, {
        toValue: 1,
        delay: index * 100, // Stagger each button by 100ms
        useNativeDriver: true,
        tension: 30,
        friction: 6,
      })
    );

    // Start all animations
    Animated.parallel([...buttonAnimations]).start();
  }, [uploadedResume]);

  // Success animation when resume is uploaded
  useEffect(() => {
    if (uploadedResume) {
      Animated.spring(successAnimationRef.current, {
        toValue: 1,
        useNativeDriver: true,
        tension: 30,
        friction: 6,
      }).start();
    }
  }, [uploadedResume]);

  // Handle file upload from device
  const handleUploadFromDevice = async () => {
    if (!currentUser?.id) {
      Alert.alert('Error', 'Please log in to upload your resume.');
      return;
    }

    try {
      setTimeout(() => setShowUploadingOverlay(true), 700);
      
      // Pick document
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

        // Better cancellation check for Android
        if (result.canceled || !result.assets || result.assets.length === 0) {
        console.log('Document picker was canceled or no file selected');
        console.log('Current showUploadingOverlay state:', showUploadingOverlay); // Debug log
        
        // Force hide overlay immediately with multiple approaches
        setShowUploadingOverlay(false);
        
        // Also force update with a slight delay to ensure state change
        setTimeout(() => {
            console.log('Force hiding overlay after timeout');
            setShowUploadingOverlay(false);
        }, 100);
        
        return;
        }

        const file = result.assets[0];

        // Additional check - if file is null/undefined (Android edge case)
        if (!file || !file.name) {
           console.log('No valid file selected');
           setShowUploadingOverlay(false);
           return;
        }


      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];

        console.log('=== FILE DEBUG INFO ===');
        console.log('File object:', JSON.stringify(file, null, 2));
        console.log('File name:', file.name);
        console.log('File type:', file.mimeType);
        console.log('File URI:', file.uri);
        console.log('File size:', file.size);
        console.log('========================');

        if (!file.name.toLowerCase().endsWith('.pdf')) {
          Alert.alert('Error', 'Please select a PDF file.');
          setShowUploadingOverlay(false);
          return;
        }

        console.log('Uploading resume to Supabase...');

        // Upload to Supabase
        const uploadResult = await ResumeService.uploadResume(file, currentUser.id);
        
        if (uploadResult.success && uploadResult.resumeUrl) {
          // Update state
          setUploadedResume(file.name);
        
          // Update onboarding context
          const resumeData = JSON.stringify({
            url: uploadResult.resumeUrl,
            fileName: file.name
          });
          const parsedResumeData = JSON.parse(resumeData);
          updateUserProfile({ 
            resume_url: parsedResumeData.url,
            resume_local_path: uploadResult.localPath || ''
          });

          triggerResumeProcessing(currentUser.id, uploadResult.resumeUrl);
        
          // Hide the overlay to show success message
          setShowUploadingOverlay(false);  // Add this line
        
          console.log('Resume uploaded successfully:', uploadResult.resumeUrl);
          console.log('Resume stored locally at:', uploadResult.localPath);
        } else {
          setShowUploadingOverlay(false);  // Add this line too
          Alert.alert('Upload Error', uploadResult.error || 'Failed to upload resume. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error uploading resume:', error);
      Alert.alert('Upload Error', 'Failed to upload resume. Please try again.');
    } 
  };

    const triggerResumeProcessing = async (userId: string, resumeUrl: string) => {
    try {
        console.log('Triggering resume processing...');
        
        // Encode the URL parameter properly
        const encodedResumeUrl = encodeURIComponent(resumeUrl);
        
        const response = await fetch(
        `${API_BASE_URL}/api/v1/resume/process?user_id=${userId}&resume_url=${encodedResumeUrl}`, 
        {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            // Remove the body since we're using query parameters
        }
        );
        
        if (response.ok) {
        const result = await response.json();
        console.log('Resume processing started successfully:', result.message);
        } else {
        console.error('Failed to start resume processing:', response.status);
        }
    } catch (error) {
        console.error('Error triggering resume processing:', error);
    }
    };

    // Handle upload from Google Drive
    const handleUploadFromGoogleDrive = async () => {
      setShowDriveBrowser(true);
    };

    // Add this new function after handleUploadFromGoogleDrive
    const handleDriveFileSelected = async (file: DriveFile, fileData: ArrayBuffer) => {
    try {
        setTimeout(() => setShowUploadingOverlay(true), 700);
        
        console.log('Processing Drive file:', file.name);
        
        // Convert ArrayBuffer to File-like object for our existing upload logic
        const driveFile = {
        uri: `temp://drive-file-${file.id}`,
        name: file.name,
        type: 'application/pdf',
        size: fileData.byteLength,
        arrayBuffer: fileData // Store the actual data
        };
        
        // Use existing upload logic
        const uploadResult = await ResumeService.uploadDriveFile(driveFile, currentUser!.id);
        
        if (uploadResult.success && uploadResult.resumeUrl) {
          // Update state (same as device upload)
          setUploadedResume(file.name);
          const resumeData = JSON.stringify({
            url: uploadResult.resumeUrl,
            fileName: file.name
            });
          const parsedResumeData = JSON.parse(resumeData);
          updateUserProfile({ 
            resume_url: parsedResumeData.url,
            resume_local_path: uploadResult.localPath || ''
          });
        
          // Trigger background processing
          triggerResumeProcessing(currentUser!.id, uploadResult.resumeUrl);
        
          // Hide the overlay to show success message
          setShowUploadingOverlay(false);  // Add this line
        
          console.log('Drive file uploaded successfully:', uploadResult.resumeUrl);
        } else {
          setShowUploadingOverlay(false);  // Add this line too
          Alert.alert('Upload Error', uploadResult.error || 'Failed to upload Drive file. Please try again.');
        }
    } catch (error) {
        console.error('Error processing Drive file:', error);
        Alert.alert('Upload Error', 'Failed to process file from Google Drive.');
    } finally {
        setShowUploadingOverlay(false);
    }
    };

  // Handle re-upload (if user wants to change resume)
  const handleReUpload = () => {
    setUploadedResume('');
    updateUserProfile({resume_url: ''});
  };

  return (
    <View style={styles.content}>
      <View style={[
        styles.headerSection,
        { 
          paddingTop: headerPadding,
          paddingHorizontal: horizontalPadding 
        }
      ]}>

        <View
          style={[
            styles.textContainer,
          ]}
        >
          <Text style={[
            styles.title, 
            { fontSize: titleFontSize }
          ]}>
            Upload your resume
          </Text>
          
          <Text style={[
            styles.subtitle, 
            { 
              fontSize: subtitleFontSize,
              width: responsiveValues.subtitleWidth
            }
          ]}>
            We'll extract your experience and skills to help match you with better opportunities.
          </Text>
        </View>

        <View style={[
          styles.buttonContainer,
          { 
            marginTop: mediumSpacing * 1,
            gap: responsiveValues.buttonGap,
            ...(uploadedResume && {
              flex: 0.6,
              justifyContent: 'center',
              marginTop: 0, // Remove top margin when centering
            })
          }
        ]}>
            {showUploadingOverlay ? (
                // Show large spinner when uploading
                <View style={styles.uploadingOverlay}>
              <Rive
                url={riveAsset.localUri || riveAsset.uri}
                style={{ width: 200, height: 200, opacity: 0.8}}
                autoplay={true}
              />
                <Text style={styles.uploadingText}>Uploading resume...</Text>
                </View>
            ) : !uploadedResume ? (
            // Show upload buttons when no resume is uploaded
            <>
              <Animated.View style={[
                {
                  transform: [
                    {
                      translateY: buttonAnimationRefs.current[0]?.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-50, 0],
                      }) || 0,
                    },
                  ],
                  opacity: buttonAnimationRefs.current[0] || 1,
                  width: '100%',
                }
              ]}>
                <TouchableOpacity
                  style={[
                    styles.uploadButton,
                    { 
                      paddingVertical: responsiveValues.buttonPaddingVertical,
                      paddingHorizontal: responsiveValues.buttonPaddingHorizontal
                    },
                    {gap: responsiveValues.buttonInternalGap}
                  ]}
                  onPress={handleUploadFromDevice}
                  disabled={showUploadingOverlay}
                  activeOpacity={0.8}
                >
                  {isUploading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <>
                      <Ionicons 
                        name="phone-portrait" 
                        size={responsiveValues.iconSize} 
                        color={PrepTalkTheme.colors.primaryDark}
                        style={styles.buttonIcon}
                      />
                      <Text style={[
                        styles.uploadButtonText,
                        { fontSize: responsiveValues.buttonFontSize }
                      ]}>
                        Upload from device
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </Animated.View>

              <Animated.View style={[
                {
                  transform: [
                    {
                      translateY: buttonAnimationRefs.current[1]?.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-50, 0],
                      }) || 0,
                    },
                  ],
                  opacity: buttonAnimationRefs.current[1] || 1,
                  width: '100%',
                }
              ]}>
                <TouchableOpacity
                  style={[
                    styles.uploadButton,
                    { 
                      paddingVertical: responsiveValues.buttonPaddingVertical,
                      paddingHorizontal: responsiveValues.buttonPaddingHorizontal
                    },
                    {gap: responsiveValues.buttonInternalGap}
                  ]}
                  onPress={handleUploadFromGoogleDrive}
                  disabled={showUploadingOverlay}
                  activeOpacity={0.8}
                >
                <Image 
                    source={require('@/assets/images/google-drive-icon.png')}
                    style={[
                    styles.buttonIcon,
                    { 
                        width: responsiveValues.iconSize - 10, 
                        height: responsiveValues.iconSize - 10 
                    },
                    {opacity: 0.7}
                    ]}
                    resizeMode="contain"
                />
                  <Text style={[
                    styles.uploadButtonText,
                    { fontSize: responsiveValues.buttonFontSize }
                  ]}>
                    Upload from Google Drive
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </>
          ) : (
            // Show success state when resume is uploaded
            <Animated.View style={[
              {
                transform: [
                  {
                    translateY: successAnimationRef.current.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  },
                ],
                opacity: successAnimationRef.current,
                width: '100%',
              }
            ]}>
              <View style={[styles.successContainer,
              {    
                paddingVertical: responsiveValues.successContainerVerticalPadding,
                paddingHorizontal: responsiveValues.successContainerHorizontalPadding,
              }
              ]}>
                
                <Ionicons 
                  name="checkmark-circle" 
                  size={responsiveValues.successIconSize} 
                  color={'#4CAF50'} 
                  style={
                    {marginBottom: responsiveValues.successIconMarginBottom}
                  }
                />
                <Text style={[styles.successTitle,
                  {
                    fontSize: responsiveValues.successTitleFontSize,
                    marginBottom: responsiveValues.successTitleMarginBottom
                  }
                ]}>
                  Resume uploaded!
                </Text>
                <Text style={[styles.successSubtitle,
                  {
                    fontSize: responsiveValues.successSubtitleFontSize,
                    marginBottom: responsiveValues.successSubtitleMarginBottom
                  }
                ]}>
                  {uploadedResume}
                </Text>
                
                <TouchableOpacity
                  style={styles.reUploadButton}
                  onPress={handleReUpload}
                  activeOpacity={0.7}
                >
                  <Text style={styles.reUploadText}>Upload different resume</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
            {/* {__DEV__ && (
            <TouchableOpacity
                style={{
                position: 'relative',
                top: 50,
                right: 20,
                backgroundColor: 'red',
                padding: 10,
                borderRadius: 5,
                }}
                    onPress={async () => {
                    console.log('DEBUG: Force clearing Google auth...');
                    await googleDriveService.debugResetEverything();
                    
                    // Close and reopen the drive browser to force fresh auth
                    setShowDriveBrowser(false);
                    
                    Alert.alert('Debug', 'Google auth cleared! The next Drive upload will require fresh login.', [
                        {
                        text: 'OK',
                        onPress: () => {
                            // Small delay then show browser again to test
                            setTimeout(() => setShowDriveBrowser(true), 500);
                        }
                        }
                    ]);
                    }}
            >
                <Text style={{ color: 'white', fontSize: 12 }}>
                RESET GOOGLE AUTH
                </Text>
            </TouchableOpacity>
            )} */}
        </View>

      </View>
        <DriveFileBrowser
        isVisible={showDriveBrowser}
        onClose={() => setShowDriveBrowser(false)}
        onFileSelected={handleDriveFileSelected}
        />

        {/* Skip Button - separate container at bottom */}
        <View style={styles.skipButtonContainer}>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => {
              setUploadedResume('');
              updateUserProfile({resume_url: ''});
              setShowAlert(true)
            }}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.skipButtonText,
              { fontSize: responsiveValues.buttonFontSize * 0.9 }
            ]}>
              Skip for now
            </Text>
          </TouchableOpacity>
        </View>

        <CustomAlert
          isVisible={showAlert}
          title="Skip this step?"
          message={"Nearly all applications ask for a resume."}
          primaryButtonTitle="Cancel"
          primaryButtonAction={handleCancel}
          secondaryButtonTitle="Skip"
          secondaryButtonAction={handleSkip}
          onBackdropPress={handleCancel}
        />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  headerSection: {
    alignItems: 'center',
    flex: 1,
  },
  resumeAnimation: {
    alignSelf: 'center',
    marginBottom: 30,
  },
  animationPlaceholder: {
    backgroundColor: PrepTalkTheme.colors.primaryLight + '20',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: PrepTalkTheme.colors.primary,
    borderStyle: 'dashed',
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Lexend-Regular',
    color: PrepTalkTheme.colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Nunito-Regular',
    color: PrepTalkTheme.colors.mediumGray,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  uploadButton: {
    backgroundColor: PrepTalkTheme.colors.primary + '22',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: 25,
    borderStyle: 'dashed',
    borderColor: PrepTalkTheme.colors.primary,
    width: '100%',
  },
  uploadButtonText: {
    color: PrepTalkTheme.colors.primaryDark,
    fontFamily: 'Nunito-Bold',
  },
  buttonIcon: {
    marginRight: 8,
  },
  successContainer: {
    alignItems: 'center',
    backgroundColor: '#E8F5E855',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4CAF50',
    width: '100%',
  },
  successTitle: {
    fontFamily: 'Lexend-Bold',
    color: '#4CAF50',
  },
  successSubtitle: {
    fontFamily: 'Nunito-Regular',
    color: PrepTalkTheme.colors.mediumGray,
    textAlign: 'center',
  },
  reUploadButton: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: PrepTalkTheme.colors.primary,
    backgroundColor: PrepTalkTheme.colors.primary + '11'
  },
  reUploadText: {
    fontSize: 14,
    fontFamily: 'Nunito-Medium',
    color: PrepTalkTheme.colors.primaryDark,
  },
uploadingOverlay: {
  position: 'absolute',
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 20,
  width: '100%',
},
uploadingText: {
  fontSize: 18,
  fontFamily: 'Nunito-Medium',
  color: PrepTalkTheme.colors.primaryDark,
  textAlign: 'center',
},
  skipButtonContainer: {
    position: 'absolute',
    bottom: 10, // Distance from bottom of headerSection
    left: 0,
    right: 0,
    alignItems: 'center',
    //paddingHorizontal: horizontalPadding, // You might need to make this a variable or use a fixed value like 40
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  skipButtonText: {
    fontFamily: 'Nunito-Medium',
    color: PrepTalkTheme.colors.mediumGray,
    textAlign: 'center',
  },
});