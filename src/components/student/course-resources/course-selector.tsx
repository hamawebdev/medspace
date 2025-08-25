'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { LoadingSpinner } from '@/components/loading-states'
import { Search, BookOpen, GraduationCap, Users } from 'lucide-react'
import { QuizService } from '@/lib/api-services'
import { ExtendedQuizCourse } from '@/types/api'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useUserSubscriptions, selectEffectiveActiveSubscription } from '@/hooks/use-subscription'

interface CourseSelectorProps {
  selectedCourseId: number | null
  onCourseSelect: (courseId: number, courseName: string) => void
  className?: string
}

export function CourseSelector({ selectedCourseId, onCourseSelect, className }: CourseSelectorProps) {
  const [filters, setFilters] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedModule, setSelectedModule] = useState<string>('all')

  const { subscriptions } = useUserSubscriptions()
  const { allowedYearLevels } = selectEffectiveActiveSubscription(subscriptions)

  // Fetch quiz filters on component mount
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await QuizService.getQuizFilters()

        if (response.success && response.data) {
          setFilters(response.data)
        } else {
          throw new Error(response.error || 'Failed to fetch course filters')
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load courses'
        setError(errorMessage)
        toast.error(errorMessage)
        console.error('Course filters fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchFilters()
  }, [])

  // Extract and process courses from the response: support both shapes
  const allCourses = useMemo((): ExtendedQuizCourse[] => {
    if (!filters) return []

    // Shape A: flat courses[]
    const flatCourses = filters.courses as any[] | undefined
    if (flatCourses && Array.isArray(flatCourses)) {
      return flatCourses.map((c: any) => ({
        id: c.id,
        name: c.name,
        questionCount: c.questionCount ?? c._count?.questions ?? 0,
        moduleId: c.module?.id,
        moduleName: c.module?.name,
        unitId: c.module?.unite?.id,
        unitName: c.module?.unite?.name,
        year: c.module?.unite?.year || undefined,
      }))
    }

    // Shape B: nested unites -> modules -> courses
    const nestedUnites = filters.unites as any[] | undefined
    if (nestedUnites && Array.isArray(nestedUnites)) {
      const courses: ExtendedQuizCourse[] = []
      nestedUnites.forEach((unit: any) => {
        unit.modules?.forEach((module: any) => {
          module.courses?.forEach((course: any) => {
            courses.push({
              ...course,
              moduleId: module.id,
              moduleName: module.name,
              unitName: unit.name,
              year: unit.year,
            })
          })
        })
      })
      return courses
    }

    return []
  }, [filters])

  // Filter courses based on search, module, and active study pack (allowedYearLevels)
  const filteredCourses = useMemo(() => {
    const allowedSet = new Set((allowedYearLevels || []).map((y: string) => String(y).toUpperCase()))
    return allCourses.filter(course => {
      const matchesSearch = !searchQuery ||
        course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.moduleName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.unitName?.toLowerCase().includes(searchQuery.toLowerCase())

      const courseYear = course.year ? String(course.year).toUpperCase() : null
      const matchesActivePack = courseYear ? allowedSet.has(courseYear) : false

      const matchesModule = selectedModule === 'all' || course.moduleId?.toString() === selectedModule

      return matchesSearch && matchesActivePack && matchesModule && course.questionCount > 0
    })
  }, [allCourses, searchQuery, selectedModule, allowedYearLevels])

  // Available modules limited to active study pack's allowed years
  const availableModules = useMemo(() => {
    const allowedSet = new Set((allowedYearLevels || []).map((y: string) => String(y).toUpperCase()))
    const units: any[] = (filters?.unites as any[]) || []
    const modules = units.flatMap((u: any) => (
      allowedSet.has(String(u?.year || '').toUpperCase()) ? (u?.modules || []) : []
    ))
    const unique = new Map<string, any>()
    modules.forEach((m: any) => unique.set(String(m.id), m))
    return [
      { id: 'all', name: 'All Modules' },
      ...Array.from(unique.values()).map((m: any) => ({ id: String(m.id), name: m.name }))
    ]
  }, [filters, allowedYearLevels])

  const handleCourseSelect = (course: ExtendedQuizCourse) => {
    onCourseSelect(course.id, course.name)
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Select Course
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Select Course
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Select Course
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose a course to view its educational resources
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Module Filter */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Module filter only */}
          <div className="space-y-2">
            <Label>Module</Label>
            <Select value={selectedModule} onValueChange={setSelectedModule}>
              <SelectTrigger>
                <SelectValue placeholder="All modules" />
              </SelectTrigger>
              <SelectContent>
                {availableModules.map(m => (
                  <SelectItem key={m.id} value={String(m.id)}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* Course List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredCourses.length === 0 ? (
            <div className="text-center py-8">
              <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery
                  ? 'No courses match your search'
                  : 'No courses available for your active study pack'
                }
              </p>
            </div>
          ) : (
            filteredCourses.map(course => (
              <div
                key={course.id}
                className={cn(
                  "p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md",
                  selectedCourseId === course.id
                    ? "bg-primary/10 border-primary/30 ring-1 ring-primary/20"
                    : "bg-background hover:bg-accent/50"
                )}
                onClick={() => handleCourseSelect(course)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{course.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {course.moduleName}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {course.unitName}
                      </Badge>
                      {course.year && (
                        <Badge variant="outline" className="text-xs">
                          Year {course.year}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    {course.questionCount}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
