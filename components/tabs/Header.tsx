// components/MyHeader.tsx
import { View, Text, Pressable, Image, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrepTalkTheme, useScreenSize, getResponsiveValue } from '@/constants/Theme';
import { BlurView } from 'expo-blur';
import { SwipeCounter } from './CounterIcons';
import { Ionicons } from '@expo/vector-icons';

export default function Header({ options, navigation }) {
  const insets = useSafeAreaInsets();

  // Mock data - replace with your actual swipe count logic
  const swipesLeft = 12; // This should come from your app state/context
  
  const handleSwipeCounterPress = () => {
    // Handle what happens when user taps the swipe counter
    // Maybe show a modal with swipe details, or navigate to a swipes page
    console.log('Swipe counter pressed!');
    // Example: navigation.navigate('SwipeDetails');
  };

const responsiveValues = {
    logoWidth: getResponsiveValue({
        small: 70,
        medium: 50,
        large: 50,
        xlarge: 130,
    }),
    logoHeight: getResponsiveValue({
        small: 30,
        medium: 50,
        large: 50,
        xlarge: 60,
    }),
    counterSize: getResponsiveValue({
        small: 32,
        medium: 36,
        large: 40,
        xlarge: 44,
    }),
}

  return (
    <BlurView 
      intensity={80} 
      style={[styles.headerContainer, { paddingTop: insets.top }]}
    >
      <View style={styles.headerContent}>
        {/* Left side - Token Counter */}
        <View style={styles.leftContainer}>
          <View style={styles.counterWrapper}>
            <SwipeCounter 
                swipesLeft={swipesLeft}
                onPress={handleSwipeCounterPress}
                size={responsiveValues.counterSize}
            />
          </View>
        </View>

        <View style={styles.logoContainer}>
          <Image 
            source={require('@/assets/images/logo.png')}
            style={[
              styles.centerLogo,
              {
                width: responsiveValues.logoWidth,
                height: responsiveValues.logoHeight,
              }
            ]}
            resizeMode="contain"
          />
        </View>
        {/* Right side - Settings Button */}
        <View style={styles.rightContainer}>
          <Pressable onPress={() => navigation.navigate('(tabs)/profile')} style={styles.settingsButton}>
            <Ionicons size={28} name="funnel" color={PrepTalkTheme.colors.primary} />
          </Pressable>
        </View>
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: 'transparent', // Very transparent
    borderBottomWidth: 0.5, 
    borderColor: 'rgba(120, 120, 120, 0.5)', // Semi-transparent border
    overflow: 'hidden', // Important for blur effect
  },
  headerContent: {
    height: 44, 
    alignItems: 'center', 
    justifyContent: 'center',
    flexDirection: 'row',
  },
  leftContainer: {
    flex: 1,
    alignItems: 'flex-start', // Align to the left
    justifyContent: 'center',
  },
    counterWrapper: {
    padding: 8, // Add padding around just the counter
    // Optional: Add margin instead if you prefer
    // margin: 8,
    },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightContainer: {
    flex: 1,
    alignItems: 'flex-end', // Align to the right
    justifyContent: 'center',
  },
  centerLogo: {
    // Remove position absolute since we're using flex layout
  },
  settingsButton: {
    // Remove position absolute since we're using flex layout now
    padding: 8, // Add padding for better touch area
    marginRight: 10
  },
  settingsIcon: {
    fontSize: 20, // Make the settings icon a bit larger
  },
});
