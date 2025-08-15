// components/intro/IntroFooter.tsx

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
import { PrepTalkTheme, useScreenSize, getResponsiveValue } from '@/constants/Theme';

interface StepData {
  titleImage: any;
  buttonText: string;
}

interface IntroFooterProps {
  currentStep: number;
  stepData: StepData[];
  onContinue: () => void;
  scrollAnimValue: Animated.Value;
  screenWidth: number;
  isDisabled?: boolean;
}

export default function IntroFooter({ 
  currentStep, 
  stepData, 
  onContinue, 
  scrollAnimValue, 
  screenWidth, 
  isDisabled = false 
}: IntroFooterProps) {
  const currentStepData = stepData[currentStep];
  const { height, width } = useWindowDimensions();
  const screenSize = useScreenSize();

  const slideAnim = useRef(new Animated.Value(0)).current;
  const previousStep = useRef(currentStep);

  // Responsive values
  const responsiveValues = {
    // Footer spacing
    footerGap: getResponsiveValue({
      small: 8,
      medium: 15,
      large: 25,
      xlarge: 30,
    }),
    
    // Title image sizing
    titleImageWidth: getResponsiveValue({
      small: 260,
      medium: 300,
      large: 340,
      xlarge: 370,
    }),
    titleImageHeight: getResponsiveValue({
      small: 160,
      medium: 168,
      large: 170,
      xlarge: 172,
    }),
    
    // Button styling
    buttonPaddingVertical: getResponsiveValue({
      small: 10,
      medium: 12,
      large: 14,
      xlarge: 16,
    }),
    buttonFontSize: getResponsiveValue({
      small: 16,
      medium: 18,
      large: 22,
      xlarge: 24,
    }),
    
    // Footer height
    footerHeight: getResponsiveValue({
      small: 50,
      medium: 55,
      large: 60,
      xlarge: 65,
    }),
  };

  const footerTranslateX = scrollAnimValue.interpolate({
    inputRange: [0, screenWidth, screenWidth * 2], // Assuming 3 steps
    outputRange: [0, -screenWidth, -screenWidth * 2],
    extrapolate: 'clamp',
  });

  return (
    <View style={[
      styles.footerSection, 
      { 
        gap: responsiveValues.footerGap,
        height: responsiveValues.footerHeight,
      }
    ]}>
      <View style={styles.titleContainer}>
        <Animated.View
          style={{
            transform: [{ translateX: footerTranslateX }],
            flexDirection: 'row',
            width: screenWidth * stepData.length,
          }}
        >
          {stepData.map((step, index) => (
            <View key={index} style={{ 
              width: screenWidth, 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Image 
                source={step.titleImage}
                style={[
                  styles.titleImage,
                  {
                    width: responsiveValues.titleImageWidth,
                    height: responsiveValues.titleImageHeight,
                    alignSelf: 'center',
                  }
                ]}
                resizeMode="contain"
              />
            </View>
          ))}
        </Animated.View>
      </View>
      
      <View style={[
        styles.primaryButtonContainer, 
        { paddingHorizontal: PrepTalkTheme.metrics.padding }
      ]}>
        <TouchableOpacity 
          style={[
            styles.primaryButton, 
            { paddingVertical: responsiveValues.buttonPaddingVertical },
            isDisabled && styles.disabledButton
          ]}
          onPress={isDisabled ? undefined : onContinue}
          activeOpacity={isDisabled ? 1 : 0.8}
          disabled={isDisabled}
        >
          <Text style={[
            styles.primaryButtonText, 
            { fontSize: responsiveValues.buttonFontSize },
            isDisabled && styles.disabledButtonText
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
    justifyContent: 'center',
    marginBottom: 0,
  },
  titleContainer: {
    // Add any specific styling for title container if needed
  },
  titleImage: {
    // Base styling for title images
  },
  primaryButtonContainer: {
    // Container for the primary button
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
    backgroundColor: '#CCCCCC',
    opacity: 0.6,
  },
  disabledButtonText: {
    color: '#999999',
  },
});