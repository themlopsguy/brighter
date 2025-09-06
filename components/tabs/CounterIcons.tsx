import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

interface SwipeCounterProps {
  swipesLeft: number;
  onPress: () => void;
  size?: number;
}

// Custom Image Counter with your PNG
export const SwipeCounter: React.FC<SwipeCounterProps> = ({ 
  swipesLeft, 
  onPress, 
  size = 40
}) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View style={[styles.counterContainer, { width: size, height: size }]}>
        <Image 
          source={require('@/assets/images/apply/swipe-count-icon.png')}
          style={[styles.iconImage, { width: size, height: size }]}
          resizeMode="contain"
        />
        <View style={styles.textOverlay}>
          <Text style={[styles.counterText, { fontSize: size * 0.3 }]}>
            {swipesLeft}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconImage: {
    // The background PNG image
  },
  textOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterText: {
    color: '#FFFFFF', // White text - adjust color based on your PNG design
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

// Usage example component
export const SwipeCounterExample: React.FC = () => {
  const swipesLeft = 12;
  
  const handlePress = () => {
    console.log('Swipe counter pressed!');
    // Show swipes remaining modal or tooltip
  };

  return (
    <View style={{ 
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      backgroundColor: '#f5f5f5',
    }}>
      <SwipeCounter swipesLeft={swipesLeft} onPress={handlePress} size={40} />
    </View>
  );
};