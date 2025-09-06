// app/onboarding/location.tsx

import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  useWindowDimensions,
  Alert,
  ActivityIndicator,
  Linking,
  AppState,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { 
  PrepTalkTheme, 
  useResponsiveFontSize, 
  useResponsiveSpacing, 
  useResponsiveHeaderPadding,
  getResponsiveValue 
} from '@/constants/Theme';
import { useAuth } from '@/services/AuthContext';
import LocationModal from '@/components/LocationModal';
import Rive from 'rive-react-native';
import { Asset } from 'expo-asset';

export default function OnboardingLocation() {
  const router = useRouter();
  const { userProfile, updateUserProfile } = useAuth();
  const { width } = useWindowDimensions();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(userProfile?.location || '');
  const [locationPermissionStatus, setLocationPermissionStatus] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  const [wasLocationDenied, setWasLocationDenied] = useState(false);
  const buttonAnimationRefs = useRef<Animated.Value[]>([]);
  const riveAsset = Asset.fromModule(require('@/assets/animations/location.riv'));

  // Use responsive utilities
  const titleFontSize = useResponsiveFontSize('title');
  const subtitleFontSize = useResponsiveFontSize('subtitle');
  const headerPadding = useResponsiveHeaderPadding();
  const mediumSpacing = useResponsiveSpacing('medium');

  // Custom responsive values for this specific component
  const responsiveValues = {
    animationSize: getResponsiveValue({
        small: 140,
        medium: 160,
        large: 180,
        xlarge: 200
    }),
    subtitleWidth: getResponsiveValue({
      small: 220,
      medium: 270,
      large: 300,
      xlarge: 280
    }),
    buttonFontSize: getResponsiveValue({
      small: 14,
      medium: 16,
      large: 18,
      xlarge: 20
    }),
    locationDisplayFontSize: getResponsiveValue({
      small: 12,
      medium: 14,
      large: 16,
      xlarge: 18
    }),
    buttonPaddingVertical: getResponsiveValue({
      small: 12,
      medium: 14,
      large: 16,
      xlarge: 18
    }),
    buttonPaddingHorizontal: getResponsiveValue({
      small: 24,
      medium: 26,
      large: 28,
      xlarge: 30
    }),
    buttonGap: getResponsiveValue({
      small: 12,
      medium: 14,
      large: 16,
      xlarge: 18
    }),
    horizontalPaddingPercent: getResponsiveValue({
      small: 0.12,
      medium: 0.10,
      large: 0.08,
      xlarge: 0.06
    }),
    iconSize: getResponsiveValue({
      small: 20,
      medium: 22,
      large: 24,
      xlarge: 26
    }),
    locationFieldPaddingVertical: getResponsiveValue({
      small: 14,
      medium: 16,
      large: 18,
      xlarge: 20
    }),
    locationFieldPaddingHorizontal: getResponsiveValue({
      small: 20,
      medium: 22,
      large: 24,
      xlarge: 26
    })
  };

  // Calculate actual pixel value for horizontal padding
  const horizontalPadding = width * responsiveValues.horizontalPaddingPercent;

  // Initialize selectedLocation from existing data
  useEffect(() => {
    if (userProfile?.location && !selectedLocation) {
      setSelectedLocation(userProfile?.location);
    }
  }, [userProfile?.location]);

    useEffect(() => {
    checkLocationPermissionStatus();
    }, []);

    useEffect(() => {
    const handleAppStateChange = async (nextAppState: string) => {
        if (nextAppState === 'active' && wasLocationDenied) {
        // User returned to app after we sent them to settings
        const { status } = await Location.getForegroundPermissionsAsync();
        setLocationPermissionStatus(status);
        
        if (status === 'granted') {
            // Location was enabled! Automatically get their location
            setWasLocationDenied(false);
            handleAutomaticLocationDetection();  // <-- USE NEW FUNCTION
        }
        }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => subscription?.remove();
    }, [wasLocationDenied]);

    // ADD this useEffect:
    useEffect(() => {
        // Determine number of buttons to animate
        const buttonCount = selectedLocation ? 1 : 2; // 1 for location field, 2 for both buttons
        
        // Reset animation refs
        buttonAnimationRefs.current = Array.from({ length: buttonCount }, () => new Animated.Value(0));

        // Animate main buttons
        const buttonAnimations = buttonAnimationRefs.current.map((animValue, index) =>
            Animated.spring(animValue, {
            toValue: 1,
            delay: index * 100, // Stagger each button by 100ms
            useNativeDriver: true,
            tension: 30,
            friction: 6,
            })
        );

        // Start all animations
        Animated.parallel([...buttonAnimations]).start();
    }, [selectedLocation]); // Re-animate when selectedLocation changes

    const checkLocationPermissionStatus = async () => {
    try {
        const { status } = await Location.getForegroundPermissionsAsync();
        setLocationPermissionStatus(status);
    } catch (error) {
        console.error('Error checking location permission:', error);
        setLocationPermissionStatus('denied');
    }
    };

  const handleUseCurrentLocation = async () => {
    // If permission is denied, open settings
    if (locationPermissionStatus === 'denied') {
        setWasLocationDenied(true);
        Linking.openSettings();
        return;
    }

    else {
        setIsLoadingLocation(true);
        
        try {
        // Request location permissions
        const { status } = await Location.requestForegroundPermissionsAsync();
        setLocationPermissionStatus(status);
        
        if (status !== 'granted') {
            setIsLoadingLocation(false);
            return;
        }

        // Get current position
        const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
        });

        // Reverse geocode to get address
        const reverseGeocode = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
        });

        if (reverseGeocode.length > 0) {
            const address = reverseGeocode[0];
            const city = address.city || address.subregion || '';
            const state = address.region || '';
            const country = address.country || '';
            
            // Format as "city, state, country"
            const formattedLocation = [city, state, country]
            .filter(Boolean)
            .join(', ');
            
            if (formattedLocation) {
            setSelectedLocation(formattedLocation);
            updateUserProfile({ location: formattedLocation }); // Update data here too
            } else {
            throw new Error('Unable to determine location');
            }
        } else {
            throw new Error('No address found for your location');
        }

        } catch (error) {
        console.error('Location error:', error);
        Alert.alert(
            'Location Error',
            'Unable to get your current location. Please try selecting manually.',
            [{ text: 'OK' }]
        );
        } finally {
        setIsLoadingLocation(false);
        }
     }
  };

    // ADD this new function before handleUseCurrentLocation:
    const handleAutomaticLocationDetection = async () => {
    setIsLoadingLocation(true);
    
    try {
        // Get current position
        const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        });

        // Reverse geocode to get address
        const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        });

        if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        const city = address.city || address.subregion || '';
        const state = address.region || '';
        const country = address.country || '';
        
        // Format as "city, state, country"
        const formattedLocation = [city, state, country]
            .filter(Boolean)
            .join(', ');
        
        if (formattedLocation) {
            setSelectedLocation(formattedLocation);
            updateUserProfile({ location: formattedLocation });
        } else {
            throw new Error('Unable to determine location');
        }
        } else {
        throw new Error('No address found for your location');
        }

    } catch (error) {
        console.error('Automatic location error:', error);
        // Silently fail for automatic detection - don't show error alert
    } finally {
        setIsLoadingLocation(false);
    }
    };

  const handleSelectManually = () => {
    setIsModalVisible(true);
  };

    const handleLocationSelected = (location: string) => {
        setSelectedLocation(location);
        updateUserProfile({ location: location });
        setWasLocationDenied(false);
        setIsModalVisible(false);
    };

  const handleEditLocation = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    checkLocationPermissionStatus();
  };

    const getLocationButtonConfig = () => {
    if (locationPermissionStatus === 'denied') {
        return {
        text: 'Enable location in settings',
        icon: 'cog' as const
        };
    }
    return {
        text: 'Use current location',
        icon: 'location' as const
    };
    };

  const buttonConfig = getLocationButtonConfig();

  const handleCountriesUpdate = (updatedCountries: Array<{
    country_name: string;
    citizen: boolean;
    requires_sponsorship: boolean;
    work_authorization_status: boolean;
  }>) => {
    // Update the countries in onboarding data
    updateUserProfile({ applying_countries: updatedCountries });
  };

  return (
    <View style={styles.content}>
      <View style={[
        styles.headerSection,
        { 
          paddingTop: headerPadding - 20,
          paddingHorizontal: horizontalPadding 
        }
      ]}>
        <Animated.View 
              style={[
                styles.locationAnimation,
              ]}
            >
              <Rive
                url={riveAsset.localUri || riveAsset.uri}
                style={{ width: responsiveValues.animationSize, height: responsiveValues.animationSize }}
                autoplay={true}
              />
        </Animated.View>
        <Text style={[
          styles.title, 
          { fontSize: titleFontSize }
        ]}>
          Where are you based?
        </Text>
        
        <Text style={[
          styles.subtitle, 
          { 
            fontSize: subtitleFontSize,
            width: responsiveValues.subtitleWidth
          }
        ]}>
          Many job applications require a location. We'll use this to auto-fill that area.
        </Text>

        <View style={[
          styles.buttonContainer,
          { 
            marginTop: mediumSpacing * 2,
            gap: responsiveValues.buttonGap
          }
        ]}>
          {!selectedLocation ? (
            // Show buttons when no location is selected
            <>
              <Animated.View style={[
                {
                  transform: [
                    {
                      translateY: buttonAnimationRefs.current[0]?.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-50, 0],
                      }) || 0,
                    },
                  ],
                  opacity: buttonAnimationRefs.current[0] || 1,
                  width: '100%',
                }
              ]}>
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  { 
                    paddingVertical: responsiveValues.buttonPaddingVertical,
                    paddingHorizontal: responsiveValues.buttonPaddingHorizontal
                  }
                ]}
                onPress={handleUseCurrentLocation}
                disabled={isLoadingLocation}
                activeOpacity={0.8}
              >
                {isLoadingLocation ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Ionicons 
                      name={buttonConfig.icon}
                      size={responsiveValues.iconSize}
                      color="white" 
                      style={styles.buttonIcon}
                    />
                    <Text style={[
                      styles.primaryButtonText,
                      { fontSize: responsiveValues.buttonFontSize }
                    ]}>
                      {buttonConfig.text}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
              </Animated.View>

              <Animated.View style={[
                {
                  transform: [
                    {
                      translateY: buttonAnimationRefs.current[1]?.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-50, 0],
                      }) || 0,
                    },
                  ],
                  opacity: buttonAnimationRefs.current[1] || 1,
                  width: '100%',
                }
              ]}>
              <TouchableOpacity
                style={[
                  styles.secondaryButton,
                  { 
                    paddingVertical: responsiveValues.buttonPaddingVertical,
                    paddingHorizontal: responsiveValues.buttonPaddingHorizontal
                  }
                ]}
                onPress={handleSelectManually}
                activeOpacity={0.8}
              >
                <Ionicons 
                  name="search" 
                  size={responsiveValues.iconSize} 
                  color={PrepTalkTheme.colors.primaryDark} 
                  style={styles.buttonIcon}
                />
                <Text style={[
                  styles.secondaryButtonText,
                  { fontSize: responsiveValues.buttonFontSize }
                ]}>
                  Select location manually
                </Text>
              </TouchableOpacity>
              </Animated.View>
            </>
          ) : (
            // Show selected location with edit option
            <Animated.View style={[
              {
                transform: [
                  {
                    translateY: buttonAnimationRefs.current[0]?.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-50, 0],
                    }) || 0,
                  },
                ],
                opacity: buttonAnimationRefs.current[0] || 1,
                width: '100%',
                minHeight: 100
              }
            ]}>
            <TouchableOpacity
              style={[
                styles.locationField,
                { 
                  paddingVertical: responsiveValues.locationFieldPaddingVertical,
                  paddingHorizontal: responsiveValues.locationFieldPaddingHorizontal
                }
              ]}
              onPress={handleEditLocation}
              activeOpacity={0.7}
            >
              <View style={styles.locationTextContainer}>
                <Text style={[
                  styles.locationText,
                  { fontSize: responsiveValues.locationDisplayFontSize }
                ]}
                numberOfLines={1} 
                ellipsizeMode="tail"
                >
                  {selectedLocation}
                </Text>
              </View>
              <Ionicons 
                name="pencil" 
                size={responsiveValues.iconSize} 
                color={PrepTalkTheme.colors.mediumGray}
              />
            </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      </View>

      {/* Location Modal */}
      <LocationModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        onSave={handleLocationSelected}
        selectedCountries={userProfile?.applying_countries ?? []}
        onCountriesUpdate={handleCountriesUpdate}
      />

        <View style={[
          styles.buttonContainer,
          { 
            marginTop: mediumSpacing * 2,
            gap: responsiveValues.buttonGap
          }
        ]}>
          {/* existing location buttons - no skip button here */}
        </View>

        {/* Skip Button - separate container at bottom */}
        <View style={styles.skipButtonContainer}>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => {
              setSelectedLocation('');
              updateUserProfile({ location: '' });
              router.push('/onboarding/rating');
            }}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.skipButtonText,
              { fontSize: responsiveValues.buttonFontSize * 0.9 }
            ]}>
              Skip for now
            </Text>
          </TouchableOpacity>
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
    flex: 0.1,
  },
locationAnimation: {
  alignSelf: 'center',
  marginBottom: 20, // Space between animation and title
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
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: PrepTalkTheme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
    width: '100%',
  },
  primaryButtonText: {
    color: 'white',
    fontFamily: 'Nunito-Bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: PrepTalkTheme.colors.primaryDark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
    width: '100%',
  },
  secondaryButtonText: {
    color: PrepTalkTheme.colors.primaryDark,
    fontFamily: 'Nunito-Bold',
  },
  buttonIcon: {
    marginRight: 8,
  },
  locationField: {
    backgroundColor: '#F2BD2C11',
    borderWidth: 1,
    borderColor: PrepTalkTheme.colors.primary,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    opacity: 0.9,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationText: {
    fontFamily: 'Nunito-SemiBold',
    color: PrepTalkTheme.colors.text,
    paddingHorizontal: 10,
  },
  skipButtonContainer: {
    position: 'absolute',
    bottom: 20, // Distance from bottom of headerSection
    left: 0,
    right: 0,
    alignItems: 'center',
    //paddingHorizontal: horizontalPadding, // You might need to make this a variable or use a fixed value like 40
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  skipButtonText: {
    fontFamily: 'Nunito-Medium',
    color: PrepTalkTheme.colors.mediumGray,
    textAlign: 'center',
  },
});