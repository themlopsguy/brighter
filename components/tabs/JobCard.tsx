// components/JobCard.tsx
import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  PrepTalkTheme,
  useResponsiveFontSize,
  useResponsiveSpacing,
  getResponsiveValue,
} from '@/constants/Theme';
import { Job } from '@/services/AuthTypes';
import { Ionicons } from '@expo/vector-icons';
import Swiper from 'react-native-deck-swiper';

interface JobCardProps {
  job: Job;
  onPress: (job: Job) => void;
  onApply?: (job: Job) => void;
  onSave?: (job: Job) => void;
  isSaved?: boolean;
}

export default function JobCard({ 
  job, 
  onPress, 
  onApply, 
  onSave, 
  isSaved = false 
}: JobCardProps) {
  const { width } = useWindowDimensions();
  
  // Responsive values
  const bodyFontSize = useResponsiveFontSize('body');
  const smallSpacing = useResponsiveSpacing('small');
  const mediumSpacing = useResponsiveSpacing('medium');

  const [logoError, setLogoError] = useState(false);

  // Custom responsive values
  const responsiveValues = {
    cardPadding: getResponsiveValue({
      small: 16,
      medium: 18,
      large: 20,
      xlarge: 22
    }),
    minCardHeight: getResponsiveValue({
      small: 440,
      medium: 600,
      large: 650,
      xlarge: 600
    }),
    topRowBottomPadding: getResponsiveValue({
      small: 10,
      medium: 12,
      large: 15,
      xlarge: 18
    }),
    industryFontSize: getResponsiveValue({
      small: 10,
      medium: 12,
      large: 12,
      xlarge: 16
    }),
    datePostedFontSize: getResponsiveValue({
      small: 10,
      medium: 12,
      large: 12,
      xlarge: 16
    }),
    logoSize: getResponsiveValue({
      small: 58,
      medium: 62,
      large: 66,
      xlarge: 66
    }),
    titleFontSize: getResponsiveValue({
      small: 16,
      medium: 18,
      large: 21,
      xlarge: 26
    }),
    titleLineHeight: getResponsiveValue({
      small: 20,
      medium: 24,
      large: 26,
      xlarge: 52
    }),
    companyNameFontSize: getResponsiveValue({
      small: 14,
      medium: 16,
      large: 18,
      xlarge: 20
    }),
    companyNameTopMargin: getResponsiveValue({
      small: 2,
      medium: 3,
      large: 3,
      xlarge: 3
    }),
    locationTopMargin: getResponsiveValue({
      small: 2,
      medium: 3,
      large: 3,
      xlarge: 3
    }),
    summaryTopPadding: getResponsiveValue({
      small: 8,
      medium: 10,
      large: 12,
      xlarge: 14
    }),
    summaryLineHeight: getResponsiveValue({
      small: 20,
      medium: 20,
      large: 20,
      xlarge: 20
    }),
    summaryLineNum: getResponsiveValue({
      small: 2,
      medium: 3,
      large: 3,
      xlarge: 3
    }),
    detailsTopMargin: getResponsiveValue({
      small: 15,
      medium: 18,
      large: 21,
      xlarge: 25
    }),
    detailsGap: getResponsiveValue({
      small: 10,
      medium: 12,
      large: 14,
      xlarge: 16
    }),
    detailBoxPaddingVertical: getResponsiveValue({
      small: 10,
      medium: 12,
      large: 14,
      xlarge: 16
    }),
    detailBoxPaddingHorizontal: getResponsiveValue({
      small: 24,
      medium: 30,
      large: 32,
      xlarge: 20
    }),
    detailBoxFontSize: getResponsiveValue({
      small: 14,
      medium: 18,
      large: 18,
      xlarge: 21
    }),
    experienceBoxPaddingVertical: getResponsiveValue({
      small: 10,
      medium: 12,
      large: 14,
      xlarge: 16
    }),
    experienceBoxPaddingHorizontal: getResponsiveValue({
      small: 14,
      medium: 16,
      large: 18,
      xlarge: 20
    }),
    experienceBoxFontSize: getResponsiveValue({
      small: 12,
      medium: 16,
      large: 16,
      xlarge: 15
    }),
    buttonHeight: getResponsiveValue({
      small: 32,
      medium: 76,
      large: 40,
      xlarge: 44
    }),
    buttonFontSize: getResponsiveValue({
      small: 12,
      medium: 20,
      large: 16,
      xlarge: 18
    }),
    cardMarginHorizontal: getResponsiveValue({
      small: 16,
      medium: 0,
      large: 0,
      xlarge: 28
    }),
    cardMarginVertical: getResponsiveValue({
      small: 90,
      medium: 120,
      large: 140,
      xlarge: 18
    })
  };

    const getCurrencySymbol = (currency: string | undefined): string => {
    if (!currency) return '$';
    
    const currencyMap: { [key: string]: string } = {
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'JPY': '¥',
        'CAD': 'C$',
        'AUD': 'A$',
        'CHF': 'CHF',
        'CNY': '¥',
        'INR': '₹',
        'KRW': '₩',
        'BRL': 'R$',
        'MXN': '$',
        'ZAR': 'R',
    };
    
    return currencyMap[currency.toUpperCase()] || currency;
    };

    const formatNumber = (value: string | undefined): string => {
    if (!value) return '';
    
    const num = parseFloat(value.replace(/,/g, '')); // Remove commas first
    if (isNaN(num)) return value; // Return original if not a valid number
    
    if (num >= 1000000) {
        return (num / 1000000).toFixed(num % 1000000 === 0 ? 0 : 1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(num % 1000 === 0 ? 0 : 1) + 'k';
    }
    
    return num.toString();
    };

  // Format salary display
    const formatSalary = (): string | null => {
        if (!job.salary_min && !job.salary_max) return null;
        
        const currencySymbol = getCurrencySymbol(job.salary_currency);
        
        if (job.salary_min && job.salary_max) {
            return `${currencySymbol}${formatNumber(job.salary_min)} - ${currencySymbol}${formatNumber(job.salary_max)}`;
        } else if (job.salary_min) {
            return `${currencySymbol}${formatNumber(job.salary_min)}`;
        } else if (job.salary_max) {
            return `Up to ${currencySymbol}${formatNumber(job.salary_max)}`;
        }
        
        return null;
    };

  // Format location display
  const formatLocation = (): string => {
    if (job.remote) {
      return job.job_location ? `${job.job_location} (Remote)` : 'Remote';
    }
    return job.job_location || 'Location not specified';
  };

  // Format date posted
  const formatDatePosted = (): string => {
    if (!job.date_posted) return '';
    
    const posted = new Date(job.date_posted);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - posted.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays <= 7) return `${diffDays} days ago`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  // Format experience required
  const formatExperience = (): string => {
    const exp = Number(job.experience);

    if (isNaN(exp)) return "None Specified";
    if (exp === 0) return "No experience required";
    if (exp <= 2) return "Early Career";
    if (exp > 2 && exp <= 6) return "Mid Career";
    if (exp > 6) return "Senior Level";

    return "None Specified";
  }

  // Get job type badge color
  const formatTimeArrangement = (): string => {
    switch (job.employment_type?.toLowerCase()) {
      case 'full_time':
        return 'Full Time';
      case 'part_time':
        return 'Part Time';
      case 'contract':
        return 'Contract';
      case 'internship':
        return 'Intern';
      default:
        return 'Full Time';
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.cardContainer,
        {
          marginHorizontal: responsiveValues.cardMarginHorizontal,
          marginVertical: responsiveValues.cardMarginVertical,
          padding: responsiveValues.cardPadding,
          minHeight: responsiveValues.minCardHeight,
        }
      ]}
      onPress={() => onPress(job)}
      activeOpacity={0.8}
    >
      {/* Subtle gradient background */}
      <LinearGradient
        colors={['#FFFFFF', '#FDFAED44']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Card Content */}
      <View style={styles.cardContent}>
        <View style={[styles.topRow, {paddingBottom: responsiveValues.topRowBottomPadding}]}>
            <Text style={[styles.industry, {fontSize: responsiveValues.industryFontSize}]}>
                {job.industry}
            </Text>
            <Text style={[styles.datePosted, {fontSize: responsiveValues.datePostedFontSize}]}>
                {formatDatePosted()}
            </Text>
        </View>
        {/* Header Row */}
        <View style={styles.headerRow}>
          {/* Company Logo */}
          <View style={[
            styles.logoContainer,
            {
              width: responsiveValues.logoSize,
              height: responsiveValues.logoSize,
            }
          ]}>
            {job.logo_url && !logoError ? (
            <Image
                source={{ uri: job.logo_url }}
                style={[styles.companyLogo, {
                width: responsiveValues.logoSize,
                height: responsiveValues.logoSize,
                }]}
                resizeMode="contain"
                onError={() => {
                console.warn('Logo failed to load:', job.company_name);
                setLogoError(true);
                }}
            />
            ) : (
              <View style={[
                styles.logoPlaceholder,
                {
                  width: responsiveValues.logoSize,
                  height: responsiveValues.logoSize,
                }
              ]}>
                <Text style={[
                  styles.logoText,
                  { fontSize: responsiveValues.logoSize * 0.4 }
                ]}>
                  {job.company_name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          {/* Job Info */}
          <View style={styles.jobInfo}>
            <Text
              style={[
                styles.jobTitle,
                { 
                  fontSize: responsiveValues.titleFontSize,
                  lineHeight: responsiveValues.titleLineHeight
                }
              ]}
              numberOfLines={2}
            >
              {job.job_title}
            </Text>

          </View>

          {/* Save Button
          {onSave && (
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => onSave(job)}
            >
              <Text style={[
                styles.saveIcon,
                { color: isSaved ? PrepTalkTheme.colors.primary : PrepTalkTheme.colors.mediumGray }
              ]}>
                {isSaved ? '★' : '☆'}
              </Text>
            </TouchableOpacity>
          )} */}
        </View>

        <Text
            style={[
            styles.companyName,
            { fontSize: responsiveValues.companyNameFontSize },
            { marginTop: responsiveValues.companyNameTopMargin}
            ]}
            numberOfLines={1}
        >
            {job.company_name}
        </Text>
        <View style={[styles.locationRow, {marginTop: responsiveValues.locationTopMargin}]}>
            <Ionicons 
                name="location" 
                size={bodyFontSize - 3} 
                color={PrepTalkTheme.colors.text + "99"} 
                style={styles.locationIcon}
            />
            <Text style={[styles.locationText, { fontSize: bodyFontSize - 5 }]}>
                {formatLocation()}
            </Text>
        </View>

        {/* Job Summary */}
        <View>
            {job.short_summary && (
            <Text
                style={[
                styles.summaryText,
                { 
                    fontSize: bodyFontSize - 3,
                    paddingTop: responsiveValues.summaryTopPadding,
                }
                ]}
                numberOfLines={(job.salary_min || job.salary_max) ? responsiveValues.summaryLineNum : 5}
            >
                {job.short_summary}
            </Text>
            )}
        </View>

        {/* Job Details */}
        <View style={[styles.detailsSection, {marginTop: responsiveValues.detailsTopMargin,
                                              gap: responsiveValues.detailsGap,
                                              paddingHorizontal: 15}]}>
            <View style={[styles.ArrangementRow]}>
                <View style={[styles.RemoteColumn, {paddingVertical: responsiveValues.detailBoxPaddingVertical,
                                                    paddingHorizontal: responsiveValues.detailBoxPaddingHorizontal,
                }]}>
                    <Ionicons 
                        name="earth-outline" 
                        size={responsiveValues.detailBoxFontSize} 
                        color={"#1E90FF"}
                        style={styles.ArrangementIcon}
                    />
                    <Text style={[
                        styles.jobTypeText,
                        {
                        fontSize: responsiveValues.detailBoxFontSize,
                        color: "#1E90FF"
                        }
                    ]}>
                        {job.work_arrangement}
                    </Text>
                </View>
                
                <View style={[styles.TimeColumn, {paddingVertical: responsiveValues.detailBoxPaddingVertical,
                                                  paddingHorizontal: responsiveValues.detailBoxPaddingHorizontal
                }]}>
                    <Ionicons 
                        name="hourglass-outline" 
                        size={responsiveValues.detailBoxFontSize} 
                        color={"#6F2DA8"}
                        style={styles.ArrangementIcon}
                    />
                    <Text style={[
                        styles.jobTypeText,
                        {
                        fontSize: responsiveValues.detailBoxFontSize,
                        color: "#6F2DA8"
                        }
                    ]}>
                        {formatTimeArrangement()}
                    </Text>
                </View>
            </View>
            

            {/* Salary */}
            {(job.salary_min || job.salary_max) && (
            <View style={[styles.SalaryRow]}>
                <View style={[styles.SalaryColumn, {paddingVertical: responsiveValues.detailBoxPaddingVertical,
                                                  paddingHorizontal: responsiveValues.detailBoxPaddingHorizontal}]}>
                    <Ionicons 
                    name="cash-outline" 
                    size={responsiveValues.detailBoxFontSize} 
                    color={'#1BBF1B'}
                    style={styles.SalaryIcon}
                    />
                    {formatSalary() && (
                    <View>
                        <Text style={[styles.salaryText, { fontSize: responsiveValues.detailBoxFontSize }]}>
                        {formatSalary()}
                        </Text>
                    </View>
                    )}
                </View>
            </View>
            )}

            <View style={[styles.ExperienceRow]}>
                <View style={[styles.ExperienceColumn, {paddingVertical: responsiveValues.experienceBoxPaddingVertical,
                                                  paddingHorizontal: responsiveValues.experienceBoxPaddingHorizontal
                }]}>
                    <Ionicons 
                        name="business-outline" 
                        size={responsiveValues.experienceBoxFontSize} 
                        color={"#FFA300"}
                        style={styles.ExperienceIcon}
                    />
                    {formatExperience() && (
                        <Text style={[styles.ExperienceText, { fontSize: responsiveValues.experienceBoxFontSize}]}>
                            {formatExperience()}
                        </Text>
                    )}
                </View>

                <View style={[styles.EducationColumn, {paddingVertical: responsiveValues.experienceBoxPaddingVertical,
                                                  paddingHorizontal: responsiveValues.experienceBoxPaddingHorizontal
                }]}>
                    <Ionicons 
                        name="school-outline" 
                        size={responsiveValues.experienceBoxFontSize} 
                        color={"#402F1D"}
                        style={styles.EducationIcon}
                    />
                    <Text style={[styles.EducationText, { fontSize: responsiveValues.experienceBoxFontSize}]}>
                        {job.education}
                    </Text>
                </View>
            </View>

        </View>
    </View>

            {/* Requirements Preview */}
            {/* {job.requirements && job.requirements.length > 0 && (
            <View style={[styles.requirementsContainer, { marginTop: smallSpacing }]}>
                <Text style={[styles.requirementsLabel, { fontSize: bodyFontSize - 4 }]}>
                Key Requirements:
                </Text>
                <Text
                style={[styles.requirementsText, { fontSize: bodyFontSize - 2 }]}
                numberOfLines={1}
                >
                {job.requirements.slice(0, 2).join(' • ')}
                {job.requirements.length > 2 ? ' • ...' : ''}
                </Text>
            </View>
            )} */}

        {/* Action Buttons
        {onApply && (
          <View style={[styles.actionRow, { marginTop: mediumSpacing }]}>
            <TouchableOpacity
              style={[
                styles.applyButton,
                { height: responsiveValues.buttonHeight,
                    width: responsiveValues.buttonHeight,
                    borderRadius: responsiveValues.buttonHeight / 2
                 }
              ]}
              onPress={() => onApply(job)}
            >
            <Image
                source={require('@/assets/images/apply/xmark.png')}
                style={{
                width: responsiveValues.buttonFontSize + 10,
                height: responsiveValues.buttonFontSize + 10,
                tintColor: "#FB7354", // This will make the image white to match your button text color
                }}
                resizeMode="contain"
            />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.applyButton,
                { height: responsiveValues.buttonHeight,
                    width: responsiveValues.buttonHeight,
                    borderRadius: responsiveValues.buttonHeight / 2
                 }
              ]}
              onPress={() => onApply(job)}
            >
            <Image
                source={require('@/assets/images/apply/paperplane.png')}
                style={{
                width: responsiveValues.buttonFontSize + 10,
                height: responsiveValues.buttonFontSize + 10,
                tintColor: "#1BBF1B", // This will make the image white to match your button text color
                }}
                resizeMode="contain"
            />
            </TouchableOpacity>
          </View>
        )} */}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    //marginVertical: 8,
    elevation: 2,
    shadowColor: PrepTalkTheme.colors.darkGray,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: PrepTalkTheme.colors.lightGray,
    overflow: 'hidden',
  },
  cardContent: {
    position: 'relative',
    zIndex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  industry: {
    fontFamily: "Nunito-Bold",
    color: PrepTalkTheme.colors.mediumGray,
    backgroundColor: PrepTalkTheme.colors.mediumGray + "20",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  datePosted: {
    fontFamily: "Nunito-Bold",
    color: PrepTalkTheme.colors.mediumGray,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  logoContainer: {
    marginRight: 12,
    overflow: 'hidden',
  },
  companyLogo: {
    borderRadius: 8,
  },
  logoPlaceholder: {
    backgroundColor: PrepTalkTheme.colors.lightGray,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontFamily: 'Lexend-Bold',
    color: PrepTalkTheme.colors.text,
  },
  jobInfo: {
    flex: 1,
    marginRight: 8,
  },
  jobTitle: {
    fontFamily: 'Lexend-Bold',
    color: PrepTalkTheme.colors.text,
  },
  companyName: {
    fontFamily: 'Lexend-SemiBold',
    color: PrepTalkTheme.colors.text,
  },
  detailsSection: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center'
    // borderWidth: 1,
    // borderRadius: 10,
    // borderColor: PrepTalkTheme.colors.mediumGray + '33'
  },
  detailTitle: {
    fontFamily: 'Lexend-SemiBold',
    color: PrepTalkTheme.colors.text + "88",
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    marginRight: 4,
  },
  locationText: {
    fontFamily: 'Lexend-Regular',
    color: PrepTalkTheme.colors.text + "99",
    flex: 1,
  },
  ArrangementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  RemoteColumn: {
    flexDirection: 'column',
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    //borderWidth: 2,
    //borderBottomWidth: 2,
    backgroundColor: "#1E90FF20",
    borderRadius: 10,
    borderColor: "#1E90FF"
  },
  TimeColumn: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    //borderWidth: 2,
    //borderBottomWidth: 2,
    backgroundColor: "#6F2DA820",
    borderRadius: 10,
    borderColor: "#6F2DA8"
  },
  ArrangementIcon: {

  },
  SalaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  SalaryColumn: {
    flexDirection: 'column',
    alignItems: 'center',
    alignSelf: 'center',
    alignContent: 'center',
    //borderWidth: 2,
    //borderBottomWidth: 2,
    backgroundColor: "#00D10020",
    borderRadius: 10,
    borderColor: "#00D100",
    width: '100%'
  },
  SalaryIcon: {

  },
  salaryText: {
    fontFamily: 'Lexend-SemiBold',
    color: '#1BBF1B',
    padding: 3
  },
  ExperienceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  ExperienceColumn: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    //borderWidth: 2,
    //borderBottomWidth: 2,
    backgroundColor: "#FFA30020",
    borderRadius: 10,
    borderColor: "#FFA300",
  },
  ExperienceIcon: {

  },
  ExperienceText: {
    fontFamily: 'Lexend-SemiBold',
    color: "#FFA300",
    padding: 3
  },
  EducationColumn: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    //borderWidth: 2,
    //borderBottomWidth: 2,
    backgroundColor: "#402F1D20",
    borderRadius: 10,
    borderColor: "#402F1D",
  },
  EducationIcon: {

  },
  EducationText: {
    fontFamily: 'Lexend-SemiBold',
    color: "#402F1D",
    padding: 3
  },
  jobTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  jobTypeText: {
    fontFamily: 'Lexend-SemiBold',
    textTransform: 'capitalize',
  },
  jobTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  jobTypeIcon: {
    padding: 3,
    marginRight: 5,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  salaryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },

  postedDate: {
    fontFamily: 'Nunito-Regular',
    color: PrepTalkTheme.colors.mediumGray,
  },
  summaryText: {
    marginTop: 10,
    fontFamily: 'Nunito-SemiBold',
    color: PrepTalkTheme.colors.text,
    borderTopWidth: 2,
    borderTopColor: PrepTalkTheme.colors.text + '25',
  },
  requirementsContainer: {
    backgroundColor: PrepTalkTheme.colors.lightGray,
    borderRadius: 8,
    padding: 8,
  },
  requirementsLabel: {
    fontFamily: 'Nunito-Bold',
    color: PrepTalkTheme.colors.mediumGray,
    marginBottom: 2,
  },
  requirementsText: {
    fontFamily: 'Nunito-Regular',
    color: PrepTalkTheme.colors.text,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 102,
  },
  applyButton: {
    backgroundColor: PrepTalkTheme.colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',

    // iOS shadow properties
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    
    // Android shadow property
    elevation: 8,
  },
  applyButtonText: {
    fontFamily: 'Nunito-Bold',
    color: PrepTalkTheme.colors.light,
  },
  viewButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: PrepTalkTheme.colors.primary,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewButtonText: {
    fontFamily: 'Nunito-Bold',
    color: PrepTalkTheme.colors.primary,
  },
});