// components/intro/IntroHeader.tsx

import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Platform,
  useWindowDimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PrepTalkTheme, useScreenSize, getResponsiveValue } from '@/constants/Theme';

interface StepData {
  title: string;
  titleHighlight: string;
  subtitle1: string;
  subtitle1Highlight: string;
  subtitle2: string;
  subtitle2Highlight: string;
  subtitle3: string;
  buttonText: string;
}

interface IntroHeaderProps {
  currentStep: number;
  onBackPress: () => void;
}

export default function IntroHeader({ currentStep, onBackPress }: IntroHeaderProps) {
  const { height, width } = useWindowDimensions();
  const screenSize = useScreenSize();

  // Responsive values
  const responsiveValues = {
    // Header padding
    headerPaddingTop: getResponsiveValue({
      small: 45,
      medium: 80,
      large: 70,
      xlarge: 80,
    }),
    headerPaddingBottom: getResponsiveValue({
      small: 0,
      medium: 2,
      large: 4,
      xlarge: 5,
    }),
    
    // Back button icon size
    backButtonIconSize: getResponsiveValue({
      small: 24,
      medium: 26,
      large: 30,
      xlarge: 32,
    }),
    
    // Back button padding
    backButtonPadding: getResponsiveValue({
      small: 6,
      medium: 7,
      large: 8,
      xlarge: 8,
    }),
    backButtonMarginLeft: getResponsiveValue({
      small: 6,
      medium: 7,
      large: 8,
      xlarge: 8,
    }),
    
    // Header section flex
    headerSectionFlex: getResponsiveValue({
      small: 0.3,
      medium: 0.32,
      large: 0.35,
      xlarge: 0.35,
    }),
    
    // Typography sizing
    titleFontSize: getResponsiveValue({
      small: 32,
      medium: 36,
      large: 38,
      xlarge: 40,
    }),
    subtitleFontSize: getResponsiveValue({
      small: 16,
      medium: 18,
      large: 20,
      xlarge: 20,
    }),
    
    // Spacing
    subtitlesGap: getResponsiveValue({
      small: 2,
      medium: 3,
      large: 3,
      xlarge: 3,
    }),
    subtitleRowGap: getResponsiveValue({
      small: 6,
      medium: 7,
      large: 8,
      xlarge: 8,
    }),
  };

  return (
    <>
      {/* Header with Back Button */}
      <View style={[
        styles.header, 
        {
          paddingTop: responsiveValues.headerPaddingTop,
          paddingBottom: responsiveValues.headerPaddingBottom,
        }
      ]}>
        <TouchableOpacity 
          style={[
            styles.backButton,
            {
              padding: responsiveValues.backButtonPadding,
              marginLeft: responsiveValues.backButtonMarginLeft,
            }
          ]}
          onPress={onBackPress}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="arrow-back" 
            size={responsiveValues.backButtonIconSize} 
            color={PrepTalkTheme.colors.text} 
          />
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1000,
    elevation: 1000,
  },
  backButton: {
    // Base styling - responsive values applied inline
  },
  spacer: {
    width: 44,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    ...PrepTalkTheme.typography.title,
    color: PrepTalkTheme.colors.text,
    fontFamily: 'Lexend-Bold',
    textAlign: 'center',
  },
  titleHighlight: {
    color: PrepTalkTheme.colors.primary,
  },
  headerSection: {
    flex: 0.35,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  subtitlesContainer: {
    alignItems: 'center',
    gap: 3,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  subtitle: {
    ...PrepTalkTheme.typography.headline,
    color: PrepTalkTheme.colors.text,
    fontFamily: 'Lexend-Medium',
    textAlign: 'center',
  },
  subtitleHighlight: {
    color: PrepTalkTheme.colors.accent,
    fontFamily: 'Lexend-SemiBold',
  },
});