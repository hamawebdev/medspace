'use client';

import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Eye, 
  Upload,
  FileText,
  Loader2
} from 'lucide-react';
import {
  JsonQuestionInputProps,
  ImportQuestion,
  ValidationResult,
  ValidationError
} from '@/types/question-import';

export function JsonQuestionInput({
  value,
  onChange,
  validation,
  onValidate,
  disabled = false
}: JsonQuestionInputProps) {
  const [activeTab, setActiveTab] = useState<'input' | 'preview'>('input');
  const [isValidating, setIsValidating] = useState(false);

  // Validate JSON and questions format
  const validateQuestions = useCallback((jsonString: string): ValidationResult => {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    let questions: ImportQuestion[] = [];
    let questionCount = 0;

    try {
      // Parse JSON
      const parsed = JSON.parse(jsonString);
      
      // Check if it's an array
      if (!Array.isArray(parsed)) {
        errors.push({
          field: 'root',
          message: 'JSON must be an array of questions'
        });
        return { isValid: false, errors, warnings, questionCount: 0 };
      }

      questions = parsed;
      questionCount = questions.length;

      if (questionCount === 0) {
        errors.push({
          field: 'root',
          message: 'At least one question is required'
        });
        return { isValid: false, errors, warnings, questionCount: 0 };
      }

      // Validate each question
      questions.forEach((question, questionIndex) => {
        // Required fields
        if (!question.questionText || typeof question.questionText !== 'string') {
          errors.push({
            field: 'questionText',
            message: 'Question text is required and must be a string',
            questionIndex
          });
        }

        if (!question.questionType || !['SINGLE_CHOICE', 'MULTIPLE_CHOICE'].includes(question.questionType)) {
          errors.push({
            field: 'questionType',
            message: 'Question type must be either SINGLE_CHOICE or MULTIPLE_CHOICE',
            questionIndex
          });
        }

        if (!question.answers || !Array.isArray(question.answers)) {
          errors.push({
            field: 'answers',
            message: 'Answers must be an array',
            questionIndex
          });
        } else {
          // Validate answers
          if (question.answers.length < 2) {
            errors.push({
              field: 'answers',
              message: 'At least 2 answers are required',
              questionIndex
            });
          }

          let correctAnswerCount = 0;
          question.answers.forEach((answer, answerIndex) => {
            if (!answer.answerText || typeof answer.answerText !== 'string') {
              errors.push({
                field: 'answerText',
                message: 'Answer text is required and must be a string',
                questionIndex,
                answerIndex
              });
            }

            if (typeof answer.isCorrect !== 'boolean') {
              errors.push({
                field: 'isCorrect',
                message: 'isCorrect must be a boolean',
                questionIndex,
                answerIndex
              });
            } else if (answer.isCorrect) {
              correctAnswerCount++;
            }
          });

          // Validate correct answer count based on question type
          if (question.questionType === 'SINGLE_CHOICE' && correctAnswerCount !== 1) {
            errors.push({
              field: 'answers',
              message: 'SINGLE_CHOICE questions must have exactly one correct answer',
              questionIndex
            });
          } else if (question.questionType === 'MULTIPLE_CHOICE' && correctAnswerCount < 1) {
            errors.push({
              field: 'answers',
              message: 'MULTIPLE_CHOICE questions must have at least one correct answer',
              questionIndex
            });
          }
        }

        // Optional field warnings
        if (!question.explanation) {
          warnings.push({
            field: 'explanation',
            message: 'Consider adding an explanation for better learning experience',
            questionIndex
          });
        }
      });

    } catch (parseError) {
      errors.push({
        field: 'json',
        message: `Invalid JSON format: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      questionCount
    };
  }, []);

  // Handle input change with validation
  const handleInputChange = useCallback((newValue: string) => {
    onChange(newValue);

    if (newValue.trim()) {
      setIsValidating(true);
      // Debounce validation
      const timeoutId = setTimeout(() => {
        try {
          const validationResult = validateQuestions(newValue);
          onValidate(validationResult.isValid ? JSON.parse(newValue) : []);
        } catch (error) {
          console.error('Validation error:', error);
          onValidate([]);
        } finally {
          setIsValidating(false);
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    } else {
      onValidate([]);
      setIsValidating(false);
    }
  }, [onChange, onValidate, validateQuestions]);

  // Parse questions for preview
  const previewQuestions = useMemo(() => {
    if (!value.trim() || !validation.isValid) return [];
    
    try {
      return JSON.parse(value) as ImportQuestion[];
    } catch {
      return [];
    }
  }, [value, validation.isValid]);

  // Sample JSON for reference
  const sampleJson = `[
  {
    "questionText": "What is the primary function of the heart?",
    "explanation": "The heart pumps blood throughout the body",
    "questionType": "SINGLE_CHOICE",
    "answers": [
      {
        "answerText": "Pumping blood",
        "isCorrect": true,
        "explanation": "Correct - the heart's main function is circulation"
      },
      {
        "answerText": "Filtering toxins",
        "isCorrect": false,
        "explanation": "This is the function of kidneys"
      }
    ]
  }
]`;

  return (
    <div className="space-y-4">
      {/* Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {isValidating ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : validation.isValid ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : validation.errors.length > 0 ? (
            <XCircle className="h-4 w-4 text-red-600" />
          ) : (
            <FileText className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-sm font-medium">
            {isValidating ? 'Validating...' : 
             validation.isValid ? `${validation.questionCount} questions ready` :
             validation.errors.length > 0 ? `${validation.errors.length} errors found` :
             'Enter questions JSON'}
          </span>
        </div>
        
        {validation.questionCount > 0 && (
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">
              {validation.questionCount} questions
            </Badge>
            {validation.warnings.length > 0 && (
              <Badge variant="outline" className="text-yellow-600">
                {validation.warnings.length} warnings
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'input' | 'preview')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="input">JSON Input</TabsTrigger>
          <TabsTrigger value="preview" disabled={!validation.isValid}>
            Preview ({validation.questionCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="input" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Questions JSON</CardTitle>
              <CardDescription>
                Paste your questions as a JSON array. Each question should include text, type, and answers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={value}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={sampleJson}
                disabled={disabled}
                className="min-h-[300px] font-mono text-sm"
              />
              
              {/* Validation Messages */}
              {validation.errors.length > 0 && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <div className="font-medium">Validation Errors:</div>
                      {validation.errors.slice(0, 5).map((error, index) => (
                        <div key={index} className="text-sm">
                          {error.questionIndex !== undefined && `Question ${error.questionIndex + 1}: `}
                          {error.answerIndex !== undefined && `Answer ${error.answerIndex + 1}: `}
                          {error.message}
                        </div>
                      ))}
                      {validation.errors.length > 5 && (
                        <div className="text-sm text-muted-foreground">
                          ...and {validation.errors.length - 5} more errors
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {validation.warnings.length > 0 && validation.errors.length === 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <div className="font-medium">Suggestions:</div>
                      {validation.warnings.slice(0, 3).map((warning, index) => (
                        <div key={index} className="text-sm">
                          {warning.questionIndex !== undefined && `Question ${warning.questionIndex + 1}: `}
                          {warning.message}
                        </div>
                      ))}
                      {validation.warnings.length > 3 && (
                        <div className="text-sm text-muted-foreground">
                          ...and {validation.warnings.length - 3} more suggestions
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Eye className="mr-2 h-5 w-5" />
                Question Preview
              </CardTitle>
              <CardDescription>
                Review your questions before importing
              </CardDescription>
            </CardHeader>
            <CardContent>
              {previewQuestions.length > 0 ? (
                <div className="space-y-6">
                  {previewQuestions.map((question, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-sm text-muted-foreground">
                          Question {index + 1}
                        </h4>
                        <Badge variant={question.questionType === 'SINGLE_CHOICE' ? 'default' : 'secondary'}>
                          {question.questionType.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="font-medium">{question.questionText}</p>
                        {question.explanation && (
                          <p className="text-sm text-muted-foreground italic">
                            Explanation: {question.explanation}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium text-muted-foreground">Answers:</div>
                        {question.answers.map((answer, answerIndex) => (
                          <div key={answerIndex} className="flex items-start space-x-2 text-sm">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                              answer.isCorrect ? 'bg-green-500' : 'bg-gray-300'
                            }`} />
                            <div className="flex-1">
                              <div className={answer.isCorrect ? 'font-medium text-green-700' : ''}>
                                {answer.answerText}
                              </div>
                              {answer.explanation && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {answer.explanation}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No valid questions to preview
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
