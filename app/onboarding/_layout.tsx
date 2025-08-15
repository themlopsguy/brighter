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
import { CountryWithAuth } from '@/components/CountrySelectionModal';

// Context for sharing onboarding data across steps
interface OnboardingData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  countryCode: string;
  selectedCountry: string;
  gender: string;
  race: string;
  veteranStatus: string;
  disabilityStatus: string;
  age: string;
  birthday: string;
  countries: Array<{
    country_name: string;
    citizen: boolean;
    requires_sponsorship: boolean;
    work_authorization_status: boolean;
  }>;
}

interface OnboardingContextType {
  data: OnboardingData;
  updateData: (field: keyof OnboardingData, value: string) => void;
  isStepValid: (step: string) => boolean;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function useOnboardingData() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboardingData must be used within OnboardingProvider');
  }
  return context;
}

export default function OnboardingLayout() {
  const router = useRouter();
  const segments = useSegments();
  
  // Get current step from route
  const currentSegment = segments[segments.length - 1] as string;
  
  // Map routes to step numbers and data
  const stepMap: Record<string, { step: number; buttonText: string; dataKey: string }> = {
    'firstName': { step: 0, buttonText: 'Continue', dataKey: 'firstName' },
    'lastName': { step: 1, buttonText: 'Continue', dataKey: 'lastName' },
    'email': { step: 2, buttonText: 'Continue', dataKey: 'email' },
    'phoneNumber': { step: 3, buttonText: 'Continue', dataKey: 'phoneNumber' },
    'gender': { step: 4, buttonText: 'Continue', dataKey: 'gender' },
    'race': { step: 5, buttonText: 'Continue', dataKey: 'race' },
    'veteranStatus': { step: 6, buttonText: 'Continue', dataKey: 'veteranStatus' },
    'disabilityStatus': { step: 7, buttonText: 'Continue', dataKey: 'disabilityStatus' },
    'age': { step: 8, buttonText: 'Continue', dataKey: 'age' },
    'countries': { step: 9, buttonText: 'Get Started', dataKey: 'countries'}
  };
  
  const currentStepInfo = stepMap[currentSegment] || stepMap.firstName;
  
  // Onboarding data state
  const [data, setData] = useState<OnboardingData>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    countryCode: '+1',
    selectedCountry: 'United States',
    gender: '',
    race: '',
    veteranStatus: '',
    disabilityStatus: '',
    age: '',
    birthday: '',
    countries: [{ country_name: 'United States',
                  citizen: true,
                  requires_sponsorship: false,
                  work_authorization_status: true}]
  });

  const updateData = (field: keyof OnboardingData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const isStepValid = (step: string): boolean => {
    switch (step) {
      case 'firstName': 
        return data.firstName.trim().length > 0;
      case 'lastName': 
        return data.lastName.trim().length > 0;
      case 'email': 
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
      case 'phoneNumber': 
        return data.phoneNumber.replace(/\D/g, '').length >= 10;
      case 'gender': 
        return data.gender.trim().length > 0;
      case 'race': 
        return data.race.trim().length > 0;
      case 'veteranStatus': 
        return data.veteranStatus.trim().length > 0;
      case 'disabilityStatus': 
        return data.disabilityStatus.trim().length > 0;
      case 'age': 
        return data.age.trim().length > 0;
      case 'countries': 
        return data.countries && data.countries.length > 0;
      default: 
        return false;
    }
  };

  const handleContinue = () => {
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
        router.push('/(tabs)');
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
      default:
        router.back();
        break;
    }
  };

  return (
    <OnboardingContext.Provider value={{ data, updateData, isStepValid }}>
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
            totalSteps={10}
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
              buttonText={currentStepInfo.buttonText}
              onContinue={handleContinue}
              isDisabled={!isStepValid(currentSegment)}
            />
          </KeyboardAvoidingView>
        </LinearGradient>
      </SafeAreaView>
    </OnboardingContext.Provider>
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