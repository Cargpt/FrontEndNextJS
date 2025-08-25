import { SocialLogin } from '@capgo/capacitor-social-login'

await SocialLogin.initialize({
  google: {
    webClientId: 'YOUR_WEB_CLIENT_ID',        // Required for Android and Web
    iOSClientId: 'YOUR_IOS_CLIENT_ID',        // Required for iOS  
    iOSServerClientId: 'YOUR_WEB_CLIENT_ID',  // Required for iOS offline mode (same as webClientId)
    mode: 'online',  // 'online' or 'offline'
  }
});

export async function loginWithGoogle() {
  const result = await SocialLogin.login({
    provider: 'google',
    options: {
      scopes: ['email', 'profile']
    }
  })
  console.log('Google login result:', result)
}
