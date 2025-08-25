            // @ts-nocheck
'use client'

import React, { createContext, useContext, useEffect } from 'react'

type Font = 'sans'

interface FontContextType {
  font: Font
  setFont: (font: Font) => void
}

const FontContext = createContext<FontContextType | undefined>(undefined)

export const FontProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const font: Font = 'sans' // Always use Inter font

  useEffect(() => {
    // Ensure Inter font is applied to the document
    const root = document.documentElement
    root.classList.forEach((cls) => {
      if (cls.startsWith('font-')) root.classList.remove(cls)
    })
    root.classList.add('font-sans')
  }, [])

  const setFont = (font: Font) => {
    // No-op since we only use Inter font
    console.log('Font switching disabled - using Inter font only')
  }

  return <FontContext value={{ font, setFont }}>{children}</FontContext>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useFont = () => {
  const context = useContext(FontContext)
  if (!context) {
    throw new Error('useFont must be used within a FontProvider')
  }
  return context
}
