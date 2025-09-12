// @ts-nocheck
'use client'

/**
 * Student Notes Page - Unit/Module-based Navigation
 *
 * Workflow:
 * 1. First, fetch unit IDs and independent modules from content/filters endpoint
 * 2. Display units and modules as selectable cards
 * 3. When user clicks on a unit or module, use its ID to fetch and display notes
 * 4. Uses the by-module endpoint with either uniteId or moduleId parameter
 *
 * API Endpoints Used:
 * - GET /students/content/filters - Get hierarchical structure
 * - GET /students/notes/by-module?moduleId=X - Get notes for specific module
 * - GET /students/notes/by-module?uniteId=X - Get notes for all modules in unit
 */

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, StickyNote, Edit2, Trash2, BookOpen } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingSpinner } from '@/components/loading-states'
import { useStudentAuth } from '@/hooks/use-auth'
import { StudentService } from '@/lib/api-services'
import { NewApiService } from '@/lib/api/new-api-services'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { cn } from '@/lib/utils'
import { UnitModuleSelector, UnitModuleSelection } from '@/components/student/shared/unit-module-selector'

export default function NotesPage() {
  const { isAuthenticated, loading: authLoading } = useStudentAuth()
  const searchParams = useSearchParams()
  const router = useRouter()

  // Navigation state - either viewing unit/module selection or specific notes
  const [viewMode, setViewMode] = useState<'selection' | 'notes'>('selection')
  const [selectedItem, setSelectedItem] = useState<UnitModuleSelection | null>(null)

  // Notes data state
  const [notesData, setNotesData] = useState<any>(null)
  const [notesLoading, setNotesLoading] = useState(false)
  const [notesError, setNotesError] = useState<string | null>(null)

  // Edit/Delete state for notes
  const [editing, setEditing] = useState<any | null>(null)
  const [editText, setEditText] = useState('')
  const [localSaving, setLocalSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)

  // Fetch notes when a unit or module is selected
  const fetchNotes = async (selection: UnitModuleSelection) => {
    try {
      setNotesLoading(true)
      setNotesError(null)

      // Log the selection details for debugging
      console.log('📝 [Notes Page] fetchNotes called with selection:', {
        selection,
        type: selection.type,
        id: selection.id,
        name: selection.name,
        uniteId: selection.uniteId,
        uniteName: selection.uniteName,
        timestamp: new Date().toISOString()
      });

      const params = selection.type === 'unite'
        ? { uniteId: selection.id }
        : { moduleId: selection.id }

      console.log('📝 [Notes Page] API params:', params);

      // Use NewApiService for enhanced logging and latest API implementation
      const response = await NewApiService.getStudentNotes(params)

      console.log('📝 [Notes Page] API response received:', {
        success: response.success,
        hasData: !!response.data,
        dataKeys: response.data ? Object.keys(response.data) : null,
        error: response.error
      });

      if (response.success && response.data) {
        // Log the raw response structure for debugging
        console.log('📝 [Notes Page] Raw API response data:', {
          rawData: response.data,
          dataKeys: Object.keys(response.data),
          hasUnite: !!response.data.unite,
          hasModule: !!response.data.module,
          hasCourseGroups: !!response.data.courseGroups,
          hasFilterInfo: !!response.data.filterInfo
        });

        // Transform the response to match expected UI structure
        let transformedData;

        if (response.data.unite || response.data.module) {
          // Handle the actual API response format: { unite: {...} } or { module: {...} }
          const sourceData = response.data.unite || response.data.module;
          const rawNotes = Array.isArray(sourceData?.notes) ? sourceData.notes : [];

          console.log('📝 [Notes Page] Transforming unite/module response:', {
            sourceData,
            notesCount: rawNotes.length,
            rawNotes,
            firstNote: rawNotes[0]
          });

          // Normalize notes: fix field name mismatch (questions -> question)
          const normalizedNotes = rawNotes
            .filter(note => note && note.id) // Filter out null/undefined notes
            .map(note => ({
              ...note,
              question: note.questions || note.question, // Handle both 'questions' and 'question' fields
              questions: undefined // Remove the original 'questions' field to avoid confusion
            }));

          console.log('📝 [Notes Page] Normalized notes:', {
            normalizedNotes,
            firstNormalizedNote: normalizedNotes[0],
            hasQuestionField: normalizedNotes[0]?.question ? true : false
          });

          // Transform to expected UI format
          transformedData = {
            filterInfo: {
              uniteId: selection.type === 'unite' ? selection.id : selection.uniteId,
              moduleId: selection.type === 'module' ? selection.id : null,
              uniteName: selection.type === 'unite' ? selection.name : selection.uniteName,
              moduleName: selection.type === 'module' ? selection.name : null
            },
            courseGroups: [], // Will be populated if notes have course grouping
            ungroupedNotes: normalizedNotes, // Put all notes in ungrouped initially
            totalNotes: normalizedNotes.length
          };

          // Try to group notes by course if they have course information
          if (normalizedNotes.length > 0) {
            const courseMap = new Map();
            const ungrouped = [];

            normalizedNotes.forEach(note => {
              // Check for course information in the question
              const courseInfo = note?.question?.course;
              const moduleName = note?.question?.module?.name || note?.question?.name;

              console.log('📝 [Notes Page] Processing note for grouping:', {
                noteId: note?.id,
                hasQuestion: !!note?.question,
                hasCourse: !!courseInfo,
                courseId: courseInfo?.id,
                moduleName,
                questionText: note?.question?.questionText?.substring(0, 50) + '...'
              });

              if (courseInfo?.id) {
                const courseId = courseInfo.id;
                const courseName = moduleName || `Course ${courseId}`;

                if (!courseMap.has(courseId)) {
                  courseMap.set(courseId, {
                    course: {
                      id: courseId,
                      name: courseName,
                      module: note?.question?.module || null
                    },
                    notes: []
                  });
                }
                courseMap.get(courseId)?.notes?.push(note);
              } else {
                ungrouped.push(note);
              }
            });

            transformedData.courseGroups = Array.from(courseMap.values());
            transformedData.ungroupedNotes = ungrouped;

            console.log('📝 [Notes Page] Course grouping results:', {
              courseGroupsCount: transformedData.courseGroups?.length || 0,
              ungroupedCount: transformedData.ungroupedNotes?.length || 0,
              courseGroups: transformedData.courseGroups?.map(cg => ({
                courseId: cg?.course?.id,
                courseName: cg?.course?.name,
                notesCount: cg?.notes?.length || 0
              })) || []
            });
          }
        } else if (response.data.courseGroups || response.data.filterInfo) {
          // Handle the documented API response format
          transformedData = response.data;
        } else {
          // Fallback: treat the entire response.data as notes
          console.warn('📝 [Notes Page] Unknown response format, using fallback');
          transformedData = {
            filterInfo: {
              uniteId: selection.type === 'unite' ? selection.id : selection.uniteId,
              moduleId: selection.type === 'module' ? selection.id : null,
              uniteName: selection.type === 'unite' ? selection.name : selection.uniteName,
              moduleName: selection.type === 'module' ? selection.name : null
            },
            courseGroups: [],
            ungroupedNotes: Array.isArray(response.data) ? response.data : [],
            totalNotes: Array.isArray(response.data) ? response.data.length : 0
          };
        }

        // Log the transformed data structure
        console.log('📝 [Notes Page] Transformed notes data:', {
          transformedData,
          filterInfo: transformedData.filterInfo,
          courseGroups: transformedData.courseGroups,
          courseGroupsCount: transformedData.courseGroups?.length || 0,
          ungroupedNotes: transformedData.ungroupedNotes,
          ungroupedNotesCount: transformedData.ungroupedNotes?.length || 0,
          totalNotes: transformedData.totalNotes,
          hasNotes: !!(
            (transformedData.courseGroups && transformedData.courseGroups.length > 0) ||
            (transformedData.ungroupedNotes && transformedData.ungroupedNotes.length > 0)
          )
        });

        // Validate note structure for UI rendering
        if (transformedData.ungroupedNotes?.length > 0) {
          console.log('📝 [Notes Page] Validating ungrouped notes for UI rendering:', {
            firstNote: transformedData.ungroupedNotes[0],
            noteFields: Object.keys(transformedData.ungroupedNotes[0]),
            hasId: !!transformedData.ungroupedNotes[0]?.id,
            hasNoteText: !!transformedData.ungroupedNotes[0]?.noteText,
            hasQuestion: !!transformedData.ungroupedNotes[0]?.question,
            hasQuestionText: !!transformedData.ungroupedNotes[0]?.question?.questionText,
            hasCreatedAt: !!transformedData.ungroupedNotes[0]?.createdAt
          });
        }

        if (transformedData.courseGroups?.length > 0) {
          console.log('📝 [Notes Page] Validating course groups for UI rendering:', {
            firstCourseGroup: transformedData.courseGroups[0],
            courseInfo: transformedData.courseGroups[0]?.course,
            notesInFirstGroup: transformedData.courseGroups[0]?.notes?.length || 0,
            firstNoteInGroup: transformedData.courseGroups[0]?.notes?.[0]
          });
        }

        setNotesData(transformedData)
      } else {
        console.error('📝 [Notes Page] API response not successful:', {
          success: response.success,
          error: response.error,
          data: response.data,
          fullResponse: response
        });
        throw new Error(response.error || 'Failed to fetch notes')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load notes'
      console.error('📝 [Notes Page] fetchNotes error:', {
        error,
        errorMessage,
        selection,
        timestamp: new Date().toISOString()
      });
      setNotesError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setNotesLoading(false)
    }
  }

  // Handle unit/module selection
  const handleSelection = (selection: UnitModuleSelection) => {
    // Log the user's selection for debugging and validation
    console.log('📝 [Notes Page] Unit/Module selected:', {
      selection,
      type: selection.type,
      id: selection.id,
      name: selection.name,
      uniteId: selection.uniteId,
      uniteName: selection.uniteName,
      timestamp: new Date().toISOString()
    });

    // Validate the selection data structure
    if (!selection.id || !selection.name || !selection.type) {
      console.error('📝 [Notes Page] Invalid selection data:', selection);
      toast.error('Invalid selection data. Please try again.');
      return;
    }

    // For unite selections, ensure uniteId and uniteName are properly set
    if (selection.type === 'unite') {
      if (!selection.uniteId || !selection.uniteName) {
        console.warn('📝 [Notes Page] Unite selection missing uniteId/uniteName, fixing...', {
          original: selection,
          fixed: { ...selection, uniteId: selection.id, uniteName: selection.name }
        });
        selection = { ...selection, uniteId: selection.id, uniteName: selection.name };
      }
    }

    console.log('📝 [Notes Page] Final validated selection:', selection);

    setSelectedItem(selection)
    setViewMode('notes')
    fetchNotes(selection)
  }

  // Handle back to selection
  const handleBackToSelection = () => {
    setSelectedItem(null)
    setViewMode('selection')
    setNotesData(null)
    setNotesError(null)
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric'
      })
    } catch {
      return ''
    }
  }

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

      // Use the proper API service to update the note
      await StudentService.updateNote(editing.id, { noteText: editText })
      setEditing(null)
      toast.success('Note updated successfully')

      // Refresh notes
      if (selectedItem) {
        fetchNotes(selectedItem)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update note'
      toast.error(errorMessage)
    } finally {
      setLocalSaving(false)
    }
  }

  const requestDelete = (noteId: number) => setDeleteTarget(noteId)

  const confirmDelete = async () => {
    if (deleteTarget == null) return
    try {
      // Use the proper API service to delete the note
      await StudentService.deleteNote(deleteTarget)
      setDeleteTarget(null)
      toast.success('Note deleted successfully')

      // Refresh notes
      if (selectedItem) {
        fetchNotes(selectedItem)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete note'
      toast.error(errorMessage)
    }
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

  const hasNotes = notesData && (
    (notesData.courseGroups && notesData.courseGroups.length > 0) ||
    (notesData.ungroupedNotes && notesData.ungroupedNotes.length > 0)
  )

  // Log the final hasNotes calculation for debugging
  console.log('📝 [Notes Page] hasNotes calculation:', {
    notesData: !!notesData,
    courseGroups: notesData?.courseGroups,
    courseGroupsLength: notesData?.courseGroups?.length || 0,
    ungroupedNotes: notesData?.ungroupedNotes,
    ungroupedNotesLength: notesData?.ungroupedNotes?.length || 0,
    totalNotes: notesData?.totalNotes || 0,
    hasNotes,
    selectedItem: selectedItem?.name
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 sm:gap-4">
              {viewMode === 'notes' && selectedItem && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToSelection}
                  className="mr-2"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              )}
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-primary flex items-center justify-center shadow-lg">
                <StickyNote className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  {viewMode === 'selection' ? 'My Notes' : selectedItem?.name}
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">
                  {viewMode === 'selection'
                    ? 'Select a unit or module to view your notes'
                    : 'Notes from practice and exam sessions'
                  }
                </p>
              </div>
            </div>

            {/* Selection info for notes view */}
            {viewMode === 'notes' && selectedItem && notesData?.filterInfo && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BookOpen className="h-4 w-4" />
                <span>
                  {notesData.filterInfo.uniteName && notesData.filterInfo.moduleName
                    ? `${notesData.filterInfo.uniteName} → ${notesData.filterInfo.moduleName}`
                    : notesData.filterInfo.uniteName || notesData.filterInfo.moduleName || 'Content'}
                </span>
                <Badge variant="outline" className="text-xs">
                  {notesData.totalNotes || 0} notes
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {(viewMode === 'notes' && notesLoading) && (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* Error State */}
        {(viewMode === 'notes' && notesError) && (
          <Card className="border-destructive bg-destructive/5">
            <div className="p-6">
              <div className="text-destructive text-center">
                <p className="font-medium">Failed to load notes</p>
                <p className="text-sm mt-1 text-destructive/70">{notesError}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => selectedItem && fetchNotes(selectedItem)}
                >
                  Try Again
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Content */}
        {!(viewMode === 'notes' && notesLoading) && !(viewMode === 'notes' && notesError) && (
          <>
            {viewMode === 'selection' ? (
              /* Unit/Module Selection View */
              <UnitModuleSelector
                onSelection={handleSelection}
                selectedItem={selectedItem}
                title="Select Unit or Module"
                description="Choose a unit to view notes from all its modules, or select a specific module to view its notes"
              />
            ) : (
              /* Notes View */
              <div className="space-y-6">
                {!hasNotes ? (
                  <EmptyState
                    icon={StickyNote}
                    title="No Notes Found"
                    description={`No notes found for ${selectedItem?.name}. Add notes while answering questions in practice or exam sessions.`}
                  />
                ) : (
                  <div className="space-y-8">
                    {/* Summary stats */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{notesData.totalNotes || 0} notes</span>
                        {notesData.courseGroups && notesData.courseGroups.length > 0 && (
                          <span>across {notesData.courseGroups.length} course{notesData.courseGroups.length !== 1 ? 's' : ''}</span>
                        )}
                      </div>
                    </div>

                    {/* Display all notes in a simple grid */}
                    {((notesData.courseGroups && notesData.courseGroups.length > 0) ||
                      (notesData.ungroupedNotes && notesData.ungroupedNotes.length > 0)) && (
                      <div className="animate-in fade-in-50">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {/* Render notes from course groups */}
                          {notesData.courseGroups?.map((courseGroup) =>
                            courseGroup.notes?.filter(note => note && note.id).map((note) => (
                              <Card key={note.id} className="group transition-all hover:shadow-lg">
                                <CardHeader>
                                  <div className="flex items-start justify-between gap-3">
                                    <CardTitle className="text-base">
                                      {note.question?.questionText ? note.question.questionText : 'Note'}
                                    </CardTitle>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openEdit(note); }}>
                                        <Edit2 className="h-4 w-4" />
                                      </Button>
                                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); requestDelete(note.id); }}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </div>
                                  </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {note.noteText}
                                  </p>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span>{formatDate(note.updatedAt || note.createdAt)}</span>
                                  </div>
                                </CardContent>
                              </Card>
                            ))
                          )}

                          {/* Render ungrouped notes */}
                          {notesData.ungroupedNotes?.filter(note => note && note.id).map((note) => (
                            <Card key={note.id} className="group transition-all hover:shadow-lg">
                              <CardHeader>
                                <div className="flex items-start justify-between gap-3">
                                  <CardTitle className="text-base">
                                    {note.question?.questionText ? note.question.questionText : 'Note'}
                                  </CardTitle>
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openEdit(note); }}>
                                      <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); requestDelete(note.id); }}>
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
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
                    )}

                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Edit Note Dialog */}
        <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Note</DialogTitle>
              <DialogDescription>Update your note content.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Textarea 
                  id="noteText" 
                  rows={5} 
                  value={editText} 
                  onChange={(e) => setEditText(e.target.value)}
                  placeholder="Enter your note..."
                  className="resize-none"
                />
                <div className="text-xs text-muted-foreground">
                  {editText.length}/5000 characters
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setEditing(null)}
                disabled={localSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={saveEdit}
                disabled={localSaving || !editText.trim()}
                className="min-w-20"
              >
                {localSaving ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    Saving...
                  </div>
                ) : (
                  'Save'
                )}
              </Button>
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
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}