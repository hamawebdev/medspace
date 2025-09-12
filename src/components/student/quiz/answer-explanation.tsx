// @ts-nocheck
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, BookOpen, Check, X, Info } from 'lucide-react';
import { QuizQuestion, UserAnswer } from './quiz-context';

interface Props {
  question: QuizQuestion;
  userAnswer?: UserAnswer;
}

export function AnswerExplanation({ question, userAnswer }: Props) {
  const isCorrect = userAnswer?.isCorrect || false;

  return (
    <Card id="answer-explanation" className="border-primary/20 bg-primary/5 shadow-sm">
      <CardHeader className="pb-1 pt-2">
        <CardTitle className="flex items-center gap-2 text-primary-foreground text-sm sm:text-base font-bold">
          <Lightbulb className="h-4 w-4" />
          Explanation
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 pb-2">
        <div className="prose prose-xs sm:prose-sm max-w-none">
          <p className="text-xs sm:text-sm leading-tight text-primary-foreground font-medium">
            {question.explanation}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
