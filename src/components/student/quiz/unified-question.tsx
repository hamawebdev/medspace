// @ts-nocheck
'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  CheckCircle, 
  Circle, 
  Check, 
  X, 
  Lightbulb, 
  Edit3, 
  FileText, 
  Stethoscope, 
  User, 
  Calendar, 
  MapPin 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useQuiz } from './quiz-api-context';
import { QuizQuestion } from './quiz-context';
import { QuestionActions } from './question-actions';
import { QuestionMetadata } from './question-metadata';

interface Props {
  question: QuizQuestion;
  type?: 'QCM' | 'QCS' | 'QROC' | 'CAS';
}

interface ClinicalInfo {
  patientAge?: number;
  patientGender?: string;
  chiefComplaint?: string;
  history?: string;
  examination?: string;
  investigations?: string;
  diagnosis?: string;
  location?: string;
  date?: string;
}

interface ClinicalCase extends QuizQuestion {
  clinicalInfo?: ClinicalInfo;
}

export function UnifiedQuestion({ question, type }: Props) {
  const { state, submitAnswer, updateAnswer, revealAnswer } = useQuiz();
  const { session, isAnswerRevealed } = state;

  // Auto-detect type from question if not provided
  const questionType = type || question.type || 'QCS';
  const isMultipleChoice = questionType === 'QCM';
  const isTextQuestion = questionType === 'QROC';
  const isClinicalCase = questionType === 'CAS';

  // Unified state for all question types
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [textAnswer, setTextAnswer] = useState<string>('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const userAnswer = session.userAnswers[String(question.id)];
  const existingAnswer = userAnswer?.selectedOptions || [];
  const existingTextAnswer = userAnswer?.textAnswer || '';

  // Initialize state based on question type and existing answers
  useEffect(() => {
    if (isTextQuestion) {
      if (existingTextAnswer) {
        setTextAnswer(existingTextAnswer);
        setHasSubmitted(true);
      } else {
        setTextAnswer('');
        setHasSubmitted(false);
      }
    } else {
      if (existingAnswer.length > 0) {
        setSelectedOptions(existingAnswer);
        setHasSubmitted(true);
      } else {
        setSelectedOptions([]);
        setHasSubmitted(false);
      }
    }
    setEditMode(false);
  }, [question.id, existingAnswer, existingTextAnswer, isTextQuestion]);

  // Handle option selection for multiple choice questions
  const handleOptionToggle = useCallback((optionId: string) => {
    if (isMultipleChoice) {
      setSelectedOptions(prev => 
        prev.includes(optionId) 
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setSelectedOptions([optionId]);
    }
  }, [isMultipleChoice]);

  // Handle text answer submission for QROC questions
  const handleTextSubmit = () => {
    if (!textAnswer.trim()) return;
    if (session.status === 'completed' || session.status === 'COMPLETED') {
      console.warn('Cannot submit answer: Quiz session is completed');
      return;
    }

    const isCorrect = checkAnswerCorrectness(textAnswer, question.correctAnswers || []);
    submitAnswer({
      textAnswer: textAnswer.trim(),
      isCorrect,
    });
    setHasSubmitted(true);
  };

  // Simple keyword matching for QROC scoring
  const checkAnswerCorrectness = (userText: string, correctAnswers: string[]): boolean => {
    const userTextLower = userText.toLowerCase().trim();
    return correctAnswers.some(correctAnswer => {
      const keywords = correctAnswer.toLowerCase().split(/[\s,;]+/);
      const matchedKeywords = keywords.filter(keyword => 
        keyword.length > 2 && userTextLower.includes(keyword)
      );
      return matchedKeywords.length >= Math.ceil(keywords.length * 0.6);
    });
  };

  // Handle choice submission for multiple choice questions
  const handleChoiceSubmit = () => {
    if (selectedOptions.length === 0) return;
    if (session.status === 'completed' || session.status === 'COMPLETED') {
      console.warn('Cannot submit answer: Quiz session is completed');
      return;
    }

    const correctOptions = question.options?.filter(opt => opt.isCorrect).map(opt => opt.id) || [];
    const isCorrect = isMultipleChoice 
      ? selectedOptions.length === correctOptions.length && 
        selectedOptions.every(id => correctOptions.includes(id))
      : selectedOptions.length === 1 && correctOptions.includes(selectedOptions[0]);

    submitAnswer({
      selectedOptions,
      isCorrect,
    });
    setHasSubmitted(true);
  };

  const handleReset = () => {
    if (isTextQuestion) {
      setTextAnswer('');
    } else {
      setSelectedOptions([]);
    }
    setHasSubmitted(false);
  };

  const getOptionStatus = (option: any) => {
    if (!isAnswerRevealed) return 'default';
    
    const isSelected = selectedOptions.includes(option.id);
    const isCorrect = option.isCorrect;
    
    if (isSelected && isCorrect) return 'correct-selected';
    if (!isSelected && isCorrect) return 'correct-unselected';
    if (isSelected && !isCorrect) return 'incorrect-selected';
    return 'default';
  };

  const getOptionStyles = (status: string) => {
    switch (status) {
      case 'correct-selected':
        return 'border-green-500 bg-green-50';
      case 'correct-unselected':
        return 'border-green-300 bg-green-25';
      case 'incorrect-selected':
        return 'border-red-500 bg-red-50';
      default:
        return 'border-border bg-card';
    }
  };

  const correctCount = question.options?.filter(opt => opt.isCorrect).length || 0;
  const optionCount = question.options?.length || 0;

  // Dynamic sizing based on option count and content length - More aggressive for all cases
  const isCompactMode = optionCount >= 3 || question.content.length > 100;
  const isUltraCompactMode = optionCount > 4 || question.content.length > 200;
  const containerClass = isUltraCompactMode ? 'quiz-ultra-compact-mode' : isCompactMode ? 'quiz-compact-mode' : 'quiz-compact-mode';

  // Calculate dynamic spacing based on option count - Minimal space between question and answers
  const getSpacing = () => {
    if (optionCount > 4) return 'space-y-0';
    if (optionCount >= 3) return 'space-y-0';
    return 'space-y-0';
  };

  // Get card padding and gap overrides to reduce vertical spacing - More aggressive
  const getCardSpacing = () => {
    if (optionCount > 4) return 'py-0.5 gap-0.5';
    if (optionCount >= 3) return 'py-0.5 gap-0.5';
    return 'py-0.5 gap-0.5';
  };

  // Clinical case specific rendering
  const renderClinicalInfo = () => {
    if (!isClinicalCase) return null;
    
    const clinicalCase = question as ClinicalCase;
    const clinicalInfo = clinicalCase.clinicalInfo;

    if (!clinicalInfo) {
      return (
        <div className="p-4 border border-red-200 bg-red-50 rounded-lg mb-4">
          <p className="text-red-600">
            ⚠️ Clinical case information not available from API. Please contact support.
          </p>
        </div>
      );
    }

    return (
      <Card className="mb-4 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Stethoscope className="h-5 w-5" />
            Clinical Case
          </CardTitle>
          <CardDescription className="text-blue-600">
            Review the clinical information before answering
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Patient Demographics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {clinicalInfo.patientAge && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
                <span className="text-sm">
                  <strong>Age:</strong> {clinicalInfo.patientAge} years
                </span>
              </div>
            )}
            {clinicalInfo.patientGender && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
                <span className="text-sm">
                  <strong>Gender:</strong> {clinicalInfo.patientGender}
                </span>
              </div>
            )}
            {clinicalInfo.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span className="text-sm">
                  <strong>Location:</strong> {clinicalInfo.location}
                </span>
              </div>
            )}
          </div>

          <Separator />

          {/* Clinical Information */}
          <div className="space-y-3">
            {clinicalInfo.chiefComplaint && (
              <div>
                <h4 className="font-semibold text-blue-800 mb-1">Chief Complaint</h4>
                <p className="text-sm text-gray-700">{clinicalInfo.chiefComplaint}</p>
              </div>
            )}
            {clinicalInfo.history && (
              <div>
                <h4 className="font-semibold text-blue-800 mb-1">History</h4>
                <p className="text-sm text-gray-700">{clinicalInfo.history}</p>
              </div>
            )}
            {clinicalInfo.examination && (
              <div>
                <h4 className="font-semibold text-blue-800 mb-1">Physical Examination</h4>
                <p className="text-sm text-gray-700">{clinicalInfo.examination}</p>
              </div>
            )}
            {clinicalInfo.investigations && (
              <div>
                <h4 className="font-semibold text-blue-800 mb-1">Investigations</h4>
                <p className="text-sm text-gray-700">{clinicalInfo.investigations}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={cn(
      "h-full flex flex-col quiz-space-optimized",
      getSpacing(),
      containerClass
    )}>
      {/* Clinical Case Information (if applicable) */}
      {renderClinicalInfo()}

      {/* Question Content - Dynamically sized */}
      <Card className="border-primary/20 bg-gradient-to-br from-card via-primary/3 to-accent/5 shadow-sm hover:shadow-md transition-all duration-200 flex-shrink-0">
        <CardContent className={cn(
          "quiz-question-container",
          isUltraCompactMode ? "px-1 py-0" : isCompactMode ? "px-1 py-0" : "px-1.5 py-0.5"
        )}>
          <div className={cn(
            isUltraCompactMode ? "space-y-1" : isCompactMode ? "space-y-1.5" : "space-y-2"
          )}>
            <div className="flex items-center gap-0.5 mb-0">
              <div className="w-0.5 h-0.5 rounded-full bg-primary"></div>
              <h3 className="text-xs font-medium text-primary uppercase tracking-wide">Question</h3>
              {questionType === 'QCS' && <div className="ml-auto"><QuestionActions /></div>}
            </div>

            {/* Question Metadata */}
            <QuestionMetadata question={question} className={cn(
              isUltraCompactMode ? "mb-1.5" : isCompactMode ? "mb-2" : "mb-2.5"
            )} />

            {/* Optional Question Images - Ultra Compact */}
            {(Array.isArray(question.questionImages) && question.questionImages.length > 0) && (
              <div className={cn(
                "grid gap-0.5 grid-cols-1 sm:grid-cols-2",
                isUltraCompactMode ? "mb-0" : "mb-0.5"
              )}>
                {question.questionImages.map((img: any, idx: number) => (
                  <img key={img.id || idx} src={img.imagePath || img.url} alt={img.altText || `Question image ${idx+1}`} className={cn(
                    "w-full h-auto rounded border object-contain",
                    isUltraCompactMode ? "max-h-12" : "max-h-16"
                  )} />
                ))}
              </div>
            )}

            {/* Optional hint/comment images - Ultra Compact */}
            {(Array.isArray((question as any).commentImages) && (question as any).commentImages.length > 0) && (
              <div className={cn(
                "grid gap-0.5 grid-cols-1 sm:grid-cols-2",
                isUltraCompactMode ? "mb-0" : "mb-0.5"
              )}>
                {(question as any).commentImages.map((img: any, idx: number) => (
                  <img key={img.id || idx} src={img.imagePath || img.url} alt={img.altText || `Hint image ${idx+1}`} className={cn(
                    "w-full h-auto rounded border object-contain",
                    isUltraCompactMode ? "max-h-12" : "max-h-16"
                  )} />
                ))}
              </div>
            )}

            {/* Question Text - Responsive sizing */}
            <div className="prose prose-sm sm:prose-base max-w-none">
              <p className={cn(
                "font-bold text-foreground mb-0 quiz-question-text",
                isUltraCompactMode ? "leading-tight text-sm" : isCompactMode ? "leading-snug text-base" : "leading-snug text-base lg:text-lg"
              )}>
                {question.content}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Answer Section - Dynamic based on question type */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {isTextQuestion ? (
          // QROC: Text Answer
          <div className="h-full flex flex-col space-y-3">
            <Card className="flex-1 border-primary/20 bg-gradient-to-br from-card via-primary/3 to-accent/5">
              <CardContent className="p-4 h-full flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <Edit3 className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-medium text-primary uppercase tracking-wide">Your Answer</h3>
                </div>

                <Textarea
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  className="flex-1 min-h-[120px] resize-none"
                  disabled={hasSubmitted && !editMode}
                />

                {hasSubmitted && !editMode && (
                  <div className="mt-3 p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Your submitted answer:</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{textAnswer}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          // Multiple Choice Questions (QCM/QCS/CAS)
          isMultipleChoice ? (
            // QCM: Multiple choice without RadioGroup wrapper
            <div className={`${getSpacing()} flex flex-col h-full`}>
              {question.options?.map((option, index) => {
                const status = getOptionStatus(option);
                const isSelected = selectedOptions.includes(option.id);
                const isDisabled = !editMode && (isAnswerRevealed && hasSubmitted);
                const alphabetPrefix = String.fromCharCode(65 + index);

                return (
                  <Card
                    key={option.id}
                    className={cn(
                      "group cursor-pointer transition-all duration-200 ease-out hover:shadow-md border-2 flex-shrink-0 rounded-lg quiz-option-card",
                      // Override default Card py-6 gap-6 with reduced spacing
                      getCardSpacing(),
                      getOptionStyles(status),
                      isSelected && !isAnswerRevealed && "ring-2 ring-primary/50 shadow-lg border-primary/40 bg-primary",
                      !isSelected && !isAnswerRevealed && "hover:border-primary/30 hover:bg-primary/5",
                      isDisabled && "cursor-not-allowed opacity-75"
                    )}
                    onClick={() => !isDisabled && handleOptionToggle(option.id)}
                  >
                    <CardContent className={cn(
                      "quiz-option-card",
                      isUltraCompactMode ? "p-0.5 sm:p-1" : isCompactMode ? "p-1 sm:p-1" : "p-1 sm:p-1.5"
                    )}>
                      <div className={`flex items-start ${isUltraCompactMode ? 'gap-1 sm:gap-1.5' : 'gap-1.5 sm:gap-2'}`}>
                        {/* Alphabetical prefix */}
                        <div className="flex-shrink-0 mt-0.5">
                          <div className={cn(
                            "quiz-option-prefix rounded-md border-2 flex items-center justify-center transition-all duration-200 font-bold",
                            isUltraCompactMode
                              ? "w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-xs"
                              : isCompactMode
                                ? "w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-xs sm:text-sm"
                                : "w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-sm sm:text-base lg:text-lg",
                            isSelected && !isAnswerRevealed ? "border-primary-foreground text-primary-foreground" : "border-muted-foreground text-muted-foreground group-hover:border-foreground group-hover:text-foreground"
                          )}>
                            {alphabetPrefix}
                          </div>
                        </div>

                        {/* Answer Text */}
                        <div className="flex-1 min-w-0 mt-0.5">
                          <p className={cn(
                            "font-semibold transition-colors duration-200 break-words hyphens-auto quiz-option-text",
                            isUltraCompactMode
                              ? "text-xs sm:text-sm lg:text-base leading-tight"
                              : isCompactMode
                                ? "text-sm sm:text-base lg:text-lg leading-snug"
                                : "text-base sm:text-lg lg:text-xl leading-relaxed",
                            isSelected && !isAnswerRevealed ? "text-primary-foreground" : "text-foreground group-hover:text-foreground"
                          )}>
                            {option.text}
                          </p>
                        </div>

                        {/* Checkbox for accessibility */}
                        <Checkbox
                          checked={isSelected}
                          disabled={isDisabled}
                          className="pointer-events-none opacity-0"
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            // QCS: Single choice with RadioGroup wrapper
            <RadioGroup
              value={selectedOptions[0] || ''}
              onValueChange={(value) => handleOptionToggle(value)}
              disabled={!editMode && ((isAnswerRevealed && hasSubmitted) || session.status === 'completed' || session.status === 'COMPLETED')}
              className="h-full"
            >
              <div className={`${getSpacing()} flex flex-col h-full`}>
                {question.options?.map((option, index) => {
                  const status = getOptionStatus(option);
                  const isSelected = selectedOptions.includes(option.id);
                  const isDisabled = !editMode && (isAnswerRevealed && hasSubmitted);
                  const alphabetPrefix = String.fromCharCode(65 + index);

                  return (
                    <Card
                      key={option.id}
                      className={cn(
                        "group cursor-pointer transition-all duration-200 ease-out hover:shadow-md border-2 flex-shrink-0 rounded-lg quiz-option-card",
                        // Override default Card py-6 gap-6 with reduced spacing
                        getCardSpacing(),
                        getOptionStyles(status),
                        isSelected && !isAnswerRevealed && "ring-2 ring-primary/50 shadow-lg border-primary/40 bg-primary",
                        !isSelected && !isAnswerRevealed && "hover:border-primary/30 hover:bg-primary/5",
                        isDisabled && "cursor-not-allowed opacity-75"
                      )}
                      onClick={() => !isDisabled && handleOptionToggle(option.id)}
                    >
                      <CardContent className={cn(
                        "quiz-option-card",
                        isUltraCompactMode ? "p-0.5 sm:p-1" : isCompactMode ? "p-1 sm:p-1" : "p-1 sm:p-1.5"
                      )}>
                        <div className={`flex items-start ${isUltraCompactMode ? 'gap-1 sm:gap-1.5' : 'gap-1.5 sm:gap-2'}`}>
                          {/* Alphabetical prefix - Round for QCS */}
                          <div className="flex-shrink-0 mt-0.5">
                            <div className={cn(
                              "quiz-option-prefix rounded-full border-2 flex items-center justify-center transition-all duration-200 font-bold",
                              isUltraCompactMode
                                ? "w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-xs"
                                : isCompactMode
                                  ? "w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-xs sm:text-sm"
                                  : "w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-sm sm:text-base lg:text-lg",
                              isSelected && !isAnswerRevealed ? "border-primary-foreground text-primary-foreground" : "border-muted-foreground text-muted-foreground group-hover:border-foreground group-hover:text-foreground"
                            )}>
                              {alphabetPrefix}
                            </div>
                          </div>

                          {/* Answer Text */}
                          <div className="flex-1 min-w-0 mt-0.5">
                            <p className={cn(
                              "font-semibold transition-colors duration-200 break-words hyphens-auto quiz-option-text",
                              isUltraCompactMode
                                ? "text-xs sm:text-sm lg:text-base leading-tight"
                                : isCompactMode
                                  ? "text-sm sm:text-base lg:text-lg leading-snug"
                                  : "text-base sm:text-lg lg:text-xl leading-relaxed",
                              isSelected && !isAnswerRevealed ? "text-primary-foreground" : "text-foreground group-hover:text-foreground"
                            )}>
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
          )
        )}
      </div>

      {/* Action Buttons - Compact and Always Visible */}
      <div className={`flex-shrink-0 ${isUltraCompactMode ? 'pt-1' : 'pt-2'} border-t border-border/20`}>
        <div className="flex items-center justify-between gap-2">
          {/* Left side - Selection count for multiple choice or character count for text */}
          {isTextQuestion ? (
            <div className={`${isUltraCompactMode ? 'text-xs' : 'text-sm'} font-medium text-muted-foreground`}>
              {textAnswer.length} characters
            </div>
          ) : isMultipleChoice ? (
            <div className={`${isUltraCompactMode ? 'text-xs' : 'text-sm'} font-medium text-muted-foreground`}>
              {selectedOptions.length} selected
            </div>
          ) : (
            <div className={`${isUltraCompactMode ? 'text-xs' : 'text-sm'} font-medium text-muted-foreground`}>
              {selectedOptions.length > 0 ? '1 selected' : 'Select one'}
            </div>
          )}

          {/* Center - Show Explanation Button */}
          {hasSubmitted && !isAnswerRevealed && (
            <div className="flex-1 flex justify-center">
              <Button
                variant="outline"
                size={isUltraCompactMode ? "sm" : "default"}
                onClick={revealAnswer}
                className={`gap-1 text-blue-600 border-blue-200 hover:bg-blue-50 font-semibold shadow-sm hover:shadow-md transition-all duration-200 ${
                  isUltraCompactMode ? 'px-3 py-1 text-sm' : 'px-4 py-2 text-base'
                }`}
              >
                <Lightbulb className={`${isUltraCompactMode ? 'h-3 w-3' : 'h-4 w-4'}`} />
                Show Explanation
              </Button>
            </div>
          )}

          {/* Right side - Submit/Edit/Reset buttons */}
          <div className="flex gap-1">
            {hasSubmitted && !isAnswerRevealed && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="gap-1 text-orange-600 border-orange-200 hover:bg-orange-50"
              >
                <X className="h-3 w-3" />
                Reset
              </Button>
            )}

            {hasSubmitted && !editMode && !isAnswerRevealed && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditMode(true)}
                className="gap-1 text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <Edit3 className="h-3 w-3" />
                Edit
              </Button>
            )}

            {(!hasSubmitted || editMode) && (
              <Button
                onClick={isTextQuestion ? handleTextSubmit : handleChoiceSubmit}
                disabled={isTextQuestion ? !textAnswer.trim() : selectedOptions.length === 0}
                size="sm"
                className="gap-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm hover:shadow-md transition-all duration-200"
              >
                <Check className="h-3 w-3" />
                {editMode ? 'Update' : 'Submit'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
