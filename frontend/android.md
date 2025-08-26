

add in  root build.gradle  

in blueScript add this 

ext {
        minSdkVersion = 23
        compileSdkVersion = 36   // ⬅️ bump here
        targetSdkVersion = 35    // keep for now (Play Store requires upgrade only when publishing)
        kotlin_version = '1.9.25'
    }

in dependencies replace this or add

 classpath 'com.android.tools.build:gradle:8.12.1'   // ⬅️ upgrade AGP

classpath 'com.google.gms:google-services:4.4.3'





in variable.gradle  replace current with 

ext {
    minSdkVersion = 23
    compileSdkVersion = 36
    targetSdkVersion = 35
    androidxActivityVersion = '1.9.2'
    androidxAppCompatVersion = '1.7.0'
    androidxCoordinatorLayoutVersion = '1.2.0'
    androidxCoreVersion = '1.15.0'
    androidxFragmentVersion = '1.8.4'
    coreSplashScreenVersion = '1.0.1'
    androidxWebkitVersion = '1.12.1'
    junitVersion = '4.13.2'
    androidxJunitVersion = '1.2.1'
    androidxEspressoCoreVersion = '3.6.1'
    cordovaAndroidVersion = '10.1.1'
}



In app level
build.gradle add in depenecies

    implementation platform('com.google.firebase:firebase-bom:34.1.0')
    implementation 'com.google.firebase:firebase-analytics'

At bottom add this:
apply plugin: 'com.google.gms.google-services'
add  in version       
versionCode 17



add this into java main captivity



import android.os.Bundle; // 👈 THIS IS REQUIRED

import com.getcapacitor.BridgeActivity;

import com.codetrixstudio.capacitor.GoogleAuth.GoogleAuth;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Register plugin
    registerPlugin(GoogleAuth.class);
  }

}

