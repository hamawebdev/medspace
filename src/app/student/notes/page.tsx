// @ts-nocheck
'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, Calendar, StickyNote, Edit2, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingSpinner } from '@/components/loading-states'
import { useStudentAuth } from '@/hooks/use-auth'
import { useNotes } from '@/hooks/use-student-organization'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'


export default function NotesPage() {
  const { isAuthenticated, loading: authLoading } = useStudentAuth()
  const searchParams = useSearchParams()
  const router = useRouter()

  const [page, setPage] = useState<number>(Number(searchParams.get('page')) || 1)
  const [limit] = useState<number>(Number(searchParams.get('limit')) || 12)
  const [rawSearch, setRawSearch] = useState(searchParams.get('q') || '')
  const [searchQuery, setSearchQuery] = useState(rawSearch)
  const [questionId] = useState<number | undefined>(
    searchParams.get('questionId') ? Number(searchParams.get('questionId')) : undefined
  )
  const [quizId] = useState<number | undefined>(
    searchParams.get('quizId') ? Number(searchParams.get('quizId')) : undefined
  )

  const { notes, groupedNotes, totalNotes, totalModules, pagination, loading, updateNote, deleteNote } = useNotes({
    page,
    limit,
    search: searchQuery || undefined,
    questionId,
    quizId,
  })
  // labels removed from UI per request
  const labels = [] as any[]; const labelsLoading = false

  // Keep URL in sync
  useEffect(() => {
    const params = new URLSearchParams()
    if (page) params.set('page', String(page))
    if (limit) params.set('limit', String(limit))
    if (searchQuery) params.set('q', searchQuery)
    if (questionId) params.set('questionId', String(questionId))
    if (quizId) params.set('quizId', String(quizId))
    router.replace(`?${params.toString()}`)
  }, [page, limit, searchQuery, questionId, quizId, router])

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric'
      })
    } catch {
      return ''
    }
  }

  const list = Array.isArray(notes) ? notes : []

  // Edit/Delete state
  const [editing, setEditing] = useState<any | null>(null)
  const [editText, setEditText] = useState('')

  const [localSaving, setLocalSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)

  // Debounced search to avoid extra loading states
  useEffect(() => {
    const id = setTimeout(() => {
      setSearchQuery(rawSearch)
      setPage(1)
    }, 300)
    return () => clearTimeout(id)
  }, [rawSearch])
  const openEdit = (note: any) => {
    setEditing(note)
    setEditText(note.noteText || '')
  }

  const saveEdit = async () => {
    if (!editing) return
    try {
      const next = (editText || '').trim()
      const prev = (editing.noteText || '').trim()
      if (next === prev) {
        toast.info('No changes to save')
        setEditing(null)
        return
      }
      setLocalSaving(true)
      await updateNote(editing.id, { noteText: editText })
      setEditing(null)
    } finally {
      setLocalSaving(false)
    }
  }

  const requestDelete = (noteId: number) => setDeleteTarget(noteId)
  const confirmDelete = async () => {
    if (deleteTarget == null) return
    await deleteNote(deleteTarget)
    setDeleteTarget(null)
  }

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
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-primary flex items-center justify-center shadow-lg">
                <StickyNote className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  My Notes
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">
                  Notes are created inside practice and exam sessions
                </p>
              </div>
            </div>
          </div>

          {/* Search Section */}
          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="relative max-w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search your notes..."
                  value={rawSearch}
                  onChange={(e) => setRawSearch(e.target.value)}
                  className="pl-10 border-border/50 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 dark:focus:border-blue-600 dark:focus:ring-blue-900/20 min-h-[44px]"
                />
              </div>
            </CardContent>
          </Card>
        </div>

      {list.length === 0 ? (
        <EmptyState
          icon={StickyNote}
          title="No Notes Found"
          description={questionId || quizId ? "No notes for this context yet." : "You haven’t created any notes yet. Add notes while answering questions in a practice or exam session."}
        />
      ) : (
        <>
          {/* Display grouped notes if available, otherwise fall back to flat list */}
          {groupedNotes && groupedNotes.length > 0 ? (
            <div className="space-y-8">
              {/* Summary stats */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{totalNotes} notes across {totalModules} modules</span>
              </div>

              {/* Grouped by module */}
              {groupedNotes.map((moduleGroup) => (
                <div key={moduleGroup.module.id} className="space-y-4">
                  <div className="border-b pb-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      {moduleGroup.module.name}
                    </h3>
                    {moduleGroup.module.description && (
                      <p className="text-sm text-muted-foreground">
                        {moduleGroup.module.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {moduleGroup.notes.length} note{moduleGroup.notes.length !== 1 ? 's' : ''}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {moduleGroup.notes.map((note) => (
                      <Card key={note.id} className="hover:shadow-sm transition-shadow">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between gap-3">
                            <CardTitle className="text-base">
                              {note.question?.questionText ? note.question.questionText : 'Note'}
                            </CardTitle>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm" onClick={() => openEdit(note)}>
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => requestDelete(note.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-3 whitespace-pre-wrap">
                            {note.noteText}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{formatDate(note.updatedAt || note.createdAt)}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Fallback to flat list for backward compatibility */
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {list.map((note) => (
                  <Card key={note.id} className="hover:shadow-sm transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-3">
                        <CardTitle className="text-base">
                          {note.question?.questionText ? note.question.questionText : 'Note'}
                        </CardTitle>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(note)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => requestDelete(note.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3 whitespace-pre-wrap">
                        {note.noteText}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatDate(note.updatedAt || note.createdAt)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} notes
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={!pagination.hasPrev} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                      Previous
                    </Button>
                    <Button variant="outline" size="sm" disabled={!pagination.hasNext} onClick={() => setPage((p) => p + 1)}>
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Edit Note Dialog */}
      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
            <DialogDescription>Update your note content.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              {/* <UILabel htmlFor="noteText">Note</UILabel> */}
              <Textarea id="noteText" rows={5} value={editText} onChange={(e) => setEditText(e.target.value)} />
            </div>

          </div>

          <DialogFooter>
            <Button onClick={saveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Delete Confirmation */}
      <AlertDialog open={deleteTarget != null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this note?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your note.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTarget(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      </div>
    </div>
  )
}
