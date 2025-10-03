'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookOpen, ChevronRight, FileText, Video, FileCheck } from 'lucide-react'

interface CourseCardProps {
  course: {
    id: number
    name: string
    description?: string
    statistics?: {
      questionsCount: number
      quizzesCount: number
    }
  }
  onClick?: () => void
  onOfficialCourse?: () => void
  onVideoCourse?: () => void
  onSummaryCourse?: () => void
}

export function CourseCard({ course, onClick, onOfficialCourse, onVideoCourse, onSummaryCourse }: CourseCardProps) {
  const handleButtonClick = (e: React.MouseEvent, action?: () => void) => {
    e.stopPropagation() // Prevent card click when button is clicked
    if (action) {
      action()
    }
  }

  return (
    <Card
      className="text-card-foreground flex flex-col rounded-xl border p-4 sm:p-6 gap-4 sm:gap-6 shadow-sm hover:shadow-primary/5 duration-300 ease-out hover:-translate-y-1 relative overflow-hidden group bg-primary transition-all hover:shadow-md border-border/50 hover:border-primary/30"
      onClick={onClick}
    >
      <CardHeader className="p-0">
        <CardTitle className="flex items-center gap-2 text-base text-white">
          <BookOpen className="h-5 w-5 text-white" />
          {course.name}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0 flex flex-col gap-3">
        <Button
          variant="secondary"
          className="w-full justify-start gap-2 bg-white/10 hover:bg-white/20 text-white border-white/20"
          onClick={(e) => handleButtonClick(e, onOfficialCourse)}
        >
          <FileText className="h-4 w-4" />
          Official Course
        </Button>
        
        <Button
          variant="secondary"
          className="w-full justify-start gap-2 bg-white/10 hover:bg-white/20 text-white border-white/20"
          onClick={(e) => handleButtonClick(e, onVideoCourse)}
        >
          <Video className="h-4 w-4" />
          Video Course
        </Button>
        
        <Button
          variant="secondary"
          className="w-full justify-start gap-2 bg-white/10 hover:bg-white/20 text-white border-white/20"
          onClick={(e) => handleButtonClick(e, onSummaryCourse)}
        >
          <FileCheck className="h-4 w-4" />
          Summary Course
        </Button>
      </CardContent>
    </Card>
  )
}
