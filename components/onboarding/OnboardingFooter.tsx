// components/onboarding/OnboardingFooter.tsx

import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Platform,
  useWindowDimensions,
  Image,
  Animated  
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LinearGradientText from 'react-native-linear-gradient-text';
import { PrepTalkTheme } from '@/constants/Theme';

interface StepData {
  titleImage: any;
  buttonText: string;
}

interface OnboardingFooterProps {
  currentStep: number;
  stepData: StepData[];
  onContinue: () => void;
  scrollAnimValue: Animated.Value;  // Add scroll animation value
  screenWidth: number;              // Add screen width
  isDisabled?: boolean;
}

export default function OnboardingFooter({ currentStep, stepData, onContinue, scrollAnimValue, screenWidth, isDisabled = false }: OnboardingFooterProps) {
  const currentStepData = stepData[currentStep];
  const { height, width } = useWindowDimensions();

  const slideAnim = useRef(new Animated.Value(0)).current;
  const previousStep = useRef(currentStep);

  const footerTranslateX = scrollAnimValue.interpolate({
    inputRange: [0, screenWidth, screenWidth * 2], // Assuming 3 steps
    outputRange: [0, -screenWidth, -screenWidth * 2],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.footerSection, {gap: height < 700 ? 10 : 30}]}>
        <View style={styles.titleContainer}>
        <Animated.View
          style={{
            transform: [{ translateX: footerTranslateX }],
            flexDirection: 'row', // Important for multiple images
            width: screenWidth * stepData.length, // Total width for all images
          }}
        >
          {stepData.map((step, index) => (
            <View key={index} style={{ width: screenWidth, alignItems: 'center', justifyContent: 'center' }}>
              <Image 
                source={step.titleImage}
                style={[
                  styles.titleImage,
                  {
                    width: height < 700 ? 280 : 370,
                    height: height < 700 ? 180 : 172,
                    alignSelf: 'center',
                  }
                ]}
                resizeMode="contain"
              />
            </View>
          ))}
            </Animated.View>
        </View>
        <View style={[styles.primaryButtonContainer, {paddingHorizontal: PrepTalkTheme.metrics.padding}]}>
        <TouchableOpacity 
            style={[
            styles.primaryButton, 
            {paddingVertical: height < 700 ? 8 : 16},
            isDisabled && styles.disabledButton // ADD conditional disabled styling
            ]}
            onPress={isDisabled ? undefined : onContinue} // ADD conditional onPress
            activeOpacity={isDisabled ? 1 : 0.8} // ADD conditional opacity
            disabled={isDisabled} // ADD disabled prop
        >
            <Text style={[
            styles.primaryButtonText, 
            {fontSize: height < 700 ? 18 : 24},
            isDisabled && styles.disabledButtonText // ADD conditional text styling
            ]}>
            {currentStepData.buttonText}
            </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footerSection: {
    height: 60,
    justifyContent: 'center',
    marginBottom: 0,
    //paddingBottom: Platform.OS === 'android' ? 10 : 20,
    //paddingHorizontal: PrepTalkTheme.metrics.padding,
  },
  primaryButton: {
    backgroundColor: PrepTalkTheme.colors.primary,
    paddingHorizontal: 32,
    borderRadius: 35,
    alignItems: 'center',
  },
  primaryButtonText: {
    ...PrepTalkTheme.typography.headline,
    color: '#FFFFFF',
    fontFamily: 'Nunito-Bold',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC', // Grey background
    opacity: 0.6, // Slightly transparent
  },
  disabledButtonText: {
    color: '#999999', // Grey text color
  },
});