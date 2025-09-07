// import { useFonts } from 'expo-font';
// import { Stack } from 'expo-router';
// import { StatusBar } from 'expo-status-bar';
// import * as SplashScreen from 'expo-splash-screen';
// import { useEffect } from 'react';
// import 'react-native-reanimated';
// import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import config from '@/constants/Config';
// import { SuperwallProvider } from "expo-superwall";
// import { AuthProvider } from '@/services/AuthContext';
// import { JobsProvider } from '@/services/JobsContext';

// // Prevent the splash screen from auto-hiding
// SplashScreen.preventAutoHideAsync();

// export default function RootLayout() {
//   const [loaded] = useFonts({
//     'Lexend-Black': require('../assets/fonts/lexend/Lexend-Black.ttf'),
//     'Lexend-Bold': require('../assets/fonts/lexend/Lexend-Bold.ttf'),
//     'Lexend-ExtraBold': require('../assets/fonts/lexend/Lexend-ExtraBold.ttf'),
//     'Lexend-Light': require('../assets/fonts/lexend/Lexend-Light.ttf'),
//     'Lexend-Medium': require('../assets/fonts/lexend/Lexend-Medium.ttf'),
//     'Lexend-Regular': require('../assets/fonts/lexend/Lexend-Regular.ttf'),
//     'Lexend-SemiBold': require('../assets/fonts/lexend/Lexend-SemiBold.ttf'),
//     'Lexend-Thin': require('../assets/fonts/lexend/Lexend-Thin.ttf'),
//     'Lexend-ExtraLight': require('../assets/fonts/lexend/Lexend-ExtraLight.ttf'),
    
//     'Nunito-Black': require('../assets/fonts/nunito/Nunito-Black.ttf'),
//     'Nunito-Bold': require('../assets/fonts/nunito/Nunito-Bold.ttf'),
//     'Nunito-ExtraBold': require('../assets/fonts/nunito/Nunito-ExtraBold.ttf'),
//     'Nunito-Light': require('../assets/fonts/nunito/Nunito-Light.ttf'),
//     'Nunito-Medium': require('../assets/fonts/nunito/Nunito-Medium.ttf'),
//     'Nunito-Regular': require('../assets/fonts/nunito/Nunito-Regular.ttf'),
//     'Nunito-SemiBold': require('../assets/fonts/nunito/Nunito-SemiBold.ttf'),
//   });

//   useEffect(() => {
//     if (loaded) {
//       SplashScreen.hideAsync();
//     }
//   }, [loaded]);

//   if (!loaded) {
//     return null;
//   }

//   return (
//     <SuperwallProvider apiKeys={{ ios: config.superwallIosApiKey, android: config.superwallAndroidApiKey }}>
//     <GestureHandlerRootView style={{ flex: 1 }}>
//     <AuthProvider>
//       <JobsProvider>
//         <Stack>
//           {/* Welcome screen - the initial route when app opens */}
//           <Stack.Screen name="index" options={{ headerShown: false }} />
//           <Stack.Screen name="intro" options={{ headerShown: false }} />
//           <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          
//           {/* Auth modal - slides up from bottom */}
//           {/* <Stack.Screen
//             name="authModal"
//             options={{
//               presentation: 'modal',
//               headerShown: false,
//             }}
//           /> */}
          
//           {/* Keep tabs for future authenticated screens */}
//           <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          
//           <Stack.Screen name="+not-found" />
//         </Stack>
//         <StatusBar style="auto" />
//       </JobsProvider>
//     </AuthProvider>
//     </GestureHandlerRootView>
//     </SuperwallProvider>
//   );
// }

import { Stack } from 'expo-router';

export default function RootLayout() {
  return <Stack />;
}