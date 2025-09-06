// components/OverlayCard.tsx
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  useWindowDimensions
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  withSpring,
  useSharedValue
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { PrepTalkTheme } from '@/constants/Theme';
import Rive from 'rive-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Asset } from 'expo-asset';

interface OverlayCardProps {
  visible: boolean;
  onDismiss: () => void;
  title?: string;
  subtitle?: string;
}

export default function OverlayCard({ 
  visible, 
  onDismiss, 
  title = "Great job!",
  subtitle = "You've successfully completed the first swipe. Keep going to continue."
}: OverlayCardProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const riveAsset = Asset.fromModule(require('@/assets/animations/intro-applied.riv'));
  
  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      scale.value = withTiming(0.8, { duration: 200 });
    }
  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    pointerEvents: visible ? 'auto' : 'none' as any,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, overlayStyle]}>
              <LinearGradient
            colors={PrepTalkTheme.colors.gradientBackground.colors}
            start={PrepTalkTheme.colors.gradientBackground.start}
            end={PrepTalkTheme.colors.gradientBackground.end}
            locations={PrepTalkTheme.colors.gradientBackground.locations}
            style={[StyleSheet.absoluteFill]}
          >
      <TouchableOpacity 
        style={styles.backdrop} 
        onPress={onDismiss}
        activeOpacity={1}
      >
        <Animated.View style={[styles.card, cardStyle]}>
          <View style={styles.cardContent}>
            <View style={styles.animationContainer}>
              <Rive
                url={riveAsset.localUri || riveAsset.uri}
                style={styles.riveAnimation}
                autoplay={true}
              />
            </View> 
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
                <Text style={styles.dismissButtonText}>Tap anywhere to dismiss</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 32,
    minWidth: 280,
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  cardContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Lexend-SemiBold',
    color: PrepTalkTheme.colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: PrepTalkTheme.colors.mediumGray,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  dismissButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  dismissButtonText: {
    fontSize: 14,
    fontFamily: 'Nunito-Medium',
    color: PrepTalkTheme.colors.primary,
    textAlign: 'center',
  },
animationContainer: {
  width: 120,
  height: 80,
  marginVertical: 16,
  alignItems: 'center',
  justifyContent: 'center',
},
riveAnimation: {
  width: 320,
  height: 320,
},
});