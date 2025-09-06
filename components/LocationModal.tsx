// components/LocationModal.tsx

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
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  PrepTalkTheme, 
  getResponsiveValue 
} from '@/constants/Theme';
import CountrySelectionModal, { CountryWithAuth } from '@/components/CountrySelectionModal';

interface LocationResult {
  placeId: string;
  description: string;
  formattedAddress: string;
}

interface LocationModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (location: string) => void;
  selectedCountries: Array<{
    citizen: boolean;
    country_name: string;
    requires_sponsorship: boolean;
    work_authorization_status: boolean;
  }>;
  onCountriesUpdate?: (countries: Array<{
    country_name: string;
    citizen: boolean;
    requires_sponsorship: boolean;
    work_authorization_status: boolean;
  }>) => void;
}

export default function LocationModal({
  visible,
  onClose,
  onSave,
  selectedCountries = [],
  onCountriesUpdate,
}: LocationModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [isCountryModalVisible, setIsCountryModalVisible] = useState(false);
  const [currentSelectedCountries, setCurrentSelectedCountries] = useState(selectedCountries);
  const searchInputRef = useRef<TextInput>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Your Google Places API key - this should come from your config
  const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || 'YOUR_API_KEY_HERE';

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
    searchingInFontSize: getResponsiveValue({
      small: 12,
      medium: 13,
      large: 14,
      xlarge: 15
    }),
  };

  // Convert country names to ISO country codes for Google Places API
  const getCountryCodes = () => {
    const countryMap: { [key: string]: string } = {
      'United States': 'us',
      'Canada': 'ca',
      'United Kingdom': 'gb',
      'Australia': 'au',
      'Germany': 'de',
      'France': 'fr',
      'Spain': 'es',
      'Italy': 'it',
      'Netherlands': 'nl',
      'Belgium': 'be',
      'Switzerland': 'ch',
      'Austria': 'at',
      'Sweden': 'se',
      'Norway': 'no',
      'Denmark': 'dk',
      'Finland': 'fi',
      'Ireland': 'ie',
      'Portugal': 'pt',
      'Greece': 'gr',
      'Poland': 'pl',
      'Czech Republic': 'cz',
      'Hungary': 'hu',
      'Romania': 'ro',
      'Bulgaria': 'bg',
      'Croatia': 'hr',
      'Slovenia': 'si',
      'Slovakia': 'sk',
      'Estonia': 'ee',
      'Latvia': 'lv',
      'Lithuania': 'lt',
      'Luxembourg': 'lu',
      'Malta': 'mt',
      'Cyprus': 'cy',
      'Japan': 'jp',
      'South Korea': 'kr',
      'Singapore': 'sg',
      'Hong Kong': 'hk',
      'New Zealand': 'nz',
      'Mexico': 'mx',
      'Brazil': 'br',
      'Argentina': 'ar',
      'Chile': 'cl',
      'Colombia': 'co',
      'Peru': 'pe',
      'Uruguay': 'uy',
      'India': 'in',
      'China': 'cn',
      'South Africa': 'za',
      'Israel': 'il',
      'Turkey': 'tr',
      'Russia': 'ru',
      'Ukraine': 'ua',
      'Thailand': 'th',
      'Malaysia': 'my',
      'Indonesia': 'id',
      'Philippines': 'ph',
      'Vietnam': 'vn',
      'Taiwan': 'tw'
    };

    return currentSelectedCountries
      .map(country => countryMap[country.country_name])
      .filter(Boolean);
  };

  // Search for locations using Google Places Autocomplete API
  const searchLocations = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    try {
      const countryCodes = getCountryCodes();
      
      // Use Google Places Autocomplete (New) API
      const autocompleteUrl = 'https://places.googleapis.com/v1/places:autocomplete';
      
      const requestBody = {
        input: query,
        includedPrimaryTypes: ["locality", "administrative_area_level_1", "administrative_area_level_2"],
        ...(countryCodes.length > 0 && { includedRegionCodes: countryCodes })
      };

      const response = await fetch(autocompleteUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': API_KEY,
          'X-Goog-FieldMask': 'suggestions.placePrediction.placeId,suggestions.placePrediction.text'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${data.error?.message || 'Unknown error'}`);
      }

      if (data.suggestions) {
        const results: LocationResult[] = await Promise.all(
          data.suggestions.slice(0, 8).map(async (suggestion: any) => {
            const prediction = suggestion.placePrediction;
            
            // Get place details to ensure we have a properly formatted address
            try {
              const detailsUrl = `https://places.googleapis.com/v1/places/${prediction.placeId}`;
              const detailsResponse = await fetch(detailsUrl, {
                method: 'GET',
                headers: {
                  'X-Goog-Api-Key': API_KEY,
                  'X-Goog-FieldMask': 'formattedAddress,addressComponents'
                }
              });

              const detailsData = await detailsResponse.json();
              
              if (detailsResponse.ok && detailsData.formattedAddress) {
                // Extract city, state, country from address components
                const addressComponents = detailsData.addressComponents || [];
                
                const city = addressComponents.find((comp: any) => 
                  comp.types.includes('locality') || comp.types.includes('administrative_area_level_3')
                )?.longText;
                
                const state = addressComponents.find((comp: any) => 
                  comp.types.includes('administrative_area_level_1')
                )?.longText;
                
                const country = addressComponents.find((comp: any) => 
                  comp.types.includes('country')
                )?.longText;

                // Format as "city, state, country"
                const formattedLocation = [city, state, country]
                  .filter(Boolean)
                  .join(', ');

                return {
                  placeId: prediction.placeId,
                  description: prediction.text?.text || '',
                  formattedAddress: formattedLocation || detailsData.formattedAddress
                };
              }
            } catch (error) {
              console.warn('Failed to get place details:', error);
            }

            // Fallback to autocomplete description
            return {
              placeId: prediction.placeId,
              description: prediction.text?.text || '',
              formattedAddress: prediction.text?.text || ''
            };
          })
        );

        setSearchResults(results.filter(result => result.formattedAddress));
      } else {
        setSearchResults([]);
      }

    } catch (error) {
      console.error('Location search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchLocations(searchQuery);
    }, 300); // 300ms delay

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, currentSelectedCountries]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (visible) {
      setSearchQuery('');
      setSearchResults([]);
      setSelectedLocation('');
      setCurrentSelectedCountries(selectedCountries);
      // Focus search input
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [visible, selectedCountries]);

  const handleLocationSelect = (location: LocationResult) => {
    setSelectedLocation(location.formattedAddress);
  };

  const handleSave = () => {
    if (selectedLocation) {
      onSave(selectedLocation);
    }
  };

  const handleModalClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedLocation('');
    setIsCountryModalVisible(false);
    onClose();
  };

  // Helper function to transform CountryWithAuth to database format
  const transformCountryData = (countries: CountryWithAuth[]) => {
    return countries.map(country => {
      let citizen = false;
      let requires_sponsorship = false;
      let work_authorization_status = false;

      switch (country.authorizationStatus) {
        case 'Citizen':
          citizen = true;
          requires_sponsorship = false;
          work_authorization_status = true;
          break;
        case 'Authorized':
          citizen = false;
          requires_sponsorship = false;
          work_authorization_status = true;
          break;
        case 'Need Sponsor':
          citizen = false;
          requires_sponsorship = true;
          work_authorization_status = false;
          break;
      }

      return {
        country_name: country.name,
        citizen,
        requires_sponsorship,
        work_authorization_status
      };
    });
  };

  // Helper function to transform database format back to modal format
  const transformToModalFormat = (dbCountries: any[]) => {
    return dbCountries.map(country => {
      let authorizationStatus: 'Citizen' | 'Authorized' | 'Need Sponsor' = 'Citizen';
      
      if (country.citizen) {
        authorizationStatus = 'Citizen';
      } else if (country.work_authorization_status && !country.requires_sponsorship) {
        authorizationStatus = 'Authorized';
      } else if (country.requires_sponsorship) {
        authorizationStatus = 'Need Sponsor';
      }

      return {
        name: country.country_name,
        authorizationStatus
      };
    });
  };

  const handleCountriesUpdate = (selectedCountriesFromModal: CountryWithAuth[]) => {
    // Transform to database format
    const transformedData = transformCountryData(selectedCountriesFromModal);
    setCurrentSelectedCountries(transformedData);
    setIsCountryModalVisible(false);
    
    // Notify parent component if callback provided
    if (onCountriesUpdate) {
      onCountriesUpdate(transformedData);
    }
    
    // Clear current search results since countries changed
    setSearchResults([]);
    setSelectedLocation('');
  };

  const handleOpenCountryModal = () => {
    setIsCountryModalVisible(true);
  };

  // Generate the "Searching in" text
  const getSearchingInText = () => {
    if (currentSelectedCountries.length === 0) {
      return "Searching worldwide";
    } else if (currentSelectedCountries.length === 1) {
      return currentSelectedCountries[0].country_name;
    } else {
      const firstCountry = currentSelectedCountries[0].country_name;
      const otherCount = currentSelectedCountries.length - 1;
      return `${firstCountry} and ${otherCount} other${otherCount > 1 ? 's' : ''}`;
    }
  };

  const renderLocationItem = ({ item }: { item: LocationResult }) => {
    const isSelected = selectedLocation === item.formattedAddress;
    
    return (
      <TouchableOpacity
        style={[
          styles.locationItem,
          isSelected && styles.selectedLocationItem
        ]}
        onPress={() => handleLocationSelect(item)}
      >
        <Ionicons 
          name="location-outline" 
          size={responsiveValues.modalIconSize} 
          color={isSelected ? PrepTalkTheme.colors.primary : PrepTalkTheme.colors.mediumGray}
          style={styles.locationIcon}
        />
        <View style={styles.locationTextContainer}>
          <Text style={[
            styles.locationDescription,
            { fontSize: responsiveValues.modalItemFontSize },
            isSelected && styles.selectedText
          ]}>
            {item.description}
          </Text>
          {item.formattedAddress !== item.description && (
            <Text style={[
              styles.locationAddress,
              { fontSize: responsiveValues.modalItemFontSize * 0.85 }
            ]}>
              {item.formattedAddress}
            </Text>
          )}
        </View>
        {isSelected && (
          <Ionicons 
            name="checkmark" 
            size={responsiveValues.modalIconSize} 
            color={PrepTalkTheme.colors.primary} 
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
            Select Location
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
            placeholder="Search for a city or state..."
            placeholderTextColor={PrepTalkTheme.colors.mediumGray}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="words"
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
          {isSearching && (
            <ActivityIndicator 
              size="small" 
              color={PrepTalkTheme.colors.primary} 
              style={styles.searchLoader}
            />
          )}
        </View>

        {/* Searching In Section */}
        <View style={styles.searchingInContainer}>
          <Text style={[
            styles.searchingInText,
            { fontSize: responsiveValues.searchingInFontSize }
          ]}>
            Searching in{' '}
          </Text>
          <TouchableOpacity onPress={handleOpenCountryModal} activeOpacity={0.7}>
            <Text style={[
              styles.searchingInButton,
              { fontSize: responsiveValues.searchingInFontSize }
            ]}>
              {getSearchingInText()}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Results List */}
        <FlatList
          data={searchResults}
          renderItem={renderLocationItem}
          keyExtractor={(item) => item.placeId}
          style={styles.locationList}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            searchQuery.length >= 2 && !isSearching ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  No locations found for "{searchQuery}"
                </Text>
              </View>
            ) : searchQuery.length < 2 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  Start typing to search for locations
                </Text>
              </View>
            ) : null
          }
        />

        {/* Done Button */}
        <View style={styles.footerContainer}>
          <TouchableOpacity 
            style={[
              styles.doneButton,
              { paddingVertical: responsiveValues.buttonPaddingVertical },
              !selectedLocation && styles.disabledButton
            ]}
            onPress={selectedLocation ? handleSave : undefined}
            activeOpacity={selectedLocation ? 0.8 : 1}
            disabled={!selectedLocation}
          >
            <Text style={[
              styles.doneButtonText,
              { fontSize: responsiveValues.buttonFontSize },
              !selectedLocation && styles.disabledButtonText
            ]}>
              Done
            </Text>
          </TouchableOpacity>
        </View>

        {/* Country Selection Modal */}
        <CountrySelectionModal
          visible={isCountryModalVisible}
          onClose={() => setIsCountryModalVisible(false)}
          onSave={handleCountriesUpdate}
          initialSelectedCountries={transformToModalFormat(currentSelectedCountries)}
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
  searchLoader: {
    marginLeft: 12,
  },
  locationList: {
    flex: 1,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#1F212933',
    borderBottomOpacity: 0.1,
  },
  selectedLocationItem: {
    backgroundColor: PrepTalkTheme.colors.primaryLight + '20',
  },
  locationIcon: {
    marginRight: 12,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationDescription: {
    fontFamily: 'Nunito-Regular',
    color: PrepTalkTheme.colors.text,
  },
  locationAddress: {
    fontFamily: 'Nunito-Regular',
    color: PrepTalkTheme.colors.mediumGray,
    marginTop: 2,
  },
  selectedText: {
    color: PrepTalkTheme.colors.dark,
    fontFamily: 'Nunito-SemiBold',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'Nunito-Regular',
    color: PrepTalkTheme.colors.mediumGray,
    textAlign: 'center',
    fontSize: 16,
  },
  footerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: PrepTalkTheme.colors.mediumGray,
    borderTopOpacity: 0.3,
    backgroundColor: '#FFFFFF',
  },
  doneButton: {
    backgroundColor: PrepTalkTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 32,
    paddingHorizontal: 30,
  },
  doneButtonText: {
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
  searchingInContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 0.5,
    borderBottomColor: PrepTalkTheme.colors.mediumGray,
    borderBottomOpacity: 0.08,
  },
  searchingInText: {
    fontFamily: 'Nunito-Regular',
    color: PrepTalkTheme.colors.mediumGray,
  },
  searchingInButton: {
    fontFamily: 'Nunito-Medium',
    color: PrepTalkTheme.colors.primary,
    textDecorationLine: 'underline',
  },
});