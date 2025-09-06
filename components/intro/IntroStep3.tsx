// components/intro/IntroStep3.tsx

import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  useWindowDimensions,
  Image,
  Pressable,
  Animated,
  Easing,
  ScrollView
} from 'react-native';
import { Asset } from 'expo-asset';
import Rive from 'rive-react-native';
import { PrepTalkTheme, useScreenSize, getResponsiveValue } from '@/constants/Theme';
import AIConversationWave from '@/components/AIConversationWave';

interface IntroStep3Props {
  isActive?: boolean;
}

export default function IntroStep3({ isActive = true }: IntroStep3Props) {
  const { height, width } = useWindowDimensions();
  const screenSize = useScreenSize();
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [aiAudioLevel, setAiAudioLevel] = useState(0);
  const [userAudioLevel, setUserAudioLevel] = useState(0);
  const [shouldShowRive, setShouldShowRive] = useState(false);
  const [shouldShowWave, setShouldShowWave] = useState(false);
  const riveOpacity = useRef(new Animated.Value(0)).current;
  const waveOpacity = useRef(new Animated.Value(0)).current;
  const [shouldShowTypewriter, setShouldShowTypewriter] = useState(false);
  const [typewriterText, setTypewriterText] = useState('');
  const typewriterOpacity = useRef(new Animated.Value(0)).current;
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const riveAsset = Asset.fromModule(require('@/assets/animations/ai-intro-line.riv'));
  
  const messages = [
    "👋 Hi there! I'll be your AI coach. \n\n I can help you set up success plans to test your skills and knolwedge for a specific role.",
    "And I can help you conduct custom realistic interviews based on the actual job you want to practice for, analyze how you did and where you can improve! \n\n Ready to get started? 🚀"
  ];

  // Responsive values
  const responsiveValues = {
    // Animation container sizing
    animationWidth: getResponsiveValue({
      small: 350,
      medium: 400,
      large: 450,
      xlarge: 500,
    }),
    animationHeight: getResponsiveValue({
      small: 350,
      medium: 400,
      large: 420,
      xlarge: 450,
    }),
    
    // Positioning
    animationTopOffset: getResponsiveValue({
      small: -70,
      medium: -25,
      large: -30,
      xlarge: -30,
    }),
    waveBottomOffset: getResponsiveValue({
      small: 15,
      medium: 18,
      large: 20,
      xlarge: 24,
    }),
    mainContentPaddingTop: getResponsiveValue({
      small: 100,
      medium: 160,
      large: 160,
      xlarge: 200,
    }),
    
    // Wave sizing
    waveWidth: getResponsiveValue({
      small: 180,
      medium: 200,
      large: 250,
      xlarge: 300,
    }),
    waveHeight: getResponsiveValue({
      small: 90,
      medium: 100,
      large: 150,
      xlarge: 200,
    }),
    
    // Typography
    typewriterFontSize: getResponsiveValue({
      small: 20,
      medium: 24,
      large: 26,
      xlarge: 28,
    }),
    typewriterLineHeight: getResponsiveValue({
      small: 28,
      medium: 32,
      large: 34,
      xlarge: 36,
    }),
    
    // Container sizing
    typewriterMaxHeight: getResponsiveValue({
      small: 350,
      medium: 380,
      large: 400,
      xlarge: 420,
    }),
  };

  const pauseBetweenMessages = 2000; // 2 seconds pause between messages
  const typewriterSpeed = 20; // milliseconds per character
  const startTypewriterDelay = 3000; // 3 seconds after Rive starts

  // Watch for isActive changes and show/animate Rive
  useEffect(() => {
    if (isActive && !shouldShowRive) {
      console.log('Step 3 became active - showing and fading in Rive animation');
      
      setShouldShowRive(true);
      
      setTimeout(() => {
        Animated.timing(riveOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start();
      }, 300);
      
    } else if (!isActive && shouldShowRive) {
      Animated.timing(riveOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShouldShowRive(false);
        setShouldShowWave(false);
        waveOpacity.setValue(0);
        setShouldShowTypewriter(false);
        typewriterOpacity.setValue(0);
        setTypewriterText('');
        setCurrentMessageIndex(0);
        setIsAISpeaking(false);
        setAiAudioLevel(0);
      });
    }
  }, [isActive, shouldShowRive, riveOpacity, waveOpacity]);

  // Start wave animation after Rive has been showing
  useEffect(() => {
    if (shouldShowRive && !shouldShowWave) {
      console.log('Starting wave fade-in timer');
      
      const timer = setTimeout(() => {
        fadeInWave();
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [shouldShowRive, shouldShowWave]);

  useEffect(() => {
    if (shouldShowRive && !shouldShowTypewriter) {
      console.log('Starting typewriter timer');
      
      const timer = setTimeout(() => {
        startTypewriterEffect();
      }, startTypewriterDelay);
      
      return () => clearTimeout(timer);
    }
  }, [shouldShowRive, shouldShowTypewriter]);

  const fadeInWave = () => {
    console.log('Fading in AIConversationWave with bounce');
    setShouldShowWave(true);
    
    setTimeout(() => {
      Animated.timing(waveOpacity, {
        toValue: 1,
        duration: 2000,
        easing: Easing.elastic(1.2),
        useNativeDriver: true,
      }).start();
    }, 500);
  };

  const startTypewriterEffect = () => {
    console.log('Starting typewriter effect');
    setShouldShowTypewriter(true);
    
    Animated.timing(typewriterOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setIsAISpeaking(true);
    
    const audioLevelInterval = setInterval(() => {
      setAiAudioLevel(Math.random() * 0.8 + 0.2);
    }, 150);
    
    typeMessage(0);
  };

  const typeMessage = (messageIndex) => {
    if (messageIndex >= messages.length) {
      console.log('All messages completed');
      setTimeout(() => {
        setIsAISpeaking(false);
        setAiAudioLevel(0);
        console.log('AI speaking stopped after delay');
      }, 3000);
      return;
    }

    const currentMessage = messages[messageIndex];
    console.log(`Typing message ${messageIndex + 1}: "${currentMessage}"`);
    
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= currentMessage.length) {
        setTypewriterText(currentMessage.substring(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        console.log(`Message ${messageIndex + 1} completed`);
        
        if (messageIndex < messages.length - 1) {
          setTimeout(() => {
            eraseMessage(messageIndex);
          }, pauseBetweenMessages);
        } else {
          setTimeout(() => {
            setIsAISpeaking(false);
            setAiAudioLevel(0);
            console.log('AI speaking stopped after final message delay');
          }, 2000);
        }
      }
    }, typewriterSpeed);
  };

  const eraseMessage = (messageIndex) => {
    console.log(`Erasing message ${messageIndex + 1}`);
    
    setTypewriterText('');
    
    const nextMessageIndex = messageIndex + 1;
    setCurrentMessageIndex(nextMessageIndex);
    
    setTimeout(() => {
      typeMessage(nextMessageIndex);
    }, 300);
  };

  return (
    <View style={[styles.container, { width, height }]}>
      <View style={styles.content}>
        {/* Animation Container with both Rive and Wave */}
        <View style={[
          styles.animationContainer,
          {
            width: responsiveValues.animationWidth,
            height: responsiveValues.animationHeight,
            position: 'absolute',
            top: responsiveValues.animationTopOffset,
            alignSelf: 'center',
            zIndex: 0,
          }
        ]}>
          {/* AIConversationWave */}
          {shouldShowWave && (
            <Animated.View 
              style={[
                styles.waveContainer,
                {
                  opacity: waveOpacity,
                  bottom: responsiveValues.waveBottomOffset,
                }
              ]}
            >
              <AIConversationWave
                isAISpeaking={isAISpeaking}
                isUserSpeaking={isUserSpeaking}
                userAudioLevel={userAudioLevel}
                aiAudioLevel={aiAudioLevel}
                width={responsiveValues.waveWidth}
                height={responsiveValues.waveHeight}
              />
            </Animated.View>
          )}
          
          {/* Rive Animation */}
          {shouldShowRive && (
            <Animated.View 
              style={[
                styles.aiWaveIntro,
                {
                  opacity: riveOpacity,
                }
              ]}
            >
              <Rive
                url={riveAsset.localUri || riveAsset.uri} 
                style={{ width: '100%', height: '100%' }}
                autoplay={true}
              />
            </Animated.View>
          )}
        </View>

        {/* Main content - typewriter */}
        <View style={[
          styles.mainContentWrapper, 
          { paddingTop: responsiveValues.mainContentPaddingTop }
        ]}>
          {/* Typewriter Text Container */}
          {shouldShowTypewriter && (
            <Animated.View 
              style={[
                styles.typewriterContainer,
                {
                  opacity: typewriterOpacity,
                  maxHeight: responsiveValues.typewriterMaxHeight,
                }
              ]}
            >
              <ScrollView 
                style={styles.typewriterScrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.typewriterScrollContent}
                alwaysBounceVertical={false}
              >
                <Text style={[
                  styles.typewriterText,
                  {
                    fontSize: responsiveValues.typewriterFontSize,
                    lineHeight: responsiveValues.typewriterLineHeight,
                  }
                ]}>
                  {typewriterText}
                </Text>
              </ScrollView>
            </Animated.View>
          )}
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
    alignItems: 'center',
    margin: 0,
    padding: 0,
    position: 'relative',
  },
  waveContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  aiWaveIntro: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
  },
  mainContentWrapper: {
    flex: 1,
    width: '100%',
    paddingBottom: 40,
    zIndex: 2,
  },
  buttonRowWrapper: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 3,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: 0,
  },
  typewriterContainer: {
    width: '90%',
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  typewriterScrollView: {
    maxHeight: '100%',
  },
  typewriterScrollContent: {
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    flexGrow: 1,
  },
  typewriterText: {
    fontFamily: 'Nunito-ExtraBold',
    color: PrepTalkTheme.colors.text,
    opacity: 0.7,
    textAlign: 'center',
    textAlignVertical: 'top',
  },
  callToAction: {
    ...PrepTalkTheme.typography.body,
    color: PrepTalkTheme.colors.mediumGray,
    fontFamily: 'Nunito-Medium',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: PrepTalkTheme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginVertical: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
  },
});