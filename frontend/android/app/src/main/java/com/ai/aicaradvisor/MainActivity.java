package com.ai.aicaradvisor;
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

