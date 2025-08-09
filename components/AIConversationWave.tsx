// components/AIConversationWave.tsx
import React, { useEffect, useRef } from 'react';
import { View, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  cancelAnimation,
  runOnJS,
} from 'react-native-reanimated';

const { width: screenWidth } = Dimensions.get('window');
const AnimatedPath = Animated.createAnimatedComponent(Path);

interface AIConversationWaveProps {
  isAISpeaking?: boolean;
  isUserSpeaking?: boolean;
  aiAudioLevel?: number; // 0-1
  userAudioLevel?: number; // 0-1
  width?: number;
  height?: number;
}

const AIConversationWave: React.FC<AIConversationWaveProps> = ({
  isAISpeaking = false,
  isUserSpeaking = false,
  aiAudioLevel = 0,
  userAudioLevel = 0,
  width = Math.min(screenWidth * 0.9, 350),
  height = 180,
}) => {
  const baselineY = height / 2;
  const waveResolution = 300;

  // Shared values for animation
  const aiTime = useSharedValue(0);
  const userTime = useSharedValue(0);
  const aiAmplitude1 = useSharedValue(0);
  const aiAmplitude2 = useSharedValue(0);
  const aiAmplitude3 = useSharedValue(0);
  const aiAmplitude4 = useSharedValue(0);
  const userAmplitude1 = useSharedValue(0);
  const userAmplitude2 = useSharedValue(0);
  const userAmplitude3 = useSharedValue(0);
  const userAmplitude4 = useSharedValue(0);

  // Generate stationary wave points
  const generateStationaryWave = (
    amplitude: number,
    waveIntensity: number,
    time: number,
    segmentOffset: number = 0
  ) => {
    'worklet';
    const points = [];
    const step = width / waveResolution;

    for (let i = 0; i <= waveResolution; i++) {
      const x = i * step;
      const normalizedX = (i / waveResolution) * Math.PI * 3;

    // Edge clamping - make edges flat
    const edgeFactor = Math.min(1, Math.min(i / 50, (waveResolution - i) / 50));

    const primaryWave = Math.sin(normalizedX * 2 + segmentOffset) * waveIntensity * edgeFactor;
    const secondaryWave = Math.sin(normalizedX * 4 + segmentOffset * 1.5) * (waveIntensity * 0.3) * edgeFactor;
    const tertiaryWave = Math.sin(normalizedX * 6 + segmentOffset * 0.7) * (waveIntensity * 0.15) * edgeFactor;
    const ripple = Math.sin(time + normalizedX) * (amplitude * 0.2) * edgeFactor;

      const totalWave = primaryWave + secondaryWave + tertiaryWave + ripple;
      const y = baselineY + totalWave;

      points.push({ x, y });
    }
    return points;
  };

  // Create wave path for AI (upward)
  const createAIWavePath = (amplitude: number, time: number, waveIntensity: number, segmentOffset: number) => {
    'worklet';
    const points = generateStationaryWave(amplitude, waveIntensity, time, segmentOffset);
    let path = `M 0 ${baselineY}`;

    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      const scaledY = baselineY - Math.abs(baselineY - point.y);

      if (i === 0) {
        path += ` L ${point.x} ${scaledY}`;
      } else {
        const prevPoint = points[i - 1];
        const controlX = (prevPoint.x + point.x) / 2;
        path += ` Q ${controlX} ${scaledY} ${point.x} ${scaledY}`;
      }
    }

    path += ` L ${width} ${baselineY} Z`;
    return path;
  };

  // Create wave path for User (downward)
  const createUserWavePath = (amplitude: number, time: number, waveIntensity: number, segmentOffset: number) => {
    'worklet';
    const points = generateStationaryWave(amplitude, waveIntensity, time, segmentOffset);
    let path = `M 0 ${baselineY}`;

    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      const scaledY = baselineY + Math.abs(point.y - baselineY);

      if (i === 0) {
        path += ` L ${point.x} ${scaledY}`;
      } else {
        const prevPoint = points[i - 1];
        const controlX = (prevPoint.x + point.x) / 2;
        path += ` Q ${controlX} ${scaledY} ${point.x} ${scaledY}`;
      }
    }

    path += ` L ${width} ${baselineY} Z`;
    return path;
  };

  // Animated props for each wave layer
  const aiWave1Props = useAnimatedProps(() => ({
    d: createAIWavePath(aiAmplitude1.value, aiTime.value, 3, 0),
  }));

  const aiWave2Props = useAnimatedProps(() => ({
    d: createAIWavePath(aiAmplitude2.value, aiTime.value, 4, 2.1),
  }));

  const aiWave3Props = useAnimatedProps(() => ({
    d: createAIWavePath(aiAmplitude3.value, aiTime.value, 5, 4.7),
  }));

  const aiWave4Props = useAnimatedProps(() => ({
    d: createAIWavePath(aiAmplitude4.value, aiTime.value, 6, 7.2),
  }));

  const userWave1Props = useAnimatedProps(() => ({
    d: createUserWavePath(userAmplitude1.value, userTime.value, 1, 3.5),
  }));

  const userWave2Props = useAnimatedProps(() => ({
    d: createUserWavePath(userAmplitude2.value, userTime.value, 4, 5.1),
  }));

  const userWave3Props = useAnimatedProps(() => ({
    d: createUserWavePath(userAmplitude3.value, userTime.value, 5, 7.7),
  }));

  const userWave4Props = useAnimatedProps(() => ({
    d: createUserWavePath(userAmplitude4.value, userTime.value, 6, 11.1),
  }));

  // Handle AI speaking animation
  useEffect(() => {
    if (isAISpeaking) {
      // Start time animation
      aiTime.value = withRepeat(
        withTiming(Math.PI * 4, { duration: 3000 }),
        -1,
        false
      );

      // Animate amplitudes
      aiAmplitude1.value = withRepeat(withTiming(55 + (aiAudioLevel * 55), { duration: 200 }), -1, true);
      aiAmplitude2.value = withRepeat(withTiming(80 + (aiAudioLevel * 83), { duration: 300 }), -1, true);
      aiAmplitude3.value = withRepeat(withTiming(135 + (aiAudioLevel * 86), { duration: 400 }), -1, true);
      aiAmplitude4.value = withRepeat(withTiming(155 + (aiAudioLevel * 90), { duration: 500 }), -1, true);
    } else {
      // Stop animations
      cancelAnimation(aiTime);
      aiAmplitude1.value = withTiming(0, { duration: 400 });
      aiAmplitude2.value = withTiming(0, { duration: 400 });
      aiAmplitude3.value = withTiming(0, { duration: 400 });
      aiAmplitude4.value = withTiming(0, { duration: 400 });
    }
  }, [isAISpeaking, aiAudioLevel]);

  // Handle User speaking animation
  useEffect(() => {
    if (isUserSpeaking) {
      // Start time animation
      userTime.value = withRepeat(
        withTiming(Math.PI * 4, { duration: 3000 }),
        -1,
        false
      );

      // Animate amplitudes
      userAmplitude1.value = withRepeat(withTiming(65 + (userAudioLevel * 60), { duration: 200 }), -1, true);
      userAmplitude2.value = withRepeat(withTiming(120 + (userAudioLevel * 83), { duration: 300 }), -1, true);
      userAmplitude3.value = withRepeat(withTiming(135 + (userAudioLevel * 86), { duration: 400 }), -1, true);
      userAmplitude4.value = withRepeat(withTiming(155 + (userAudioLevel * 90), { duration: 500 }), -1, true);
    } else {
      // Stop animations
      cancelAnimation(userTime);
      userAmplitude1.value = withTiming(0, { duration: 400 });
      userAmplitude2.value = withTiming(0, { duration: 400 });
      userAmplitude3.value = withTiming(0, { duration: 400 });
      userAmplitude4.value = withTiming(0, { duration: 400 });
    }
  }, [isUserSpeaking, userAudioLevel]);

  return (
    <View style={{
      width,
      height,
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <Svg width={width} height={height} style={{ position: 'absolute' }}>
        <Defs>
          {/* AI Gradients */}
          <LinearGradient id="aiGradient1" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#63b3ff" stopOpacity="0.9" />
            <Stop offset="40%" stopColor="#3b82f6" stopOpacity="0.7" />
            <Stop offset="70%" stopColor="#1d4ed8" stopOpacity="0.4" />
            <Stop offset="100%" stopColor="#1d4ed8" stopOpacity="0" />
          </LinearGradient>
          <LinearGradient id="aiGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#DF93FD" stopOpacity="0.8" />
            <Stop offset="30%" stopColor="#A963FF" stopOpacity="0.6" />
            <Stop offset="60%" stopColor="#893BF6" stopOpacity="0.3" />
            <Stop offset="100%" stopColor="#733BF6" stopOpacity="0" />
          </LinearGradient>
          <LinearGradient id="aiGradient3" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#FEBFF0" stopOpacity="0.7" />
            <Stop offset="25%" stopColor="#FD93CA" stopOpacity="0.5" />
            <Stop offset="50%" stopColor="#FF639F" stopOpacity="0.3" />
            <Stop offset="100%" stopColor="#D81D93" stopOpacity="0" />
          </LinearGradient>
          <LinearGradient id="aiGradient4" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#dbeafe" stopOpacity="0.6" />
            <Stop offset="20%" stopColor="#bfdbfe" stopOpacity="0.4" />
            <Stop offset="40%" stopColor="#93c5fd" stopOpacity="0.3" />
            <Stop offset="100%" stopColor="#1d4ed8" stopOpacity="0" />
          </LinearGradient>

          {/* User Gradients */}
          <LinearGradient id="userGradient1" x1="0%" y1="100%" x2="0%" y2="0%">
            <Stop offset="0%" stopColor="#4ade80" stopOpacity="0.9" />
            <Stop offset="40%" stopColor="#22c55e" stopOpacity="0.7" />
            <Stop offset="70%" stopColor="#16a34a" stopOpacity="0.4" />
            <Stop offset="100%" stopColor="#16a34a" stopOpacity="0" />
          </LinearGradient>
          <LinearGradient id="userGradient2" x1="0%" y1="100%" x2="0%" y2="0%">
            <Stop offset="0%" stopColor="#EFB386" stopOpacity="0.8" />
            <Stop offset="30%" stopColor="#DEA04A" stopOpacity="0.6" />
            <Stop offset="60%" stopColor="#C55822" stopOpacity="0.3" />
            <Stop offset="100%" stopColor="#C55822" stopOpacity="0" />
          </LinearGradient>
          <LinearGradient id="userGradient3" x1="0%" y1="100%" x2="0%" y2="0%">
            <Stop offset="0%" stopColor="#bbf7d0" stopOpacity="0.7" />
            <Stop offset="25%" stopColor="#86efac" stopOpacity="0.5" />
            <Stop offset="50%" stopColor="#4ade80" stopOpacity="0.3" />
            <Stop offset="100%" stopColor="#16a34a" stopOpacity="0" />
          </LinearGradient>
          <LinearGradient id="userGradient4" x1="0%" y1="100%" x2="0%" y2="0%">
            <Stop offset="0%" stopColor="#dcfce7" stopOpacity="0.6" />
            <Stop offset="20%" stopColor="#bbf7d0" stopOpacity="0.4" />
            <Stop offset="40%" stopColor="#86efac" stopOpacity="0.3" />
            <Stop offset="100%" stopColor="#16a34a" stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* AI Wave Layers */}
        <AnimatedPath animatedProps={aiWave4Props} fill="url(#aiGradient4)" />
        <AnimatedPath animatedProps={aiWave3Props} fill="url(#aiGradient3)" />
        <AnimatedPath animatedProps={aiWave2Props} fill="url(#aiGradient2)" />
        <AnimatedPath animatedProps={aiWave1Props} fill="url(#aiGradient1)" />

        {/* User Wave Layers */}
        <AnimatedPath animatedProps={userWave4Props} fill="url(#userGradient4)" />
        <AnimatedPath animatedProps={userWave3Props} fill="url(#userGradient3)" />
        <AnimatedPath animatedProps={userWave2Props} fill="url(#userGradient2)" />
        <AnimatedPath animatedProps={userWave1Props} fill="url(#userGradient1)" />
      </Svg>

      {/* Central Line */}
      <View style={{
        width: width * 0.9,
        height: 3,
        backgroundColor: '#ffffff',
        borderRadius: 2,
        shadowColor: '#ffffff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 12,
        elevation: 8,
      }} />
    </View>
  );
};

export default AIConversationWave;
