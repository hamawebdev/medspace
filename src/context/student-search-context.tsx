// @ts-nocheck
'use client'

import React from 'react'
import { StudentCommandMenu } from '@/components/student/layout/command-menu'

interface StudentSearchContextType {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const StudentSearchContext = React.createContext<StudentSearchContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export function StudentSearchProvider({ children }: Props) {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  return (
    <StudentSearchContext.Provider value={{ open, setOpen }}>
      {children}
      <StudentCommandMenu />
    </StudentSearchContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useStudentSearch = () => {
  const searchContext = React.useContext(StudentSearchContext)

  if (!searchContext) {
    throw new Error('useStudentSearch has to be used within <StudentSearchContext.Provider>')
  }

  return searchContext
}
