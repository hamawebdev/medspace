'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Timer, Square, DoorOpen, ChevronLeft, ChevronRight, Flag, StickyNote, Tag, Play } from 'lucide-react';

const STORAGE_KEY = 'exam_sessions_v1';

function formatDuration(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m ${sec}s`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

export default function ExamSessionRunnerPage() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);

  const [confirmExit, setConfirmExit] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  // Notes/Labels modals
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showLabelModal, setShowLabelModal] = useState(false);
  // Timers
  const [sessionNow, setSessionNow] = useState(Date.now());
  const [questionNow, setQuestionNow] = useState(Date.now());

  const questionStartRef = useRef<number>(Date.now());
  const pausedQuestionRef = useRef<number>(Date.now());

  // Load session
  const [session, setSession] = useState<any | null>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const list = JSON.parse(raw);
      const found = Array.isArray(list) ? list.find((s: any) => s.id === id) : null;
      if (found) {
        if (typeof found.currentQuestionIndex === 'number') setQuestionIndex(found.currentQuestionIndex);
        setSession(found);
        if (!found.lastStartedAt) {
          const updated = { ...found, lastStartedAt: new Date().toISOString() };
          const next = list.map((s: any) => (s.id === id ? updated : s));
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          setSession(updated);
        }
      }
    } catch {}
  }, [id]);

  // Tickers
  useEffect(() => {
    const t = setInterval(() => { if (session?.lastStartedAt) setSessionNow(Date.now()); }, 1000);
    const q = setInterval(() => { if (session?.lastStartedAt) setQuestionNow(Date.now()); }, 1000);
    return () => { clearInterval(t); clearInterval(q); };
  }, [session?.lastStartedAt]);

  // Persist index
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw || !session) return;
      const list = JSON.parse(raw);
      const updated = { ...session, currentQuestionIndex: questionIndex };
      const next = list.map((s: any) => (s.id === session.id ? updated : s));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setSession(updated);
    } catch {}
  }, [questionIndex]);

  // Derived timers
  const elapsedSessionSec = useMemo(() => {
    if (!session) return 0;
    const base = session.elapsedSeconds || 0;
    const started = session.lastStartedAt ? new Date(session.lastStartedAt).getTime() : 0;
    return base + (started ? Math.max(0, Math.floor((sessionNow - started) / 1000)) : 0);
  }, [session, sessionNow]);

  const elapsedQuestionSec = useMemo(() => {
    if (!session?.lastStartedAt) return Math.max(0, Math.floor((pausedQuestionRef.current - questionStartRef.current) / 1000));
    return Math.max(0, Math.floor((questionNow - questionStartRef.current) / 1000));
  }, [questionNow, session?.lastStartedAt]);

  useEffect(() => {
    if (!session?.lastStartedAt) pausedQuestionRef.current = Date.now();
  }, [session?.lastStartedAt]);

  useEffect(() => {
    questionStartRef.current = Date.now();
  }, [questionIndex]);

  // Placeholder until API
  const totalQuestions = session?.questionCount ?? 0;
  const percent = totalQuestions > 0 ? ((questionIndex + 1) / totalQuestions) * 100 : 0;

  const prevQuestion = () => setQuestionIndex((i) => Math.max(0, i - 1));
  const nextQuestion = () => setQuestionIndex((i) => (totalQuestions ? Math.min(totalQuestions - 1, i + 1) : i + 1));

  const exitSession = () => setConfirmExit(true);
  const stopSession = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw || !session) return;
      const list = JSON.parse(raw);
      const started = session.lastStartedAt ? new Date(session.lastStartedAt).getTime() : 0;
      const accrued = started ? Math.max(0, Math.floor((Date.now() - started) / 1000)) : 0;
      const updated = { ...session, elapsedSeconds: (session.elapsedSeconds || 0) + accrued, lastStartedAt: null };
      const next = list.map((s: any) => (s.id === session.id ? updated : s));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setSession(updated);
    } catch {}
  };

  const resumeSession = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw || !session) return;
      const list = JSON.parse(raw);
      const updated = { ...session, lastStartedAt: new Date().toISOString() };
      const next = list.map((s: any) => (s.id === session.id ? updated : s));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setSession(updated);
      questionStartRef.current = Date.now();
    } catch {}
  };

  const confirmExitAndGo = () => {
    setConfirmExit(false);
    stopSession();
    router.push('/student/exams');
  };

  const isPaused = !session?.lastStartedAt;

  return (
    <div className="min-h-screen exam-theme" style={{ background: 'var(--background)' }}>
      {/* Top Bar */}
      <div className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold truncate max-w-[50vw]">{(session?.title || 'Exam Session') + ' — ' + id}</h2>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Timer className="w-4 h-4" /> <span className="font-medium">{formatDuration(elapsedSessionSec)}</span>
            <Separator orientation="vertical" className="mx-2 h-5" />
            {isPaused ? (
              <Button variant="outline" size="sm" onClick={resumeSession} className="exam-button"><Play className="w-4 h-4 mr-1"/> Resume</Button>
            ) : (
              <Button variant="outline" size="sm" onClick={stopSession}><Square className="w-4 h-4 mr-1"/> Stop</Button>
            )}
            <Button variant="destructive" size="sm" onClick={exitSession}><DoorOpen className="w-4 h-4 mr-1"/> Exit</Button>
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className="container mx-auto max-w-6xl px-4 py-6 grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left: Question List */}
        <div className="md:col-span-3">
          <Card className="h-full">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Questions</span>
                <span className="text-sm">{totalQuestions} total</span>
              </div>
              <Progress value={percent} className="h-2" />
              <div className="grid grid-cols-5 gap-2 max-h-[60vh] overflow-auto no-scrollbar">
                {Array.from({ length: Math.max(totalQuestions, 0) }).map((_, idx) => (
                  <button
                    key={idx}
                    className={`w-9 h-9 rounded-md border text-sm flex items-center justify-center ${idx === questionIndex ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'} ${isPaused ? 'opacity-60 cursor-not-allowed' : ''}`}
                    onClick={() => !isPaused && setQuestionIndex(idx)}
                    disabled={isPaused}
                  >
                    {idx + 1}
                  </button>
                ))}
                {totalQuestions === 0 && (
                  <div className="text-xs text-muted-foreground col-span-5 text-center py-6">
                    Questions will appear after API integration.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center: Question Content */}
        <div className="md:col-span-6">
          <Card className="h-full">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold">Question {questionIndex + 1}{totalQuestions ? ` / ${totalQuestions}` : ''}</h3>
                  <Badge variant="secondary" className="hidden md:inline-flex">{formatDuration(elapsedQuestionSec)}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setShowCorrectAnswer((v) => !v)} disabled={isPaused}>Show Answer</Button>
                      </TooltipTrigger>
                      <TooltipContent>Reveal/hide the correct answer</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <Separator />
              <div className="min-h-40 text-muted-foreground">
                The question content will be rendered here after we connect endpoints.
              </div>
              <div className="flex items-center justify-between">
                <Button variant="secondary" onClick={prevQuestion} disabled={questionIndex === 0 || isPaused}><ChevronLeft className="w-4 h-4 mr-1"/> Previous</Button>
                <Button onClick={nextQuestion} disabled={isPaused || (totalQuestions ? questionIndex >= totalQuestions - 1 : false)}>Next <ChevronRight className="w-4 h-4 ml-1"/></Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Actions/Flags */}
        <div className="md:col-span-3">
          <Card className="h-full">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Quick Actions</span>
              </div>
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setShowNoteModal(true)} disabled={isPaused}><StickyNote className="w-4 h-4 mr-1"/> Note</Button>
                    </TooltipTrigger>
                    <TooltipContent>Add a note for this question</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setShowLabelModal(true)} disabled={isPaused}><Tag className="w-4 h-4 mr-1"/> Label</Button>
                    </TooltipTrigger>
                    <TooltipContent>Add to a label</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" disabled={isPaused}><Flag className="w-4 h-4 mr-1"/> Report</Button>
                    </TooltipTrigger>
                    <TooltipContent>Report this question</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Per-question</span>
                <Badge variant="outline">{formatDuration(elapsedQuestionSec)}</Badge>
              </div>
              {showCorrectAnswer && (
                <div className="text-sm p-3 rounded-md border bg-muted/30">
                  Correct answer details will be shown here once we connect the API.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Note Modal */}
        <Dialog open={showNoteModal} onOpenChange={setShowNoteModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Note</DialogTitle>
              <DialogDescription>Write a note for this question. It will link to Notes when the API is connected.</DialogDescription>
            </DialogHeader>
            <textarea className="w-full min-h-32 rounded-md border bg-background p-3" placeholder="Type your note here..." />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNoteModal(false)}>Cancel</Button>
              <Button className="exam-button" onClick={() => setShowNoteModal(false)}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Label Modal */}
        <Dialog open={showLabelModal} onOpenChange={setShowLabelModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add to Label</DialogTitle>
              <DialogDescription>Select a label for this question. Labels will come from the API.</DialogDescription>
            </DialogHeader>
            <div className="text-sm text-muted-foreground">Labels picker will appear here.</div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowLabelModal(false)}>Cancel</Button>
              <Button className="exam-button" onClick={() => setShowLabelModal(false)}>Add</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Exit confirm */}
      <AlertDialog open={confirmExit} onOpenChange={setConfirmExit}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Exit session?</AlertDialogTitle>
            <AlertDialogDescription>Your progress and elapsed time will be saved on this device.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay</AlertDialogCancel>
            <AlertDialogAction onClick={confirmExitAndGo}>Exit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

