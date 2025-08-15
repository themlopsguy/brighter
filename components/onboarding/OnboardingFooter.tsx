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
  KeyboardEvent
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
}

export default function OnboardingFooter({ 
  buttonText, 
  onContinue, 
  isDisabled = false 
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
            isDisabled && styles.disabledButton
          ]}
          onPress={isDisabled ? undefined : onContinue}
          activeOpacity={isDisabled ? 1 : 0.8}
          disabled={isDisabled}
        >
          <Text style={[
            styles.primaryButtonText, 
            { fontSize: buttonFontSize },
            isDisabled && styles.disabledButtonText
          ]}>
            {buttonText}
          </Text>
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