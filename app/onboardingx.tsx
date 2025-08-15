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
  ScrollView,
  KeyboardAvoidingView
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { PrepTalkTheme } from '@/constants/Theme';
import { useAuth } from '@/services/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import OnboardingHeader from '@/components/onboarding/OnboardingHeader';
import OnboardingFooter from '@/components/onboarding/OnboardingFooter';
import OnboardingFirstName from '@/components/onboarding/OnboardingFirstName';
import OnboardingLastName from '@/components/onboarding/OnboardingLastName';
import OnboardingEmail from '@/components/onboarding/OnboardingEmail'
import OnboardingPhoneNumber from '@/components/onboarding/OnboardingPhoneNumber'

export default function OnboardingScreen() {
  const { currentUser, signOut } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollAnimValue = useRef(new Animated.Value(0)).current;
  const { height, width } = useWindowDimensions();
  
  // State management for onboarding steps
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  
  // Step-specific active states (add more as needed)
  const [isFirstNameActive, setStepFirstNameActive] = useState(true);
  const [isLastNameActive, setStepLastNameActive] = useState(false);
  const [isEmailActive, setStepEmailActive] = useState(false);
  const [isPhoneNumberActive, setPhoneNumberActive] = useState(false);

  const [firstNameData, setFirstNameData] = useState({ firstName: '', isValid: false });
  const [lastNameData, setLastNameData] = useState({ lastName: '', isValid: false });
  const [emailData, setEmailData] = useState({ email: '', isValid: false });
  const [phoneNumberData, setPhoneNumberData] = useState({ phoneNumber: '', countryCode: '+1', isValid: false })

  // Step configuration data - customize this with your onboarding content
  const stepData = [
    {
      buttonText: "Continue"
    },
    {
      buttonText: "Continue"
    },
    {
      buttonText: "Continue"
    },
        {
      buttonText: "Continue"
    },
    //     {
    //   buttonText: "Continue"
    // },
    //     {
    //   buttonText: "Continue"
    // },
    //     {
    //   buttonText: "Continue"
    // },
    //     {
    //   buttonText: "Continue"
    // }
  ];

  // Navigation functions
  const nextStep = () => {
    if (currentStep < stepData.length - 1) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      setDirection('forward');

      // Update active states for each step
      setStepFirstNameActive(newStep === 0);
      setStepLastNameActive(newStep === 1);
      setStepEmailActive(newStep === 2);
      setPhoneNumberActive(newStep === 3);

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

      // Update active states for each step
      setStepFirstNameActive(newStep === 0);
      setStepLastNameActive(newStep === 1);
      setStepEmailActive(newStep === 2);
      setPhoneNumberActive(newStep === 3);

      scrollViewRef.current?.scrollTo({
        x: newStep * width,
        animated: true
      });
    } else {
      // First step - go back to intro
      router.back();
    }
  };

    const isCurrentStepDisabled = () => {
    switch (currentStep) {
        case 0: // First name step
        return !firstNameData.isValid;
        case 1: // Last name step - you can add validation here later
        return !lastNameData.isValid; // For now, always enabled
        case 2: // Email step - you can add validation here later
        return !emailData.isValid; // For now, always enabled
        case 3: // Phone number step - you can add validation here later
        return !phoneNumberData.isValid;
        default:
        return false;
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
          totalSteps={stepData.length}
          onBackPress={previousStep}
        />

        <View style={styles.content}>
          {/* Main Content Swiper */}
          <View style={[
            styles.mainSection, 
            {
              //marginTop: height < 700 ? -80 : -10,
              flex: height < 700 ? 0.3 : 0.3
            }
          ]}>
            <ScrollView
              ref={scrollViewRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              scrollEnabled={false} // You can add conditional logic here like in intro
              style={styles.scrollViewStyle}
              contentContainerStyle={styles.scrollContainer}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              onMomentumScrollEnd={(event) => {
                const newStep = Math.round(event.nativeEvent.contentOffset.x / width);
                if (newStep !== currentStep) {
                  if (newStep > currentStep) {
                    nextStep();
                  } else {
                    previousStep();
                  }
                }
              }} 
            >
              {/* Step 1 - Replace with your onboarding step */}
              <View style={[styles.stepContainer, {width: width, height: height, overflow: 'hidden'}]}>
                <OnboardingFirstName 
                  isActive={isFirstNameActive} 
                  onDataChange={setFirstNameData}
                />
              </View>
              
              {/* Step 2 - Replace with your onboarding step */}
              <View style={[styles.stepContainer, {width: width, height: height, overflow: 'hidden'}]}>
                <OnboardingLastName
                  isActive={isLastNameActive} 
                  onDataChange={setLastNameData}
                />
              </View>
              
              {/* Step 3 - Replace with your onboarding step */}
              <View style={[styles.stepContainer, {width: width, height: height, overflow: 'hidden'}]}>
                <OnboardingEmail
                  isActive={isEmailActive} 
                  onDataChange={setEmailData}
                />
              </View>

              {/* Step 3 - Replace with your onboarding step */}
              <View style={[styles.stepContainer, {width: width, height: height, overflow: 'hidden'}]}>
                <OnboardingPhoneNumber
                  isActive={isPhoneNumberActive} 
                  onDataChange={setPhoneNumberData}
                />
              </View>
            </ScrollView>
          </View>

          {/* Footer Component */}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={styles.FooterWrapper}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 50}>
            <OnboardingFooter 
              currentStep={currentStep}
              stepData={stepData}
              onContinue={nextStep}
              scrollAnimValue={scrollAnimValue}
              screenWidth={width}
              isDisabled={isCurrentStepDisabled()} // Add your own logic here if needed
            />
          </KeyboardAvoidingView>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  mainSection: {
    flex: 0.7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollViewStyle: {
    flex: 1,
    width: '100%',
  },
  scrollContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  stepContainer: {
    // width and height set inline
  },
  placeholderStep: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: PrepTalkTheme.metrics.padding,
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
  FooterWrapper: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
  }
});