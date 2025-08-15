// components/intro/IntroStep2.tsx

import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Image,
  useWindowDimensions,
  Platform
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withSpring,
  Easing,
  runOnJS,
  cancelAnimation
} from 'react-native-reanimated';
import { VideoView, useVideoPlayer } from 'expo-video';
import { PrepTalkTheme, useScreenSize, getResponsiveValue } from '@/constants/Theme';

interface IntroStep2Props {
  isActive?: boolean;
  onSwipeComplete?: () => void;
}

export default function IntroStep2({ isActive = true, onSwipeComplete }: IntroStep2Props) {
  const { height, width } = useWindowDimensions();
  const screenSize = useScreenSize();
  
  // Shared values for animations
  const tiltAnim = useSharedValue(0);
  const handOpacity = useSharedValue(0);
  const handPosition = useSharedValue(0);
  const handRotation = useSharedValue(0);
  const leftTiltAnim = useSharedValue(0);
  const leftHandOpacity = useSharedValue(0);
  const leftHandPosition = useSharedValue(0);
  const leftHandRotation = useSharedValue(0);
  const translateX = useSharedValue(0);
  const secondTranslateX = useSharedValue(0);
  
  // State management
  const [hasStartedRightSwipe, setHasStartedRightSwipe] = useState(false);
  const [hasStartedLeftSwipe, setHasStartedLeftSwipe] = useState(false);
  const [rightSwipeCompleted, setRightSwipeCompleted] = useState(false);
  const [leftSwipeCompleted, setLeftSwipeCompleted] = useState(false);
  
  // Additional animation values
  const appliedOpacity = useSharedValue(0);
  const appliedTranslateX = useSharedValue(0);
  const secondCardScale = useSharedValue(0.9);
  const finalCardScale = useSharedValue(0.8);

  // Responsive values
  const responsiveValues = {
    // Card dimensions
    cardWidth: getResponsiveValue({
      small: width - 140,
      medium: width - 138,
      large: width - 135,
      xlarge: width - 130,
    }),
    cardHeight: getResponsiveValue({
      small: height - 215,
      medium: height - 100,
      large: height,
      xlarge: height + 50,
    }),
    cardMarginBottom: getResponsiveValue({
      small: 100,
      medium: 138,
      large: 175,
      xlarge: 200,
    }),
    
    // Hand dimensions
    handSize: getResponsiveValue({
      small: 75,
      medium: 85,
      large: 100,
      xlarge: 115,
    }),
    handMarginBottom: getResponsiveValue({
      small: 100,
      medium: 100,
      large: 100,
      xlarge: 100,
    }),
    
    // Glow dimensions
    glowWidth: getResponsiveValue({
      small: width - 200,
      medium: width - 198,
      large: width - 195,
      xlarge: width - 190,
    }),
    glowHeight: getResponsiveValue({
      small: height - 495,
      medium: height - 500,
      large: height - 550,
      xlarge: height - 600,
    }),
    glowMarginBottom: getResponsiveValue({
      small: 100,
      medium: 138,
      large: 175,
      xlarge: 200,
    }),
    
    // Android specific glow
    androidGlowWidth: getResponsiveValue({
      small: width - 185,
      medium: width - 190,
      large: width - 195,
      xlarge: width - 200,
    }),
    androidGlowHeight: getResponsiveValue({
      small: height - 330,
      medium: height - 400,
      large: height - 550,
      xlarge: height - 600,
    }),
    
    // Overlay dimensions
    overlayWidth: getResponsiveValue({
      small: width - 240,
      medium: width - 248,
      large: width - 255,
      xlarge: width - 260,
    }),
    overlayTranslateY: getResponsiveValue({
      small: -160,
      medium: -195,
      large: -230,
      xlarge: -265,
    }),
    
    // Video dimensions
    videoWidth: getResponsiveValue({
      small: width - 160,
      medium: width - 163,
      large: width - 166,
      xlarge: width - 170,
    }),
    videoHeight: getResponsiveValue({
      small: height - 640,
      medium: height - 650,
      large: height - 710,
      xlarge: height - 750,
    }),
    videoMarginBottom: getResponsiveValue({
      small: 135,
      medium: 180,
      large: 225,
      xlarge: 270,
    }),
    
    // Android video height adjustment
    androidVideoHeight: getResponsiveValue({
      small: height - 460,
      medium: height - 585,
      large: height - 710,
      xlarge: height - 750,
    }),
    
    // Border radius
    borderRadius: getResponsiveValue({
      small: 12,
      medium: 14,
      large: 16,
      xlarge: 18,
    }),
  };

  const player = useVideoPlayer(require('@/assets/videos/brighter-onboard.mp4'), player => {
    player.loop = true;
    player.muted = true;
  });

  const createTiltAnimation = (tiltValue: any, direction: 'left' | 'right') => {
    'worklet';
    
    const multiplier = direction === 'left' ? 1 : -1;
    tiltValue.value = 0;
    
    tiltValue.value = withDelay(
      300,
      withSequence(
        withTiming(multiplier, { duration: 400, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 600, easing: Easing.elastic(1.2) })
      )
    );
  };

  const createHandAnimation = (
    opacityValue: any, 
    positionValue: any, 
    rotationValue: any,
    direction: 'left' | 'right',
    screenWidth: number
  ) => {
    'worklet';
    
    const positionTarget = direction === 'right' ? (screenWidth * 0.3) : -(screenWidth * 0.3);
    const rotationTarget = direction === 'right' ? 25 : -25;
    
    opacityValue.value = 0;
    positionValue.value = 0;
    rotationValue.value = 0;

    opacityValue.value = withSequence(
      withTiming(1, { duration: 300 }),
      withDelay(900, withTiming(0, { duration: 300 }))
    );
    
    positionValue.value = withDelay(
      300,
      withTiming(positionTarget, { duration: 1200, easing: Easing.out(Easing.quad) })
    );
    
    rotationValue.value = withDelay(
      300,
      withTiming(rotationTarget, { duration: 1200, easing: Easing.out(Easing.quad) })
    );
  };

  // Animated styles
  const createHandAnimatedStyle = (opacityValue: any, positionValue: any, rotationValue: any) => {
    return useAnimatedStyle(() => ({
      opacity: opacityValue.value,
      transform: [
        { translateX: positionValue.value },
        { rotate: `${rotationValue.value}deg` },
      ],
    }));
  };

  const createFirstCardAnimatedStyle = (tiltValue: any, gestureTranslateX: any) => {
    return useAnimatedStyle(() => {
      const swipeRotation = Math.min(gestureTranslateX.value * 0.1, 10);
      
      return {
        transform: [
          { rotate: `${(tiltValue.value * -5) + swipeRotation}deg` },
          { translateX: (tiltValue.value * -30) + gestureTranslateX.value },
        ],
      };
    });
  };

  const createSecondCardAnimatedStyle = (scaleValue: any, tiltValue: any, gestureTranslateX: any) => {
    return useAnimatedStyle(() => {
      const swipeRotation = Math.max(gestureTranslateX.value * 0.1, -10);
      
      return {
        transform: [
          { scale: scaleValue.value },
          { rotate: `${(tiltValue.value * -5) + swipeRotation}deg` },
          { translateX: (tiltValue.value * -30) + gestureTranslateX.value },
        ],
      };
    });
  };

  const createFinalCardAnimatedStyle = (scaleValue: any) => {
    return useAnimatedStyle(() => ({
      transform: [{ scale: scaleValue.value }],
    }));
  };

  // Create all animated styles
  const handAnimatedStyle = createHandAnimatedStyle(handOpacity, handPosition, handRotation);
  const leftHandAnimatedStyle = createHandAnimatedStyle(leftHandOpacity, leftHandPosition, leftHandRotation);
  const cardAnimatedStyle = createFirstCardAnimatedStyle(tiltAnim, translateX);
  const secondCardCombinedAnimatedStyle = createSecondCardAnimatedStyle(secondCardScale, leftTiltAnim, secondTranslateX);
  const finalCardAnimatedStyle = createFinalCardAnimatedStyle(finalCardScale);

  const glowAnimatedStyle = useAnimatedStyle(() => {
    const glowOpacity = Math.min(translateX.value / 150, 0.9);
    return { opacity: glowOpacity };
  });

  const leftGlowAnimatedStyle = useAnimatedStyle(() => {
    const glowOpacity = Math.min(Math.abs(secondTranslateX.value) / 150, 0.9);
    return { opacity: glowOpacity };
  });

  const appliedOverlayAnimatedStyle = useAnimatedStyle(() => {
    const overlayOpacity = Math.min(translateX.value / 100, 1);
    const baseTilt = 0;
    
    return {
      opacity: overlayOpacity,
      transform: [
        { rotate: `${baseTilt + (tiltAnim.value * -5) + Math.min(translateX.value * 0.1, 10)}deg` },
        { translateX: translateX.value - 50 },
        { translateY: responsiveValues.overlayTranslateY },
      ],
    };
  });

  const passedOverlayAnimatedStyle = useAnimatedStyle(() => {
    const overlayOpacity = Math.min(Math.abs(secondTranslateX.value) / 100, 1);
    const baseTilt = 0;
    
    return {
      opacity: overlayOpacity,
      transform: [
        { rotate: `${baseTilt + (leftTiltAnim.value * -5) + Math.max(secondTranslateX.value * 0.1, -10)}deg` },
        { translateX: secondTranslateX.value + 30 },
        { translateY: responsiveValues.overlayTranslateY },
      ],
    };
  });

  const videoOverlayAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: leftSwipeCompleted ? 1 : 0,
      transform: [{ scale: finalCardScale.value }],
    };
  });

  // Effects and gesture handlers (keep existing logic)
  useEffect(() => {
    console.log('isActive changed to:', isActive);
    let intervalId: any = null;

    if (isActive && !rightSwipeCompleted) {
      secondCardScale.value = 0.9;
    }

    if (isActive && !hasStartedRightSwipe && !rightSwipeCompleted) {
      const runAnimation = () => {
        'worklet';
        createTiltAnimation(tiltAnim, 'right');
        createHandAnimation(handOpacity, handPosition, handRotation, 'right', width);
      };

      const initialTimeout = setTimeout(() => {
        runAnimation();
        intervalId = setInterval(() => {
          runAnimation();
        }, 5000);
      }, 500);

      return () => {
        clearTimeout(initialTimeout);
        if (intervalId) {
          clearInterval(intervalId);
        }
      };
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isActive, rightSwipeCompleted, hasStartedRightSwipe, tiltAnim, handOpacity, handPosition, handRotation, secondCardScale]);

  useEffect(() => {
    console.log('Left swipe animation useEffect triggered');
    let intervalId: any = null;

    if (isActive && rightSwipeCompleted && !hasStartedLeftSwipe && !leftSwipeCompleted) {
      const runLeftAnimation = () => {
        'worklet';
        createTiltAnimation(leftTiltAnim, 'left');
        createHandAnimation(leftHandOpacity, leftHandPosition, leftHandRotation, 'left', width);
      };

      const initialTimeout = setTimeout(() => {
        runLeftAnimation();
        intervalId = setInterval(() => {
          if (!hasStartedLeftSwipe && !leftSwipeCompleted) {
            runLeftAnimation();
          }
        }, 5000);
      }, 1000);

      return () => {
        clearTimeout(initialTimeout);
        if (intervalId) {
          clearInterval(intervalId);
        }
      };
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isActive, rightSwipeCompleted, hasStartedLeftSwipe, leftSwipeCompleted, leftTiltAnim, leftHandOpacity, leftHandPosition, leftHandRotation]);

  useEffect(() => {
    if (isActive && !rightSwipeCompleted) {
      appliedOpacity.value = 0;
      appliedTranslateX.value = width;
    }
  }, [isActive, rightSwipeCompleted]);

  const stopRightSwipeAnimations = () => {
    cancelAnimation(tiltAnim);
    cancelAnimation(handOpacity);
    cancelAnimation(handPosition);
    cancelAnimation(handRotation);

    tiltAnim.value = 0;
    handOpacity.value = 0;
    handPosition.value = 0;
    handRotation.value = 0;
    
    setHasStartedRightSwipe(true);
  };

  const stopLeftSwipeAnimations = () => {
    cancelAnimation(leftTiltAnim);
    cancelAnimation(leftHandOpacity);
    cancelAnimation(leftHandPosition);
    cancelAnimation(leftHandRotation);

    leftTiltAnim.value = 0;
    leftHandOpacity.value = 0;
    leftHandPosition.value = 0;
    leftHandRotation.value = 0;
    
    setHasStartedLeftSwipe(true);
  };

  useEffect(() => {
    if (leftSwipeCompleted) {
      console.log('Starting video playback');
      player.play();
    } else {
      player.pause();
    }
  }, [leftSwipeCompleted, player]);

  // Gesture handlers (keep existing logic but use responsive values)
  const panGesture = Gesture.Pan()
    .onStart(() => {
      console.log('Pan gesture started');
    })
    .onUpdate((event) => {
      translateX.value = Math.max(0, event.translationX);
      
      if (!hasStartedRightSwipe && event.translationX > 10) {
        runOnJS(stopRightSwipeAnimations)();
      }
    })
    .onEnd((event) => {
      console.log('Pan gesture ended at:', translateX.value);
      
      const swipeThreshold = 150;
      
      if (translateX.value < swipeThreshold) {
        translateX.value = withSpring(0, {
          damping: 15,
          stiffness: 150,
        });
      } else {
        console.log('Auto-completing swipe - animating card off screen');
        
        translateX.value = withTiming(width + 100, {
          duration: 300,
          easing: Easing.out(Easing.quad),
        }, (finished) => {
          if (finished) {
            console.log('Card successfully swiped away!');
            runOnJS(setRightSwipeCompleted)(true);

            console.log('Scaling second card from 0.9 to 1.0');
            secondCardScale.value = withTiming(1.0, {
              duration: 400,
              easing: Easing.out(Easing.quad)
            }, (finished) => {
              console.log('Second card scale finished:', finished);
            });
          }
        });
      }
    });

  const leftPanGesture = Gesture.Pan()
    .onStart(() => {
      console.log('Left Pan gesture started');
    })
    .onUpdate((event) => {
      secondTranslateX.value = Math.min(0, event.translationX);
      
      if (!hasStartedLeftSwipe && event.translationX < -10) {
        runOnJS(stopLeftSwipeAnimations)();
      }
    })
    .onEnd((event) => {
      console.log('Left Pan gesture ended at:', secondTranslateX.value);
      
      const swipeThreshold = -150;
      
      if (secondTranslateX.value > swipeThreshold) {
        secondTranslateX.value = withSpring(0, {
          damping: 15,
          stiffness: 150,
        });
      } else {
        console.log('Auto-completing swipe - animating card off screen');
        
        secondTranslateX.value = withTiming(-(width + 100), {
          duration: 300,
          easing: Easing.out(Easing.quad),
        }, (finished) => {
          if (finished) {
            console.log('Second card successfully swiped away!');
            runOnJS(setLeftSwipeCompleted)(true);

            console.log('Final second card from 0.8 to 1.0');
            finalCardScale.value = withTiming(1.0, {
              duration: 400,
              easing: Easing.out(Easing.quad)
            }, (finished) => {
              console.log('Final card scale finished:', finished);
            });

            if (onSwipeComplete) {
              runOnJS(onSwipeComplete)();
            }
          }
        });
      }
    });

  return (
    <View style={styles.container}>
      <View style={styles.cardContainer}>

        <Animated.Image
          source={require('@/assets/images/intro/intro-final-card.png')}
          style={[
            styles.finalCard,
            {
              width: responsiveValues.cardWidth,
              height: responsiveValues.cardHeight,
              marginBottom: responsiveValues.cardMarginBottom,
            },
            finalCardAnimatedStyle,
          ]}
          resizeMode="contain"
        />

        {Platform.OS === 'ios' ? (
          leftSwipeCompleted && (
            <Animated.View
              style={[
                styles.videoOverlay,
                {
                  width: responsiveValues.videoWidth,
                  height: responsiveValues.videoHeight,
                  marginBottom: responsiveValues.videoMarginBottom
                },
                videoOverlayAnimatedStyle,
              ]}
            >
              <VideoView
                player={player}
                style={[styles.video, { borderRadius: responsiveValues.borderRadius }]}
                contentFit="fill"
                allowsFullscreen={false}
                allowsPictureInPicture={false}
              />
            </Animated.View>
          )
        ) : (
          leftSwipeCompleted && (
            <Animated.View
              style={[
                styles.videoOverlay,
                {
                  width: responsiveValues.videoWidth,
                  height: responsiveValues.androidVideoHeight,
                  marginBottom: responsiveValues.videoMarginBottom
                },
                videoOverlayAnimatedStyle,
              ]}
            >
              <VideoView
                player={player}
                style={[styles.video, { borderRadius: responsiveValues.borderRadius }]}
                contentFit="fill"
                allowsFullscreen={false}
                allowsPictureInPicture={false}
              />
            </Animated.View>
          )
        )}

        <GestureDetector gesture={leftPanGesture}>
          <Animated.Image
            source={require('@/assets/images/intro/intro-swipe-card-2.png')}
            style={[
              styles.secondCard,
              {
                width: responsiveValues.cardWidth,
                height: responsiveValues.cardHeight,
                marginBottom: responsiveValues.cardMarginBottom,
              },
              secondCardCombinedAnimatedStyle,
            ]}
            resizeMode="contain"
          />
        </GestureDetector>

        {!leftSwipeCompleted && (
          <Animated.Image 
            source={require('@/assets/images/intro/intro-passed.png')}
            style={[
              styles.passedOverlay,
              {
                width: responsiveValues.overlayWidth,
                height: responsiveValues.cardHeight,
                marginBottom: responsiveValues.cardMarginBottom,
              },
              passedOverlayAnimatedStyle,
            ]}
            resizeMode="contain"
          />
        )}

        {Platform.OS === 'ios' ? (
          <Animated.View
            style={[
              styles.glowContainer,
              {
                width: responsiveValues.glowWidth,
                height: responsiveValues.glowHeight,
                marginBottom: responsiveValues.glowMarginBottom,
              },
              cardAnimatedStyle,
              glowAnimatedStyle,
            ]}
          />
        ) : (
          <Animated.View
            style={[
              styles.androidGlowOuter,
              {
                width: responsiveValues.androidGlowWidth,
                height: responsiveValues.androidGlowHeight,
                marginBottom: responsiveValues.glowMarginBottom,
              },
              cardAnimatedStyle,
              glowAnimatedStyle,
            ]}
          >
            <Animated.View style={styles.androidGlowInner} />
          </Animated.View>
        )}

        {Platform.OS === 'ios' ? (
          <Animated.View
            style={[
              styles.leftGlowContainer,
              {
                width: responsiveValues.glowWidth,
                height: responsiveValues.glowHeight,
                marginBottom: responsiveValues.glowMarginBottom,
              },
              secondCardCombinedAnimatedStyle,
              leftGlowAnimatedStyle,
            ]}
          />
        ) : (
          <Animated.View
            style={[
              styles.androidLeftGlowOuter,
              {
                width: responsiveValues.androidGlowWidth,
                height: responsiveValues.androidGlowHeight,
                marginBottom: responsiveValues.glowMarginBottom,
              },
              secondCardCombinedAnimatedStyle,
              leftGlowAnimatedStyle,
            ]}
          >
            <Animated.View style={styles.androidLeftGlowInner} />
          </Animated.View>
        )}

        {!rightSwipeCompleted && (
          <GestureDetector gesture={panGesture}>
            <Animated.Image 
              source={require('@/assets/images/intro/intro-swipe-card-1.png')}
              style={[
                styles.firstCard,
                {
                  width: responsiveValues.cardWidth,
                  height: responsiveValues.cardHeight,
                  marginBottom: responsiveValues.cardMarginBottom,
                },
                cardAnimatedStyle,
              ]}
              resizeMode="contain"
            />
          </GestureDetector>
        )}

        {!rightSwipeCompleted && (
          <Animated.Image 
            source={require('@/assets/images/intro/intro-applied.png')}
            style={[
              styles.appliedOverlay,
              {
                width: responsiveValues.overlayWidth,
                height: responsiveValues.cardHeight,
                marginBottom: responsiveValues.cardMarginBottom,
              },
              appliedOverlayAnimatedStyle,
            ]}
            resizeMode="contain"
          />
        )}

        <Animated.Image 
          source={require('@/assets/images/intro/right-swipe-hand.png')}
          style={[
            styles.handOverlay,
            {
              height: responsiveValues.handSize,
              width: responsiveValues.handSize,
              marginBottom: responsiveValues.handMarginBottom
            },
            handAnimatedStyle,
          ]}
          resizeMode="contain"
        />
        
        <Animated.Image 
          source={require('@/assets/images/intro/left-swipe-hand.png')}
          style={[
            styles.handOverlay,
            {
              height: responsiveValues.handSize,
              width: responsiveValues.handSize,
              marginBottom: responsiveValues.handMarginBottom
            },
            leftHandAnimatedStyle,
          ]}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  handOverlay: {
    position: 'absolute',
    zIndex: 10,
  },
  glowContainer: {
    position: 'absolute',
    borderRadius: 16,
    shadowColor: 'rgba(3, 255, 96, 1)',
    shadowOpacity: 1,
    shadowRadius: 20,
    backgroundColor: 'rgba(3, 255, 96, 1)',
    zIndex: 7
  },
  androidGlowOuter: {
    position: 'absolute',
    borderRadius: 26,
    elevation: 15,
    shadowColor: 'rgba(3, 255, 96, 1)',
    backgroundColor: 'rgba(3, 255, 96, 0.8)',
    padding: 8,
    zIndex: 7
  },
  androidGlowInner: {
    borderRadius: 26,
    elevation: 35,
    shadowColor: 'rgba(3, 255, 96, 1)',
    backgroundColor: 'rgba(3, 255, 96, 0.8)',
    width: '100%',
    height: '100%',
    marginTop: -10,
    marginLeft: -10,
    zIndex: 7
  },
  appliedOverlay: {
    position: 'absolute',
    zIndex: 10,
  },
  passedOverlay: {
    position: 'absolute',
    zIndex: 10,
  },
  firstCard: {
    zIndex: 8,
  },
  secondCard: {
    position: 'absolute',
    zIndex: 5,
  },
  finalCard: {
    position: 'absolute',
    zIndex: 0,
  },
  leftGlowContainer: {
    position: 'absolute',
    borderRadius: 16,
    shadowColor: 'rgba(255, 165, 0, 1)',
    shadowOpacity: 1,
    shadowRadius: 20,
    backgroundColor: 'rgba(255, 165, 0, 1)',
    zIndex: 4,
  },
  androidLeftGlowOuter: {
    position: 'absolute',
    borderRadius: 26,
    elevation: 15,
    shadowColor: 'rgba(255, 165, 0, 1)',
    backgroundColor: 'rgba(255, 165, 0, 0.8)',
    padding: 8,
    zIndex: 4,
  },
  androidLeftGlowInner: {
    borderRadius: 26,
    elevation: 35,
    shadowColor: 'rgba(255, 165, 0, 1)',
    backgroundColor: 'rgba(255, 165, 0, 0.8)',
    width: '100%',
    height: '100%',
    marginTop: -10,
    marginLeft: -10,
    zIndex: 4,
  },
  videoOverlay: {
    position: 'absolute',
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 0,
    overflow: 'hidden',
  },
  video: {
    width: '80%',
    height: '60%',
  },
});