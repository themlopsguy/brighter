// app/onboarding/referral.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, useWindowDimensions, Alert } from 'react-native';
import { 
  PrepTalkTheme, 
  useResponsiveFontSize, 
  useResponsiveSpacing, 
  useResponsiveHeaderPadding,
  getResponsiveValue 
} from '@/constants/Theme';
import { useFooterActions } from './_layout';
import { useAuth, supabase } from '@/services/AuthContext';
import Rive from 'rive-react-native';
import { Asset } from 'expo-asset';

// Types for validation states
type ValidationState = 'none' | 'loading' | 'success' | 'error' | 'network-error';

interface ReferrerProfile {
  id: string;
  first_name: string;
  // Add other fields your RPC returns
}

export default function OnboardingReferral() {

  const { setCustomFooterAction, setFooterLoading, setFooterButtonText } = useFooterActions();
  const { userProfile, updateUserProfile } = useAuth();
  const { width } = useWindowDimensions();
  
  // Local state for input and validation
  const [inputValue, setInputValue] = useState('');
  const [validationState, setValidationState] = useState<ValidationState>('none');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  
  // Use responsive utilities
  const titleFontSize = useResponsiveFontSize('title');
  const subtitleFontSize = useResponsiveFontSize('subtitle');
  const bodyFontSize = useResponsiveFontSize('body');
  const headerPadding = useResponsiveHeaderPadding();
  const smallSpacing = useResponsiveSpacing('small');
  const mediumSpacing = useResponsiveSpacing('medium');
  const riveAsset = Asset.fromModule(require('@/assets/animations/discount-gift.riv'));
  
  // Custom responsive values for this specific component
  const responsiveValues = {
    subtitleWidth: getResponsiveValue({
      small: 280,
      medium: 300,
      large: 340,
      xlarge: 380
    }),
    inputFontSize: getResponsiveValue({
      small: 18,
      medium: 20,
      large: 22,
      xlarge: 24
    }),
    inputPadding: getResponsiveValue({
      small: 0,
      medium: 0,
      large: 0,
      xlarge: 10
    }),
    horizontalPaddingPercent: getResponsiveValue({
      small: 0.12,
      medium: 0.08,
      large: 0.06,
      xlarge: 0.04
    }),
    animationSize: getResponsiveValue({
      small: 250,
      medium: 350,
      large: 400,
      xlarge: 450
    }),
    animationMarginTop: getResponsiveValue({
      small: 110,
      medium: 130,
      large: 150,
      xlarge: 170
    }),
  };

  // Calculate actual pixel value for horizontal padding
  const horizontalPadding = width * responsiveValues.horizontalPaddingPercent;

  // Format input to uppercase letters/numbers only, max 6 chars
  const formatReferralCode = (text: string): string => {
    return text
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 6);
  };

  // Update handleInputChange:
  const handleInputChange = (text: string) => {
    const formattedText = formatReferralCode(text);
    setInputValue(formattedText);
    
    // Reset validation state when user starts typing
    if (validationState === 'success' || validationState === 'error' || validationState === 'network-error') {
      setValidationState('none');
      setErrorMessage('');
      setSuccessMessage('');
      setShowSuccessAnimation(false); // Also reset animation
    }
    
    // Reset loading state when user modifies input
    if (validationState === 'loading') {
      setValidationState('none');
      setFooterLoading(false);
    }
    
    // Don't store the code in onboarding data anymore
  };

  // Clear input
  const handleClearInput = () => {
    setInputValue('');
    setValidationState('none');
    setErrorMessage('');
    setSuccessMessage('');
    setShowSuccessAnimation(false);
    setFooterLoading(false);
    updateUserProfile({ referrer_first_name: '' }); // Clear referrer ID instead of code
  };
  

// Validate referral code against Supabase
const validateReferralCode = async (): Promise<boolean> => {
  if (!inputValue.trim()) return false;
  
  console.log('DEBUG: Starting referral code validation for:', inputValue);
  
  setValidationState('loading');
  setFooterLoading(true);
  
  try {
    console.log('DEBUG: Making Supabase RPC call for code:', inputValue);
    
    const { data: referrerProfile, error } = await supabase
      .rpc('validate_referral_code', { code: inputValue })
      .single() as { data: ReferrerProfile | null, error: any };
    
    console.log('DEBUG: RPC response:', { 
      data: referrerProfile, 
      error: error,
      hasData: !!referrerProfile,
      errorMessage: error?.message 
    });
    
    setFooterLoading(false);
    
    if (error) {
      console.log('DEBUG: RPC error details:', error);
      
      if (error.code === 'PGRST116') {
        // No matching referral code found
        console.log('DEBUG: No matching referral code found');
        setValidationState('error');
        setErrorMessage('Invalid code. Please try again.');
        setSuccessMessage('');
        return false;
      } else {
        // Other database errors
        console.log('DEBUG: Database error:', error.message);
        setValidationState('network-error');
        setErrorMessage('Network error. Please try again.');
        setSuccessMessage('');
        return false;
      }
    }
    
    if (!referrerProfile) {
      console.log('DEBUG: No referrer profile returned');
      setValidationState('error');
      setErrorMessage('Invalid code. Please try again.');
      setSuccessMessage('');
      return false;
    }
    
    // Update validateReferralCode success section:
    console.log('DEBUG: Valid referral code found for user:', referrerProfile.id);
    // Valid code found
    setValidationState('success');
    setSuccessMessage('Code verified!');
    setErrorMessage('');
    setShowSuccessAnimation(true);

    // Store ONLY the referrer's ID, not the code
    updateUserProfile({ referrer_first_name: referrerProfile.first_name});

    return true;
    
  } catch (error) {
    console.log('DEBUG: Exception during validation:', error);
    setFooterLoading(false);
    setValidationState('network-error');
    setErrorMessage('Network error. Please try again.');
    setSuccessMessage('');
    return false;
  }
};

  // Determine button text and action based on current state
  const getButtonConfig = () => {
    if (!inputValue.trim()) {
      return { text: 'Skip', action: 'skip' };
    }
    
    if (validationState === 'loading') {
      return { text: 'Submit', action: 'loading' };
    }
    
    if (validationState === 'success') {
      return { text: 'Continue', action: 'continue' };
    }
    
    return { text: 'Submit', action: 'submit' };
  };

  // Handle footer button press
  const handleFooterAction = async () => {
    const { action } = getButtonConfig();
    
    switch (action) {
      case 'skip':
        // Navigate to next screen without validation
        // This will be handled by the layout's default navigation
        break;
        
      case 'submit':
        await validateReferralCode();
        break;
        
      case 'continue':
        // Navigate to next screen with validated code
        // This will be handled by the layout's default navigation
        break;
        
      case 'loading':
        // Do nothing while loading
        break;
    }
  };

  // Set up custom footer action and button text
  useEffect(() => {
    const { action, text } = getButtonConfig();
    
    // Update footer button text
    setFooterButtonText(text);
    
    if (action === 'skip' || action === 'continue') {
      // Let layout handle default navigation
      setCustomFooterAction?.(undefined);
    } else {
      // Use custom action for submit/loading
      setCustomFooterAction?.(() => handleFooterAction);
    }
  }, [inputValue, validationState]);

  // Clean up loading state when component unmounts or changes
  useEffect(() => {
    return () => {
      setFooterLoading(false);
      setFooterButtonText('');
    };
  }, []);

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
          Have a referral code?
        </Text>
        
        <Text style={[
          styles.subtitle, 
          { 
            fontSize: subtitleFontSize,
            width: responsiveValues.subtitleWidth
          }
        ]}>
          If you have a code from a friend, enter it here!
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
            value={inputValue}
            onChangeText={handleInputChange}
            placeholder="ABC123"
            placeholderTextColor={PrepTalkTheme.colors.mediumGray + '55'}
            autoCapitalize="characters"
            autoComplete="off"
            autoCorrect={false}
            returnKeyType="done"
            autoFocus={false}
            textAlign="center"
            maxLength={6}
            editable={validationState !== 'loading'}
          />
          <View style={[
            styles.underline,
            { 
              backgroundColor: validationState === 'success' 
                ? PrepTalkTheme.colors.success || '#4CAF50'
                : validationState === 'error' || validationState === 'network-error'
                ? PrepTalkTheme.colors.error || '#F44336'
                : inputValue.trim().length > 0
                ? PrepTalkTheme.colors.primary 
                : PrepTalkTheme.colors.mediumGray 
            }
          ]} />

        <Text style={[
          styles.subtitle, 
          { 
            fontSize: subtitleFontSize,
            width: responsiveValues.subtitleWidth
          }
        ]}>
          {'\n'}You can skip this if you don't have one. 
        </Text>
          
          {/* Success Message */}
          {successMessage && (
            <View style={styles.messageContainer}>
              <Text style={[styles.successMessage, { fontSize: bodyFontSize }]}>
                ✓ {successMessage}
              </Text>
            </View>
          )}
          
          {/* Error Message */}
          {errorMessage && (
            <View style={styles.messageContainer}>
              <Text style={[styles.errorMessage, { fontSize: bodyFontSize }]}>
                ✗ {errorMessage}
              </Text>
            </View>
          )}
        {/* Success Animation */}
        {showSuccessAnimation && (
          <View style={[styles.animationContainer,
                       { marginTop: responsiveValues.animationMarginTop}
          ]}>
            <Rive
              url={riveAsset.localUri || riveAsset.uri}
              style={{ width: responsiveValues.animationSize, height: responsiveValues.animationSize }}
              autoplay={true}
            />
          </View>
        )}
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
    paddingVertical: 0,
    backgroundColor: 'transparent',
    width: '100%',
    maxWidth: 100,
    letterSpacing: 2,
  },
  underline: {
    height: 2,
    opacity: 0.6,
    marginTop: 4,
    width: '60%',
    maxWidth: 100,
  },
  messageContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  successMessage: {
    fontFamily: 'Nunito-Medium',
    color: '#4CAF50',
    textAlign: 'center',
  },
  errorMessage: {
    fontFamily: 'Nunito-Medium',
    color: '#F44336',
    textAlign: 'center',
  },
  animationContainer: {
    alignSelf: 'center',
    justifyContent: 'center',
    flex: 1,
  },
});