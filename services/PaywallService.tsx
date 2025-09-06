// import Superwall from '@superwall/react-native-superwall';
// import config from '@/constants/Config';

// class PaywallService {
//   private static instance: PaywallService;
//   private isInitialized = false;

//   static getInstance(): PaywallService {
//     if (!PaywallService.instance) {
//       PaywallService.instance = new PaywallService();
//     }
//     return PaywallService.instance;
//   }

//   async initialize() {
//     if (this.isInitialized) return;

//     try {
//       await Superwall.configure(config.superwallApiKey);
//       this.isInitialized = true;
//       console.log('Superwall initialized successfully');
//     } catch (error) {
//       console.error('Failed to initialize Superwall:', error);
//     }
//   }

//   async presentPaywall(event: string, params?: Record<string, any>) {
//     if (!this.isInitialized) {
//       await this.initialize();
//     }

//     try {
//       const result = await Superwall
//       return result;
//     } catch (error) {
//       console.error('Failed to present paywall:', error);
//       throw error;
//     }
//   }

//   setUserAttributes(attributes: Record<string, any>) {
//     Superwall.setUserAttributes(attributes);
//   }
// }

// export default PaywallService.getInstance();