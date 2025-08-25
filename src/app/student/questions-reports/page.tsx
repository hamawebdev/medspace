// @ts-nocheck
'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, Calendar, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingSpinner } from '@/components/loading-states'
import { useStudentAuth } from '@/hooks/use-auth'
import { useQuestionReports } from '@/hooks/use-question-reports'

export default function QuestionReportsPage() {
  const { isAuthenticated, loading: authLoading } = useStudentAuth()
  const searchParams = useSearchParams()
  const router = useRouter()

  const [page, setPage] = useState<number>(Number(searchParams.get('page')) || 1)
  const [limit] = useState<number>(Number(searchParams.get('limit')) || 12)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [status, setStatus] = useState<string>(searchParams.get('status') || 'all')

  const { reports, pagination, loading } = useQuestionReports({ page, limit, status: status as any })

  useEffect(() => {
    // Update URL for shareability without triggering a navigation on status change
    const params = new URLSearchParams()
    if (page) params.set('page', String(page))
    if (limit) params.set('limit', String(limit))
    if (searchQuery) params.set('q', searchQuery)
    // intentionally NOT syncing status to avoid a page navigation feel
    const qs = params.toString()
    // Only call replace if actually changed to avoid churn
    if (typeof window !== 'undefined' && (`?${qs}`) !== window.location.search) {
      router.replace(`?${qs}`)
    }
  }, [page, limit, searchQuery, router])

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString()
    } catch { return '' }
  }

  const list = useMemo(() => {
    const arr = Array.isArray(reports) ? reports : []
    const q = searchQuery.toLowerCase().trim()
    if (!q) return arr
    return arr.filter(r => r.description?.toLowerCase().includes(q) || r.question?.questionText?.toLowerCase().includes(q))
  }, [reports, searchQuery])

  if (authLoading || !isAuthenticated || loading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }
  const handleViewReport = (id: string | number) => router.push(`/student/questions-reports/${id}`)


  // Client-side filtering only by q; server-side filtering via hook params happens in hook call

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-warning flex items-center justify-center shadow-lg">
                <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
                  Question Reports
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">
                  Reports submitted about questions during your sessions
                </p>
              </div>
            </div>
          </div>

          {/* Search and Filter Section */}
          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="relative flex-1 max-w-full sm:max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search reports..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }}
                    className="pl-10 border-border/50 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 dark:focus:border-blue-600 dark:focus:ring-blue-900/20 min-h-[44px]"
                  />
                </div>
                <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1) }}>
                  <SelectTrigger className="w-full sm:w-[160px] border-border/50 min-h-[44px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="REVIEWED">Reviewed</SelectItem>
                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

      {/* Reports Content */}
      {list.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="No Reports Found"
          description={searchQuery || (status && status !== 'all')
            ? "No reports match your current filters. Try adjusting your search or filters."
            : "You haven't reported any issues yet. Use the report button in a session question."
          }
        />
      ) : (
        <div className="space-y-4">
          {list.map((report) => (
            <Card
              key={report.id}
              className="hover:shadow-md transition-all cursor-pointer"
              onClick={() => handleViewReport(report.id)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-muted rounded-lg">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{report.question?.questionText || `Report #${report.id}`}</CardTitle>
                        <Badge variant="outline" className="capitalize">
                          {(report.reportType || report.type || '').toString().toLowerCase?.()}
                        </Badge>
                      </div>
                      <CardDescription>{report.description}</CardDescription>
                      {report.adminResponse && (
                        <div className="mt-2 text-xs">
                          <span className="font-medium">Admin response:</span> {report.adminResponse}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Submitted {formatDate(report.createdAt)}</span>
                  </div>
                  <Badge variant="outline" className="capitalize">{report.status.toLowerCase()}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={!pagination.hasPrev} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={!pagination.hasNext} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
