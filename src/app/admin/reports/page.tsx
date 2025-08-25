'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  RefreshCw,
  AlertCircle,
  FileQuestion,
  Search,
  Filter,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  TrendingUp
} from 'lucide-react';
import { useQuestionReportsManagement } from '@/hooks/admin/use-question-reports-management';
import { QuestionReportsTable } from '@/components/admin/question-reports/question-reports-table';
import { QuestionReportsFilters } from '@/components/admin/question-reports/question-reports-filters';
import { QuestionReportsStats } from '@/components/admin/question-reports/question-reports-stats';
import { ReviewReportDialog } from '@/components/admin/question-reports/review-report-dialog';

/**
 * Admin Question Reports Management Page
 *
 * Main page for managing question reports submitted by students,
 * with filtering, search, pagination, and review operations.
 */
export default function AdminQuestionReportsPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [reviewingReport, setReviewingReport] = useState(null);

  const {
    reports,
    totalReports,
    currentPage,
    totalPages,
    loading,
    error,
    filters,
    updateFilters,
    clearFilters,
    reviewReport,
    goToPage,
    hasReports,
    hasError,
    hasFilters,
    refresh,
    stats
  } = useQuestionReportsManagement();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Question Reports Management</h1>
          <p className="text-muted-foreground">
            Review and respond to question reports submitted by students
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
              <Badge variant="secondary" className="ml-1">
                Active
              </Badge>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {hasError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || 'Failed to load question reports. Please try again.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Question Reports Stats */}
      {stats && <QuestionReportsStats stats={stats} loading={loading} />}

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
            <CardDescription>
              Filter and search question reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <QuestionReportsFilters
              filters={filters}
              onFiltersChange={updateFilters}
              onClearFilters={clearFilters}
            />
          </CardContent>
        </Card>
      )}

      {/* Quick Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats?.pending || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.resolved || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully resolved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dismissed</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats?.dismissed || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Dismissed reports
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileQuestion className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.total || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              All time reports
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Question Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileQuestion className="h-5 w-5" />
            Question Reports
            {hasFilters && (
              <Badge variant="outline" className="ml-2">
                Filtered
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            {loading ? (
              'Loading question reports...'
            ) : hasReports ? (
              `Showing ${reports.length} of ${totalReports} reports (Page ${currentPage} of ${totalPages})`
            ) : (
              'No question reports found'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QuestionReportsTable
            reports={reports}
            loading={loading}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
            onReviewReport={(report) => setReviewingReport(report)}
          />
        </CardContent>
      </Card>

      {/* Review Report Dialog */}
      {reviewingReport && (
        <ReviewReportDialog
          report={reviewingReport}
          open={!!reviewingReport}
          onOpenChange={(open) => !open && setReviewingReport(null)}
          onReviewReport={reviewReport}
        />
      )}
    </div>
  );
}
