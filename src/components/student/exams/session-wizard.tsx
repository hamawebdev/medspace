"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
// import { Progress } from "@/components/ui/progress";
import { CheckCircle2, GraduationCap } from "lucide-react";
import { useExamSessionFilters } from '@/hooks/use-exam-session-filters';
import { useQuizFilters } from '@/hooks/use-quiz-api';
import { useUserSubscriptions, selectEffectiveActiveSubscription } from '@/hooks/use-subscription';
import { StudentService, QuizService } from '@/lib/api-services';
import { toast } from 'sonner';

export type ExamSessionPayload = {
  title: string;
  unit?: string;
  module?: string;
};

export function ExamSessionWizard({
  onCancel,
}: {
  onCancel: () => void;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [unit, setUnit] = useState<string | undefined>(undefined); // holds uniteId as string
  const [module, setModule] = useState<string | undefined>(undefined); // holds moduleId as string

  const [modules, setModules] = useState<any[]>([]); // [{ id, name, unite: { id, name } }]
  const [units, setUnits] = useState<Array<{ id: number; name: string }>>([]);
  const [universities, setUniversities] = useState<Array<{ id: number; name: string }>>([]);
  const [years, setYears] = useState<Array<number>>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedUniversity, setSelectedUniversity] = useState<string | undefined>(undefined);
  const [selectedYear, setSelectedYear] = useState<string | undefined>(undefined);
  const [questionType, setQuestionType] = useState<'ALL' | 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE'>('ALL');

  const { filters: examFilters } = useExamSessionFilters();
  const { subscriptions } = useUserSubscriptions();
  const { allowedYearLevels } = selectEffectiveActiveSubscription(subscriptions);
  const allowedYearLevelsKey = React.useMemo(() => (allowedYearLevels || []).join(','), [allowedYearLevels]);
  const [availableCount, setAvailableCount] = useState<number>(0);

  // Build units and modules from new filters when they load, filtered by subscription year levels
  React.useEffect(() => {
    if (!examFilters) return;

    const toYearLevel = (title?: string): string | undefined => {
      if (!title) return undefined;
      const t = String(title).toLowerCase();
      const patterns: Array<[RegExp, string]> = [
        [/(^|\b)(first|1st|year\s*1|year\s*one)(\b|$)/i, 'ONE'],
        [/(^|\b)(second|2nd|year\s*2|year\s*two)(\b|$)/i, 'TWO'],
        [/(^|\b)(third|3rd|year\s*3|year\s*three)(\b|$)/i, 'THREE'],
        [/(^|\b)(fourth|4th|year\s*4|year\s*four)(\b|$)/i, 'FOUR'],
        [/(^|\b)(fifth|5th|year\s*5|year\s*five)(\b|$)/i, 'FIVE'],
        [/(^|\b)(sixth|6th|year\s*6|year\s*six)(\b|$)/i, 'SIX'],
        [/(^|\b)(seventh|7th|year\s*7|year\s*seven)(\b|$)/i, 'SEVEN'],
      ];
      for (const [re, val] of patterns) {
        if (re.test(t)) return val;
      }
      return undefined;
    };

    const unitList: Array<{ id: number; name: string; year?: string }> = [];
    const moduleList: any[] = [];

    for (const u of examFilters.unites || []) {
      const normalizedYear = (u as any).year || toYearLevel((u as any).title);

      // If a study pack is active, only include units whose inferred year matches allowedYearLevels
      if (allowedYearLevels.length) {
        if (!normalizedYear || !allowedYearLevels.includes(normalizedYear)) continue;
      }

      unitList.push({ id: u.id, name: (u as any).title, year: normalizedYear });
      for (const m of (u as any).modules || []) {
        moduleList.push({ id: m.id, name: (m as any).title, unite: { id: u.id, name: (u as any).title }, universities: (m as any).universities });
      }
    }

    setUnits(unitList);
    setModules(moduleList);
  }, [examFilters, allowedYearLevelsKey]);

  // When module changes, derive universities and years from filters
  React.useEffect(() => {
    if (!module) {
      setUniversities([]);
      setYears([]);
      return;
    }
    const mod = modules.find((m: any) => String(m.id) === String(module));
    const unis = Array.isArray(mod?.universities) ? mod.universities : [];
    setUniversities(unis.map((u: any) => ({ id: u.id, name: u.name })));

    // Aggregate years for this module across universities
    const yearSet = new Set<number>();
    for (const uni of unis) {
      for (const y of (uni.years || [])) {
        const yr = Number(y.year);
        if (!Number.isNaN(yr)) yearSet.add(yr);
      }
    }
    setYears(Array.from(yearSet).sort((a, b) => b - a));
  }, [module, modules]);

  // New flow focuses on building sessions by question IDs; no need to fetch predefined exams

  // Helper: compute expected question IDs from filters for perfect alignment with preview
  const computeExpectedIds = React.useCallback((): number[] => {
    const out = new Set<number>();
    if (!examFilters) return [];
    const modId = module ? Number(module) : null;
    const uniId = selectedUniversity ? Number(selectedUniversity) : null;
    const yr = selectedYear ? Number(selectedYear) : null;

    for (const u of examFilters.unites || []) {
      for (const m of (u as any).modules || []) {
        if (modId && m.id !== modId) continue;
        for (const uni of (m as any).universities || []) {
          if (uniId && uni.id !== uniId) continue;
          for (const y of (uni as any).years || []) {
            if (yr && Number(y.year) !== yr) continue;
            const singles: number[] = Array.isArray(y.questionSingleChoiceIds) ? y.questionSingleChoiceIds : [];
            const multis: number[] = Array.isArray(y.questionMultipleChoiceIds) ? y.questionMultipleChoiceIds : [];
            if (questionType === 'SINGLE_CHOICE') singles.forEach(id => out.add(id));
            else if (questionType === 'MULTIPLE_CHOICE') multis.forEach(id => out.add(id));
            else { singles.forEach(id => out.add(id)); multis.forEach(id => out.add(id)); }
          }
        }
      }
    }
    return Array.from(out);
  }, [examFilters, module, selectedUniversity, selectedYear, questionType]);


  // Compute available question count based on current selection using expected IDs list
  React.useEffect(() => {
    const ids = computeExpectedIds();
    setAvailableCount(ids.length);
    console.debug('[ExamWizard] Preview count', { module, selectedUniversity, selectedYear, questionType, count: ids.length, sample: ids.slice(0, 10) });
  }, [examFilters, module, selectedUniversity, selectedYear, questionType]);

  // Require a title and at least one filter (module is the base filter)
  const canCreate = useMemo(() => title.trim().length >= 3 && !!module, [title, module]);

  const handleCreate = async () => {
    try {
      if (!module) {
        toast.error('Please select at least a Module');
        return;
      }
      setLoading(true);

      const moduleId = Number(module);
      const universityIds = selectedUniversity ? [Number(selectedUniversity)] : undefined;
      const examYears = selectedYear ? [Number(selectedYear)] : undefined;

      // Compute expected IDs from filters for maximum alignment
      const expectedIds = computeExpectedIds();
      const limit = Math.min(expectedIds.length, 100);

      if (limit === 0) {
        toast.error('No questions found for the selected filters');
        console.debug('[ExamWizard] No IDs available from filters; aborting.');
        return; // Prevent any API calls
      }

      // Also fetch via /students/questions for cross-check; request up to limit
      const fetchSingle = questionType === 'ALL' || questionType === 'SINGLE_CHOICE'
        ? StudentService.getQuestions({ moduleIds: [moduleId], universityIds, examYears, questionType: 'SINGLE_CHOICE', randomize: true, count: limit })
        : Promise.resolve({ data: { questions: [] } } as any);
      const fetchMulti = questionType === 'ALL' || questionType === 'MULTIPLE_CHOICE'
        ? StudentService.getQuestions({ moduleIds: [moduleId], universityIds, examYears, questionType: 'MULTIPLE_CHOICE', randomize: true, count: limit })
        : Promise.resolve({ data: { questions: [] } } as any);

      const [singleRes, multiRes] = await Promise.all([fetchSingle, fetchMulti]);
      const singles = singleRes?.data?.questions || [];
      const multis = multiRes?.data?.questions || [];
      const fetchedIds = Array.from(new Set([
        ...singles,
        ...multis,
      ]
        .map((q: any) => q?.id ?? q?.questionId ?? q?.question?.id)
        .map((v: any) => Number(v))
        .filter((n: any) => Number.isFinite(n) && n > 0)
      ));

      // Prefer fetched IDs if present; otherwise fall back to expected IDs from filters
      const finalIds = (fetchedIds.length ? fetchedIds : expectedIds).slice(0, 100);

      // Sanity check and debug
      const mismatch = finalIds.some(id => !expectedIds.includes(id)) || expectedIds.some(id => !finalIds.includes(id));
      console.debug('[ExamWizard] Build session:', {
        moduleId, universityIds, examYears, questionType,
        availableCount,
        expectedIdsCount: expectedIds.length,
        fetchedSingles: singles.length,
        fetchedMultis: multis.length,
        fetchedIdsCount: fetchedIds.length,
        usingFetched: fetchedIds.length > 0,
        mismatchWithExpected: mismatch,
        finalIdsSample: finalIds.slice(0, 20)
      });

      if (finalIds.length === 0) {
        toast.error('No questions found for the selected filters');
        return; // Block creation entirely
      }

      const created = await QuizService.createSessionByQuestions({ type: 'EXAM', questionIds: finalIds, title: title.trim() || undefined });
      const sessionId = created?.data?.sessionId || (created as any)?.data?.id || (created as any)?.sessionId || (created as any)?.id;

      if (sessionId) {
        // Title is already passed during creation; do not perform a separate update call
        toast.success('Exam session created');
        router.push(`/session/${sessionId}`);
        return;
      }

      toast.error('Session created but no sessionId returned');
    } catch (e) {
      toast.error('Failed to create exam session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="quiz-card-enhanced">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 exam-icon" /> Create Exam Session
            </CardTitle>
            <p className="text-sm text-muted-foreground">Single step • connect API to enable selects</p>
          </div>

        </div>
      </CardHeader>
              <div className="space-y-2">
                <Label>Available Questions</Label>
                <div className="text-sm text-muted-foreground">
                  {availableCount} question{availableCount === 1 ? '' : 's'} match your filters
                </div>
              </div>

      <CardContent className="space-y-6">
        {/* Visual stepper (1 step to keep consistency) */}
        <div className="flex items-center gap-3">
          {[1].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold bg-primary text-primary-foreground`}>
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g. Cardiology Final - June"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="quiz-input-enhanced"
              />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Unit</Label>
              <Select value={unit} onValueChange={(v) => { setUnit(v); setModule(undefined); setSelectedUniversity(undefined); setSelectedYear(undefined); }}>
                <SelectTrigger>
                  <SelectValue placeholder={loading ? 'Loading...' : 'Select Unit'} />
                </SelectTrigger>
                <SelectContent position="item-aligned">
                  {units.map(u => (
                    <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Module</Label>
              <Select value={module} onValueChange={(v) => { setModule(v); setSelectedUniversity(undefined); setSelectedYear(undefined); }}>
                <SelectTrigger>
                  <SelectValue placeholder={unit ? 'Select Module' : 'Choose Unit first'} />
                </SelectTrigger>
                <SelectContent>
                  {modules
                    .filter((m:any) => !unit || String(m.unite?.id) === String(unit))
                    .map((m:any) => (
                      <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>University</Label>
              <Select value={selectedUniversity} onValueChange={(v) => { setSelectedUniversity(v); setSelectedYear(undefined); }}>
                <SelectTrigger>
                  <SelectValue placeholder={module ? 'Select University' : 'Choose Module first'} />
                </SelectTrigger>
                <SelectContent>
                  {universities.map((u:any) => (
                    <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Year</Label>
              <Select value={selectedYear} onValueChange={(v) => setSelectedYear(v)}>
                <SelectTrigger>
                  <SelectValue placeholder={selectedUniversity ? 'Select Year' : 'Choose University first'} />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y:number) => (
                    <SelectItem key={y} value={String(y)}>{y === 9999 ? 'No Year' : y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Question Type</Label>
              <Select value={questionType} onValueChange={(v) => setQuestionType(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Question Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={'ALL'}>All Types</SelectItem>
                  <SelectItem value={'SINGLE_CHOICE'}>Single Choice (QCS)</SelectItem>
                  <SelectItem value={'MULTIPLE_CHOICE'}>Multiple Choice (QCM)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleCreate} disabled={!canCreate || loading} className="exam-button">
            Create Exam Session
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

