// app/onboarding/email.tsx

import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput,
  useWindowDimensions
} from 'react-native';
import { 
  PrepTalkTheme, 
  useResponsiveFontSize, 
  useResponsiveSpacing, 
  useResponsiveHeaderPadding,
  getResponsiveValue 
} from '@/constants/Theme';
import { useOnboardingData } from './_layout';

export default function OnboardingEmail() {
  const { data, updateData } = useOnboardingData();
  const { width } = useWindowDimensions();
  
  // Use responsive utilities
  const titleFontSize = useResponsiveFontSize('title');
  const subtitleFontSize = useResponsiveFontSize('subtitle');
  const headerPadding = useResponsiveHeaderPadding();
  const smallSpacing = useResponsiveSpacing('small');
  
  // Custom responsive values for this specific component
  const responsiveValues = {
    subtitleWidth: getResponsiveValue({
      small: 250,
      medium: 280,
      large: 320,
      xlarge: 350
    }),
    inputFontSize: getResponsiveValue({
      small: 18,
      medium: 20,
      large: 22,
      xlarge: 24
    }),
    inputPadding: getResponsiveValue({
      small: 30,
      medium: 20,
      large: 10,
      xlarge: 10
    }),
    horizontalPaddingPercent: getResponsiveValue({
      small: 0.12,
      medium: 0.08,
      large: 0.06,
      xlarge: 0.04
    })
  };

  // Calculate actual pixel value for horizontal padding
  const horizontalPadding = width * responsiveValues.horizontalPaddingPercent;

  const handleEmailChange = (text: string) => {
    updateData('email', text);
  };

  // Email validation function
  const isValidEmail = (email: string): boolean => {
    const trimmedEmail = email.trim();
    if (trimmedEmail.length === 0) {
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(trimmedEmail);
  };

  return (
    <View style={styles.content}>
      <View style={[
        styles.headerSection,
        { 
          paddingTop: headerPadding,
          paddingHorizontal: horizontalPadding 
        }
      ]}>
        <Text style={[
          styles.title, 
          { fontSize: titleFontSize }
        ]}>
          What's your email?
        </Text>
        
        <Text style={[
          styles.subtitle, 
          { 
            fontSize: subtitleFontSize,
            width: responsiveValues.subtitleWidth
          }
        ]}>
          This is where all your job-related emails and follow-ups will go.
        </Text>

        <View style={[
          styles.inputContainer, 
          { marginTop: smallSpacing }
        ]}>
          <TextInput
            style={[
              styles.textInput, 
              { 
                fontSize: responsiveValues.inputFontSize,
                paddingHorizontal: responsiveValues.inputPadding
              }
            ]}
            value={data.email}
            onChangeText={handleEmailChange}
            placeholder="Enter your email"
            placeholderTextColor={PrepTalkTheme.colors.mediumGray}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            returnKeyType="done"
            autoFocus={true}
            textAlign="left"
          />
          <View style={[
            styles.underline,
            { 
              backgroundColor: isValidEmail(data.email)
                ? PrepTalkTheme.colors.primary 
                : PrepTalkTheme.colors.mediumGray 
            }
          ]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  headerSection: {
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Lexend-Regular',
    color: PrepTalkTheme.colors.text,
    textAlign: 'center',
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: 'Nunito-Regular',
    color: PrepTalkTheme.colors.mediumGray,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    alignItems: 'center',
  },
  textInput: {
    fontFamily: 'Nunito-Medium',
    color: PrepTalkTheme.colors.text,
    marginTop: 20,
    paddingVertical: 1,
    backgroundColor: 'transparent',
    width: '100%',
    maxWidth: 300,
  },
  underline: {
    height: 2,
    opacity: 0.6,
    marginTop: 0,
    width: '80%',
  },
});