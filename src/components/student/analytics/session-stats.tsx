// @ts-nocheck
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, FileText } from 'lucide-react';
import { StudentService } from '@/lib/api-services';
import { cn } from '@/lib/utils';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserSubscriptions, selectEffectiveActiveSubscription } from '@/hooks/use-subscription';

const COLORS = {
  correct: '#10b981', // green
  incorrect: '#ef4444', // red
  unanswered: '#3b82f6', // blue
};

// Format seconds as HH:MM:SS
function formatHMS(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds || 0));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  const hh = hours.toString().padStart(2, '0');
  const mm = minutes.toString().padStart(2, '0');
  const ss = seconds.toString().padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

function avgPerQuestion(totalSeconds: number, questions: number) {
  if (!totalSeconds || !questions) return '00:00:00';
  const s = Math.round(totalSeconds / questions);
  return formatHMS(s);
}

export function SessionStats() {
  const router = useRouter();

  // Tabs state
  const [activeTab, setActiveTab] = useState<'table' | 'graph'>('table');

  // Filter state
  const [type, setType] = useState<'EXAM' | 'PRACTICE' | 'RESIDENCY'>('PRACTICE');

  // Sessions list and details fetched via quiz history + session results
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<any[] | null>(null);

  // Subscriptions (for residency availability)
  const { subscriptions } = useUserSubscriptions();
  const { isResidency } = selectEffectiveActiveSubscription(subscriptions);
  const residencyLocked = type === 'RESIDENCY' && !isResidency;

  // Unified dataset state
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  const [sessionMetrics, setSessionMetrics] = useState<Array<{
    sessionId: number;
    title: string;
    type: string;
    totalQuestions: number;
    answered: number;
    correctAnswers: number;
    accuracy: number; // percentage
    timeSpent: number; // seconds
  }>>([]);
  const [questionsBySession, setQuestionsBySession] = useState<Map<number, any[]>>(new Map());

  // Selected session for pie chart
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);

  // Chart data computed from unified dataset
  const [detailCounts, setDetailCounts] = useState<{ total: number; correct: number; incorrect: number; unanswered: number; title?: string; accuracy?: number } | null>(null);

  // Derived keys to keep effect deps simple
  const sessionIdsKey = useMemo(() => (
    Array.isArray(sessions) ? sessions.map((s: any) => s.id || s.sessionId).filter(Boolean).join(',') : ''
  ), [sessions]);

  // When type changes, fetch quiz history (sessions) and session results, compute metrics
  useEffect(() => {
    let cancelled = false;
    setSessionsLoading(true);
    setSessionsError(null);
    setMetricsLoading(true);

    let fetchedSessions: any[] = [];

    //  y Fetch quiz history for the selected type
    StudentService.getQuizHistory({ type, limit: 50, page: 1 })
      .then(historyRes => {
        if (cancelled) return;
        const container = historyRes?.data?.data || historyRes?.data;
        const payload = container?.data || container;
        const sessionsArr = payload?.sessions || payload?.data || payload || [];
        const completed = Array.isArray(sessionsArr)
          ? sessionsArr.filter((s: any) => String(s.status).toUpperCase() === 'COMPLETED' && String(s.type).toUpperCase() === String(type))
          : [];
        fetchedSessions = completed;
        setSessions(completed);

        // 2) Fetch session results to aggregate per-question stats (no sessionIds filter, obey server limits)
        return StudentService.getSessionResults({ page: 1, limit: 100 });
      })
      .then(resultsRes => {
        if (cancelled) return;
        const container = resultsRes?.data?.data || resultsRes?.data;
        const payload = container?.data || container;
        const questions = payload?.questions || payload?.data || [];

        // Group questions by session
        const map = new Map<number, any[]>();
        (Array.isArray(questions) ? questions : []).forEach((q: any) => {
          if (!q?.sessionId) return;
          if (!map.has(q.sessionId)) map.set(q.sessionId, []);
          map.get(q.sessionId)!.push(q);
        });

        // Build metrics by merging quiz history + computed question aggregates
        const summaries: any[] = [];
        (Array.isArray(fetchedSessions) ? fetchedSessions : []).forEach((s: any) => {
          const sid = s.id || s.sessionId;
          const qs = map.get(sid) || [];
          const total = s.questionsCount ?? qs.length;
          let answeredFromQs = 0; let correctFromQs = 0; let time = 0;
          qs.forEach((r: any) => {
            const isAnswered = r.selectedAnswerId !== undefined || (Array.isArray(r.userAnswerIds) && r.userAnswerIds.length > 0);
            if (isAnswered) answeredFromQs += 1;
            if (r.isCorrect) correctFromQs += 1;
            time += typeof r.timeSpent === 'number' ? r.timeSpent : 0;
          });
          const answered = s.answersCount ?? answeredFromQs;
          const correct = (typeof s.score === 'number' ? s.score : undefined) ?? correctFromQs;
          const accuracy = typeof s.percentage === 'number' ? Math.round(s.percentage) : (total > 0 ? Math.round((correct / total) * 100) : 0);

          // Enforce residency access at the data level if filtering is RESIDENCY and user lacks it
          const isRes = String(s.type || '').toUpperCase() === 'RESIDENCY';
          const blockedByFilter = residencyLocked && isRes;

          summaries.push({
            sessionId: Number(sid),
            title: s.title,
            type: s.type,
            totalQuestions: total,
            answered,
            correctAnswers: correct,
            accuracy,
            timeSpent: time,
            blocked: blockedByFilter,
          });
        });

        setQuestionsBySession(new Map(Array.from(map.entries())));
        setSessionMetrics(summaries);
        setSelectedSessionId(prev => prev ?? (summaries[0]?.sessionId ?? null));
      })
      .catch(err => {
        if (cancelled) return;
        const msg = err?.message || 'Failed to load sessions';
        setSessionsError(msg);
        setMetricsError(msg);
        setSessions([]);
        setSessionMetrics([]);
        setQuestionsBySession(new Map());
        setSelectedSessionId(null);
      })
      .finally(() => {
        if (!cancelled) {
          setSessionsLoading(false);
          setMetricsLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [type]);

  // Compute detailCounts from unified dataset
  useEffect(() => {
    if (!selectedSessionId) { setDetailCounts(null); return; }
    const qs = questionsBySession.get(selectedSessionId) || [];
    const total = qs.length;
    let answered = 0; let correct = 0;
    qs.forEach((r: any) => {
      const isAnswered = !!(r.userAnswer && (Array.isArray(r.userAnswer) ? r.userAnswer.length : true))
        || !!(Array.isArray(r.userAnswerIds) ? r.userAnswerIds.length : r.selectedAnswerId !== undefined);
      const isCorrect = !!r.isCorrect;
      if (isAnswered) answered += 1;
      if (isCorrect) correct += 1;
    });
    const incorrect = Math.max(0, answered - correct);
    const unanswered = Math.max(0, total - answered);
    const meta = sessionMetrics.find(m => m.sessionId === selectedSessionId);
    setDetailCounts({ total, correct, incorrect, unanswered, title: meta?.title, accuracy: meta?.accuracy });
  }, [selectedSessionId, questionsBySession, sessionMetrics]);

  const tableRows = useMemo(() => {
    return sessionMetrics
      .filter(m => !(m.blocked && residencyLocked))
      .map(m => {
        const incorrect = Math.max(0, (m.answered || m.totalQuestions || 0) - (m.correctAnswers || 0));
        const totalQ = m.totalQuestions ?? m.questionsAnswered ?? 0;
        return {
          id: m.sessionId,
          title: m.title,
          timeSpent: m.timeSpent || 0,
          avgPerQ: avgPerQuestion(m.timeSpent || 0, totalQ || 0),
          totalQuestions: totalQ,
          correct: m.correctAnswers || 0,
          incorrect,
          percentage: typeof m.accuracy === 'number' ? Math.round(m.accuracy) : 0,
        };
      });
  }, [sessionMetrics, residencyLocked]);

  const chartData = useMemo(() => {
    if (!detailCounts) return [];
    return [
      { name: 'Correct', value: detailCounts.correct, fill: COLORS.correct },
      { name: 'Incorrect', value: detailCounts.incorrect, fill: COLORS.incorrect },
      { name: 'Unanswered', value: detailCounts.unanswered, fill: COLORS.unanswered },
    ];
  }, [detailCounts]);

  return (
    <Card className="w-full h-[calc(100vh-140px)] flex flex-col">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
        <CardHeader className="border-b">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold">Session Analytics</h2>
              <div className="text-sm font-medium">Type session</div>
              <Select value={type} onValueChange={(v: any) => { setType(v); setSelectedSessionId(null); }}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EXAM">Exam</SelectItem>
                  <SelectItem value="PRACTICE">Practice</SelectItem>
                  <SelectItem value="RESIDENCY">Residency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <TabsList>
              <TabsTrigger value="table">Table</TabsTrigger>
              <TabsTrigger value="graph">Graph</TabsTrigger>
            </TabsList>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <TabsContent value="table" className="h-full m-0">
            <div className="p-4 h-full overflow-auto">
              {sessionsLoading || metricsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : sessionsError || metricsError ? (
                <Alert variant="destructive">
                  <AlertDescription>
                    {sessionsError || metricsError}
                  </AlertDescription>
                </Alert>
              ) : tableRows.length === 0 ? (
                <div className="text-sm text-muted-foreground p-6">No completed sessions found for this type.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Session Title</TableHead>
                      <TableHead>
                        <div className="inline-flex items-center gap-2"><Clock className="h-4 w-4" /> Session Time Spent</div>
                      </TableHead>
                      <TableHead>Time Average per Question</TableHead>
                      <TableHead>Total Questions</TableHead>
                      <TableHead>Correct Answers</TableHead>
                      <TableHead>Incorrect Answers</TableHead>
                      <TableHead>Consultation</TableHead>
                      <TableHead className="text-right">Percentage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableRows.map(row => (
                      <TableRow key={row.id} className={cn(selectedSessionId === row.id && 'bg-accent/30')} onClick={() => setSelectedSessionId(row.id)}>
                        <TableCell className="font-medium">{row.title}</TableCell>
                        <TableCell><div className="inline-flex items-center gap-2"><Clock className="h-4 w-4" /> {formatHMS(row.timeSpent)}</div></TableCell>
                        <TableCell>{row.avgPerQ}</TableCell>
                        <TableCell>{row.totalQuestions}</TableCell>
                        <TableCell className="text-green-600 dark:text-green-400">{row.correct}</TableCell>
                        <TableCell className="text-red-600 dark:text-red-400">{row.incorrect}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" className="gap-2" onClick={(e) => { e.stopPropagation(); router.push(`/session/${row.id}/results`); }}>
                            <FileText className="h-4 w-4" /> View
                          </Button>
                        </TableCell>
                        <TableCell className="text-right font-semibold">{row.percentage}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>
          <TabsContent value="graph" className="h-full m-0">
            <div className="p-4 h-full">
              {metricsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-56 w-full" />
                </div>
              ) : metricsError ? (
                <Alert variant="destructive"><AlertDescription>{metricsError}</AlertDescription></Alert>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  {/* Left: All Sessions list */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="rounded-md border">
                      <div className="px-4 py-3 font-medium border-b">All Sessions</div>
                      <div className="max-h-[420px] overflow-auto divide-y">
                        {sessionMetrics.length === 0 ? (
                          <div className="p-4 text-sm text-muted-foreground">No completed sessions for this type.</div>
                        ) : (
                          sessionMetrics.map((m) => {
                            const pct = typeof m.accuracy === 'number' ? Math.round(m.accuracy) : 0;
                            const isRes = String(m.type || '').toUpperCase() === 'RESIDENCY';
                            const disabled = (isRes && !isResidency) || (residencyLocked && isRes);
                            const selected = selectedSessionId === m.sessionId;
                            return (
                              <button
                                key={m.sessionId}
                                type="button"
                                disabled={disabled}
                                onClick={() => !disabled && setSelectedSessionId(m.sessionId)}
                                className={cn(
                                  'w-full text-left px-4 py-3 flex items-center justify-between gap-3 hover:bg-accent/40 focus:outline-none',
                                  selected && 'bg-accent/30',
                                  disabled && 'opacity-60 cursor-not-allowed'
                                )}
                              >
                                <div>
                                  <div className="text-sm font-medium line-clamp-1">{m.title}</div>
                                  {disabled && (
                                    <div className="text-xs text-muted-foreground">Only for residency subscribers</div>
                                  )}
                                </div>
                                <div className={cn('text-sm font-semibold', pct >= 50 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')}>
                                  {pct}%
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Pie chart */}
                  <div className="lg:col-span-3">
                    {!detailCounts ? (
                      <div className="text-sm text-muted-foreground">Select a session from the Table tab to see its distribution.</div>
                    ) : (
                      <div className="w-full h-full max-h-[420px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3}>
                              {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Pie>
                            <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 12 }} />
                            <Tooltip formatter={(value: any, name: any) => [value, name]} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                    {detailCounts && (
                      <div className="mt-4 grid grid-cols-3 gap-3 text-xs px-2">
                        <div className="flex items-center gap-2"><span className="inline-block h-3 w-3 rounded-sm" style={{ background: COLORS.correct }} /> Correct</div>
                        <div className="flex items-center gap-2"><span className="inline-block h-3 w-3 rounded-sm" style={{ background: COLORS.incorrect }} /> Incorrect</div>
                        <div className="flex items-center gap-2"><span className="inline-block h-3 w-3 rounded-sm" style={{ background: COLORS.unanswered }} /> Unanswered</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
}

export default SessionStats;

