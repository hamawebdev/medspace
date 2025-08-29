// @ts-nocheck
'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label as UILabel } from '@/components/ui/label'
import { LoadingSpinner } from '@/components/loading-states'
import { useStudentAuth } from '@/hooks/use-auth'
import { useLabels } from '@/hooks/use-student-organization'
import { Dialog as AlertDialog, DialogContent as AlertDialogContent, DialogFooter as AlertDialogFooter, DialogHeader as AlertDialogHeader, DialogTitle as AlertDialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'


export default function LabelsPage() {
  const { isAuthenticated, loading: authLoading } = useStudentAuth()
  const { labels, loading, createLabel, updateLabel, deleteLabel, refresh, addQuestionToLabel, removeQuestionFromLabel } = useLabels()
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const limit = 12

  const list = (labels || []).filter(l => l.name.toLowerCase().includes(q.toLowerCase()))
  const totalPages = Math.max(1, Math.ceil(list.length / limit))
  const pageItems = list.slice((page - 1) * limit, page * limit)

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const [newLabelName, setNewLabelName] = useState('')

  const handleCreateLabel = async () => {
    const name = newLabelName.trim()
    if (!name) {
      toast.error('Label name is required')
      return
    }
    try {
      await createLabel({ name })
      setShowCreateDialog(false)
      setNewLabelName('')
      await refresh()
    } catch (e) {
      // error toast handled in hook
    }
  }

  if (authLoading || !isAuthenticated || loading) {
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
                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Labels
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">
                  Organize your content with a personal labeling system
                </p>
              </div>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => setShowCreateDialog(true)} className="bg-blue-600 hover:bg-blue-700 text-white self-start sm:self-center min-h-[44px]">
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

      <Separator />

      <div className="flex items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Input
            placeholder="Search labels..."
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1) }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {pageItems.map((l) => (
          <div key={l.id} className="border rounded-md p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="font-medium">{l.name}</div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => { setEditId(l.id); setEditName(l.name) }}>Edit</Button>
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeletingId(l.id)}>Delete</Button>
              </div>
            </div>

            {/* Enhanced statistics showing question-focused data */}
            {l.statistics && (
              <div className="text-xs text-muted-foreground space-y-1">
                <div>{l.statistics.questionsCount || 0} questions</div>
                {l.statistics.quizzesCount > 0 && (
                  <div>{l.statistics.quizzesCount} quizzes</div>
                )}
                {l.statistics.quizSessionsCount > 0 && (
                  <div>{l.statistics.quizSessionsCount} sessions</div>
                )}
              </div>
            )}

            {/* Show associated questions if available */}
            {l.questions && l.questions.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">Recent Questions:</div>
                <div className="space-y-1">
                  {l.questions.slice(0, 2).map((question) => (
                    <div key={question.id} className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                      <div className="truncate">{question.questionText}</div>
                      {question.course && (
                        <div className="text-xs text-muted-foreground/70 mt-1">
                          {question.course.module?.name} - {question.course.name}
                        </div>
                      )}
                    </div>
                  ))}
                  {l.questions.length > 2 && (
                    <div className="text-xs text-muted-foreground">
                      +{l.questions.length - 2} more questions
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
              Next
            </Button>
          </div>
        </div>
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
                await updateLabel(editId, { name: editName.trim() });
                setEditId(null); setEditName('');
                await refresh();
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
            <Button variant="destructive" onClick={async () => { if (deletingId) { await deleteLabel(deletingId); setDeletingId(null); await refresh(); } }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </div>
    </div>
    </div>
  )
}
