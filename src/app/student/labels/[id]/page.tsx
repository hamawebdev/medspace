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
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10">
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
  const questions = label.questions || []
  const questionIds = label.questionIds || []

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
          <CardDescription>Summary of questions and content associated with this label</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3 rounded-lg border bg-primary/5">
              <div className="text-sm text-muted-foreground">Questions</div>
              <div className="text-2xl font-semibold text-primary">{stats.questionsCount ?? questionIds.length ?? 0}</div>
            </div>
            <div className="p-3 rounded-lg border">
              <div className="text-sm text-muted-foreground">Total Items</div>
              <div className="text-2xl font-semibold">{stats.totalItems ?? 0}</div>
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
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Associated Questions
          </CardTitle>
          <CardDescription>Questions tagged with this label</CardDescription>
        </CardHeader>
        <CardContent>
          {questions.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">No questions associated with this label yet.</p>
              <p className="text-xs text-muted-foreground mt-2">
                Questions will appear here when you add them to this label during practice or exam sessions.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question: any) => (
                <div key={question.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="space-y-3">
                    <div className="font-medium text-sm leading-relaxed">
                      {question.questionText}
                    </div>

                    {question.course && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="secondary" className="text-xs">
                          {question.course.module?.name || 'Module'}
                        </Badge>
                        <span>•</span>
                        <span>{question.course.name}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Added {new Date(question.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Question #{question.id}
                      </div>
                    </div>
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

