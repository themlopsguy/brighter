// components/CountrySelectionModal.tsx

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
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  PrepTalkTheme, 
  getResponsiveValue 
} from '@/constants/Theme';

export interface Country {
  name: string;
  flag: string;
}

export interface CountryWithAuth {
  name: string;
  authorizationStatus: 'Citizen' | 'Authorized' | 'Need Sponsor';
}

interface CountrySelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (selectedCountries: CountryWithAuth[]) => void;
  initialSelectedCountries?: CountryWithAuth[];
  countries?: Country[];
}

// Default countries list - extracted from CountryCodeModal but simplified
export const DEFAULT_COUNTRIES: Country[] = [
  { name: 'Afghanistan', flag: '🇦🇫' },
  { name: 'Albania', flag: '🇦🇱' },
  { name: 'Algeria', flag: '🇩🇿' },
  { name: 'Andorra', flag: '🇦🇩' },
  { name: 'Angola', flag: '🇦🇴' },
  { name: 'Argentina', flag: '🇦🇷' },
  { name: 'Armenia', flag: '🇦🇲' },
  { name: 'Australia', flag: '🇦🇺' },
  { name: 'Austria', flag: '🇦🇹' },
  { name: 'Azerbaijan', flag: '🇦🇿' },
  { name: 'Bahrain', flag: '🇧🇭' },
  { name: 'Bangladesh', flag: '🇧🇩' },
  { name: 'Belarus', flag: '🇧🇾' },
  { name: 'Belgium', flag: '🇧🇪' },
  { name: 'Belize', flag: '🇧🇿' },
  { name: 'Benin', flag: '🇧🇯' },
  { name: 'Bhutan', flag: '🇧🇹' },
  { name: 'Bolivia', flag: '🇧🇴' },
  { name: 'Bosnia and Herzegovina', flag: '🇧🇦' },
  { name: 'Botswana', flag: '🇧🇼' },
  { name: 'Brazil', flag: '🇧🇷' },
  { name: 'Brunei', flag: '🇧🇳' },
  { name: 'Bulgaria', flag: '🇧🇬' },
  { name: 'Burkina Faso', flag: '🇧🇫' },
  { name: 'Burundi', flag: '🇧🇮' },
  { name: 'Cambodia', flag: '🇰🇭' },
  { name: 'Cameroon', flag: '🇨🇲' },
  { name: 'Canada', flag: '🇨🇦' },
  { name: 'Cape Verde', flag: '🇨🇻' },
  { name: 'Central African Republic', flag: '🇨🇫' },
  { name: 'Chad', flag: '🇹🇩' },
  { name: 'Chile', flag: '🇨🇱' },
  { name: 'China', flag: '🇨🇳' },
  { name: 'Colombia', flag: '🇨🇴' },
  { name: 'Comoros', flag: '🇰🇲' },
  { name: 'Congo', flag: '🇨🇬' },
  { name: 'Costa Rica', flag: '🇨🇷' },
  { name: 'Croatia', flag: '🇭🇷' },
  { name: 'Cuba', flag: '🇨🇺' },
  { name: 'Cyprus', flag: '🇨🇾' },
  { name: 'Czech Republic', flag: '🇨🇿' },
  { name: 'Democratic Republic of Congo', flag: '🇨🇩' },
  { name: 'Denmark', flag: '🇩🇰' },
  { name: 'Djibouti', flag: '🇩🇯' },
  { name: 'Dominica', flag: '🇩🇲' },
  { name: 'Dominican Republic', flag: '🇩🇴' },
  { name: 'Ecuador', flag: '🇪🇨' },
  { name: 'Egypt', flag: '🇪🇬' },
  { name: 'El Salvador', flag: '🇸🇻' },
  { name: 'Equatorial Guinea', flag: '🇬🇶' },
  { name: 'Eritrea', flag: '🇪🇷' },
  { name: 'Estonia', flag: '🇪🇪' },
  { name: 'Eswatini', flag: '🇸🇿' },
  { name: 'Ethiopia', flag: '🇪🇹' },
  { name: 'Fiji', flag: '🇫🇯' },
  { name: 'Finland', flag: '🇫🇮' },
  { name: 'France', flag: '🇫🇷' },
  { name: 'Gabon', flag: '🇬🇦' },
  { name: 'Gambia', flag: '🇬🇲' },
  { name: 'Georgia', flag: '🇬🇪' },
  { name: 'Germany', flag: '🇩🇪' },
  { name: 'Ghana', flag: '🇬🇭' },
  { name: 'Greece', flag: '🇬🇷' },
  { name: 'Grenada', flag: '🇬🇩' },
  { name: 'Guatemala', flag: '🇬🇹' },
  { name: 'Guinea', flag: '🇬🇳' },
  { name: 'Guinea-Bissau', flag: '🇬🇼' },
  { name: 'Guyana', flag: '🇬🇾' },
  { name: 'Haiti', flag: '🇭🇹' },
  { name: 'Honduras', flag: '🇭🇳' },
  { name: 'Hong Kong', flag: '🇭🇰' },
  { name: 'Hungary', flag: '🇭🇺' },
  { name: 'Iceland', flag: '🇮🇸' },
  { name: 'India', flag: '🇮🇳' },
  { name: 'Indonesia', flag: '🇮🇩' },
  { name: 'Iran', flag: '🇮🇷' },
  { name: 'Iraq', flag: '🇮🇶' },
  { name: 'Ireland', flag: '🇮🇪' },
  { name: 'Israel', flag: '🇮🇱' },
  { name: 'Italy', flag: '🇮🇹' },
  { name: 'Ivory Coast', flag: '🇨🇮' },
  { name: 'Jamaica', flag: '🇯🇲' },
  { name: 'Japan', flag: '🇯🇵' },
  { name: 'Jordan', flag: '🇯🇴' },
  { name: 'Kazakhstan', flag: '🇰🇿' },
  { name: 'Kenya', flag: '🇰🇪' },
  { name: 'Kiribati', flag: '🇰🇮' },
  { name: 'Kosovo', flag: '🇽🇰' },
  { name: 'Kuwait', flag: '🇰🇼' },
  { name: 'Kyrgyzstan', flag: '🇰🇬' },
  { name: 'Laos', flag: '🇱🇦' },
  { name: 'Latvia', flag: '🇱🇻' },
  { name: 'Lebanon', flag: '🇱🇧' },
  { name: 'Lesotho', flag: '🇱🇸' },
  { name: 'Liberia', flag: '🇱🇷' },
  { name: 'Libya', flag: '🇱🇾' },
  { name: 'Liechtenstein', flag: '🇱🇮' },
  { name: 'Lithuania', flag: '🇱🇹' },
  { name: 'Luxembourg', flag: '🇱🇺' },
  { name: 'Macao', flag: '🇲🇴' },
  { name: 'Madagascar', flag: '🇲🇬' },
  { name: 'Malawi', flag: '🇲🇼' },
  { name: 'Malaysia', flag: '🇲🇾' },
  { name: 'Maldives', flag: '🇲🇻' },
  { name: 'Mali', flag: '🇲🇱' },
  { name: 'Malta', flag: '🇲🇹' },
  { name: 'Marshall Islands', flag: '🇲🇭' },
  { name: 'Mauritania', flag: '🇲🇷' },
  { name: 'Mauritius', flag: '🇲🇺' },
  { name: 'Mexico', flag: '🇲🇽' },
  { name: 'Micronesia', flag: '🇫🇲' },
  { name: 'Moldova', flag: '🇲🇩' },
  { name: 'Monaco', flag: '🇲🇨' },
  { name: 'Mongolia', flag: '🇲🇳' },
  { name: 'Montenegro', flag: '🇲🇪' },
  { name: 'Morocco', flag: '🇲🇦' },
  { name: 'Mozambique', flag: '🇲🇿' },
  { name: 'Myanmar', flag: '🇲🇲' },
  { name: 'Namibia', flag: '🇳🇦' },
  { name: 'Nauru', flag: '🇳🇷' },
  { name: 'Nepal', flag: '🇳🇵' },
  { name: 'Netherlands', flag: '🇳🇱' },
  { name: 'New Zealand', flag: '🇳🇿' },
  { name: 'Nicaragua', flag: '🇳🇮' },
  { name: 'Niger', flag: '🇳🇪' },
  { name: 'Nigeria', flag: '🇳🇬' },
  { name: 'North Korea', flag: '🇰🇵' },
  { name: 'North Macedonia', flag: '🇲🇰' },
  { name: 'Norway', flag: '🇳🇴' },
  { name: 'Oman', flag: '🇴🇲' },
  { name: 'Pakistan', flag: '🇵🇰' },
  { name: 'Palau', flag: '🇵🇼' },
  { name: 'Palestine', flag: '🇵🇸' },
  { name: 'Panama', flag: '🇵🇦' },
  { name: 'Papua New Guinea', flag: '🇵🇬' },
  { name: 'Paraguay', flag: '🇵🇾' },
  { name: 'Peru', flag: '🇵🇪' },
  { name: 'Philippines', flag: '🇵🇭' },
  { name: 'Poland', flag: '🇵🇱' },
  { name: 'Portugal', flag: '🇵🇹' },
  { name: 'Qatar', flag: '🇶🇦' },
  { name: 'Romania', flag: '🇷🇴' },
  { name: 'Russia', flag: '🇷🇺' },
  { name: 'Rwanda', flag: '🇷🇼' },
  { name: 'Saint Kitts and Nevis', flag: '🇰🇳' },
  { name: 'Saint Lucia', flag: '🇱🇨' },
  { name: 'Saint Vincent and the Grenadines', flag: '🇻🇨' },
  { name: 'Samoa', flag: '🇼🇸' },
  { name: 'San Marino', flag: '🇸🇲' },
  { name: 'Sao Tome and Principe', flag: '🇸🇹' },
  { name: 'Saudi Arabia', flag: '🇸🇦' },
  { name: 'Senegal', flag: '🇸🇳' },
  { name: 'Serbia', flag: '🇷🇸' },
  { name: 'Seychelles', flag: '🇸🇨' },
  { name: 'Sierra Leone', flag: '🇸🇱' },
  { name: 'Singapore', flag: '🇸🇬' },
  { name: 'Slovakia', flag: '🇸🇰' },
  { name: 'Slovenia', flag: '🇸🇮' },
  { name: 'Solomon Islands', flag: '🇸🇧' },
  { name: 'Somalia', flag: '🇸🇴' },
  { name: 'South Africa', flag: '🇿🇦' },
  { name: 'South Korea', flag: '🇰🇷' },
  { name: 'South Sudan', flag: '🇸🇸' },
  { name: 'Spain', flag: '🇪🇸' },
  { name: 'Sri Lanka', flag: '🇱🇰' },
  { name: 'Sudan', flag: '🇸🇩' },
  { name: 'Suriname', flag: '🇸🇷' },
  { name: 'Sweden', flag: '🇸🇪' },
  { name: 'Switzerland', flag: '🇨🇭' },
  { name: 'Syria', flag: '🇸🇾' },
  { name: 'Taiwan', flag: '🇹🇼' },
  { name: 'Tajikistan', flag: '🇹🇯' },
  { name: 'Tanzania', flag: '🇹🇿' },
  { name: 'Thailand', flag: '🇹🇭' },
  { name: 'Timor-Leste', flag: '🇹🇱' },
  { name: 'Togo', flag: '🇹🇬' },
  { name: 'Tonga', flag: '🇹🇴' },
  { name: 'Trinidad and Tobago', flag: '🇹🇹' },
  { name: 'Tunisia', flag: '🇹🇳' },
  { name: 'Turkey', flag: '🇹🇷' },
  { name: 'Turkmenistan', flag: '🇹🇲' },
  { name: 'Tuvalu', flag: '🇹🇻' },
  { name: 'Uganda', flag: '🇺🇬' },
  { name: 'Ukraine', flag: '🇺🇦' },
  { name: 'United Arab Emirates', flag: '🇦🇪' },
  { name: 'United Kingdom', flag: '🇬🇧' },
  { name: 'United States', flag: '🇺🇸' },
  { name: 'Uruguay', flag: '🇺🇾' },
  { name: 'Uzbekistan', flag: '🇺🇿' },
  { name: 'Vanuatu', flag: '🇻🇺' },
  { name: 'Vatican City', flag: '🇻🇦' },
  { name: 'Venezuela', flag: '🇻🇪' },
  { name: 'Vietnam', flag: '🇻🇳' },
  { name: 'Yemen', flag: '🇾🇪' },
  { name: 'Zambia', flag: '🇿🇲' },
  { name: 'Zimbabwe', flag: '🇿🇼' },
];

export const findCountryByName = (name: string): Country | undefined => {
  return DEFAULT_COUNTRIES.find(country => country.name === name);
};

export default function CountrySelectionModal({
  visible,
  onClose,
  onSave,
  initialSelectedCountries = [],
  countries = DEFAULT_COUNTRIES,
}: CountrySelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountries, setSelectedCountries] = useState<CountryWithAuth[]>(initialSelectedCountries);
  const searchInputRef = useRef<TextInput>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const authAnimationRefs = useRef<Map<string, Animated.Value>>(new Map());

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
    }),
    buttonFontSize: getResponsiveValue({
      small: 14,
      medium: 16,
      large: 18,
      xlarge: 20
    }),
    buttonPaddingVertical: getResponsiveValue({
      small: 12,
      medium: 14,
      large: 14,
      xlarge: 16
    }),
    authLabelFontSize: getResponsiveValue({
      small: 9,
      medium: 10,
      large: 11,
      xlarge: 12
    }),
    authOptionsPadding: getResponsiveValue ({
        small: 12,
        medium: 15,
        large: 18,
        xlarge: 22
    }),
    authOptionFontSize: getResponsiveValue({
      small: 10,
      medium: 11,
      large: 12,
      xlarge: 14
    }),
    authOptionPaddingVertical: getResponsiveValue({
      small: 6,
      medium: 7,
      large: 8,
      xlarge: 9
    }),
    authOptionPaddingHorizontal: getResponsiveValue({
      small: 6,
      medium: 6,
      large: 8,
      xlarge: 9
    }),
    authStatusDisplayFontSize: getResponsiveValue({
      small: 9,
      medium: 10, 
      large: 11,
      xlarge: 12
    })
  };

  // Filter countries based on search query
  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Reset selected countries when modal opens/closes
  useEffect(() => {
    if (visible) {
      setSelectedCountries(initialSelectedCountries);
    }
  }, [visible, initialSelectedCountries]);

  const handleCountryToggle = (countryName: string) => {
    setSelectedCountries(prev => {
      const existingIndex = prev.findIndex(country => country.name === countryName);
      
      if (existingIndex >= 0) {
        // Remove country if already selected
        return prev.filter(country => country.name !== countryName);
      } else {
        // Add country with default authorization status
        return [...prev, { name: countryName, authorizationStatus: 'Citizen' }];
      }
    });
  };

    const handleAuthorizationChange = (countryName: string, authStatus: 'Citizen' | 'Authorized' | 'Need Sponsor') => {
    const animValue = getAuthAnimationValue(countryName);
    const targetPosition = authStatus === 'Citizen' ? 0 : authStatus === 'Authorized' ? 1 : 2;
    
    Animated.spring(animValue, {
        toValue: targetPosition,
        useNativeDriver: false,
        tension: 50,
        friction: 8,
    }).start();

    setSelectedCountries(prev => 
        prev.map(country => 
        country.name === countryName 
            ? { ...country, authorizationStatus: authStatus }
            : country
        )
    );
    };

  const handleSave = () => {
    onSave(selectedCountries);
    setSearchQuery(''); // Clear search when saving
  };

  const handleModalClose = () => {
    setSearchQuery(''); // Clear search when modal closes
    setSelectedCountries(initialSelectedCountries); // Reset selections
    onClose();
  };

    const getAuthAnimationValue = (countryName: string) => {
    if (!authAnimationRefs.current.has(countryName)) {
        authAnimationRefs.current.set(countryName, new Animated.Value(0));
    }
    return authAnimationRefs.current.get(countryName)!;
    };



  // Focus search input when modal opens
  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [visible]);

  const renderCountryItem = ({ item }: { item: Country }) => {
    const selectedCountry = selectedCountries.find(country => country.name === item.name);
    const isSelected = !!selectedCountry;
    
    return (
      <View>
        <TouchableOpacity
          style={[
            styles.countryItem,
            isSelected && styles.selectedCountryItem
          ]}
          onPress={() => handleCountryToggle(item.name)}
        >
          <Text style={[
            styles.countryFlag, 
            { fontSize: responsiveValues.modalIconSize }
          ]}>
            {item.flag}
          </Text>
          <View style={styles.countryTextContainer}>
            <Text style={[
              styles.countryName, 
              { fontSize: responsiveValues.modalItemFontSize },
              isSelected && styles.selectedText
            ]}>
              {item.name}
            </Text>
            {isSelected && selectedCountry && (
              <Text style={[
                styles.authorizationStatusDisplay,
                { fontSize: responsiveValues.authStatusDisplayFontSize }
              ]}>
                {selectedCountry.authorizationStatus}
              </Text>
            )}
          </View>
          {isSelected && (
            <Ionicons 
              name="checkmark" 
              size={responsiveValues.modalIconSize} 
              color={PrepTalkTheme.colors.primary} 
              style={styles.checkmark}
            />
          )}
        </TouchableOpacity>
        
        {/* Authorization Status Selection Menu */}
        {isSelected && (
          <View style={styles.authorizationContainer}>
            <Text style={[
              styles.authorizationLabel,
              { fontSize: responsiveValues.authLabelFontSize }
            ]}>
              Authorization Status:
            </Text>
                <View style={[
                styles.authorizationOptions,
                { paddingHorizontal: responsiveValues.authOptionsPadding }
                ]}
                onLayout={(event) => {
                const { width, height } = event.nativeEvent.layout;
                setContainerWidth(width);
                setContainerHeight(height)
                }}>
                {/* Animated background slider */}
                <Animated.View style={[
                styles.authSlider,
                {
                    transform: [{
                    translateX: getAuthAnimationValue(item.name).interpolate({
                        inputRange: [0, 1, 2],
                        outputRange: [
                        responsiveValues.authOptionsPadding / 2, 
                        containerWidth / 3, 
                        (containerWidth / 3) * 2 - (responsiveValues.authOptionsPadding / 2)
                        ],
                    })
                    }],
                    width: (containerWidth / 3),
                }
                ]} />
              {['Citizen', 'Authorized', 'Need Sponsor'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.authorizationOption,
                    { paddingVertical: responsiveValues.authOptionPaddingVertical },
                    { paddingHorizontal: responsiveValues.authOptionPaddingHorizontal },
                    { marginVertical: 2},
                    { marginHorizontal: 2},
                    selectedCountry?.authorizationStatus === option && styles.selectedAuthOption
                  ]}
                  onPress={() => handleAuthorizationChange(item.name, option as 'Citizen' | 'Authorized' | 'Need Sponsor')}
                >
                  <Text style={[
                    styles.authorizationOptionText,
                    { fontSize: responsiveValues.authOptionFontSize, },
                    selectedCountry?.authorizationStatus === option && styles.selectedAuthOptionText
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>
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
            Select Countries
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
          data={filteredCountries}
          renderItem={renderCountryItem}
          keyExtractor={(item, index) => `${item.name}-${index}`}
          style={styles.countryList}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />

        {/* Save Button */}
        <View style={styles.footerContainer}>
          <TouchableOpacity 
            style={[
              styles.saveButton,
              { paddingVertical: responsiveValues.buttonPaddingVertical },
              selectedCountries.length === 0 && styles.disabledButton
            ]}
            onPress={selectedCountries.length > 0 ? handleSave : undefined}
            activeOpacity={selectedCountries.length > 0 ? 0.8 : 1}
            disabled={selectedCountries.length === 0}
          >
            <Text style={[
              styles.saveButtonText,
              { fontSize: responsiveValues.buttonFontSize },
              selectedCountries.length === 0 && styles.disabledButtonText
            ]}>
              Save ({selectedCountries.length})
            </Text>
          </TouchableOpacity>
        </View>
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
  countryTextContainer: {
    flex: 1,
  },
  countryName: {
    fontFamily: 'Nunito-Regular',
    color: PrepTalkTheme.colors.text,
  },
  authorizationStatusDisplay: {
    fontFamily: 'Nunito-Medium',
    color: PrepTalkTheme.colors.mediumGray,
    marginTop: 2,
  },
  selectedText: {
    color: PrepTalkTheme.colors.dark,
    fontFamily: 'Nunito-SemiBold',
  },
  checkmark: {
    marginLeft: 8,
  },
  authorizationContainer: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 0.5,
    borderBottomColor: '#1F212933',
    borderBottomOpacity: 0.1,
  },
  authorizationLabel: {
    fontFamily: 'Nunito-Medium',
    color: PrepTalkTheme.colors.mediumGray,
    marginBottom: 8,
  },
  authorizationOptions: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: "#8B8F9A33",
    borderRadius: 16,
  },
  authorizationOption: {
    flex: 1,
    borderWidth: 0,
    borderColor: PrepTalkTheme.colors.mediumGray,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
    authSlider: {
    position: 'absolute',
    height: '90%',
    backgroundColor: PrepTalkTheme.colors.primary,
    borderRadius: 16,
    top: '5%',
    left: 0,
    zIndex: 1,
    },
  selectedAuthOption: {
    // backgroundColor: PrepTalkTheme.colors.primary,
    // borderColor: PrepTalkTheme.colors.primary,
  },
  authorizationOptionText: {
    fontFamily: 'Nunito-Medium',
    color: PrepTalkTheme.colors.text,
    textAlign: 'center',
  },
  selectedAuthOptionText: {
    color: '#FFFFFF',
    fontFamily: 'Nunito-Bold',
  },
  footerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: PrepTalkTheme.colors.mediumGray,
    borderTopOpacity: 0.3,
    backgroundColor: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: PrepTalkTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 32,
    paddingHorizontal: 30,
  },
  saveButtonText: {
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