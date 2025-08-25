// @ts-nocheck
'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { LoadingSpinner } from '@/components/loading-states'
import { ArrowLeft, Calendar, FileText, BookOpen, Clock } from 'lucide-react'
import { StudentService } from '@/lib/api-services'

export default function LabelDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const id = Number(params.id)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [label, setLabel] = useState<any | null>(null)

  const load = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await StudentService.getLabelDetails(id)
      const data = (res as any)?.data?.data || (res as any)?.data || res
      const labelData = Array.isArray(data) ? data[0] : data
      setLabel(labelData)
    } catch (e: any) {
      setError(e?.message || 'Failed to load label details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (!isNaN(id)) load() }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !label) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
          <Card className="border-border/50 shadow-sm">
            <CardContent className="py-12 text-center">
              <p className="text-destructive mb-4">{error || 'Label not found'}</p>
              <Button variant="outline" onClick={() => router.back()} className="min-h-[44px]">Go Back</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const stats = label.statistics || {}
  const sessions = label.sessions || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <h1 className="text-2xl font-bold">Label: {label.name}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">Overview</CardTitle>
          <CardDescription>Summary of items associated with this label</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3 rounded-lg border">
              <div className="text-sm text-muted-foreground">Total Items</div>
              <div className="text-2xl font-semibold">{stats.totalItems ?? 0}</div>
            </div>
            <div className="p-3 rounded-lg border">
              <div className="text-sm text-muted-foreground">Questions</div>
              <div className="text-2xl font-semibold">{stats.questionsCount ?? 0}</div>
            </div>
            <div className="p-3 rounded-lg border">
              <div className="text-sm text-muted-foreground">Quiz Sessions</div>
              <div className="text-2xl font-semibold">{stats.quizSessionsCount ?? 0}</div>
            </div>
            <div className="p-3 rounded-lg border">
              <div className="text-sm text-muted-foreground">Quizzes</div>
              <div className="text-2xl font-semibold">{stats.quizzesCount ?? 0}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">Sessions</CardTitle>
          <CardDescription>Recent sessions tagged with this label</CardDescription>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sessions yet.</p>
          ) : (
            <div className="space-y-3">
              {sessions.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{s.title || `Session #${s.id}`}</div>
                    <div className="text-xs text-muted-foreground">
                      Type: {s.type} • Status: {s.status}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 inline mr-1" /> {new Date(s.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  )
}

