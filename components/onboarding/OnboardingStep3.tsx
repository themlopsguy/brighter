// components/onboarding/OnboardingStep3.tsx

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  useWindowDimensions,
  Image,
  Pressable
} from 'react-native';
import Rive from 'rive-react-native';
import { PrepTalkTheme } from '@/constants/Theme';
import AIConversationWave from '@/components/AIConversationWave';

interface OnboardingStep3Props {
  isActive?: boolean;
}

export default function OnboardingStep3({ isActive = true }: OnboardingStep3Props) {
  const { height, width } = useWindowDimensions();
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [aiAudioLevel, setAiAudioLevel] = useState(0);
  const [userAudioLevel, setUserAudioLevel] = useState(0);

    const simulateAISpeaking = () => {
    setIsAISpeaking(true);
    
    // Simulate audio levels
    const interval = setInterval(() => {
      setAiAudioLevel(Math.random());
    }, 100);

    setTimeout(() => {
      setIsAISpeaking(false);
      clearInterval(interval);
      setAiAudioLevel(0);
    }, 3000);
  };

    const simulateUserSpeaking = () => {
    setIsUserSpeaking(true);
    
    // Simulate audio levels
    const interval = setInterval(() => {
      setUserAudioLevel(Math.random());
    }, 100);

    setTimeout(() => {
      setIsUserSpeaking(false);
      clearInterval(interval);
      setUserAudioLevel(0);
    }, 3000);
  };

  return (
    <View style={[styles.container, { width, height }]}>
      <View style={styles.content}>

        <View style={[
          styles.animationContainer,
          {
            width: height < 700 ? 200 : 420,
            height: height < 700 ? 200 : 420,
            marginBottom: height < 700 ? 20 : 0,
            top: height < 700 ? 50 : -30
          }
        ]}>
        <Rive
        source={require('@/assets/animations/aiwaveintro.riv')}
        style={styles.aiWaveIntro}
        autoplay={isActive}
        />
        </View>
        {/* Placeholder content for Step 3 */}
        <View style={styles.centerContent}>
            <AIConversationWave
            isAISpeaking={isAISpeaking}
            isUserSpeaking={isUserSpeaking}
            userAudioLevel={userAudioLevel}
            aiAudioLevel={aiAudioLevel}
            width={350}
            height={180}
            />

    <Pressable style={styles.button} onPress={simulateAISpeaking}>
        <Text style={styles.buttonText}>Test AI Speaking</Text>
      </Pressable>

    <Pressable style={styles.button} onPress={simulateUserSpeaking}>
        <Text style={styles.buttonText}>Test User Speaking</Text>
      </Pressable>
          <Image 
            source={require('@/assets/images/logo.png')}
            style={[
              styles.logo,
              {
                width: height < 700 ? 100 : 140,
                height: height < 700 ? 50 : 70,
                marginBottom: height < 700 ? 30 : 50,
              }
            ]}
            resizeMode="contain"
          />
          
          <Text style={[
            styles.title,
            { fontSize: height < 700 ? 28 : 36 }
          ]}>
            Ready to start?
          </Text>
          
          <View style={styles.subtitleContainer}>
            <Text style={[
              styles.subtitle,
              { fontSize: height < 700 ? 18 : 22 }
            ]}>
              Join <Text style={styles.highlight}>thousands</Text> of professionals
            </Text>
            <Text style={[
              styles.subtitle,
              { fontSize: height < 700 ? 18 : 22 }
            ]}>
              finding their <Text style={styles.highlight}>dream jobs</Text>
            </Text>
          </View>
          
          <Text style={[
            styles.callToAction,
            { 
              fontSize: height < 700 ? 16 : 18,
              marginTop: height < 700 ? 20 : 30 
            }
          ]}>
            Let's get started!
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: PrepTalkTheme.metrics.padding,
    position: 'relative',
  },
  animationContainer: {
    justifyContent: 'center',
    //alignItems: 'center',
    // Remove any margins/padding that affect layout
    margin: 0,
    padding: 0,
    position: 'absolute',
  },
  aiWaveIntro: {
    zIndex: 1,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  logo: {
    opacity: 0.9,
  },
  title: {
    ...PrepTalkTheme.typography.title,
    color: PrepTalkTheme.colors.text,
    fontFamily: 'Lexend-Bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitleContainer: {
    alignItems: 'center',
    gap: 8,
  },
  subtitle: {
    ...PrepTalkTheme.typography.headline,
    color: PrepTalkTheme.colors.text,
    fontFamily: 'Lexend-Medium',
    textAlign: 'center',
    lineHeight: 28,
  },
  highlight: {
    color: PrepTalkTheme.colors.primary,
    fontFamily: 'Lexend-SemiBold',
  },
  callToAction: {
    ...PrepTalkTheme.typography.body,
    color: PrepTalkTheme.colors.mediumGray,
    fontFamily: 'Nunito-Medium',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});