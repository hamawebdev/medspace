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
    <Card className="border-blue-200 bg-blue-50/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Lightbulb className="h-4 w-4" />
          Explication
        </CardTitle>
        <CardDescription className="text-blue-700">
          Comprenez les concepts clés de cette question
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="prose prose-sm max-w-none">
          <p className="text-sm leading-relaxed text-blue-900">
            {question.explanation}
          </p>
        </div>


      </CardContent>
    </Card>
  );
}
