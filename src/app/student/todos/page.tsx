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
  GraduationCap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
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

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'text-muted-foreground bg-muted/50 border-border',
  MEDIUM: 'text-foreground bg-accent/50 border-border',
  HIGH: 'text-destructive bg-destructive/10 border-destructive/20',
}

const TYPE_ICONS: Record<string, any> = {
  READING: BookOpen,
  QUIZ: Search,
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
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'created'>('dueDate')
  const [page, setPage] = useState(1)
  const [limit] = useState(12)
  const StatusBadge = ({ status }: { status: string }) => (
    <Badge variant="outline" className="text-xs">
      {status}
    </Badge>
  )

  const [error, setError] = useState<string | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingTodo, setEditingTodo] = useState<ApiTodo | null>(null)
  const [newTodo, setNewTodo] = useState<CreateTodoRequest>({
    title: '',
    description: '',
    priority: 'MEDIUM',
    type: 'READING',
    dueDate: undefined,
    courseId: undefined,
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
          courseId: c.courseId,
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
  }, [isAuthenticated, selectedCategory, selectedPriority, selectedStatus, searchQuery, page, limit, initialLoadDone])

  // Filter and sort todos
  const filteredTodos = todos
    .filter(todo => {
      if (!todo) return false

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

      // Note: Status filtering is now handled server-side, so we don't need client-side status filtering
      // unless we want to add additional client-side refinement

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
        type: 'READING',
        dueDate: undefined,
        courseId: undefined,
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

  const handleEditTodo = (todo: ApiTodo) => {
    setEditingTodo(todo)
    setNewTodo({
      title: todo.title,
      description: todo.description || '',
      priority: todo.priority,
      type: todo.type,
      dueDate: todo.dueDate,
      courseId: todo.courseId,
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

  const completedCount = todos.filter(todo => todo.status === 'COMPLETED').length
  const totalCount = todos.length

  if (authLoading || loading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />

        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 border border-primary/20 rounded-lg">
              <CheckSquare className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                Todos
              </h2>
              <p className="text-muted-foreground">
                Manage your tasks and stay organized with your studies.
              </p>
            </div>
          </div>

          {/* Progress indicator */}
          {totalCount > 0 && (
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500 ease-out"
                    style={{ width: `${(completedCount / totalCount) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm text-muted-foreground">
                  {completedCount} of {totalCount} completed
                </span>
              </div>
              {completedCount === totalCount && totalCount > 0 && (
                <Badge className="bg-green-500 text-white animate-pulse">
                  🎉 All Done!
                </Badge>
              )}
            </div>
          )}
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              onClick={() => {
                setEditingTodo(null)
                setNewTodo({
                  title: '',
                  description: '',
                  priority: 'MEDIUM',
                  type: 'READING',
                  dueDate: undefined,
                  courseId: undefined,
                  quizId: undefined,
                  estimatedTime: undefined,
                  tags: []
                })
                // Ensure search is clear when creating new todo
                console.log('Opening dialog, clearing search query')
                setSearchQuery('')
              }}
            >
              <Plus className="mr-2 h-5 w-5" />
              New Todo
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
                      <SelectItem value="READING">Reading</SelectItem>
                      <SelectItem value="QUIZ">Quiz</SelectItem>
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

      <Separator />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 border border-primary/20 rounded-lg">
                <CheckSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-bold">{totalCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted/50 border border-border rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/50 border border-border rounded-lg">
                <AlertCircle className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p className="text-2xl font-bold">{totalCount - completedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search todos..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }}
              className="pl-10"
            />
          </div>

          <Select value={selectedCategory} onValueChange={(v) => { setSelectedCategory(v); setPage(1) }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="READING">Reading</SelectItem>
              <SelectItem value="QUIZ">Quiz</SelectItem>
              <SelectItem value="SESSION">Session</SelectItem>
              <SelectItem value="EXAM">Exam</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedPriority} onValueChange={(v) => { setSelectedPriority(v); setPage(1) }}>
            <SelectTrigger className="w-[140px]">
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
            <SelectTrigger className="w-[160px]">
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
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dueDate">Due Date</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="created">Created</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Show completed checkbox only when status filter is 'ALL' */}
        {selectedStatus === 'ALL' && (
          <div className="flex items-center gap-2">
            <Checkbox
              id="show-completed"
              checked={showCompleted}
              onCheckedChange={setShowCompleted}
            />
            <Label htmlFor="show-completed" className="text-sm">
              Show completed
            </Label>
          </div>
        )}
      </div>

      {/* Todos Content */}
      {filteredTodos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl"></div>
            <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 p-6 rounded-full">
              <CheckSquare className="h-12 w-12 text-white" />
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
                <Button
                  onClick={() => {
                    setEditingTodo(null)
                    setNewTodo({
                      title: '',
                      description: '',
                      priority: 'MEDIUM',
                      type: 'READING',
                      dueDate: undefined,
                      courseId: undefined,
                      quizId: undefined,
                      estimatedTime: undefined,
                      tags: []
                    })
                    setSearchQuery('')
                    setShowCreateDialog(true)
                  }}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 touch-target"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Create Your First Todo
                </Button>
                <p className="text-sm text-muted-foreground">
                  ✨ Get started with your first task and boost your productivity
                </p>
              </div>
            ) : (
              /* Show regular "Add Todo" button for other cases */
              <Button
                onClick={() => {
                  setEditingTodo(null)
                  setNewTodo({
                    title: '',
                    description: '',
                    priority: 'MEDIUM',
                    type: 'READING',
                    dueDate: undefined,
                    courseId: undefined,
                    quizId: undefined,
                    estimatedTime: undefined,
                    tags: []
                  })
                  setSearchQuery('')
                  setShowCreateDialog(true)
                }}
                variant="outline"
                size="lg"
                className="mt-4 px-6 py-3 border-2 hover:bg-primary hover:text-primary-foreground transition-all duration-200"
              >
                <Plus className="mr-2 h-5 w-5" />
                Add New Todo
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTodos.map((todo, idx) => {
            const TypeIcon = TYPE_ICONS[todo.type] || Circle
            const isCompleted = todo.status === 'COMPLETED'
            const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() && !isCompleted

            return (
              <Card
                key={`todo-${todo.id ?? idx}`}
                className={cn(
                  "group transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 border-l-4 cursor-pointer",
                  isCompleted && "opacity-70 bg-muted/30",
                  isOverdue && "border-l-destructive bg-destructive/5",
                  !isOverdue && !isCompleted && todo.priority === 'HIGH' && "border-l-destructive",
                  !isOverdue && !isCompleted && todo.priority === 'MEDIUM' && "border-l-primary",
                  !isOverdue && !isCompleted && todo.priority === 'LOW' && "border-l-muted-foreground",
                  isCompleted && "border-l-muted-foreground"
                )}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <Checkbox
                        checked={isCompleted}
                        onCheckedChange={() => handleToggleTodo(todo.id)}
                        className={cn(
                          "mt-1 transition-all duration-200",
                          isCompleted && "data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                        )}
                      />
                      {isCompleted && (
                        <div className="absolute inset-0 bg-green-500/20 rounded-sm animate-pulse"></div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center gap-2">
                              <TypeIcon className={cn(
                                "h-4 w-4",
                                isCompleted ? "text-muted-foreground" : "text-primary"
                              )} />
                              <h3 className={cn(
                                "font-semibold text-lg transition-all duration-200",
                                isCompleted && "line-through text-muted-foreground",
                                !isCompleted && "text-foreground group-hover:text-primary"
                              )}>
                                {todo.title}
                              </h3>
                            </div>
                            {todo.tags?.includes('STARRED') && (
                              <Star className="h-4 w-4 text-yellow-500 fill-current animate-pulse" />
                            )}
                            {isOverdue && (
                              <Badge variant="destructive" className="text-xs animate-pulse">
                                Overdue
                              </Badge>
                            )}
                          </div>

                          {todo.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {todo.description}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-2">
                            <Badge
                              variant="outline"
                              className={cn("text-xs", PRIORITY_COLORS[todo.priority])}
                            >
                              <Flag className="h-3 w-3 mr-1" />
                              {todo.priority}
                            </Badge>

                            <Badge variant="secondary" className="text-xs">
                              <TypeIcon className="h-3 w-3 mr-1" />
                              {todo.type}
                            </Badge>

                            {todo.dueDate && (
                              <Badge variant="outline" className={cn("text-xs", getDueDateColor(todo.dueDate))}>
                                <Clock className="h-3 w-3 mr-1" />
                                {formatDueDate(todo.dueDate)}
                              </Badge>
                            )}

                            <StatusBadge status={todo.status} />
                            {(todo.tags ?? []).map(tag => (
                              <Badge key={`${todo.id}-${tag}`} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditTodo(todo)}>
                              <Edit3 className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStarTodo(todo)}>
                              <Star className="mr-2 h-4 w-4" />
                              {todo.tags?.includes('STARRED') ? 'Unstar' : 'Star'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleTodo(todo.id)}>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              {todo.status === 'COMPLETED' ? 'Mark as In Progress' : 'Mark as Completed'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteTodo(todo.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages || 1}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={!pagination.hasPrev} onClick={() => setPage(p => Math.max(1, p - 1))}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={!pagination.hasNext} onClick={() => setPage(p => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}
        </div>
      )}
    </div>
  )
}
