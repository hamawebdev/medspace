'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, X, Upload, AlertCircle, BookOpen } from 'lucide-react';
import { CreateQuestionRequest } from '@/types/api';

interface CourseSpecificQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateQuestion: (questionData: CreateQuestionRequest) => Promise<void>;
  courseId: number;
  courseName: string;
}

interface Answer {
  answerText: string;
  isCorrect: boolean;
  explanation?: string;
}

export function CourseSpecificQuestionDialog({
  open,
  onOpenChange,
  onCreateQuestion,
  courseId,
  courseName,
}: CourseSpecificQuestionDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state - simplified without course/module/university selectors
  const [formData, setFormData] = useState({
    questionText: '',
    explanation: '',
    questionType: '' as 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | '',
    yearLevel: '',
    examYear: undefined as number | undefined,
  });

  const [answers, setAnswers] = useState<Answer[]>([
    { answerText: '', isCorrect: false, explanation: '' },
    { answerText: '', isCorrect: false, explanation: '' },
  ]);

  const [questionImages, setQuestionImages] = useState<Array<File & { altText?: string }>>([]);

  const resetForm = () => {
    setFormData({
      questionText: '',
      explanation: '',
      questionType: '',
      yearLevel: '',
      examYear: undefined,
    });
    setAnswers([
      { answerText: '', isCorrect: false, explanation: '' },
      { answerText: '', isCorrect: false, explanation: '' },
    ]);
    setQuestionImages([]);
    setError(null);
  };

  const addAnswer = () => {
    setAnswers([...answers, { answerText: '', isCorrect: false, explanation: '' }]);
  };

  const removeAnswer = (index: number) => {
    if (answers.length > 2) {
      setAnswers(answers.filter((_, i) => i !== index));
    }
  };

  const updateAnswer = (index: number, field: keyof Answer, value: string | boolean) => {
    const newAnswers = [...answers];
    newAnswers[index] = { ...newAnswers[index], [field]: value };
    setAnswers(newAnswers);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.map(file => Object.assign(file, { altText: '' }));
    setQuestionImages(prev => [...prev, ...imageFiles]);
  };

  const removeImage = (index: number) => {
    setQuestionImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.questionText || !formData.questionType) {
      setError('Please fill in all required fields');
      return;
    }

    const validAnswers = answers.filter(a => a.answerText.trim() !== '');
    if (validAnswers.length < 2) {
      setError('Please provide at least 2 answers');
      return;
    }

    const correctAnswers = validAnswers.filter(a => a.isCorrect);
    if (correctAnswers.length === 0) {
      setError('Please mark at least one answer as correct');
      return;
    }

    if (formData.questionType === 'SINGLE_CHOICE' && correctAnswers.length > 1) {
      setError('Single choice questions can only have one correct answer');
      return;
    }

    try {
      setLoading(true);
      
      const questionData: CreateQuestionRequest = {
        questionText: formData.questionText,
        explanation: formData.explanation || undefined,
        questionType: formData.questionType,
        courseId: courseId, // Auto-populated from props
        yearLevel: formData.yearLevel || undefined,
        examYear: formData.examYear,
        questionImages: questionImages.length > 0 ? questionImages : undefined,
        answers: validAnswers.map(answer => ({
          answerText: answer.answerText,
          isCorrect: answer.isCorrect,
          explanation: answer.explanation || undefined,
        })),
      };

      await onCreateQuestion(questionData);
      resetForm();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create question');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!loading) {
      onOpenChange(newOpen);
      if (!newOpen) {
        resetForm();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Question
          </DialogTitle>
          <DialogDescription>
            Create a new question for <strong>{courseName}</strong>. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        {/* Course Info Badge */}
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Course:</span>
          <Badge variant="secondary">{courseName}</Badge>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Question Text */}
          <div className="space-y-2">
            <Label htmlFor="questionText">Question Text *</Label>
            <Textarea
              id="questionText"
              placeholder="Enter your question here..."
              value={formData.questionText}
              onChange={(e) => setFormData(prev => ({ ...prev, questionText: e.target.value }))}
              disabled={loading}
              rows={3}
            />
          </div>

          {/* Question Type */}
          <div className="space-y-2">
            <Label>Question Type *</Label>
            <Select
              value={formData.questionType}
              onValueChange={(value: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE') => 
                setFormData(prev => ({ ...prev, questionType: value }))
              }
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select question type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SINGLE_CHOICE">Single Choice</SelectItem>
                <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Optional Fields */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Year Level</Label>
              <Input
                placeholder="e.g., Year 1, Year 2"
                value={formData.yearLevel}
                onChange={(e) => setFormData(prev => ({ ...prev, yearLevel: e.target.value }))}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label>Exam Year</Label>
              <Input
                type="number"
                placeholder="e.g., 2024"
                value={formData.examYear || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  examYear: e.target.value ? parseInt(e.target.value) : undefined 
                }))}
                disabled={loading}
              />
            </div>
          </div>

          {/* Explanation */}
          <div className="space-y-2">
            <Label htmlFor="explanation">Explanation</Label>
            <Textarea
              id="explanation"
              placeholder="Provide an explanation for the correct answer..."
              value={formData.explanation}
              onChange={(e) => setFormData(prev => ({ ...prev, explanation: e.target.value }))}
              disabled={loading}
              rows={2}
            />
          </div>

          {/* Question Images */}
          <div className="space-y-2">
            <Label>Question Images</Label>
            <div className="space-y-2">
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={loading}
              />
              {questionImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {questionImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Question image ${index + 1}`}
                        className="w-full h-20 object-cover rounded border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Answers */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Answers *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAnswer}
                disabled={loading || answers.length >= 6}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Answer
              </Button>
            </div>

            <div className="space-y-3">
              {answers.map((answer, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Answer {index + 1}</Label>
                    {answers.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAnswer(index)}
                        disabled={loading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Input
                      placeholder="Enter answer text..."
                      value={answer.answerText}
                      onChange={(e) => updateAnswer(index, 'answerText', e.target.value)}
                      disabled={loading}
                    />

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={answer.isCorrect}
                        onCheckedChange={(checked) => updateAnswer(index, 'isCorrect', checked)}
                        disabled={loading}
                      />
                      <Label className="text-sm">Correct Answer</Label>
                    </div>

                    <Input
                      placeholder="Optional: Explanation for this answer..."
                      value={answer.explanation || ''}
                      onChange={(e) => updateAnswer(index, 'explanation', e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Question
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
