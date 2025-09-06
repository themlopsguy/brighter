// app/onboarding/_layout.tsx
import React, { createContext, useContext, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform,
  Animated
} from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { PrepTalkTheme } from '@/constants/Theme';
import OnboardingHeader from '@/components/onboarding/OnboardingHeader';
import OnboardingFooter from '@/components/onboarding/OnboardingFooter';
import { useAuth } from '@/services/AuthContext';

const FooterContext = createContext<{
  setCustomFooterAction: (action: (() => void) | undefined) => void;
  setFooterLoading: (loading: boolean) => void;
  setFooterButtonText: (text: string) => void;
} | null>(null);

export function useFooterActions() {
  const context = useContext(FooterContext);
  if (!context) {
    throw new Error('useFooterActions must be used within FooterProvider');
  }
  return context;
}

export default function OnboardingLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { userProfile, updateUserProfile } = useAuth();
  
  // Get current step from route
  const currentSegment = segments[segments.length - 1] as string;

  const [customFooterAction, setCustomFooterAction] = useState<(() => void) | undefined>();
  const [footerLoading, setFooterLoading] = useState(false);
  const [footerButtonText, setFooterButtonText] = useState<string>('');
  
  // Map routes to step numbers and data
  const stepMap: Record<string, { step: number; buttonText: string;}> = {
    'firstName': { step: 0, buttonText: 'Continue'},
    'lastName': { step: 1, buttonText: 'Continue'},
    'email': { step: 2, buttonText: 'Continue'},
    'phoneNumber': { step: 3, buttonText: 'Continue'},
    'gender': { step: 4, buttonText: 'Continue'},
    'race': { step: 5, buttonText: 'Continue'},
    'veteranStatus': { step: 6, buttonText: 'Continue'},
    'disabilityStatus': { step: 7, buttonText: 'Continue'},
    'age': { step: 8, buttonText: 'Continue'},
    'countries': { step: 9, buttonText: 'Continue'},
    'location': { step: 10, buttonText: 'Continue'},
    'rating': { step: 11, buttonText: 'Continue'},
    'resume': { step: 12, buttonText: 'Continue'},
    'referral': { step: 13, buttonText: 'Get Started'}
  };
  
  const currentStepInfo = stepMap[currentSegment] || stepMap.firstName;

  const isStepValid = (step: string): boolean => {
    if (!userProfile) return false;

    switch (step) {
      case 'firstName': 
        return (userProfile.first_name || '').trim().length > 0;
      case 'lastName': 
        return (userProfile.last_name || '').trim().length > 0;
      case 'email': 
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userProfile.email || '');
      case 'phoneNumber': 
        return (userProfile.phone_number || '').replace(/\D/g, '').length >= 10;
      case 'gender': 
        return (userProfile.gender || '').trim().length > 0;
      case 'race': 
        return (userProfile.race || '').trim().length > 0;
      case 'veteranStatus': 
        return (userProfile.veteran || '').trim().length > 0;
      case 'disabilityStatus': 
        return (userProfile.disability || '').trim().length > 0;
      case 'age': 
        return (userProfile.age || '').trim().length > 0;
      case 'countries': 
        return !!(userProfile.applying_countries && Array.isArray(userProfile.applying_countries) && userProfile.applying_countries.length > 0);
      case 'location': 
        return (userProfile.location || '').trim().length > 0;
      case 'rating': 
        return true;
      case 'resume':
        return (userProfile.resume_url || '').trim().length > 0;
      case 'referral':
        return true
      default: 
        return false;
    }
  };

  const handleContinue = () => {

    console.log(userProfile)
    
    // If there's a custom footer action, use it instead of navigation
    if (customFooterAction) {
        customFooterAction();
        return;
    }

    switch (currentSegment) {
      case 'firstName':
        router.push('/onboarding/lastName');
        break;
      case 'lastName':
        router.push('/onboarding/email');
        break;
      case 'email':
        router.push('/onboarding/phoneNumber');
        break;
      case 'phoneNumber':
        router.push('/onboarding/gender');
        break;
      case 'gender':
        router.push('/onboarding/race');
        break;
      case 'race':
        router.push('/onboarding/veteranStatus');
        break;
      case 'veteranStatus':
        router.push('/onboarding/disabilityStatus');
        break;
      case 'disabilityStatus':
        router.push('/onboarding/age');
        break;
      case 'age':
        router.push('/onboarding/countries');
        break;
      case 'countries':
        router.push('/onboarding/location');
        break;
      case 'location':
        router.push('/onboarding/rating');
        break;
      case 'rating':
        router.push('/onboarding/resume');
        break;
      case 'resume':
        router.push('/onboarding/referral');
        break;
      case 'referral':
        updateUserProfile({ onboarding_completed: true });
        router.push('/(tabs)/apply');
        break;
      default:
        // Fallback
        router.push('/onboarding/firstName');
        break;
    }
  };

  const handleBack = () => {
    switch (currentSegment) {
      case 'firstName':
        router.back(); // Go back to intro
        break;
      case 'lastName':
        router.push('/onboarding/firstName');
        break;
      case 'email':
        router.push('/onboarding/lastName');
        break;
      case 'phoneNumber':
        router.push('/onboarding/email');
        break;
      case 'gender':
        router.push('/onboarding/phoneNumber');
        break;
      case 'race':
        router.push('/onboarding/gender');
        break;
      case 'veteranStatus':
        router.push('/onboarding/race');
        break;
      case 'disabilityStatus':
        router.push('/onboarding/veteranStatus');
        break;
      case 'age':
        router.push('/onboarding/disabilityStatus');
        break;
      case 'countries':
        router.push('/onboarding/age');
        break;
      case 'location':
        router.push('/onboarding/countries');
        break;
      case 'rating':
        router.push('/onboarding/location');
        break;
      case 'resume':
        router.push('/onboarding/rating');
        break;
      case 'referral':
        router.push('/onboarding/resume');
        break;
      default:
        router.back();
        break;
    }
  };

  // Determine the button text to display
  const getDisplayButtonText = () => {
    // If a custom button text is set (like from referral screen), use it
    if (footerButtonText) {
      return footerButtonText;
    }
    // Otherwise use default text for this step
    return currentStepInfo.buttonText;
  };

  return (
    <FooterContext.Provider value={{
      setCustomFooterAction,
      setFooterLoading,
      setFooterButtonText
    }}>
      <SafeAreaView style={styles.container}>
        <ExpoStatusBar style="dark" />
        <LinearGradient
          colors={PrepTalkTheme.colors.gradientBackground.colors}
          start={PrepTalkTheme.colors.gradientBackground.start}
          end={PrepTalkTheme.colors.gradientBackground.end}
          locations={PrepTalkTheme.colors.gradientBackground.locations}
          style={StyleSheet.absoluteFill}
        >
          <OnboardingHeader 
            currentStep={currentStepInfo.step}
            totalSteps={14}
            onBackPress={handleBack}
          />

          <View style={styles.content}>
            <Slot />
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={styles.footerWrapper}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
          >
            <OnboardingFooter 
              buttonText={getDisplayButtonText()}
              onContinue={handleContinue}
              isDisabled={!isStepValid(currentSegment)}
              isLoading={footerLoading}
            />
          </KeyboardAvoidingView>
        </LinearGradient>
      </SafeAreaView>
    </FooterContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  footerWrapper: {
    // Remove absolute positioning to let KeyboardAvoidingView handle it naturally
    paddingHorizontal: 0,
    paddingVertical: 0,
  }
});