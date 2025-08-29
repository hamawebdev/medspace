// @ts-nocheck
'use client';

import { useEffect, useState } from 'react';
import {
  Eye,
  EyeOff,
  MessageSquare,
  Star,
  Flag,
  AlertTriangle,
  BookOpen,
  Check,
  Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label as UILabel } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useQuiz } from './quiz-api-context';
import { QuestionReportDialog } from '@/components/student/session-analysis/question-report-dialog';
import { useLabels } from '@/hooks/use-student-organization';
import { toast } from 'sonner';

export function QuestionActions() {
  const { state, revealAnswer, toggleExplanation, bookmarkQuestion, addNote, flagQuestion } = useQuiz();
  const { session, currentQuestion, isAnswerRevealed, showExplanation } = state;

  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [showLabelDialog, setShowLabelDialog] = useState(false);
  const [selectedLabelId, setSelectedLabelId] = useState<number | null>(null);
  const { labels, refresh: refreshLabels } = useLabels();

  const [questionNotes, setQuestionNotes] = useState<Array<{id: number; noteText: string; createdAt?: string}>>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);

  // Reset selected label when dialog closes
  useEffect(() => {
    if (!showNoteDialog) setSelectedLabelId(null);
  }, [showNoteDialog]);

  // Fetch notes for current question from API so multiple notes are supported
  useEffect(() => {
    let cancelled = false;
    const fetchNotes = async () => {
      if (!currentQuestion?.id) return;
      try {
        setLoadingNotes(true);
        const { StudentService } = await import('@/lib/api-services');
        const res = await StudentService.getQuestionNotes(Number(currentQuestion.id));
        const notesArr = (res?.data?.data?.notes || res?.data?.notes || res?.data || []) as any[];
        if (!cancelled) setQuestionNotes(Array.isArray(notesArr) ? notesArr : []);
      } catch (e) {
        if (!cancelled) setQuestionNotes([]);
      } finally {
        if (!cancelled) setLoadingNotes(false);
      }
    };
    fetchNotes();
    return () => { cancelled = true; };
  }, [currentQuestion?.id]);

  if (!currentQuestion) {
    return null;
  }

  const questionId = currentQuestion.id;
  const userAnswer = session?.userAnswers?.[questionId];
  const isBookmarked = userAnswer?.isBookmarked || false;
  const flags = userAnswer?.flags || [];
  const existingNote = userAnswer?.notes || '';
  const hasAnswered = !!userAnswer && (!!userAnswer.selectedOptions?.length || !!userAnswer.textAnswer);

  const handleSaveNote = async () => {
    if (!questionId) return;

    // Optimistically update local state for immediate UX
    addNote(questionId, noteText);

    try {
      // Persist via API so it shows in /student/notes
      // We pass quizId when available (changed from sessionId to match API docs)
      const payload: any = { noteText, questionId: Number(questionId) };
      const sId = state?.apiSessionId || state?.session?.id || state?.session?.sessionId;
      if (sId) payload.quizId = Number(sId); // Changed from sessionId to quizId
      if (selectedLabelId) payload.labelIds = [Number(selectedLabelId)];

      const { StudentService } = await import('@/lib/api-services');
      await StudentService.createNote(payload);
    } catch (e) {
      // Non-blocking: local note still kept; user can retry later from Notes page
      console.error('Failed to persist note to API', e);
    } finally {
      setShowNoteDialog(false);
      setSelectedLabelId(null);
      setNoteText('');
    }
  };

  const handleOpenNoteDialog = () => {
    setNoteText(existingNote);
    setShowNoteDialog(true);
  };

  return (
    <div className="space-y-3">
      {/* Primary Actions */}
      <div className="flex items-center gap-1">
          {/* Bookmark */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => bookmarkQuestion(currentQuestion.id)}
            className={cn(
              "gap-1",
              isBookmarked && "text-yellow-600"
            )}
          >
            <Star className={cn("h-4 w-4", isBookmarked && "fill-current")} />
            <span className="hidden sm:inline">
              {isBookmarked ? 'Remove' : 'Favorite'}
            </span>
          </Button>

          {/* Add Note */}
          <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleOpenNoteDialog}
                className={cn(
                  "gap-1",
                  existingNote && "text-blue-600"
                )}
              >
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Note</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Personal Note</DialogTitle>
                <DialogDescription>
                  Add a note to remember this question
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Type your note here..."
                  rows={4}
                />

                <div className="space-y-2">
                  <UILabel>Label (optional)</UILabel>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-auto">
                    {(labels || []).map(l => (
                      <label key={l.id} className="flex items-center gap-2">
                        <Checkbox checked={selectedLabelId === l.id} onCheckedChange={() => setSelectedLabelId(l.id)} />
                        <span className="text-sm">{l.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNoteDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveNote}>
                  <Check className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>



          {/* Report Question */}
          <QuestionReportDialog
            questionId={parseInt(currentQuestion.id)}
            questionText={currentQuestion.title || currentQuestion.content || currentQuestion.questionText || `Question ${currentQuestion.id}`}
            questionType={currentQuestion.type}
            onReportSubmitted={() => flagQuestion(currentQuestion.id, 'report_error')}
          >
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "gap-1",
                flags.includes('report_error') && "text-orange-600"
              )}
            >
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Report</span>
            </Button>
          </QuestionReportDialog>

          {/* Add Question to Label */}
          <Dialog open={showLabelDialog} onOpenChange={setShowLabelDialog}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1">
                <Tag className="h-4 w-4" />
                <span className="hidden sm:inline">Label</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Question to Label</DialogTitle>
                <DialogDescription>Select a label to associate with this question</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">Your labels</div>
                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-auto">
                  {(labels || []).map(l => (
                    <button
                      key={l.id}
                      onClick={() => setSelectedLabelId(l.id)}
                      className={cn(
                        'text-left px-3 py-2 rounded-md border hover:bg-muted',
                        selectedLabelId === l.id && 'border-primary bg-primary/5'
                      )}
                    >
                      <div className="font-medium text-sm">{l.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {l.statistics?.questionsCount || 0} questions
                        {l.statistics?.totalItems !== undefined && l.statistics.totalItems !== l.statistics?.questionsCount &&
                          ` • ${l.statistics.totalItems} total items`
                        }
                      </div>
                    </button>
                  ))}
                  {(labels || []).length === 0 && (
                    <div className="text-sm text-muted-foreground">No labels yet. Create one on the Labels page.</div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowLabelDialog(false)}>Cancel</Button>
                <Button onClick={async () => {
                  try {
                    const questionId = currentQuestion?.id;
                    if (!questionId || !selectedLabelId) {
                      toast.error('Please select a label');
                      return;
                    }
                    const { StudentService } = await import('@/lib/api-services');
                    const res = await StudentService.addQuestionToLabel(Number(questionId), Number(selectedLabelId));
                    if (res?.success) {
                      toast.success('Question added to label successfully');
                      await refreshLabels();
                      setShowLabelDialog(false);
                      setSelectedLabelId(null);
                    } else {
                      throw new Error(res?.error || 'Failed to add question to label');
                    }
                  } catch (e) {
                    console.error(e);
                    toast.error('Could not add the question to label');
                  }
                }}>Add Question</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

      {/* Notes for this question (supports multiple) */}
      {questionNotes.length > 0 && (
        <Card className="bg-blue-50/50 border-blue-200">
          <CardContent className="pt-4 space-y-3">
            {questionNotes.map((n) => (
              <div key={n.id} className="flex items-start gap-2">
                <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-blue-800 whitespace-pre-wrap">{n.noteText}</p>
                  {n.createdAt && (
                    <div className="text-[11px] text-blue-700/80 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Active Flags Display */}
      {flags.length > 0 && (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Marqueurs :</span>
          {flags.includes('report_error') && (
            <div className="flex items-center gap-1 text-orange-600">
              <AlertTriangle className="h-3 w-3" />
              <span>Erreur signalée</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
