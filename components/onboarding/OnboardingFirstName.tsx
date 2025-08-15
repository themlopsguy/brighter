// components/onboarding/OnboardingFirstName.tsx

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { PrepTalkTheme } from '@/constants/Theme';

interface OnboardingFirstNameProps {
  isActive?: boolean;
  onDataChange?: (data: { firstName: string; isValid: boolean }) => void;
}

export default function OnboardingFirstName({ isActive = true, onDataChange }: OnboardingFirstNameProps) {
  const { height, width } = useWindowDimensions();
  const [firstName, setFirstName] = useState('');

  // Validation function - checks if there's any input
  const isValidName = (name: string): boolean => {
    // Just check if there's any non-whitespace content
    return name.trim().length > 0;
  };

  // Initialize with empty state on mount
  useEffect(() => {
    if (onDataChange) {
      onDataChange({ firstName: '', isValid: false });
    }
  }, []);

  // Notify parent component when data changes
  const handleFirstNameChange = (text: string) => {
    setFirstName(text);
    const isValid = isValidName(text);
    
    if (onDataChange) {
      onDataChange({ firstName: text, isValid });
    }
  };

  return (
    <View style={styles.content}>
      {/* Header Section - Pinned to top */}
      <View style={[
        styles.headerSection,
        { 
          paddingTop: height < 700 ? 40 : 50,
          paddingHorizontal: width * 0.1 
        }
      ]}>
        <Text style={[
          styles.title,
          { fontSize: height < 700 ? 28 : 28 }
        ]}>
          What's your first name?
        </Text>
        <Text style={[
          styles.subtitle,
          { fontSize: height < 700 ? 16 : 14 }
        ]}>
          Please enter it exactly as it is on your government issued ID
        </Text>

        {/* First Name Input - Right below header */}
        <View style={[
          styles.inputContainer,
          { marginTop: height < 700 ? 40 : 10 }
        ]}>
          <TextInput
            style={[
              styles.textInput,
              { fontSize: height < 700 ? 20 : 22 }
            ]}
            value={firstName}
            onChangeText={handleFirstNameChange}
            placeholder="Enter first name"
            placeholderTextColor={PrepTalkTheme.colors.mediumGray}
            autoCapitalize="words"
            autoComplete="given-name"
            returnKeyType="done"
            autoFocus={isActive} // Focus when step is active
            textAlign="left"
          />
          <View style={[
            styles.underline,
            { 
              backgroundColor: isValidName(firstName) 
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
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
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
    width: 320
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
    paddingHorizontal: 20,
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