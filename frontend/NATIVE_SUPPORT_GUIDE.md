# Native Support Implementation Guide

This guide explains how to implement proper native support for Capacitor apps to fix top and bottom spacing issues.

## 🚀 Quick Start

### 1. Import Native Support Utilities

```typescript
import { 
  isNative, 
  getNativeContainerStyles, 
  getNativeContentStyles, 
  getNativeButtonStyles, 
  getNativeFormStyles, 
  getNativeCardStyles,
  getNativeTypographyStyles 
} from "@/utils/nativeSupport";
```

### 2. Apply Native Container Styles

Replace your main container with:

```typescript
// Before
<Box component="main" sx={{ minHeight: "100vh", bgcolor: 'background.default' }}>

// After
<Box component="main" sx={getNativeContainerStyles()}>
```

### 3. Apply Native Content Styles

Replace your content container with:

```typescript
// Before
<Box sx={{ p: 2, maxWidth: 500, mx: 'auto', mt: 2 }}>

// After
<Box sx={getNativeContentStyles()}>
```

## 📱 Key Features

### Safe Area Support
- **Top safe area**: Handles notches and status bars
- **Bottom safe area**: Handles home indicators and navigation bars
- **Left/Right safe areas**: Handles landscape orientations

### Touch Optimization
- **Minimum touch targets**: 44px for iOS, 48px for Android
- **Proper spacing**: Adequate spacing between interactive elements
- **Hover states**: Optimized for touch devices

### Responsive Design
- **Mobile-first**: Optimized for mobile devices
- **Breakpoint system**: Consistent across all components
- **Flexible layouts**: Adapts to different screen sizes

## 🛠️ Implementation Examples

### Basic Page Layout

```typescript
import { getNativeContainerStyles, getNativeContentStyles } from "@/utils/nativeSupport";

const MyPage = () => {
  return (
    <Box component="main" sx={getNativeContainerStyles()}>
      <Header />
      <Box sx={getNativeContentStyles()}>
        <Card sx={getNativeCardStyles()}>
          {/* Your content */}
        </Card>
      </Box>
    </Box>
  );
};
```

### Form Components

```typescript
import { getNativeFormStyles, getNativeTypographyStyles } from "@/utils/nativeSupport";

const MyForm = () => {
  return (
    <Box>
      <Typography sx={getNativeTypographyStyles('h6')}>
        Form Title
      </Typography>
      <TextField
        fullWidth
        sx={getNativeFormStyles()}
        // ... other props
      />
    </Box>
  );
};
```

### Button Components

```typescript
import { getNativeButtonStyles } from "@/utils/nativeSupport";

const MyButton = () => {
  return (
    <Button
      variant="contained"
      sx={getNativeButtonStyles('primary')}
      // ... other props
    >
      Click Me
    </Button>
  );
};
```

## 🎨 Available Utilities

### Container Styles
- `getNativeContainerStyles()` - Main page container with safe areas
- `getNativeContentStyles(headerHeight?)` - Content container with proper spacing

### Component Styles
- `getNativeButtonStyles(variant)` - Button styles (primary, secondary, danger)
- `getNativeFormStyles(isDisabled?)` - Form field styles
- `getNativeCardStyles()` - Card component styles

### Typography Styles
- `getNativeTypographyStyles(variant)` - Typography styles (h1-h6, body1, body2)

### Utility Functions
- `isNative` - Boolean indicating if running on native platform
- `hasSafeAreas()` - Check if device has safe areas
- `getNativeBreakpoints()` - Responsive breakpoints

## 🔧 Customization

### Custom Header Height

```typescript
// For custom header height
<Box sx={getNativeContentStyles(80)}> // 80px header
```

### Custom Container Styles

```typescript
// Add custom styles
<Box sx={getNativeContainerStyles({ 
  bgcolor: 'custom.background' 
})}>
```

### Custom Button Variants

```typescript
// Create custom button styles
const customButtonStyles = {
  ...getNativeButtonStyles('primary'),
  background: 'linear-gradient(45deg, #custom1, #custom2)',
};
```

## 📋 Migration Checklist

For each component, ensure:

- [ ] Import native support utilities
- [ ] Replace main container with `getNativeContainerStyles()`
- [ ] Replace content container with `getNativeContentStyles()`
- [ ] Apply `getNativeButtonStyles()` to all buttons
- [ ] Apply `getNativeFormStyles()` to all form fields
- [ ] Apply `getNativeTypographyStyles()` to all text
- [ ] Test on both iOS and Android devices
- [ ] Verify safe areas work correctly
- [ ] Check touch targets are adequate

## 🐛 Common Issues & Solutions

### Issue: Content hidden behind status bar
**Solution**: Use `getNativeContainerStyles()` which includes safe area padding

### Issue: Buttons too small to tap
**Solution**: Use `getNativeButtonStyles()` which includes minimum touch target size

### Issue: Form fields hard to interact with
**Solution**: Use `getNativeFormStyles()` which includes proper touch targets

### Issue: Text too small on mobile
**Solution**: Use `getNativeTypographyStyles()` which includes responsive font sizes

## 📱 Testing

### iOS Testing
- Test on devices with notches (iPhone X and newer)
- Test on devices without notches (iPhone 8 and older)
- Test in both portrait and landscape orientations

### Android Testing
- Test on devices with different screen sizes
- Test on devices with navigation bars
- Test on devices with different Android versions

## 🎯 Best Practices

1. **Always use native utilities** for consistent behavior
2. **Test on real devices** not just simulators
3. **Consider different orientations** and screen sizes
4. **Maintain touch targets** of at least 44px
5. **Use semantic HTML** for better accessibility
6. **Test with different users** to ensure usability

## 📚 Additional Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Material Design Guidelines](https://material.io/design)
- [Safe Area Insets Guide](https://webkit.org/blog/7929/designing-websites-for-iphone-x/)

---

**Note**: This guide ensures your app works perfectly on native devices with proper safe area handling, touch optimization, and responsive design.
