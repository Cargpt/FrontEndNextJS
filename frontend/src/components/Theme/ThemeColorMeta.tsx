'use client';

import { useEffect } from 'react';
import { useTheme } from '@mui/material/styles';

export default function ThemeColorMeta() {
  const theme = useTheme();

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const isDark = theme.palette.mode === 'dark';
    // Match app background: light uses light gray, dark uses black
    const color = isDark ? '#000000' : '#f5f5f5';

    let meta = document.querySelector(
      'meta[name="theme-color"]'
    ) as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', color);
  }, [theme.palette.mode]);

  return null;
}


