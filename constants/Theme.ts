import { Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useWindowDimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Universal screen size breakpoints (based on iOS standards)
export const SCREEN_BREAKPOINTS = {
  small: { maxHeight: 800, maxWidth: 400 },   // iPhone SE, iPhone 12 mini
  medium: { maxHeight: 900, maxWidth: 430 },  // iPhone 12, iPhone 13, iPhone 14
  large: { maxHeight: 1000, maxWidth: 450 },  // iPhone 14 Pro, iPhone 15, iPhone 16
  xlarge: { maxHeight: Infinity, maxWidth: Infinity }, // iPhone Pro Max, Plus models
};

// Screen size types
export type ScreenSize = 'small' | 'medium' | 'large' | 'xlarge';

// Hook to get current screen size
export const useScreenSize = (): ScreenSize => {
  const { height, width } = useWindowDimensions();
  
  //console.log(`Height: ${height}, Width: ${width}`); // Debug log
  
  if (height <= SCREEN_BREAKPOINTS.small.maxHeight && width <= SCREEN_BREAKPOINTS.small.maxWidth) {
    return 'small';
  } else if (height <= SCREEN_BREAKPOINTS.medium.maxHeight && width <= SCREEN_BREAKPOINTS.medium.maxWidth) {
    return 'medium';
  } else if (height <= SCREEN_BREAKPOINTS.large.maxHeight && width <= SCREEN_BREAKPOINTS.large.maxWidth) {
    return 'large';
  } else {
    return 'xlarge';
  }
};

// Helper function to get values based on screen size
export const getResponsiveValue = <T>(values: {
  small: T;
  medium?: T;
  large?: T;
  xlarge?: T;
}): T => {
  const screenSize = useScreenSize();
  
  // Fallback logic: if specific size not provided, use the closest smaller one
  switch (screenSize) {
    case 'small':
      return values.small;
    case 'medium':
      return values.medium ?? values.small;
    case 'large':
      return values.large ?? values.medium ?? values.small;
    case 'xlarge':
      return values.xlarge ?? values.large ?? values.medium ?? values.small;
    default:
      return values.small;
  }
};

// Pre-defined responsive values for common use cases
export const RESPONSIVE_VALUES = {
  // Font sizes
  fontSize: {
    title: {
      small: 22,
      medium: 26,
      large: 28,
      xlarge: 32,
    },
    subtitle: {
      small: 12,
      medium: 14,
      large: 16,
      xlarge: 18,
    },
    body: {
      small: 14,
      medium: 16,
      large: 18,
      xlarge: 20,
    },
    button: {
      small: 16,
      medium: 18,
      large: 20,
      xlarge: 22,
    },
  },
  
  // Padding and margins
  spacing: {
    small: {
      small: 12,
      medium: 16,
      large: 20,
      xlarge: 24,
    },
    medium: {
      small: 20,
      medium: 24,
      large: 28,
      xlarge: 32,
    },
    large: {
      small: 32,
      medium: 40,
      large: 48,
      xlarge: 56,
    },
  },
  
  // Header padding
  headerPadding: {
    small: 40,
    medium: 50,
    large: 60,
    xlarge: 70,
  },
};

// Debug helper to see current device categorization
export const useDeviceInfo = () => {
  const { height, width } = useWindowDimensions();
  const screenSize = useScreenSize();
  
  return {
    screenSize,
    dimensions: { height, width },
    deviceType: (() => {
      if (height <= 800) return 'Small Device (SE/Mini)';
      if (height <= 900) return 'Standard Device (12/13/14)';
      if (height <= 1000) return 'Pro Device (15/16)';
      return 'Pro Max/Plus Device';
    })(),
  };
};

// Convenience hooks
export const useResponsiveFontSize = (type: keyof typeof RESPONSIVE_VALUES.fontSize) => {
  return getResponsiveValue(RESPONSIVE_VALUES.fontSize[type]);
};

export const useResponsiveSpacing = (size: keyof typeof RESPONSIVE_VALUES.spacing) => {
  return getResponsiveValue(RESPONSIVE_VALUES.spacing[size]);
};

export const useResponsiveHeaderPadding = () => {
  return getResponsiveValue(RESPONSIVE_VALUES.headerPadding);
};

export const PrepTalkTheme = {
  // Colors
  colors: {
    primary: '#F2BD2C',     // Saffron - primary brand color
    secondary: '#EBCA47',   // Naples Yellow - secondary brand color  
    accent: '#EB5160',      // Indian Red - accent color for contrast
    background: '#FDFAED',  // Floral White - light background (replaces white)
    text: '#2D3142',        // Gunmetal - dark text color (replaces black)

    gradientBackground: {
      colors: [
        '#F2BD2C44', // Top-left   
        '#EBCA4744', // Middle
        '#EB516044',
        '#FDFAED44', // Bottom-right
        
      ],
      opacity: 0.1,
      start: { x: 0, y: 0 },     // Top-left corner
      end: { x: 1, y: 1 },       // Bottom-right corner
      locations: [0, 0.05, 0.4, 0.8],    // Color distribution (subtle transitions)
    },

    // Semantic color mappings for easy reference
    light: '#FDFAED',       // Floral White - for elements that need light color
    dark: '#2D3142',        // Gunmetal - for elements that need dark color
    
    // Additional brand variations (tints and shades of your main colors)
    // Saffron variations
    primaryLight: '#F5C94A',   // Lighter saffron
    primaryDark: '#D4A024',    // Darker saffron
    
    // Naples Yellow variations  
    secondaryLight: '#EED165', // Lighter naples yellow
    secondaryDark: '#C8AD3C',  // Darker naples yellow
    
    // Indian Red variations
    accentLight: '#EE6B78',    // Lighter indian red
    accentDark: '#C8434F',     // Darker indian red
    
    // Neutral variations for UI elements
    lightGray: '#F7F4EC',      // Very light tint of floral white
    mediumGray: '#8B8F9A',     // Mid-tone between light and dark
    darkGray: '#1F2129',       // Darker tint of gunmetal
    
    // Tomato variations
    lightTomato: '#FFD9D4',  // rgb(255, 217, 212)
    mediumTomato: '#F36350', // rgb(243, 99, 80) 
    darkTomato: '#D94033',   // rgb(217, 64, 51)
  },
  // Typography
  typography: {
    mega: {
      fontSize: 60,
      fontWeight: '900', // heavy equivalent
    },
    title: {
      fontSize: 40,
      fontWeight: 'bold',
    },
    headline: {
      fontSize: 20,
      fontWeight: '600', // semibold equivalent
    },
    midHeadline: {
      fontSize: 25,
      fontWeight: '600',
    },
    biggerHeadline: {
      fontSize: 30,
      fontWeight: '600',
    },
    subheadline: {
      fontSize: 18,
      fontWeight: '400', // regular equivalent
    },
    body: {
      fontSize: 16,
      fontWeight: '400',
    },
    boldBody: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    caption: {
      fontSize: 14,
      fontWeight: '400',
    },
    boldCaption: {
      fontSize: 14,
      fontWeight: 'bold',
    },
    footnote: {
      fontSize: 13,
      fontWeight: '400',
    },
    micro: {
      fontSize: 10,
      fontWeight: 'bold',
    },
  },
  
  // Metrics
  metrics: {
    cornerRadius: 12,
    padding: 24,
    
    // Layout Constants
    metricsRowWidth: screenWidth - 64, // Equivalent to your UIScreen calculation
    
    // Responsive variant
    get metricsRowWidthCompact() {
      return screenWidth < 375 ? 300 : this.metricsRowWidth;
    },
  },

  // Screen dimensions (helpful for React Native)
  screen: {
    width: screenWidth,
    height: screenHeight,
    breakpoints: SCREEN_BREAKPOINTS,
    useScreenSize,
    getResponsiveValue,
    useResponsiveFontSize,
    useResponsiveSpacing,
    useResponsiveHeaderPadding,
    useDeviceInfo,
  },

  // Gradients
  gradients: {
    main: {
      colors: ['#FA7043', '#4577DB'], // mainOrange to mainBlue
      start: { x: 0, y: 0 },          // topLeading equivalent
      end: { x: 1, y: 1 },            // bottomTrailing equivalent
    },
  },
};

// Helper function to get gradient colors array
export const getMainGradientColors = () => PrepTalkTheme.gradients.main.colors;

// Helper function to get gradient props for LinearGradient component
export const getMainGradientProps = () => ({
  colors: PrepTalkTheme.gradients.main.colors,
  start: PrepTalkTheme.gradients.main.start,
  end: PrepTalkTheme.gradients.main.end,
});