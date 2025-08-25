// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { Stethoscope, FileText, User, Calendar, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useQuiz } from '../quiz-api-context';
import { QuizQuestion } from '../quiz-context';
import { QCMQuestion } from './qcm-question';
import { QCSQuestion } from './qcs-question';
import { QuestionActions } from '../question-actions';

interface Props {
  question: QuizQuestion;
}

// Extended question type for clinical cases
interface ClinicalCase extends QuizQuestion {
  clinicalInfo?: {
    patientAge: string;
    patientGender: string;
    setting: string;
    chiefComplaint: string;
    history: string;
    examination: string;
    investigations?: string;
  };
  subQuestions?: Array<{
    id: string;
    type: 'QCM' | 'QCS';
    content: string;
    options: Array<{
      id: string;
      text: string;
      isCorrect: boolean;
    }>;
  }>;
}

export function CASQuestion({ question }: Props) {
  const { state } = useQuiz();
  const { session } = state;
  
  // For now, we'll treat CAS questions as enhanced QCM/QCS with clinical context
  // In a real implementation, this would handle multiple sub-questions
  const clinicalCase = question as ClinicalCase;

  // Get clinical information from API data - no fallback
  const clinicalInfo = clinicalCase.clinicalInfo;

  // If no clinical info is provided from API, show error message
  if (!clinicalInfo) {
    return (
      <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
        <p className="text-red-600">
          ⚠️ Clinical case information not available from API. Please contact support.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Clinical Case Header */}
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50/50 to-blue-100/30 card-hover-lift">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-blue-900 text-xl font-bold tracking-tight">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Stethoscope className="h-5 w-5 text-blue-600" />
            </div>
            Cas Clinique
          </CardTitle>
          <CardDescription className="text-blue-700 text-base leading-relaxed">
            Analysez le cas clinique suivant et répondez aux questions avec attention
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Patient Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" />
            Informations Patient
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              <span className="text-muted-foreground font-medium">Âge :</span>
              <span className="font-semibold text-foreground">{clinicalInfo.patientAge}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              <span className="text-muted-foreground font-medium">Sexe :</span>
              <span className="font-semibold text-foreground">{clinicalInfo.patientGender}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              <span className="text-muted-foreground font-medium">Service :</span>
              <span className="font-semibold text-foreground">{clinicalInfo.setting}</span>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h4 className="font-medium text-sm mb-2">Motif de consultation :</h4>
            <p className="text-sm text-muted-foreground">{clinicalInfo.chiefComplaint}</p>
          </div>
        </CardContent>
      </Card>

      {/* Clinical History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Histoire de la Maladie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{clinicalInfo.history}</p>
        </CardContent>
      </Card>

      {/* Physical Examination */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Examen Clinique</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{clinicalInfo.examination}</p>
        </CardContent>
      </Card>

      {/* Investigations */}
      {clinicalInfo.investigations && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Examens Complémentaires</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{clinicalInfo.investigations}</p>
          </CardContent>
        </Card>
      )}

      {/* Question Section */}
      <Card className="border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse-soft"></div>
                <h3 className="text-sm font-semibold text-primary uppercase tracking-wide">Question</h3>
              </div>
              {/* Removed duplicate QuestionActions here; actions appear once below */}
            </div>
            <div className="prose prose-sm max-w-none mb-4">
              <p className="text-lg leading-relaxed font-medium text-foreground">
                {question.content}
              </p>
            </div>
          </div>

          {/* Render the appropriate question type */}
          {question.type === 'QCM' ? (
            <QCMQuestion question={question} />
          ) : question.type === 'QCS' ? (
            <QCSQuestion question={question} />
          ) : (
            <div className="text-muted-foreground">
              Question type not supported in clinical cases: {question.type}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Clinical Context Note */}
      <Card className="bg-amber-50/50 border-amber-200">
        <CardContent className="pt-4">
          <div className="flex items-start gap-2">
            <Stethoscope className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-amber-800">
              <p className="font-medium">Note clinique :</p>
              <p>
                Dans un cas clinique réel, considérez toujours le contexte complet du patient, 
                ses antécédents, et l&apos;évolution clinique pour prendre vos décisions thérapeutiques.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
