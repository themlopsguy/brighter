// constants/Config.ts
import Constants from 'expo-constants';

// For development, try to load from process.env first
const config = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || Constants.expoConfig?.extra?.supabaseUrl,
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || Constants.expoConfig?.extra?.supabaseAnonKey,
  supabasePublishableKey: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || Constants.expoConfig?.extra?.supabasePublishableKey,
  superwallIosApiKey: process.env.SUPERWALL_IOS_API_KEY || Constants.expoConfig?.extra?.superwallIosApiKey,
  superwallAndroidApiKey: process.env.SUPERWALL_ANDROID_API_KEY || Constants.expoConfig?.extra?.superwallAndroidApiKey,
  revenueCatApiKey: process.env.REVENUE_CAT_API_KEY || Constants.expoConfig?.extra?.revenueCatApiKey,
  mixpanelToken: process.env.MIXPANEL_TOKEN || Constants.expoConfig?.extra?.mixpanelToken,
  googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY || Constants.expoConfig?.extra?.googlePlacesApiKey
};

// Debug logging to see what we're getting
console.log('DEBUG Config:', {
  supabaseUrl: config.supabaseUrl ? 'SET' : 'NOT SET',
  supabaseAnonKey: config.supabaseAnonKey ? 'SET' : 'NOT SET',
  supabasePublishableKey: config.supabasePublishableKey ? 'SET' : 'NOT SET',
  superwallIosApiKey: config.superwallIosApiKey ? 'SET' : 'NOT SET',
  superwallAndroidApiKey: config.superwallAndroidApiKey ? 'SET' : 'NOT SET',
  googlePlacesApiKey: config.googlePlacesApiKey ? 'SET' : 'NOT SET'
});

// Validate required config
if (!config.supabaseUrl) {
  throw new Error('supabaseUrl is required. Check your .env file and ensure EXPO_PUBLIC_SUPABASE_URL is set.');
}

if (!config.supabaseAnonKey) {
  throw new Error('supabaseAnonKey is required. Check your .env file and ensure EXPO_PUBLIC_SUPABASE_ANON_KEY is set.');
}

if (!config.supabasePublishableKey) {
  throw new Error('supabasePublishableKey is required. Check your .env file and ensure EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY is set.');
}

export default config;