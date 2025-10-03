// @ts-nocheck
export const dynamic = 'force-dynamic';
import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
  import { Providers } from "@/components/providers";
  import Script from "next/script";
 import { FrontextInit } from "@/components/frontext-init";
  import "./globals.css";

  // Using Outfit font for all text
  const outfit = Outfit({
    subsets: ["latin"],
    variable: "--font-sans",
    display: "swap",
  });

  export const metadata: Metadata = {
    title: "MedCortex - Trusted Medical Education Platform",
    description: "Comprehensive medical learning platform designed by healthcare professionals with evidence-based content, detailed analytics, and collaborative study tools for medical students.",
    keywords: "medical education, medical students, USMLE, MCAT, medical learning platform, evidence-based learning, medical questions bank",
    authors: [{ name: "MedCortex Team" }],
    creator: "MedCortex",
    metadataBase: new URL("https://medcortex.com"),
    openGraph: {
      title: "MedCortex - Trusted Medical Education Platform",
      description: "Comprehensive medical learning platform designed by healthcare professionals with evidence-based content and collaborative study tools.",
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
      title: "MedCortex - Trusted Medical Education Platform",
      description: "Comprehensive medical learning platform designed by healthcare professionals with evidence-based content and collaborative study tools.",
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
        <body className={`${outfit.variable} font-sans antialiased min-h-screen`}>
          <Script id="theme-init" strategy="beforeInteractive">
            {`(function() {
              try {
                var storageKey = 'theme';
                var stored = localStorage.getItem(storageKey);
                var mql = window.matchMedia('(prefers-color-scheme: dark)');
                var system = mql.matches ? 'dark' : 'light';
                var theme = (!stored || stored === 'system') ? system : stored;
                var root = document.documentElement;
                
                // Ensure we always have a theme class applied
                root.classList.remove('light','dark');
                root.classList.add(theme);
                root.setAttribute('data-theme', theme);
                
                // Force a style recalculation to ensure CSS variables are available
                root.style.setProperty('--theme-initialized', '1');
                
                // Add a temporary class to prevent FOUC (Flash of Unstyled Content)
                root.classList.add('theme-ready');
              } catch (e) {
                // Fallback to light theme if anything fails
                document.documentElement.classList.add('light');
                document.documentElement.setAttribute('data-theme', 'light');
                document.documentElement.classList.add('theme-ready');
              }
            })();`}
          </Script>
          <Providers>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange={true}
              storageKey="theme"
            >
              {children}
              <FrontextInit />
            </ThemeProvider>
          </Providers>
        </body>
    </html>
  );
}
