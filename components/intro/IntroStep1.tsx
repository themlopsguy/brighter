// components/intro/IntroStep1.tsx

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
import { PrepTalkTheme, useScreenSize, getResponsiveValue } from '@/constants/Theme';
import IntroJobCard from '@/components/IntroJobCard';

interface IntroStep1Props {
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

export default function IntroStep1({ jobData, logoImages = [], isActive = true }: IntroStep1Props) {
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const logoRotationAnim = useRef(new Animated.Value(0)).current;
  const { height, width } = useWindowDimensions();
  const screenSize = useScreenSize();

  // Store animation references to stop them
  const currentRotationValue = useRef(0);
  const currentLogoRotationValue = useRef(0);

  // Store animation references
  const rotationAnimationRef = useRef<any>(null);
  const logoRotationAnimationRef = useRef<any>(null);

  // Responsive values
  const responsiveValues = {
    // Animation durations
    jobCardAnimationDuration: getResponsiveValue({
      small: 80000,
      medium: 75000,
      large: 70000,
      xlarge: 65000,
    }),
    logoAnimationDuration: getResponsiveValue({
      small: 60000,
      medium: 55000,
      large: 50000,
      xlarge: 45000,
    }),
    
    // Circle transforms
    jobCardCircleTranslateY: getResponsiveValue({
      small: 180,
      medium: 130,
      large: 80,
      xlarge: 30,
    }),
    logoCircleTranslateY: getResponsiveValue({
      small: -20,
      medium: -35,
      large: -50,
      xlarge: -65,
    }),
    centerLogoTranslateY: getResponsiveValue({
      small: -30,
      medium: -45,
      large: -60,
      xlarge: -75,
    }),
    cardContainerTranslateY: getResponsiveValue({
      small: 230,
      medium: 180,
      large: 130,
      xlarge: 80,
    }),
    
    // Sizes
    logoCircleSize: getResponsiveValue({
      small: 245,
      medium: 295,
      large: 345,
      xlarge: 395,
    }),
    brighterCircleSize: getResponsiveValue({
      small: 125,
      medium: 150,
      large: 175,
      xlarge: 200,
    }),
    centerLogoWidth: getResponsiveValue({
      small: 70,
      medium: 90,
      large: 110,
      xlarge: 130,
    }),
    centerLogoHeight: getResponsiveValue({
      small: 30,
      medium: 40,
      large: 50,
      xlarge: 60,
    }),
    orbitingLogoSize: getResponsiveValue({
      small: 30,
      medium: 35,
      large: 40,
      xlarge: 45,
    }),
    
    // Radius calculations
    logoOrbitRadius: getResponsiveValue({
      small: 117.5,
      medium: 142.5,
      large: 167.5,
      xlarge: 192.5,
    }),
  };

  useEffect(() => {
    // Create the continuous rotation animation
    const startRotation = (fromValue = 0) => {
      rotationAnim.setValue(fromValue);
      rotationAnimationRef.current = Animated.timing(rotationAnim, {
        toValue: 1,
        duration: responsiveValues.jobCardAnimationDuration * (1 - fromValue),
        easing: Easing.linear,
        useNativeDriver: true,
      });
      rotationAnimationRef.current.start(({ finished }) => {
        if (finished && isActive) {
          currentRotationValue.current = 0;
          startRotation(0);
        }
      });
    };

    // Create the continuous rotation animation for logo images
    const startLogoRotation = (fromValue = 0) => {
      logoRotationAnim.setValue(fromValue);
      logoRotationAnimationRef.current = Animated.timing(logoRotationAnim, {
        toValue: 1,
        duration: responsiveValues.logoAnimationDuration * (1 - fromValue),
        easing: Easing.linear,
        useNativeDriver: true,
      });
      logoRotationAnimationRef.current.start(({ finished }) => {
        if (finished && isActive && logoImages.length > 0) {
          currentLogoRotationValue.current = 0;
          startLogoRotation(0);
        }
      });
    };

    if (isActive) {
      startRotation(currentRotationValue.current);
      if (logoImages.length > 0) {
        startLogoRotation(currentLogoRotationValue.current);
      }
    } else {
      rotationAnim.stopAnimation((value) => {
        currentRotationValue.current = value;
      });
      logoRotationAnim.stopAnimation((value) => {
        currentLogoRotationValue.current = value;
      });
    }
  }, [isActive, rotationAnim, logoRotationAnim, logoImages.length, responsiveValues.jobCardAnimationDuration, responsiveValues.logoAnimationDuration]);

  // Interpolate rotation values
  const rotateInterpolate = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const counterRotateInterpolate = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-360deg'],
  });

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
        <View style={[
          styles.jobCardCircleBorder, 
          { transform: [{ translateY: responsiveValues.jobCardCircleTranslateY }] }
        ]} />
        
        <View style={[
          styles.logoCircleBorder, 
          { 
            transform: [{ translateY: responsiveValues.logoCircleTranslateY }],
            width: responsiveValues.logoCircleSize, 
            height: responsiveValues.logoCircleSize,
          }
        ]} />
        
        <View style={[
          styles.brighterCircleBorder, 
          { 
            transform: [{ translateY: responsiveValues.logoCircleTranslateY }],
            width: responsiveValues.brighterCircleSize, 
            height: responsiveValues.brighterCircleSize
          }
        ]} />

        {/* Logo inside the center circle */}
        <Image 
          source={require('@/assets/images/logo.png')}
          style={[
            styles.centerLogo,
            {
              transform: [{ translateY: responsiveValues.centerLogoTranslateY }],
              width: responsiveValues.centerLogoWidth,
              height: responsiveValues.centerLogoHeight,
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
                transform: [
                  { translateY: responsiveValues.logoCircleTranslateY }, 
                  { rotate: logoRotateInterpolate }
                ],
              }
            ]}
          >
            {logoImages.map((logoImg, index) => {
              const angle = (index * (360 / logoImages.length)) * (Math.PI / 180);
              const radius = responsiveValues.logoOrbitRadius;
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
                        width: logoImg.width || responsiveValues.orbitingLogoSize,
                        height: logoImg.height || responsiveValues.orbitingLogoSize,
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
              transform: [
                { translateY: responsiveValues.cardContainerTranslateY }, 
                { rotate: rotateInterpolate }
              ],
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
                <IntroJobCard 
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
    zIndex: 10,
  },
  logoContainer: {
    width: 375,
    height: 375,
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