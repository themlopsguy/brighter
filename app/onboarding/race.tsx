// app/onboarding/race.tsx

import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  useWindowDimensions,
  ScrollView,
  Animated
} from 'react-native';
import { 
  PrepTalkTheme, 
  useResponsiveFontSize, 
  useResponsiveSpacing, 
  useResponsiveHeaderPadding,
  getResponsiveValue 
} from '@/constants/Theme';
import { useAuth } from '@/services/AuthContext';

export default function OnboardingRace() {
  const { userProfile, updateUserProfile } = useAuth();
  const { width } = useWindowDimensions();

  // Use responsive utilities
  const titleFontSize = useResponsiveFontSize('title');
  const subtitleFontSize = useResponsiveFontSize('subtitle');
  const headerPadding = useResponsiveHeaderPadding();
  const smallSpacing = useResponsiveSpacing('small');
  const mediumSpacing = useResponsiveSpacing('medium');

  // Custom responsive values for this specific component
  const responsiveValues = {
    subtitleWidth: getResponsiveValue({
      small: 250,
      medium: 280,
      large: 320,
      xlarge: 350
    }),
    buttonFontSize: getResponsiveValue({
      small: 14,
      medium: 16,
      large: 18,
      xlarge: 20
    }),
    buttonPaddingVertical: getResponsiveValue({
      small: 14,
      medium: 16,
      large: 18,
      xlarge: 20
    }),
    buttonPaddingHorizontal: getResponsiveValue({
      small: 20,
      medium: 22,
      large: 24,
      xlarge: 26
    }),
    buttonGap: getResponsiveValue({
      small: 12,
      medium: 14,
      large: 16,
      xlarge: 18
    }),
    scrollMarginTop: getResponsiveValue({
      small: 8,
      medium: 12,
      large: 16,
      xlarge: 20
    }),
    horizontalPaddingPercent: getResponsiveValue({
      small: 0.12,
      medium: 0.10,
      large: 0.08,
      xlarge: 0.06
    })
  };

  // Calculate actual pixel value for horizontal padding
  const horizontalPadding = width * responsiveValues.horizontalPaddingPercent;

  // Animation refs for each button (7 options for race)
  const animationRefs = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0)
  ]);

  const raceOptions = [
    { label: 'Asian', value: 'asian' },
    { label: 'Black/African American', value: 'black' },
    { label: 'Hispanic', value: 'hispanic' },
    { label: 'Native American/Pacific Islander', value: 'pacific' },
    { label: 'White/Caucasian', value: 'white' },
    { label: 'Other', value: 'other' },
    { label: 'Prefer not to say', value: 'prefer_not_to_say' }
  ];

  // Trigger animation when component mounts
  useEffect(() => {
    const animations = animationRefs.current.map((animValue, index) =>
      Animated.spring(animValue, {
        toValue: 1,
        delay: index * 50, // Stagger each button by 50ms
        useNativeDriver: true,
        tension: 30,
        friction: 6,
      })
    );

    // Start all animations simultaneously (but with delays)
    Animated.parallel(animations).start();
  }, []);

  const handleRaceSelect = (value: string) => {
    updateUserProfile({ race: value });
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
        <Text style={[
          styles.title, 
          { fontSize: titleFontSize }
        ]}>
          Select your race
        </Text>
        
        <Text style={[
          styles.subtitle, 
          { 
            fontSize: subtitleFontSize,
            width: responsiveValues.subtitleWidth
          }
        ]}>
          This selection will be used on your applications.
        </Text>

        {/* Scrollable Race Selection Buttons */}
        <ScrollView
          style={[
            styles.scrollContainer,
            { marginTop: responsiveValues.scrollMarginTop }
          ]}
          contentContainerStyle={[
            styles.buttonContainer,
            { gap: responsiveValues.buttonGap }
          ]}
          showsVerticalScrollIndicator={false}
          bounces={true}
          scrollEventThrottle={16}
        >
          {raceOptions.map((option, index) => {
            // Create animated transform for drop-down effect
            const animatedStyle = {
              transform: [
                {
                  translateY: animationRefs.current[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [-50, 0], // Start 50px above, end at normal position
                  }),
                },
              ],
              opacity: animationRefs.current[index],
            };

            return (
              <Animated.View key={option.value} style={[animatedStyle, styles.animatedWrapper]}>
                <TouchableOpacity
                  style={[
                    styles.raceButton,
                    { 
                      paddingVertical: responsiveValues.buttonPaddingVertical,
                      paddingHorizontal: responsiveValues.buttonPaddingHorizontal
                    },
                    userProfile?.race === option.value && styles.selectedButton
                  ]}
                  onPress={() => handleRaceSelect(option.value)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.buttonText,
                    { fontSize: responsiveValues.buttonFontSize },
                    userProfile?.race === option.value && styles.selectedButtonText
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </ScrollView>
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
  title: {
    fontFamily: 'Lexend-Regular',
    color: PrepTalkTheme.colors.text,
    textAlign: 'center',
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: 'Nunito-Regular',
    color: PrepTalkTheme.colors.mediumGray,
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
    width: '100%',
  },
  animatedWrapper: {
    width: '100%',
  },
  buttonContainer: {
    alignItems: 'center',
    paddingBottom: 20, // Extra padding at bottom for scroll
    width: '100%',
    marginTop: 10,
  },
  raceButton: {
    borderWidth: 1,
    borderColor: PrepTalkTheme.colors.mediumGray,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.9,
  },
  selectedButton: {
    borderColor: PrepTalkTheme.colors.primary,
    borderWidth: 2,
    opacity: 1,
    backgroundColor: '#F2BD2C11',
  },
  buttonText: {
    fontFamily: 'Nunito-SemiBold',
    color: PrepTalkTheme.colors.text,
    textAlign: 'center',
  },
  selectedButtonText: {
    color: PrepTalkTheme.colors.text,
    fontFamily: 'Nunito-ExtraBold',
  },
});