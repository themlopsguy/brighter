// components/onboarding/OnboardingFooter.tsx

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Platform,
  useWindowDimensions,
  KeyboardAvoidingView,
  Keyboard,
  KeyboardEvent,
  ActivityIndicator
} from 'react-native';
import { 
  PrepTalkTheme, 
  useResponsiveFontSize, 
  useResponsiveSpacing, 
  getResponsiveValue 
} from '@/constants/Theme';

interface OnboardingFooterProps {
  buttonText: string;
  onContinue: () => void;
  isDisabled?: boolean;
  isLoading?: boolean;
  loadingText?: string;
}

export default function OnboardingFooter({ 
  buttonText, 
  onContinue, 
  isDisabled = false,
  isLoading = false,
  loadingText
}: OnboardingFooterProps) {
  const { width } = useWindowDimensions();
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Use responsive utilities
  const buttonFontSize = useResponsiveFontSize('button');
  const mediumSpacing = useResponsiveSpacing('medium');

  // Custom responsive values for this specific component
  const responsiveValues = {
    buttonPaddingVertical: getResponsiveValue({
      small: 12,
      medium: 14,
      large: 14,
      xlarge: 16
    }),
    buttonPaddingHorizontal: getResponsiveValue({
      small: 28,
      medium: 30,
      large: 32,
      xlarge: 36
    }),
    borderRadius: getResponsiveValue({
      small: 30,
      medium: 32,
      large: 35,
      xlarge: 38
    }),
    footerPaddingBottom: getResponsiveValue({
      small: 32,
      medium: 40,
      large: 50,
      xlarge: 60
    }),
    containerPaddingHorizontal: getResponsiveValue({
      small: 20,
      medium: 22,
      large: 24,
      xlarge: 28
    }),
      spinnerSize: getResponsiveValue({
      small: 16,
      medium: 18,
      large: 20,
      xlarge: 22
    }),
    spinnerMarginRight: getResponsiveValue({
      small: 8,
      medium: 10,
      large: 12,
      xlarge: 14
    })
  };

  useEffect(() => {
    // Keyboard event listeners
    const keyboardWillShow = (event: KeyboardEvent) => {
      setIsKeyboardVisible(true);
    };

    const keyboardWillHide = (event: KeyboardEvent) => {
      setIsKeyboardVisible(false);
    };

    // Different events for iOS and Android
    let showListener: any;
    let hideListener: any;

    if (Platform.OS === 'ios') {
      showListener = Keyboard.addListener('keyboardWillShow', keyboardWillShow);
      hideListener = Keyboard.addListener('keyboardWillHide', keyboardWillHide);
    } else {
      showListener = Keyboard.addListener('keyboardDidShow', keyboardWillShow);
      hideListener = Keyboard.addListener('keyboardDidHide', keyboardWillHide);
    }

    // Cleanup listeners on unmount
    return () => {
      showListener?.remove();
      hideListener?.remove();
    };
  }, []);

  // Calculate padding based on keyboard visibility
  const getFooterPadding = () => {
    if (isKeyboardVisible) {
      return 0; // No padding when keyboard is visible
    }
    return responsiveValues.footerPaddingBottom; // Responsive padding when keyboard is hidden
  };

  // Determine if button should be disabled
  const buttonDisabled = isDisabled || isLoading;

  // Determine display text
  const displayText = isLoading ? (loadingText || buttonText) : buttonText;

  return (
    <View style={[
      styles.footerSection, 
      { paddingBottom: getFooterPadding() }
    ]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={[
          styles.primaryButtonContainer, 
          { paddingHorizontal: responsiveValues.containerPaddingHorizontal }
        ]}
      >
        <TouchableOpacity 
          style={[
            styles.primaryButton, 
            { 
              paddingVertical: responsiveValues.buttonPaddingVertical,
              paddingHorizontal: responsiveValues.buttonPaddingHorizontal,
              borderRadius: responsiveValues.borderRadius
            },
            buttonDisabled && styles.disabledButton,
            isLoading && styles.loadingButton
          ]}
          onPress={buttonDisabled ? undefined : onContinue}
          activeOpacity={buttonDisabled ? 1 : 0.8}
          disabled={buttonDisabled}
        >
          <View style={styles.buttonContent}>
            {isLoading && (
              <ActivityIndicator
                size={responsiveValues.spinnerSize}
                color="#FFFFFF"
                style={[
                  styles.spinner,
                  { marginRight: responsiveValues.spinnerMarginRight }
                ]}
              />
            )}
            <Text style={[
              styles.primaryButtonText, 
              { fontSize: buttonFontSize },
              buttonDisabled && !isLoading && styles.disabledButtonText,
              isLoading && styles.loadingButtonText
            ]}>
              {displayText}
            </Text>
          </View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  footerSection: {
    justifyContent: 'flex-end',
  },
  primaryButtonContainer: {
    // Removed flex: 1 comment as it was causing layout issues
  },
  primaryButton: {
    backgroundColor: PrepTalkTheme.colors.primary,
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    // marginRight is set dynamically via responsiveValues
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
  loadingButton: {
    backgroundColor: PrepTalkTheme.colors.primary,
    opacity: 0.9,
  },
  loadingButtonText: {
    color: '#FFFFFF',
  },
});