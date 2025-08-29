// @ts-nocheck
'use client';

import { useState } from 'react';
import {
  CheckCircle,
  Circle,
  Clock,
  Star,
  Flag,
  AlertTriangle,
  Filter,
  Search,
  BookOpen,
  Target,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useQuiz } from './quiz-api-context';

type FilterType = 'all' | 'answered' | 'unanswered' | 'bookmarked' | 'flagged';

export function QuizSidebar() {
  const { state, goToQuestion, toggleSidebar } = useQuiz();
  const { session, currentQuestion } = state;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');

  const getQuestionStatus = (questionId: string | number) => {
    const id = String(questionId);
    const userAnswer = session.userAnswers[id];
    if (!userAnswer) return 'unanswered';

    if (userAnswer.selectedOptions?.length || userAnswer.textAnswer) {
      return 'answered';
    }
    return 'unanswered';
  };

  const isQuestionBookmarked = (questionId: string | number) => {
    const id = String(questionId);
    return session.userAnswers[id]?.isBookmarked || false;
  };

  const isQuestionFlagged = (questionId: string | number) => {
    const id = String(questionId);
    const flags = session.userAnswers[id]?.flags || [];
    return flags.length > 0;
  };

  const getQuestionFlags = (questionId: string | number) => {
    const id = String(questionId);
    return session.userAnswers[id]?.flags || [];
  };

  const filteredQuestions = session.questions.filter((question, index) => {
    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const questionTitle = question.title || question.questionText || '';
      const questionContent = question.content || question.questionText || '';
      const questionTags = question.tags || [];

      const matchesSearch =
        questionTitle.toLowerCase().includes(searchLower) ||
        questionContent.toLowerCase().includes(searchLower) ||
        questionTags.some(tag => tag.toLowerCase().includes(searchLower));

      if (!matchesSearch) return false;
    }

    // Status filter
    switch (filterType) {
      case 'answered':
        return getQuestionStatus(question.id) === 'answered';
      case 'unanswered':
        return getQuestionStatus(question.id) === 'unanswered';
      case 'bookmarked':
        return isQuestionBookmarked(question.id);
      case 'flagged':
        return isQuestionFlagged(question.id);
      default:
        return true;
    }
  });

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'QCM':
        return '☑️';
      case 'QCS':
        return '⚪';
      case 'QROC':
        return '✏️';
      case 'CAS':
        return '🏥';
      default:
        return '❓';
    }
  };

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

  const answeredCount = Object.keys(session.userAnswers).filter(
    questionId => getQuestionStatus(questionId) === 'answered'
  ).length;

  const bookmarkedCount = Object.keys(session.userAnswers).filter(
    questionId => isQuestionBookmarked(questionId)
  ).length;

  const flaggedCount = Object.keys(session.userAnswers).filter(
    questionId => isQuestionFlagged(questionId)
  ).length;

  return (
    <div className="h-full flex flex-col bg-card/30 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 p-3 sm:p-4 lg:p-6 xl:p-8 border-b bg-card/50">
        <div className="space-y-3 sm:space-y-4 lg:space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 min-w-0 flex-1">
              <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6 text-primary" />
              </div>
              <h2 className="font-bold text-sm sm:text-base lg:text-lg xl:text-xl tracking-tight text-foreground truncate">
                Question Navigator
              </h2>
            </div>

            {/* Close button - visible on all screens */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="p-1.5 sm:p-2 lg:p-2.5 hover:bg-accent/50 focus-ring transition-colors flex-shrink-0"
              aria-label="Close navigation"
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4 text-xs">
            <div className="text-center p-2 sm:p-3 lg:p-4 xl:p-5 rounded-lg bg-background/80 border border-border/50 hover:bg-background transition-colors">
              <div className="font-bold text-base sm:text-lg lg:text-xl xl:text-2xl text-primary">{answeredCount}</div>
              <div className="text-muted-foreground font-medium text-xs sm:text-sm lg:text-base leading-tight">Answered</div>
            </div>
            <div className="text-center p-2 sm:p-3 lg:p-4 xl:p-5 rounded-lg bg-background/80 border border-border/50 hover:bg-background transition-colors">
              <div className="font-bold text-base sm:text-lg lg:text-xl xl:text-2xl text-blue-600">{bookmarkedCount}</div>
              <div className="text-muted-foreground font-medium text-xs sm:text-sm lg:text-base leading-tight">Bookmarked</div>
            </div>
            <div className="text-center p-2 sm:p-3 lg:p-4 xl:p-5 rounded-lg bg-background/80 border border-border/50 hover:bg-background transition-colors">
              <div className="font-bold text-base sm:text-lg lg:text-xl xl:text-2xl text-orange-600">{flaggedCount}</div>
              <div className="text-muted-foreground font-medium text-xs sm:text-sm lg:text-base leading-tight">Flagged</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex-shrink-0 p-3 sm:p-4 lg:p-6 xl:p-8 space-y-3 sm:space-y-4 lg:space-y-5 border-b bg-muted/20">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 sm:pl-10 lg:pl-12 h-8 sm:h-9 lg:h-10 xl:h-11 text-xs sm:text-sm lg:text-base focus-ring bg-background/80 border-border/50"
          />
        </div>

        <Select value={filterType} onValueChange={(value: FilterType) => setFilterType(value)}>
          <SelectTrigger className="h-8 sm:h-9 lg:h-10 xl:h-11 text-xs sm:text-sm lg:text-base focus-ring bg-background/80 border-border/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-background/95 backdrop-blur-sm border-border/50">
            <SelectItem value="all" className="font-medium text-xs sm:text-sm lg:text-base">All Questions ({session.totalQuestions})</SelectItem>
            <SelectItem value="answered" className="font-medium text-xs sm:text-sm lg:text-base">Answered ({answeredCount})</SelectItem>
            <SelectItem value="unanswered" className="font-medium text-xs sm:text-sm lg:text-base">Unanswered ({session.totalQuestions - answeredCount})</SelectItem>
            <SelectItem value="bookmarked" className="font-medium text-xs sm:text-sm lg:text-base">Bookmarked ({bookmarkedCount})</SelectItem>
            <SelectItem value="flagged" className="font-medium text-xs sm:text-sm lg:text-base">Flagged ({flaggedCount})</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Question List - Scrollable */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-2 sm:p-3 lg:p-4 xl:p-6 space-y-2 sm:space-y-3 lg:space-y-4">
          {filteredQuestions.map((question, filteredIndex) => {
            const originalIndex = session.questions.findIndex(q => q.id === question.id);
            const isActive = currentQuestion && currentQuestion.id === question.id;
            const status = getQuestionStatus(question.id);
            const isBookmarked = isQuestionBookmarked(question.id);
            const flags = getQuestionFlags(question.id);
            const timeSpent = session.userAnswers[String(question.id)]?.timeSpent || 0;

            return (
              <Button
                key={question.id}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start p-2 sm:p-3 lg:p-3 xl:p-4 h-auto text-left btn-modern focus-ring transition-all duration-300",
                  "min-h-[48px] sm:min-h-[52px] lg:min-h-[56px] xl:min-h-[60px]",
                  isActive && "ring-2 ring-primary/30 shadow-md bg-primary/5",
                  !isActive && "hover:bg-accent/50 hover:shadow-sm"
                )}
                onClick={() => goToQuestion(originalIndex)}
              >
                <div className="flex items-start gap-2 sm:gap-3 lg:gap-3 w-full min-w-0">
                  {/* Question Number & Status */}
                  <div className="flex flex-col items-center gap-1 sm:gap-1.5 lg:gap-2 flex-shrink-0">
                    <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2">
                      <span className={cn(
                        "text-xs sm:text-sm font-bold w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8 rounded-md flex items-center justify-center transition-colors",
                        isActive ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground"
                      )}>
                        {originalIndex + 1}
                      </span>
                      {status === 'answered' ? (
                        <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 lg:h-4 lg:w-4 text-green-600" />
                      ) : (
                        <Circle className="h-3 w-3 sm:h-4 sm:w-4 lg:h-4 lg:w-4 text-muted-foreground" />
                      )}
                    </div>
                    <span className="text-xs sm:text-sm lg:text-sm">{getQuestionTypeIcon(question.type || 'QCM')}</span>
                  </div>

                  {/* Question Info */}
                  <div className="flex-1 min-w-0 space-y-1 sm:space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs sm:text-sm lg:text-sm font-medium truncate leading-tight">
                        {question.title || question.questionText || `Question ${originalIndex + 1}`}
                      </h4>
                      <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                        {isBookmarked && (
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        )}
                        {flags.includes('difficult') && (
                          <AlertTriangle className="h-3 w-3 text-red-500" />
                        )}
                        {flags.includes('review_later') && (
                          <Flag className="h-3 w-3 text-blue-500" />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground gap-2">
                      <Badge
                        variant="outline"
                        className={cn("text-xs px-1 py-0 font-medium", getDifficultyColor(question.difficulty || 'medium'))}
                      >
                        {question.difficulty || 'Medium'}
                      </Badge>

                      {timeSpent > 0 && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Clock className="h-3 w-3" />
                          <span className="hidden sm:inline font-mono text-xs">
                            {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
                          </span>
                          <span className="sm:hidden font-mono text-xs">
                            {Math.floor(timeSpent / 60)}m
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    {question.tags && Array.isArray(question.tags) && question.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {question.tags.slice(0, 2).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                            {tag}
                          </Badge>
                        ))}
                        {question.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            +{question.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Button>
            );
          })}
          </div>
        </ScrollArea>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 p-4 border-t">
        <div className="text-xs text-muted-foreground text-center">
          {filteredQuestions.length} of {session.totalQuestions} questions
          {searchQuery && ` matching "${searchQuery}"`}
        </div>
      </div>
    </div>
  );
}
