// components/onboarding/OnboardingHeader.tsx

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
import { PrepTalkTheme } from '@/constants/Theme';

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

interface OnboardingHeaderProps {
  currentStep: number;
  onBackPress: () => void;
}

export default function OnboardingHeader({ currentStep, onBackPress }: OnboardingHeaderProps) {
  const { height } = useWindowDimensions();

  return (
    <>
      {/* Header with Back Button and Title */}
      <View style={[styles.header, {
        paddingTop: height < 700 ? 30 : 80,
        paddingBottom: height < 700 ? 0 : 5
         }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={onBackPress}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="arrow-back" 
            size={height < 700 ? 26 : 32} 
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
    zIndex: 1000, // Add this
    elevation: 1000,
  },
  backButton: {
    padding: 8,
    marginLeft: 8,
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