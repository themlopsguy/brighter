// app/onboarding.tsx

import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  Platform,
  Animated,
  Easing,
  useWindowDimensions,
  ScrollView
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { PrepTalkTheme } from '@/constants/Theme';
import { useAuth } from '@/services/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import OnboardingStep1 from '@/components/onboarding/OnboardingStep1';
import OnboardingStep2 from '@/components/onboarding/OnboardingStep2';
import OnboardingStep3 from '@/components/onboarding/OnboardingStep3';
import OnboardingHeader from '@/components/onboarding/OnboardingHeader';
import OnboardingFooter from '@/components/onboarding/OnboardingFooter';

export default function OnboardingScreen() {
  const { currentUser, signOut } = useAuth();
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollAnimValue = useRef(new Animated.Value(0)).current;
  const { height, width } = useWindowDimensions();
  const [isStep1Active, setIsStep1Active] = useState(true);
  const [isStep2Active, setIsStep2Active] = useState(false);
  const [isStep2Complete, setIsStep2Complete] = useState(false);

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

  const logoImages = [
    { source: require('@/assets/images/onboarding/logos/airbnb.png'), width: 80, height: 95 },
    { source: require('@/assets/images/onboarding/logos/luxe.png'), width: 60, height: 75 },
    { source: require('@/assets/images/onboarding/logos/meta.png'), width: 40, height: 40 },
    { source: require('@/assets/images/onboarding/logos/microsoft.png'), width: 35, height: 35 },
    { source: require('@/assets/images/onboarding/logos/morgan.png'), width: 80, height: 85 },
    { source: require('@/assets/images/onboarding/logos/spacex.png'), width: 80, height: 95 },
    { source: require('@/assets/images/onboarding/logos/universal.png'), width: 80, height: 95 },
  ];

// Step configuration data
const stepData = [
  {
    // Step 1 - Current job cards step
    titleImage: require('@/assets/images/onboarding/onboard-1-footer.png'),
    buttonText: "Continue"
  },
  {
    // Step 2 - Future step
    titleImage: require('@/assets/images/onboarding/onboard-2-footer.png'),
    buttonText: "Continue"
  },
  {
    // Step 3 - Future step  
    title: "Ready to start?",
    titleHighlight: "Ready",
    subtitle1: "Join thousands of professionals",
    subtitle1Highlight: "thousands",
    subtitle2: "Finding their dream jobs",
    subtitle2Highlight: "dream jobs",
    subtitle3: "Let's get started",
    buttonText: "Get Started"
  }
];

// State management for onboarding steps
const [currentStep, setCurrentStep] = useState(0);
const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

// Navigation functions
const nextStep = () => {
  if (currentStep < stepData.length - 1) {
    const newStep = currentStep + 1;
    setCurrentStep(newStep);
    setDirection('forward');

    setIsStep1Active(newStep === 0);
    setIsStep2Active(newStep === 1);

    scrollViewRef.current?.scrollTo({
      x: newStep * width,
      animated: true
    });
  } else {
    // Last step - navigate to main app
    router.push('/(tabs)');
  }
};

const handleScroll = (event) => {
  const scrollX = event.nativeEvent.contentOffset.x;
  scrollAnimValue.setValue(scrollX);
};

const previousStep = () => {
  if (currentStep > 0) {
    const newStep = currentStep - 1;
    setCurrentStep(newStep);
    setDirection('backward');

    // Update active states
    setIsStep1Active(newStep === 0);
    setIsStep2Active(newStep === 1);

    scrollViewRef.current?.scrollTo({
      x: newStep * width,
      animated: true
    });
  } else {
    // First step - sign out
    handleBackPress();
  }
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
    <SafeAreaView style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
  <ExpoStatusBar style="dark" />
        <LinearGradient
      colors={PrepTalkTheme.colors.gradientBackground.colors}
      start={PrepTalkTheme.colors.gradientBackground.start}
      end={PrepTalkTheme.colors.gradientBackground.end}
      locations={PrepTalkTheme.colors.gradientBackground.locations}
      style={[StyleSheet.absoluteFill]}
    >
      {/* Header Component */}
      <OnboardingHeader 
        currentStep={currentStep}
        onBackPress={previousStep}
      />

      <View style={styles.content}>

{/* Main Content Swiper */}
        <View style={[styles.mainSection, {marginTop: height < 700 ? -80 : -150},
                                          {flex: height < 700 ? 0.82 : 0.77}
        ]}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEnabled={currentStep !== 1 || isStep2Complete} // ← ADD this line
          style={styles.scrollViewStyle}
          contentContainerStyle={styles.scrollContainer}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onMomentumScrollEnd={(event) => {
            const newStep = Math.round(event.nativeEvent.contentOffset.x / width);
            if (newStep !== currentStep) {
              // Just call the existing step functions instead of manual updates
              if (newStep > currentStep) {
                nextStep(); // User swiped forward
              } else {
                previousStep(); // User swiped backward  
              }
            }
          }} 
        >
            {/* Step 1 - Job Cards */}
            <View style={[styles.stepContainer, {width: width, height: height, overflow: 'hidden'}]}>
              <OnboardingStep1 jobData={jobData} logoImages={logoImages} isActive={isStep1Active} />
            </View>
            
            {/* Step 2 - Placeholder */}
            <View style={[styles.stepContainer, {width: width, height: height, overflow: 'hidden'}]}>
              <OnboardingStep2 isActive={isStep2Active} onSwipeComplete={() => setIsStep2Complete(true)} />
            </View>
            
            {/* Step 3 - Placeholder */}
            <View style={[styles.stepContainer, {width: width, height: height, overflow: 'hidden'}]}>
              <OnboardingStep3 isActive={currentStep === 2} />
            </View>
            </ScrollView>
        </View>

        {/* Footer Component */}
        <View style = {styles.FooterWrapper}>
        <OnboardingFooter 
          currentStep={currentStep}
          stepData={stepData}
          onContinue={nextStep}
          scrollAnimValue={scrollAnimValue}
          screenWidth={width}
          isDisabled={currentStep === 1 && !isStep2Complete}
        />
        </View>
      </View>
    </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //backgroundColor: PrepTalkTheme.colors.background,
    //paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8, // Just padding for touch area
  },
  spacer: {
    width: 44, // Same width as back button area for balance
  },
  content: {
    flex: 1,
    //paddingHorizontal: PrepTalkTheme.metrics.padding,
    //paddingVertical: Platform.OS === 'android' ? 10 : 20,
  },
  mainSection: {
  flex: 0.7,
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
scrollViewStyle: {
  flex: 1,
  width: '100%',
},
scrollContainer: {
  flexDirection: 'row', // This is important for horizontal scrolling
  alignItems: 'stretch',
},
stepContainer: {
  // width: '100%', // Use fixed width instead of 100% - adjust this value as needed
  // height: '100%',
},
placeholderStep: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
},
FooterWrapper: {
  //bottom: 15
}
});