// components/BirthdayPicker.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { 
  PrepTalkTheme, 
  useResponsiveFontSize, 
  useResponsiveSpacing, 
  getResponsiveValue 
} from '@/constants/Theme';

interface BirthdayPickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  isSelected?: boolean;
}

export default function BirthdayPicker({
  selectedDate,
  onDateChange,
  minDate,
  maxDate,
  isSelected = false,
}: BirthdayPickerProps) {
  const { width } = useWindowDimensions();
  
  // Use responsive utilities
  const bodyFontSize = useResponsiveFontSize('body');
  const smallSpacing = useResponsiveSpacing('small');
  
  // Custom responsive values for this specific component
  const responsiveValues = {
    buttonFontSize: getResponsiveValue({
      small: 14,
      medium: 15,
      large: 16,
      xlarge: 17
    }),
    buttonPaddingVertical: getResponsiveValue({
      small: 12,
      medium: 14,
      large: 16,
      xlarge: 18
    }),
    buttonPaddingHorizontal: getResponsiveValue({
      small: 20,
      medium: 22,
      large: 24,
      xlarge: 26
    }),
    chevronIconSize: getResponsiveValue({
      small: 16,
      medium: 17,
      large: 18,
      xlarge: 19
    }),
    iosPickerHeight: getResponsiveValue({
      small: 150,
      medium: 170,
      large: 200,
      xlarge: 210
    }),
    iosButtonFontSize: getResponsiveValue({
      small: 14,
      medium: 15,
      large: 16,
      xlarge: 17
    }),
    iosButtonPadding: getResponsiveValue({
      small: 10,
      medium: 11,
      large: 12,
      xlarge: 13
    }),
    pickerContainerPadding: getResponsiveValue({
      small: 8,
      medium: 9,
      large: 10,
      xlarge: 12
    }),
    pickerMarginTop: getResponsiveValue({
      small: 12,
      medium: 14,
      large: 16,
      xlarge: 18
    })
  };
  
  // iOS specific state
  const [show, setShow] = useState(false);
  const [mode, setMode] = useState<'date' | 'time'>('date');
  const [tempDate, setTempDate] = useState(selectedDate); // Temporary date for iOS

  // Handle date change for both platforms
  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      // Android: immediately apply the change
      if (date) {
        onDateChange(date);
      }
    } else {
      // iOS: just update the temporary date, don't close picker
      if (date) {
        setTempDate(date);
      }
    }
  };

  // Handle iOS Done button
  const handleIOSDone = () => {
    setShow(false);
    onDateChange(tempDate);
  };

  // Handle iOS Cancel button
  const handleIOSCancel = () => {
    setShow(false);
    setTempDate(selectedDate); // Reset to original date
  };

  // Android date picker
  const showAndroidDatePicker = () => {
    DateTimePickerAndroid.open({
      value: selectedDate,
      onChange: handleDateChange,
      mode: 'date',
      minimumDate: minDate,
      maximumDate: maxDate
    });
  };

  // iOS date picker
  const showIOSDatePicker = () => {
    setTempDate(selectedDate); // Initialize temp date with current selection
    setMode('date');
    setShow(true);
  };

  if (Platform.OS === 'android') {
    return (
      <View style={styles.androidContainer}>
        <TouchableOpacity
          style={[
            styles.androidButton,
            { 
              paddingVertical: responsiveValues.buttonPaddingVertical,
              paddingHorizontal: responsiveValues.buttonPaddingHorizontal
            },
            isSelected && styles.selectedButton
          ]}
          onPress={showAndroidDatePicker}
          activeOpacity={0.7}
        >
          <View style={styles.buttonContent}>
            <Text style={[
              styles.androidButtonText,
              { fontSize: responsiveValues.buttonFontSize },
              isSelected && styles.selectedButtonText
            ]}>
              {isSelected ? selectedDate.toLocaleDateString() : 'Select Birthday'}
            </Text>
            {!isSelected && (
              <Ionicons 
                name="chevron-down" 
                size={responsiveValues.chevronIconSize} 
                color={PrepTalkTheme.colors.mediumGray}
                style={styles.chevronIcon}
              />
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  // iOS Implementation
  return (
    <View style={styles.iosContainer}>
      <TouchableOpacity
        style={[
          styles.iosButton,
          { 
            paddingVertical: responsiveValues.buttonPaddingVertical,
            paddingHorizontal: responsiveValues.buttonPaddingHorizontal
          },
          isSelected && styles.selectedButton
        ]}
        onPress={showIOSDatePicker}
        activeOpacity={0.7}
      >
        <View style={styles.buttonContent}>
          <Text style={[
            styles.iosButtonText,
            { fontSize: responsiveValues.buttonFontSize },
            isSelected && styles.selectedButtonText
          ]}>
            {isSelected ? selectedDate.toLocaleDateString() : 'Select Birthday'}
          </Text>
          {!isSelected && (
            <Ionicons 
              name="chevron-down" 
              size={responsiveValues.chevronIconSize} 
              color={PrepTalkTheme.colors.mediumGray}
              style={styles.chevronIcon}
            />
          )}
        </View>
      </TouchableOpacity>

      {show && (
        <View style={[
          styles.iosPickerContainer,
          { 
            marginTop: responsiveValues.pickerMarginTop,
            padding: responsiveValues.pickerContainerPadding
          }
        ]}>
          <DateTimePicker
            testID="dateTimePicker"
            value={tempDate}
            mode={mode}
            display="spinner"
            onChange={handleDateChange}
            minimumDate={minDate}
            maximumDate={maxDate}
            style={[
              styles.iosPicker,
              { height: responsiveValues.iosPickerHeight }
            ]}
            themeVariant="light"
          />
          
          {/* Done and Cancel Buttons */}
          <View style={[
            styles.iosButtonContainer,
            { marginTop: smallSpacing }
          ]}>
            <TouchableOpacity
              style={[
                styles.iosCancelButton,
                { paddingVertical: responsiveValues.iosButtonPadding }
              ]}
              onPress={handleIOSCancel}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.iosCancelButtonText,
                { fontSize: responsiveValues.iosButtonFontSize }
              ]}>
                Cancel
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.iosDoneButton,
                { paddingVertical: responsiveValues.iosButtonPadding }
              ]}
              onPress={handleIOSDone}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.iosDoneButtonText,
                { fontSize: responsiveValues.iosButtonFontSize }
              ]}>
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Shared Styles
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  chevronIcon: {
    opacity: 0.7,
  },

  // Android Styles
  androidContainer: {
    width: '100%',
    alignItems: 'center',
  },
  androidButton: {
    width: '100%',
    borderWidth: 1,
    borderColor: PrepTalkTheme.colors.mediumGray,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.9,
  },
  androidButtonText: {
    fontFamily: 'Nunito-SemiBold',
    color: PrepTalkTheme.colors.mediumGray,
    textAlign: 'center',
  },

  // iOS Styles
  iosContainer: {
    width: '100%',
    alignItems: 'center',
  },
  iosButton: {
    width: '100%',
    borderWidth: 1,
    borderColor: PrepTalkTheme.colors.mediumGray,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.9,
  },
  iosButtonText: {
    fontFamily: 'Nunito-SemiBold',
    color: PrepTalkTheme.colors.mediumGray,
    textAlign: 'center',
  },
  iosPickerContainer: {
  },
  iosPicker: {
    width: '100%',
  },
  iosButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  iosCancelButton: {
    flex: 1,
    paddingHorizontal: 24,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: PrepTalkTheme.colors.mediumGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iosCancelButtonText: {
    fontFamily: 'Nunito-SemiBold',
    color: PrepTalkTheme.colors.mediumGray,
  },
  iosDoneButton: {
    flex: 1,
    paddingHorizontal: 24,
    borderRadius: 25,
    backgroundColor: PrepTalkTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iosDoneButtonText: {
    fontFamily: 'Nunito-Bold',
    color: '#FFFFFF',
  },

  // Shared Selected Styles
  selectedButton: {
    borderColor: PrepTalkTheme.colors.primary,
    borderWidth: 2,
    opacity: 1,
    backgroundColor: '#F2BD2C11', // Using your theme's primary color with transparency
  },
  selectedButtonText: {
    color: PrepTalkTheme.colors.text,
    fontFamily: 'Nunito-ExtraBold',
  },
});