import { Capacitor } from '@capacitor/core';

/**
 * Native Support Utilities for Capacitor Apps
 * Handles safe areas, status bars, and native-specific styling
 */

export const isNative = Capacitor.isNativePlatform();

/**
 * Get safe area padding for native devices
 * Note: With edge-to-edge plugin, safe areas are handled automatically
 */
export const getSafeAreaPadding = () => {
  // Edge-to-edge plugin handles safe areas automatically
  return {};
};

/**
 * Get container styles optimized for native devices
 */
export const getNativeContainerStyles = (additionalStyles = {}) => {
  const baseStyles = {
    minHeight: '100vh',
    bgcolor: 'background.default',
    ...getSafeAreaPadding(),
  };

  return { ...baseStyles, ...additionalStyles };
};

/**
 * Get content container styles with proper spacing for native header
 * Note: With edge-to-edge plugin, safe areas are handled automatically
 */
export const getNativeContentStyles = (headerHeight = 56, additionalStyles = {}) => {
  const baseStyles = {
    p: { xs: 2, sm: 3 },
    maxWidth: { xs: '100%', sm: 500, md: 600 },
    mx: 'auto',
    mt: { xs: 2, sm: 3 },
    // Edge-to-edge plugin handles safe areas automatically
    pt: '10px',
    pb: '20px',
    minHeight: { xs: 'calc(100vh - 80px)', sm: 'calc(100vh - 100px)' },
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  };

  return { ...baseStyles, ...additionalStyles };
};

/**
 * Get button styles optimized for touch devices
 */
export const getNativeButtonStyles = (variant: 'primary' | 'secondary' | 'danger' = 'primary') => {
  const baseStyles = {
    py: { xs: 1.5, sm: 2 },
    borderRadius: 2,
    textTransform: 'none',
    fontWeight: 600,
    fontSize: { xs: '14px', sm: '16px' },
    minHeight: '44px', // iOS recommended touch target
    transition: 'all 0.2s ease-in-out',
  };

  const variantStyles = {
    primary: {
      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
      '&:hover': {
        background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
        boxShadow: '0 6px 16px rgba(59, 130, 246, 0.4)',
        transform: 'translateY(-1px)',
      },
    },
    secondary: {
      borderColor: 'grey.300',
      color: 'grey.700',
      '&:hover': {
        borderColor: 'grey.400',
        backgroundColor: 'grey.50',
        transform: 'translateY(-1px)',
      },
    },
    danger: {
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
      '&:hover': {
        background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
        boxShadow: '0 6px 16px rgba(239, 68, 68, 0.4)',
        transform: 'translateY(-1px)',
      },
    },
  };

  return { ...baseStyles, ...variantStyles[variant] };
};

/**
 * Get form field styles optimized for native devices
 */
export const getNativeFormStyles = (isDisabled = false) => {
  return {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      backgroundColor: isDisabled ? 'grey.50' : 'white',
      minHeight: '48px', // Better touch target
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: 'primary.main',
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: 'primary.main',
        borderWidth: 2,
      },
    },
  };
};

/**
 * Get card styles optimized for native devices
 */
export const getNativeCardStyles = (additionalStyles = {}) => {
  const baseStyles = {
    borderRadius: 3,
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    border: '1px solid',
    borderColor: 'divider',
    width: '100%',
  };

  return { ...baseStyles, ...additionalStyles };
};

/**
 * Get spacing optimized for native devices
 */
export const getNativeSpacing = () => {
  return {
    xs: 2,
    sm: 3,
    md: 4,
  };
};

/**
 * Get typography styles optimized for native devices
 */
export const getNativeTypographyStyles = (variant: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2' = 'body1') => {
  const baseStyles = {
    fontWeight: 500,
    lineHeight: 1.4,
  };

  const variantStyles = {
    h1: { fontSize: { xs: '24px', sm: '28px', md: '32px' }, fontWeight: 700 },
    h2: { fontSize: { xs: '20px', sm: '24px', md: '28px' }, fontWeight: 700 },
    h3: { fontSize: { xs: '18px', sm: '20px', md: '24px' }, fontWeight: 600 },
    h4: { fontSize: { xs: '16px', sm: '18px', md: '20px' }, fontWeight: 600 },
    h5: { fontSize: { xs: '14px', sm: '16px', md: '18px' }, fontWeight: 600 },
    h6: { fontSize: { xs: '12px', sm: '14px', md: '16px' }, fontWeight: 600 },
    body1: { fontSize: { xs: '14px', sm: '16px' } },
    body2: { fontSize: { xs: '12px', sm: '14px' } },
  };

  return { ...baseStyles, ...variantStyles[variant] };
};

/**
 * Check if device has notches or safe areas
 */
export const hasSafeAreas = () => {
  return isNative && (
    typeof window !== 'undefined' && 
    window.CSS && 
    window.CSS.supports && 
    window.CSS.supports('padding-top: env(safe-area-inset-top)')
  );
};

/**
 * Get responsive breakpoints optimized for mobile
 */
export const getNativeBreakpoints = () => {
  return {
    xs: 0,
    sm: 600,
    md: 900,
    lg: 1200,
    xl: 1536,
  };
};
