// @ts-nocheck
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from "@/components/providers";
import { StagewiseToolbar } from "@stagewise/toolbar-next";
import ReactPlugin  from "@stagewise-plugins/react";
import "./globals.css";

// Using Inter font for all text
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MedCortex - Revolutionize Your Medical Education",
  description: "Experience the future of medical learning with AI-powered personalization, comprehensive analytics, and collaborative study tools designed for the next generation of healthcare professionals.",
  keywords: "medical education, medical students, USMLE, MCAT, medical learning platform, AI-powered learning, medical questions bank",
  authors: [{ name: "MedCortex Team" }],
  creator: "MedCortex",
  metadataBase: new URL("https://medcortex.com"),
  openGraph: {
    title: "MedCortex - Revolutionize Your Medical Education",
    description: "Experience the future of medical learning with AI-powered personalization and comprehensive analytics.",
    url: "https://medcortex.com",
    siteName: "MedCortex",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "MedCortex - Medical Education Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MedCortex - Revolutionize Your Medical Education",
    description: "Experience the future of medical learning with AI-powered personalization and comprehensive analytics.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen`}
      >
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange={false}
          >
            {children}
            <StagewiseToolbar
              config={{
                plugins: [ReactPlugin]
              }}
            />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
