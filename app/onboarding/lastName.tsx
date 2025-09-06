// app/onboarding/lastName.tsx

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
import { useAuth } from '@/services/AuthContext';

export default function OnboardingLastName() {
  const { userProfile, updateUserProfile } = useAuth();
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

  const handleLastNameChange = (text: string) => {
    updateUserProfile({ last_name: text });
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
          What's your last name?
        </Text>
        
        <Text style={[
          styles.subtitle, 
          { 
            fontSize: subtitleFontSize,
            width: responsiveValues.subtitleWidth
          }
        ]}>
          Please enter it exactly as it is on your government issued ID
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
            value={userProfile?.last_name || ''}
            onChangeText={handleLastNameChange}
            placeholder="Enter last name"
            placeholderTextColor={PrepTalkTheme.colors.mediumGray}
            autoCapitalize="words"
            autoComplete="family-name"
            returnKeyType="done"
            autoFocus={true}
            textAlign="left"
          />
          <View style={[
            styles.underline,
            { 
              backgroundColor: (userProfile?.last_name || '').trim().length > 0
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
    textAlign: 'left',
    justifyContent: 'flex-start',
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