// app/onboarding/age.tsx

import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  useWindowDimensions,
  Animated
} from 'react-native';
import { 
  PrepTalkTheme, 
  useResponsiveFontSize, 
  useResponsiveSpacing, 
  useResponsiveHeaderPadding,
  getResponsiveValue 
} from '@/constants/Theme';
import { useOnboardingData } from './_layout';
import BirthdayPicker from '@/components/BirthdayPicker';

export default function OnboardingAge() {
  const { data, updateData } = useOnboardingData();
  const { width } = useWindowDimensions();
  
  // Use responsive utilities
  const titleFontSize = useResponsiveFontSize('title');
  const subtitleFontSize = useResponsiveFontSize('subtitle');
  const headerPadding = useResponsiveHeaderPadding();
  const smallSpacing = useResponsiveSpacing('small');
  const mediumSpacing = useResponsiveSpacing('medium');

  // Custom responsive values for this component
  const responsiveValues = {
    subtitleWidth: getResponsiveValue({
      small: 250,
      medium: 280,
      large: 320,
      xlarge: 350
    }),
    buttonFontSize: getResponsiveValue({
      small: 14,
      medium: 16,
      large: 18,
      xlarge: 20
    }),
    buttonPaddingVertical: getResponsiveValue({
      small: 14,
      medium: 16,
      large: 18,
      xlarge: 20
    }),
    buttonPaddingHorizontal: getResponsiveValue({
      small: 20,
      medium: 22,
      large: 24,
      xlarge: 26
    }),
    datePickerMarginTop: getResponsiveValue({
      small: 16,
      medium: 20,
      large: 24,
      xlarge: 30
    }),
    buttonMarginTop: getResponsiveValue({
      small: 16,
      medium: 20,
      large: 24,
      xlarge: 30
    }),
    containerMaxWidth: getResponsiveValue({
      small: 280,
      medium: 300,
      large: 320,
      xlarge: 350
    }),
    horizontalPaddingPercent: getResponsiveValue({
      small: 0.12,
      medium: 0.10,
      large: 0.08,
      xlarge: 0.06
    })
  };

  // Calculate actual pixel value for horizontal padding
  const horizontalPadding = width * responsiveValues.horizontalPaddingPercent;
  
  // Animation refs
  const datePickerAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;
  
  // Date picker state
  const [selectedDate, setSelectedDate] = useState(new Date(2000, 0, 1)); // Default to Jan 1, 2000
  const [preferNotToSay, setPreferNotToSay] = useState(false);
  const [hasBirthdaySelected, setHasBirthdaySelected] = useState(false);

  // Calculate date range (18-80 years old)
  const today = new Date();
  const maxDate = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate()); // 13 years ago
  const minDate = new Date(today.getFullYear() - 80, today.getMonth(), today.getDate()); // 80 years ago

  // Trigger animation when component mounts
  useEffect(() => {
    Animated.stagger(200, [
      Animated.spring(datePickerAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.spring(buttonAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
    ]).start();
  }, []);

  // Calculate age from birthday
  const calculateAge = (birthday: Date): number => {
    const today = new Date();
    const birthDate = new Date(birthday);
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    // If birthday hasn't occurred this year yet, subtract 1
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Handle date change
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setPreferNotToSay(false);
    setHasBirthdaySelected(true);
    
    // Calculate age and store as string
    const calculatedAge = calculateAge(date);
    updateData('age', calculatedAge.toString());
    
    // Store the birthday in the data for reference
    updateData('birthday', date.toISOString());
  };

  // Handle "Prefer not to say" selection
  const handlePreferNotToSay = () => {
    setPreferNotToSay(true);
    setHasBirthdaySelected(false);
    updateData('age', 'prefer_not_to_say');
    updateData('birthday', ''); // Clear birthday when prefer not to say is selected
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
          When's your birthday?
        </Text>
        
        <Text style={[
          styles.subtitle, 
          { 
            fontSize: subtitleFontSize,
            width: responsiveValues.subtitleWidth
          }
        ]}>
          We'll use this for applications that require an age range.
        </Text>

        {/* Birthday Picker Section */}
        <Animated.View
          style={[
            styles.datePickerContainer,
            { 
              marginTop: responsiveValues.datePickerMarginTop,
              maxWidth: responsiveValues.containerMaxWidth,
              transform: [
                {
                  translateY: datePickerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-30, 0],
                  }),
                },
              ],
              opacity: datePickerAnim,
            }
          ]}
        >
          <BirthdayPicker
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
            minDate={minDate}
            maxDate={maxDate}
            isSelected={hasBirthdaySelected}
          />
        </Animated.View>

        {/* Prefer Not to Say Button */}
        <Animated.View
          style={[
            styles.preferButtonContainer,
            { 
              marginTop: responsiveValues.buttonMarginTop,
              maxWidth: responsiveValues.containerMaxWidth,
              transform: [
                {
                  translateY: buttonAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
              opacity: buttonAnim,
            }
          ]}
        >
          <TouchableOpacity
            style={[
              styles.preferButton,
              { 
                paddingVertical: responsiveValues.buttonPaddingVertical,
                paddingHorizontal: responsiveValues.buttonPaddingHorizontal
              },
              preferNotToSay && styles.selectedButton
            ]}
            onPress={handlePreferNotToSay}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.preferButtonText,
              { fontSize: responsiveValues.buttonFontSize },
              preferNotToSay && styles.selectedButtonText
            ]}>
              Prefer not to say
            </Text>
          </TouchableOpacity>
        </Animated.View>
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
  datePickerContainer: {
    width: '100%',
    alignItems: 'center',
  },
  preferButtonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  preferButton: {
    width: '100%',
    borderWidth: 1,
    borderColor: PrepTalkTheme.colors.mediumGray,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.9,
  },
  selectedButton: {
    borderColor: PrepTalkTheme.colors.primary,
    borderWidth: 2,
    opacity: 1,
    backgroundColor: '#F2BD2C11', // Using your theme's primary color with transparency
  },
  preferButtonText: {
    fontFamily: 'Nunito-SemiBold',
    color: PrepTalkTheme.colors.text,
    textAlign: 'center',
  },
  selectedButtonText: {
    color: PrepTalkTheme.colors.text,
    fontFamily: 'Nunito-ExtraBold',
  },
});