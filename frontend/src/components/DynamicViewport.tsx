// components/DynamicViewport.tsx

"use client"; // This directive is essential for using useEffect

import { useEffect } from 'react';

export default function DynamicViewport() {
  useEffect(() => {
    // 1. Find and remove any existing viewport tags to prevent duplicates
    const existingViewports = document.querySelectorAll('meta[name="viewport"]');
    existingViewports.forEach(vp => vp.remove());

    // 2. Create and append your desired viewport tag
    const newViewport = document.createElement('meta');
    newViewport.name = 'viewport';
    newViewport.content = 'width=device-width, initial-scale=1, viewport-fit=cover';
    document.head.appendChild(newViewport);

    // 3. Clean up the tag when the component unmounts
    return () => {
      newViewport.remove();
    };
  }, []); // The empty array [] ensures this effect runs only once

  // This component doesn't render any HTML
  return null;
}