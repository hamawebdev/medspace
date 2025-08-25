"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { MultiSelect } from "@/components/ui/multi-select";
import { Slider } from "@/components/ui/slider";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { useUserSubscriptions, selectEffectiveActiveSubscription } from "@/hooks/use-subscription";
import { ContentService } from "@/lib/api-services";
import { useAvailableQuestionCounts } from "@/hooks/use-available-questions";
import { useQuizFilters } from "@/hooks/use-quiz-api";
import { useDebounce } from "@/hooks/use-debounce";

export type PracticeSessionPayload = {
  title: string;
  program?: string;
  unitId?: number;
  moduleId?: number;
  courseIds?: number[];
  availableCount?: number; // UI-computed available to clamp before sending
  filters: {
    types?: string[]; // e.g., ['qcm','qcs']
    quizSourceIds?: number[];
    // New: explicit selection of quiz years (e.g., 2020, 2021, 2024)
    quizYears?: number[];
  };
  questionCount?: number;
};

export function SessionWizard({
  onCancel,
  onCreate,
}: {
  onCancel: () => void;
  onCreate: (payload: PracticeSessionPayload) => void;
}) {
  const [step, setStep] = useState(1);

  // Load user's active subscription and fetch its study pack details (units/modules/courses)
  const { subscriptions, loading: subsLoading } = useUserSubscriptions();
  const { filters: quizFilters } = useQuizFilters();
  const [pack, setPack] = useState<any | null>(null);
  const [packLoading, setPackLoading] = useState<boolean>(true);
  const [packError, setPackError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPack() {
      try {
        if (subsLoading) return;
        // Determine a single effective subscription (residency takes precedence; otherwise latest endDate)
        const { effective } = selectEffectiveActiveSubscription(subscriptions);
        const studyPackId = effective?.studyPackId || effective?.studyPack?.id;
        if (!studyPackId) {
          setPack(null);
          setPackLoading(false);
          setPackError('No active subscription found');
          return;
        }
        setPackLoading(true);
        const res = await ContentService.getStudyPackDetails(Number(studyPackId));
        if (res.success) {
          const data = (res.data as any)?.data?.data || (res.data as any)?.data || res.data;
          setPack(data);
          setPackError(null);
        } else {
          setPackError(typeof res.error === 'string' ? res.error : 'Failed to load study pack');
        }
      } catch (e: any) {
        setPackError(e?.message || 'Failed to load study pack');
      } finally {
        setPackLoading(false);
      }
    }
    fetchPack();
  }, [subsLoading, subscriptions]);

  // Step 1
  const [title, setTitle] = useState("");
  const [unitId, setUnitId] = useState<string | undefined>(undefined);
  const [moduleIds, setModuleIds] = useState<string[]>([]);
  const [courseIds, setCourseIds] = useState<string[]>([]);

  // Step 2 filters
  const [types, setTypes] = useState<string[]>([]);
  const [quizYears, setQuizYears] = useState<number[]>([]);
  const [quizSourceIds, setQuizSourceIds] = useState<number[]>([]);
  const [questionCount, setQuestionCount] = useState<number>(0);

  // Step 3 finalize
  const [program, setProgram] = useState<string>("");

  const progressPct = useMemo(() => (step / 3) * 100, [step]);

  const next = () => setStep((s) => Math.min(3, s + 1));
  const prev = () => setStep((s) => Math.max(1, s - 1));

  // Build options from study pack
  const unitOptions = useMemo(() => (
    pack?.unites?.map((u: any) => ({ value: String(u.id), label: u.name })) || []
  ), [pack]);

  const moduleOptions = useMemo(() => {
    const modules: any[] = [];
    (pack?.unites || []).forEach((u: any) => {
      (u.modules || []).forEach((m: any) => {
        modules.push({ value: String(m.id), label: m.name, unitId: String(u.id), unitName: u.name });
      });
    });
    return modules;
  }, [pack]);

  const courseOptions = useMemo(() => {
    const courses: any[] = [];
    (pack?.unites || []).forEach((u: any) => {
      (u.modules || []).forEach((m: any) => {
        (m.courses || []).forEach((c: any) => {
          courses.push({
            value: String(c.id),
            label: `${c.name} (${m.name})`,
            moduleId: String(m.id),
            moduleName: m.name,
            unitId: String(u.id),
            unitName: u.name,
            questionCount: c.statistics?.questionsCount || 0,
          });
        });
      });
    });
    return courses;
  }, [pack]);

  // Filter options by current selections
  const availableUnits = unitOptions;
  const availableModules = useMemo(() => {
    return moduleOptions.filter((m: any) => !unitId || m.unitId === unitId);
  }, [moduleOptions, unitId]);

  const availableCourses = useMemo(() => {
    const selectedModules = new Set(moduleIds);
    return courseOptions.filter((c: any) => (!unitId || c.unitId === unitId) && (selectedModules.size === 0 || selectedModules.has(c.moduleId)));
  }, [courseOptions, unitId, moduleIds]);

  // Title suggestion from API/context (fallback): build from selections when empty
  const suggestedTitle = useMemo(() => {
    if (title.trim()) return title;
    const unitName = availableUnits.find((u: any) => u.value === unitId)?.label;
    const firstModule = availableModules.find((m: any) => moduleIds.includes(m.value));
    const moduleName = firstModule?.label;
    const courseLabels = courseOptions.filter((c: any) => courseIds.includes(c.value)).map((c: any) => c.label.split(' (')[0]);
    const base = courseLabels.slice(0, 2).join(', ') || moduleName || unitName || pack?.name || 'Practice Session';
    return base;
  }, [title, unitId, moduleIds, courseIds, availableUnits, availableModules, courseOptions, pack?.name]);

  // Compute allowed yearLevels from subscriptions
  const allowedYearLevels = useMemo(() => {
    return selectEffectiveActiveSubscription(subscriptions).allowedYearLevels;
  }, [subscriptions]);

  // Real-time counts via API with 300ms debounce
  const selectedCourseIdsNum = useMemo(() => courseIds.map(Number), [courseIds]);
  const mappedTypes = useMemo(() => types.map(t => t.toUpperCase() === 'QCM' ? 'MULTIPLE_CHOICE' : 'SINGLE_CHOICE'), [types]);
  const filtersForCounts = useMemo(() => ({
    yearLevels: allowedYearLevels,
    courseIds: selectedCourseIdsNum,
    moduleIds: moduleIds.length ? moduleIds.map(Number) : undefined,
    uniteIds: unitId ? [Number(unitId)] : undefined,
    questionTypes: mappedTypes,
    quizSourceIds,
    // Prefer explicit list of years; backend supports this
    quizYears: quizYears.length ? quizYears : undefined,
  }), [allowedYearLevels, selectedCourseIdsNum, moduleIds, unitId, mappedTypes, quizSourceIds, quizYears]);
  const debouncedFilters = useDebounce(filtersForCounts, 300);
  const courseCountsById = useMemo(() => Object.fromEntries(courseOptions.map((c: any) => [Number(c.value), c.questionCount || 0])), [courseOptions]);
  const { data: counts, isLoading: countsLoading, error: countsError, refetch: refetchCounts } = useAvailableQuestionCounts(
    debouncedFilters,
    !!allowedYearLevels.length && ((moduleIds && moduleIds.length > 0) || selectedCourseIdsNum.length > 0),
    { courseCountsById }
  );

  // Use only server-reported counts to avoid overcounting; default to 0 until available
  const totalAvailable = typeof counts?.total === 'number' ? counts.total : 0;

  useEffect(() => {
    // Update questionCount when available total changes
    if (totalAvailable > 0) {
      setQuestionCount((prev) => Math.min(Math.max(prev || Math.min(10, totalAvailable), 1), totalAvailable));
    } else {
      setQuestionCount(0);
    }
  }, [totalAvailable]);

  const step1Valid = !!suggestedTitle && !!unitId && moduleIds.length > 0 && courseIds.length > 0;
  const step2Valid = totalAvailable > 0 && questionCount > 0 && questionCount <= totalAvailable;

  const canNext = useMemo(() => {
    if (step === 1) return step1Valid && !packLoading && !packError;
    if (step === 2) return step2Valid;
    return true;
  }, [step, step1Valid, step2Valid, packLoading, packError]);

  const handleCreate = () => {
    const finalTitle = (title.trim() || suggestedTitle || 'Practice Session').slice(0, 200);
    if (finalTitle.length < 3) return; // enforce min 3 chars

    onCreate({
      title: finalTitle,
      program: program.trim() || undefined,
      unitId: unitId ? Number(unitId) : undefined,
      // expose moduleIds for multi-select
      ...(moduleIds.length ? { moduleIds: moduleIds.map(Number) } : {} as any),
      courseIds: courseIds.map((id) => Number(id)),
      availableCount: totalAvailable,
      filters: {
        types,
        quizSourceIds,
        quizYears: quizYears.length ? quizYears : undefined,
      },
      questionCount: questionCount || undefined,
    } as any);
  };

  return (
    <Card className="quiz-card-enhanced">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Create Practice Session</CardTitle>
            <p className="text-sm text-muted-foreground">3 steps • no data connected yet</p>
          </div>
          <div className="min-w-[200px]">
            <Progress value={progressPct} className="progress-animated" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stepper */}
        <div className="flex items-center gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step >= i ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {step > i ? <CheckCircle2 className="w-4 h-4" /> : i}
              </div>
              {i < 3 && <div className="w-10 h-0.5 bg-border" />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title (optional)</Label>
                <Input
                  id="title"
                  placeholder={suggestedTitle || "e.g. Cardiology Practice - Week 12"}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="quiz-input-enhanced"
                />
                <p className="text-xs text-muted-foreground">Default from API/context; you can modify it.</p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Unit</Label>
                <Select value={unitId} onValueChange={(v) => { setUnitId(v); setModuleIds([]); setCourseIds([]); }}>
                  <SelectTrigger>
                    <SelectValue placeholder={packLoading ? "Loading units..." : "Select unit"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUnits.map((u: any) => (
                      <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Modules</Label>
                <MultiSelect
                  options={availableModules}
                  value={moduleIds}
                  onChange={(vals) => { setModuleIds(vals); setCourseIds([]); }}
                  placeholder={!unitId ? "Select unit first" : (packLoading ? "Loading modules..." : "Select modules")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Courses</Label>
                <MultiSelect
                  options={moduleIds.length ? availableCourses : []}
                  value={courseIds}
                  onChange={setCourseIds}
                  placeholder={!moduleIds.length ? "Select modules first" : (packLoading ? "Loading courses..." : "Select courses")}
                />
              </div>
              <div className="space-y-2">
                <Label>Selected Courses</Label>
                <div className="rounded-lg border p-4 min-h-24 space-y-2">
                  {courseIds.length === 0 ? (
                    <p className="text-sm text-muted-foreground">None selected</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {courseIds.map((c) => (
                        <Badge key={c} variant="secondary">
                          {courseOptions.find((opt: any) => opt.value === c)?.label?.split(' (')[0] || c}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {!!courseIds.length && (
              <div className="space-y-2">
                <Label>Available Questions</Label>
                <div className="flex items-center gap-4">
                  <Progress value={Math.min(100, totalAvailable > 0 ? 100 : 0)} className="flex-1" />
                  <div className="text-sm text-muted-foreground whitespace-nowrap">
                    {countsLoading ? 'Loading...' : `${totalAvailable} total`}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {mappedTypes.length === 2
                    ? `${counts?.MULTIPLE_CHOICE ?? '—'} QCM, ${counts?.SINGLE_CHOICE ?? '—'} QCS available`
                    : mappedTypes[0] === 'MULTIPLE_CHOICE'
                      ? `${counts?.MULTIPLE_CHOICE ?? '—'} QCM available`
                      : mappedTypes[0] === 'SINGLE_CHOICE'
                        ? `${counts?.SINGLE_CHOICE ?? '—'} QCS available`
                        : 'Breakdown appears once you select a type.'}
                </p>
              </div>
            )}


          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">
                {(moduleIds.length ? availableModules.filter((m: any) => moduleIds.includes(m.value)).map((m: any) => m.label).join(', ') : 'Modules')}
                {" • "}
                {availableUnits.find((u: any) => u.value === unitId)?.label || "Unit"}
              </h3>
              <p className="text-sm text-muted-foreground">Add filters</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4" aria-live="polite">
              <div className="space-y-2">
                <Label>Question Types</Label>
                <MultiSelect
                  options={[{ label: 'QCM', value: 'qcm' }, { label: 'QCS', value: 'qcs' }]}
                  value={types}
                  onChange={setTypes}
                  placeholder="Select one or more types"
                />
              </div>
              {/** Compute allowed exam years based on selected sources */}
              {(() => null)()}


              <div className="space-y-2">
                <Label>Exam Years</Label>
                <MultiSelect
                  options={(quizFilters?.availableQuizYears || quizFilters?.availableYears || []).map((y: number) => ({ label: String(y), value: String(y) }))}
                  value={quizYears.map(String)}
                  onChange={(vals) => setQuizYears(vals.map((v) => Number(v)))}
                  placeholder="Select years (optional)"
                />
              </div>

              <div className="space-y-2">
                <Label>Sources</Label>
                <MultiSelect
                  options={(quizFilters?.quizSources || []).map((s: any) => ({ value: String(s.id), label: s.name }))}
                  value={quizSourceIds.map(String)}
                  onChange={(vals) => setQuizSourceIds(vals.map((v) => Number(v)))}
                  placeholder="Select sources (optional)"
                />
              </div>

              {/* Keep years and sources consistent: prune selected years if not allowed by selected sources */}
              <React.Fragment>
                {(() => {
                  const selectedSourceYears = new Set<number>();
                  (quizFilters?.quizSources || [])
                    .filter((s: any) => quizSourceIds.includes(Number(s.id)))
                    .forEach((s: any) => (s.availableYears || []).forEach((y: number) => selectedSourceYears.add(y)));
                  // Union of allowed by selected sources; if none selected, allow all availableQuizYears
                  const allowedYears = selectedSourceYears.size ? Array.from(selectedSourceYears) : (quizFilters?.availableQuizYears || []);
                  if (quizYears.length && allowedYears.length) {
                    const pruned = quizYears.filter((y) => allowedYears.includes(y));
                    if (pruned.length !== quizYears.length) setQuizYears(pruned);
                  }
                  return null;
                })()}
              </React.Fragment>

            </div>

            {/* Question count slider */}
            <div className="space-y-2">
              <Label>Question Count</Label>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Slider
                    min={1}
                    max={Math.max(1, totalAvailable)}
                    value={[Math.min(Math.max(1, questionCount), Math.max(1, totalAvailable))]}
                    onValueChange={([v]) => setQuestionCount(v)}
                    disabled={countsLoading || totalAvailable === 0}
                    aria-valuetext={`${questionCount} questions`}
                  />
                </div>
                <div className="w-14 text-right text-sm">{countsLoading ? '...' : questionCount}</div>
              </div>
              <p className="text-xs text-muted-foreground">Max available: {countsLoading ? '...' : totalAvailable}</p>
            </div>

            {!!courseIds.length && (
              <div className="space-y-2">
                <Label>Available Questions</Label>
                <div className="flex items-center gap-4">
                  <Progress value={Math.min(100, totalAvailable > 0 ? 100 : 0)} className="flex-1" />
                  <div className="text-sm text-muted-foreground whitespace-nowrap">
                    {countsLoading ? 'Loading...' : `${totalAvailable} total`}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {mappedTypes.length === 2
                    ? `${counts?.MULTIPLE_CHOICE ?? '—'} QCM, ${counts?.SINGLE_CHOICE ?? '—'} QCS available`
                    : mappedTypes[0] === 'MULTIPLE_CHOICE'
                      ? `${counts?.MULTIPLE_CHOICE ?? totalAvailable} QCM available`
                      : mappedTypes[0] === 'SINGLE_CHOICE'
                        ? `${counts?.SINGLE_CHOICE ?? totalAvailable} QCS available`
                        : 'Counts update with your selections.'}
                </p>
                {totalAvailable === 0 && (
                  <p className="text-xs text-red-600">0 questions available with current filters. Please adjust your filters.</p>
                )}
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="program">Program</Label>
                <Input
                  id="program"
                  placeholder="e.g. Medicine L2"
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  className="quiz-input-enhanced"
                />
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  placeholder="Session title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="quiz-input-enhanced"
                />
              </div>
            </div>

            <div className="rounded-lg border p-4 space-y-2">
              <h4 className="font-semibold">Summary</h4>
              <div className="text-sm grid grid-cols-1 md:grid-cols-2 gap-y-1">
                <div><span className="text-muted-foreground">Unit:</span> {availableUnits.find((u: any) => u.value === unitId)?.label || "—"}</div>
                <div><span className="text-muted-foreground">Modules:</span> {moduleIds.length ? availableModules.filter((m: any) => moduleIds.includes(m.value)).map((m: any) => m.label).join(', ') : "—"}</div>
                <div className="md:col-span-2">
                  <span className="text-muted-foreground">Courses:</span> {courseIds.length ? courseIds.map(c => courseOptions.find((opt: any) => opt.value === c)?.label?.split(' (')[0]).join(", ") : "—"}
                </div>
                <div><span className="text-muted-foreground">Types:</span> {types.length ? types.join(", ") : "—"}</div>
                <div className="md:col-span-2"><span className="text-muted-foreground">Years:</span> {quizYears.length ? quizYears.sort().join(", ") : "—"}</div>
              </div>
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <div className="flex items-center gap-2">
            {step > 1 && (
              <Button variant="secondary" onClick={prev}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
              </Button>
            )}
            {step < 3 ? (
              <Button onClick={next} disabled={!canNext}>
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleCreate} disabled={!(step1Valid && step2Valid) || totalAvailable === 0} className="practice-button" aria-disabled={!(step1Valid && step2Valid) || totalAvailable === 0}>
                Create Session
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

