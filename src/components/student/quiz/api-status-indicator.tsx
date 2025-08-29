// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  Wifi, 
  WifiOff, 
  Cloud, 
  CloudOff,
  Loader2,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useApiQuiz } from './quiz-api-context';
import { cn } from '@/lib/utils';

// API Status Indicator Component (simplified, no network monitoring)
export function ApiStatusIndicator() {
  const { state, setAutoSave, clearSubmissionError } = useApiQuiz();
  const isOnline = true; // Always assume online, no monitoring

  const getStatusInfo = () => {
    if (!isOnline) {
      return {
        icon: WifiOff,
        color: 'text-destructive',
        bgColor: 'bg-destructive/10',
        borderColor: 'border-destructive/20',
        status: 'Offline',
        description: 'Working offline - answers saved locally',
      };
    }

    if (state.submittingAnswer) {
      return {
        icon: Loader2,
        color: 'text-primary',
        bgColor: 'bg-primary/10',
        borderColor: 'border-primary/20',
        status: 'Syncing',
        description: 'Submitting answer to server...',
        animate: true,
      };
    }

    if (state.lastSubmissionError) {
      return {
        icon: AlertCircle,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
        borderColor: 'border-yellow-200 dark:border-yellow-800',
        status: 'Sync Error',
        description: state.lastSubmissionError,
      };
    }

    if (state.apiSessionId && state.autoSave) {
      return {
        icon: Cloud,
        color: 'text-primary',
        bgColor: 'bg-primary/10',
        borderColor: 'border-primary/20',
        status: 'Online',
        description: 'Auto-save enabled - answers synced automatically',
      };
    }

    return {
      icon: CloudOff,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted/10',
      borderColor: 'border-muted/20',
      status: 'Local Only',
      description: 'Answers saved locally only',
    };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="flex items-center gap-2">

      {/* Settings Popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Settings className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Quiz Sync Settings</CardTitle>
              <CardDescription className="text-xs">
                {statusInfo.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Auto-save Toggle */}
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-save" className="text-sm">
                  Auto-save answers
                </Label>
                <Switch
                  id="auto-save"
                  checked={state.autoSave}
                  onCheckedChange={setAutoSave}
                  disabled={!isOnline || !state.apiSessionId}
                />
              </div>

              {/* Connection Status */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span>Network:</span>
                  <div className="flex items-center gap-1">
                    {isOnline ? (
                      <>
                        <Wifi className="h-3 w-3 text-green-500" />
                        <span className="text-green-600">Connected</span>
                      </>
                    ) : (
                      <>
                        <WifiOff className="h-3 w-3 text-red-500" />
                        <span className="text-red-600">Offline</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span>API Session:</span>
                  <div className="flex items-center gap-1">
                    {state.apiSessionId ? (
                      <>
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span className="text-green-600">Active</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3 text-gray-500" />
                        <span className="text-gray-600">Local Mode</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Error Handling */}
              {state.lastSubmissionError && (
                <div className="space-y-2">
                  <div className="text-xs text-red-600 bg-red-50 dark:bg-red-950/20 p-2 rounded">
                    {state.lastSubmissionError}
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={clearSubmissionError}
                    className="w-full text-xs"
                  >
                    Dismiss Error
                  </Button>
                </div>
              )}

              {/* Session Info */}
              {state.apiSessionId && (
                <div className="text-xs text-muted-foreground">
                  Session ID: {state.apiSessionId}
                </div>
              )}
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Answer Submission Status Component
interface AnswerSubmissionStatusProps {
  questionId: string;
  className?: string;
}

export function AnswerSubmissionStatus({ questionId, className = '' }: AnswerSubmissionStatusProps) {
  const { state } = useApiQuiz();
  const userAnswer = state.session.userAnswers[questionId];
  const isCurrentQuestion = state.currentQuestion?.id === questionId;

  if (!userAnswer) return null;

  const getSubmissionStatus = () => {
    if (isCurrentQuestion && state.submittingAnswer) {
      return {
        icon: Loader2,
        color: 'text-primary',
        label: 'Submitting...',
        animate: true,
      };
    }

    if (state.lastSubmissionError && isCurrentQuestion) {
      return {
        icon: AlertCircle,
        color: 'text-destructive',
        label: 'Sync failed',
      };
    }

    if (state.apiSessionId && state.autoSave) {
      return {
        icon: CheckCircle,
        color: 'text-primary',
        label: 'Synced',
      };
    }

    return {
      icon: CloudOff,
      color: 'text-muted-foreground',
      label: 'Local only',
    };
  };

  const status = getSubmissionStatus();
  const StatusIcon = status.icon;

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <StatusIcon 
        className={cn(
          'h-3 w-3',
          status.color,
          status.animate && 'animate-spin'
        )} 
      />
      <span className={cn('text-xs', status.color)}>
        {status.label}
      </span>
    </div>
  );
}

// Quiz Progress Sync Indicator
export function QuizProgressSyncIndicator() {
  const { state } = useApiQuiz();
  
  const answeredQuestions = Object.keys(state.session.userAnswers).length;
  const totalQuestions = state.session.totalQuestions;
  const syncedQuestions = state.apiSessionId && state.autoSave ? answeredQuestions : 0;

  return (
    <div className="text-xs text-muted-foreground">
      <div className="flex items-center justify-between">
        <span>Progress:</span>
        <span>{answeredQuestions}/{totalQuestions} answered</span>
      </div>
      {state.apiSessionId && (
        <div className="flex items-center justify-between">
          <span>Synced:</span>
          <span className={cn(
            syncedQuestions === answeredQuestions ? 'text-green-600' : 'text-yellow-600'
          )}>
            {syncedQuestions}/{answeredQuestions}
          </span>
        </div>
      )}
    </div>
  );
}
