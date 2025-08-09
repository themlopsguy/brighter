// components/onboarding/OnboardingStep2.tsx

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
import { PrepTalkTheme } from '@/constants/Theme';

interface OnboardingStep2Props {
  isActive?: boolean;
  onSwipeComplete?: () => void;
}

export default function OnboardingStep2({ isActive = true, onSwipeComplete }: OnboardingStep2Props) {
  const { height, width } = useWindowDimensions();
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
  const [hasStartedRightSwipe, setHasStartedRightSwipe] = useState(false);
  const [hasStartedLeftSwipe, setHasStartedLeftSwipe] = useState(false);
  const [rightSwipeCompleted, setRightSwipeCompleted] = useState(false);
  const [leftSwipeCompleted, setLeftSwipeCompleted] = useState(false);
  const appliedOpacity = useSharedValue(0);
  const appliedTranslateX = useSharedValue(0);
  const secondCardScale = useSharedValue(0.9);
  const finalCardScale = useSharedValue(0.8)

  const player = useVideoPlayer(require('@/assets/videos/brighter-onboard.mp4'), player => {
    player.loop = true;
    player.muted = true;
  });

  const createTiltAnimation = (tiltValue: any, direction: 'left' | 'right') => {
  'worklet';
  
  const multiplier = direction === 'left' ? 1 : -1; // Left = positive, Right = negative
  
  // Reset value
  tiltValue.value = 0;
  
  // Create tilt sequence
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
  
  // Calculate direction-specific values
  const positionTarget = direction === 'right' ? (screenWidth * 0.3) : -(screenWidth * 0.3);
  const rotationTarget = direction === 'right' ? 25 : -25;
  
  // Reset values
  opacityValue.value = 0;
  positionValue.value = 0;
  rotationValue.value = 0;

  // Hand animation sequence
  opacityValue.value = withSequence(
    withTiming(1, { duration: 300 }), // Fade in
    withDelay(900, withTiming(0, { duration: 300 })) // Fade out after delay
  );
  
  positionValue.value = withDelay(
    300, // Start moving after fade in
    withTiming(positionTarget, { duration: 1200, easing: Easing.out(Easing.quad) })
  );
  
  rotationValue.value = withDelay(
    300, // Start rotating with movement
    withTiming(rotationTarget, { duration: 1200, easing: Easing.out(Easing.quad) })
  );
};

const createHandAnimatedStyle = (
  opacityValue: any,
  positionValue: any, 
  rotationValue: any
) => {
  return useAnimatedStyle(() => ({
    opacity: opacityValue.value,
    transform: [
      {
        translateX: positionValue.value, // Direct pixel value
      },
      {
        rotate: `${rotationValue.value}deg`, // Direct degree value
      },
    ],
  }));
};

const handAnimatedStyle = createHandAnimatedStyle(handOpacity, handPosition, handRotation);
const leftHandAnimatedStyle = createHandAnimatedStyle(leftHandOpacity, leftHandPosition, leftHandRotation);

const createFirstCardAnimatedStyle = (
  tiltValue: any,
  gestureTranslateX: any
) => {
  return useAnimatedStyle(() => {
    // Calculate swipe rotation with limit
    const swipeRotation = Math.min(gestureTranslateX.value * 0.1, 10);
    
    return {
      transform: [
        {
          rotate: `${(tiltValue.value * -5) + swipeRotation}deg`, // Tilt + gesture rotation
        },
        {
          translateX: (tiltValue.value * -30) + gestureTranslateX.value, // Tilt + gesture movement
        },
      ],
    };
  });
};

const createSecondCardAnimatedStyle = (
  scaleValue: any,
  tiltValue: any,
  gestureTranslateX: any  // Add gesture parameter
) => {
  return useAnimatedStyle(() => {
    // Calculate swipe rotation with limit (same logic as first card)
    const swipeRotation = Math.max(gestureTranslateX.value * 0.1, -10); // Negative for left rotation, cap at -10°
    
    return {
      transform: [
        { scale: scaleValue.value },
        { rotate: `${(tiltValue.value * -5) + swipeRotation}deg` }, // Tilt + gesture rotation
        { translateX: (tiltValue.value * -30) + gestureTranslateX.value }, // Tilt + gesture movement
      ],
    };
  });
};

const createFinalCardAnimatedStyle = (
  scaleValue: any,
) => {
  return useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scaleValue.value },
      ],
    };
  });
};

const cardAnimatedStyle = createFirstCardAnimatedStyle(tiltAnim, translateX);
const secondCardCombinedAnimatedStyle = createSecondCardAnimatedStyle(secondCardScale, leftTiltAnim, secondTranslateX);
const finalCardAnimatedStyle = createFinalCardAnimatedStyle(finalCardScale)

    const glowAnimatedStyle = useAnimatedStyle(() => {
    // Calculate glow opacity based on swipe distance (0 to 1)
    const glowOpacity = Math.min(translateX.value / 150, 0.9); // Full opacity at 150px
    
    return {
        opacity: glowOpacity,
    };
    });

    const leftGlowAnimatedStyle = useAnimatedStyle(() => {
  // Calculate glow opacity based on left swipe distance (0 to 1)
  // Note: secondTranslateX will be negative, so we use Math.abs and divide by -150
  const glowOpacity = Math.min(Math.abs(secondTranslateX.value) / 150, 0.9); // Full opacity at 150px left
  
  return {
    opacity: glowOpacity,
  };
});

const appliedOverlayAnimatedStyle = useAnimatedStyle(() => {
  // Calculate opacity based on right swipe distance (0 to 1)
  // Start showing when user begins swiping (translateX > 0)
  const overlayOpacity = Math.min(translateX.value / 100, 1); // Full opacity at 100px swipe

  const baseTilt = 0;
  
  return {
    opacity: overlayOpacity,
    transform: [
      // Follow the first card's transforms exactly
      {
        rotate: `${baseTilt + (tiltAnim.value * -5) + Math.min(translateX.value * 0.1, 10)}deg`,
      },
      {
        translateX: translateX.value - 50,
      },
      {
        translateY: height < 700 ? -160 : -230, // Move up by 100 pixels (adjust this value as needed)
      },
    ],
  };
});

const passedOverlayAnimatedStyle = useAnimatedStyle(() => {
  // Calculate opacity based on right swipe distance (0 to 1)
  // Start showing when user begins swiping (translateX > 0)
  const overlayOpacity = Math.min(Math.abs(secondTranslateX.value) / 100, 1); // Full opacity at 100px swipe

  const baseTilt = 0;
  
  return {
    opacity: overlayOpacity,
    transform: [
      // Follow the first card's transforms exactly
      {
        rotate: `${baseTilt + (leftTiltAnim.value * -5) + Math.max(secondTranslateX.value * 0.1, -10)}deg`,
      },
      {
        translateX: secondTranslateX.value + 30,
      },
      {
        translateY: height < 700 ? -160 : -230, // Move up by 100 pixels (adjust this value as needed)
      },
    ],
  };
});

const videoOverlayAnimatedStyle = useAnimatedStyle(() => {
  return {
    opacity: leftSwipeCompleted ? 1 : 0, // Only visible after left swipe completes
    transform: [
      { scale: finalCardScale.value }, // Follow final card scale
    ],
  };
});

  useEffect(() => {
    console.log('isActive changed to:', isActive)
    let intervalId: any = null;

    if (isActive && !rightSwipeCompleted) {
        //setHasStartedRightSwipe(false);
        secondCardScale.value = 0.9;
    }

    if (isActive && !hasStartedRightSwipe && !rightSwipeCompleted) {
      // Start the tilt animation when the step becomes active
    const runAnimation = () => {
    'worklet';

    // Use reusable animations
    createTiltAnimation(tiltAnim, 'right');
    createHandAnimation(handOpacity, handPosition, handRotation, 'right', width);
    };

    // Run the first animation after initial delay
    const initialTimeout = setTimeout(() => {
      runAnimation();
      
      // Set up interval to repeat animation every 5 seconds
      intervalId = setInterval(() => {
        runAnimation();
      }, 5000);
    }, 500);

    // Cleanup function
    return () => {
      clearTimeout(initialTimeout);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }

    // Cleanup when not active
    return () => {
        if (intervalId) {
        clearInterval(intervalId);
        }
    };
  }, [isActive, rightSwipeCompleted, hasStartedRightSwipe, tiltAnim, handOpacity, handPosition, handRotation, secondCardScale]);

  useEffect(() => {
  console.log('Left swipe animation useEffect triggered');
  let intervalId: any = null;

  // Only run left animations if right swipe is completed but left swipe hasn't started/completed
  if (isActive && rightSwipeCompleted && !hasStartedLeftSwipe && !leftSwipeCompleted) {
    
    const runLeftAnimation = () => {
      'worklet';
      createTiltAnimation(leftTiltAnim, 'left');
      createHandAnimation(leftHandOpacity, leftHandPosition, leftHandRotation, 'left', width);
    };

    // Run the first animation after initial delay
    const initialTimeout = setTimeout(() => {
      runLeftAnimation();
      
      // Set up interval to repeat animation every 5 seconds
      intervalId = setInterval(() => {
        if (!hasStartedLeftSwipe && !leftSwipeCompleted) {
          runLeftAnimation();
        }
      }, 5000);
    }, 1000); // 1 second delay

    // Cleanup function
    return () => {
      clearTimeout(initialTimeout);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }

  // Cleanup when not active
  return () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  };
}, [isActive, rightSwipeCompleted, hasStartedLeftSwipe, leftSwipeCompleted, leftTiltAnim, leftHandOpacity, leftHandPosition, leftHandRotation]);

    useEffect(() => {
    // Only reset applied animation when step becomes active AND swipe hasn't been completed
    if (isActive && !rightSwipeCompleted) {
        appliedOpacity.value = 0;
        appliedTranslateX.value = width;
    }
    }, [isActive, rightSwipeCompleted]);

    const stopRightSwipeAnimations = () => {
    // Cancel any running animations
    cancelAnimation(tiltAnim);
    cancelAnimation(handOpacity);
    cancelAnimation(handPosition);
    cancelAnimation(handRotation);

    // Reset to resting state
    tiltAnim.value = 0;
    handOpacity.value = 0;
    handPosition.value = 0;
    handRotation.value = 0;
    
    setHasStartedRightSwipe(true);
    };

    const stopLeftSwipeAnimations = () => {
    // Cancel any running animations
    cancelAnimation(leftTiltAnim);
    cancelAnimation(leftHandOpacity);
    cancelAnimation(leftHandPosition);
    cancelAnimation(leftHandRotation);

    // Reset to resting state
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

const panGesture = Gesture.Pan()
  .onStart(() => {
    console.log('Pan gesture started');
  })
  .onUpdate((event) => {
    // Only respond to horizontal movement, ignore vertical
    translateX.value = Math.max(0, event.translationX);
    
    // Stop right swipe animations when user starts meaningful right swipe
    if (!hasStartedRightSwipe && event.translationX > 10) { // 10px threshold
      runOnJS(stopRightSwipeAnimations)(); // Use runOnJS to call from gesture
    }
  })
  .onEnd((event) => {
        console.log('Pan gesture ended at:', translateX.value);
        
        // Define the threshold for successful swipe (adjust this value as needed)
        const swipeThreshold = 150; // pixels
        
        if (translateX.value < swipeThreshold) {
        // Snap back to original position with spring animation
        translateX.value = withSpring(0, {
            damping: 15,
            stiffness: 150,
        });
        } else {
        // User swiped far enough - animate card off screen
        console.log('Auto-completing swipe - animating card off screen');
        
        // Animate card off the right edge of screen
        translateX.value = withTiming(width + 100, { // Move beyond screen width
        duration: 300,
        easing: Easing.out(Easing.quad),
        }, (finished) => {
        // Animation completed callback
        if (finished) {
            // runOnJS(() => {
            console.log('Card successfully swiped away!');

            runOnJS(setRightSwipeCompleted)(true);

            console.log('Scaling second card from 0.9 to 1.0');
            secondCardScale.value = withTiming(1.0, {
                duration: 400,
                easing: Easing.out(Easing.quad)
            }, (finished) => {
                console.log('Second card scale finished:', finished);
            });
            // if (onSwipeComplete) {
            //     runOnJS(onSwipeComplete)();
            // }
        }
      });
    }
  });

const leftPanGesture = Gesture.Pan()
  .onStart(() => {
    console.log('Left Pan gesture started');
  })
  .onUpdate((event) => {
    // Only respond to horizontal movement, ignore vertical
    secondTranslateX.value = Math.min(0, event.translationX);
    
    // Stop right swipe animations when user starts meaningful right swipe
    if (!hasStartedLeftSwipe && event.translationX < -10) { // 10px threshold
      runOnJS(stopLeftSwipeAnimations)(); // Use runOnJS to call from gesture
    }
  })
  .onEnd((event) => {
        console.log('Left Pan gesture ended at:', translateX.value);
        
        // Define the threshold for successful swipe (adjust this value as needed)
        const swipeThreshold = -150; // pixels
        
        if (secondTranslateX.value > swipeThreshold) {
        // Snap back to original position with spring animation
        secondTranslateX.value = withSpring(0, {
            damping: 15,
            stiffness: 150,
        });
        } else {
        // User swiped far enough - animate card off screen
        console.log('Auto-completing swipe - animating card off screen');
        
        // Animate card off the right edge of screen
        secondTranslateX.value = withTiming(-(width + 100), { // Move beyond screen width
        duration: 300,
        easing: Easing.out(Easing.quad),
        }, (finished) => {
        // Animation completed callback
        if (finished) {
            // runOnJS(() => {
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
            source={require('@/assets/images/onboarding/onboard-final-card.png')}
            style={[
            styles.finalCard,
            {
                width: (height < 700 ? width - 140 : width - 135), // 90% of first card width
                height: (height < 700 ? height - 215 : height),    // 90% of first card height
                marginBottom: height < 700 ? 100 : 175,
            },
            finalCardAnimatedStyle,
            ]}
            resizeMode="contain"
        />

        {leftSwipeCompleted && (
        <Animated.View
            style={[
            styles.videoOverlay,
            {
                width: (height < 700 ? width - 160 : width - 166),
                height: (height < 700 ? height - 460 : height - 710),
                marginBottom: height < 700 ? 135 : 225
            },
            videoOverlayAnimatedStyle,
            ]}
        >
            <VideoView
            player={player}
            style={[styles.video, {borderRadius: height < 700 ? 12 : 16}]}
            contentFit="fill" // equivalent to ResizeMode.STRETCH
            allowsFullscreen={false}
            allowsPictureInPicture={false}
            />
        </Animated.View>
        )}

          {/* Second card - lowest z-index, 90% size, centered behind first card */}
        <GestureDetector gesture={leftPanGesture}>
        <Animated.Image
            source={require('@/assets/images/onboarding/onboard-swipe-card-2.png')}
            style={[
            styles.secondCard,
            {
                width: (height < 700 ? width - 140 : width - 135), // 90% of first card width
                height: (height < 700 ? height - 215 : height),    // 90% of first card height
                marginBottom: height < 700 ? 100 : 175,
            },
            secondCardCombinedAnimatedStyle,
            ]}
            resizeMode="contain"
        />
        </GestureDetector>

    {!leftSwipeCompleted && (
    <Animated.Image 
        source={require('@/assets/images/onboarding/onboarding-passed.png')}
        style={[
        styles.passedOverlay,
        {
            width: height < 700 ? width - 240 : width - 255, // Same size as first card
            height: height < 700 ? height - 215 : height,    // Same size as first card
            marginBottom: height < 700 ? 100 : 175,
        },
        passedOverlayAnimatedStyle, // Opacity + transforms to follow first card
        ]}
        resizeMode="contain"
    />
    )}

        {/* Green glow effect - positioned behind card */}
        {Platform.OS === 'ios' ? (
        <Animated.View
            style={[
            styles.glowContainer,
            {
                width: height < 700 ? width - 140 : width - 195,
                height: height < 700 ? height - 215 : height - 550,
                marginBottom: height < 700 ? 100 : 175,
            },
            cardAnimatedStyle, // Same transforms as card so glow follows
            glowAnimatedStyle, // Opacity based on swipe distance
            ]}
        />
        ) : (
                // Android: Nested views for better shadow control
    <Animated.View
      style={[
        styles.androidGlowOuter,
        {
          width: height < 700 ? width - 185 : width - 195,
          height: height < 700 ? height - 330 : height - 550,
          marginBottom: height < 700 ? 100 : 175,
        },
        cardAnimatedStyle,
        glowAnimatedStyle,
      ]}
    >
      <Animated.View style={styles.androidGlowInner} />
    </Animated.View>
  )}

    {/* Left orange glow effect for second card */}
    {Platform.OS === 'ios' ? (
    <Animated.View
        style={[
        styles.leftGlowContainer,
        {
            width: height < 700 ? width - 140 : width - 195,
            height: height < 700 ? height - 215 : height - 550,
            marginBottom: height < 700 ? 100 : 175,
        },
        secondCardCombinedAnimatedStyle, // Same transforms as second card
        leftGlowAnimatedStyle, // Opacity based on left swipe distance
        ]}
    />
    ) : (
    <Animated.View
        style={[
        styles.androidLeftGlowOuter,
        {
            width: height < 700 ? width - 185 : width - 195,
            height: height < 700 ? height - 330 : height - 550,
            marginBottom: height < 700 ? 100 : 175,
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
            source={require('@/assets/images/onboarding/onboard-swipe-card-1.png')}
            style={[
                styles.firstCard,
                {
                // Responsive sizing based on screen dimensions
                width: height < 700 ? width - 140 : width - 135, // 70% of screen width
                height: height < 700 ? height - 215 : height, // Maintain 9:4 ratio (width:height)
                marginBottom: height < 700 ? 100 : 175,
                },
                cardAnimatedStyle,
            ]}
            resizeMode="contain"
            />
        </GestureDetector>
  )}

  {!rightSwipeCompleted && (
  <Animated.Image 
    source={require('@/assets/images/onboarding/onboarding-applied.png')}
    style={[
      styles.appliedOverlay,
      {
        width: height < 700 ? width - 240 : width - 255, // Same size as first card
        height: height < 700 ? height - 215 : height,    // Same size as first card
        marginBottom: height < 700 ? 100 : 175,
      },
      appliedOverlayAnimatedStyle, // Opacity + transforms to follow first card
    ]}
    resizeMode="contain"
  />
)}

        {/* Hand animation overlay */}
        <Animated.Image 
        source={require('@/assets/images/onboarding/right-swipe-hand.png')}
        style={[
            [styles.handOverlay, {
            height: height < 700 ? 75 : 100,
            width: height < 700 ? 75 : 100,
            marginBottom: height < 700 ? 100 : 100
            }],
            handAnimatedStyle, // Add the animated style
        ]}
        resizeMode="contain"
        />
        
        {/* Left hand animation overlay */}
        <Animated.Image 
        source={require('@/assets/images/onboarding/left-swipe-hand.png')}
        style={[
            [styles.handOverlay, {
            height: height < 700 ? 75 : 100,
            width: height < 700 ? 75 : 100,
            marginBottom: height < 700 ? 100 : 100
            }],
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
    width: 100, // Adjust size as needed
    height: 100, // Adjust size as needed
    zIndex: 10, // Ensure hand appears above card
  },
  glowContainer: {
    position: 'absolute',
    borderRadius: 16,
    shadowColor: 'rgba(3, 255, 96, 1)', // Green color
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
  // Add padding to create space for inner shadow
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
  // Offset the inner container to control shadow direction
  marginTop: -10,
  marginLeft: -10,
  zIndex: 7
},
appliedOverlay: {
  position: 'absolute',
  zIndex: 10, // Above first card (which has zIndex: 3)
  // Same positioning as first card but higher z-index
},
passedOverlay: {
  position: 'absolute',
  zIndex: 10, // Above second card (which has zIndex: 3)
  // Same positioning as first card but higher z-index
},
firstCard: {
  zIndex: 8, // Above glow and second card
},
secondCard: {
  position: 'absolute',
  zIndex: 5, // Lowest z-index
  // Centered positioning (same as other cards)
},
finalCard: {
  position: 'absolute',
  zIndex: 0, // Lowest z-index
  // Centered positioning (same as other cards)
},
leftGlowContainer: {
  position: 'absolute',
  borderRadius: 16,
  shadowColor: 'rgba(255, 165, 0, 1)', // Orange color for left swipe
  shadowOpacity: 1,
  shadowRadius: 20,
  backgroundColor: 'rgba(255, 165, 0, 1)',
  zIndex: 4, // Between second card (1) and background
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
  zIndex: 1, // Above final card (zIndex: 0) but below other elements
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 0, // Match your card border radius if needed
  overflow: 'hidden', // Clip video to container bounds
},
video: {
  width: '80%', // Adjust size relative to card (smaller than full card)
  height: '60%', // Adjust size relative to card
  //borderRadius: 16, // Optional: rounded video corners
},
});