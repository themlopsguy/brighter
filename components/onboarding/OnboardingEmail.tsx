// components/onboarding/OnboardingEmail.tsx

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

interface OnboardingEmailProps {
  isActive?: boolean;
  onDataChange?: (data: { email: string; isValid: boolean }) => void;
}

export default function OnboardingEmail({ isActive = true, onDataChange }: OnboardingEmailProps) {
  const { height, width } = useWindowDimensions();
  const [email, setEmail] = useState('');

    // Validation function - checks for valid email format
    const isValidEmail = (email: string): boolean => {
    // Remove whitespace
    const trimmedEmail = email.trim();
    
    // Check if empty
    if (trimmedEmail.length === 0) {
        return false;
    }
    
    // Basic email regex pattern
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    return emailRegex.test(trimmedEmail);
    };

  // Initialize with empty state on mount
  useEffect(() => {
    if (onDataChange) {
      onDataChange({ email: '', isValid: false });
    }
  }, []);

  // Notify parent component when data changes
  const handleEmailChange = (text: string) => {
    setEmail(text);
    const isValid = isValidEmail(text);

    if (onDataChange) {
      onDataChange({ email: text, isValid });
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
            What's your email?
          </Text>
          <Text style={[
            styles.subtitle,
            { fontSize: height < 700 ? 16 : 14 }
          ]}>
            This is where all your job-related emails and follow-ups will go.
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
              value={email}
              onChangeText={handleEmailChange}
              placeholder="Enter your email"
              placeholderTextColor={PrepTalkTheme.colors.mediumGray}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              returnKeyType="done"
              autoFocus={isActive} // Focus when step is active
              textAlign="left" // Center the text for a cleaner look
            />
          <View style={[
            styles.underline,
            { 
              backgroundColor: isValidEmail(email) 
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
    // No flex or justifyContent center - stays at top
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
    maxWidth: 300, // Limit width for better appearance
  },
  underline: {
    height: 2,
    opacity: 0.6,
    marginTop: 0,
    width: '80%',
  },
});