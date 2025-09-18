'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  RefreshCw,
  AlertCircle,
  Plus,
  HelpCircle,
  Search,
  Filter,
  Download,
  Upload
} from 'lucide-react';
import { useQuestionManagement } from '@/hooks/admin/use-question-management';
import { QuestionTable } from '@/components/admin/questions/question-table';
import QuestionFilters from '@/components/admin/questions/question-filters';
import { CreateQuestionDialog } from '@/components/admin/questions/create-question-dialog';
import { useRouter } from 'next/navigation';

/**
 * Admin Questions Management Page
 *
 * Main page for managing all questions in the system with filtering,
 * search, pagination, and question actions.
 */
export default function AdminQuestionsPage() {
  const router = useRouter();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const {
    questions,
    totalQuestions,
    currentPage,
    totalPages,
    loading,
    error,
    filters,
    updateFilters,
    clearFilters,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    updateQuestionExplanation,
    updateQuestionImages,
    goToPage,
    hasQuestions,
    hasError,
    hasFilters,
  } = useQuestionManagement();

  const handleCreateQuestion = async (questionData: any) => {
    try {
      await createQuestion(questionData);
      setShowCreateDialog(false);
    } catch (error) {
      // Error is handled in the hook
      console.error('Failed to create question:', error);
    }
  };

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Question Management</h1>
          <p className="text-muted-foreground">
            Manage questions, answers, and explanations across all courses
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {hasFilters && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                !
              </Badge>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin/content')}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Bulk Import
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Question
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuestions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {hasFilters ? 'Filtered results' : 'All questions'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Single Choice</CardTitle>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {questions.filter(q => q.questionType === 'SINGLE_CHOICE').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Current page
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Multiple Choice</CardTitle>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {questions.filter(q => q.questionType === 'MULTIPLE_CHOICE').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Current page
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Questions</CardTitle>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {questions.filter(q => q.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Current page
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Filters</CardTitle>
            <CardDescription>
              Filter questions by course, university, type, or search by question text
            </CardDescription>
          </CardHeader>
          <CardContent>
            <QuestionFilters
              filters={filters}
              onFiltersChange={updateFilters}
              onClearFilters={clearFilters}
              hasFilters={hasFilters}
            />
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {hasError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Questions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Questions
            {hasFilters && (
              <Badge variant="outline" className="ml-2">
                Filtered
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            {loading ? (
              'Loading questions...'
            ) : hasQuestions ? (
              `Showing ${questions.length} of ${totalQuestions} questions (Page ${currentPage} of ${totalPages})`
            ) : (
              'No questions found'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QuestionTable
            questions={questions}
            loading={loading}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
            onUpdateQuestion={updateQuestion}
            onDeleteQuestion={deleteQuestion}
            onUpdateExplanation={updateQuestionExplanation}
            onUpdateImages={updateQuestionImages}
          />
        </CardContent>
      </Card>

      {/* Create Question Dialog */}
      <CreateQuestionDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateQuestion={handleCreateQuestion}
      />
    </div>
  );
}
