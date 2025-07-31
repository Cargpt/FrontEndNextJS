import type { Metadata } from "next";
import "./globals.css";
import CookiesClientProvider from "@/providers/CookiesClientProvider";
import { NotificationProvider } from "../Context/NotificationContext";

import { Roboto } from 'next/font/google';
import Head from "next/head";
import Script from "next/script";

const roboto = Roboto({
  weight: ['400', '700'], // Specify the weights you need (e.g., normal and bold)
  style: ['normal', 'italic'], // Specify styles if needed
  subsets: ['latin'], // Only load the Latin subset to reduce file size
  display: 'swap', // Helps prevent layout shift by displaying a fallback font while Roboto loads
});



export const metadata: Metadata = {
  title: "AiCarAdvisor",
  description: "AiCarAdvisor is your intelligent automotive companion, leveraging advanced AI to help you find the perfect car tailored to your needs and budget. From personalized recommendations and detailed comparisons to up-to-date market insights, AiCarAdvisor makes car shopping smarter, faster, and hassle-free.",
};







export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={roboto.className} lang="en">
      <head>
        <meta name="fast2sms" content="B5dSIfoanSkm5PWRBeV6YLNLP15Zg5lL"/>


      </head>
      <body>
        
          <CookiesClientProvider> {/* <-- Wrap your children with the client provider */}
            <NotificationProvider>
         

          {children}


            </NotificationProvider>
        </CookiesClientProvider>
   <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-L3EQVW9TNK"
        strategy="afterInteractive"
      />

      {/* Initialize gtag */}
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
