import type { Metadata } from "next";
import "./globals.css";
import CookiesClientProvider from "@/providers/CookiesClientProvider";

import { Roboto } from 'next/font/google';

const roboto = Roboto({
  weight: ['400', '700'], // Specify the weights you need (e.g., normal and bold)
  style: ['normal', 'italic'], // Specify styles if needed
  subsets: ['latin'], // Only load the Latin subset to reduce file size
  display: 'swap', // Helps prevent layout shift by displaying a fallback font while Roboto loads
});

export const metadata: Metadata = {
  title: "CarAiAdvisor",
  description: "CarAiAdvisor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={roboto.className} lang="en">
      <body>
        
          <CookiesClientProvider> {/* <-- Wrap your children with the client provider */}

          {children}
        </CookiesClientProvider>

        
      </body>
    </html>
  );
}
