// components/CountryCodeModal.tsx

import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  PrepTalkTheme, 
  getResponsiveValue 
} from '@/constants/Theme';

export interface CountryCode {
  country: string;
  code: string;
  flag: string;
}

interface CountryCodeModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectCountry: (country: CountryCode) => void;
  selectedCountryCode?: string;
  countryCodes?: CountryCode[];
}

// Default country codes - can be overridden via props
export const DEFAULT_COUNTRY_CODES: CountryCode[] = [
  { country: 'Afghanistan', code: '+93', flag: '🇦🇫' },
  { country: 'Albania', code: '+355', flag: '🇦🇱' },
  { country: 'Algeria', code: '+213', flag: '🇩🇿' },
  { country: 'Andorra', code: '+376', flag: '🇦🇩' },
  { country: 'Angola', code: '+244', flag: '🇦🇴' },
  { country: 'Argentina', code: '+54', flag: '🇦🇷' },
  { country: 'Armenia', code: '+374', flag: '🇦🇲' },
  { country: 'Australia', code: '+61', flag: '🇦🇺' },
  { country: 'Austria', code: '+43', flag: '🇦🇹' },
  { country: 'Azerbaijan', code: '+994', flag: '🇦🇿' },
  { country: 'Bahrain', code: '+973', flag: '🇧🇭' },
  { country: 'Bangladesh', code: '+880', flag: '🇧🇩' },
  { country: 'Belarus', code: '+375', flag: '🇧🇾' },
  { country: 'Belgium', code: '+32', flag: '🇧🇪' },
  { country: 'Belize', code: '+501', flag: '🇧🇿' },
  { country: 'Benin', code: '+229', flag: '🇧🇯' },
  { country: 'Bhutan', code: '+975', flag: '🇧🇹' },
  { country: 'Bolivia', code: '+591', flag: '🇧🇴' },
  { country: 'Bosnia and Herzegovina', code: '+387', flag: '🇧🇦' },
  { country: 'Botswana', code: '+267', flag: '🇧🇼' },
  { country: 'Brazil', code: '+55', flag: '🇧🇷' },
  { country: 'Brunei', code: '+673', flag: '🇧🇳' },
  { country: 'Bulgaria', code: '+359', flag: '🇧🇬' },
  { country: 'Burkina Faso', code: '+226', flag: '🇧🇫' },
  { country: 'Burundi', code: '+257', flag: '🇧🇮' },
  { country: 'Cambodia', code: '+855', flag: '🇰🇭' },
  { country: 'Cameroon', code: '+237', flag: '🇨🇲' },
  { country: 'Canada', code: '+1', flag: '🇨🇦' },
  { country: 'Cape Verde', code: '+238', flag: '🇨🇻' },
  { country: 'Central African Republic', code: '+236', flag: '🇨🇫' },
  { country: 'Chad', code: '+235', flag: '🇹🇩' },
  { country: 'Chile', code: '+56', flag: '🇨🇱' },
  { country: 'China', code: '+86', flag: '🇨🇳' },
  { country: 'Colombia', code: '+57', flag: '🇨🇴' },
  { country: 'Comoros', code: '+269', flag: '🇰🇲' },
  { country: 'Congo', code: '+242', flag: '🇨🇬' },
  { country: 'Costa Rica', code: '+506', flag: '🇨🇷' },
  { country: 'Croatia', code: '+385', flag: '🇭🇷' },
  { country: 'Cuba', code: '+53', flag: '🇨🇺' },
  { country: 'Cyprus', code: '+357', flag: '🇨🇾' },
  { country: 'Czech Republic', code: '+420', flag: '🇨🇿' },
  { country: 'Democratic Republic of Congo', code: '+243', flag: '🇨🇩' },
  { country: 'Denmark', code: '+45', flag: '🇩🇰' },
  { country: 'Djibouti', code: '+253', flag: '🇩🇯' },
  { country: 'Dominica', code: '+1767', flag: '🇩🇲' },
  { country: 'Dominican Republic', code: '+1809', flag: '🇩🇴' },
  { country: 'Ecuador', code: '+593', flag: '🇪🇨' },
  { country: 'Egypt', code: '+20', flag: '🇪🇬' },
  { country: 'El Salvador', code: '+503', flag: '🇸🇻' },
  { country: 'Equatorial Guinea', code: '+240', flag: '🇬🇶' },
  { country: 'Eritrea', code: '+291', flag: '🇪🇷' },
  { country: 'Estonia', code: '+372', flag: '🇪🇪' },
  { country: 'Eswatini', code: '+268', flag: '🇸🇿' },
  { country: 'Ethiopia', code: '+251', flag: '🇪🇹' },
  { country: 'Fiji', code: '+679', flag: '🇫🇯' },
  { country: 'Finland', code: '+358', flag: '🇫🇮' },
  { country: 'France', code: '+33', flag: '🇫🇷' },
  { country: 'Gabon', code: '+241', flag: '🇬🇦' },
  { country: 'Gambia', code: '+220', flag: '🇬🇲' },
  { country: 'Georgia', code: '+995', flag: '🇬🇪' },
  { country: 'Germany', code: '+49', flag: '🇩🇪' },
  { country: 'Ghana', code: '+233', flag: '🇬🇭' },
  { country: 'Greece', code: '+30', flag: '🇬🇷' },
  { country: 'Grenada', code: '+1473', flag: '🇬🇩' },
  { country: 'Guatemala', code: '+502', flag: '🇬🇹' },
  { country: 'Guinea', code: '+224', flag: '🇬🇳' },
  { country: 'Guinea-Bissau', code: '+245', flag: '🇬🇼' },
  { country: 'Guyana', code: '+592', flag: '🇬🇾' },
  { country: 'Haiti', code: '+509', flag: '🇭🇹' },
  { country: 'Honduras', code: '+504', flag: '🇭🇳' },
  { country: 'Hong Kong', code: '+852', flag: '🇭🇰' },
  { country: 'Hungary', code: '+36', flag: '🇭🇺' },
  { country: 'Iceland', code: '+354', flag: '🇮🇸' },
  { country: 'India', code: '+91', flag: '🇮🇳' },
  { country: 'Indonesia', code: '+62', flag: '🇮🇩' },
  { country: 'Iran', code: '+98', flag: '🇮🇷' },
  { country: 'Iraq', code: '+964', flag: '🇮🇶' },
  { country: 'Ireland', code: '+353', flag: '🇮🇪' },
  { country: 'Israel', code: '+972', flag: '🇮🇱' },
  { country: 'Italy', code: '+39', flag: '🇮🇹' },
  { country: 'Ivory Coast', code: '+225', flag: '🇨🇮' },
  { country: 'Jamaica', code: '+1876', flag: '🇯🇲' },
  { country: 'Japan', code: '+81', flag: '🇯🇵' },
  { country: 'Jordan', code: '+962', flag: '🇯🇴' },
  { country: 'Kazakhstan', code: '+7', flag: '🇰🇿' },
  { country: 'Kenya', code: '+254', flag: '🇰🇪' },
  { country: 'Kiribati', code: '+686', flag: '🇰🇮' },
  { country: 'Kosovo', code: '+383', flag: '🇽🇰' },
  { country: 'Kuwait', code: '+965', flag: '🇰🇼' },
  { country: 'Kyrgyzstan', code: '+996', flag: '🇰🇬' },
  { country: 'Laos', code: '+856', flag: '🇱🇦' },
  { country: 'Latvia', code: '+371', flag: '🇱🇻' },
  { country: 'Lebanon', code: '+961', flag: '🇱🇧' },
  { country: 'Lesotho', code: '+266', flag: '🇱🇸' },
  { country: 'Liberia', code: '+231', flag: '🇱🇷' },
  { country: 'Libya', code: '+218', flag: '🇱🇾' },
  { country: 'Liechtenstein', code: '+423', flag: '🇱🇮' },
  { country: 'Lithuania', code: '+370', flag: '🇱🇹' },
  { country: 'Luxembourg', code: '+352', flag: '🇱🇺' },
  { country: 'Macao', code: '+853', flag: '🇲🇴' },
  { country: 'Madagascar', code: '+261', flag: '🇲🇬' },
  { country: 'Malawi', code: '+265', flag: '🇲🇼' },
  { country: 'Malaysia', code: '+60', flag: '🇲🇾' },
  { country: 'Maldives', code: '+960', flag: '🇲🇻' },
  { country: 'Mali', code: '+223', flag: '🇲🇱' },
  { country: 'Malta', code: '+356', flag: '🇲🇹' },
  { country: 'Marshall Islands', code: '+692', flag: '🇲🇭' },
  { country: 'Mauritania', code: '+222', flag: '🇲🇷' },
  { country: 'Mauritius', code: '+230', flag: '🇲🇺' },
  { country: 'Mexico', code: '+52', flag: '🇲🇽' },
  { country: 'Micronesia', code: '+691', flag: '🇫🇲' },
  { country: 'Moldova', code: '+373', flag: '🇲🇩' },
  { country: 'Monaco', code: '+377', flag: '🇲🇨' },
  { country: 'Mongolia', code: '+976', flag: '🇲🇳' },
  { country: 'Montenegro', code: '+382', flag: '🇲🇪' },
  { country: 'Morocco', code: '+212', flag: '🇲🇦' },
  { country: 'Mozambique', code: '+258', flag: '🇲🇿' },
  { country: 'Myanmar', code: '+95', flag: '🇲🇲' },
  { country: 'Namibia', code: '+264', flag: '🇳🇦' },
  { country: 'Nauru', code: '+674', flag: '🇳🇷' },
  { country: 'Nepal', code: '+977', flag: '🇳🇵' },
  { country: 'Netherlands', code: '+31', flag: '🇳🇱' },
  { country: 'New Zealand', code: '+64', flag: '🇳🇿' },
  { country: 'Nicaragua', code: '+505', flag: '🇳🇮' },
  { country: 'Niger', code: '+227', flag: '🇳🇪' },
  { country: 'Nigeria', code: '+234', flag: '🇳🇬' },
  { country: 'North Korea', code: '+850', flag: '🇰🇵' },
  { country: 'North Macedonia', code: '+389', flag: '🇲🇰' },
  { country: 'Norway', code: '+47', flag: '🇳🇴' },
  { country: 'Oman', code: '+968', flag: '🇴🇲' },
  { country: 'Pakistan', code: '+92', flag: '🇵🇰' },
  { country: 'Palau', code: '+680', flag: '🇵🇼' },
  { country: 'Palestine', code: '+970', flag: '🇵🇸' },
  { country: 'Panama', code: '+507', flag: '🇵🇦' },
  { country: 'Papua New Guinea', code: '+675', flag: '🇵🇬' },
  { country: 'Paraguay', code: '+595', flag: '🇵🇾' },
  { country: 'Peru', code: '+51', flag: '🇵🇪' },
  { country: 'Philippines', code: '+63', flag: '🇵🇭' },
  { country: 'Poland', code: '+48', flag: '🇵🇱' },
  { country: 'Portugal', code: '+351', flag: '🇵🇹' },
  { country: 'Qatar', code: '+974', flag: '🇶🇦' },
  { country: 'Romania', code: '+40', flag: '🇷🇴' },
  { country: 'Russia', code: '+7', flag: '🇷🇺' },
  { country: 'Rwanda', code: '+250', flag: '🇷🇼' },
  { country: 'Saint Kitts and Nevis', code: '+1869', flag: '🇰🇳' },
  { country: 'Saint Lucia', code: '+1758', flag: '🇱🇨' },
  { country: 'Saint Vincent and the Grenadines', code: '+1784', flag: '🇻🇨' },
  { country: 'Samoa', code: '+685', flag: '🇼🇸' },
  { country: 'San Marino', code: '+378', flag: '🇸🇲' },
  { country: 'Sao Tome and Principe', code: '+239', flag: '🇸🇹' },
  { country: 'Saudi Arabia', code: '+966', flag: '🇸🇦' },
  { country: 'Senegal', code: '+221', flag: '🇸🇳' },
  { country: 'Serbia', code: '+381', flag: '🇷🇸' },
  { country: 'Seychelles', code: '+248', flag: '🇸🇨' },
  { country: 'Sierra Leone', code: '+232', flag: '🇸🇱' },
  { country: 'Singapore', code: '+65', flag: '🇸🇬' },
  { country: 'Slovakia', code: '+421', flag: '🇸🇰' },
  { country: 'Slovenia', code: '+386', flag: '🇸🇮' },
  { country: 'Solomon Islands', code: '+677', flag: '🇸🇧' },
  { country: 'Somalia', code: '+252', flag: '🇸🇴' },
  { country: 'South Africa', code: '+27', flag: '🇿🇦' },
  { country: 'South Korea', code: '+82', flag: '🇰🇷' },
  { country: 'South Sudan', code: '+211', flag: '🇸🇸' },
  { country: 'Spain', code: '+34', flag: '🇪🇸' },
  { country: 'Sri Lanka', code: '+94', flag: '🇱🇰' },
  { country: 'Sudan', code: '+249', flag: '🇸🇩' },
  { country: 'Suriname', code: '+597', flag: '🇸🇷' },
  { country: 'Sweden', code: '+46', flag: '🇸🇪' },
  { country: 'Switzerland', code: '+41', flag: '🇨🇭' },
  { country: 'Syria', code: '+963', flag: '🇸🇾' },
  { country: 'Taiwan', code: '+886', flag: '🇹🇼' },
  { country: 'Tajikistan', code: '+992', flag: '🇹🇯' },
  { country: 'Tanzania', code: '+255', flag: '🇹🇿' },
  { country: 'Thailand', code: '+66', flag: '🇹🇭' },
  { country: 'Timor-Leste', code: '+670', flag: '🇹🇱' },
  { country: 'Togo', code: '+228', flag: '🇹🇬' },
  { country: 'Tonga', code: '+676', flag: '🇹🇴' },
  { country: 'Trinidad and Tobago', code: '+1868', flag: '🇹🇹' },
  { country: 'Tunisia', code: '+216', flag: '🇹🇳' },
  { country: 'Turkey', code: '+90', flag: '🇹🇷' },
  { country: 'Turkmenistan', code: '+993', flag: '🇹🇲' },
  { country: 'Tuvalu', code: '+688', flag: '🇹🇻' },
  { country: 'Uganda', code: '+256', flag: '🇺🇬' },
  { country: 'Ukraine', code: '+380', flag: '🇺🇦' },
  { country: 'United Arab Emirates', code: '+971', flag: '🇦🇪' },
  { country: 'United Kingdom', code: '+44', flag: '🇬🇧' },
  { country: 'United States', code: '+1', flag: '🇺🇸' },
  { country: 'Uruguay', code: '+598', flag: '🇺🇾' },
  { country: 'Uzbekistan', code: '+998', flag: '🇺🇿' },
  { country: 'Vanuatu', code: '+678', flag: '🇻🇺' },
  { country: 'Vatican City', code: '+379', flag: '🇻🇦' },
  { country: 'Venezuela', code: '+58', flag: '🇻🇪' },
  { country: 'Vietnam', code: '+84', flag: '🇻🇳' },
  { country: 'Yemen', code: '+967', flag: '🇾🇪' },
  { country: 'Zambia', code: '+260', flag: '🇿🇲' },
  { country: 'Zimbabwe', code: '+263', flag: '🇿🇼' },
];

export const findCountryByCode = (code: string, countryName?: string): CountryCode => {
  // If we have a country name, find by both code and country name for exact match
  if (countryName) {
    const exactMatch = DEFAULT_COUNTRY_CODES.find(country => 
      country.code === code && country.country === countryName
    );
    if (exactMatch) return exactMatch;
  }
  
  // Fallback to first country with matching code
  return DEFAULT_COUNTRY_CODES.find(country => country.code === code) || DEFAULT_COUNTRY_CODES[0];
};

export default function CountryCodeModal({
  visible,
  onClose,
  onSelectCountry,
  selectedCountryCode,
  countryCodes = DEFAULT_COUNTRY_CODES,
}: CountryCodeModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<TextInput>(null);

  // Responsive values for modal elements
  const responsiveValues = {
    modalTitleFontSize: getResponsiveValue({
      small: 16,
      medium: 17,
      large: 18,
      xlarge: 19
    }),
    modalSearchFontSize: getResponsiveValue({
      small: 14,
      medium: 15,
      large: 16,
      xlarge: 17
    }),
    modalItemFontSize: getResponsiveValue({
      small: 14,
      medium: 15,
      large: 16,
      xlarge: 17
    }),
    modalIconSize: getResponsiveValue({
      small: 20,
      medium: 22,
      large: 24,
      xlarge: 26
    })
  };

  // Filter countries based on search query
  const filteredCountryCodes = countryCodes.filter(country =>
    country.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.code.includes(searchQuery)
  );

  const handleCountrySelect = (country: CountryCode) => {
    onSelectCountry(country);
    setSearchQuery(''); // Clear search when country is selected
  };

  const handleModalClose = () => {
    setSearchQuery(''); // Clear search when modal closes
    onClose();
  };

  // Focus search input when modal opens
  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [visible]);

  const renderCountryItem = ({ item }: { item: CountryCode }) => {
    const isSelected = item.code === selectedCountryCode;
    
    return (
      <TouchableOpacity
        style={[
          styles.countryItem,
          isSelected && styles.selectedCountryItem
        ]}
        onPress={() => handleCountrySelect(item)}
      >
        <Text style={[
          styles.countryFlag, 
          { fontSize: responsiveValues.modalIconSize }
        ]}>
          {item.flag}
        </Text>
        <Text style={[
          styles.countryName, 
          { fontSize: responsiveValues.modalItemFontSize },
          isSelected && styles.selectedText
        ]}>
          {item.country}
        </Text>
        <Text style={[
          styles.countryCodeText, 
          { fontSize: responsiveValues.modalItemFontSize },
          isSelected && styles.selectedText
        ]}>
          {item.code}
        </Text>
        {isSelected && (
          <Ionicons 
            name="checkmark" 
            size={responsiveValues.modalIconSize} 
            color={PrepTalkTheme.colors.primary} 
            style={styles.checkmark}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleModalClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={[
            styles.modalTitle,
            { fontSize: responsiveValues.modalTitleFontSize }
          ]}>
            Select Country
          </Text>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={handleModalClose}
          >
            <Ionicons 
              name="close" 
              size={responsiveValues.modalIconSize} 
              color={PrepTalkTheme.colors.text} 
            />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons 
            name="search" 
            size={responsiveValues.modalIconSize - 4} 
            color={PrepTalkTheme.colors.mediumGray} 
            style={styles.searchIcon}
          />
          <TextInput
            ref={searchInputRef}
            style={[
              styles.searchInput,
              { fontSize: responsiveValues.modalSearchFontSize }
            ]}
            placeholder="Search countries..."
            placeholderTextColor={PrepTalkTheme.colors.mediumGray}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
        </View>
        
        <FlatList
          data={filteredCountryCodes}
          renderItem={renderCountryItem}
          keyExtractor={(item, index) => `${item.code}-${index}`}
          style={styles.countryList}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
    color: PrepTalkTheme.colors.text,
  },
  modalCloseButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 0.5,
    borderBottomColor: PrepTalkTheme.colors.mediumGray,
    borderBottomOpacity: 0.08,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Nunito-Regular',
    color: PrepTalkTheme.colors.text,
    paddingVertical: 8,
    backgroundColor: 'transparent',
  },
  countryList: {
    flex: 1,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#1F212933',
    borderBottomOpacity: 0.1,
  },
  selectedCountryItem: {
    backgroundColor: PrepTalkTheme.colors.primaryLight + '20', // 20% opacity
  },
  countryFlag: {
    marginRight: 12,
  },
  countryName: {
    flex: 1,
    fontFamily: 'Nunito-Regular',
    color: PrepTalkTheme.colors.text,
  },
  countryCodeText: {
    fontFamily: 'Nunito-Medium',
    color: PrepTalkTheme.colors.mediumGray,
    marginRight: 8,
  },
  selectedText: {
    color: PrepTalkTheme.colors.primary,
    fontFamily: 'Nunito-SemiBold',
  },
  checkmark: {
    marginLeft: 8,
  },
});