'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, ChevronRight } from 'lucide-react'

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
  onClick: () => void
}

export function CourseCard({ course, onClick }: CourseCardProps) {
  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-md border-border/50 hover:border-primary/30"
      onClick={onClick}
    >
      <CardHeader className="p-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <BookOpen className="h-5 w-5 text-primary" />
          {course.name}
        </CardTitle>
        <CardDescription className="text-sm">
          {course.description || 'Course description'}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Badge variant="secondary" className="text-xs">
              Course
            </Badge>
            {course.statistics && (
              <Badge variant="outline" className="text-xs">
                {course.statistics.questionsCount} questions
              </Badge>
            )}
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  )
}
