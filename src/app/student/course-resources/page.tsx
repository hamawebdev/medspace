'use client'

import React, { useState, useMemo } from 'react'
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
  DollarSign
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
import { useCourseResources } from '@/hooks/use-study-packs'
import { CourseSelector } from '@/components/student/course-resources/course-selector'
import { CourseResource } from '@/types/api'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

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

  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null)
  const [selectedCourseName, setSelectedCourseName] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'title' | 'type' | 'created'>('title')

  // Fetch course resources using the hook - always call this hook
  const {
    courseName,
    resources,
    loading: resourcesLoading,
    error: resourcesError,
    refresh
  } = useCourseResources(selectedCourseId)

  // Filter and sort resources - always call this hook
  const filteredResources = useMemo(() => {
    if (!resources) return []

    return resources
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
  }, [resources, searchQuery, selectedType, sortBy])

  // Get unique resource types for filter - always call this hook
  const availableTypes = useMemo(() => {
    if (!resources) return []
    return Array.from(new Set(resources.map(resource => resource.type)))
  }, [resources])

  // Handle course selection
  const handleCourseSelect = (courseId: number, courseName: string) => {
    setSelectedCourseId(courseId)
    setSelectedCourseName(courseName)
  }

  // Handle authentication redirect
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

  return (
    <div className="flex-1 space-y-4 sm:space-y-6 p-4 sm:p-6 lg:p-8 xl:p-10 pt-4 sm:pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl xl:text-3xl font-bold tracking-tight">Course Resources</h2>
          <p className="text-sm sm:text-base xl:text-lg text-muted-foreground mt-1">
            Select a course to access its educational resources and study materials.
          </p>
        </div>
      </div>

      <Separator />

      {/* Course Selection and Resources Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 xl:gap-8">
        {/* Course Selector */}
        <div className="lg:col-span-1 xl:col-span-1 2xl:col-span-1">
          <CourseSelector
            selectedCourseId={selectedCourseId}
            onCourseSelect={handleCourseSelect}
            className="h-fit sticky top-4"
          />
        </div>

        {/* Resources Section */}
        <div className="lg:col-span-3 xl:col-span-2 2xl:col-span-3 space-y-4 xl:space-y-6">
          {selectedCourseId ? (
            <>
              {/* Course Info Header */}
              <Card>
                <CardHeader className="p-4 sm:p-6 xl:p-8">
                  <CardTitle className="flex items-center gap-2 text-lg xl:text-xl">
                    <BookOpen className="h-5 w-5 xl:h-6 xl:w-6" />
                    {selectedCourseName || courseName}
                  </CardTitle>
                  <CardDescription className="text-sm xl:text-base">
                    Educational resources for this course
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Filters and Search */}
              <div className="flex flex-col gap-4">
                {/* Search Bar - Full Width on Mobile */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search resources..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Filters and View Toggle */}
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                  <div className="flex flex-col xs:flex-row lg:flex-row gap-3 flex-1">
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger className="w-full xs:w-[140px] lg:w-[160px]">
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
                      <SelectTrigger className="w-full xs:w-[140px] lg:w-[160px]">
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
                      className="touch-target"
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
              {resourcesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              ) : resourcesError ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">{resourcesError}</p>
                      <Button onClick={refresh} variant="outline">
                        Try Again
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : filteredResources.length === 0 ? (
                <EmptyState
                  icon={BookOpen}
                  title="No Resources Found"
                  description={searchQuery || selectedType !== 'all'
                    ? "No resources match your current filters. Try adjusting your search or filters."
                    : "No resources available for this course yet."
                  }
                />
              ) : (
                <div className={cn(
                  "gap-3 sm:gap-4 xl:gap-6",
                  viewMode === 'grid'
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3"
                    : "flex flex-col space-y-3 sm:space-y-4 xl:space-y-6"
                )}>
                  {filteredResources.map((resource) => {
                    const FileIcon = FILE_TYPE_ICONS[resource.type] || FileText

                    return (
                      <Card
                        key={resource.id}
                        className={cn(
                          "cursor-pointer transition-all hover:shadow-md",
                          viewMode === 'list' && "flex-row"
                        )}
                        onClick={() => handleViewResource(resource)}
                      >
                        <CardHeader className={cn(
                          "pb-3 p-4 sm:p-6",
                          viewMode === 'list' && "flex-1"
                        )}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div className="p-2 bg-muted rounded-lg flex-shrink-0">
                                <FileIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start gap-2 mb-1">
                                  <CardTitle className="text-base sm:text-lg line-clamp-2 flex-1">
                                    {resource.title}
                                  </CardTitle>
                                  {resource.isPaid && (
                                    <Badge variant="outline" className="text-xs flex-shrink-0">
                                      <DollarSign className="h-3 w-3 mr-1" />
                                      {resource.price ? `$${resource.price}` : 'Paid'}
                                    </Badge>
                                  )}
                                </div>
                                <CardDescription className="line-clamp-2 text-sm">
                                  {resource.description || 'No description available'}
                                </CardDescription>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  <Badge variant="outline" className="text-xs">
                                    {resource.type}
                                  </Badge>
                                  {resource.downloadCount && (
                                    <Badge variant="secondary" className="text-xs">
                                      {resource.downloadCount} downloads
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="sm" className="touch-target flex-shrink-0">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation()
                                  handleViewResource(resource)
                                }}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View
                                </DropdownMenuItem>
                                {resource.filePath && (
                                  <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation()
                                    handleDownloadResource(resource)
                                  }}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardHeader>

                        <CardContent className={cn(
                          "p-4 sm:p-6 pt-0",
                          viewMode === 'list' && "flex-1"
                        )}>
                          <div className="space-y-2 sm:space-y-3">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span className="truncate">{formatDate(resource.createdAt)}</span>
                              </div>
                              {resource.downloadCount && (
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <Download className="h-3 w-3" />
                                  {resource.downloadCount}
                                </div>
                              )}
                            </div>

                            {resource.type === 'VIDEO' && resource.youtubeVideoId && (
                              <div className="flex items-center gap-1 text-xs text-primary">
                                <Play className="h-3 w-3" />
                                YouTube Video
                              </div>
                            )}

                            {resource.type === 'LINK' && resource.externalUrl && (
                              <div className="flex items-center gap-1 text-xs text-primary">
                                <ExternalLink className="h-3 w-3" />
                                External Link
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </>
          ) : (
            <EmptyState
              icon={BookOpen}
              title="Select a Course"
              description="Choose a course from the sidebar to view its educational resources."
            />
          )}
        </div>
      </div>
    </div>
  )
}
