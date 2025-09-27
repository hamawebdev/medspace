"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
// Card components removed - component is now wrapped by parent Card
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { MultiSelect } from "@/components/ui/multi-select";
import { Slider } from "@/components/ui/slider";
import { ChevronLeft, ChevronRight, CheckCircle2, X, CheckSquare, Square, RefreshCw } from "lucide-react";
import { useUserSubscriptions, selectEffectiveActiveSubscription } from "@/hooks/use-subscription";

import { useQuizFilters } from "@/hooks/use-quiz-api";
import { useDebounce } from "@/hooks/use-debounce";
import { useContentFilters, useQuizSessionFilters, useQuestionCount } from "@/hooks/use-content-filters";
import { useUniversitySelection } from "@/hooks/use-university-selection";
import { UniversitySelector } from "@/components/ui/university-selector";

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
  isCreating = false,
}: {
  onCancel: () => void;
  onCreate: (payload: PracticeSessionPayload) => void;
  isCreating?: boolean;
}) {
  const [step, setStep] = useState(1);

  // Load user's active subscription and fetch content filters
  const { subscriptions, loading: subsLoading } = useUserSubscriptions();
  const { filters: quizFilters } = useQuizFilters();
  const { filters: contentFilters, loading: contentLoading, error: contentError } = useContentFilters();
  const { filters: sessionFilters, loading: sessionFiltersLoading, error: sessionFiltersError, refetch: refetchSessionFilters } = useQuizSessionFilters();
  const { questionCount: availableQuestionCount, totalQuestionCount, loading: questionCountLoading, error: questionCountError, refetch: refetchQuestionCount } = useQuestionCount();

  // University selection logic
  const universitySelection = useUniversitySelection({
    universities: sessionFilters?.universities || [],
    allowMultiple: true, // Practice sessions allow multiple universities
    required: false, // Universities are optional for practice sessions
    initialSelection: []
  });

  // Step 1
  const [title, setTitle] = useState("");
  const [unitId, setUnitId] = useState<string>("");
  const [moduleIds, setModuleIds] = useState<string[]>([]);
  const [courseIds, setCourseIds] = useState<string[]>([]);

  // Step 2 filters
  const [types, setTypes] = useState<string[]>([]);
  const [quizYears, setQuizYears] = useState<number[]>([]);
  const [quizSourceIds, setQuizSourceIds] = useState<number[]>([]);
  // Rotations removed from practice creation - always send empty array
  const [questionCount, setQuestionCount] = useState<number>(0);

  // Step 3 finalize
  const [program, setProgram] = useState<string>("");
  const [timeLimit, setTimeLimit] = useState<number | undefined>(undefined);

  const progressPct = useMemo(() => (step / 3) * 100, [step]);

  const next = () => setStep((s) => Math.min(3, s + 1));
  const prev = () => setStep((s) => Math.max(1, s - 1));
  
  const clearAllSelections = () => {
    setUnitId("");
    setModuleIds([]);
    setCourseIds([]);
    setTitle("");
    setTypes([]);
    setQuizYears([]);
    setQuizSourceIds([]);
    setQuestionCount(0);
    setTimeLimit(undefined);
  };

  // Handle course selection with 50 course limit
  const handleCourseSelection = (selectedCourseIds: string[]) => {
    if (selectedCourseIds.length > 50) {
      // Don't update the state if more than 50 courses are selected
      return;
    }
    setCourseIds(selectedCourseIds);
  };

  // Build options from content filters
  const unitOptions = useMemo(() => {
    console.log('🔍 [Practice Session Wizard] Content Filters Data:', contentFilters);
    console.log('🔍 [Practice Session Wizard] Unites from backend:', contentFilters?.unites);
    console.log('🔍 [Practice Session Wizard] Independent Modules from backend:', contentFilters?.independentModules);

    const units = contentFilters?.unites?.map((u: any) => ({ value: String(u.id), label: u.name })) || [];
    console.log('🔍 [Practice Session Wizard] Processed Unit Options:', units);

    return units;
  }, [contentFilters]);

  const moduleOptions = useMemo(() => {
    const modules: any[] = [];

    console.log('🔍 [Practice Session Wizard] Building module options...');

    // Add modules from unites
    (contentFilters?.unites || []).forEach((u: any, uniteIndex: number) => {
      console.log(`🔍 [Practice Session Wizard] Processing Unite ${uniteIndex + 1}:`, u);
      console.log(`🔍 [Practice Session Wizard] Unite ${u.name} has ${u.modules?.length || 0} modules:`, u.modules);

      (u.modules || []).forEach((m: any, moduleIndex: number) => {
        console.log(`🔍 [Practice Session Wizard] Adding module ${moduleIndex + 1} from unite ${u.name}:`, m);
        modules.push({
          value: String(m.id),
          label: m.name,
          unitId: String(u.id),
          unitName: u.name,
          description: m.description
        });
      });
    });

    // Add independent modules
    (contentFilters?.independentModules || []).forEach((m: any, moduleIndex: number) => {
      console.log(`🔍 [Practice Session Wizard] Adding independent module ${moduleIndex + 1}:`, m);
      modules.push({
        value: String(m.id),
        label: `${m.name} (Independent)`,
        unitId: null,
        unitName: null,
        description: m.description,
        isIndependent: true
      });
    });

    console.log('🔍 [Practice Session Wizard] Final Module Options:', modules);
    console.log('🔍 [Practice Session Wizard] Total modules found:', modules.length);

    return modules;
  }, [contentFilters]);

  // Extract courses from content filters based on selected modules or unit
  const courseOptions = useMemo(() => {
    if (!contentFilters) return [];

    const courses: any[] = [];

    console.log('🔍 [Practice Session Wizard] Extracting courses from content filters...');

    // If a unit is selected, get all courses from that unit's modules
    if (unitId && unitId !== "") {
      const selectedUnit = contentFilters.unites?.find((u: any) => String(u.id) === unitId);
      if (selectedUnit) {
        console.log(`🔍 [Practice Session Wizard] Found selected unit: ${selectedUnit.name}`);
        (selectedUnit.modules || []).forEach((module: any) => {
          console.log(`🔍 [Practice Session Wizard] Processing module: ${module.name} with ${module.courses?.length || 0} courses`);
          (module.courses || []).forEach((course: any) => {
            courses.push({
              value: String(course.id),
              label: course.name,
              description: course.description,
              moduleId: String(module.id),
              unitId: unitId,
              questionCount: 0 // Will be updated via question count API
            });
          });
        });
      }
    }
    // If specific modules are selected, get courses from those modules
    else if (moduleIds.length > 0) {
      console.log(`🔍 [Practice Session Wizard] Processing ${moduleIds.length} selected modules`);

      // Check modules within units
      (contentFilters.unites || []).forEach((unit: any) => {
        (unit.modules || []).forEach((module: any) => {
          if (moduleIds.includes(String(module.id))) {
            console.log(`🔍 [Practice Session Wizard] Found selected module in unit: ${module.name}`);
            (module.courses || []).forEach((course: any) => {
              courses.push({
                value: String(course.id),
                label: course.name,
                description: course.description,
                moduleId: String(module.id),
                unitId: String(unit.id),
                questionCount: 0 // Will be updated via question count API
              });
            });
          }
        });
      });

      // Check independent modules
      (contentFilters.independentModules || []).forEach((module: any) => {
        if (moduleIds.includes(String(module.id))) {
          console.log(`🔍 [Practice Session Wizard] Found selected independent module: ${module.name}`);
          (module.courses || []).forEach((course: any) => {
            courses.push({
              value: String(course.id),
              label: course.name,
              description: course.description,
              moduleId: String(module.id),
              unitId: null, // Independent modules don't belong to a unit
              questionCount: 0 // Will be updated via question count API
            });
          });
        }
      });
    }

    console.log(`🔍 [Practice Session Wizard] Total courses extracted: ${courses.length}`);
    return courses;
  }, [contentFilters, unitId, moduleIds]);

  // Filter options by current selections
  const availableUnits = unitOptions;
  const availableModules = useMemo(() => {
    // When a unit is selected, show only modules from that unit
    if (unitId && unitId !== "") {
      return moduleOptions.filter((m: any) => m.unitId === unitId);
    }
    // When no unit is selected, show only independent modules
    else {
      return moduleOptions.filter((m: any) => m.isIndependent === true);
    }
  }, [moduleOptions, unitId]);

  const availableCourses = useMemo(() => {
    // If we're loading content filters or have an error, return empty array
    if (contentLoading || contentError || !courseOptions.length) {
      return [];
    }

    // If a unit is selected AND specific modules are also selected,
    // filter courses by those modules only
    if (unitId && unitId !== "" && moduleIds.length > 0) {
      const selectedModules = new Set(moduleIds);
      return courseOptions.filter((c: any) =>
        c.moduleId && selectedModules.has(c.moduleId)
      );
    }

    // If only a unit is selected (no modules), show all courses from that unit
    if (unitId && unitId !== "") {
      return courseOptions;
    }

    // If modules are selected (without a unit), filter courses by those modules
    if (moduleIds.length > 0) {
      const selectedModules = new Set(moduleIds);
      return courseOptions.filter((c: any) =>
        !c.moduleId || selectedModules.has(c.moduleId)
      );
    }

    // No selection, no courses available
    return [];
  }, [courseOptions, unitId, moduleIds, contentLoading, contentError]);

  // Handle removing individual courses
  const removeCourse = (courseIdToRemove: string) => {
    setCourseIds(prev => prev.filter(id => id !== courseIdToRemove));
  };

  // Handle selecting/deselecting all courses
  const selectAllCourses = () => {
    const allCourseIds = availableCourses.map((c: any) => c.value);
    // Limit to 50 courses maximum
    const limitedCourseIds = allCourseIds.slice(0, 50);
    setCourseIds(limitedCourseIds);
  };

  const deselectAllCourses = () => {
    setCourseIds([]);
  };

  const areAllCoursesSelected = availableCourses.length > 0 && courseIds.length === availableCourses.length;

  // Helper function to extract course IDs from content filters based on selections
  const extractCourseIdsFromContentFilters = (): number[] => {
    if (!contentFilters) return [];

    const courseIds: number[] = [];

    // If a unit is selected, collect all course IDs from that unit's modules
    if (unitId && unitId !== "") {
      const selectedUnit = contentFilters.unites?.find((u: any) => u.id === Number(unitId));
      if (selectedUnit?.modules) {
        selectedUnit.modules.forEach((module: any) => {
          if (module.courses) {
            module.courses.forEach((course: any) => {
              courseIds.push(course.id);
            });
          }
        });
      }
    }
    // If specific modules are selected, collect course IDs from those modules
    else if (moduleIds.length > 0) {
      const selectedModuleIds = moduleIds.map(Number);

      // Check modules within unites
      contentFilters.unites?.forEach((unite: any) => {
        unite.modules?.forEach((module: any) => {
          if (selectedModuleIds.includes(module.id) && module.courses) {
            module.courses.forEach((course: any) => {
              courseIds.push(course.id);
            });
          }
        });
      });

      // Check independent modules
      contentFilters.independentModules?.forEach((module: any) => {
        if (selectedModuleIds.includes(module.id) && module.courses) {
          module.courses.forEach((course: any) => {
            courseIds.push(course.id);
          });
        }
      });
    }
    // If specific courses are selected, use those
    else if (courseIds.length > 0) {
      return courseIds.map(Number);
    }

    return [...new Set(courseIds)]; // Remove duplicates
  };

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
  const availableYearOptions = (sessionFilters?.questionYears || []);
  const selectAllYears = () => {
    setQuizYears([...availableYearOptions]);
  };

  const deselectAllYears = () => {
    setQuizYears([]);
  };

  const areAllYearsSelected = availableYearOptions.length > 0 && quizYears.length === availableYearOptions.length;

  // Handle selecting/deselecting all sources
  const availableSourceOptions = (sessionFilters?.questionSources || []);
  const selectAllSources = () => {
    const allSourceIds = availableSourceOptions.map((s: any) => Number(s.id));
    setQuizSourceIds(allSourceIds);
  };

  const deselectAllSources = () => {
    setQuizSourceIds([]);
  };

  const areAllSourcesSelected = availableSourceOptions.length > 0 && quizSourceIds.length === availableSourceOptions.length;



  // Rotations removed from practice creation

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
    const base = courseLabels.slice(0, 2).join(', ') || moduleName || unitName || 'Practice Session';
    return base;
  }, [title, unitId, moduleIds, courseIds, availableUnits, availableModules, courseOptions]);

  // Compute allowed yearLevels from subscriptions
  const allowedYearLevels = useMemo(() => {
    return selectEffectiveActiveSubscription(subscriptions).allowedYearLevels;
  }, [subscriptions]);

  // Real-time counts via API with 300ms debounce using new endpoint
  const selectedCourseIdsNum = useMemo(() => {
    // If specific courses are selected, use those
    if (courseIds.length > 0) {
      return courseIds.map(Number);
    }
    // Otherwise, extract course IDs from unit/module selections
    return extractCourseIdsFromContentFilters();
  }, [courseIds, unitId, moduleIds, contentFilters]);

  const mappedTypes = useMemo(() => types.map(t => t.toUpperCase() === 'QCM' ? 'MULTIPLE_CHOICE' : 'SINGLE_CHOICE'), [types]);

  // Validate if all required filters are present for practice sessions
  const areRequiredFiltersComplete = useMemo(() => {
    // For practice sessions, the minimum requirement is having courses selected
    const hasCourses = selectedCourseIdsNum.length > 0;

    // Additional validation: ensure we have a valid unit or module selection
    const hasValidSelection = (unitId && unitId !== "") || moduleIds.length > 0;

    console.log('🔍 [Practice Session Wizard] Filter validation:', {
      hasCourses,
      hasValidSelection,
      courseCount: selectedCourseIdsNum.length,
      unitId,
      moduleCount: moduleIds.length,
      isComplete: hasCourses && hasValidSelection
    });

    return hasCourses && hasValidSelection;
  }, [selectedCourseIdsNum, unitId, moduleIds]);

  const filtersForCounts = useMemo(() => ({
    courseIds: selectedCourseIdsNum,
    questionTypes: mappedTypes.length > 0 ? mappedTypes as Array<'SINGLE_CHOICE' | 'MULTIPLE_CHOICE'> : undefined,
    years: quizYears.length > 0 ? quizYears : undefined,
    questionSourceIds: quizSourceIds.length > 0 ? quizSourceIds : undefined,
    universityIds: universitySelection.selectedUniversityIds.length > 0 ? universitySelection.selectedUniversityIds : undefined,
    rotations: [], // Always empty for practice sessions
  }), [selectedCourseIdsNum, mappedTypes, quizYears, quizSourceIds, universitySelection.selectedUniversityIds]);

  const debouncedFilters = useDebounce(filtersForCounts, 300);

  // Track last filters to prevent duplicate calls
  const lastFiltersRef = useRef<string>('');

  // Fetch question count only when all required filters are complete AND we're in Step 2 or later
  useEffect(() => {
    if (areRequiredFiltersComplete && step >= 2) {
      // Create a stable key for comparison
      const filtersKey = JSON.stringify(debouncedFilters);

      // Only fetch if filters have actually changed
      if (filtersKey !== lastFiltersRef.current) {
        console.log('🚀 [Practice Session Wizard] Fetching question count with complete filters:', debouncedFilters);
        lastFiltersRef.current = filtersKey;
        refetchQuestionCount(debouncedFilters);
      } else {
        console.log('⏸️ [Practice Session Wizard] Skipping question count fetch - filters unchanged');
      }
    } else {
      console.log('⏸️ [Practice Session Wizard] Skipping question count fetch - incomplete filters or not in Step 2+');
      // Reset the ref when conditions are not met
      lastFiltersRef.current = '';
    }
  }, [debouncedFilters, areRequiredFiltersComplete, step]);

  // Use the new question count from the API
  const totalAvailable = availableQuestionCount;

  // Provide a simple breakdown for UI display (since the new API doesn't provide type breakdown)
  const counts = useMemo(() => {
    if (!totalAvailable) return null;

    // Simple fallback - we don't have actual breakdown from the new API
    // This is just for UI display purposes
    return {
      MULTIPLE_CHOICE: totalAvailable, // Show total for now
      SINGLE_CHOICE: totalAvailable,   // Show total for now
    };
  }, [totalAvailable]);

  useEffect(() => {
    // Update questionCount when available total changes
    if (totalAvailable > 0) {
      // Only set question count if we don't have a previous value
      // Use a reasonable default based on available questions (no hardcoded fallbacks)
      setQuestionCount((prev) => {
        if (prev && prev > 0) {
          // Keep existing value but ensure it's within bounds
          return Math.min(prev, totalAvailable);
        } else {
          // Set initial value to a reasonable percentage of available questions
          const initialCount = Math.min(Math.max(Math.floor(totalAvailable * 0.1), 1), 20);
          return Math.min(initialCount, totalAvailable);
        }
      });
    } else {
      setQuestionCount(0);
    }
  }, [totalAvailable]);

  // Step 1 validation: only requires title and unit/module selection (no question count needed)
  const step1Valid = !!suggestedTitle && ((unitId && unitId !== "") || moduleIds.length > 0);
  const step2Valid = totalAvailable > 0 && questionCount > 0 && questionCount <= totalAvailable && !questionCountError;

  const canNext = useMemo(() => {
    if (step === 1) return step1Valid && !contentLoading && !contentError && !sessionFiltersLoading && !sessionFiltersError && courseIds.length <= 50;
    if (step === 2) return step2Valid && !questionCountLoading && !sessionFiltersLoading && !sessionFiltersError && courseIds.length <= 50;
    return courseIds.length <= 50;
  }, [step, step1Valid, step2Valid, contentLoading, contentError, questionCountLoading, questionCountError, sessionFiltersLoading, sessionFiltersError, courseIds.length]);

  const handleCreate = () => {
    const finalTitle = (title.trim() || suggestedTitle || 'Practice Session').slice(0, 200);
    if (finalTitle.length < 3) return; // enforce min 3 chars

    // Extract course IDs based on current selections
    let finalCourseIds: number[] = [];

    // If specific courses are selected, use those
    if (courseIds.length > 0) {
      finalCourseIds = courseIds.map(Number);
    } else {
      // Otherwise, extract course IDs from unit/module selections
      finalCourseIds = extractCourseIdsFromContentFilters();
    }

    // Prepare filters for the new API format
    const sessionFilters = {
      questionTypes: types.map(t => t.toUpperCase() === 'QCM' ? 'MULTIPLE_CHOICE' : 'SINGLE_CHOICE') as Array<'SINGLE_CHOICE' | 'MULTIPLE_CHOICE'>,
      questionSourceIds: quizSourceIds.length ? quizSourceIds : undefined,
      years: quizYears.length ? quizYears : undefined,
      universityIds: universitySelection.selectedUniversityIds.length ? universitySelection.selectedUniversityIds : undefined,
      rotations: [], // Always empty for practice sessions
    };

    onCreate({
      title: finalTitle,
      program: program.trim() || undefined,
      unitId: unitId && unitId !== "" ? Number(unitId) : undefined,
      // expose moduleIds for multi-select
      ...(moduleIds.length ? { moduleIds: moduleIds.map(Number) } : {} as any),
      courseIds: finalCourseIds, // Use extracted course IDs
      availableCount: totalAvailable,
      filters: {
        types,
        quizSourceIds,
        quizYears: quizYears.length ? quizYears : undefined,
        universityIds: universitySelection.selectedUniversityIds.length ? universitySelection.selectedUniversityIds : undefined,
        rotations: [], // Always empty for practice sessions
      },
      // New API format filters
      sessionFilters,
      questionCount: questionCount || undefined,
      timeLimit: timeLimit,
    } as any);
  };

  return (
    <div className="space-y-6">
        {/* Error handling */}
        {contentError && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-sm text-destructive">
              Failed to load content: {contentError}
            </p>
          </div>
        )}

        {/* Session filters error handling */}
        {sessionFiltersError && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-destructive font-medium">Failed to load session filters</p>
                <p className="text-xs text-destructive/80 mt-1">{sessionFiltersError}</p>
              </div>
              <Button
                onClick={refetchSessionFilters}
                variant="outline"
                size="sm"
                disabled={sessionFiltersLoading}
                className="text-destructive border-destructive/20 hover:bg-destructive/10"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${sessionFiltersLoading ? 'animate-spin' : ''}`} />
                Retry
              </Button>
            </div>
          </div>
        )}

      {/* Stepper */}
      <div className="flex items-center justify-center gap-3 mb-6">
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
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Title (optional)</Label>
            <Input
              id="title"
              placeholder={suggestedTitle || "e.g. Cardiology Practice - Week 12"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="quiz-input-enhanced w-full"
            />
          </div>

          <Separator />

          <div className="space-y-5">
              {/* Unit Selection */}
              <div className="space-y-2">
                <Label>Unit</Label>
                <Select value={unitId || ""} onValueChange={(v) => {
                  if (v) {
                    setUnitId(v);
                    setModuleIds([]);
                    setCourseIds([]);
                  }
                }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={contentLoading ? "Loading units..." : "Select unit"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUnits.map((u: any) => (
                      <SelectItem key={u.value} value={u.value} className="truncate">
                        <span className="truncate" title={u.label}>{u.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Modules Selection */}
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
                  placeholder={!unitId || unitId === "" ? "Select unit first" : (contentLoading ? "Loading modules..." : "Select modules")}
                />
              </div>

              {/* Courses Selection */}
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
                    {(unitId || moduleIds.length > 0) && availableCourses.length > 0 && !contentLoading && (
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
                    options={availableCourses}
                    value={courseIds}
                    onChange={handleCourseSelection}
                    placeholder={
                      !unitId && !moduleIds.length
                        ? "Select unit or modules first"
                        : contentLoading
                          ? "Loading courses..."
                          : contentError
                            ? "Error loading courses"
                            : availableCourses.length === 0
                              ? "No courses available"
                              : "Select courses"
                    }
                  />

                  {/* Course Loading/Error States */}
                  {contentError && (
                    <div className="text-sm text-red-600 mt-1">
                      Error loading courses: {contentError}
                    </div>
                  )}

                  {/* Course Limit Error */}
                  {courseIds.length >= 50 && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                      <p className="text-sm text-destructive font-medium">
                        Cannot select more than 50 courses
                      </p>
                      <p className="text-xs text-destructive/80 mt-1">
                        You have reached the maximum limit of 50 courses. Please deselect some courses to continue.
                      </p>
                    </div>
                  )}
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


        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
            <div>
              <h3 className="text-lg font-semibold">
                {(moduleIds.length ? availableModules.filter((m: any) => moduleIds.includes(m.value)).map((m: any) => m.label).join(', ') : 'Modules')}
                {" • "}
                {availableUnits.find((u: any) => u.value === unitId)?.label || "Unit"}
              </h3>
              <p className="text-sm text-muted-foreground">Add filters</p>
            </div>

            {/* Session filters loading state */}
            {sessionFiltersLoading && (
              <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/20">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <div className="text-sm text-muted-foreground">
                  Loading filter options...
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3" aria-live="polite">
              <div className="space-y-1.5">
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

              <div className="space-y-1.5">
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
                  options={(sessionFilters?.questionYears || []).map((y: number) => ({ label: String(y), value: String(y) }))}
                  value={quizYears.map(String)}
                  onChange={(vals) => setQuizYears(vals.map((v) => Number(v)))}
                  placeholder={sessionFiltersLoading ? "Loading years..." : sessionFiltersError ? "Error loading years" : "Select years (optional)"}
                  disabled={sessionFiltersLoading || !!sessionFiltersError}
                />
              </div>

              <div className="space-y-1.5">
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
                  options={(sessionFilters?.questionSources || []).map((s: any) => ({ value: String(s.id), label: s.name }))}
                  value={quizSourceIds.map(String)}
                  onChange={(vals) => setQuizSourceIds(vals.map((v) => Number(v)))}
                  placeholder={sessionFiltersLoading ? "Loading sources..." : sessionFiltersError ? "Error loading sources" : "Select sources (optional)"}
                  disabled={sessionFiltersLoading || !!sessionFiltersError}
                />
              </div>

              <UniversitySelector
                universitySelection={universitySelection}
                allowMultiple={true}
                required={false}
                loading={sessionFiltersLoading}
                label="Universités"
                sessionType="PRACTICE"
              />
            </div>

            {/* Keep years and sources consistent: prune selected years if not allowed by selected sources */}
            {(() => {
              const selectedSourceYears = new Set<number>();
              (sessionFilters?.questionSources || [])
                .filter((s: any) => quizSourceIds.includes(Number(s.id)))
                .forEach((s: any) => (s.availableYears || []).forEach((y: number) => selectedSourceYears.add(y)));
              // Union of allowed by selected sources; if none selected, allow all questionYears
              const allowedYears = selectedSourceYears.size ? Array.from(selectedSourceYears) : (sessionFilters?.questionYears || []);
              if (quizYears.length && allowedYears.length) {
                const pruned = quizYears.filter((y) => allowedYears.includes(y));
                if (pruned.length !== quizYears.length) setQuizYears(pruned);
              }
              return null;
            })()}

            {/* Question count slider */}
            <div className="space-y-1.5">
              <Label>Question Count</Label>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Slider
                    min={1}
                    max={Math.max(1, totalAvailable)}
                    value={[Math.min(Math.max(1, questionCount), Math.max(1, totalAvailable))]}
                    onValueChange={([v]) => setQuestionCount(v)}
                    disabled={questionCountLoading || totalAvailable === 0 || !!questionCountError}
                    aria-valuetext={`${questionCount} questions`}
                  />
                </div>
                <input
                  type="number"
                  min={1}
                  max={Math.max(1, totalAvailable)}
                  value={questionCountLoading ? '' : questionCountError ? '' : questionCount}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    const clampedValue = Math.min(Math.max(1, value), Math.max(1, totalAvailable));
                    setQuestionCount(clampedValue);
                  }}
                  disabled={questionCountLoading || totalAvailable === 0 || !!questionCountError}
                  placeholder={questionCountLoading ? '...' : questionCountError ? '—' : '1'}
                  className="w-14 text-right text-sm border border-input bg-background px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed sm:w-16 md:w-18 lg:w-20"
                  aria-label="Question count"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Max available: {questionCountLoading ? '...' : questionCountError ? 'Unavailable' : totalAvailable}
              </p>
            </div>


        </div>
      )}

      {step === 3 && (
        <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-border/50">
        <Button variant="outline" onClick={clearAllSelections} className="text-muted-foreground hover:text-foreground w-full sm:w-auto">
          <X className="w-4 h-4 mr-2" />
          Clear All
        </Button>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          {step > 1 && (
            <Button variant="secondary" onClick={prev} className="w-full sm:w-auto">
              <ChevronLeft className="w-4 h-4 mr-1" /> Previous
            </Button>
          )}
          {step < 3 ? (
            <Button onClick={next} disabled={!canNext} className="w-full sm:w-auto">
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleCreate}
              disabled={isCreating || !(step1Valid && step2Valid) || totalAvailable === 0 || questionCountLoading || !!questionCountError || sessionFiltersLoading || !!sessionFiltersError}
              className="practice-button w-full sm:w-auto"
              aria-disabled={isCreating || !(step1Valid && step2Valid) || totalAvailable === 0 || questionCountLoading || !!questionCountError || sessionFiltersLoading || !!sessionFiltersError}
            >
              {isCreating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Session'
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

