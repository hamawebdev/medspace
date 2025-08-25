// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuizSession, useQuizAnswerSubmission } from '@/hooks/use-quiz-api';
import { FullPageLoading } from '@/components/loading-states';
import { ErrorBoundary } from '@/components/error-boundary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  Edit3, 
  Save, 
  X, 
  CheckCircle, 
  XCircle,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface QuestionState {
  id: string;
  isEditing: boolean;
  isSaving: boolean;
  originalAnswer: any;
  currentAnswer: any;
  hasUnsavedChanges: boolean;
}

export default function AnswerReviewPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = parseInt(params.sessionId as string);
  
  const { session: apiSession, loading, error } = useQuizSession(sessionId);
  const { updateAnswer, submitting } = useQuizAnswerSubmission();
  
  const [reviewData, setReviewData] = useState<any>(null);
  const [questionStates, setQuestionStates] = useState<Record<string, QuestionState>>({});

  // Process review data when session is available
  useEffect(() => {
    if (apiSession) {
      const sessionData = apiSession.data?.data || apiSession.data || apiSession;
      
      // Only show for completed sessions
      if (sessionData.status !== 'COMPLETED' && sessionData.status !== 'completed') {
        router.push(`/student/session/${sessionId}`);
        return;
      }

      const questions = sessionData.questions || [];
      const answers = Array.isArray(sessionData.answers) ? sessionData.answers : [];
      
      // Build detailed question data
      const questionsWithAnswers = questions.map((question: any, index: number) => {
        const userAnswer = answers.find((a: any) => String(a.questionId) === String(question.id));
        
        // Handle both single and multiple choice answers
        const selectedAnswerIds = userAnswer?.selectedAnswerIds || 
          (userAnswer?.selectedAnswerId ? [userAnswer.selectedAnswerId] : []);
        
        const selectedAnswers = question.answers?.filter((a: any) => 
          selectedAnswerIds.includes(a.id)
        ) || [];
        
        const correctAnswers = question.answers?.filter((a: any) => a.isCorrect) || [];
        const isCorrect = userAnswer?.isCorrect || false;
        
        return {
          ...question,
          questionNumber: index + 1,
          userAnswer,
          selectedAnswerIds,
          selectedAnswers,
          correctAnswers,
          isCorrect,
          questionType: question.type || (correctAnswers.length > 1 ? 'QCM' : 'QCS')
        };
      });

      setReviewData({
        sessionId: sessionData.id,
        title: sessionData.title || 'Quiz Session',
        type: sessionData.type || 'PRACTICE',
        questions: questionsWithAnswers,
        canEdit: true // TODO: Check edit permissions
      });

      // Initialize question states
      const initialStates: Record<string, QuestionState> = {};
      questionsWithAnswers.forEach((q: any) => {
        initialStates[q.id] = {
          id: q.id,
          isEditing: false,
          isSaving: false,
          originalAnswer: q.selectedAnswerIds,
          currentAnswer: q.selectedAnswerIds,
          hasUnsavedChanges: false
        };
      });
      setQuestionStates(initialStates);
    }
  }, [apiSession, sessionId, router]);

  const handleEditToggle = (questionId: string) => {
    setQuestionStates(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        isEditing: !prev[questionId].isEditing,
        currentAnswer: prev[questionId].originalAnswer, // Reset to original
        hasUnsavedChanges: false
      }
    }));
  };

  const handleAnswerChange = (questionId: string, answerId: number, questionType: string) => {
    setQuestionStates(prev => {
      const currentState = prev[questionId];
      let newAnswer;
      
      if (questionType === 'QCM') {
        // Multiple choice - toggle selection
        const current = currentState.currentAnswer || [];
        newAnswer = current.includes(answerId) 
          ? current.filter((id: number) => id !== answerId)
          : [...current, answerId];
      } else {
        // Single choice
        newAnswer = [answerId];
      }
      
      return {
        ...prev,
        [questionId]: {
          ...currentState,
          currentAnswer: newAnswer,
          hasUnsavedChanges: JSON.stringify(newAnswer) !== JSON.stringify(currentState.originalAnswer)
        }
      };
    });
  };

  const handleSaveAnswer = async (questionId: string, questionType: string) => {
    const state = questionStates[questionId];
    if (!state.hasUnsavedChanges) return;

    setQuestionStates(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], isSaving: true }
    }));

    try {
      // Prepare answer data based on question type
      const answerData = questionType === 'QCM' 
        ? { selectedAnswerIds: state.currentAnswer }
        : { selectedAnswerId: state.currentAnswer[0] };

      await updateAnswer(sessionId, parseInt(questionId), answerData);
      
      // Update states on success
      setQuestionStates(prev => ({
        ...prev,
        [questionId]: {
          ...prev[questionId],
          isEditing: false,
          isSaving: false,
          originalAnswer: state.currentAnswer,
          hasUnsavedChanges: false
        }
      }));

      // Update review data to reflect changes
      setReviewData((prev: any) => ({
        ...prev,
        questions: prev.questions.map((q: any) => {
          if (q.id === questionId) {
            const newSelectedAnswers = q.answers?.filter((a: any) => 
              state.currentAnswer.includes(a.id)
            ) || [];
            
            // Recalculate if correct
            const correctAnswerIds = q.correctAnswers.map((a: any) => a.id);
            const isCorrect = state.currentAnswer.length === correctAnswerIds.length &&
              state.currentAnswer.every((id: number) => correctAnswerIds.includes(id));
            
            return {
              ...q,
              selectedAnswerIds: state.currentAnswer,
              selectedAnswers: newSelectedAnswers,
              isCorrect
            };
          }
          return q;
        })
      }));

      toast.success('Answer updated successfully');
    } catch (error) {
      console.error('Failed to update answer:', error);
      toast.error('Failed to update answer. Please try again.');
      
      setQuestionStates(prev => ({
        ...prev,
        [questionId]: { ...prev[questionId], isSaving: false }
      }));
    }
  };

  const handleCancelEdit = (questionId: string) => {
    setQuestionStates(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        isEditing: false,
        currentAnswer: prev[questionId].originalAnswer,
        hasUnsavedChanges: false
      }
    }));
  };

  if (loading) {
    return <FullPageLoading message="Loading answer review..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive mb-4">Failed to load answer review</p>
            <Button onClick={() => router.push('/student/dashboard')}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!reviewData) {
    return <FullPageLoading message="Processing answers..." />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10">
        <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => router.push(`/student/sessions/${sessionId}/results`)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Results
            </Button>
            
            <div className="text-right">
              <h1 className="text-2xl font-bold">Answer Review & Edit</h1>
              <p className="text-muted-foreground">{reviewData.title}</p>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-6">
            {reviewData.questions.map((question: any) => {
              const state = questionStates[question.id] || {};
              const isEditing = state.isEditing;
              const isSaving = state.isSaving;
              
              return (
                <Card key={question.id} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">Question {question.questionNumber}</Badge>
                          <Badge variant={question.isCorrect ? 'default' : 'destructive'}>
                            {question.isCorrect ? 'Correct' : 'Incorrect'}
                          </Badge>
                          {question.questionType === 'QCM' && (
                            <Badge variant="secondary">Multiple Choice</Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg leading-relaxed">
                          {question.questionText || question.text || question.content}
                        </CardTitle>
                      </div>
                      
                      {reviewData.canEdit && !isEditing && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditToggle(question.id)}
                          className="gap-2 flex-shrink-0"
                        >
                          <Edit3 className="h-4 w-4" />
                          Edit Answer
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Answer Options */}
                    <div className="space-y-3">
                      {question.answers?.map((answer: any) => {
                        const isSelected = isEditing 
                          ? (state.currentAnswer || []).includes(answer.id)
                          : question.selectedAnswerIds.includes(answer.id);
                        const isCorrect = answer.isCorrect;
                        const showAsCorrect = !isEditing && isCorrect;
                        const showAsIncorrect = !isEditing && isSelected && !isCorrect;
                        
                        return (
                          <div
                            key={answer.id}
                            className={cn(
                              "flex items-start gap-3 p-4 rounded-lg border-2 transition-all",
                              isEditing && "cursor-pointer hover:bg-accent/50",
                              showAsCorrect && "bg-green-50 border-green-200",
                              showAsIncorrect && "bg-red-50 border-red-200",
                              isSelected && isEditing && "bg-blue-50 border-blue-200",
                              !isSelected && !showAsCorrect && !showAsIncorrect && "border-border"
                            )}
                            onClick={() => isEditing && handleAnswerChange(question.id, answer.id, question.questionType)}
                          >
                            {/* Selection Indicator */}
                            <div className="flex-shrink-0 mt-0.5">
                              {question.questionType === 'QCM' ? (
                                <Checkbox
                                  checked={isSelected}
                                  disabled={!isEditing}
                                  className="pointer-events-none"
                                />
                              ) : (
                                <div className={cn(
                                  "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                                  isSelected ? "border-primary bg-primary" : "border-muted-foreground"
                                )}>
                                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                </div>
                              )}
                            </div>
                            
                            {/* Answer Text */}
                            <div className="flex-1">
                              <p className="text-sm leading-relaxed">
                                {answer.answerText || answer.text}
                              </p>
                              
                              {/* Status Labels */}
                              {!isEditing && (
                                <div className="flex gap-2 mt-2">
                                  {isSelected && (
                                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                      Your Answer
                                    </Badge>
                                  )}
                                  {isCorrect && (
                                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                                      Correct Answer
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            {/* Status Icons */}
                            {!isEditing && (
                              <div className="flex-shrink-0">
                                {showAsCorrect && <CheckCircle className="h-5 w-5 text-green-600" />}
                                {showAsIncorrect && <XCircle className="h-5 w-5 text-red-600" />}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Edit Mode Controls */}
                    {isEditing && (
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="text-sm text-muted-foreground">
                          {state.hasUnsavedChanges ? "You have unsaved changes" : "No changes made"}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelEdit(question.id)}
                            disabled={isSaving}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                          
                          <Button
                            size="sm"
                            onClick={() => handleSaveAnswer(question.id, question.questionType)}
                            disabled={!state.hasUnsavedChanges || isSaving}
                          >
                            {isSaving ? (
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <Save className="h-4 w-4 mr-1" />
                            )}
                            {isSaving ? 'Saving...' : 'Save Changes'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
