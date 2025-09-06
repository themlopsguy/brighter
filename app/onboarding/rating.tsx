// app/onboarding/rating.tsx

import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  useWindowDimensions,
  Animated
} from 'react-native';
import * as StoreReview from 'expo-store-review';
import { 
  PrepTalkTheme, 
  useResponsiveFontSize, 
  useResponsiveSpacing, 
  useResponsiveHeaderPadding,
  getResponsiveValue 
} from '@/constants/Theme';
import { useRouter } from 'expo-router';
import { useFooterActions } from './_layout';
import { useAuth } from '@/services/AuthContext';
import Rive from 'rive-react-native';
import { Asset } from 'expo-asset';

export default function OnboardingRating() {
  const router = useRouter();
  const { userProfile, updateUserProfile } = useAuth();
  const { setCustomFooterAction } = useFooterActions();
  const { width } = useWindowDimensions();
  const [hasShownRatingPrompt, setHasShownRatingPrompt] = useState(false);
  const [showRatedButton, setShowRatedButton] = useState(false);
  const riveAsset = Asset.fromModule(require('@/assets/animations/rating.riv'));
  
  // Animation refs
  const buttonAnimationRef = useRef(new Animated.Value(0));
  const ratedButtonAnimationRef = useRef(new Animated.Value(0));

  // Use responsive utilities
  const titleFontSize = useResponsiveFontSize('title');
  const subtitleFontSize = useResponsiveFontSize('subtitle');
  const headerPadding = useResponsiveHeaderPadding();
  const mediumSpacing = useResponsiveSpacing('medium');

  // Custom responsive values for this specific component
  const responsiveValues = {
    animationSize: getResponsiveValue({
      small: 400,
      medium: 550,
      large: 600,
      xlarge: 200
    }),
    animationMaxHeight: getResponsiveValue({
        small: 350,
        medium: 450,
        large: 500,
        xlarge: 110
    }),
    subtitleWidth: getResponsiveValue({
      small: 240,
      medium: 260,
      large: 290,
      xlarge: 320
    }),
    buttonFontSize: getResponsiveValue({
      small: 14,
      medium: 16,
      large: 18,
      xlarge: 20
    }),
    ratedButtonFontSize: getResponsiveValue({
      small: 15,
      medium: 17,
      large: 19,
      xlarge: 22
    }),
    buttonPaddingVertical: getResponsiveValue({
      small: 12,
      medium: 14,
      large: 16,
      xlarge: 18
    }),
    buttonPaddingHorizontal: getResponsiveValue({
      small: 24,
      medium: 26,
      large: 28,
      xlarge: 30
    }),
    horizontalPaddingPercent: getResponsiveValue({
      small: 0.12,
      medium: 0.10,
      large: 0.08,
      xlarge: 0.06
    }),
  };

  // Calculate actual pixel value for horizontal padding
  const horizontalPadding = width * responsiveValues.horizontalPaddingPercent;

  // Animation for "I rated!" button when it appears
  useEffect(() => {
    if (showRatedButton) {
      Animated.spring(ratedButtonAnimationRef.current, {
        toValue: 1,
        useNativeDriver: true,
        tension: 30,
        friction: 6,
      }).start();
    }
  }, [showRatedButton]);

  // Initial animation for the main content
  useEffect(() => {
    // Delay to let screen load, then animate
    const timer = setTimeout(() => {
      Animated.spring(buttonAnimationRef.current, {
        toValue: 1,
        useNativeDriver: true,
        tension: 30,
        friction: 6,
      }).start();
    }, 300);

    return () => clearTimeout(timer);
  }, []);

    useEffect(() => {
    if (!hasShownRatingPrompt) {
        // Footer should trigger rating prompt
        setCustomFooterAction?.(() => handleRequestRating);
    } else {
        // Footer should navigate to next screen
        setCustomFooterAction?.(undefined);
    }

    // Cleanup on unmount
    return () => {
        setCustomFooterAction?.(undefined);
    };
    }, [hasShownRatingPrompt, setCustomFooterAction]);

    useEffect(() => {
    const hasCompletedRating = userProfile?.rating && userProfile?.rating !== '';
    if (hasCompletedRating) {
        setHasShownRatingPrompt(true);
        setShowRatedButton(true);
        setCustomFooterAction?.(undefined);
    }
    }, [userProfile?.rating, setCustomFooterAction]);

  const handleRequestRating = async () => {
    try {
      // Check if the device supports in-app review
      const isAvailable = await StoreReview.isAvailableAsync();
      
      if (isAvailable) {
        // Show the native rating prompt
        await StoreReview.requestReview();
        
        // Mark that we've shown the prompt and show the "I rated!" button
        setHasShownRatingPrompt(true);
        setShowRatedButton(true);
        
        // Update onboarding data to mark rating as completed
        updateUserProfile({rating: 'prompted'})

        // Remove custom footer action so footer can navigate normally
      setCustomFooterAction?.(undefined);
      } else {
        // Fallback for devices that don't support in-app review
        console.log('In-app review not available on this device');
        setHasShownRatingPrompt(true);
        setShowRatedButton(true);
        updateUserProfile({rating: 'not_available'})
        setCustomFooterAction?.(undefined);
      }
    } catch (error) {
      console.error('Error requesting review:', error);
      // Still allow user to continue
      setHasShownRatingPrompt(true);
      setShowRatedButton(true);
      updateUserProfile({rating: 'error'})
      setCustomFooterAction?.(undefined);
    }
  };

  const handleRatedButtonPress = () => {
    // User claims they rated, mark as completed
    updateUserProfile({rating: 'completed'})

    // Navigate to next screen
    router.push('/onboarding/resume');
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
        {/* Title and Subtitle at top */}
        <View
          style={[
            styles.textContainer,
          ]}
        >
          <Text style={[
            styles.title, 
            { fontSize: titleFontSize }
          ]}>
            Give us a rating!
          </Text>
          
          <Text style={[
            styles.subtitle, 
            { 
              fontSize: subtitleFontSize,
              width: responsiveValues.subtitleWidth
            }
          ]}>
            Every rating helps us improve the app and give you a better experience!
          </Text>
        </View>

        {/* Rive Animation below subtitle */}
        <Animated.View 
          style={[
            styles.ratingAnimation,
            {
              transform: [
                {
                  translateY: buttonAnimationRef.current.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-30, 0],
                  }),
                },
              ],
              opacity: buttonAnimationRef.current,
              maxHeight: responsiveValues.animationMaxHeight,
            }
          ]}
        >
          {/* Replace this with your Rive animation */}
            <Rive
              url={riveAsset.localUri || riveAsset.uri}
              style={{ width: responsiveValues.animationSize, height: responsiveValues.animationSize }}
              autoplay={true}
            />
        </Animated.View>

        {/* Show "I rated!" button after rating prompt is shown */}
        {showRatedButton && (
          <Animated.View
            style={[
              styles.ratedButtonContainer,
              {
                transform: [
                  {
                    translateY: ratedButtonAnimationRef.current.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  },
                ],
                opacity: ratedButtonAnimationRef.current,
              }
            ]}
          >
            <TouchableOpacity
              style={styles.ratedButton}
              onPress={handleRatedButtonPress}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.ratedButtonText,
                { fontSize: responsiveValues.ratedButtonFontSize }
              ]}>
                I rated!
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
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
  textContainer: {
    alignItems: 'center',
  },
  ratingAnimation: {
    alignSelf: 'center',
    justifyContent: 'center',
    flex: 1,
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
    lineHeight: 24,
  },
  ratedButtonContainer: {
    position: 'absolute',
    bottom: 10, // Position above footer
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  ratedButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  ratedButtonText: {
    fontFamily: 'Nunito-ExtraBold',
    color: PrepTalkTheme.colors.primary,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});