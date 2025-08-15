// app/onboarding/phoneNumber.tsx

import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput,
  useWindowDimensions,
  TouchableOpacity,
} from 'react-native';
import { 
  PrepTalkTheme, 
  useResponsiveFontSize, 
  useResponsiveSpacing, 
  useResponsiveHeaderPadding,
  getResponsiveValue 
} from '@/constants/Theme';
import { useOnboardingData } from './_layout';
import CountryCodeModal, { CountryCode, findCountryByCode } from '@/components/CountryCodeModal';

export default function OnboardingPhoneNumber() {
  const { data, updateData } = useOnboardingData();
  const { width } = useWindowDimensions();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const textInputRef = useRef<TextInput>(null);

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
    countryCodeInputPadding: getResponsiveValue({
      small: 12,
      medium: 12,
      large: 12,
      xlarge: 12
    }),
    phoneInputPadding: getResponsiveValue({
      small: 2,
      medium: 2,
      large: 2,
      xlarge: 2
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

  const handlePhoneNumberChange = (text: string) => {
    // Format phone number for US numbers
    let formattedText = text;
    if (data.countryCode === '+1') {
      // Remove all non-digits
      const digits = text.replace(/\D/g, '');
      
      // Format as (XXX) XXX-XXXX
      if (digits.length >= 6) {
        formattedText = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
      } else if (digits.length >= 3) {
        formattedText = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
      } else {
        formattedText = digits;
      }
    }
    
    updateData('phoneNumber', formattedText);
  };

  const handleCountryCodeSelect = (countryCode: CountryCode) => {
    updateData('countryCode', countryCode.code);
    // Store the selected country name as well to distinguish between countries with same code
    updateData('selectedCountry', countryCode.country);
    setIsModalVisible(false);
    
    // Re-focus the text input after modal closes
    setTimeout(() => {
      textInputRef.current?.focus();
    }, 100);
  };

  const getSelectedCountry = (): CountryCode => {
    return findCountryByCode(data.countryCode, data.selectedCountry);
  };

  // Phone number validation
  const isValidPhoneNumber = (phone: string): boolean => {
    const digits = phone.replace(/\D/g, '');
    
    if (data.countryCode === '+1') {
      return digits.length === 10;
    }
    
    return digits.length >= 7;
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
          What's your phone number?
        </Text>
        
        <Text style={[
          styles.subtitle, 
          { 
            fontSize: subtitleFontSize,
            width: responsiveValues.subtitleWidth
          }
        ]}>
          We'll use this phone number on your job applications.
        </Text>

        {/* Phone Number Input Row */}
        <View style={[
          styles.phoneInputContainer,
          { marginTop: smallSpacing }
        ]}>
          {/* Country Code Selector with Underline */}
          <View style={styles.countryCodeWrapper}>
            <TouchableOpacity
              style={[
                styles.countryCodeButton,
                { paddingHorizontal: responsiveValues.countryCodeInputPadding }
              ]}
              onPress={() => setIsModalVisible(true)}
            >
              <Text style={styles.countryCodeFlag}>{getSelectedCountry().flag}</Text>
              <Text style={[
                styles.countryCodeButtonText, 
                { fontSize: responsiveValues.inputFontSize }
              ]}>
                {data.countryCode}
              </Text>
            </TouchableOpacity>
            {/* Country Code Underline */}
            <View style={[
              styles.countryCodeUnderline,
              { 
                backgroundColor: PrepTalkTheme.colors.mediumGray,
                opacity: 0.6
              }
            ]} />
          </View>

          {/* Phone Number Input */}
          <View style={styles.phoneInputWrapper}>
            <TextInput
              ref={textInputRef}
              style={[
                styles.phoneInput, 
                { 
                  fontSize: responsiveValues.inputFontSize,
                  paddingHorizontal: responsiveValues.phoneInputPadding
                }
              ]}
              value={data.phoneNumber}
              onChangeText={handlePhoneNumberChange}
              placeholder={data.countryCode === '+1' ? '5551234567' : 'Phone number'}
              placeholderTextColor={PrepTalkTheme.colors.mediumGray}
              keyboardType="phone-pad"
              autoComplete="tel"
              textAlign="left"
              maxLength={data.countryCode === '+1' ? 14 : 20}
              autoFocus={true}
            />
            <View style={[
              styles.underline,
              { 
                backgroundColor: isValidPhoneNumber(data.phoneNumber)
                  ? PrepTalkTheme.colors.primary 
                  : PrepTalkTheme.colors.mediumGray 
              }
            ]} />
          </View>
        </View>
      </View>

      {/* Country Code Selection Modal */}
      <CountryCodeModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSelectCountry={handleCountryCodeSelect}
        selectedCountryCode={data.countryCode}
      />
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
  phoneInputContainer: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 300,
    alignItems: 'flex-end',
    gap: 12,
  },
  countryCodeWrapper: {
    alignItems: 'center',
  },
  countryCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 1,
    gap: 6,
    minWidth: 85,
  },
  countryCodeUnderline: {
    height: 2,
    width: '100%',
    marginTop: 0,
  },
  countryCodeFlag: {
    fontSize: 16,
  },
  countryCodeButtonText: {
    fontFamily: 'Nunito-Medium',
    color: PrepTalkTheme.colors.text,
  },
  phoneInputWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  phoneInput: {
    fontFamily: 'Nunito-Medium',
    color: PrepTalkTheme.colors.text,
    paddingVertical: 0,
    backgroundColor: 'transparent',
    width: '100%',
    textAlign: 'left',
  },
  underline: {
    height: 2,
    opacity: 0.6,
    marginTop: 0,
    width: '100%',
  },
});