// components/CustomAlert.tsx

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  useWindowDimensions,
} from 'react-native';
import { 
  PrepTalkTheme, 
  useResponsiveFontSize,
  getResponsiveValue 
} from '@/constants/Theme';

const { width: screenWidth } = Dimensions.get('window');

export interface CustomAlertProps {
  isVisible: boolean;
  title: string;
  message: string;
  primaryButtonTitle?: string;
  primaryButtonAction: () => void;
  secondaryButtonTitle?: string;
  secondaryButtonAction?: () => void;
  onBackdropPress?: () => void; // Optional backdrop dismiss
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  isVisible,
  title,
  message,
  primaryButtonTitle = 'Continue',
  primaryButtonAction,
  secondaryButtonTitle,
  secondaryButtonAction,
  onBackdropPress,
}) => {
  const { width } = useWindowDimensions();
  
  // Responsive values
  const responsiveValues = {
    containerWidth: getResponsiveValue({
      small: width * 0.7,
      medium: width * 0.7,
      large: width * 0.7,
      xlarge: width * 0.7
    }),
    titleFontSize: getResponsiveValue({
      small: 16,
      medium: 18,
      large: 20,
      xlarge: 22
    }),
    bodyFontSize: getResponsiveValue({
      small: 14,
      medium: 16,
      large: 18,
      xlarge: 20
    }),
    buttonFontSize: getResponsiveValue({
      small: 14,
      medium: 16,
      large: 18,
      xlarge: 20
    }),
    titlePaddingTop: getResponsiveValue({
      small: 16,
      medium: 20,
      large: 22,
      xlarge: 24
    }),
    titlePaddingBottom: getResponsiveValue({
      small: 6,
      medium: 8,
      large: 8,
      xlarge: 10
    }),
    messagePaddingHorizontal: getResponsiveValue({
      small: 12,
      medium: 16,
      large: 18,
      xlarge: 20
    }),
    messagePaddingTop: getResponsiveValue({
      small: 12,
      medium: 16,
      large: 18,
      xlarge: 20
    }),
    messagePaddingBottom: getResponsiveValue({
      small: 16,
      medium: 20,
      large: 22,
      xlarge: 24
    }),
    singleButtonPaddingVertical: getResponsiveValue({
      small: 20,
      medium: 25,
      large: 28,
      xlarge: 30
    }),
    primaryButtonPaddingVertical: getResponsiveValue({
      small: 12,
      medium: 14,
      large: 16,
      xlarge: 18
    }),
    secondaryButtonPaddingVertical: getResponsiveValue({
      small: 12,
      medium: 14,
      large: 16,
      xlarge: 18
    }),
    buttonContainerPaddingBottom: getResponsiveValue({
      small: 12,
      medium: 16,
      large: 18,
      xlarge: 20
    }),
    buttonLayoutPaddingHorizontal: getResponsiveValue({
      small: 40,
      medium: 50,
      large: 55,
      xlarge: 60
    }),
    buttonLayoutGap: getResponsiveValue({
      small: 5,
      medium: 5,
      large: 5,
      xlarge: 5
    }),
    dividerMarginHorizontal: getResponsiveValue({
      small: 80,
      medium: 100,
      large: 110,
      xlarge: 120
    }),
    borderRadius: getResponsiveValue({
      small: 12,
      medium: 14,
      large: 16,
      xlarge: 18
    }),
    buttonBorderRadius: getResponsiveValue({
      small: 40,
      medium: 50,
      large: 55,
      xlarge: 60
    }),
    shadowRadius: getResponsiveValue({
      small: 8,
      medium: 10,
      large: 12,
      xlarge: 14
    }),
  };
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  
  // Animation functions
  const showAlert = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  const hideAlert = (callback?: () => void) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.85,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (callback) callback();
    });
  };
  
  // Handle animations when visibility changes
  useEffect(() => {
    if (isVisible) {
      showAlert();
    } else {
      // Reset animation values when hidden
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
    }
  }, [isVisible]);
  
  // Handle primary button press
  const handlePrimaryPress = () => {
    hideAlert(() => {
      primaryButtonAction();
    });
  };
  
  // Handle secondary button press
  const handleSecondaryPress = () => {
    if (secondaryButtonAction) {
      hideAlert(() => {
        secondaryButtonAction();
      });
    }
  };
  
  // Handle backdrop press
  const handleBackdropPress = () => {
    if (onBackdropPress) {
      hideAlert(() => {
        onBackdropPress();
      });
    }
  };
  
  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="none"
      statusBarTranslucent={true}
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.container,
                {
                  width: responsiveValues.containerWidth,
                  borderRadius: responsiveValues.borderRadius,
                  shadowRadius: responsiveValues.shadowRadius,
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              {/* Title */}
              <Text 
                style={[
                  styles.title,
                  {
                    fontSize: responsiveValues.titleFontSize,
                    paddingTop: responsiveValues.titlePaddingTop,
                    paddingBottom: responsiveValues.titlePaddingBottom,
                  }
                ]}
              >
                {title}
              </Text>
              
              {/* Divider */}
              <View 
                style={[
                  styles.divider,
                  { marginHorizontal: responsiveValues.dividerMarginHorizontal }
                ]} 
              />
              
              {/* Message */}
              <Text 
                style={[
                  styles.message,
                  {
                    fontSize: responsiveValues.bodyFontSize,
                    paddingHorizontal: responsiveValues.messagePaddingHorizontal,
                    paddingTop: responsiveValues.messagePaddingTop,
                    paddingBottom: responsiveValues.messagePaddingBottom,
                  }
                ]}
              >
                {message}
              </Text>
              
              {/* Buttons */}
              <View 
                style={[
                  styles.buttonContainer,
                  { paddingBottom: responsiveValues.buttonContainerPaddingBottom }
                ]}
              >
                {secondaryButtonTitle && secondaryButtonAction ? (
                  // Two button layout
                  <View 
                    style={[
                      styles.twoButtonLayout,
                      {
                        paddingHorizontal: responsiveValues.buttonLayoutPaddingHorizontal,
                        gap: responsiveValues.buttonLayoutGap,
                      }
                    ]}
                  >
                    {/* Primary Button */}
                    <TouchableOpacity
                      style={[
                        styles.primaryButton,
                        {
                          paddingVertical: responsiveValues.primaryButtonPaddingVertical,
                          borderRadius: responsiveValues.buttonBorderRadius,
                        }
                      ]}
                      onPress={handlePrimaryPress}
                      activeOpacity={0.7}
                    >
                      <Text 
                        style={[
                          styles.buttonText,
                          { fontSize: responsiveValues.buttonFontSize }
                        ]}
                      >
                        {primaryButtonTitle}
                      </Text>
                    </TouchableOpacity>
                    
                    {/* Secondary Button */}
                    <TouchableOpacity
                      style={[
                        styles.secondaryButton,
                        { paddingVertical: responsiveValues.secondaryButtonPaddingVertical }
                      ]}
                      onPress={handleSecondaryPress}
                      activeOpacity={0.7}
                    >
                      <Text 
                        style={[
                          styles.buttonText,
                          { fontSize: responsiveValues.buttonFontSize }
                        ]}
                      >
                        {secondaryButtonTitle}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  // Single button layout
                  <TouchableOpacity
                    style={[
                      styles.singleButton,
                      {
                        marginHorizontal: responsiveValues.buttonLayoutPaddingHorizontal,
                        paddingVertical: responsiveValues.singleButtonPaddingVertical,
                        borderRadius: responsiveValues.buttonBorderRadius,
                      }
                    ]}
                    onPress={handlePrimaryPress}
                    activeOpacity={0.7}
                  >
                    <Text 
                      style={[
                        styles.buttonText,
                        { fontSize: responsiveValues.buttonFontSize }
                      ]}
                    >
                      {primaryButtonTitle}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    backgroundColor: PrepTalkTheme.colors.cardBackground || '#F2F2F7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    elevation: 10,
  },
  title: {
    fontFamily: 'Lexend-SemiBold',
    color: PrepTalkTheme.colors.text || '#1C1C1E',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  divider: {
    height: 1,
    backgroundColor: PrepTalkTheme.colors.border || '#C6C6C8',
  },
  message: {
    fontFamily: 'Nunito-Regular',
    color: PrepTalkTheme.colors.mediumGray || '#3C3C43',
    textAlign: 'center',
    lineHeight: 25,
  },
  buttonContainer: {
    // Responsive padding applied inline
  },
  // Single button styles
  singleButton: {
    borderWidth: 2,
    borderColor: PrepTalkTheme.colors.border || '#C6C6C8',
    alignItems: 'center',
  },
  // Two button styles
  twoButtonLayout: {
    // Responsive padding and gap applied inline
  },
  primaryButton: {
    borderWidth: 2,
    borderColor: PrepTalkTheme.colors.border || '#C6C6C8',
    alignItems: 'center',
  },
  secondaryButton: {
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'Nunito-SemiBold',
    color: PrepTalkTheme.colors.text || '#1C1C1E',
  },
});

export default CustomAlert;