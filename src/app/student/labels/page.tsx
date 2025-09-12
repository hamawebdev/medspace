// @ts-nocheck
'use client'

/**
 * Student Labels Page - Direct Label Display
 *
 * Workflow:
 * 1. Fetch all student labels directly from the API
 * 2. Display labels with their associated questions
 * 3. Allow create, edit, delete operations
 * 4. Enable starting practice sessions from labels
 *
 * API Endpoints Used:
 * - GET /api/v1/students/labels - Get all labels with questions
 * - POST /api/v1/students/labels - Create new label
 * - PUT /api/v1/students/labels/{id} - Update label
 * - DELETE /api/v1/students/labels/{id} - Delete label
 * - GET /api/v1/students/labels/{labelId}/sessions - Get existing sessions for a label
 * - POST /api/v1/quizzes/create-session-by-questions - Create new practice session
 * - GET /api/v1/quiz-sessions/{sessionId} - Load existing session
 */

import { useState, useEffect } from 'react'
import { Plus, Filter, X, BookOpen, GraduationCap, Play, Loader2, Edit, Trash2, Tag } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label as UILabel } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { LoadingSpinner } from '@/components/loading-states'
import { EmptyState } from '@/components/ui/empty-state'
import { useStudentAuth } from '@/hooks/use-auth'
import { StudentService, QuizService } from '@/lib/api-services'
import { toast } from 'sonner'


export default function LabelsPage() {
  const { isAuthenticated, loading: authLoading } = useStudentAuth()
  const router = useRouter()

  // Labels data state
  const [labelsData, setLabelsData] = useState<any[]>([])
  const [labelsLoading, setLabelsLoading] = useState(false)
  const [labelsError, setLabelsError] = useState<string | null>(null)

  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const limit = 12

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [creatingSessionId, setCreatingSessionId] = useState<number | null>(null)
  const [loadingSessionId, setLoadingSessionId] = useState<number | null>(null)
  const [labelSessions, setLabelSessions] = useState<{[labelId: number]: any[]}>({})

  const [newLabelName, setNewLabelName] = useState('')

  // Fetch all labels directly
  const fetchLabels = async () => {
    try {
      setLabelsLoading(true)
      setLabelsError(null)

      const response = await StudentService.getLabels()

      if (response.success && response.data) {
        // Handle new API response structure
        const labels = response.data.data || response.data || []
        setLabelsData(Array.isArray(labels) ? labels : [])
      } else {
        throw new Error(response.error || 'Failed to fetch labels')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load labels'
      setLabelsError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLabelsLoading(false)
    }
  }

  const handleCreateLabel = async () => {
    const name = newLabelName.trim()
    if (!name) {
      toast.error('Label name is required')
      return
    }
    try {
      await StudentService.createLabel({ name })
      setShowCreateDialog(false)
      setNewLabelName('')
      toast.success('Label created successfully')
      // Refresh labels
      fetchLabels()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create label'
      toast.error(errorMessage)
    }
  }

  const handleUpdateLabel = async (labelId: number, name: string) => {
    try {
      await StudentService.updateLabel(labelId, { name })
      setEditId(null)
      setEditName('')
      toast.success('Label updated successfully')
      // Refresh labels
      fetchLabels()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update label'
      toast.error(errorMessage)
    }
  }

  const handleDeleteLabel = async (labelId: number) => {
    try {
      await StudentService.deleteLabel(labelId)
      setDeletingId(null)
      toast.success('Label deleted successfully')
      // Refresh labels
      fetchLabels()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete label'
      toast.error(errorMessage)
    }
  }



  // Helper function to sanitize title for API compatibility
  const sanitizeTitle = (title: string): string => {
    return title
      // Replace common problematic characters
      .replace(/&/g, 'and')           // & -> and
      .replace(/[<>]/g, '')           // Remove < >
      .replace(/['"]/g, '')           // Remove quotes
      .replace(/[{}[\]]/g, '')        // Remove brackets
      .replace(/[|\\]/g, '')          // Remove pipes and backslashes
      .replace(/[^\w\s\-().,:]/g, '') // Keep only alphanumeric, spaces, hyphens, parentheses, periods, commas, colons
      .replace(/\s+/g, ' ')           // Normalize multiple spaces to single space
      .trim()                         // Remove leading/trailing whitespace
      .substring(0, 100);             // Limit length to 100 characters
  }

  // Fetch existing sessions for a label
  const fetchLabelSessions = async (labelId: number) => {
    try {
      const response = await StudentService.getLabelSessions(labelId)
      if (response.success && response.data) {
        return response.data
      }
      return []
    } catch (error) {
      console.error('Error fetching label sessions:', error)
      // If the endpoint doesn't exist yet, return empty array
      return []
    }
  }

  // Load an existing session using GET /quiz-sessions/{sessionId}
  const handleLoadSession = async (sessionId: number, labelId: number) => {
    try {
      setLoadingSessionId(labelId)

      const response = await QuizService.getQuizSession(sessionId)

      if (response.success && response.data) {
        toast.success('Session loaded successfully!')
        router.push(`/session/${sessionId}`)
      } else {
        throw new Error(response.error || 'Failed to load session')
      }
    } catch (error) {
      console.error('Error loading session:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to load session'
      toast.error(errorMessage)
    } finally {
      setLoadingSessionId(null)
    }
  }

  // Create practice session from label using create-session-by-questions endpoint
  const handleStartPractice = async (label: any) => {
    if (!label.questionIds || label.questionIds.length === 0) {
      toast.error('No questions available in this label')
      return
    }

    try {
      setCreatingSessionId(label.id)

      // Create session using the unified endpoint with label's question IDs
      const response = await QuizService.createSessionByQuestions({
        type: 'PRACTICE',
        questionIds: label.questionIds,
        title: `Practice Session - ${label.name}`
      })

      if (response.success && response.data) {
        const sessionId = response.data.sessionId || response.data.id
        toast.success(`Practice session created with ${label.questionIds.length} questions!`)
        router.push(`/session/${sessionId}`)
      } else {
        throw new Error(response.error || 'Failed to create practice session')
      }
    } catch (error) {
      console.error('Error creating practice session:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to create practice session'
      toast.error(errorMessage)
    } finally {
      setCreatingSessionId(null)
    }
  }

  // Filter and paginate labels
  const filteredLabels = labelsData ?
    labelsData.filter(l => l.name.toLowerCase().includes(q.toLowerCase())) : []
  const totalPages = Math.max(1, Math.ceil(filteredLabels.length / limit))
  const pageItems = filteredLabels.slice((page - 1) * limit, page * limit)

  const hasLabels = labelsData && labelsData.length > 0

  // Load sessions for all labels
  const loadAllLabelSessions = async () => {
    if (!labelsData || labelsData.length === 0) return

    const sessionsMap: {[labelId: number]: any[]} = {}

    // Fetch sessions for each label
    await Promise.all(
      labelsData.map(async (label) => {
        const sessions = await fetchLabelSessions(label.id)
        sessionsMap[label.id] = sessions
      })
    )

    setLabelSessions(sessionsMap)
  }

  // Fetch labels on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchLabels()
    }
  }, [isAuthenticated])

  // Load sessions when labels are loaded
  useEffect(() => {
    if (labelsData && labelsData.length > 0) {
      loadAllLabelSessions()
    }
  }, [labelsData])

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-primary flex items-center justify-center shadow-lg">
                <Tag className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  My Labels
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">
                  Organize and categorize your study content
                </p>
              </div>
            </div>

            {/* Create Label Button */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="h-10 px-4 bg-primary text-primary-foreground hover:bg-primary/90">
                    <Plus className="mr-2 h-4 w-4" />
                    New Label
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Label</DialogTitle>
                    <DialogDescription>
                      Add a new label for your notes, questions, or sessions.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <UILabel htmlFor="name">Name</UILabel>
                      <Input
                        id="name"
                        placeholder="e.g. Exam Prep"
                        value={newLabelName}
                        onChange={(e) => setNewLabelName(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateLabel}>
                      Create Label
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
          </div>
        </div>

        {/* Loading State */}
        {labelsLoading && (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* Error State */}
        {labelsError && (
          <Card className="border-destructive/50 bg-destructive/5">
            <div className="p-6">
              <div className="text-destructive text-center">
                <p className="font-medium">Failed to load labels</p>
                <p className="text-sm mt-1 text-destructive/80">{labelsError}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => fetchLabels()}
                >
                  Try Again
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Content */}
        {!labelsLoading && !labelsError && (
          <div className="space-y-6">
                {/* Search and Controls */}
                {hasLabels && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                    <div className="relative flex-1 max-w-lg">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <Input
                        placeholder="Search your labels..."
                        value={q}
                        onChange={(e) => { setQ(e.target.value); setPage(1) }}
                        className="pl-10 h-10 border-border/50 focus:border-primary/50"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-sm px-3 py-1.5 font-medium">
                        {filteredLabels.length} label{filteredLabels.length !== 1 ? 's' : ''} found
                      </Badge>
                    </div>
                  </div>
                )}

                {!hasLabels ? (
                  <EmptyState
                    icon={Tag}
                    title="No Labels Found"
                    description="Create labels to organize your study content."
                  />
                ) : pageItems.length === 0 ? (
                  <EmptyState
                    icon={Tag}
                    title={q ? 'No matching labels' : 'No labels yet'}
                    description={q ?
                      'Try adjusting your search criteria to find what you\'re looking for.' :
                      'Labels help you organize and categorize your study materials for easier access and better learning outcomes.'
                    }
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {pageItems.map((l) => (
                      <Card key={l.id} className="group border-border/50 shadow-sm hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:border-primary/30 bg-card/50 backdrop-blur-sm hover:bg-card/80">
                        <CardContent className="p-6">
                          <div className="flex flex-col space-y-4">
                            {/* Label Header */}
                            <div className="text-center space-y-2">
                              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto group-hover:bg-primary/15 transition-colors duration-300">
                                <Tag className="h-6 w-6 text-primary" />
                              </div>
                              <h3 className="text-xl font-bold text-card-foreground group-hover:text-primary transition-colors duration-300 leading-tight">{l.name}</h3>
                            </div>

                            {/* Questions Count */}
                            <div className="text-center">
                              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50">
                                <BookOpen className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium text-muted-foreground">
                                  {l.questionIds?.length || 0} question{(l.questionIds?.length || 0) !== 1 ? 's' : ''}
                                </span>
                              </div>
                            </div>

                            {/* Existing Sessions */}
                            {labelSessions[l.id] && labelSessions[l.id].length > 0 && (
                              <div className="space-y-2">
                                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                  Existing Sessions
                                </div>
                                <div className="space-y-1">
                                  {labelSessions[l.id].slice(0, 2).map((session: any) => (
                                    <Button
                                      key={session.id}
                                      variant="outline"
                                      size="sm"
                                      className="w-full h-8 text-xs justify-start"
                                      onClick={() => handleLoadSession(session.id, l.id)}
                                      disabled={loadingSessionId === l.id}
                                    >
                                      {loadingSessionId === l.id ? (
                                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                      ) : (
                                        <Play className="mr-2 h-3 w-3" />
                                      )}
                                      {session.title || `Session ${session.id}`}
                                      {session.status && (
                                        <Badge variant="secondary" className="ml-auto text-xs">
                                          {session.status}
                                        </Badge>
                                      )}
                                    </Button>
                                  ))}
                                  {labelSessions[l.id].length > 2 && (
                                    <div className="text-xs text-muted-foreground text-center">
                                      +{labelSessions[l.id].length - 2} more sessions
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-3 pt-2">
                              {/* Start New Session Button */}
                              <Button
                                className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-medium shadow-sm hover:shadow-md transition-all duration-200"
                                onClick={() => handleStartPractice(l)}
                                disabled={!l.questionIds || l.questionIds.length === 0 || creatingSessionId === l.id}
                              >
                                {creatingSessionId === l.id ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                  </>
                                ) : (
                                  <>
                                    <Play className="mr-2 h-4 w-4" />
                                    Start New Session
                                  </>
                                )}
                              </Button>

                              {/* Secondary Actions */}
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => { setEditId(l.id); setEditName(l.name) }}
                                  className="flex-1 h-9 hover:bg-muted/50 border-border/50"
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-9 px-3 text-destructive hover:text-destructive hover:bg-destructive/5 border-destructive/20 hover:border-destructive/30"
                                  onClick={() => setDeletingId(l.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

        {/* Pagination */}
        {hasLabels && totalPages > 1 && (
          <Card className="mt-8 border-border/50 shadow-sm">
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground font-medium">
                  Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, filteredLabels.length)} of {filteredLabels.length} labels
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="min-h-[36px]"
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPage(pageNum)}
                          className="min-h-[36px] min-w-[36px]"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className="min-h-[36px]"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit Label Dialog */}
        <Dialog open={editId !== null} onOpenChange={(open) => { if (!open) { setEditId(null); setEditName('') } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Label</DialogTitle>
              <DialogDescription>Update the label name.</DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <UILabel htmlFor="editName">Name</UILabel>
              <Input id="editName" value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setEditId(null); setEditName('') }}>Cancel</Button>
              <Button onClick={async () => {
                if (editId && editName.trim()) {
                  await handleUpdateLabel(editId, editName.trim());
                } else {
                  toast.error('Name is required');
                }
              }}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirm */}
        <Dialog open={deletingId !== null} onOpenChange={(open) => { if (!open) setDeletingId(null) }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Label</DialogTitle>
              <DialogDescription>This action cannot be undone.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeletingId(null)}>Cancel</Button>
              <Button variant="destructive" onClick={async () => {
                if (deletingId) {
                  await handleDeleteLabel(deletingId);
                }
              }}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
