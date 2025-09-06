import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  RefreshControl,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Dimensions,
  Image,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { usePlacement } from "expo-superwall";
import Swiper from 'react-native-deck-swiper';
import { Ionicons } from '@expo/vector-icons';
import { Button } from "react-native";

import JobCard from '@/components/tabs/JobCard';
import { useJobs } from '@/services/JobsContext';
import { useAuth } from '@/services/AuthContext';
import { PrepTalkTheme, useResponsiveFontSize, useResponsiveSpacing, getResponsiveValue } from '@/constants/Theme';
import { Job } from '@/services/AuthTypes';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

function PaywallScreen() {
  const { registerPlacement, state: placementState } = usePlacement({
    onError: (err) => console.error("Placement Error:", err),
    onPresent: (info) => console.log("Paywall Presented:", info),
    onDismiss: (info, result) =>
      console.log("Paywall Dismissed:", info, "Result:", result),
  });

  const handleTriggerPlacement = async () => {
    await registerPlacement({
      placement: "campaign_trigger"
    });
  };

  return (
    <View style={{ padding: 20 }}>
      <Button title="Show Paywall" onPress={handleTriggerPlacement} />
      {placementState && (
        <Text>Last Paywall Result: {JSON.stringify(placementState)}</Text>
      )}
    </View>
  );
}

export default function ApplyScreen() {
  const { userProfile } = useAuth();
  const { 
    currentJobs, 
    isLoading, 
    error, 
    fetchRecommendedJobs,
    fetchQueuedJobs,
    markJobAsApplied,
    markJobAsPassed,
    refreshJobQueue
  } = useJobs();

  // Ref for the swiper
  const swiperRef = useRef<Swiper<Job>>(null);

  // Responsive values
    const responsiveValues = {
        titleFontSize: getResponsiveValue({
            small: 10,
            medium: 10,
            large: 10,
            xlarge: 20
        }),
        subtitleFontSize: getResponsiveValue({
            small: 10,
            medium: 10,
            large: 10,
            xlarge: 20
        }),
        bodyFontSize: getResponsiveValue({
            small: 10,
            medium: 10,
            large: 10,
            xlarge: 20
        }),
        mediumSpacing: getResponsiveValue({
            small: 10,
            medium: 12,
            large: 14,
            xlarge: 16
        }),
        actionButtonsVerticalPadding: getResponsiveValue({
            small: 20,
            medium: 10,
            large: 0,
            xlarge: 20
        }),
        actionButtonsTopMargin: getResponsiveValue({
            small: Platform.OS === 'ios' ? 5 : 480,
            medium: Platform.OS === 'ios' ? 670 : 480,
            large: Platform.OS === 'ios' ? 730 : 480,
            xlarge: Platform.OS === 'ios' ? 750 : 480,
        }),
        actionButtonSize: getResponsiveValue({
            small: 50,
            medium: 60,
            large: 70,
            xlarge: 80
        }),
        actionButtonIconSize: getResponsiveValue({
            small: 24,
            medium: 32,
            large: 36,
            xlarge: 40
        }),
        infoButtonSize: getResponsiveValue({
            small: 40,
            medium: 50,
            large: 60,
            xlarge: 70
        }),
        infoButtonIconSize: getResponsiveValue({
            small: 20,
            medium: 32,
            large: 36,
            xlarge: 40
        }),
    };

  // Load jobs when component mounts
  useEffect(() => {
    const loadJobs = async () => {
      try {
        console.log('Loading jobs for user:', userProfile?.id);
        console.log('User profile title_requests:', userProfile?.title_requests);
        
        // First try to load existing queued jobs
        await fetchQueuedJobs();
        
        // If no queued jobs, fetch recommendations
        // Note: This logic might need adjustment based on your needs
      } catch (error) {
        console.error('Error loading jobs:', error);
      }
    };

    if (userProfile?.id) {
      loadJobs();
    }
  }, [userProfile?.id]);

  // Handle card swipe actions
  const handleSwipeLeft = async (cardIndex: number) => {
    const job = currentJobs[cardIndex];
    if (job) {
      console.log('Swiped left (pass):', job.job_title);
      try {
        await markJobAsPassed(job.job_id);
      } catch (error) {
        console.error('Error passing on job:', error);
      }
    }
  };

  const handleSwipeRight = async (cardIndex: number) => {
    const job = currentJobs[cardIndex];
    if (job) {
      console.log('Swiped right (apply):', job.job_title);
      try {
        await markJobAsApplied(job.job_id);
        Alert.alert('Success', `Applied to ${job.job_title} at ${job.company_name}!`);
      } catch (error) {
        console.error('Error applying to job:', error);
        Alert.alert('Error', 'Failed to apply to job');
      }
    }
  };

  // Handle manual button actions
  const handlePassJob = async () => {
    if (swiperRef.current && currentJobs.length > 0) {
      swiperRef.current.swipeLeft();
    }
  };

  const handleApplyToJob = async () => {
    if (swiperRef.current && currentJobs.length > 0) {
      swiperRef.current.swipeRight();
    }
  };
  
  // Handle job actions
  const handleViewJob = (job: Job) => {
    console.log('View job:', job.job_id, job.job_title);
    // TODO: Navigate to job details screen
    Alert.alert('View Job', `Job: ${job.job_title} at ${job.company_name}`);
  };

  const handleRefresh = async () => {
    try {
      console.log('Refreshing job queue...');
      await refreshJobQueue();
    } catch (error) {
      console.error('Error refreshing jobs:', error);
    }
  };

  const handleFetchRecommendations = async () => {
    try {
      console.log('Fetching job recommendations...');
      await fetchRecommendedJobs();
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  // Handle when all cards are swiped
  const handleSwipedAll = () => {
    console.log('All cards swiped!');
    Alert.alert(
      'No More Jobs',
      'You\'ve reviewed all available jobs. Would you like to get more recommendations?',
      [
        { text: 'Not Now', style: 'cancel' },
        { text: 'Get More Jobs', onPress: handleFetchRecommendations }
      ]
    );
  };

  // Render loading state
  if (isLoading && currentJobs.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={PrepTalkTheme.colors.gradientBackground.colors}
          start={PrepTalkTheme.colors.gradientBackground.start}
          end={PrepTalkTheme.colors.gradientBackground.end}
          locations={PrepTalkTheme.colors.gradientBackground.locations}
          style={StyleSheet.absoluteFill}
        >
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={PrepTalkTheme.colors.primary} />
            <Text style={[styles.loadingText, { fontSize: responsiveValues.bodyFontSize}]}>
              Finding jobs for you...
            </Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Render error state
  if (error && currentJobs.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={PrepTalkTheme.colors.gradientBackground.colors}
          start={PrepTalkTheme.colors.gradientBackground.start}
          end={PrepTalkTheme.colors.gradientBackground.end}
          locations={PrepTalkTheme.colors.gradientBackground.locations}
          style={StyleSheet.absoluteFill}
        >
          <View style={styles.centerContent}>
            <Text style={[styles.errorTitle, { fontSize: responsiveValues.titleFontSize }]}>
              Unable to Load Jobs
            </Text>
            <Text style={[styles.errorText, { fontSize: responsiveValues.bodyFontSize}]}>
              {error}
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleFetchRecommendations}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Render empty state
  if (!isLoading && currentJobs.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={PrepTalkTheme.colors.gradientBackground.colors}
          start={PrepTalkTheme.colors.gradientBackground.start}
          end={PrepTalkTheme.colors.gradientBackground.end}
          locations={PrepTalkTheme.colors.gradientBackground.locations}
          style={StyleSheet.absoluteFill}
        >
          <View style={styles.centerContent}>
            <Text style={[styles.emptyTitle, { fontSize: responsiveValues.titleFontSize }]}>
              No Jobs Available
            </Text>
            <Text style={[styles.emptyText, { fontSize: responsiveValues.bodyFontSize}]}>
              We couldn't find any jobs matching your profile right now.
            </Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleFetchRecommendations}
              >
                <Text style={styles.primaryButtonText}>Get Recommendations</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleRefresh}
              >
                <Text style={styles.secondaryButtonText}>Refresh Jobs</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Render card stack
  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
      <LinearGradient
        colors={PrepTalkTheme.colors.gradientBackground.colors}
        start={PrepTalkTheme.colors.gradientBackground.start}
        end={PrepTalkTheme.colors.gradientBackground.end}
        locations={PrepTalkTheme.colors.gradientBackground.locations}
        style={StyleSheet.absoluteFill}
      >

        {/* Card Stack */}
        <View style={styles.swiperContainer}>
          <Swiper
            ref={swiperRef}
            cards={currentJobs}
            renderCard={(job: Job) => (
              <JobCard
                job={job}
                onPress={handleViewJob}
                // Remove the old button handlers since we're using swipe gestures
                onApply={undefined}
                onSave={undefined}
                isSaved={false}
              />
            )}
            onSwipedLeft={handleSwipeLeft}
            onSwipedRight={handleSwipeRight}
            onSwipedAll={handleSwipedAll}
            cardIndex={0}
            backgroundColor="transparent"
            stackSize={3}
            stackScale={10}
            stackSeparation={15}
            animateOverlayLabelsOpacity
            animateCardOpacity
            swipeBackCard
            disableTopSwipe
            disableBottomSwipe
            overlayLabels={{
              left: {
                title: 'PASS',
                style: {
                  label: styles.overlayLabelLeft,
                  wrapper: styles.overlayWrapperLeft,
                },
              },
              right: {
                title: 'APPLY',
                style: {
                  label: styles.overlayLabelRight,
                  wrapper: styles.overlayWrapperRight,
                },
              },
            }}
            cardVerticalMargin={0}
            containerStyle={[styles.swiperInner]}
          />
        </View>

        {/* Action Buttons */}
        <View style={[styles.actionButtons, {paddingVertical: responsiveValues.actionButtonsVerticalPadding,
                                             marginTop: responsiveValues.actionButtonsTopMargin
        }]}>
          <TouchableOpacity
            style={[styles.actionButton, styles.passButton, {width: responsiveValues.actionButtonSize,
                                                             height: responsiveValues.actionButtonSize
            }]}
            onPress={handlePassJob}
            >
            <Image
                source={require('@/assets/images/apply/xmark.png')}
                style={{
                width: responsiveValues.actionButtonIconSize, // Match the size from the original Ionicons
                height: responsiveValues.actionButtonIconSize,
                tintColor: "#FB7354",
                }}
                resizeMode="contain"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.infoButton, {width: responsiveValues.infoButtonSize,
                                                             height: responsiveValues.infoButtonSize
            }]}
            onPress={() => {
              const currentJob = currentJobs[0];
              if (currentJob) handleViewJob(currentJob);
            }}
          >
            <Ionicons name="information" size={responsiveValues.actionButtonIconSize} color={PrepTalkTheme.colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.applyButton, {width: responsiveValues.actionButtonSize,
                                                             height: responsiveValues.actionButtonSize
            }]}
            onPress={handleApplyToJob}
          >
            <Image
                source={require('@/assets/images/apply/paperplane.png')}
                style={{
                width: responsiveValues.actionButtonIconSize,
                height: responsiveValues.actionButtonIconSize,
                tintColor: "#1BBF1B", // This will make the image white to match your button text color
                }}
                resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  swiperContainer: {
    flex: Platform.OS === 'ios' ? 0.1 : 0.9,
    paddingHorizontal: 10,
    marginTop: 0,
  },
  swiperInner: {
    backgroundColor: 'transparent',
    marginTop: 0,
    padding: 0
  },
  card: {
    borderRadius: 16,
    marginTop: 0,
    padding: 0
  },
  // Overlay labels for swipe feedback
  overlayLabelLeft: {
    fontSize: 32,
    fontFamily: 'Lexend-Bold',
    color: '#FB7354',
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
  overlayWrapperLeft: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    marginTop: 120,
    marginLeft: -60,
  },
  overlayLabelRight: {
    fontSize: 32,
    fontFamily: 'Lexend-Bold',
    color: '#1BBF1B',
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
  overlayWrapperRight: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginTop: 120,
    marginRight: -60,
  },
  // Action buttons at bottom
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 50,
    gap: 50,
    zIndex: 999,
  },
  actionButton: {
    borderRadius: 50,
    backgroundColor: PrepTalkTheme.colors.light,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  passButton: {
    borderWidth: 2,
    borderColor: '#FB7354',
  },
  infoButton: {
    borderWidth: 2,
    borderColor: PrepTalkTheme.colors.primary,
    width: 50,
    height: 50,
    borderRadius: 50,
  },
  applyButton: {
    borderWidth: 2,
    borderColor: '#1BBF1B',
  },
  // Loading, error, and empty states
  loadingText: {
    fontFamily: 'Nunito-Regular',
    color: PrepTalkTheme.colors.text,
    textAlign: 'center',
  },
  errorTitle: {
    fontFamily: 'Lexend-Bold',
    color: PrepTalkTheme.colors.text,
    textAlign: 'center',
  },
  errorText: {
    fontFamily: 'Nunito-Regular',
    color: PrepTalkTheme.colors.mediumGray,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontFamily: 'Lexend-Bold',
    color: PrepTalkTheme.colors.text,
    textAlign: 'center',
  },
  emptyText: {
    fontFamily: 'Nunito-Regular',
    color: PrepTalkTheme.colors.mediumGray,
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonContainer: {
    gap: 15,
    width: '100%',
    paddingHorizontal: 20,
  },
  primaryButton: {
    backgroundColor: PrepTalkTheme.colors.primary,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontFamily: 'Nunito-Bold',
    color: PrepTalkTheme.colors.light,
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: PrepTalkTheme.colors.primary,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontFamily: 'Nunito-Bold',
    color: PrepTalkTheme.colors.primary,
    fontSize: 16,
  },
  retryButton: {
    backgroundColor: PrepTalkTheme.colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
  },
  retryButtonText: {
    fontFamily: 'Nunito-Bold',
    color: PrepTalkTheme.colors.light,
    fontSize: 16,
  },
});