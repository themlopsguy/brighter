// app/onboarding.tsx

import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  Platform,
  StatusBar,
  Animated,
  Easing,
  useWindowDimensions
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PrepTalkTheme } from '@/constants/Theme';
import { useAuth } from '@/services/AuthContext';
import OnboardingJobCard from '@/components/OnboardingJobCard';

export default function OnboardingScreen() {
  const { currentUser, signOut } = useAuth();
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const { height } = useWindowDimensions();

  // Sample job data for the orbiting cards
  const jobData = [
    { position: 'Accountant', company: 'Smith Schafer', logo: require('@/assets/images/smith-schafer.png')},
    { position: 'Teacher', company: 'The Pillars', logo: require('@/assets/images/pillars.png')},
    { position: 'Pharmacist', company: 'Mayo Clinic', logo: require('@/assets/images/mayoclinic.png')},
    { position: 'Full Stack Developer', company: 'Potomac Haven Inc', logo: require('@/assets/images/potomac-haven.png')},
    { position: 'Software Engineer', company: 'Experian', logo: require('@/assets/images/experian.png')},
    { position: 'Architect', company: 'Galloway & Company, Inc.', logo: require('@/assets/images/galloway.png')},
    { position: 'Event Planner', company: 'Hilton', logo: require('@/assets/images/hilton.png')},
    { position: 'Consultant', company: 'Rise, Inc', logo: require('@/assets/images/rise.png')},
    { position: 'UX Designer', company: 'Skin Analytics', logo: require('@/assets/images/skin.png')},
    { position: 'Team Lead', company: 'Arrow Finishing, Inc', logo: require('@/assets/images/arrow.png')},
  ];

  useEffect(() => {
    // Create the continuous rotation animation
    const startRotation = () => {
      rotationAnim.setValue(0);
      Animated.timing(rotationAnim, {
        toValue: 1,
        duration: height < 700 ? 80000 : 70000, // 15 seconds per rotation
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => {
        // Loop the animation
        startRotation();
      });
    };

    startRotation();
  }, [rotationAnim]);

  // Interpolate rotation value to degrees
  const rotateInterpolate = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Counter-rotation to keep cards upright
  const counterRotateInterpolate = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-360deg'],
  });

  const handleGetStarted = () => {
    // TODO: Navigate to actual onboarding flow
    router.push('/(tabs)');
  };

  const handleBackPress = async () => {
    try {
      console.log('Back pressed - signing out user');
      await signOut();
    } catch (error) {
      console.log('Sign out error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ExpoStatusBar style="dark" />
      {/* Back Arrow */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackPress}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="arrow-back" 
            size={24} 
            color={PrepTalkTheme.colors.text} 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>Welcome to Brighter!</Text>
          <Text style={styles.subtitle}>
            {currentUser?.email ? `Hi ${currentUser.email}!` : 'You\'re signed in'}
          </Text>
          <Text style={styles.description}>
            Let's get you set up for success in your career journey.
          </Text>
        </View>

        {/* Main Content */}
        <View style={styles.mainSection}>
          <View style={styles.orbitContainer}>
            {/* Gray circle border */}
            <View style={[styles.circleBorder, {transform: [{ translateY: height < 700 ? 150 : 50 }]}]} />
            
            {/* Rotating container with job cards */}
            <Animated.View 
              style={[
                styles.cardContainer,
                {
                  transform: [{ translateY: height < 700 ? 200 : 100 }, 
                              { rotate: rotateInterpolate }],
                }
              ]}
            >
              {jobData.map((job, index) => {
                // Calculate position using trigonometry for the larger circle
                const angle = (index * 35) * (Math.PI / 180); // Convert to radians
                const radius = 450; // Half of your 700px width circle
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius; // Add 50px offset to match your translateY
                
                return (
                  <Animated.View
                    key={index}
                    style={[
                      styles.cardPosition,
                      {
                        transform: [
                          { translateX: x },
                          { translateY: y },
                          { rotate: counterRotateInterpolate }, // Only counter-rotate to stay upright
                        ],
                      },
                    ]}
                  >
                    <OnboardingJobCard 
                      position={job.position} 
                      company={job.company}
                      logo={job.logo}
                      logoWidth={job.logoWidth}
                      logoHeight={job.logoHeight}
                    />
                  </Animated.View>
                );
              })}
            </Animated.View>
          </View>
        </View>

        {/* Action Button */}
        <View style={styles.footerSection}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>
              Continue to App
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PrepTalkTheme.colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  },
  header: {
    paddingHorizontal: PrepTalkTheme.metrics.padding,
    paddingTop: Platform.OS === 'android' ? 20 : 10,
    paddingBottom: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: PrepTalkTheme.metrics.padding,
    paddingVertical: Platform.OS === 'android' ? 10 : 20,
  },
  headerSection: {
    flex: 0.4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...PrepTalkTheme.typography.title,
    color: PrepTalkTheme.colors.text,
    fontFamily: 'Lexend-Bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    ...PrepTalkTheme.typography.headline,
    color: PrepTalkTheme.colors.primary,
    fontFamily: 'Lexend-Medium',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    ...PrepTalkTheme.typography.body,
    color: PrepTalkTheme.colors.mediumGray,
    fontFamily: 'Nunito-Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  mainSection: {
    flex: 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  orbitContainer: {
    width: 700,
    height: 800,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
circleBorder: {
    width: 700,
    height: 800,
    borderRadius: 420,
    borderWidth: 2,
    borderColor: 'rgb(255, 255, 255)',
    //opacity: 0.3,
    position: 'absolute',
    transform: [{ translateY: 50 }]
  },
  cardContainer: {
    width: 700,
    height: 800,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardPosition: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    ...PrepTalkTheme.typography.midHeadline,
    color: PrepTalkTheme.colors.text,
    fontFamily: 'Lexend-SemiBold',
    textAlign: 'center',
    marginBottom: 16,
  },
  subText: {
    ...PrepTalkTheme.typography.body,
    color: PrepTalkTheme.colors.mediumGray,
    fontFamily: 'Nunito-Regular',
    textAlign: 'center',
    lineHeight: 22,
  },
  footerSection: {
    flex: 0.2,
    justifyContent: 'flex-end',
    paddingBottom: Platform.OS === 'android' ? 30 : 20,
  },
  primaryButton: {
    backgroundColor: PrepTalkTheme.colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: 'center',
  },
  primaryButtonText: {
    ...PrepTalkTheme.typography.headline,
    color: '#FFFFFF',
    fontFamily: 'Lexend-Medium',
  },
});