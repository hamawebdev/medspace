// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { Circle, Check, X, RadioIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useQuiz } from '../quiz-api-context';
import { QuizQuestion } from '../quiz-context';
import { QuestionActions } from '../question-actions';

interface Props {
  question: QuizQuestion;
}

export function QCSQuestion({ question }: Props) {
  const { state, submitAnswer, updateAnswer } = useQuiz();
  const { session, isAnswerRevealed } = state;

  const [selectedOption, setSelectedOption] = useState<string>('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const userAnswer = session.userAnswers[String(question.id)];
  const existingAnswer = userAnswer?.selectedOptions?.[0] || '';

  // Reset state when question changes and initialize with existing answer
  useEffect(() => {
    if (existingAnswer) {
      setSelectedOption(existingAnswer);
      setHasSubmitted(true);
    } else {
      // Reset state for new question without existing answer
      setSelectedOption('');
      setHasSubmitted(false);
    }
  }, [question.id, existingAnswer]);

  const handleOptionSelect = async (optionId: string) => {
    // If in read-only review mode (COMPLETED) and not editing, block; if editing, use updateAnswer
    if ((session.status === 'completed' || session.status === 'COMPLETED') && !editMode) return;
    if (isAnswerRevealed && hasSubmitted && !editMode) return;

    setSelectedOption(optionId);

    const correctOption = question.options?.find(opt => opt.isCorrect);
    const isCorrect = optionId === correctOption?.id;

    if (session.status === 'COMPLETED' && editMode) {
      // Persist change via PUT endpoint and exit edit mode
      await updateAnswer(Number(question.id), Number(optionId));
      setEditMode(false);
      setHasSubmitted(true);
    } else {
      // Normal flow: auto-submit immediately for better UX
      await submitAnswer({ selectedOptions: [optionId], isCorrect });
      setHasSubmitted(true);
    }
  };

  const handleSubmit = () => {};

  const handleReset = () => {
    setSelectedOption('');
    setHasSubmitted(false);
  };

  const getOptionStatus = (option: { id: string; isCorrect: boolean }) => {
    if (!isAnswerRevealed) return 'default';
    
    const isSelected = selectedOption === option.id;
    
    if (option.isCorrect && isSelected) return 'correct-selected';
    if (option.isCorrect && !isSelected) return 'correct-unselected';
    if (!option.isCorrect && isSelected) return 'incorrect-selected';
    return 'default';
  };

  const getOptionStyles = (status: string) => {
    switch (status) {
      case 'correct-selected':
        return 'border-green-500 bg-green-50 text-green-900 shadow-sm';
      case 'correct-unselected':
        return 'border-green-300 bg-green-25 text-green-700';
      case 'incorrect-selected':
        return 'border-red-500 bg-red-50 text-red-900 shadow-sm';
      default:
        return 'border-border hover:border-primary/50 hover:bg-accent/20 transition-all duration-200';
    }
  };

  const getOptionIcon = (option: { id: string; isCorrect: boolean }) => {
    const status = getOptionStatus(option);
    const isSelected = selectedOption === option.id;
    
    if (!isAnswerRevealed) {
      return isSelected ? 
        <div className="w-4 h-4 rounded-full border-2 border-primary bg-primary flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-white" />
        </div> :
        <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />;
    }
    
    switch (status) {
      case 'correct-selected':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'correct-unselected':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'incorrect-selected':
        return <X className="h-4 w-4 text-red-600" />;
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (!question.options) {
    return <div>No options available for this question.</div>;
  }

  const correctOption = question.options.find(opt => opt.isCorrect);

  return (
    <div className="space-y-6">
      {/* Question Content */}
      <Card className="border-primary/30 bg-gradient-to-br from-card via-primary/5 to-accent/10 shadow-lg hover:shadow-xl transition-all duration-300 card-hover-lift">
        <CardContent className="p-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-3 h-3 rounded-full bg-primary animate-pulse-soft"></div>
                  <div className="absolute inset-0 w-3 h-3 rounded-full bg-primary/30 animate-ping"></div>
                </div>
                <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Question</h3>
                <div className="flex-1 h-px bg-gradient-to-r from-primary/30 to-transparent"></div>
              </div>
              <QuestionActions />
            </div>
            <div className="relative">
              <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-primary to-primary/30 rounded-full"></div>
              {/* Optional Question Images */}
              {(Array.isArray(question.questionImages) && question.questionImages.length > 0) && (
                <div className="pl-4 mb-4 grid gap-3 sm:grid-cols-2">
                  {question.questionImages.map((img: any, idx: number) => (
                    <img key={img.id || idx} src={img.imagePath || img.url} alt={img.altText || `Question image ${idx+1}`} className="w-full h-auto rounded-md border object-contain" />
                  ))}
                </div>
              )}
              {/* Optional hint/comment images */}
              {(Array.isArray((question as any).commentImages) && (question as any).commentImages.length > 0) && (
                <div className="pl-4 mb-4 grid gap-3 sm:grid-cols-2">
                  {(question as any).commentImages.map((img: any, idx: number) => (
                    <img key={img.id || idx} src={img.imagePath || img.url} alt={img.altText || `Hint image ${idx+1}`} className="w-full h-auto rounded-md border object-contain" />
                  ))}
                </div>
              )}
              <div className="prose prose-lg max-w-none pl-4">
                <p className="text-xl leading-relaxed font-semibold text-foreground tracking-tight">
                  {question.content}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="border-accent/20 bg-gradient-to-r from-accent/5 to-muted/10">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full border-2 border-primary/60 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-primary/60"></div>
              </div>
              <p className="text-sm text-foreground font-medium">
                Select the single correct answer
              </p>
            </div>

            {isAnswerRevealed && (
              <div className="text-sm">
                {userAnswer?.isCorrect ? (
                  <span className="text-green-600 font-semibold flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
                    <span className="text-green-500">✓</span> Correct
                  </span>
                ) : (
                  <span className="text-red-600 font-semibold flex items-center gap-2 bg-red-50 px-3 py-1 rounded-full">
                    <span className="text-red-500">✗</span> Incorrect
                  </span>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Hint */}
      <div className="text-xs text-muted-foreground mb-2">One correct answer</div>

      {/* Options */}
      <RadioGroup
        value={selectedOption}
        onValueChange={handleOptionSelect}
        disabled={!editMode && ((isAnswerRevealed && hasSubmitted) || session.status === 'completed' || session.status === 'COMPLETED')}
      >
        <div className="space-y-4">
          {question.options.map((option, index) => {
            const status = getOptionStatus(option);
            const isSelected = selectedOption === option.id;
            const isDisabled = !editMode && (isAnswerRevealed && hasSubmitted);

            return (
              <Card
                key={option.id}
                className={cn(
                  "group cursor-pointer transition-all duration-300 ease-out hover:shadow-lg hover:scale-[1.02] border-2",
                  getOptionStyles(status),
                  isSelected && !isAnswerRevealed && "ring-2 ring-primary/50 shadow-lg border-primary/40 bg-primary/5",
                  !isSelected && !isAnswerRevealed && "hover:border-primary/30 hover:bg-primary/5",
                  isDisabled && "cursor-not-allowed opacity-75"
                )}
                onClick={() => !isDisabled && handleOptionSelect(option.id)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                        isSelected && !isAnswerRevealed ? "border-primary bg-primary" : "border-muted-foreground group-hover:border-primary/60",
                        isAnswerRevealed && status === 'correct-selected' && "border-green-500 bg-green-500",
                        isAnswerRevealed && status === 'correct-unselected' && "border-green-500 bg-green-100",
                        isAnswerRevealed && status === 'incorrect-selected' && "border-red-500 bg-red-500"
                      )}>
                        {isAnswerRevealed ? (
                          status === 'correct-selected' || status === 'correct-unselected' ? (
                            <Check className="h-3 w-3 text-white" />
                          ) : status === 'incorrect-selected' ? (
                            <X className="h-3 w-3 text-white" />
                          ) : null
                        ) : isSelected ? (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        ) : null}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-base leading-relaxed font-medium text-foreground group-hover:text-foreground">
                        {option.text}
                      </p>
                    </div>

                    {/* Radio button for accessibility */}
                    <RadioGroupItem
                      value={option.id}
                      id={option.id}
                      disabled={isDisabled}
                      className="pointer-events-none opacity-0"
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </RadioGroup>

      {/* Action Buttons */}
      <div className="flex justify-end pt-4">
        <div className="flex gap-2">
          {hasSubmitted && !isAnswerRevealed && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
            >
              Modifier
            </Button>
          )}

          {/* Completed session: allow opt-in edit mode to update answer via PUT */}
          {isAnswerRevealed && (session.status === 'COMPLETED' || session.status === 'completed') && (
            editMode ? (
              <Button
                variant="default"
                size="sm"
                onClick={() => setEditMode(false)}
              >
                Cancel Edit
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setEditMode(true)}
              >
                Edit Answer
              </Button>
            )
          )}
          {/* Validate button removed; auto-submit on selection */}
        </div>
      </div>


    </div>
  );
}
