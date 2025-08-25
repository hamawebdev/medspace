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
import { QCMQuestion } from './question-types/qcm-question';
import { QCSQuestion } from './question-types/qcs-question';
import { QROCQuestion } from './question-types/qroc-question';
import { CASQuestion } from './question-types/cas-question';
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
        return 'bg-green-50 text-green-700 border-green-200';
      case 'intermediate':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'advanced':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
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
    return {
      ...question,
      // Ensure content property exists
      content: question.content || question.questionText,
      // Transform answers to options format
      options: question.answers ? question.answers.map((answer: any) => ({
        id: String(answer.id),
        text: answer.answerText,
        isCorrect: answer.isCorrect,
        explanation: answer.explanation
      })) : question.options || [],
      // Ensure other required properties exist
      title: question.title || question.questionText || `Question ${question.id}`,
      difficulty: question.difficulty || 'intermediate',
      source: question.source || 'API',
      tags: question.tags || [],
      type: question.type || 'QCS' // Will be overridden by getQuestionType
    };
  };

  // Determine question type from API response structure or use default
  const getQuestionType = (question: any) => {
    // Normalize explicit type if provided
    if (question.type) {
      const t = String(question.type).toUpperCase();
      if (t === 'SINGLE_CHOICE' || t === 'QCS' || t === 'SINGLE') return 'QCS';
      if (t === 'MULTIPLE_CHOICE' || t === 'QCM' || t === 'MULTIPLE') return 'QCM';
      if (t === 'QROC') return 'QROC';
      if (t === 'CAS') return 'CAS';
    }

    // Determine type based on answer structure
    if (question.answers && Array.isArray(question.answers)) {
      const correctAnswers = question.answers.filter((answer: any) => answer.isCorrect);
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
    switch (questionType) {
      case 'QCM':
        return <QCMQuestion question={transformedQuestion} />;
      case 'QCS':
        return <QCSQuestion question={transformedQuestion} />;
      case 'QROC':
        return <QROCQuestion question={transformedQuestion} />;
      case 'CAS':
        return <CASQuestion question={transformedQuestion} />;
      default:
        return <QCSQuestion question={transformedQuestion} />; // Default to QCS instead of error
    }
  };

  return (
    <div className="h-full flex flex-col">


      {/* Question Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8 max-w-5xl mx-auto">

          {/* Status Badge in review */}
          {autoReveal && (
            <div className="flex justify-center">
              <Badge variant={userAnswer?.isCorrect ? 'success' as any : 'destructive' as any} className={userAnswer?.isCorrect ? 'bg-green-600' : 'bg-red-600'}>
                {userAnswer?.isCorrect ? 'Correct' : 'Incorrect'}
              </Badge>
            </div>
          )}

          {/* Status Badge + Question Component */}
          <div className="animate-fade-in-up animate-delay-100">
            {renderQuestionComponent()}
          </div>

          {/* In review mode, always reveal; remove Show Answer button */}
          {(isAnswerRevealed || showExplanation) && (
            <div className="animate-fade-in-up animate-delay-200">
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
