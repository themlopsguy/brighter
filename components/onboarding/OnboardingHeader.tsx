// components/onboarding/OnboardingHeader.tsx

import React, { useEffect, useRef } from 'react';
import Rive, { AutoBind, RiveRef, useRive, useRiveNumber, DataBindBy, RNRiveError, RNRiveErrorType } from 'rive-react-native';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  PrepTalkTheme, 
  useResponsiveFontSize, 
  useResponsiveSpacing, 
  useResponsiveHeaderPadding,
  getResponsiveValue 
} from '@/constants/Theme';
import { Asset } from 'expo-asset';

interface OnboardingHeaderProps {
  currentStep: number;
  totalSteps?: number;
  onBackPress: () => void;
}

export const BindByName = (value: string): DataBindBy => ({
  type: 'name',
  value,
});

export default function OnboardingHeader({ currentStep, totalSteps = 4, onBackPress }: OnboardingHeaderProps) {
  const { width } = useWindowDimensions();
  const [setRiveRef, riveRef] = useRive();
  let [progress, setProgress] = useRiveNumber(riveRef, 'progress');

  // Use responsive utilities
  const headerPadding = useResponsiveHeaderPadding();

  const riveAsset = Asset.fromModule(require('@/assets/animations/progress-ring-an.riv'));

  // Custom responsive values for this specific component
  const responsiveValues = {
    titleFontSize: getResponsiveValue({
      small: 18,
      medium: 20,
      large: 22,
      xlarge: 24
    }),
    backButtonIconSize: getResponsiveValue({
      small: 24,
      medium: 26,
      large: 28,
      xlarge: 32
    }),
    backButtonPadding: getResponsiveValue({
      small: 6,
      medium: 7,
      large: 8,
      xlarge: 9
    }),
    progressContainerSize: getResponsiveValue({
      small: 35,
      medium: 40,
      large: 45,
      xlarge: 50
    }),
    riveAnimationSize: getResponsiveValue({
      small: 50,
      medium: 65,
      large: 70,
      xlarge: 75
    }),
    progressMarginRight: getResponsiveValue({
      small: 0,
      medium: 0,
      large: 0,
      xlarge: 0
    }),
    headerPaddingBottom: getResponsiveValue({
      small: 0,
      medium: 2,
      large: 4,
      xlarge: 5
    }),
    extraTopPadding: getResponsiveValue({
      small: 10,
      medium: 15,
      large: 20,
      xlarge: 25
    }),
    horizontalPaddingPercent: getResponsiveValue({
      small: 0.06,
      medium: 0.06,
      large: 0.06,
      xlarge: 0.06
    })
  };

  // Calculate actual pixel value for horizontal padding
  const horizontalPadding = width * responsiveValues.horizontalPaddingPercent;

  // Calculate progress percentage
  const progressValue = ((currentStep + 1) / totalSteps) * 100;
  
  // Check if we're on the first step
  const isFirstStep = currentStep === 0;
  
  useEffect(() => {
    if (riveRef && setProgress) {
      console.log("Setting value...", progressValue);
      riveRef.setNumber("progress", progressValue);
      riveRef.play();
    }
  }, [currentStep, progressValue, riveRef, setProgress]);

  return (
    <View style={[
      styles.header, 
      {
        paddingTop: headerPadding + responsiveValues.extraTopPadding,
        paddingBottom: responsiveValues.headerPaddingBottom,
        paddingHorizontal: horizontalPadding
      }
    ]}>
      {/* Back Button - Conditional styling and functionality */}
      <TouchableOpacity 
        style={[
          styles.backButton,
          { padding: responsiveValues.backButtonPadding },
          isFirstStep && styles.backButtonDisabled
        ]}
        onPress={isFirstStep ? undefined : onBackPress}
        activeOpacity={isFirstStep ? 1 : 0.7}
        disabled={isFirstStep}
      >
        <Ionicons 
          name="arrow-back" 
          size={responsiveValues.backButtonIconSize} 
          color={isFirstStep ? PrepTalkTheme.colors.mediumGray : PrepTalkTheme.colors.text}
          style={[
            isFirstStep && styles.iconDisabled
          ]}
        />
      </TouchableOpacity>
      
      <View style={styles.titleContainer}>
        <Text style={[
          styles.title, 
          { fontSize: responsiveValues.titleFontSize }
        ]}>
          Profile Setup
        </Text>
      </View>
      
      {/* Rive Progress Ring */}
      <View style={[
        styles.progressContainer, 
        { 
          width: responsiveValues.progressContainerSize, 
          height: responsiveValues.progressContainerSize,
          marginRight: responsiveValues.progressMarginRight
        }
      ]}>
        <Rive
          ref={setRiveRef}
          url={riveAsset.localUri || riveAsset.uri}
          style={{ 
            width: responsiveValues.riveAnimationSize, 
            height: responsiveValues.riveAnimationSize 
          }}
          autoplay={true}
          dataBinding={AutoBind(true)}
          onError={(riveError: RNRiveError) => {
            switch (riveError.type) {
              case RNRiveErrorType.DataBindingError: {
                console.error(`${riveError.message}`);
                return;
              }
              default:
                console.error('Unhandled error');
                return;
            }
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1000,
    elevation: 1000,
  },
  backButton: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  backButtonDisabled: {
    opacity: 0.6, // Make the entire button area appear disabled
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    ...PrepTalkTheme.typography.headline,
    color: PrepTalkTheme.colors.text,
    fontFamily: 'Lexend-Bold',
    textAlign: 'center',
  },
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconDisabled: {
    opacity: 0.7, // Additional opacity reduction for the icon itself
  }
});