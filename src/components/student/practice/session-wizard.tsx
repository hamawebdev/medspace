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
import { ChevronLeft, ChevronRight, CheckCircle2, X, CheckSquare, Square } from "lucide-react";
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
  timeLimit?: number; // in minutes
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
  const [unitId, setUnitId] = useState<string>("");
  const [moduleIds, setModuleIds] = useState<string[]>([]);
  const [courseIds, setCourseIds] = useState<string[]>([]);

  // Step 2 filters
  const [types, setTypes] = useState<string[]>([]);
  const [quizYears, setQuizYears] = useState<number[]>([]);
  const [quizSourceIds, setQuizSourceIds] = useState<number[]>([]);
  const [questionCount, setQuestionCount] = useState<number>(0);

  // Step 3 finalize
  const [program, setProgram] = useState<string>("");
  const [timeLimit, setTimeLimit] = useState<number | undefined>(undefined);

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
    return moduleOptions.filter((m: any) => !unitId || unitId === "" || m.unitId === unitId);
  }, [moduleOptions, unitId]);

  const availableCourses = useMemo(() => {
    const selectedModules = new Set(moduleIds);
    return courseOptions.filter((c: any) => (!unitId || unitId === "" || c.unitId === unitId) && (selectedModules.size === 0 || selectedModules.has(c.moduleId)));
  }, [courseOptions, unitId, moduleIds]);

  // Handle removing individual courses
  const removeCourse = (courseIdToRemove: string) => {
    setCourseIds(prev => prev.filter(id => id !== courseIdToRemove));
  };

  // Handle selecting/deselecting all courses
  const selectAllCourses = () => {
    const allCourseIds = availableCourses.map((c: any) => c.value);
    setCourseIds(allCourseIds);
  };

  const deselectAllCourses = () => {
    setCourseIds([]);
  };

  const areAllCoursesSelected = availableCourses.length > 0 && courseIds.length === availableCourses.length;

  // Handle selecting/deselecting all modules
  const selectAllModules = () => {
    const allModuleIds = availableModules.map((m: any) => m.value);
    setModuleIds(allModuleIds);
    setCourseIds([]); // Clear courses when modules change
  };

  const deselectAllModules = () => {
    setModuleIds([]);
    setCourseIds([]); // Clear courses when modules change
  };

  const areAllModulesSelected = availableModules.length > 0 && moduleIds.length === availableModules.length;

  // Handle selecting/deselecting all exam years
  const availableYearOptions = (quizFilters?.availableQuizYears || quizFilters?.availableYears || []);
  const selectAllYears = () => {
    setQuizYears([...availableYearOptions]);
  };

  const deselectAllYears = () => {
    setQuizYears([]);
  };

  const areAllYearsSelected = availableYearOptions.length > 0 && quizYears.length === availableYearOptions.length;

  // Handle selecting/deselecting all sources
  const availableSourceOptions = (quizFilters?.quizSources || []);
  const selectAllSources = () => {
    const allSourceIds = availableSourceOptions.map((s: any) => Number(s.id));
    setQuizSourceIds(allSourceIds);
  };

  const deselectAllSources = () => {
    setQuizSourceIds([]);
  };

  const areAllSourcesSelected = availableSourceOptions.length > 0 && quizSourceIds.length === availableSourceOptions.length;

  // Handle selecting/deselecting all question types
  const availableTypeOptions = [{ label: 'QCM', value: 'qcm' }, { label: 'QCS', value: 'qcs' }];
  const selectAllTypes = () => {
    setTypes(['qcm', 'qcs']);
  };

  const deselectAllTypes = () => {
    setTypes([]);
  };

  const areAllTypesSelected = types.length === availableTypeOptions.length;

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
    uniteIds: unitId && unitId !== "" ? [Number(unitId)] : undefined,
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

  const step1Valid = !!suggestedTitle && unitId && unitId !== "" && moduleIds.length > 0 && courseIds.length > 0;
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
      unitId: unitId && unitId !== "" ? Number(unitId) : undefined,
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
      timeLimit: timeLimit,
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
      <CardContent className="space-y-6 p-4 sm:p-6">
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
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title (optional)</Label>
                <Input
                  id="title"
                  placeholder={suggestedTitle || "e.g. Cardiology Practice - Week 12"}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="quiz-input-enhanced w-full"
                />
                <p className="text-xs text-muted-foreground">Default from API/context; you can modify it.</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-6">
              {/* Unit and Modules Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <div className="relative">
                    <Select value={unitId || ""} onValueChange={(v) => {
                      if (v) {
                        setUnitId(v);
                        setModuleIds([]);
                        setCourseIds([]);
                      }
                    }}>
                      <SelectTrigger className="pr-16 overflow-hidden">
                        <SelectValue placeholder={packLoading ? "Loading units..." : "Select unit"} className="truncate block w-full" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableUnits.map((u: any) => (
                          <SelectItem key={u.value} value={u.value} className="truncate">
                            <span className="truncate" title={u.label}>{u.label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {unitId && unitId !== "" && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-10 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground z-20 rounded-full"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setUnitId("");
                          setModuleIds([]);
                          setCourseIds([]);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>
                      Modules
                      {availableModules.length > 0 && (
                        <span className="text-xs text-muted-foreground ml-1">
                          ({moduleIds.length}/{availableModules.length})
                        </span>
                      )}
                    </Label>
                    {unitId && unitId !== "" && availableModules.length > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={areAllModulesSelected ? deselectAllModules : selectAllModules}
                        className="text-xs h-7 gap-1"
                      >
                        {areAllModulesSelected ? (
                          <>
                            <Square className="h-3 w-3" />
                            Deselect All
                          </>
                        ) : (
                          <>
                            <CheckSquare className="h-3 w-3" />
                            Select All
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  <MultiSelect
                    options={availableModules}
                    value={moduleIds}
                    onChange={(vals) => { setModuleIds(vals); setCourseIds([]); }}
                    placeholder={!unitId || unitId === "" ? "Select unit first" : (packLoading ? "Loading modules..." : "Select modules")}
                  />
                </div>
              </div>

              {/* Courses Row */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>
                      Courses
                      {availableCourses.length > 0 && (
                        <span className="text-xs text-muted-foreground ml-1">
                          ({courseIds.length}/{availableCourses.length})
                        </span>
                      )}
                    </Label>
                    {moduleIds.length > 0 && availableCourses.length > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={areAllCoursesSelected ? deselectAllCourses : selectAllCourses}
                        className="text-xs h-7 gap-1"
                      >
                        {areAllCoursesSelected ? (
                          <>
                            <Square className="h-3 w-3" />
                            Deselect All
                          </>
                        ) : (
                          <>
                            <CheckSquare className="h-3 w-3" />
                            Select All
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  <MultiSelect
                    options={moduleIds.length ? availableCourses : []}
                    value={courseIds}
                    onChange={setCourseIds}
                    placeholder={!moduleIds.length ? "Select modules first" : (packLoading ? "Loading courses..." : "Select courses")}
                  />
                </div>

                {/* Selected Courses Display */}
                {courseIds.length > 0 && (
                  <div className="space-y-2">
                    <Label>Selected Courses</Label>
                    <div className="rounded-lg border p-4 min-h-16 bg-muted/20">
                      <div className="flex flex-wrap gap-2">
                        {courseIds.map((c) => (
                          <Badge key={c} variant="secondary" className="flex items-center gap-1 pr-1">
                            <span className="truncate max-w-[200px]">{courseOptions.find((opt: any) => opt.value === c)?.label?.split(' (')[0] || c}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                              onClick={() => removeCourse(c)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
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
                <div className="flex items-center justify-between">
                  <Label>
                    Question Types
                    <span className="text-xs text-muted-foreground ml-1">
                      ({types.length}/{availableTypeOptions.length})
                    </span>
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={areAllTypesSelected ? deselectAllTypes : selectAllTypes}
                    className="text-xs h-7 gap-1"
                  >
                    {areAllTypesSelected ? (
                      <>
                        <Square className="h-3 w-3" />
                        Deselect All
                      </>
                    ) : (
                      <>
                        <CheckSquare className="h-3 w-3" />
                        Select All
                      </>
                    )}
                  </Button>
                </div>
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
                <div className="flex items-center justify-between">
                  <Label>
                    Exam Years
                    {availableYearOptions.length > 0 && (
                      <span className="text-xs text-muted-foreground ml-1">
                        ({quizYears.length}/{availableYearOptions.length})
                      </span>
                    )}
                  </Label>
                  {availableYearOptions.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={areAllYearsSelected ? deselectAllYears : selectAllYears}
                      className="text-xs h-7 gap-1"
                    >
                      {areAllYearsSelected ? (
                        <>
                          <Square className="h-3 w-3" />
                          Deselect All
                        </>
                      ) : (
                        <>
                          <CheckSquare className="h-3 w-3" />
                          Select All
                        </>
                      )}
                    </Button>
                  )}
                </div>
                <MultiSelect
                  options={(quizFilters?.availableQuizYears || quizFilters?.availableYears || []).map((y: number) => ({ label: String(y), value: String(y) }))}
                  value={quizYears.map(String)}
                  onChange={(vals) => setQuizYears(vals.map((v) => Number(v)))}
                  placeholder="Select years (optional)"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>
                    Sources
                    {availableSourceOptions.length > 0 && (
                      <span className="text-xs text-muted-foreground ml-1">
                        ({quizSourceIds.length}/{availableSourceOptions.length})
                      </span>
                    )}
                  </Label>
                  {availableSourceOptions.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={areAllSourcesSelected ? deselectAllSources : selectAllSources}
                      className="text-xs h-7 gap-1"
                    >
                      {areAllSourcesSelected ? (
                        <>
                          <Square className="h-3 w-3" />
                          Deselect All
                        </>
                      ) : (
                        <>
                          <CheckSquare className="h-3 w-3" />
                          Select All
                        </>
                      )}
                    </Button>
                  )}
                </div>
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

            <div className="space-y-2">
              <Label>Quiz Duration</Label>
              <Select
                value={timeLimit?.toString() || 'none'}
                onValueChange={(value) => setTimeLimit(value === 'none' ? undefined : parseInt(value))}
              >
                <SelectTrigger className="quiz-input-enhanced">
                  <SelectValue placeholder="Select quiz duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No time limit</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Set a time limit for your practice session. When time is up, the timer will turn red and notify you.
              </p>
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
                <div><span className="text-muted-foreground">Duration:</span> {timeLimit ? `${timeLimit} minutes` : "No limit"}</div>
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

