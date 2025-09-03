// layout.tsx


import "./globals.css";
import "@/styles/statusBar.css";
import { type ReactNode } from 'react'; // <--- Import useEffect
import { Roboto } from 'next/font/google';
import Script from "next/script";
import type { Metadata, Viewport } from 'next';

// Providers and Components
import CookiesClientProvider from "@/providers/CookiesClientProvider";
import { NotificationProvider } from "../Context/NotificationContext";
import SafeAreaInit from "@/components/SafeAreaInit";
import ThemeColorMeta from "@/components/Theme/ThemeColorMeta";
import BackExitHandler from "@/components/BackExitHandler";
import StatusBar from "@/components/common/StatusBar";

const roboto = Roboto({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
});


export const metadata: Metadata = {
  title: {
    default: "AiCarAdvisor™ – Find Your Perfect Car with AI",
    template: "%s | AiCarAdvisor™",
  },
  description:
    "Get personalized car recommendations, compare specs & prices, and book test drives. AiCarAdvisor™ helps you find the right car faster with AI.",
  applicationName: "AiCarAdvisor™",
  keywords: [
    "AI car advisor",
    "car recommendations",
    "compare cars",
    "best car for me",
    "test drive booking",
    "automotive AI",
  ],
  authors: [{ name: "AiCarAdvisor™" }],
  creator: "AiCarAdvisor™",
  publisher: "AiCarAdvisor™",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://www.aicaradvisor.com/",
  },
  openGraph: {
    type: "website",
    siteName: "AiCarAdvisor™",
    url: "https://www.aicaradvisor.com/",
    title: "AiCarAdvisor™ – Find Your Perfect Car with AI",
    description:
      "Personalized car recommendations powered by AI. Compare specs, prices, reviews, and book test drives – all in one place.",
    images: [
      {
        url: "https://www.aicaradvisor.com/assets/AICarAdvisor.png", // 🔥 absolute URL
        width: 1200,
        height: 630,
        alt: "AiCarAdvisor™",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@yourtwitterhandle", // optional if you have one
    title: "AiCarAdvisor™ – Find Your Perfect Car with AI",
    description:
      "Let AI match you with the best cars based on your budget and lifestyle.",
    images: ["https://www.aicaradvisor.com/assets/AICarAdvisor.png"], // 🔥 absolute URL
  },
  icons: {
    icon: [
      { url: "/assets/icons/icon-48.webp", type: "image/webp" },
      { url: "/assets/icons/icon-72.webp", type: "image/webp" },
      { url: "/assets/icons/icon-96.webp", type: "image/webp" },
      { url: "/assets/icons/icon-128.webp", type: "image/webp" },
      { url: "/assets/icons/icon-192.webp", type: "image/webp" },
      { url: "/assets/icons/icon-256.webp", type: "image/webp" },
      { url: "/assets/icons/icon-512.webp", type: "image/webp" },
    ],
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
         <BackExitHandler>
        <CookiesClientProvider>
          <NotificationProvider>
            <SafeAreaInit />
            <ThemeColorMeta />
            <StatusBar />

            {children}
            
          </NotificationProvider>
        </CookiesClientProvider>
        </BackExitHandler>

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


