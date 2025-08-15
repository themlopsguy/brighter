// components/onboarding/OnboardingPhoneNumber.tsx

import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput,
  useWindowDimensions,
  TouchableOpacity,
  Modal,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PrepTalkTheme } from '@/constants/Theme';

interface CountryCode {
  country: string;
  code: string;
  flag: string;
}

interface OnboardingPhoneNumberProps {
  isActive?: boolean;
  onDataChange?: (data: { phoneNumber: string; countryCode: string; isValid: boolean }) => void;
}

export default function OnboardingPhoneNumber({ isActive = true, onDataChange }: OnboardingPhoneNumberProps) {
  const { height, width } = useWindowDimensions();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountryCode, setSelectedCountryCode] = useState('+1');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const textInputRef = useRef<TextInput>(null);

  // Common country codes (you can expand this list)
  const countryCodes: CountryCode[] = [
    { country: 'United States', code: '+1', flag: '🇺🇸' },
    { country: 'Canada', code: '+1', flag: '🇨🇦' },
    { country: 'United Kingdom', code: '+44', flag: '🇬🇧' },
    { country: 'Germany', code: '+49', flag: '🇩🇪' },
    { country: 'France', code: '+33', flag: '🇫🇷' },
    { country: 'Japan', code: '+81', flag: '🇯🇵' },
    { country: 'Australia', code: '+61', flag: '🇦🇺' },
    { country: 'India', code: '+91', flag: '🇮🇳' },
    { country: 'China', code: '+86', flag: '🇨🇳' },
    { country: 'Brazil', code: '+55', flag: '🇧🇷' },
    { country: 'Mexico', code: '+52', flag: '🇲🇽' },
    { country: 'Russia', code: '+7', flag: '🇷🇺' },
    { country: 'South Korea', code: '+82', flag: '🇰🇷' },
    { country: 'Italy', code: '+39', flag: '🇮🇹' },
    { country: 'Spain', code: '+34', flag: '🇪🇸' },
    { country: 'Netherlands', code: '+31', flag: '🇳🇱' },
    { country: 'Sweden', code: '+46', flag: '🇸🇪' },
    { country: 'Switzerland', code: '+41', flag: '🇨🇭' },
    { country: 'Norway', code: '+47', flag: '🇳🇴' },
    { country: 'Denmark', code: '+45', flag: '🇩🇰' },
  ];

  // Phone number validation - basic check for US format
  const isValidPhoneNumber = (phone: string): boolean => {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    
    // For US (+1), expect 10 digits
    if (selectedCountryCode === '+1') {
      return digits.length === 10;
    }
    
    // For other countries, just check if there are at least 7 digits
    return digits.length >= 7;
  };

  // Focus when component becomes active, but don't be aggressive about it
  useEffect(() => {
    if (isActive && !isModalVisible) {
      const timer = setTimeout(() => {
        textInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isActive]); // Removed isModalVisible dependency

  // Initialize with empty state on mount
  useEffect(() => {
    if (onDataChange) {
      onDataChange({ phoneNumber: '', countryCode: selectedCountryCode, isValid: false });
    }
  }, []);

  // Notify parent component when data changes
  const handlePhoneNumberChange = (text: string) => {
    // Format phone number for US numbers
    let formattedText = text;
    if (selectedCountryCode === '+1') {
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
    
    setPhoneNumber(formattedText);
    const isValid = isValidPhoneNumber(formattedText);
    
    if (onDataChange) {
      onDataChange({ phoneNumber: formattedText, countryCode: selectedCountryCode, isValid });
    }
  };

  const handleCountryCodeSelect = (countryCode: CountryCode) => {
    setSelectedCountryCode(countryCode.code);
    setIsModalVisible(false);
    
    // Re-validate phone number with new country code
    const isValid = isValidPhoneNumber(phoneNumber);
    if (onDataChange) {
      onDataChange({ phoneNumber, countryCode: countryCode.code, isValid });
    }
  };

  const getSelectedCountry = () => {
    return countryCodes.find(country => country.code === selectedCountryCode) || countryCodes[0];
  };

  const renderCountryItem = ({ item }: { item: CountryCode }) => (
    <TouchableOpacity
      style={styles.countryItem}
      onPress={() => handleCountryCodeSelect(item)}
    >
      <Text style={styles.countryFlag}>{item.flag}</Text>
      <Text style={styles.countryName}>{item.country}</Text>
      <Text style={styles.countryCode}>{item.code}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.content}>
      {/* Header Section */}
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
          What's your phone number?
        </Text>
        <Text style={[
          styles.subtitle,
          { fontSize: height < 700 ? 16 : 14 }
        ]}>
          We'll use this phone number on your job applications.
        </Text>

        {/* Phone Number Input Row */}
        <View style={[
          styles.phoneInputContainer,
          { marginTop: height < 700 ? 40 : 10 }
        ]}>
          {/* Country Code Selector */}
          <TouchableOpacity
            style={styles.countryCodeButton}
            onPress={() => {console.log("Showing modal"); 
                            setIsModalVisible(true);}}
          >
            <Text style={styles.countryCodeFlag}>{getSelectedCountry().flag}</Text>
            <Text style={styles.countryCodeText}>{selectedCountryCode}</Text>
            <Ionicons name="chevron-down" size={16} color={PrepTalkTheme.colors.mediumGray} />
          </TouchableOpacity>

          {/* Phone Number Input */}
          <View style={styles.phoneInputWrapper}>
            <TextInput
              ref={textInputRef}
              style={[
                styles.phoneInput,
                { fontSize: height < 700 ? 18 : 22 }
              ]}
              value={phoneNumber}
              onChangeText={handlePhoneNumberChange}
              placeholder={selectedCountryCode === '+1' ? '(555) 123-4567' : 'Phone number'}
              placeholderTextColor={PrepTalkTheme.colors.mediumGray}
              keyboardType="phone-pad"
              autoComplete="tel"
              textAlign="left"
              maxLength={selectedCountryCode === '+1' ? 14 : 20} // Formatted length for US
              blurOnSubmit={false} // Prevent keyboard from dismissing
              onBlur={() => {
                // Don't fight the system - let natural blur/focus happen
              }}
            />
            <View style={[
              styles.underline,
              { 
                backgroundColor: isValidPhoneNumber(phoneNumber) 
                  ? PrepTalkTheme.colors.primary 
                  : PrepTalkTheme.colors.mediumGray 
              }
            ]} />
          </View>
        </View>
      </View>

      {/* Country Code Selection Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Country</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Ionicons name="close" size={24} color={PrepTalkTheme.colors.text} />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={countryCodes}
            renderItem={renderCountryItem}
            keyExtractor={(item, index) => `${item.code}-${index}`}
            style={styles.countryList}
            showsVerticalScrollIndicator={false}
          />
        </SafeAreaView>
      </Modal>
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
    width: 320,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 300,
    alignItems: 'flex-end',
    gap: 12,
  },
  countryCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: PrepTalkTheme.colors.mediumGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 6,
    minWidth: 85,
  },
  countryCodeFlag: {
    fontSize: 16,
  },
  countryCodeText: {
    fontFamily: 'Nunito-Medium',
    color: PrepTalkTheme.colors.text,
    fontSize: 16,
  },
  phoneInputWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  phoneInput: {
    fontFamily: 'Nunito-Medium',
    color: PrepTalkTheme.colors.text,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
    width: '100%',
    textAlign: 'left',
  },
  underline: {
    height: 2,
    opacity: 0.6,
    marginTop: 4,
    width: '100%',
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: PrepTalkTheme.colors.mediumGray,
    borderBottomOpacity: 0.3,
  },
  modalTitle: {
    fontFamily: 'Lexend-Bold',
    fontSize: 18,
    color: PrepTalkTheme.colors.text,
  },
  modalCloseButton: {
    padding: 4,
  },
  countryList: {
    flex: 1,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: PrepTalkTheme.colors.mediumGray,
    borderBottomOpacity: 0.1,
  },
  countryFlag: {
    fontSize: 20,
    marginRight: 12,
  },
  countryName: {
    flex: 1,
    fontFamily: 'Nunito-Regular',
    fontSize: 16,
    color: PrepTalkTheme.colors.text,
  },
  countryCode: {
    fontFamily: 'Nunito-Medium',
    fontSize: 16,
    color: PrepTalkTheme.colors.mediumGray,
  },
});