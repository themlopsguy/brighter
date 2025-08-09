import { Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

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