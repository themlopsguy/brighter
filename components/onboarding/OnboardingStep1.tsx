// components/onboarding/OnboardingStep1.tsx

import React, { useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Animated,
  Easing,
  useWindowDimensions,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PrepTalkTheme } from '@/constants/Theme';
import OnboardingJobCard from '@/components/OnboardingJobCard';

interface OnboardingStep1Props {
  jobData: Array<{
    position: string;
    company: string;
    logo: any;
    logoWidth?: number;
    logoHeight?: number;
  }>;
    logoImages?: Array<{
    source: any;
    width?: number;
    height?: number;
  }>;
  isActive?: boolean;
}

export default function OnboardingStep1({ jobData, logoImages = [], isActive = true }: OnboardingStep1Props) {
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const logoRotationAnim = useRef(new Animated.Value(0)).current;
  const { height } = useWindowDimensions();

  // Store animation references to stop them
  const currentRotationValue = useRef(0);
  const currentLogoRotationValue = useRef(0);

  // Store animation references
  const rotationAnimationRef = useRef<any>(null);
  const logoRotationAnimationRef = useRef<any>(null);

  useEffect(() => {
    // Create the continuous rotation animation
    const startRotation = (fromValue = 0) => {
        rotationAnim.setValue(fromValue);
        rotationAnimationRef.current = Animated.timing(rotationAnim, {
        toValue: 1,
        duration: (height < 700 ? 80000 : 70000) * (1 - fromValue), // Adjust duration based on starting point
        easing: Easing.linear,
        useNativeDriver: true,
        });
        rotationAnimationRef.current.start(({ finished }) => {
        if (finished && isActive) {
            currentRotationValue.current = 0; // Reset for next loop
            startRotation(0);
        }
        });
    };

    // Create the continuous rotation animation for logo images (different speed)
    const startLogoRotation = (fromValue = 0) => {
        logoRotationAnim.setValue(fromValue);
        logoRotationAnimationRef.current = Animated.timing(logoRotationAnim, {
        toValue: 1,
        duration: (height < 700 ? 60000 : 50000) * (1 - fromValue), // Adjust duration based on starting point
        easing: Easing.linear,
        useNativeDriver: true,
        });
        logoRotationAnimationRef.current.start(({ finished }) => {
        if (finished && isActive && logoImages.length > 0) {
            currentLogoRotationValue.current = 0; // Reset for next loop
            startLogoRotation(0);
        }
        });
    };

    if (isActive) {
      // Resume animations from where they left off
      startRotation(currentRotationValue.current);
      if (logoImages.length > 0) {
        startLogoRotation(currentLogoRotationValue.current);
      }
    } else {
      // Pause animations and store current values
      rotationAnim.stopAnimation((value) => {
        currentRotationValue.current = value;
      });
      logoRotationAnim.stopAnimation((value) => {
        currentLogoRotationValue.current = value;
      });
    }

  }, [isActive, rotationAnim, logoRotationAnim, logoImages.length, height]);

  // Interpolate rotation values
  const rotateInterpolate = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const counterRotateInterpolate = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-360deg'],
  });

  // Interpolate rotation values for logo images
  const logoRotateInterpolate = logoRotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const logoCounterRotateInterpolate = logoRotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-360deg'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.orbitContainer}>
        {/* Gray circle border */}
        <View style={[styles.jobCardCircleBorder, {transform: [{ translateY: height < 700 ? 180 : 80 }]}]} />
        <View style={[styles.logoCircleBorder, {transform: [{ translateY: height < 700 ? -20 : -50 }]},
                                               {width: height < 700 ? 245 : 345}, 
                                               {height: height < 700 ? 245 : 345,}]} />
        <View style={[styles.brighterCircleBorder, {transform: [{ translateY: height < 700 ? -20 : -50 }]},
                                               {width: height < 700 ? 125 : 175}, 
                                               {height: height < 700 ? 125 : 175}]} />

        {/* Logo inside the center circle */}
        <Image 
          source={require('@/assets/images/logo.png')}
          style={[
            styles.centerLogo,
            {
              transform: [{ translateY: height < 700 ? -30 : -60 }],
              width: height < 700 ? 70 : 110,
              height: height < 700 ? 30 : 50,
            }
          ]}
          resizeMode="contain"
        />

    {/* Rotating container with logo images (smaller orbit) */}
    {logoImages.length > 0 && (
    <Animated.View 
        style={[
        styles.logoContainer,
        {
            transform: [{ translateY: height < 700 ? -20 : -50 }, 
                        { rotate: logoRotateInterpolate }],
        }
        ]}
    >
        {logoImages.map((logoImg, index) => {
        const angle = (index * (360 / logoImages.length)) * (Math.PI / 180);
        const radius = height < 700 ? 117.5 : 167.5;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        return (
            <Animated.View
            key={index}
            style={[
                styles.logoPosition,
                {
                transform: [
                    { translateX: x },
                    { translateY: y },
                    { rotate: logoCounterRotateInterpolate },
                ],
                },
            ]}
            >
            <Image 
                source={logoImg.source}
                style={[
                styles.orbitingLogo,
                {
                    width: logoImg.width || (height < 700 ? 30 : 40),
                    height: logoImg.height || (height < 700 ? 30 : 40),
                }
                ]}
                resizeMode="contain"
            />
            </Animated.View>
        );
        })}
    </Animated.View>
    )}
        
        {/* Rotating container with job cards */}
        <Animated.View 
          style={[
            styles.cardContainer,
            {
              transform: [{ translateY: height < 700 ? 230 : 130 }, 
                          { rotate: rotateInterpolate }],
            }
          ]}
        >
          {jobData.map((job, index) => {
            const angle = (index * (360 / jobData.length)) * (Math.PI / 180);
            const radius = 440;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            return (
              <Animated.View
                key={index}
                style={[
                  styles.cardPosition,
                  {
                    transform: [
                      { translateX: x },
                      { translateY: y },
                      { rotate: counterRotateInterpolate },
                    ],
                  },
                ]}
              >
                <OnboardingJobCard 
                  position={job.position} 
                  company={job.company}
                  logo={job.logo}
                  logoWidth={job.logoWidth}
                  logoHeight={job.logoHeight}
                />
              </Animated.View>
            );
          })}
        </Animated.View>
      </View>
    <LinearGradient
      colors={['transparent', 'transparent', 'rgba(255,255,255,0.8)', 'rgba(255,255,255,1)']}
      locations={[0, 0.3, 0.7, 1]}
      style={styles.fadeOverlay}
      pointerEvents="none"
    />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    //paddingHorizontal: 20,
  },
  orbitContainer: {
    width: 550,
    height: 800,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  jobCardCircleBorder: {
    width: 550,
    height: 800,
    borderRadius: 420,
    opacity: 0.5,
    borderWidth: 2,
    borderColor: 'rgb(255, 255, 255)',
    position: 'absolute'
  },
  logoCircleBorder: {
    borderRadius: 420,
    opacity: 0.6,
    borderWidth: 2,
    borderColor: 'rgb(255, 255, 255)',
    position: 'absolute'
  },
  brighterCircleBorder: {
    borderRadius: 420,
    opacity: 0.8,
    borderWidth: 2,
    borderColor: 'rgb(255, 255, 255)',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    position: 'absolute'
  },
  centerLogo: {
    position: 'absolute',
    zIndex: 10, // Ensure logo appears above circles
  },
  logoContainer: {
    width: 375, // Match logoCircleBorder max width
    height: 375, // Match logoCircleBorder max height
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoPosition: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orbitingLogo: {
    // Additional styling for orbiting logos if needed
  },
  cardContainer: {
    width: 700,
    height: 800,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardPosition: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
});