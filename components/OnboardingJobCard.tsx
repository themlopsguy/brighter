// components/OnboardingJobCard.tsx

import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions, Image, ImageSourcePropType } from 'react-native';
import { PrepTalkTheme } from '@/constants/Theme';

interface OnboardingJobCardProps {
  position: string;
  company: string;
  logo?: ImageSourcePropType;
  logoWidth?: number; // Optional logo width
  logoHeight?: number; // Optional logo height
}

export default function OnboardingJobCard({ position, company, logo, logoWidth, logoHeight }: OnboardingJobCardProps) {
  const { height } = useWindowDimensions();


  return (
    <View style={[styles.container, {width: height < 700 ? 120 : 150, 
                                     height: height < 700 ? 65 : 80,
                                     borderRadius: height < 700 ? 10 : 15,
                                     paddingVertical: height < 700 ? 6 : 6
    }]}>
      <View style={styles.content}>
        {/* Text Content */}
        <View style={styles.textSection}>
          <View style={styles.positionRow}>
            <Text style={[styles.position, {fontSize: height < 700 ? 10 : 12}]} numberOfLines={1}>
              {position}
            </Text>
            {logo && (
              <Image 
                source={logo} 
                style={[
                  styles.logo,
                  {
                    width: logoWidth || (height < 700 ? 18 : 24), // Use custom width or default
                    height: logoHeight || (height < 700 ? 18 : 24), // Use custom height or default
                  }
                ]}
                resizeMode="contain"
              />
            )}
          </View>
          <Text style={[styles.company, {fontSize: height < 700 ? 8 : 10}]} numberOfLines={1}>
            {company}
          </Text>
        </View>
        {/* Gray Rectangles */}
        <View style={styles.rectanglesContainer}>
          <View style={[
            styles.rectangle,
            {
              width: height < 700 ? 55 : 85,
              height: height < 700 ? 3 : 4,
            }
          ]} />
          <View style={[
            styles.rectangle,
            {
              width: height < 700 ? 40 : 60,
              height: height < 700 ? 3 : 4,
            }
          ]} />
          <View style={[
            styles.rectangle,
            {
              width: height < 700 ? 70 : 100,
              height: height < 700 ? 3 : 4,
            }
          ]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  
  container: {
    backgroundColor: '#FFFFFF',
    //borderRadius: 20,
    paddingHorizontal: 12,
    //paddingVertical: 6,
    marginHorizontal: 6,
    marginVertical: 6,
    // shadowColor: '#000',
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    // elevation: 3,
    // borderWidth: 1,
    // borderColor: 'rgba(184, 184, 184, 0.6)',
    //width: 150,
    //height: 80,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  textSection: {
    alignItems: 'flex-start',
  },
  positionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  position: {
    fontFamily: 'Lexend-SemiBold',
    color: PrepTalkTheme.colors.text,
    marginBottom: 2,
    flex: 1, // Allow text to take available space
    marginRight: 4, // Small gap before logo
  },
  logo: {
    borderRadius: 2,
  },
  company: {
    fontFamily: 'Nunito-Medium',
    color: PrepTalkTheme.colors.mediumGray,
  },
  rectanglesContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
    marginTop: 4,
  },
  rectangle: {
    backgroundColor: '#D1D5DB', // Gray color
    borderRadius: 2,
  },
});