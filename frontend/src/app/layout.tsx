// layout.tsx


import "./globals.css";
import { type ReactNode } from 'react'; // <--- Import useEffect
import { Roboto } from 'next/font/google';
import Script from "next/script";
import type { Metadata, Viewport } from 'next';

// Providers and Components
import CookiesClientProvider from "@/providers/CookiesClientProvider";
import { NotificationProvider } from "../Context/NotificationContext";
import SafeAreaInit from "@/components/SafeAreaInit";
import ThemeColorMeta from "@/components/Theme/ThemeColorMeta";

const roboto = Roboto({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AiCarAdvisor',
  description: 'AiCarAdvisor is your intelligent automotive companion...',
  other: {
    fast2sms: 'B5dSIfoanSkm5PWRBeV6YLNLP15Zg5lL',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',

};

export default function RootLayout({ children }: { children: ReactNode }) {

  
  return (
    <html className={roboto.className} lang="en">
      
      <body>
        <CookiesClientProvider>
          <NotificationProvider>
            <SafeAreaInit />
            <ThemeColorMeta />
            {children}
            
          </NotificationProvider>
        </CookiesClientProvider>

        {/* --- Google Analytics Scripts --- */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-L3EQVW9TNK"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-L3EQVW9TNK');
          `}
        </Script>
      </body>
    </html>
  );
}


