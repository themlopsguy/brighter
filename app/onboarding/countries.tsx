// app/onboarding/countries.tsx

import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  useWindowDimensions,
  ScrollView,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  PrepTalkTheme, 
  useResponsiveFontSize, 
  useResponsiveSpacing, 
  useResponsiveHeaderPadding,
  getResponsiveValue 
} from '@/constants/Theme';
import { useAuth } from '@/services/AuthContext';
import CountrySelectionModal, { findCountryByName, CountryWithAuth } from '@/components/CountrySelectionModal';

export default function OnboardingCountries() {
  const { userProfile, updateUserProfile } = useAuth();
  const { width } = useWindowDimensions();
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Use responsive utilities
  const titleFontSize = useResponsiveFontSize('title');
  const subtitleFontSize = useResponsiveFontSize('subtitle');
  const headerPadding = useResponsiveHeaderPadding();
  const smallSpacing = useResponsiveSpacing('small');
  const mediumSpacing = useResponsiveSpacing('medium');

  // Custom responsive values for this specific component
  const responsiveValues = {
    subtitleWidth: getResponsiveValue({
      small: 200,
      medium: 220,
      large: 250,
      xlarge: 280
    }),
    countryItemFontSize: getResponsiveValue({
      small: 14,
      medium: 16,
      large: 18,
      xlarge: 20
    }),
    addButtonFontSize: getResponsiveValue({
      small: 14,
      medium: 16,
      large: 18,
      xlarge: 20
    }),
    countryItemPaddingVertical: getResponsiveValue({
      small: 4,
      medium: 6,
      large: 8,
      xlarge: 10
    }),
    countryItemPaddingHorizontal: getResponsiveValue({
      small: 20,
      medium: 22,
      large: 24,
      xlarge: 26
    }),
    addButtonPaddingVertical: getResponsiveValue({
      small: 6,
      medium: 8,
      large: 10,
      xlarge: 12
    }),
    addButtonPaddingHorizontal: getResponsiveValue({
      small: 20,
      medium: 22,
      large: 24,
      xlarge: 26
    }),
    itemGap: getResponsiveValue({
      small: 12,
      medium: 14,
      large: 16,
      xlarge: 18
    }),
    scrollMarginTop: getResponsiveValue({
      small: 8,
      medium: 12,
      large: 16,
      xlarge: 20
    }),
    horizontalPaddingPercent: getResponsiveValue({
      small: 0.12,
      medium: 0.10,
      large: 0.08,
      xlarge: 0.06
    }),
    flagSize: getResponsiveValue({
      small: 14,
      medium: 20,
      large: 22,
      xlarge: 24
    }),
    removeIconSize: getResponsiveValue({
      small: 18,
      medium: 20,
      large: 22,
      xlarge: 24
    })
  };

  // Calculate actual pixel value for horizontal padding
  const horizontalPadding = width * responsiveValues.horizontalPaddingPercent;

  // Get current countries from data, default to ['United States']
  const currentCountries = userProfile?.applying_countries || [];

  // Animation refs for country items and add button
  const animationRefs = useRef<Animated.Value[]>([]);
  const addButtonAnimationRef = useRef(new Animated.Value(0));

  // Initialize animation refs based on current countries
  useEffect(() => {
    // Reset animation refs when countries change
    const itemCount = currentCountries.length > 0 ? currentCountries.length : 1; // At least 1 for empty state
    animationRefs.current = Array.from({ length: itemCount }, () => new Animated.Value(0));
    //addButtonAnimationRef.current.setValue(0);

    // Animate country items
    const itemAnimations = animationRefs.current.map((animValue, index) =>
      Animated.spring(animValue, {
        toValue: 1,
        delay: index * 50, // Stagger each country by 50ms
        useNativeDriver: true,
        tension: 30,
        friction: 6,
      })
    );

    // Animate add button last
    const addButtonAnimation = Animated.spring(addButtonAnimationRef.current, {
      toValue: 1,
      delay: itemCount * 50, // After all items + 100ms
      useNativeDriver: true,
      tension: 30,
      friction: 6,
    });

    // Start all animations
    Animated.parallel([...itemAnimations, addButtonAnimation]).start();
  }, [currentCountries.length]);

  const handleRemoveCountry = (countryToRemove: string) => {
    const updatedCountries = currentCountries.filter((country: any) => country.country_name !== countryToRemove);
    updateUserProfile({ applying_countries: updatedCountries });
  };

  const handleAddCountries = () => {
    setIsModalVisible(true);
  };

  const handleSaveCountries = (selectedCountries: CountryWithAuth[]) => {
    const transformedData = transformCountryData(selectedCountries);
    updateUserProfile({ applying_countries: transformedData });
    setIsModalVisible(false);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
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
          Where will you be applying?
        </Text>
        
        <Text style={[
          styles.subtitle, 
          { 
            fontSize: subtitleFontSize,
            width: responsiveValues.subtitleWidth
          }
        ]}>
          These are the countries that we'll show you jobs from.
        </Text>

<Text style={[
  styles.listSubtitle,
  { fontSize: subtitleFontSize }
]}>
  Your current countries:
</Text>
<ScrollView
  style={[
    styles.scrollContainer,
    { marginTop: responsiveValues.scrollMarginTop }
  ]}
  contentContainerStyle={[
    styles.listContainer,
    { gap: responsiveValues.itemGap }
  ]}
  showsVerticalScrollIndicator={false}
  bounces={true}
  scrollEventThrottle={16}
>
  {/* Current Countries or Empty State */}
  {currentCountries.length > 0 ? (
    currentCountries.map((countryData, index) => {
      const country = findCountryByName(countryData.country_name);
      
      // Create animated transform for drop-down effect
      const animatedStyle = animationRefs.current[index] ? {
        transform: [
          {
            translateY: animationRefs.current[index].interpolate({
              inputRange: [0, 1],
              outputRange: [-50, 0], // Start 50px above, end at normal position
            }),
          },
        ],
        opacity: animationRefs.current[index],
      } : {};

    return (
        <Animated.View key={`${countryData.country_name}-${index}`} style={[animatedStyle, styles.animatedWrapper]}>
        <View style={[
            styles.countryItem,
            { 
            paddingVertical: responsiveValues.countryItemPaddingVertical,
            paddingHorizontal: responsiveValues.countryItemPaddingHorizontal
            }
        ]}>
            <Text style={[
            styles.countryFlag,
            { fontSize: responsiveValues.flagSize }
            ]}>
            {country?.flag || '🏳️'}
            </Text>
            <View style={styles.countryTextContainer}>
            <Text style={[
                styles.countryName,
                { fontSize: responsiveValues.countryItemFontSize }
            ]}>
                {countryData.country_name}
            </Text>
            <Text style={[
                styles.authorizationStatus,
                { fontSize: responsiveValues.countryItemFontSize * 0.7 }
            ]}>
                {countryData.citizen ? 'Citizen' : countryData.work_authorization_status ? 'Authorized' : 'Need Sponsor'}
            </Text>
            </View>
            {/* Always show remove button */}
            <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveCountry(countryData.country_name)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
            <Ionicons 
                name="close" 
                size={responsiveValues.removeIconSize} 
                color={PrepTalkTheme.colors.mediumGray}
            />
            </TouchableOpacity>
        </View>
        </Animated.View>
    );
    })
  ) : (
    /* Empty State */
    <Animated.View style={[
      animationRefs.current[0] ? {
        transform: [
          {
            translateY: animationRefs.current[0]?.interpolate({
              inputRange: [0, 1],
              outputRange: [-50, 0],
            }) || 0,
          },
        ],
        opacity: animationRefs.current[0] || 1,
      } : {},
      styles.animatedWrapper
    ]}>
      <View style={[
        styles.emptyStateContainer,
        { 
          paddingVertical: responsiveValues.countryItemPaddingVertical,
          paddingHorizontal: responsiveValues.countryItemPaddingHorizontal
        }
      ]}>
        <Text style={[
          styles.emptyStateText,
          { fontSize: responsiveValues.countryItemFontSize }
        ]}>
          No countries chosen...
        </Text>
      </View>
    </Animated.View>
  )}

          {/* Add Country Button */}
          <Animated.View style={[
            {
              transform: [
                {
                  translateY: addButtonAnimationRef.current.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-50, 0],
                  }),
                },
              ],
              opacity: addButtonAnimationRef.current,
            },
            styles.animatedWrapper
          ]}>
            <TouchableOpacity
              style={[
                styles.addButton,
                { 
                  paddingVertical: responsiveValues.addButtonPaddingVertical,
                  paddingHorizontal: responsiveValues.addButtonPaddingHorizontal
                }
              ]}
              onPress={handleAddCountries}
              activeOpacity={0.8}
            >
              <Ionicons 
                name="add" 
                size={responsiveValues.removeIconSize} 
                color={PrepTalkTheme.colors.dark} 
                style={styles.addIcon}
              />
              <Text style={[
                styles.addButtonText,
                { fontSize: responsiveValues.addButtonFontSize }
              ]}>
                Add country
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </View>

      {/* Country Selection Modal */}
      <CountrySelectionModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        onSave={handleSaveCountries}
        initialSelectedCountries={transformToModalFormat(currentCountries)} // Don't pre-select any countries in the modal
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
    flex: 1,
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
  scrollContainer: {
    flex: 1,
    width: '100%',
  },
  animatedWrapper: {
    width: '100%',
  },
listSubtitle: {
  fontFamily: 'Nunito-Regular',
  color: PrepTalkTheme.colors.mediumGray,
  alignSelf: 'flex-start', // Left align
  marginBottom: 0, // Small space before the list
  marginTop: 15,
  paddingHorizontal: 0, // Remove any horizontal padding
},
  listContainer: {
    alignItems: 'center',
    paddingBottom: 20, // Extra padding at bottom for scroll
    width: '100%',
    marginTop: 0,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: PrepTalkTheme.colors.mediumGray,
    borderRadius: 50,
    //backgroundColor: '#FFFFFF',
    opacity: 0.9,
    width: '100%',
  },
  countryFlag: {
    marginRight: 12,
  },
    countryTextContainer: {
    flex: 1,
    },
    countryName: {
    fontFamily: 'Nunito-SemiBold',
    color: PrepTalkTheme.colors.text,
    },
    authorizationStatus: {
    fontFamily: 'Nunito-Medium',
    color: PrepTalkTheme.colors.mediumGray,
    },
  removeButton: {
    padding: 4,
    borderRadius: 12,
    //backgroundColor: '#F5F5F5',
    marginLeft: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: PrepTalkTheme.colors.mediumGray,
    borderStyle: 'dashed',
    borderRadius: 50,
    backgroundColor: 'transparent',
    width: '100%',
  },
  addIcon: {
    marginRight: 8,
    opacity: 0.8
  },
  addButtonText: {
    fontFamily: 'Nunito-SemiBold',
    color: PrepTalkTheme.colors.dark,
    opacity: 0.8,
    textAlign: 'center',
  },
emptyStateContainer: {
  borderWidth: 1,
  borderColor: PrepTalkTheme.colors.mediumGray,
  borderRadius: 50,
  width: '100%',
  alignItems: 'center',
  justifyContent: 'center',
},
emptyStateText: {
  fontFamily: 'Nunito-Regular',
  color: PrepTalkTheme.colors.mediumGray,
  fontStyle: 'italic',
},
});