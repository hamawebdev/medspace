// @ts-nocheck
'use client';

import { useState } from 'react';
import { 
  Star, 
  Flag, 
  AlertTriangle, 
  MessageSquare, 
  Eye, 
  EyeOff,
  BookOpen,
  Clock,
  Target,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useQuiz } from './quiz-api-context';
import { UnifiedQuestion } from './unified-question';
import { QuestionActions } from './question-actions';
import { AnswerExplanation } from './answer-explanation';
import { useApiQuiz } from './quiz-api-context';

export function QuestionDisplay() {
  const { state, bookmarkQuestion, flagQuestion, revealAnswer } = useQuiz();
  const { session, currentQuestion, isAnswerRevealed, showExplanation } = state;
  const { state: apiState } = useApiQuiz();

  // Auto-reveal in completed sessions to show status chips and highlights immediately
  const autoReveal = session.status === 'COMPLETED' || session.status === 'completed';


  // Handle case where currentQuestion might be null
  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-center space-y-6 animate-fade-in-up">
          <div className="mx-auto w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center">
            <div className="w-8 h-8 bg-muted/50 rounded-full flex items-center justify-center">
              <span className="text-xl">❓</span>
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-lg font-medium text-muted-foreground">No question available</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Please check your quiz session or try refreshing the page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const userAnswer = session.userAnswers[String(currentQuestion.id)];
  const isBookmarked = userAnswer?.isBookmarked || false;
  const flags = userAnswer?.flags || [];
  const timeSpent = userAnswer?.timeSpent || 0;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-primary/10 text-primary-foreground border-primary/20';
      case 'intermediate':
        return 'bg-accent/10 text-accent-foreground border-accent/20';
      case 'advanced':
        return 'bg-destructive/10 text-destructive-foreground border-destructive/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const getQuestionTypeInfo = (type: string) => {
    switch (type) {
      case 'QCM':
        return {
          name: 'Multiple Choice (QCM)',
          description: 'Multiple correct answers possible',
          icon: '☑️',
        };
      case 'QCS':
        return {
          name: 'Single Choice (QCS)',
          description: 'Only one correct answer',
          icon: '⚪',
        };
      case 'QROC':
        return {
          name: 'Short Open Response (QROC)',
          description: 'Short free-text answer',
          icon: '✏️',
        };
      case 'CAS':
        return {
          name: 'Clinical Case',
          description: 'Clinical case with sub-questions',
          icon: '🏥',
        };
      default:
        return {
          name: 'Question',
          description: 'Question type',
          icon: '❓',
        };
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Transform API question to match component expectations
  const transformQuestion = (question: any) => {
    // According to session-doc.md, answers are in questionAnswers array
    const answers = question.questionAnswers || question.answers || [];

    // Helper function to ensure proper image data structure
    const normalizeImageArray = (images: any[]): Array<{ id: number; imagePath: string; altText?: string }> => {
      if (!Array.isArray(images)) return [];
      
      return images.map((img, index) => {
        // Handle different possible image data structures from API
        if (typeof img === 'string') {
          // If image is just a URL string
          return {
            id: index + 1,
            imagePath: img,
            altText: `Image ${index + 1}`
          };
        } else if (img && typeof img === 'object') {
          // If image is an object with properties
          return {
            id: img.id || index + 1,
            imagePath: img.imagePath || img.url || img.src || '',
            altText: img.altText || img.alt || img.description || `Image ${index + 1}`
          };
        }
        return null;
      }).filter(Boolean);
    };

    return {
      ...question,
      // Ensure content property exists
      content: question.content || question.questionText,
      // Transform answers to options format using documented structure
      options: answers.map((answer: any) => ({
        id: String(answer.id),
        text: answer.answerText,
        isCorrect: answer.isCorrect,
        explanation: answer.explanation,
        explanationImages: normalizeImageArray(answer.explanationImages || [])
      })),
      // Ensure image arrays are properly passed through with normalization
      questionImages: normalizeImageArray(question.questionImages || []),
      questionExplanationImages: normalizeImageArray(question.questionExplanationImages || []),
      // Ensure other required properties exist
      title: question.title || question.questionText || `Question ${question.id}`,
      difficulty: question.difficulty || 'intermediate',
      source: question.source || 'API',
      tags: question.tags || [],
      type: question.questionType || question.type || 'SINGLE_CHOICE', // Use documented field
      // Additional metadata fields from API
      questionType: question.questionType,
      yearLevel: question.yearLevel,
      examYear: question.examYear,
      metadata: question.metadata,
      university: question.university,
      course: question.course
    };
  };

  // Determine question type from API response structure or use default
  const getQuestionType = (question: any) => {
    // Use documented questionType field first
    if (question.questionType) {
      const t = String(question.questionType).toUpperCase();
      if (t === 'SINGLE_CHOICE' || t === 'QCS' || t === 'SINGLE') return 'QCS';
      if (t === 'MULTIPLE_CHOICE' || t === 'QCM' || t === 'MULTIPLE') return 'QCM';
      if (t === 'QROC') return 'QROC';
      if (t === 'CAS') return 'CAS';
    }

    // Fallback to legacy type field
    if (question.type) {
      const t = String(question.type).toUpperCase();
      if (t === 'SINGLE_CHOICE' || t === 'QCS' || t === 'SINGLE') return 'QCS';
      if (t === 'MULTIPLE_CHOICE' || t === 'QCM' || t === 'MULTIPLE') return 'QCM';
      if (t === 'QROC') return 'QROC';
      if (t === 'CAS') return 'CAS';
    }

    // Determine type based on answer structure using documented questionAnswers
    const answers = question.questionAnswers || question.answers || [];
    if (Array.isArray(answers)) {
      const correctAnswers = answers.filter((answer: any) => answer.isCorrect);
      return correctAnswers.length > 1 ? 'QCM' : 'QCS';
    }

    // Fallback: infer from options when present
    if (Array.isArray(question.options) && question.options.length > 0) {
      const correctCount = question.options.filter((opt: any) => opt.isCorrect).length;
      return correctCount > 1 ? 'QCM' : 'QCS';
    }

    // Default fallback
    return 'QCS';
  };

  const transformedQuestion = transformQuestion(currentQuestion);
  const questionType = getQuestionType(currentQuestion);
  const questionTypeInfo = getQuestionTypeInfo(questionType);

  const renderQuestionComponent = () => {
    return <UnifiedQuestion question={transformedQuestion} type={questionType} />;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Question Content - Enable scrolling before selection */}
      <div className="flex-1 overflow-y-auto scroll-smooth">
        <div className="min-h-full flex flex-col p-0.5 sm:p-1 lg:p-1.5 space-y-0.5 sm:space-y-1 max-w-7xl mx-auto quiz-question-container">

          {/* Status Badge in review - Ultra Compact */}
          {autoReveal && (
            <div className="flex justify-center mb-1">
              <Badge variant={userAnswer?.isCorrect ? 'success' as any : 'destructive' as any} className={`${userAnswer?.isCorrect ? 'bg-green-600' : 'bg-red-600'} text-xs font-semibold px-2 py-0.5`}>
                {userAnswer?.isCorrect ? 'Correct' : 'Incorrect'}
              </Badge>
            </div>
          )}

          {/* Question Component - Main Content - Fills available space */}
          <div className="flex-1 min-h-0 animate-fade-in-up animate-delay-100">
            {renderQuestionComponent()}
          </div>

          {/* Explanation - Only when revealed, compact */}
          {(isAnswerRevealed || showExplanation) && (
            <div className="flex-shrink-0 animate-fade-in-up animate-delay-200">
              <AnswerExplanation
                question={transformedQuestion}
                userAnswer={userAnswer}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
