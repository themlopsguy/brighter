// app/index.tsx
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Animated, 
  Image,
  useWindowDimensions,
  TextInput,
  Keyboard
} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { router } from 'expo-router';
import { PrepTalkTheme } from '@/constants/Theme';
import GoogleIcon from '@/components/GoogleIcon';  // Add this
import AppleIcon from '@/components/AppleIcon';    // Add this
import { Ionicons } from '@expo/vector-icons';     // Add this
import { useAuth } from '@/services/AuthContext';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';

export default function WelcomeScreen() {
  const player = useVideoPlayer(require('../assets/videos/brighter_welcome.mp4'), player => {
    player.loop = true;
    player.play();
    player.muted = true;
  });

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentScreen, setCurrentScreen] = useState<'auth' | 'emailSignIn' | 'emailSignUp'>('auth');
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const { signInWithApple, signInWithGoogle, signIn, signUp, userProfile, authState } = useAuth();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['50%'], []);
  const { height, width } = useWindowDimensions();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const emailInputRef = useRef<TextInput>(null);
  const signUpEmailInputRef = useRef<TextInput>(null);
  const [signInError, setSignInError] = useState('');
  const [signUpError, setSignUpError] = useState('');
  
  const words = [
    "job market",
    "apply process", 
    "prep method",
    "success plan",
    "future"
  ];

    const handleGetStarted = useCallback(() => {
        bottomSheetRef.current?.expand();
    }, []);

    const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
    
    // If sheet is closed (index -1), reset to auth screen and clear form data
    if (index === -1) {
        Keyboard.dismiss();
        setCurrentScreen('auth');
        slideAnim.setValue(0); // Reset animation position
        
        // Clear all form fields
        setEmail('');
        setPassword('');
        setSignUpEmail('');
        setSignUpPassword('');
        setConfirmPassword('');
        setIsSigningIn(false);
        setIsSigningUp(false);

        // Clear error states
        setSignInError('');
        setSignUpError('');
    }
    }, [slideAnim]);

    const handleClosePress = useCallback(() => {
        Keyboard.dismiss();
    bottomSheetRef.current?.close();
    // Reset to auth screen when sheet is dismissed
    setCurrentScreen('auth');
    slideAnim.setValue(0); // Reset animation position
    
    // Clear all form fields
    setEmail('');
    setPassword('');
    setSignUpEmail('');
    setSignUpPassword('');
    setConfirmPassword('');
    setIsSigningIn(false);
    setIsSigningUp(false);

    // Clear error states
    setSignInError('');
    setSignUpError('');
    }, [slideAnim]);

    const slideToEmailScreen = useCallback(() => {
    // First change the screen state to trigger height change
    setCurrentScreen('emailSignIn');
    
    // Then slide to email screen
    Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
    }).start(() => {
        // Focus on email input after animation completes
        setTimeout(() => {
            emailInputRef.current?.focus();
        }, 100);
    });
    }, [slideAnim]);

    const slideBackToAuthScreen = useCallback(() => {
        Keyboard.dismiss();
    // First slide back
    Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
    }).start(() => {
        // Then change screen state to shrink height
        setCurrentScreen('auth');
    });
    }, [slideAnim]);

    const slideToSignUpScreen = useCallback(() => {
    setCurrentScreen('emailSignUp');
    
    // Slide from emailSignIn (value 1) to emailSignUp (value 2)
    Animated.timing(slideAnim, {
        toValue: 2,
        duration: 300,
        useNativeDriver: true,
    }).start(() => {
        // Focus on email input after animation completes
        setTimeout(() => {
            signUpEmailInputRef.current?.focus();
        }, 100);
    });
    }, [slideAnim]);

    const slideBackToSignInScreen = useCallback(() => {
    // Slide back from emailSignUp (value 2) to emailSignIn (value 1)
    Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
    }).start(() => {
        setCurrentScreen('emailSignIn');
    });
    }, [slideAnim]);

    const handleEmailSignIn = useCallback(async () => {
    if (!email || !password) {
        setSignInError('Please enter both email and password');
        return;
    }
    
    // Clear any previous errors
    setSignInError('');
    
    try {
        setIsSigningIn(true);
        console.log('Signing in with email:', email);
        await signIn(email, password); // This uses your existing auth context
        
        // If we get here, sign-in was successful
        handleClosePress();
        //router.push('/onboarding');
    } catch (error: any) {
        console.log('Email sign in error:', error);
        
        // Set user-friendly error message
        if (error.message.includes('Invalid login credentials') || error.message.includes('USER_NOT_FOUND')) {
        setSignInError('Invalid email or password');
        } else if (error.message.includes('Email not confirmed')) {
        setSignInError('Please check your email and confirm your account');
        } else {
        setSignInError('Sign in failed. Please try again.');
        }
    } finally {
        setIsSigningIn(false);
    }
    }, [email, password, signIn]);

    const handleEmailSignUp = useCallback(async () => {
    if (!signUpEmail || !signUpPassword || !confirmPassword) {
        setSignUpError('Please fill in all fields');
        return;
    }
    
    if (signUpPassword !== confirmPassword) {
        setSignUpError('Passwords do not match');
        return;
    }
    
    if (signUpPassword.length < 6) {
        setSignUpError('Password must be at least 6 characters');
        return;
    }
    
    // Clear any previous errors
    setSignUpError('');
    
    try {
        setIsSigningUp(true);
        console.log('Signing up with email:', signUpEmail);
        await signUp(signUpEmail, signUpPassword);
        
        // If we get here, sign-up was successful
        handleClosePress();
        //router.push('/onboarding');
    } catch (error: any) {
        console.log('Email sign up error:', error);
        
        // Set user-friendly error message
        if (error.message.includes('User already registered') || error.message.includes('already registered')) {
        setSignUpError('An account with this email already exists');
        } else if (error.message.includes('Invalid email')) {
        setSignUpError('Please enter a valid email address');
        } else if (error.message.includes('Password')) {
        setSignUpError('Password must be at least 6 characters');
        } else {
        setSignUpError('Sign up failed. Please try again.');
        }
    } finally {
        setIsSigningUp(false);
    }
    }, [signUpEmail, signUpPassword, confirmPassword, signUp]);

  useEffect(() => {
    const animateWords = () => {
      // Animate out: fade + rotate + translate up
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 30,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Switch to next word (while invisible)
        setCurrentWordIndex((prevIndex) => 
          prevIndex === words.length - 1 ? 0 : prevIndex + 1
        );
        
        // Reset animations for incoming word
        rotateAnim.setValue(1);
        translateYAnim.setValue(30);
        scaleAnim.setValue(0.8);
        
        // Animate in: fade + rotate + translate + bounce
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(translateYAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
        ]).start();
      });
    };

    // Start the animation cycle
    const interval = setInterval(animateWords, 2500);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [fadeAnim, rotateAnim, translateYAnim, scaleAnim, words.length]);

  // Calculate rotation interpolation
  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-15deg', '0deg', '15deg'],
  });
  
  return (
    <>
    <SafeAreaView style={styles.container}>
      <VideoView
        style={styles.backgroundVideo}
        player={player}
        allowsFullscreen={false}
        allowsPictureInPicture={false}
        contentFit="cover"
        nativeControls={false}
      />

      <View style={styles.overlay} />

      <View style={styles.content}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Image 
            source={require('../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <View style={styles.welcomeTextContainer}>
            <Text style={styles.welcomeText}>
              Welcome to a brighter
            </Text>
            <Animated.View 
              style={[
                styles.animatedWordContainer,
                {
                  opacity: fadeAnim,
                  transform: [
                    { rotate: rotateInterpolate },
                    { translateY: translateYAnim },
                    { scale: scaleAnim },
                  ],
                }
              ]}
            >
              <Text style={[styles.welcomeText, styles.animatedWordText]}>
                {words[currentWordIndex]}
              </Text>
            </Animated.View>
          </View>
        </View>

        {/* Main Content Section */}
        <View style={styles.mainSection}>
        </View>

        {/* Footer Section with Get Started button */}
        <View style={styles.footerSection}>
          <TouchableOpacity 
            style={styles.getStartedButton}
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            <Text style={styles.getStartedButtonText}>
              Get Started
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
        <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        enableDynamicSizing={true}
        onChange={handleSheetChanges}
        enablePanDownToClose={true}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.bottomSheetIndicator}
        handleStyle={{ display: 'none' }}
        animationConfigs={{
        stiffness: 100,    // Slower start
        damping: 35,       // Less bouncy
        mass: 1.2,         // Slightly heavier
        duration: 400,     // Longer duration
        }}
        backdropComponent={(props) => (
            <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            onPress={handleClosePress}
            opacity={0.1}
            />
        )}
        >
            <BottomSheetView style={[styles.bottomSheetContent, { 
            height: currentScreen === 'emailSignIn' || currentScreen === 'emailSignUp' ? height * 0.9 : height / 2 
            }]}>
        <View style={styles.slidingContainer}>
            <Animated.View 
                style={[
                styles.screenContainer,
                {
                    transform: [{
                    translateX: slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -width] // Slide left off screen
                    })
                    }]
                }
                ]}
            >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sign in to continue</Text>
            </View>
            
            <View style={styles.divider} />

            {/* Auth Buttons */}
            <View style={styles.authButtonsContainer}>
            {/* Apple Sign In */}
            <TouchableOpacity 
                style={styles.appleAuthButton}
                onPress={async () => {
                try {
                    console.log('Apple Sign In pressed');
                    const success = await signInWithApple();
                    if (success) {
                    handleClosePress();
                    //router.push('/onboarding');
                    }
                } catch (error) {
                    console.log('Apple Sign In error:', error);
                }
                }}
                activeOpacity={0.8}
            >
                <View style={styles.appleButtonContent}>
                <AppleIcon 
                    width={60} 
                    height={60} 
                    style={styles.appleIcon}
                />
                <Text style={styles.appleAuthButtonText}>
                    Sign in with Apple
                </Text>
                </View>
            </TouchableOpacity>

            {/* Google Sign In */}
            <TouchableOpacity 
                style={styles.googleAuthButton}
                onPress={async () => {
                try {
                    console.log('Google Sign In pressed');
                    const success = await signInWithGoogle();
                    if (success) {
                    handleClosePress();
                    //router.push('/onboarding');
                    }
                } catch (error) {
                    console.log('Google Sign In error:', error);
                }
                }}
                activeOpacity={0.8}
            >
                <View style={styles.googleButtonContent}>
                <GoogleIcon 
                    width={40} 
                    height={40} 
                    style={styles.googleIcon}
                />
                <Text style={styles.googleAuthButtonText}>
                    Sign in with Google
                </Text>
                </View>
            </TouchableOpacity>

            {/* Email Sign In */}
            <TouchableOpacity 
                style={styles.primaryAuthButton}
                onPress={() => {
                console.log('Continue with email pressed');
                slideToEmailScreen();
                }}
                activeOpacity={0.8}
            >
                <View style={styles.emailButtonContent}>
                <Ionicons 
                    name="mail-outline" 
                    size={30} 
                    color={PrepTalkTheme.colors.dark}
                    style={styles.emailIcon}
                />
                <Text style={styles.primaryAuthButtonText}>
                    Continue with email
                </Text>
                </View>
            </TouchableOpacity>
            </View>
            </Animated.View>
            {/* Email Screen */}
            <Animated.View 
              style={[
                styles.screenContainer,
                {
                  backgroundColor: '#FFFFF', // Temporary background to see it
                  transform: [{
                    translateX: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [width, 0] // Slide in from right
                    })
                  }]
                }
              ]}
            >
            <View style={styles.modalHeader}>
            <TouchableOpacity 
                style={styles.backButton}
                onPress={slideBackToAuthScreen}
            >
                <Ionicons name="arrow-back" size={24} color={PrepTalkTheme.colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Sign in with email</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.emailFormContainer}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                ref={emailInputRef}
                style={styles.textInput}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor={PrepTalkTheme.colors.mediumGray}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                autoFocus={currentScreen === 'emailSignIn'}
                />
            </View>
            
            {/* Password Input */}
            <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput
                style={styles.textInput}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor={PrepTalkTheme.colors.mediumGray}
                secureTextEntry={true}
                autoComplete="password"
                />
            </View>

            {/* Error Message */}
            {signInError ? (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{signInError}</Text>
            </View>
            ) : null}
            
            {/* Sign In Button */}
            <TouchableOpacity 
            style={styles.signInButton}
            onPress={handleEmailSignIn}
            disabled={isSigningIn}
            >
            <Text style={styles.signInButtonText}>
                {isSigningIn ? 'Signing In...' : 'Sign In'}
            </Text>
            </TouchableOpacity>
            
            {/* Sign Up Link */}
            <TouchableOpacity 
            style={styles.signUpLink}
            onPress={slideToSignUpScreen}
            >
            <Text style={styles.signUpLinkText}>Don't have an account? Sign Up</Text>
            </TouchableOpacity>
            </View>
            </Animated.View>

            {/* Email Sign Up Screen */}
            <Animated.View 
            style={[
                styles.screenContainer,
                {
                transform: [{
                    translateX: slideAnim.interpolate({
                    inputRange: [0, 1, 2],
                    outputRange: [width * 2, width, 0] // Start off-screen right, slide in
                    })
                }]
                }
            ]}
            >
            <View style={styles.modalHeader}>
                <TouchableOpacity 
                style={styles.backButton}
                onPress={slideBackToSignInScreen}
                >
                <Ionicons name="arrow-back" size={24} color={PrepTalkTheme.colors.text} />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Create account</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.emailFormContainer}>
                {/* Email Input */}
                <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                ref={signUpEmailInputRef}
                style={styles.textInput}
                value={signUpEmail}
                onChangeText={setSignUpEmail}
                placeholder="Enter your email"
                placeholderTextColor={PrepTalkTheme.colors.mediumGray}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                autoFocus={currentScreen === 'emailSignUp'}
                />
                </View>
                
                {/* Password Input */}
                <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput
                    style={styles.textInput}
                    value={signUpPassword}
                    onChangeText={setSignUpPassword}
                    placeholder="Create a password"
                    placeholderTextColor={PrepTalkTheme.colors.mediumGray}
                    secureTextEntry={true}
                    autoComplete="new-password"
                />
                </View>

                {/* Confirm Password Input */}
                <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <TextInput
                    style={styles.textInput}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm your password"
                    placeholderTextColor={PrepTalkTheme.colors.mediumGray}
                    secureTextEntry={true}
                    autoComplete="new-password"
                />
                </View>

                {/* Error Message */}
                {signUpError ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{signUpError}</Text>
                </View>
                ) : null}
                
                {/* Sign Up Button */}
                <TouchableOpacity 
                style={styles.signInButton}
                onPress={handleEmailSignUp}
                disabled={isSigningUp}
                >
                <Text style={styles.signInButtonText}>
                    {isSigningUp ? 'Creating Account...' : 'Sign Up'}
                </Text>
                </TouchableOpacity>
            </View>
            </Animated.View>
        </View>
        </BottomSheetView>
        </BottomSheet>
    </>
  );
}

// Copy your existing styles here (same as before)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PrepTalkTheme.colors.background,
    zIndex: 0
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    zIndex: 0,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: PrepTalkTheme.metrics.padding,
    zIndex: 2,
  },
  headerSection: {
    flex: 0.4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 60,
    marginBottom: 0,
  },
  mainSection: {
    flex: 0.4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerSection: {
    flex: 0.2,
    justifyContent: 'flex-end',
    paddingBottom: 40,
  },
  welcomeTextContainer: {
    alignItems: 'center',
  },
  welcomeText: {
    fontFamily: 'Lexend-Bold',
    fontSize: 40,
    color: PrepTalkTheme.colors.light,
    textAlign: 'center',
  },
  animatedWordContainer: {
    backgroundColor: `${PrepTalkTheme.colors.primary}E6`,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 4,
  },
  animatedWordText: {
    marginBottom: 0,
    textShadowColor: 'transparent',
  },
  getStartedButton: {
    backgroundColor: PrepTalkTheme.colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  getStartedButtonText: {
    ...PrepTalkTheme.typography.headline,
    color: '#FFFFFF',
    fontWeight: '600',
  },
bottomSheetBackground: {
  backgroundColor: '#FFFFFF',
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: -2,
  },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  elevation: 8,
},
bottomSheetContent: {
  flex: 1,
  paddingTop: 0,
  zIndex: 999,
},
  modalHeader: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 10,
  },
  modalTitle: {
    ...PrepTalkTheme.typography.headline,
    color: PrepTalkTheme.colors.text,
    marginBottom: 8,
    fontFamily: 'Lexend-Bold',
  },
  divider: {
    height: 0.5,
    backgroundColor: PrepTalkTheme.colors.mediumGray,
    opacity: 0.3,
    width: '100%',
    marginBottom: 20,
  },
  authButtonsContainer: {
    gap: 16,
    paddingHorizontal: PrepTalkTheme.metrics.padding,
  },

  // Apple Button Styles
  appleAuthButton: {
    backgroundColor: '#000000',
    paddingVertical: 0,
    paddingHorizontal: PrepTalkTheme.metrics.padding,
    borderRadius: 50,
    alignItems: 'center',
  },
  appleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
  },
  appleIcon: {
    marginRight: 0,
    marginLeft: PrepTalkTheme.metrics.padding * 0.45,
  },
  appleAuthButtonText: {
    ...PrepTalkTheme.typography.headline,
    color: '#FFFFFF',
    fontFamily: 'Lexend-Medium',
    flex: 1,
    textAlign: 'center',
    marginRight: PrepTalkTheme.metrics.padding * 2.35,
  },

  // Google Button Styles
  googleAuthButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: PrepTalkTheme.metrics.padding,
    borderRadius: 50,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: PrepTalkTheme.colors.mediumGray,
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
  },
  googleIcon: {
    marginRight: 0,
    marginLeft: PrepTalkTheme.metrics.padding * 0.75,
  },
  googleAuthButtonText: {
    ...PrepTalkTheme.typography.headline,
    color: PrepTalkTheme.colors.text,
    fontFamily: 'Lexend-Medium',
    flex: 1,
    textAlign: 'center',
    marginRight: PrepTalkTheme.metrics.padding * 1.25,
  },

  // Email Button Styles
  primaryAuthButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 50,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: PrepTalkTheme.colors.primary,
  },
  emailButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
  },
  emailIcon: {
    marginLeft: '7%',
    marginRight: 0,
  },
  primaryAuthButtonText: {
    ...PrepTalkTheme.typography.headline,
    color: PrepTalkTheme.colors.dark,
    fontFamily: 'Lexend-Medium',
    flex: 1,
    textAlign: 'center',
    marginRight: '7%',
  },
  // email sign in / sign up
slidingContainer: {
  flex: 1,
  position: 'relative', // Allow absolute positioning of children
},
screenContainer: {
  position: 'absolute',
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: '100%',
},
backButton: {
  position: 'absolute',
  left: 20,
  top: 20,
  padding: 8,
},
emailFormContainer: {
  paddingHorizontal: PrepTalkTheme.metrics.padding,
  //paddingTop: 0,
  gap: 20,
},
inputContainer: {
  gap: 8,
},
inputLabel: {
  fontSize: 16,
  fontFamily: 'Lexend-Medium',
  color: PrepTalkTheme.colors.text,
},
signInButton: {
  backgroundColor: PrepTalkTheme.colors.primary,
  paddingVertical: 16,
  paddingHorizontal: 32,
  borderRadius: 25,
  alignItems: 'center',
  marginTop: 0,
},
signInButtonText: {
  ...PrepTalkTheme.typography.headline,
  color: '#FFFFFF',
  fontFamily: 'Lexend-Medium',
},
signUpLink: {
  alignItems: 'center',
  paddingVertical: 16,
},
signUpLinkText: {
  ...PrepTalkTheme.typography.body,
  color: PrepTalkTheme.colors.mediumGray,
  fontFamily: 'Nunito-Bold',
},
textInput: {
  backgroundColor: '#F8F9FA',
  borderWidth: 1,
  borderColor: PrepTalkTheme.colors.mediumGray,
  borderRadius: 12,
  paddingHorizontal: 16,
  paddingVertical: 14,
  fontSize: 16,
  fontFamily: 'Nunito-Regular',
  color: PrepTalkTheme.colors.text,
},
errorContainer: {
  backgroundColor: '#FEF2F2',
  borderWidth: 1,
  borderColor: '#FECACA',
  borderRadius: 8,
  paddingHorizontal: 12,
  paddingVertical: 10,
  //marginTop: 0,
},
errorText: {
  color: '#DC2626',
  fontSize: 14,
  fontFamily: 'Nunito-Regular',
  textAlign: 'center',
},
});