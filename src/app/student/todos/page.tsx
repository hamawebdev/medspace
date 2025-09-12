// @ts-nocheck
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  Flag,
  MoreHorizontal,
  Edit3,
  Trash2,
  Star,
  Circle,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Target,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  Columns3,
  List,
  CalendarDays
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingSpinner } from '@/components/loading-states'
import { useStudentAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

import { StudentService } from '@/lib/api-services'
import type { Todo as ApiTodo, CreateTodoRequest, UpdateTodoRequest } from '@/types/api'
import { ReadingTodoForm } from '@/components/student/todos/reading-todo-form'

// Enhanced color system using globals.css design tokens
const PRIORITY_CHIP_COLORS: Record<string, string> = {
  LOW: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
  MEDIUM: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
  HIGH: 'bg-destructive/10 text-destructive border-destructive/20',
}

const STATUS_CHIP_COLORS: Record<string, string> = {
  PENDING: 'bg-muted text-muted-foreground border-border',
  IN_PROGRESS: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
  COMPLETED: 'bg-chart-1/10 text-chart-1 border-chart-1/20',
  OVERDUE: 'bg-destructive/10 text-destructive border-destructive/20',
}

const TYPE_ICONS: Record<string, any> = {
  READING: BookOpen,
  SESSION: Target,
  EXAM: GraduationCap,
  OTHER: Circle,
}

export default function TodosPage() {
  const router = useRouter()
  const { isAuthenticated, loading: authLoading } = useStudentAuth()

  const [todos, setTodos] = useState<ApiTodo[]>([])
  const [loading, setLoading] = useState(true)
  const [initialLoadDone, setInitialLoadDone] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [hasEverHadTodos, setHasEverHadTodos] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL') // type
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL')
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')
  const [showCompleted, setShowCompleted] = useState(false)
  const [showTodayOnly, setShowTodayOnly] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list')
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'created'>('dueDate')
  const [page, setPage] = useState(1)
  const [limit] = useState(12)
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<number>>(new Set())

  // Enhanced chip components using design system colors
  const PriorityChip = ({ priority }: { priority: string }) => (
    <Badge
      variant="outline"
      className={cn("text-xs font-medium", PRIORITY_CHIP_COLORS[priority])}
    >
      <Flag className="h-3 w-3 mr-1" />
      {priority}
    </Badge>
  )

  const StatusChip = ({ status }: { status: string }) => (
    <Badge
      variant="outline"
      className={cn("text-xs font-medium", STATUS_CHIP_COLORS[status])}
    >
      {status === 'COMPLETED' && <CheckCircle2 className="h-3 w-3 mr-1" />}
      {status === 'IN_PROGRESS' && <Clock className="h-3 w-3 mr-1" />}
      {status === 'OVERDUE' && <AlertCircle className="h-3 w-3 mr-1" />}
      {status === 'PENDING' && <Circle className="h-3 w-3 mr-1" />}
      {status.replace('_', ' ')}
    </Badge>
  )

  const DueDateChip = ({ dueDate }: { dueDate: string }) => {
    const date = new Date(dueDate)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    let colorClass = 'bg-muted text-muted-foreground border-border'
    if (diffDays < 0) colorClass = 'bg-destructive/10 text-destructive border-destructive/20'
    else if (diffDays === 0) colorClass = 'bg-chart-4/10 text-chart-4 border-chart-4/20'

    return (
      <Badge variant="outline" className={cn("text-xs font-medium", colorClass)}>
        <CalendarDays className="h-3 w-3 mr-1" />
        {formatDueDate(dueDate)}
      </Badge>
    )
  }

  const [error, setError] = useState<string | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showReadingForm, setShowReadingForm] = useState(false)
  const [editingTodo, setEditingTodo] = useState<ApiTodo | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [newTodo, setNewTodo] = useState<CreateTodoRequest>({
    title: '',
    description: '',
    priority: 'MEDIUM',
    type: 'OTHER',
    dueDate: undefined,
    courseIds: [],
    quizId: undefined,
    estimatedTime: undefined,
    tags: []
  })

  const [pagination, setPagination] = useState<any>(null)

  // Normalize a Todo from various API response shapes to avoid transient invalid objects
  const normalizeTodoFromResponse = (resp: any): ApiTodo | null => {
    console.log('Normalizing response:', resp)

    const cands = [
      resp?.data?.data?.todo,
      resp?.data?.todo,
      resp?.data?.data,
      resp?.data,
      resp?.todo,
      resp,
    ]

    for (const c of cands) {
      console.log('Checking candidate:', c)
      if (c && typeof c === 'object' && 'id' in c && 'title' in c) {
        // More flexible validation - only require id and title
        const normalized = {
          id: c.id,
          title: c.title,
          description: c.description || '',
          status: c.status || 'PENDING',
          priority: c.priority || 'MEDIUM',
          type: c.type || 'OTHER',
          dueDate: c.dueDate,
          courseIds: c.courseIds || [],
          courses: c.courses || [],
          estimatedTime: c.estimatedTime,
          tags: c.tags || [],
          createdAt: c.createdAt || new Date().toISOString(),
          updatedAt: c.updatedAt || new Date().toISOString(),
        }
        console.log('Normalized todo:', normalized)
        return normalized as ApiTodo
      }
    }

    console.log('Failed to normalize, no valid candidate found')
    return null
  }

  // Debug search query changes
  useEffect(() => {
    console.log('Search query changed to:', searchQuery)
  }, [searchQuery])

  // Load todos from API with server-side filtering (debounced)
  useEffect(() => {
    let handle: any;

    const loadTodos = async () => {
      try {
        if (!initialLoadDone) setLoading(true); else setFetching(true)
        setError(null)

        // Determine API parameters based on status filter
        let apiParams: any = {
          page,
          limit,
          type: selectedCategory !== 'ALL' ? selectedCategory : undefined,
          priority: selectedPriority !== 'ALL' ? selectedPriority : undefined,
          search: searchQuery || undefined,
        }

        // Handle status filtering according to new API behavior
        if (selectedStatus === 'ALL') {
          // Show all todos including completed
          apiParams.includeCompleted = true
        } else if (selectedStatus === 'COMPLETED') {
          // Show only completed todos
          apiParams.includeCompleted = true
          apiParams.status = 'COMPLETED'
        } else {
          // Show specific status (PENDING, IN_PROGRESS, OVERDUE)
          // For OVERDUE, we might need completed todos to determine overdue status
          apiParams.status = selectedStatus
          apiParams.includeCompleted = selectedStatus === 'OVERDUE'
        }

        const response = await StudentService.getTodos(apiParams)

        if (response.success) {
          // Accept shapes: {data:{data:{todos:[]}}}, {data:{todos:[]}}, {data:[]}
          const list = Array.isArray(response.data?.data?.todos)
            ? response.data!.data!.todos
            : Array.isArray(response.data?.todos)
              ? response.data!.todos
              : Array.isArray(response.data?.data)
                ? response.data!.data as any[]
                : Array.isArray(response.data)
                  ? (response.data as any[])
                  : []

          const todoList = Array.isArray(list) ? (list as ApiTodo[]) : []
          setTodos(todoList)

          // Normalize pagination info for consistent student UI
          const p: any = response.data?.data?.pagination
            || response.data?.data?.data?.pagination
            || response.data?.pagination
            || null
          if (p) {
            const current = p.currentPage ?? p.page ?? page ?? 1
            const lim = p.limit ?? limit ?? 12
            const totalItems = p.total ?? p.totalItems ?? 0
            const totalPages = p.totalPages ?? (lim ? Math.ceil(totalItems / lim) : 1)
            setPagination({
              page: current,
              totalPages,
              total: totalItems,
              limit: lim,
              hasPrev: current > 1,
              hasNext: current < totalPages,
            })
          } else {
            // Fallback: unknown total, only know current page
            setPagination({ page, totalPages: page, total: todoList.length, limit, hasPrev: page > 1, hasNext: false })
          }

          // Track if user has ever had todos (including completed ones)
          if (todoList.length > 0) {
            setHasEverHadTodos(true)
          }
        } else {
          setError(typeof response.error === 'string' ? response.error : 'Failed to load todos')
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Failed to load todos'
        setError(msg)
        toast.error(msg)
      } finally {
        if (!initialLoadDone) setInitialLoadDone(true)
        setLoading(false)
        setFetching(false)
      }
    }

    if (isAuthenticated) {
      handle = setTimeout(loadTodos, 400)
    }

    return () => handle && clearTimeout(handle)
  }, [isAuthenticated, selectedCategory, selectedPriority, selectedStatus, searchQuery, page, limit, initialLoadDone, refreshTrigger])

  // Enhanced filter and sort todos
  const filteredTodos = todos
    .filter(todo => {
      if (!todo) return false

      // Today's tasks filter
      if (showTodayOnly) {
        if (!todo.dueDate) return false
        const today = new Date()
        const dueDate = new Date(todo.dueDate)
        if (dueDate.toDateString() !== today.toDateString()) return false
      }

      // Client-side completed visibility (only applies when status filter is 'ALL')
      if (selectedStatus === 'ALL' && !showCompleted && todo.status === 'COMPLETED') return false

      // Search by title/description (defensive)
      const t = (todo.title ?? '').toLowerCase()
      const d = (todo.description ?? '').toLowerCase()
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        if (!t.includes(q) && !d.includes(q)) return false
      }

      // Type filter (client-side for additional filtering)
      if (selectedCategory !== 'ALL' && todo.type !== selectedCategory) return false
      // Priority filter (client-side for additional filtering)
      if (selectedPriority !== 'ALL' && todo.priority !== selectedPriority) return false

      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder: Record<string, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 }
          return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0)
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        default:
          if (!a.dueDate && !b.dueDate) return 0
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      }
    })

  // Kanban view organization
  const kanbanColumns = {
    overdue: filteredTodos.filter(todo => {
      if (!todo.dueDate || todo.status === 'COMPLETED') return false
      return new Date(todo.dueDate) < new Date()
    }),
    today: filteredTodos.filter(todo => {
      if (!todo.dueDate) return false
      const today = new Date()
      const dueDate = new Date(todo.dueDate)
      return dueDate.toDateString() === today.toDateString() && todo.status !== 'COMPLETED'
    }),
    upcoming: filteredTodos.filter(todo => {
      if (!todo.dueDate || todo.status === 'COMPLETED') return false
      const today = new Date()
      const dueDate = new Date(todo.dueDate)
      return dueDate > today && dueDate.toDateString() !== today.toDateString()
    }),
    completed: filteredTodos.filter(todo => todo.status === 'COMPLETED')
  }

  const handleSubmitTodo = async () => {
    if (!newTodo.title.trim()) {
      toast.error('Todo title is required')
      return
    }

    console.log('Before submit - searchQuery:', searchQuery)
    console.log('Before submit - newTodo.title:', newTodo.title)

    try {
      if (editingTodo) {
        const response = await StudentService.updateTodo(editingTodo.id, { ...newTodo, status: editingTodo.status } as UpdateTodoRequest)
        if (response.success && response.data) {
          const normalizedTodo = normalizeTodoFromResponse(response)
          if (normalizedTodo) {
            toast.success('Todo updated successfully')
            setShowCreateDialog(false)
            setTodos((prev) => prev.map((t) => (t.id === editingTodo.id ? normalizedTodo : t)))
            setEditingTodo(null)
          } else {
            // Fallback: try to use response.data directly
            console.log('Update normalization failed, trying fallback. Response:', response)
            const fallbackTodo = response.data as any
            if (fallbackTodo && typeof fallbackTodo === 'object' && fallbackTodo.id) {
              toast.success('Todo updated successfully')
              setShowCreateDialog(false)
              setTodos((prev) => prev.map((t) => (t.id === editingTodo.id ? fallbackTodo : t)))
              setEditingTodo(null)
            } else {
              toast.error('Failed to parse updated todo data')
              console.error('Update todo response structure:', response)
            }
          }
        } else {
          toast.error(typeof response.error === 'string' ? response.error : 'Failed to update todo')
        }
      } else {
        const response = await StudentService.createTodo(newTodo)
        if (response.success && response.data) {
          const normalizedTodo = normalizeTodoFromResponse(response)
          if (normalizedTodo) {
            toast.success('Todo created successfully')
            setShowCreateDialog(false)
            setTodos((prev) => [normalizedTodo, ...prev])
            setHasEverHadTodos(true) // Mark that user now has todos
            // Clear search query to ensure new todo is visible
            console.log('Clearing search query after successful creation')
            setSearchQuery('')
          } else {
            // Fallback: try to create todo object from response.data directly
            console.log('Normalization failed, trying fallback. Response:', response)
            const fallbackTodo = response.data as any
            if (fallbackTodo && typeof fallbackTodo === 'object' && fallbackTodo.title) {
              toast.success('Todo created successfully')
              setShowCreateDialog(false)
              setTodos((prev) => [fallbackTodo, ...prev])
              setHasEverHadTodos(true)
              // Clear search query to ensure new todo is visible
              setSearchQuery('')
            } else {
              toast.error('Failed to parse created todo data')
              console.error('Create todo response structure:', response)
            }
          }
        } else {
          toast.error(typeof response.error === 'string' ? response.error : 'Failed to create todo')
        }
      }

      // Reset form
      setNewTodo({
        title: '',
        description: '',
        priority: 'MEDIUM',
        type: 'OTHER',
        dueDate: undefined,
        courseIds: [],
        quizId: undefined,
        estimatedTime: undefined,
        tags: []
      })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to submit todo'
      toast.error(msg)
    }
  }

  const handleToggleTodo = async (todoId: number) => {
    try {
      const current = todos.find(t => t.id === todoId)
      if (!current) return

      let response
      if (current.status !== 'COMPLETED') {
        // Mark as completed - use updateTodo for consistency
        response = await StudentService.updateTodo(todoId, { status: 'COMPLETED' })
      } else {
        // Reopen task as IN_PROGRESS
        response = await StudentService.updateTodo(todoId, { status: 'IN_PROGRESS' })
      }

      if (response.success && response.data) {
        const normalizedTodo = normalizeTodoFromResponse(response)

        if (normalizedTodo) {
          setTodos(prev => prev.map(todo =>
            todo.id === todoId ? normalizedTodo : todo
          ))
          toast.success('Todo updated')
        } else {
          toast.error('Failed to parse updated todo data')

          // Fallback: optimistically update the status
          setTodos(prev => prev.map(todo =>
            todo.id === todoId
              ? { ...todo, status: current.status !== 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS' }
              : todo
          ))
        }
      } else {
        toast.error(typeof response.error === 'string' ? response.error : 'Failed to update todo')
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to update todo'
      toast.error(msg)
    }
  }

  const handleStarTodo = async (todo: ApiTodo) => {
    try {
      const response = await StudentService.updateTodo(todo.id, {
        // Use tags or metadata as needed; assuming backend supports a flag or storing in tags
        // Here we toggle a tag "STARRED" if not present, otherwise remove it
        tags: todo.tags?.includes('STARRED')
          ? todo.tags.filter(t => t !== 'STARRED')
          : [...(todo.tags || []), 'STARRED']
      })

      if (response.success && response.data) {
        const normalizedTodo = normalizeTodoFromResponse(response)
        if (normalizedTodo) {
          setTodos(prev => prev.map(t => t.id === todo.id ? normalizedTodo : t))
        } else {
          // Fallback: try to use response.data directly
          const fallbackTodo = response.data as any
          if (fallbackTodo && typeof fallbackTodo === 'object' && fallbackTodo.id) {
            setTodos(prev => prev.map(t => t.id === todo.id ? fallbackTodo : t))
          } else {
            // Optimistic update as last resort
            const updatedTags = todo.tags?.includes('STARRED')
              ? todo.tags.filter(t => t !== 'STARRED')
              : [...(todo.tags || []), 'STARRED']
            setTodos(prev => prev.map(t => t.id === todo.id ? { ...t, tags: updatedTags } : t))
          }
        }
      } else {
        toast.error(typeof response.error === 'string' ? response.error : 'Failed to update todo')
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to update todo'
      toast.error(msg)
    }
  }

  const handleToggleCourse = async (todoId: number, courseId: number) => {
    // Client-side only course completion tracking
    setTodos(prev => prev.map(todo => {
      if (todo.id === todoId && todo.courses) {
        const updatedCourses = todo.courses.map(course =>
          course.id === courseId
            ? { ...course, completed: !course.completed }
            : course
        )

        // Check if all courses are completed to update todo status
        const allCoursesCompleted = updatedCourses.every(course => course.completed)
        const anyCoursesCompleted = updatedCourses.some(course => course.completed)

        let newStatus = todo.status
        if (allCoursesCompleted && todo.status !== 'COMPLETED') {
          newStatus = 'COMPLETED'
        } else if (!anyCoursesCompleted && todo.status === 'COMPLETED') {
          newStatus = 'IN_PROGRESS'
        } else if (anyCoursesCompleted && todo.status === 'PENDING') {
          newStatus = 'IN_PROGRESS'
        }

        return {
          ...todo,
          courses: updatedCourses,
          status: newStatus
        }
      }
      return todo
    }))

    toast.success('Course progress updated')
  }

  const handleReadingTodoCreated = () => {
    // Refresh the todos list and return to main view
    setRefreshTrigger(prev => prev + 1)
    setShowReadingForm(false)
  }

  const handleEditTodo = (todo: ApiTodo) => {
    setEditingTodo(todo)
    setNewTodo({
      title: todo.title,
      description: todo.description || '',
      priority: todo.priority,
      type: todo.type,
      dueDate: todo.dueDate,
      courseIds: todo.courseIds,
      quizId: undefined, // Not available in current todo structure
      estimatedTime: todo.estimatedTime,
      tags: todo.tags || []
    })
    setShowCreateDialog(true)
  }

  const handleDeleteTodo = async (todoId: number) => {
    try {
      const response = await StudentService.deleteTodo(todoId)
      if (response.success) {
        setTodos(prev => prev.filter(t => t.id !== todoId))
        toast.success('Todo deleted')
      } else {
        toast.error(typeof response.error === 'string' ? response.error : 'Failed to delete todo')
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to delete todo'
      toast.error(msg)
    }
  }

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return 'Overdue'
    if (diffDays === 0) return 'Due today'
    if (diffDays === 1) return 'Due tomorrow'
    if (diffDays <= 7) return `Due in ${diffDays} days`

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getDueDateColor = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return 'text-destructive'
    if (diffDays === 0) return 'text-destructive/80'
    if (diffDays <= 3) return 'text-accent-foreground'
    return 'text-muted-foreground'
  }

  // Enhanced progress calculations
  const completedCount = todos.filter(todo => todo.status === 'COMPLETED').length
  const totalCount = todos.length
  const todayTodos = todos.filter(todo => {
    if (!todo.dueDate) return false
    const today = new Date()
    const dueDate = new Date(todo.dueDate)
    return dueDate.toDateString() === today.toDateString()
  })
  const todayCompletedCount = todayTodos.filter(todo => todo.status === 'COMPLETED').length
  const todayTotalCount = todayTodos.length
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const todayProgressPercentage = todayTotalCount > 0 ? Math.round((todayCompletedCount / todayTotalCount) * 100) : 0

  // Toggle description expansion
  const toggleDescription = (todoId: number) => {
    setExpandedDescriptions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(todoId)) {
        newSet.delete(todoId)
      } else {
        newSet.add(todoId)
      }
      return newSet
    })
  }

  // Truncate description helper
  const truncateDescription = (description: string, maxLines: number = 2) => {
    const words = description.split(' ')
    const wordsPerLine = 12 // Approximate words per line
    const maxWords = maxLines * wordsPerLine

    if (words.length <= maxWords) return description
    return words.slice(0, maxWords).join(' ') + '...'
  }

  if (authLoading || loading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  // Show reading form if requested
  if (showReadingForm) {
    return (
      <ReadingTodoForm
        onBack={() => setShowReadingForm(false)}
        onTodoCreated={handleReadingTodoCreated}
      />
    );
  }

  return (
    <div className="flex-1 space-y-6 p-0">
      {/* Enhanced Header with Progress */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-3 bg-primary/10 border border-primary/20 rounded-xl shadow-sm">
                <CheckSquare className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Todo Manager
                </h1>
                <p className="text-muted-foreground text-base sm:text-lg">
                  Stay organized and boost your productivity
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 self-start sm:self-center">
            {/* View Mode Toggle - Responsive */}
            <div className="flex items-center bg-muted/50 rounded-lg p-1">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8 px-2 sm:px-3 text-xs sm:text-sm"
              >
                <List className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                <span className="hidden sm:inline">List</span>
              </Button>
              <Button
                variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('kanban')}
                className="h-8 px-2 sm:px-3 text-xs sm:text-sm"
              >
                <Columns3 className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                <span className="hidden sm:inline">Kanban</span>
              </Button>
            </div>

            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200 px-3 sm:px-4 py-2 text-xs sm:text-sm"
              onClick={() => setShowReadingForm(true)}
            >
              <BookOpen className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Reading Todo</span>
              <span className="sm:hidden">Reading</span>
            </Button>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="shadow-md hover:shadow-lg transition-all duration-200 border-2 px-3 sm:px-4 py-2 text-xs sm:text-sm"
                  onClick={() => {
                    setEditingTodo(null)
                    setNewTodo({
                      title: '',
                      description: '',
                      priority: 'MEDIUM',
                      type: 'OTHER',
                      dueDate: undefined,
                      courseIds: [],
                      quizId: undefined,
                      estimatedTime: undefined,
                      tags: []
                    })
                    setSearchQuery('')
                  }}
                >
                  <Plus className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">New Todo</span>
                  <span className="sm:hidden">New</span>
                </Button>
              </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingTodo ? 'Edit Todo' : 'Create New Todo'}</DialogTitle>
              <DialogDescription>
                {editingTodo ? 'Update your todo details.' : 'Add a new task to your todo list.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter todo title"
                  value={newTodo.title}
                  onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Enter todo description"
                  value={newTodo.description}
                  onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newTodo.priority} onValueChange={(value: any) => setNewTodo({ ...newTodo, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={newTodo.type} onValueChange={(value: any) => setNewTodo({ ...newTodo, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SESSION">Session</SelectItem>
                      <SelectItem value="EXAM">Exam</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              {editingTodo && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={editingTodo.status} onValueChange={(value: any) => setEditingTodo({ ...editingTodo, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="OVERDUE">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date (Optional)</Label>
                <Input
                  id="dueDate"
                  type="datetime-local"
                  value={newTodo.dueDate ?? ''}
                  onChange={(e) => setNewTodo({ ...newTodo, dueDate: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitTodo}>
                {editingTodo ? 'Update Todo' : 'Create Todo'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

        </div>


        {/* Progress Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Today's Progress</h3>
            <div className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>

          <Card className="border-2 border-primary/10 bg-gradient-to-r from-primary/5 to-chart-1/5">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Today's Tasks</p>
                    <p className="text-2xl font-bold text-foreground">
                      {todayCompletedCount} of {todayTotalCount}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-muted-foreground">Overall Progress</p>
                    <p className="text-2xl font-bold text-foreground">
                      {completedCount} of {totalCount}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Today</span>
                      <span className="text-muted-foreground">{todayProgressPercentage}%</span>
                    </div>
                    <Progress
                      value={todayProgressPercentage}
                      className="h-2 bg-muted/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Overall</span>
                      <span className="text-muted-foreground">{progressPercentage}%</span>
                    </div>
                    <Progress
                      value={progressPercentage}
                      className="h-2 bg-muted/50"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Enhanced Filters and Search */}
      <div className="space-y-4">
        {/* Mobile-first responsive layout */}
        <div className="space-y-4">
          {/* Search Bar - Full width on mobile */}
          <div className="w-full">
            <div className="relative max-w-md mx-auto sm:mx-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search todos..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }}
                className="w-full pl-10 h-10 border-2 focus:border-primary/50 transition-colors"
              />
            </div>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-col space-y-4">
            {/* Dropdown Filters - Responsive grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              <Select value={selectedCategory} onValueChange={(v) => { setSelectedCategory(v); setPage(1) }}>
                <SelectTrigger className="w-full h-10 text-sm">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="READING">Reading</SelectItem>
                  <SelectItem value="SESSION">Session</SelectItem>
                  <SelectItem value="EXAM">Exam</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedPriority} onValueChange={(v) => { setSelectedPriority(v); setPage(1) }}>
                <SelectTrigger className="w-full h-10 text-sm">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Priorities</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={(v) => { setSelectedStatus(v); setPage(1) }}>
                <SelectTrigger className="w-full h-10 text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="OVERDUE">Overdue</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-full h-10 text-sm">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dueDate">Due Date</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="created">Created</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filter Checkboxes - Responsive layout */}
            <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4 pt-2 border-t border-border/50">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="show-today"
                  checked={showTodayOnly}
                  onCheckedChange={setShowTodayOnly}
                />
                <Label htmlFor="show-today" className="text-sm font-medium cursor-pointer">
                  Today's tasks
                </Label>
              </div>

              {selectedStatus === 'ALL' && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="show-completed"
                    checked={showCompleted}
                    onCheckedChange={setShowCompleted}
                  />
                  <Label htmlFor="show-completed" className="text-sm font-medium cursor-pointer">
                    Show completed
                  </Label>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Todos Content */}
      {filteredTodos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl"></div>
            <div className="relative bg-primary p-6 rounded-full">
              <CheckSquare className="h-12 w-12 text-primary-foreground" />
            </div>
          </div>

          <div className="text-center space-y-4 max-w-md">
            <h3 className="text-2xl font-bold text-foreground">
              {searchQuery || selectedCategory !== 'ALL' || selectedPriority !== 'ALL' || selectedStatus !== 'ALL'
                ? "No Todos Found"
                : !hasEverHadTodos
                  ? "Welcome to Your Todo Hub!"
                  : "All Clear!"
              }
            </h3>

            <p className="text-muted-foreground text-lg leading-relaxed">
              {searchQuery || selectedCategory !== 'ALL' || selectedPriority !== 'ALL' || selectedStatus !== 'ALL'
                ? "No todos match your current filters. Try adjusting your search or filters to find what you're looking for."
                : !hasEverHadTodos
                  ? "Start organizing your academic life with todos. Track assignments, study sessions, and important deadlines all in one place."
                  : "Great job! You've completed all your todos. Ready to add more tasks to stay productive?"
              }
            </p>

            {/* Show "Create Your First Todo" only if user has never had todos and no filters are applied */}
            {!hasEverHadTodos && !searchQuery && selectedCategory === 'ALL' && selectedPriority === 'ALL' && selectedStatus === 'ALL' ? (
              <div className="space-y-4 pt-4">
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => setShowReadingForm(true)}
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 touch-target"
                  >
                    <BookOpen className="mr-2 h-5 w-5" />
                    Create Reading Todo
                  </Button>
                  <Button
                    onClick={() => {
                      setEditingTodo(null)
                      setNewTodo({
                        title: '',
                        description: '',
                        priority: 'MEDIUM',
                        type: 'OTHER',
                        dueDate: undefined,
                        courseIds: [],
                        quizId: undefined,
                        estimatedTime: undefined,
                        tags: []
                      })
                      setSearchQuery('')
                      setShowCreateDialog(true)
                    }}
                    size="lg"
                    variant="outline"
                    className="font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 touch-target border-2"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Create Other Todo
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  ✨ Get started with your first task and boost your productivity
                </p>
              </div>
            ) : (
              /* Show regular "Add Todo" buttons for other cases */
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
                <Button
                  onClick={() => setShowReadingForm(true)}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 border-[2px] border-primary transition-all duration-200"
                >
                  <BookOpen className="mr-2 h-5 w-5" />
                  Add Reading Todo
                </Button>
                <Button
                  onClick={() => {
                    setEditingTodo(null)
                    setNewTodo({
                      title: '',
                      description: '',
                      priority: 'MEDIUM',
                      type: 'OTHER',
                      dueDate: undefined,
                      courseIds: [],
                      quizId: undefined,
                      estimatedTime: undefined,
                      tags: []
                    })
                    setSearchQuery('')
                    setShowCreateDialog(true)
                  }}
                  variant="outline"
                  size="lg"
                  className="px-6 py-3 border-[2px] border-border hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Add Other Todo
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : viewMode === 'kanban' ? (
        /* Kanban View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {Object.entries(kanbanColumns).map(([columnKey, columnTodos]) => (
            <div key={columnKey} className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                  {columnKey === 'overdue' && 'Overdue'}
                  {columnKey === 'today' && 'Today'}
                  {columnKey === 'upcoming' && 'Upcoming'}
                  {columnKey === 'completed' && 'Completed'}
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {columnTodos.length}
                </Badge>
              </div>

              <div className="space-y-3">
                {columnTodos.map((todo, idx) => (
                  <TodoCard
                    key={`kanban-${todo.id ?? idx}`}
                    todo={todo}
                    expandedDescriptions={expandedDescriptions}
                    toggleDescription={toggleDescription}
                    truncateDescription={truncateDescription}
                    handleEditTodo={handleEditTodo}
                    handleToggleTodo={handleToggleTodo}
                    handleDeleteTodo={handleDeleteTodo}
                    handleToggleCourse={handleToggleCourse}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-3">
          {filteredTodos.map((todo, idx) => (
            <TodoCard
              key={`list-${todo.id ?? idx}`}
              todo={todo}
              expandedDescriptions={expandedDescriptions}
              toggleDescription={toggleDescription}
              truncateDescription={truncateDescription}
              handleEditTodo={handleEditTodo}
              handleToggleTodo={handleToggleTodo}
              handleDeleteTodo={handleDeleteTodo}
              handleToggleCourse={handleToggleCourse}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t">
          <div className="text-sm text-muted-foreground text-center sm:text-left">
            Page {pagination.page} of {pagination.totalPages || 1} • {pagination.total} total tasks
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasPrev}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="h-9 px-3 sm:px-4 text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">Prev</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasNext}
              onClick={() => setPage(p => p + 1)}
              className="h-9 px-3 sm:px-4 text-xs sm:text-sm"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )

// TodoCard Component Definition
function TodoCard({ todo, expandedDescriptions, toggleDescription, truncateDescription, handleEditTodo, handleToggleTodo, handleDeleteTodo, handleToggleCourse }: {
  todo: ApiTodo
  expandedDescriptions: Set<number>
  toggleDescription: (id: number) => void
  truncateDescription: (desc: string, lines?: number) => string
  handleEditTodo: (todo: ApiTodo) => void
  handleToggleTodo: (id: number) => void
  handleDeleteTodo: (id: number) => void
  handleToggleCourse: (todoId: number, courseId: number) => void
}) {
  const TypeIcon = TYPE_ICONS[todo.type] || Circle
  const isCompleted = todo.status === 'COMPLETED'
  const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() && !isCompleted
  const isExpanded = expandedDescriptions.has(todo.id)
  const hasLongDescription = todo.description && todo.description.length > 120

  // Enhanced chip components using design system colors
  const PriorityChip = ({ priority }: { priority: string }) => (
    <Badge
      variant="outline"
      className={cn("text-xs font-medium", PRIORITY_CHIP_COLORS[priority])}
    >
      <Flag className="h-3 w-3 mr-1" />
      {priority}
    </Badge>
  )

  const StatusChip = ({ status }: { status: string }) => (
    <Badge
      variant="outline"
      className={cn("text-xs font-medium", STATUS_CHIP_COLORS[status])}
    >
      {status === 'COMPLETED' && <CheckCircle2 className="h-3 w-3 mr-1" />}
      {status === 'IN_PROGRESS' && <Clock className="h-3 w-3 mr-1" />}
      {status === 'OVERDUE' && <AlertCircle className="h-3 w-3 mr-1" />}
      {status === 'PENDING' && <Circle className="h-3 w-3 mr-1" />}
      {status.replace('_', ' ')}
    </Badge>
  )

  const DueDateChip = ({ dueDate }: { dueDate: string }) => {
    const date = new Date(dueDate)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    let colorClass = 'bg-muted text-muted-foreground border-border'
    if (diffDays < 0) colorClass = 'bg-destructive/10 text-destructive border-destructive/20'
    else if (diffDays === 0) colorClass = 'bg-chart-4/10 text-chart-4 border-chart-4/20'

    const formatDueDate = (dateString: string) => {
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = date.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays < 0) return 'Overdue'
      if (diffDays === 0) return 'Due today'
      if (diffDays === 1) return 'Due tomorrow'
      if (diffDays <= 7) return `Due in ${diffDays} days`

      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    }

    return (
      <Badge variant="outline" className={cn("text-xs font-medium", colorClass)}>
        <CalendarDays className="h-3 w-3 mr-1" />
        {formatDueDate(dueDate)}
      </Badge>
    )
  }

  return (
    <Card
      className={cn(
        "group relative transition-all duration-200 hover:shadow-md border rounded-xl overflow-hidden",
        "hover:border-primary/30 hover:bg-gradient-to-r hover:from-background hover:to-primary/5",
        isCompleted && "opacity-75 bg-muted/20",
        isOverdue && "border-destructive/30 bg-destructive/5"
      )}
    >
      <CardContent className="p-5">
        {/* Hover Actions */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex items-center gap-1 bg-background/95 backdrop-blur-sm rounded-lg border shadow-sm p-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
              onClick={() => handleEditTodo(todo)}
            >
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-chart-1/10 hover:text-chart-1"
              onClick={() => handleToggleTodo(todo.id)}
            >
              <CheckCircle2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
              onClick={() => handleDeleteTodo(todo.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start gap-3">
            <Checkbox
              checked={isCompleted}
              onCheckedChange={() => handleToggleTodo(todo.id)}
              className="mt-1 transition-all duration-200"
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <TypeIcon className={cn(
                  "h-4 w-4 flex-shrink-0",
                  isCompleted ? "text-muted-foreground" : "text-primary"
                )} />
                <h3 className={cn(
                  "font-semibold text-lg leading-tight transition-colors",
                  isCompleted && "line-through text-muted-foreground",
                  !isCompleted && "text-foreground group-hover:text-primary"
                )}>
                  {todo.title}
                </h3>
                {todo.tags?.includes('STARRED') && (
                  <Star className="h-4 w-4 text-chart-4 fill-current flex-shrink-0" />
                )}
              </div>

              {/* Description with Show More/Less */}
              {todo.description && (
                <div className="mb-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {hasLongDescription && !isExpanded
                      ? truncateDescription(todo.description)
                      : todo.description
                    }
                  </p>
                  {hasLongDescription && (
                    <button
                      onClick={() => toggleDescription(todo.id)}
                      className="text-xs text-primary hover:text-primary/80 font-medium mt-1 transition-colors"
                    >
                      {isExpanded ? (
                        <span className="flex items-center gap-1">
                          Show less <ChevronUp className="h-3 w-3" />
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          Show more <ChevronDown className="h-3 w-3" />
                        </span>
                      )}
                    </button>
                  )}
                </div>
              )}

              {/* Metadata Chips */}
              <div className="flex flex-wrap items-center gap-2">
                <PriorityChip priority={todo.priority} />
                <StatusChip status={todo.status} />
                {todo.dueDate && <DueDateChip dueDate={todo.dueDate} />}

                <Badge variant="outline" className="text-xs font-medium bg-muted/50 text-muted-foreground border-border">
                  <TypeIcon className="h-3 w-3 mr-1" />
                  {todo.type}
                </Badge>

                {(todo.tags ?? []).filter(tag => tag !== 'STARRED').map(tag => (
                  <Badge key={`${todo.id}-${tag}`} variant="outline" className="text-xs font-medium bg-accent/50 text-accent-foreground border-accent">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Course Information for Reading Todos */}
          {todo.type === 'READING' && todo.courses && todo.courses.length > 0 && (
            <div className="border-t pt-3 space-y-2">
              <div className="text-xs font-medium text-muted-foreground mb-2">
                {todo.courses.length > 1 ? `Courses (${todo.courses.length}):` : 'Course:'}
              </div>
              {todo.courses.map((course, courseIndex) => (
                <div key={course.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox
                    checked={course.completed || false}
                    onCheckedChange={() => handleToggleCourse(todo.id, course.id)}
                    className="transition-all duration-200"
                  />
                  <div className="flex-1 min-w-0">
                    <span className={cn(
                      "text-sm font-medium",
                      course.completed && "line-through text-muted-foreground"
                    )}>
                      {course.name}
                    </span>
                    {course.moduleName && (
                      <span className="text-xs text-muted-foreground ml-2">
                        • {course.moduleName}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}


}
