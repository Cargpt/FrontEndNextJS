import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ai.aicaradvisor',
  appName: 'aicaradvisor',
  webDir: 'out', // for `next export`
  
  plugins: {
    SplashScreen: {
      launchAutoHide: false, // allows you to control when to hide
      backgroundColor: '#1876d2',
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true,
      showSpinner: false
    },
    StatusBar: {
      backgroundColor: '#ffffff',
      style: 'DARK',
      overlaysWebView: false
    },
    GoogleAuth: {
      scopes: ["profile", "email" ],
      clientId: '573020465331-7ptc73n5ko9pndtab7fnppgn3k5l7fhi.apps.googleusercontent.com', // Web Client ID                    //for Dev
      serverClientId: '573020465331-7ptc73n5ko9pndtab7fnppgn3k5l7fhi.apps.googleusercontent.com', // Web Client ID for server auth  //for Dev
      forceCodeForRefreshToken: true,
    
    }

  //     GoogleAuth: {
  //   scopes: ['profile', 'email'],
  //   serverClientId: '431860020742-j9j18g9a4jmd2fsc55qo1gf2esajb5sa.apps.googleusercontent.com',
  //   forceCodeForRefreshToken: true,
  // }

  }
}; 

export default config;
