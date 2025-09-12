'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Download,
  Eye,
  BookOpen,
  FileText,
  Video,
  Image,
  File,
  Calendar,
  Grid3X3,
  List,
  ExternalLink,
  Play,
  DollarSign,
  ChevronRight,
  ArrowLeft,
  Home,
  GraduationCap,
  Users,
  FolderOpen,
  Layers
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingSpinner } from '@/components/loading-states'
import { useStudentAuth } from '@/hooks/use-auth'
import { useContentFilters } from '@/hooks/use-content-filters'
import { NewApiService } from '@/lib/api/new-api-services'
import { ContentService } from '@/lib/api-services'
import { CourseResource } from '@/types/api'
import { UnitCard } from '@/components/student/course-resources/unit-card'
import { ModuleCard } from '@/components/student/course-resources/module-card'
import { CourseCard } from '@/components/student/course-resources/course-card'
import { ResourceCard } from '@/components/student/course-resources/resource-card'
import { BreadcrumbNavigation } from '@/components/student/course-resources/breadcrumb-navigation'
import { LoadingState } from '@/components/student/course-resources/loading-state'
import { ErrorState } from '@/components/student/course-resources/error-state'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// Navigation types
type NavigationLevel = 'units' | 'modules' | 'courses' | 'resources'

interface NavigationState {
  level: NavigationLevel
  selectedUnit?: { id: number; name: string }
  selectedModule?: { id: number; name: string; isIndependent?: boolean }
  selectedCourse?: { id: number; name: string }
}

interface BreadcrumbItem {
  label: string
  level: NavigationLevel
  onClick: () => void
}

// Course and resource types
interface Course {
  id: number
  name: string
  description?: string
  moduleId?: number
  moduleName?: string
  statistics?: {
    questionsCount: number
    quizzesCount: number
  }
}

interface CourseWithResources extends Course {
  resources: CourseResource[]
}

const FILE_TYPE_ICONS = {
  PDF: FileText,
  VIDEO: Video,
  SLIDE: Image,
  DOCUMENT: File,
  LINK: ExternalLink
}

export default function CourseResourcesPage() {
  const router = useRouter()
  const { isAuthenticated, loading: authLoading } = useStudentAuth()
  const { filters, loading: filtersLoading, error: filtersError, refetch } = useContentFilters()

  // Navigation state
  const [navigation, setNavigation] = useState<NavigationState>({
    level: 'units'
  })

  // Data states
  const [courses, setCourses] = useState<Course[]>([])
  const [courseResources, setCourseResources] = useState<CourseResource[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // UI states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'title' | 'type' | 'created'>('title')

  // Navigation functions
  const navigateToModules = (unit: { id: number; name: string }) => {
    setNavigation({
      level: 'modules',
      selectedUnit: unit
    })
    setCourses([])
    setCourseResources([])
    setError(null)
  }

  const navigateToCoursesFromModule = (module: { id: number; name: string; isIndependent?: boolean }) => {
    setNavigation(prev => ({
      level: 'courses',
      selectedUnit: prev.selectedUnit,
      selectedModule: module
    }))
    setCourseResources([])
    setError(null)
    fetchCourses(module.id, module.isIndependent)
  }

  const navigateToResources = (course: { id: number; name: string }) => {
    setNavigation(prev => ({
      ...prev,
      level: 'resources',
      selectedCourse: course
    }))
    setError(null)
    fetchCourseResources(course.id)
  }

  const navigateBack = () => {
    switch (navigation.level) {
      case 'modules':
        setNavigation({ level: 'units' })
        break
      case 'courses':
        setNavigation(prev => ({
          level: 'modules',
          selectedUnit: prev.selectedUnit
        }))
        setCourses([])
        break
      case 'resources':
        setNavigation(prev => ({
          level: 'courses',
          selectedUnit: prev.selectedUnit,
          selectedModule: prev.selectedModule
        }))
        setCourseResources([])
        break
    }
    setError(null)
  }

  const navigateToLevel = (level: NavigationLevel) => {
    if (level === 'units') {
      setNavigation({ level: 'units' })
      setCourses([])
      setCourseResources([])
    } else if (level === 'modules' && navigation.selectedUnit) {
      setNavigation({
        level: 'modules',
        selectedUnit: navigation.selectedUnit
      })
      setCourses([])
      setCourseResources([])
    } else if (level === 'courses' && navigation.selectedModule) {
      setNavigation(prev => ({
        level: 'courses',
        selectedUnit: prev.selectedUnit,
        selectedModule: prev.selectedModule
      }))
      setCourseResources([])
      if (navigation.selectedModule) {
        fetchCourses(navigation.selectedModule.id, navigation.selectedModule.isIndependent)
      }
    }
    setError(null)
  }

  // Data fetching functions
  const fetchCourses = async (moduleId: number, isIndependent?: boolean) => {
    try {
      setLoading(true)
      setError(null)

      const response = isIndependent
        ? await NewApiService.getStudentCourses({ moduleId })
        : await NewApiService.getStudentCourses({ moduleId })

      if (response.success && response.data) {
        const coursesData = response.data.courses || response.data
        setCourses(Array.isArray(coursesData) ? coursesData : [])
      } else {
        throw new Error(response.error || 'Failed to fetch courses')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch courses'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const fetchCourseResources = async (courseId: number) => {
    try {
      setLoading(true)
      setError(null)

      const response = await ContentService.getCourseResources(courseId, {
        page: 1,
        limit: 100
      })

      if (response.success && response.data) {
        const data = response.data as any
        const resources = data?.resources || data?.data?.resources || []
        setCourseResources(Array.isArray(resources) ? resources : [])
      } else {
        throw new Error(response.error || 'Failed to fetch course resources')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch course resources'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Generate breadcrumbs - moved before early returns
  const breadcrumbs: BreadcrumbItem[] = useMemo(() => {
    const items: BreadcrumbItem[] = [
      {
        label: 'Course Resources',
        level: 'units',
        onClick: () => navigateToLevel('units')
      }
    ]

    if (navigation.selectedUnit) {
      items.push({
        label: navigation.selectedUnit.name,
        level: 'modules',
        onClick: () => navigateToLevel('modules')
      })
    }

    if (navigation.selectedModule) {
      items.push({
        label: navigation.selectedModule.name,
        level: 'courses',
        onClick: () => navigateToLevel('courses')
      })
    }

    if (navigation.selectedCourse) {
      items.push({
        label: navigation.selectedCourse.name,
        level: 'resources',
        onClick: () => {}
      })
    }

    return items
  }, [navigation])

  // Filter and sort resources
  const filteredResources = useMemo(() => {
    if (!courseResources) return []

    return courseResources
      .filter(resource => {
        if (searchQuery && !resource.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !resource.description?.toLowerCase().includes(searchQuery.toLowerCase())) return false
        if (selectedType !== 'all' && resource.type !== selectedType) return false
        return true
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'title':
            return a.title.localeCompare(b.title)
          case 'type':
            return a.type.localeCompare(b.type)
          case 'created':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          default:
            return a.title.localeCompare(b.title)
        }
      })
  }, [courseResources, searchQuery, selectedType, sortBy])

  // Get unique resource types for filter
  const availableTypes = useMemo(() => {
    if (!courseResources) return []
    return Array.from(new Set(courseResources.map(resource => resource.type)))
  }, [courseResources])

  const handleViewResource = (resource: CourseResource) => {
    if (resource.type === 'VIDEO' && resource.youtubeVideoId) {
      window.open(`https://www.youtube.com/watch?v=${resource.youtubeVideoId}`, '_blank')
    } else if (resource.type === 'LINK' && resource.externalUrl) {
      window.open(resource.externalUrl, '_blank')
    } else if (resource.filePath) {
      // Handle file viewing/download
      window.open(resource.filePath, '_blank')
    } else {
      toast.info('Resource not available for viewing')
    }
  }

  const handleDownloadResource = (resource: CourseResource) => {
    if (resource.isPaid && !resource.price) {
      toast.error('This is a paid resource. Please purchase to access.')
      return
    }

    if (resource.filePath) {
      // Create download link
      const link = document.createElement('a')
      link.href = resource.filePath
      link.download = resource.title
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      toast.info('Download not available for this resource type')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Handle authentication redirect - moved after all hooks
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    router.push('/auth/login')
    return null
  }

  return (
    <div className="flex-1 space-y-4 sm:space-y-6 p-4 sm:p-6 lg:p-8 pt-4 sm:pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BookOpen className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-primary" />
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-primary">
              Course Resources
            </h2>
          </div>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">
            Navigate through units, modules, and courses to access educational resources.
          </p>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      <BreadcrumbNavigation
        items={breadcrumbs.map((item, index) => ({
          label: item.label,
          onClick: item.onClick,
          isActive: index === breadcrumbs.length - 1
        }))}
      />

      {/* Back Button */}
      {navigation.level !== 'units' && (
        <Button
          variant="outline"
          onClick={navigateBack}
          className="w-fit"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      )}

      <Separator />

      {/* Main Content */}
      {filtersLoading ? (
        <LoadingState message="Loading content..." />
      ) : filtersError ? (
        <ErrorState
          message={filtersError}
          onRetry={refetch}
        />
      ) : (
        <>
          {/* Units Level */}
          {navigation.level === 'units' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Select a Unit or Module</h3>
              </div>

              {/* Units Section */}
              {filters?.unites && filters.unites.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-muted-foreground">Units</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filters.unites.map((unit) => (
                      <UnitCard
                        key={unit.id}
                        unit={unit}
                        onClick={() => navigateToModules(unit)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Independent Modules Section */}
              {filters?.independentModules && filters.independentModules.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-muted-foreground">Independent Modules</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filters.independentModules.map((module) => (
                      <ModuleCard
                        key={module.id}
                        module={module}
                        isIndependent={true}
                        onClick={() => navigateToCoursesFromModule({ ...module, isIndependent: true })}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {(!filters?.unites || filters.unites.length === 0) &&
               (!filters?.independentModules || filters.independentModules.length === 0) && (
                <EmptyState
                  icon={BookOpen}
                  title="No Content Available"
                  description="No units or modules are available for your current subscription."
                />
              )}
            </div>
          )}
          {/* Modules Level */}
          {navigation.level === 'modules' && navigation.selectedUnit && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Modules in {navigation.selectedUnit.name}</h3>
              </div>

              {filters?.unites?.find(u => u.id === navigation.selectedUnit?.id)?.modules && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filters.unites
                    .find(u => u.id === navigation.selectedUnit?.id)
                    ?.modules?.map((module) => (
                    <ModuleCard
                      key={module.id}
                      module={module}
                      onClick={() => navigateToCoursesFromModule(module)}
                    />
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!filters?.unites?.find(u => u.id === navigation.selectedUnit?.id)?.modules?.length && (
                <EmptyState
                  icon={FolderOpen}
                  title="No Modules Available"
                  description="No modules are available in this unit."
                />
              )}
            </div>
          )}

          {/* Courses Level */}
          {navigation.level === 'courses' && navigation.selectedModule && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Courses in {navigation.selectedModule.name}</h3>
              </div>

              {loading ? (
                <LoadingState message="Loading courses..." />
              ) : error ? (
                <ErrorState
                  message={error}
                  onRetry={() => fetchCourses(navigation.selectedModule!.id, navigation.selectedModule!.isIndependent)}
                />
              ) : courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {courses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      onClick={() => navigateToResources(course)}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={BookOpen}
                  title="No Courses Available"
                  description="No courses are available in this module."
                />
              )}
            </div>
          )}

          {/* Resources Level */}
          {navigation.level === 'resources' && navigation.selectedCourse && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Resources for {navigation.selectedCourse.name}</h3>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search resources..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                  <div className="flex flex-col sm:flex-row gap-3 flex-1">
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger className="w-full sm:w-[160px]">
                        <SelectValue placeholder="File type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {availableTypes.map(type => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                      <SelectTrigger className="w-full sm:w-[160px]">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="title">Title</SelectItem>
                        <SelectItem value="type">Type</SelectItem>
                        <SelectItem value="created">Date Created</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                      className="min-h-[44px] min-w-[44px] px-3"
                    >
                      {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
                      <span className="ml-2 hidden sm:inline">
                        {viewMode === 'grid' ? 'List' : 'Grid'}
                      </span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Resources Content */}
              {loading ? (
                <LoadingState message="Loading resources..." />
              ) : error ? (
                <ErrorState
                  message={error}
                  onRetry={() => fetchCourseResources(navigation.selectedCourse!.id)}
                />
              ) : filteredResources.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No Resources Found"
                  description={searchQuery || selectedType !== 'all'
                    ? "No resources match your current filters. Try adjusting your search or filters."
                    : "No resources available for this course yet."
                  }
                />
              ) : (
                <div className={cn(
                  "gap-3 sm:gap-4 lg:gap-6",
                  viewMode === 'grid'
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
                    : "flex flex-col space-y-3 sm:space-y-4"
                )}>
                  {filteredResources.map((resource) => (
                    <ResourceCard
                      key={resource.id}
                      resource={resource}
                      viewMode={viewMode}
                      onView={handleViewResource}
                      onDownload={handleDownloadResource}
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
