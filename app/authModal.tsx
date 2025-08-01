// // Create this file: app/authModal.tsx

// import React from 'react';
// import { 
//   View, 
//   Text, 
//   StyleSheet, 
//   SafeAreaView, 
//   TouchableOpacity 
// } from 'react-native';
// import { router } from 'expo-router';
// import { PrepTalkTheme } from '@/constants/Theme';
// import GoogleIcon from '@/components/GoogleIcon';
// import AppleIcon from '@/components/AppleIcon';
// import { Ionicons } from '@expo/vector-icons';
// import { useAuth } from '@/services/AuthContext';

// export default function AuthModal() {
//   const { signInWithApple, signInWithGoogle } = useAuth();

//   const handleAppleSignIn = async () => {
//     try {
//       console.log('Apple Sign In pressed');
//       const success = await signInWithApple();
//       if (success) {
//         router.dismiss(); // Dismiss modal
//         router.push('/onboarding');
//       }
//     } catch (error) {
//       console.log('Apple Sign In error:', error);
//       // TODO: Show error message to user
//     }
//   };

//   const handleGoogleSignIn = async () => {
//     try {
//       console.log('Google Sign In pressed');
//       const success = await signInWithGoogle();
//       if (success) {
//         router.dismiss(); // Dismiss modal
//         router.push('/onboarding');
//       }
//     } catch (error) {
//       console.log('Google Sign In error:', error);
//       // TODO: Show error message to user
//     }
//   };

//   const handleEmailSignIn = () => {
//     console.log('Continue with email pressed');
//     router.push('/emailSignInModal');
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.content}>
//         {/* Modal Header */}
//         <View style={styles.modalHeader}>
//           <Text style={styles.modalTitle}>Sign in to continue</Text>
//         </View>
        
//         <View style={styles.divider} />

//         {/* Auth Buttons */}
//         <View style={styles.authButtonsContainer}>
//           {/* Apple Sign In */}
//           <TouchableOpacity 
//             style={styles.appleAuthButton}
//             onPress={handleAppleSignIn}
//             activeOpacity={0.8}
//           >
//             <View style={styles.appleButtonContent}>
//               <AppleIcon 
//                 width={60} 
//                 height={60} 
//                 style={styles.appleIcon}
//               />
//               <Text style={styles.appleAuthButtonText}>
//                 Sign in with Apple
//               </Text>
//             </View>
//           </TouchableOpacity>

//           {/* Google Sign In */}
//           <TouchableOpacity 
//             style={styles.googleAuthButton}
//             onPress={handleGoogleSignIn}
//             activeOpacity={0.8}
//           >
//             <View style={styles.googleButtonContent}>
//               <GoogleIcon 
//                 width={40} 
//                 height={40} 
//                 style={styles.googleIcon}
//               />
//               <Text style={styles.googleAuthButtonText}>
//                 Sign in with Google
//               </Text>
//             </View>
//           </TouchableOpacity>

//           {/* Email Sign In */}
//           <TouchableOpacity 
//             style={styles.primaryAuthButton}
//             onPress={handleEmailSignIn}
//             activeOpacity={0.8}
//           >
//             <View style={styles.emailButtonContent}>
//               <Ionicons 
//                 name="mail-outline" 
//                 size={30} 
//                 color={PrepTalkTheme.colors.dark}
//                 style={styles.emailIcon}
//               />
//               <Text style={styles.primaryAuthButtonText}>
//                 Continue with email
//               </Text>
//             </View>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#FFFFFF',
//   },
//   content: {
//     flex: 1,
//     paddingTop: 20,
//   },
//   modalHeader: {
//     alignItems: 'center',
//     paddingTop: 24,
//     paddingBottom: 10,
//   },
//   modalTitle: {
//     ...PrepTalkTheme.typography.headline,
//     color: PrepTalkTheme.colors.text,
//     marginBottom: 8,
//     fontFamily: 'Lexend-Bold',
//   },
//   divider: {
//     height: 0.5,
//     backgroundColor: PrepTalkTheme.colors.mediumGray,
//     opacity: 0.3,
//     width: '100%',
//     marginBottom: 24,
//   },
//   authButtonsContainer: {
//     gap: 16,
//     paddingHorizontal: PrepTalkTheme.metrics.padding,
//   },

//   // Apple Button Styles
//   appleAuthButton: {
//     backgroundColor: '#000000',
//     paddingVertical: 0,
//     paddingHorizontal: PrepTalkTheme.metrics.padding,
//     borderRadius: 50,
//     alignItems: 'center',
//   },
//   appleButtonContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'flex-start',
//     width: '100%',
//   },
//   appleIcon: {
//     marginRight: 0,
//     marginLeft: PrepTalkTheme.metrics.padding * 0.45,
//   },
//   appleAuthButtonText: {
//     ...PrepTalkTheme.typography.headline,
//     color: '#FFFFFF',
//     fontFamily: 'Lexend-Medium',
//     flex: 1,
//     textAlign: 'center',
//     marginRight: PrepTalkTheme.metrics.padding * 2.35,
//   },

//   // Google Button Styles
//   googleAuthButton: {
//     backgroundColor: '#FFFFFF',
//     paddingVertical: 8,
//     paddingHorizontal: PrepTalkTheme.metrics.padding,
//     borderRadius: 50,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: PrepTalkTheme.colors.mediumGray,
//   },
//   googleButtonContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'flex-start',
//     width: '100%',
//   },
//   googleIcon: {
//     marginRight: 0,
//     marginLeft: PrepTalkTheme.metrics.padding * 0.75,
//   },
//   googleAuthButtonText: {
//     ...PrepTalkTheme.typography.headline,
//     color: PrepTalkTheme.colors.text,
//     fontFamily: 'Lexend-Medium',
//     flex: 1,
//     textAlign: 'center',
//     marginRight: PrepTalkTheme.metrics.padding * 1.25,
//   },

//   // Email Button Styles
//   primaryAuthButton: {
//     backgroundColor: "#FFFFFF",
//     paddingVertical: 12,
//     paddingHorizontal: 24,
//     borderRadius: 50,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: PrepTalkTheme.colors.primary,
//   },
//   emailButtonContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'flex-start',
//     width: '100%',
//   },
//   emailIcon: {
//     marginLeft: '7%',
//     marginRight: 0,
//   },
//   primaryAuthButtonText: {
//     ...PrepTalkTheme.typography.headline,
//     color: PrepTalkTheme.colors.dark,
//     fontFamily: 'Lexend-Medium',
//     flex: 1,
//     textAlign: 'center',
//     marginRight: '7%',
//   },
// });