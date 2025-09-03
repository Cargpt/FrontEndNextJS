# Status Bar Theme Management

This document explains how the status bar theme management works in the AI Car Advisor app.

## Overview

The app now automatically changes the status bar appearance on mobile devices based on the selected theme:
- **Dark Mode**: Blue-tinted status bar with dark background
- **Light Mode**: Red-tinted status bar with light background

## How It Works

### 1. Automatic Theme Detection
- The app detects when you switch between light and dark themes
- Status bar colors and icon styles automatically update
- Works on both Android and iOS devices

### 2. Color Scheme
- **Dark Theme**: 
  - Background: `#1a1a2e` (dark blue)
  - Icons: Blue-tinted appearance
  - Style: Dark mode
  
- **Light Theme**:
  - Background: `#fff5f5` (light red)
  - Icons: Red-tinted appearance
  - Style: Light mode

### 3. Platform-Specific Optimizations
- **Android**: Uses custom background colors for better icon visibility
- **iOS**: Leverages native status bar styling
- **Web**: No status bar changes (desktop/mobile web)

## Components

### StatusBarManager (`/utils/statusBarManager.ts`)
- Singleton class for managing status bar appearance
- Handles platform-specific implementations
- Provides methods for custom color control

### StatusBar Component (`/components/common/StatusBar.tsx`)
- React component for status bar integration
- Provides proper spacing and overlays
- Only renders on native platforms

### useStatusBar Hook (`/hooks/useStatusBar.ts`)
- Custom hook for status bar management
- Automatically syncs with theme changes
- Provides manual control methods

## Usage

### Automatic (Recommended)
The status bar automatically updates when you change themes. No additional code needed.

### Manual Control
```typescript
import { useStatusBar } from '@/hooks/useStatusBar';

const MyComponent = () => {
  const { setTheme, setCustomColors, currentTheme } = useStatusBar();
  
  // Change to specific theme
  const handleThemeChange = () => {
    setTheme('dark'); // or 'light'
  };
  
  // Set custom colors
  const handleCustomColors = () => {
    setCustomColors('#ff0000', 'light'); // Red background, light icons
  };
  
  return (
    <div>
      <p>Current theme: {currentTheme}</p>
      <button onClick={handleThemeChange}>Toggle Theme</button>
    </div>
  );
};
```

## Configuration

### Capacitor Config
The `capacitor.config.ts` file includes status bar settings:
```typescript
StatusBar: {
  backgroundColor: '#ffffff',
  style: 'DARK',
  overlaysWebView: true,
  androidStyle: 'DARK',
  iosStyle: 'DARK'
}
```

### CSS Integration
Status bar styles are defined in `/styles/statusBar.css`:
- Proper spacing for safe areas
- Theme-specific background gradients
- Platform-specific optimizations

## Troubleshooting

### Status Bar Not Changing
1. Ensure you're testing on a native device (not web)
2. Check that Capacitor StatusBar plugin is installed
3. Verify theme changes are working in the app

### Icons Not Visible
1. Check if status bar is overlaying the webview
2. Ensure proper contrast between background and icons
3. Test on different device orientations

### Platform-Specific Issues
- **Android**: May require app restart after theme changes
- **iOS**: Status bar changes are immediate
- **Web**: No status bar functionality

## Dependencies

- `@capacitor/status-bar`: Native status bar control
- `@capacitor/core`: Platform detection
- Material-UI: Theme context integration

## Future Enhancements

- Custom status bar icon colors
- Animated theme transitions
- Platform-specific color schemes
- Accessibility improvements
