// @ts-nocheck
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Ensure theme is ready after mount
  React.useEffect(() => {
    // Add a small delay to ensure CSS variables are properly applied
    const timer = setTimeout(() => {
      document.documentElement.classList.add('theme-ready');
    }, 50);
    
    return () => clearTimeout(timer);
  }, []);

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}