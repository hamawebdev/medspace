// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { Check, X, Edit3, FileText, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useQuiz } from '../quiz-api-context';
import { QuizQuestion } from '../quiz-context';
import { QuestionActions } from '../question-actions';

interface Props {
  question: QuizQuestion;
}

export function QROCQuestion({ question }: Props) {
  const { state, submitAnswer, revealAnswer } = useQuiz();
  const { session, isAnswerRevealed } = state;
  
  const [textAnswer, setTextAnswer] = useState<string>('');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const userAnswer = session.userAnswers[String(question.id)];
  const existingAnswer = userAnswer?.textAnswer || '';

  // Reset state when question changes and initialize with existing answer
  useEffect(() => {
    if (existingAnswer) {
      setTextAnswer(existingAnswer);
      setHasSubmitted(true);
    } else {
      // Reset state for new question without existing answer
      setTextAnswer('');
      setHasSubmitted(false);
    }
  }, [question.id, existingAnswer]);

  const handleSubmit = () => {
    if (!textAnswer.trim()) return;
    // Prevent submission if session is completed
    if (session.status === 'completed' || session.status === 'COMPLETED') {
      console.warn('Cannot submit answer: Quiz session is completed');
      return;
    }

    // For QROC questions, we'll do a simple keyword matching for scoring
    // In a real application, this would be more sophisticated
    const isCorrect = checkAnswerCorrectness(textAnswer, question.correctAnswers || []);

    submitAnswer({
      textAnswer: textAnswer.trim(),
      isCorrect,
    });

    setHasSubmitted(true);
  };

  const handleReset = () => {
    setTextAnswer('');
    setHasSubmitted(false);
  };

  // Simple keyword matching for QROC scoring
  const checkAnswerCorrectness = (userText: string, correctAnswers: string[]): boolean => {
    const userTextLower = userText.toLowerCase().trim();
    
    // Check if user answer contains key terms from any correct answer
    return correctAnswers.some(correctAnswer => {
      const keywords = correctAnswer.toLowerCase().split(/[\s,;]+/);
      const matchedKeywords = keywords.filter(keyword => 
        keyword.length > 2 && userTextLower.includes(keyword)
      );
      
      // Consider correct if at least 60% of keywords are matched
      return matchedKeywords.length >= Math.ceil(keywords.length * 0.6);
    });
  };

  const getMatchedKeywords = (userText: string, correctAnswers: string[]): string[] => {
    const userTextLower = userText.toLowerCase();
    const allKeywords = new Set<string>();
    
    correctAnswers.forEach(answer => {
      const keywords = answer.toLowerCase().split(/[\s,;]+/);
      keywords.forEach(keyword => {
        if (keyword.length > 2 && userTextLower.includes(keyword)) {
          allKeywords.add(keyword);
        }
      });
    });
    
    return Array.from(allKeywords);
  };

  const wordCount = textAnswer.trim().split(/\s+/).filter(word => word.length > 0).length;
  const charCount = textAnswer.length;
  const maxChars = 500; // Reasonable limit for short responses

  return (
    <div className="space-y-6">
      {/* Question Content */}
      <Card className="border-primary/30 bg-gradient-to-br from-card via-primary/5 to-accent/10 shadow-lg hover:shadow-xl transition-all duration-300 card-hover-lift gap-0 py-0">
        <CardContent className="p-4 sm:p-5 lg:p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 mb-4">
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
              <div className="prose prose-base max-w-none pl-4">
                <p className="text-lg leading-relaxed font-semibold text-foreground tracking-tight">
                  {question.content}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <div className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
        <p className="text-sm text-muted-foreground font-medium">
          Rédigez une réponse courte et précise
        </p>

        {isAnswerRevealed && (
          <div className="text-sm">
            {userAnswer?.isCorrect ? (
              <span className="text-green-600 font-semibold flex items-center gap-1">
                <span className="text-green-500">✓</span> Réponse acceptable
              </span>
            ) : (
              <span className="text-orange-600 font-semibold flex items-center gap-1">
                <span className="text-orange-500">⚠</span> Réponse à revoir
              </span>
            )}
          </div>
        )}
      </div>

      {/* Answer Input */}
      <Card className={cn(
        "transition-all duration-300 ease-out card-hover-lift gap-0 py-0",
        isAnswerRevealed && userAnswer?.isCorrect && "border-green-300 bg-green-50/50 shadow-sm",
        isAnswerRevealed && !userAnswer?.isCorrect && "border-orange-300 bg-orange-50/50 shadow-sm"
      )}>
        <CardContent className="pt-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
              <Edit3 className="h-4 w-4" />
              <span>Votre réponse :</span>
            </div>
            
            <Textarea
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              placeholder="Tapez votre réponse ici..."
              disabled={isAnswerRevealed && hasSubmitted || session.status === 'completed' || session.status === 'COMPLETED'}
              maxLength={maxChars}
              rows={2}
              className={cn(
                "resize-none text-sm sm:text-base focus-ring min-h-[60px] sm:min-h-[80px]",
                isAnswerRevealed && hasSubmitted && "bg-muted/50"
              )}
            />
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>{wordCount} mot{wordCount !== 1 ? 's' : ''}</span>
                <span>{charCount}/{maxChars} caractères</span>
              </div>
              
              {isAnswerRevealed && hasSubmitted && (
                <div className="flex items-center gap-2">
                  <FileText className="h-3 w-3" />
                  <span>Réponse soumise</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Show Answer Button */}
      {!isAnswerRevealed && session.status !== 'COMPLETED' && session.status !== 'completed' && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={revealAnswer}
            className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <Lightbulb className="h-4 w-4" />
            Show Answer & Explanation
          </Button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4">
        <div className="text-sm text-muted-foreground">
          {textAnswer.trim() ? (
            `Réponse de ${wordCount} mot${wordCount !== 1 ? 's' : ''}`
          ) : (
            'Aucune réponse saisie'
          )}
        </div>

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
          
          {!hasSubmitted && (
            <Button
              onClick={handleSubmit}
              disabled={!textAnswer.trim() || session.status === 'completed' || session.status === 'COMPLETED'}
              size="sm"
            >
              {session.status === 'completed' || session.status === 'COMPLETED'
                ? 'Quiz Completed'
                : 'Valider la réponse'}
            </Button>
          )}
        </div>
      </div>

      {/* Answer Analysis */}
      {isAnswerRevealed && textAnswer.trim() && (
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Analyse de votre réponse :</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground">Votre réponse :</span>
                  <div className="mt-1 p-2 bg-background rounded border">
                    <p className="text-sm">{textAnswer}</p>
                  </div>
                </div>
                
                <div>
                  <span className="text-muted-foreground">Éléments de réponse attendus :</span>
                  <div className="mt-1 space-y-1">
                    {question.correctAnswers?.map((answer, index) => (
                      <div key={index} className="p-2 bg-background rounded border">
                        <p className="text-sm text-green-700">{answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Keyword Analysis */}
              {userAnswer?.isCorrect && (
                <div>
                  <span className="text-muted-foreground">Mots-clés identifiés :</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {getMatchedKeywords(textAnswer, question.correctAnswers || []).map((keyword, index) => (
                      <Badge key={index} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                <p>
                  <strong>Note :</strong> L&apose;évaluation automatique des réponses ouvertes est indicative. 
                  Votre enseignant peut réviser cette évaluation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expected Answers Preview (only when revealed) */}
      {isAnswerRevealed && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-blue-900">Réponses types :</h4>
              <div className="space-y-2">
                {question.correctAnswers?.map((answer, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-800">{answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
