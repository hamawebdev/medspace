"use client";

import React, { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, GraduationCap } from "lucide-react";
import { useContentFilters, useQuizSessionFilters } from '@/hooks/use-content-filters';
import { useUserSubscriptions, selectEffectiveActiveSubscription } from '@/hooks/use-subscription';
import { useDebounce } from '@/hooks/use-debounce';
import { NewApiService } from '@/lib/api/new-api-services';
import { LoadingOverlay } from '@/components/loading-states/api-loading-states';
import { ApiErrorBoundary } from '@/components/error-handling/api-error-boundary';
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
  const [selectedUnite, setSelectedUnite] = useState<{
    id: number;
    name: string;
  } | undefined>(undefined);

  const [selectedModule, setSelectedModule] = useState<{
    id: number;
    name: string;
  } | undefined>(undefined);

  const [uniteOptions, setUniteOptions] = useState<Array<{
    id: number;
    name: string;
  }>>([]);

  const [moduleOptions, setModuleOptions] = useState<Array<{
    id: number;
    name: string;
    uniteName?: string;
    isIndependent?: boolean;
  }>>([]);

  // Exam session filters state
  const [examFilters, setExamFilters] = useState<any>(null);
  const [universities, setUniversities] = useState<Array<{ id: number; name: string; country: string; questionCount: number }>>([]);
  const [questionSources, setQuestionSources] = useState<Array<{ id: number; name: string; questionCount: number }>>([]);
  const [examYears, setExamYears] = useState<Array<{ year: number; questionCount: number }>>([]);
  const [rotations, setRotations] = useState<Array<{ rotation: string; questionCount: number }>>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [selectedUniversity, setSelectedUniversity] = useState<string | undefined>(undefined);
  const [selectedSource, setSelectedSource] = useState<string | undefined>(undefined);
  const [selectedYear, setSelectedYear] = useState<string | undefined>(undefined);
  const [selectedRotation, setSelectedRotation] = useState<string | undefined>(undefined);
  const [questionType, setQuestionType] = useState<'ALL' | 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE'>('ALL');

  // Auto-deselection handlers for unite/module selection
  // AUTO-DESELECTION RULE: Selecting one automatically deselects the other
  const handleUniteSelection = (unite: { id: number; name: string }) => {
    console.log('[ExamWizard] Unit selected - automatically deselecting any selected module:', {
      selectedUnit: unite.name,
      previousModule: selectedModule?.name
    });

    setSelectedUnite(unite);
    setSelectedModule(undefined); // Auto-deselect module when unit is selected

    // Reset all filters when changing unite/module to ensure consistency
    setSelectedUniversity(undefined);
    setSelectedSource(undefined);
    setSelectedYear(undefined);
    setSelectedRotation(undefined);

    // Reset question count to trigger recalculation
    setAvailableCount(0);
  };

  const handleModuleSelection = (module: { id: number; name: string }) => {
    console.log('[ExamWizard] Independent module selected - automatically deselecting any selected unit:', {
      selectedModule: module.name,
      previousUnit: selectedUnite?.name
    });

    setSelectedModule(module);
    setSelectedUnite(undefined); // Auto-deselect unit when module is selected

    // Reset all filters when changing unite/module to ensure consistency
    setSelectedUniversity(undefined);
    setSelectedSource(undefined);
    setSelectedYear(undefined);
    setSelectedRotation(undefined);

    // Reset question count to trigger recalculation
    setAvailableCount(0);
  };

  const handleUniteDeselection = () => {
    console.log('[ExamWizard] Unit deselected - clearing all related filters');
    setSelectedUnite(undefined);
    setSelectedUniversity(undefined);
    setSelectedSource(undefined);
    setSelectedYear(undefined);
    setSelectedRotation(undefined);
    setAvailableCount(0);
  };

  const handleModuleDeselection = () => {
    console.log('[ExamWizard] Independent module deselected - clearing all related filters');
    setSelectedModule(undefined);
    setSelectedUniversity(undefined);
    setSelectedSource(undefined);
    setSelectedYear(undefined);
    setSelectedRotation(undefined);
    setAvailableCount(0);
  };

  // Step 1: Get Content Structure - Use content filters for unite/module structure
  const { filters: contentFilters } = useContentFilters();
  const { filters: sessionFilters, loading: sessionFiltersLoading, error: sessionFiltersError } = useQuizSessionFilters();
  const { subscriptions } = useUserSubscriptions();
  const { allowedYearLevels } = selectEffectiveActiveSubscription(subscriptions);
  const allowedYearLevelsKey = React.useMemo(() => (allowedYearLevels || []).join(','), [allowedYearLevels]);
  const [availableCount, setAvailableCount] = useState<number>(0);

  // Step 1: Build unite and module options from content filters
  React.useEffect(() => {
    if (!contentFilters) return;

    const unites: Array<{
      id: number;
      name: string;
    }> = [];

    const modules: Array<{
      id: number;
      name: string;
      uniteName?: string;
      isIndependent?: boolean;
    }> = [];

    // Add unites as selectable options
    for (const unite of contentFilters.unites || []) {
      unites.push({
        id: unite.id,
        name: unite.name
      });
    }

    // Add ONLY independent modules (exclude regular modules within unites)
    for (const module of contentFilters.independentModules || []) {
      modules.push({
        id: module.id,
        name: module.name,
        isIndependent: true
      });
    }

    setUniteOptions(unites);
    setModuleOptions(modules);
  }, [contentFilters]);

  // Step 3: Load exam session filters for client-side filtering
  React.useEffect(() => {
    if (sessionFilters) {
      setExamFilters(sessionFilters);
      setUniversities(sessionFilters.universities || []);
      setQuestionSources(sessionFilters.questionSources || []);

      // Transform questionYears array to expected format
      const years = (sessionFilters.questionYears || []).map((year: number) => ({
        year,
        questionCount: 0 // Question count will be updated via question count API
      }));
      setExamYears(years);

      // Transform rotations array to expected format
      const rotationsData = (sessionFilters.rotations || []).map((rotation: string) => ({
        rotation,
        questionCount: 0 // Question count will be updated via question count API
      }));
      setRotations(rotationsData);
    }
  }, [sessionFilters]);

  // Validate if all required filters are present for exam sessions
  const areRequiredFiltersComplete = useMemo(() => {
    const hasSelection = !!selectedUnite || !!selectedModule;
    const hasRequiredFilters = !!selectedUniversity && selectedUniversity !== 'ALL' &&
                              !!selectedSource && selectedSource !== 'ALL' &&
                              !!selectedYear && selectedYear !== 'ALL';

    console.log('🔍 [ExamWizard] Filter validation:', {
      hasSelection,
      hasRequiredFilters,
      selectedUnite: selectedUnite?.name,
      selectedModule: selectedModule?.name,
      selectedUniversity,
      selectedSource,
      selectedYear,
      isComplete: hasSelection && hasRequiredFilters
    });

    return hasSelection && hasRequiredFilters;
  }, [selectedUnite, selectedModule, selectedUniversity, selectedSource, selectedYear]);

  // Create filters object for debouncing
  const filtersForCount = useMemo(() => ({
    areRequiredFiltersComplete,
    selectedUnite,
    selectedModule,
    selectedUniversity,
    selectedSource,
    selectedYear,
    selectedRotation,
    questionType
  }), [areRequiredFiltersComplete, selectedUnite, selectedModule, selectedUniversity, selectedSource, selectedYear, selectedRotation, questionType]);

  const debouncedFilters = useDebounce(filtersForCount, 300);

  // Track last filters to prevent duplicate calls
  const lastFiltersRef = useRef<string>('');
  const isLoadingRef = useRef<boolean>(false);

  // Helper function to extract course IDs from content filters based on selections
  const extractCourseIdsFromContentFilters = useCallback((): number[] => {
    if (!contentFilters) {
      console.warn('[ExamWizard] No content filters available for course ID extraction');
      return [];
    }

    const courseIds: number[] = [];

    // If a unit is selected, collect all course IDs from that unit's modules
    if (selectedUnite) {
      console.log('[ExamWizard] Extracting course IDs from selected unit:', selectedUnite.name);
      const selectedUnit = contentFilters.unites?.find((u: any) => u.id === selectedUnite.id);

      if (selectedUnit?.modules) {
        selectedUnit.modules.forEach((module: any) => {
          if (module.courses) {
            console.log(`[ExamWizard] Processing module "${module.name}" with ${module.courses.length} courses`);
            module.courses.forEach((course: any) => {
              courseIds.push(course.id);
            });
          }
        });
      } else {
        console.warn('[ExamWizard] Selected unit has no modules or was not found:', selectedUnite);
      }
    }
    // If a specific independent module is selected, collect course IDs from that module
    else if (selectedModule) {
      console.log('[ExamWizard] Extracting course IDs from selected independent module:', selectedModule.name);

      // Only check independent modules (since we now only show independent modules)
      const foundModule = contentFilters.independentModules?.find((module: any) => module.id === selectedModule.id);

      if (foundModule?.courses) {
        console.log(`[ExamWizard] Processing independent module "${foundModule.name}" with ${foundModule.courses.length} courses`);
        foundModule.courses.forEach((course: any) => {
          courseIds.push(course.id);
        });
      } else {
        console.warn('[ExamWizard] Selected independent module has no courses or was not found:', selectedModule);
      }
    }

    const uniqueCourseIds = [...new Set(courseIds)]; // Remove duplicates
    console.log('[ExamWizard] Final course IDs extracted:', {
      totalCourses: courseIds.length,
      uniqueCourses: uniqueCourseIds.length,
      courseIds: uniqueCourseIds,
      selectedUnit: selectedUnite?.name,
      selectedModule: selectedModule?.name
    });

    return uniqueCourseIds;
  }, [contentFilters, selectedUnite, selectedModule]);

  // Memoize the computeAvailableCount function
  const computeAvailableCount = useCallback(async () => {
    // Prevent concurrent calls
    if (isLoadingRef.current) {
      console.log('⏸️ [ExamWizard] Skipping question count fetch - already loading');
      return;
    }

    // Only proceed if all required filters are complete
    if (!debouncedFilters.areRequiredFiltersComplete) {
      console.log('⏸️ [ExamWizard] Skipping question count fetch - incomplete filters');
      setAvailableCount(0);
      return;
    }

    try {
      isLoadingRef.current = true;

      // Extract course IDs from the current selection
      const courseIds = extractCourseIdsFromContentFilters();

      if (courseIds.length === 0) {
        console.warn('[ExamWizard] No course IDs available for question count');
        setAvailableCount(0);
        return;
      }

      // Build filters for the question count API (all required filters are guaranteed to be present)
      const filters: any = {
        courseIds,
        universityIds: [Number(debouncedFilters.selectedUniversity)],
        questionSourceIds: [Number(debouncedFilters.selectedSource)],
        years: [Number(debouncedFilters.selectedYear)]
      };

      // Add optional filters
      if (debouncedFilters.selectedRotation && debouncedFilters.selectedRotation !== 'ALL') {
        filters.rotations = [debouncedFilters.selectedRotation as 'R1' | 'R2' | 'R3' | 'R4'];
      }

      if (debouncedFilters.questionType && debouncedFilters.questionType !== 'ALL') {
        filters.questionTypes = [debouncedFilters.questionType === 'MULTIPLE_CHOICE' ? 'MULTIPLE_CHOICES' : 'SINGLE_CHOICE'];
      }

      console.log('🚀 [ExamWizard] Fetching question count with complete filters:', filters);

      // Call the question count API
      const response = await NewApiService.getQuestionCount(filters);

      if (response.success && response.data) {
        // Prioritize accessibleQuestionCount as per API documentation
        const questionCount = response.data.accessibleQuestionCount || response.data.totalQuestionCount || 0;
        console.log('[ExamWizard] Question count response:', {
          totalQuestionCount: response.data.totalQuestionCount,
          accessibleQuestionCount: response.data.accessibleQuestionCount,
          finalCount: questionCount,
          usingAccessibleCount: !!response.data.accessibleQuestionCount
        });
        setAvailableCount(questionCount);
      } else {
        console.error('[ExamWizard] Question count API failed:', response.error);
        setAvailableCount(0);
      }
    } catch (error) {
      console.error('[ExamWizard] Failed to fetch question count:', error);
      setAvailableCount(0);
    } finally {
      isLoadingRef.current = false;
    }
  }, [debouncedFilters, extractCourseIdsFromContentFilters]);

  // Compute available question count using the /quizzes/question-count endpoint
  useEffect(() => {
    // Create a stable key for comparison
    const filtersKey = JSON.stringify(debouncedFilters);

    // Only fetch if filters have actually changed
    if (filtersKey !== lastFiltersRef.current) {
      lastFiltersRef.current = filtersKey;
      computeAvailableCount();
    } else {
      console.log('⏸️ [ExamWizard] Skipping question count fetch - filters unchanged');
    }
  }, [debouncedFilters, computeAvailableCount]);

  // Require a title, either unite or module selection, and required exam filters
  const canCreate = useMemo(() => {
    const hasTitle = title.trim().length >= 3;
    const hasSelection = !!selectedUnite || !!selectedModule;
    const hasRequiredFilters = !!selectedUniversity && selectedUniversity !== 'ALL' &&
                              !!selectedSource && selectedSource !== 'ALL' &&
                              !!selectedYear && selectedYear !== 'ALL';

    return hasTitle && hasSelection && hasRequiredFilters;
  }, [title, selectedUnite, selectedModule, selectedUniversity, selectedSource, selectedYear]);

  const handleCreate = async () => {
    try {
      if (!selectedUnite && !selectedModule) {
        toast.error('Please select either a Unite or Module');
        return;
      }
      setLoading(true);

      // Step 2: Get Available Questions by Unite or Module
      const apiParams = selectedUnite
        ? { uniteId: selectedUnite.id }
        : { moduleId: selectedModule!.id };

      // Validate that we have valid IDs
      if (selectedUnite && (!selectedUnite.id || isNaN(selectedUnite.id))) {
        console.error('[ExamWizard] Invalid unite ID:', selectedUnite);
        toast.error('Invalid unite selected. Please try selecting again.');
        return;
      }

      if (selectedModule && (!selectedModule.id || isNaN(selectedModule.id))) {
        console.error('[ExamWizard] Invalid module ID:', selectedModule);
        toast.error('Invalid module selected. Please try selecting again.');
        return;
      }

      console.debug('[ExamWizard] Fetching questions with params:', apiParams);

      const questionsResponse = await NewApiService.getQuestionsByUniteOrModule(apiParams);

      console.debug('[ExamWizard] Questions response:', {
        success: questionsResponse.success,
        hasData: !!questionsResponse.data,
        dataStructure: questionsResponse.data ? Object.keys(questionsResponse.data) : 'null',
        questionsCount: questionsResponse.data?.questions?.length || 0,
        fullResponse: questionsResponse
      });

      if (!questionsResponse.success) {
        const contentType = selectedUnite ? 'unite' : 'module';
        console.error('[ExamWizard] API call failed:', questionsResponse.error);
        toast.error(`Failed to fetch questions for the selected ${contentType}: ${questionsResponse.error || 'Unknown error'}`);
        return;
      }

      if (!questionsResponse.data?.questions || questionsResponse.data.questions.length === 0) {
        const contentType = selectedUnite ? 'unite' : 'module';
        console.error('[ExamWizard] No questions in response data:', {
          data: questionsResponse.data,
          hasQuestions: !!questionsResponse.data?.questions,
          questionsLength: questionsResponse.data?.questions?.length
        });
        toast.error(`No questions found for the selected ${contentType}`);
        return;
      }

      let questions = questionsResponse.data.questions;

      // Step 3: Apply Frontend Filters (client-side filtering)
      if (selectedUniversity) {
        const universityId = Number(selectedUniversity);
        questions = questions.filter((q: any) => q.universityId === universityId);
      }

      if (selectedSource) {
        const sourceId = Number(selectedSource);
        questions = questions.filter((q: any) => q.sourceId === sourceId);
      }

      if (selectedYear) {
        const year = Number(selectedYear);
        questions = questions.filter((q: any) => q.examYear === year);
      }

      if (selectedRotation) {
        questions = questions.filter((q: any) => q.rotation === selectedRotation);
      }

      if (questionType !== 'ALL') {
        questions = questions.filter((q: any) => q.questionType === questionType);
      }

      if (questions.length === 0) {
        toast.error('No questions found for the selected filters');
        return;
      }

      // Extract question IDs (limit to 100 questions)
      const questionIds = questions.slice(0, 100).map((q: any) => q.id);

      console.debug('[ExamWizard] Creating session with questions:', {
        selectedUnite,
        selectedModule,
        totalQuestions: questions.length,
        selectedQuestions: questionIds.length,
        filters: {
          selectedUniversity,
          selectedSource,
          selectedYear,
          selectedRotation,
          questionType
        }
      });

      // Step 4: Create Session using new endpoint
      const finalCourseIds = extractCourseIdsFromContentFilters();

      // Validation: Ensure course IDs are collected
      if (finalCourseIds.length === 0) {
        console.error('[ExamWizard] No course IDs extracted from selection:', {
          selectedUnite: selectedUnite?.name,
          selectedModule: selectedModule?.name,
          contentFiltersAvailable: !!contentFilters
        });
        toast.error('No courses found for the selected unit/module. Please check your selection.');
        return;
      }

      // Use the exact question count from the API (no fallback values)
      if (availableCount === 0) {
        toast.error('No questions available with the current filters. Please adjust your selection.');
        return;
      }

      const questionCount = Math.min(availableCount, 100);

      // For EXAM sessions, Years, University IDs, and Question Source IDs are required
      // and must contain exactly one item each
      if (!selectedYear || selectedYear === 'ALL') {
        toast.error('Please select a specific exam year for the exam session');
        return;
      }

      if (!selectedUniversity || selectedUniversity === 'ALL') {
        toast.error('Please select a specific university for the exam session');
        return;
      }

      if (!selectedSource || selectedSource === 'ALL') {
        toast.error('Please select a specific question source for the exam session');
        return;
      }

      const sessionData = {
        title: title.trim() || 'Custom Exam Session',
        questionCount,
        courseIds: finalCourseIds,
        sessionType: 'EXAM' as const,
        // Required fields for EXAM sessions (exactly one item each)
        universityIds: [Number(selectedUniversity)],
        questionSourceIds: [Number(selectedSource)],
        years: [Number(selectedYear)],
        // Optional fields
        ...(selectedRotation && selectedRotation !== 'ALL' && {
          rotations: [selectedRotation as 'R1' | 'R2' | 'R3' | 'R4']
        }),
        ...(questionType && questionType !== 'ALL' && {
          questionTypes: [questionType === 'MULTIPLE_CHOICE' ? 'MULTIPLE_CHOICES' : 'SINGLE_CHOICE'] as Array<'SINGLE_CHOICE' | 'MULTIPLE_CHOICES'>
        }),
      };

      // Validation: Verify payload matches required schema
      console.log('[ExamWizard] Session creation payload validation:', {
        title: sessionData.title,
        questionCount: sessionData.questionCount,
        courseIdsCount: sessionData.courseIds.length,
        courseIds: sessionData.courseIds,
        sessionType: sessionData.sessionType,
        hasUniversityFilter: !!sessionData.universityIds,
        hasSourceFilter: !!sessionData.questionSourceIds,
        hasYearFilter: !!sessionData.years,
        hasRotationFilter: !!sessionData.rotations,
        hasQuestionTypeFilter: !!sessionData.questionTypes,
        payloadSize: JSON.stringify(sessionData).length
      });

      // Final validation before sending
      if (!sessionData.title || sessionData.title.length < 3) {
        toast.error('Session title must be at least 3 characters long');
        return;
      }

      if (sessionData.questionCount < 1 || sessionData.questionCount > 100) {
        toast.error('Question count must be between 1 and 100');
        return;
      }

      if (sessionData.courseIds.length === 0) {
        toast.error('At least one course must be selected');
        return;
      }

      console.log('[ExamWizard] Creating EXAM session with validated payload:', sessionData);
      const created = await NewApiService.createQuizSession(sessionData);

      // Console log the full response to verify and inspect the response structure
      console.log('📋 [ExamWizard] Full session creation response:', {
        fullResponse: created,
        success: created?.success,
        data: created?.data,
        dataStructure: created?.data ? Object.keys(created.data) : 'null',
        sessionId: created?.data?.sessionId,  // <- Correct location according to docs
        wrongId: created?.data?.id,           // <- Wrong location
        nestedSessionId: created?.data?.data?.id, // <- Also wrong
        error: created?.error
      });

      // According to documentation, sessionId is at response.data.sessionId
      const sessionId = created?.data?.sessionId;

      if (sessionId) {
        console.log('✅ [ExamWizard] Session created successfully with ID:', sessionId);
        toast.success('Exam session created successfully');
        router.push(`/session/${sessionId}`);
        return;
      }

      console.error('❌ [ExamWizard] Session created but no sessionId found in response');
      toast.error('Session created but no sessionId returned');
    } catch (e: any) {
      console.error('Failed to create exam session:', e);

      // Provide more specific error messages
      if (e?.message?.includes('404')) {
        toast.error('The selected unite/module was not found. Please try selecting a different option.');
      } else if (e?.message?.includes('403')) {
        toast.error('You do not have permission to access questions for this unite/module.');
      } else if (e?.message?.includes('500')) {
        toast.error('Server error occurred. Please try again later.');
      } else {
        toast.error(e?.message || 'Failed to create exam session. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ApiErrorBoundary>
      <LoadingOverlay loading={loading} message="Creating exam session...">
        <Card className="quiz-card-enhanced">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 exam-icon" /> Create Exam Session
                </CardTitle>
                <p className="text-sm text-muted-foreground">Select a Unite (all modules) or an Independent Module - selecting one will automatically deselect the other</p>
              </div>

            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Available Questions</Label>
              <div className="text-sm text-muted-foreground">
                {availableCount} question{availableCount === 1 ? '' : 's'} match your filters
              </div>
            </div>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Unite Selection */}
            <div className="space-y-2">
              <Label>Unite (All modules)</Label>
              <Select
                value={selectedUnite ? String(selectedUnite.id) : ''}
                onValueChange={(value) => {
                  if (value) {
                    const unite = uniteOptions.find(u => u.id === Number(value));
                    if (unite) {
                      handleUniteSelection(unite);
                    }
                  } else {
                    handleUniteDeselection();
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    loading
                      ? 'Loading units...'
                      : 'Select Unit'
                  } />
                </SelectTrigger>
                <SelectContent>
                  {uniteOptions.map((unite) => (
                    <SelectItem key={unite.id} value={String(unite.id)}>
                      <div className="flex flex-col">
                        <span className="font-medium">{unite.name}</span>
                        <span className="text-xs text-muted-foreground">
                          All modules in this unit
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedUnite && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Selected: {selectedUnite.name}
                </p>
              )}
            </div>

            {/* Module Selection - Independent Modules Only */}
            <div className="space-y-2">
              <Label>Independent Module</Label>
              <p className="text-xs text-muted-foreground">Only independent modules are available for exam sessions</p>
              <Select
                value={selectedModule ? String(selectedModule.id) : ''}
                onValueChange={(value) => {
                  if (value) {
                    const module = moduleOptions.find(m => m.id === Number(value));
                    if (module) {
                      handleModuleSelection(module);
                    }
                  } else {
                    handleModuleDeselection();
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    loading
                      ? 'Loading independent modules...'
                      : 'Select Independent Module'
                  } />
                </SelectTrigger>
                <SelectContent>
                  {moduleOptions.map((module) => (
                    <SelectItem key={module.id} value={String(module.id)}>
                      <div className="flex flex-col">
                        <span className="font-medium">{module.name}</span>
                        <span className="text-xs text-muted-foreground">
                          Independent module
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedModule && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Selected: {selectedModule.name}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Step 3: Exam Session Filters */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Exam Session Filters</Label>
              <p className="text-sm text-muted-foreground">
                <span className="text-red-600 font-medium">Required:</span> University, Question Source, and Exam Year must be selected for exam sessions
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  University <span className="text-red-500">*</span>
                </Label>
                <Select value={selectedUniversity || "ALL"} onValueChange={(value) => setSelectedUniversity(value === "ALL" ? undefined : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={(selectedUnite || selectedModule) ? 'Select University (Required)' : 'Choose unite or module first'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL" disabled>Select a University (Required)</SelectItem>
                    {universities.map((u) => (
                      <SelectItem key={u.id} value={String(u.id)}>
                        <div className="flex flex-col">
                          <span>{u.name}</span>
                          <span className="text-xs text-muted-foreground">{u.country}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  Question Source <span className="text-red-500">*</span>
                </Label>
                <Select value={selectedSource || "ALL"} onValueChange={(value) => setSelectedSource(value === "ALL" ? undefined : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Question Source (Required)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL" disabled>Select a Question Source (Required)</SelectItem>
                    {questionSources.map((source) => (
                      <SelectItem key={source.id} value={String(source.id)}>
                        <div className="flex flex-col">
                          <span>{source.name}</span>
                          <span className="text-xs text-muted-foreground">Question source</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  Exam Year <span className="text-red-500">*</span>
                </Label>
                <Select value={selectedYear || "ALL"} onValueChange={(value) => setSelectedYear(value === "ALL" ? undefined : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Exam Year (Required)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL" disabled>Select an Exam Year (Required)</SelectItem>
                    {examYears.map((yearData) => (
                      <SelectItem key={yearData.year} value={String(yearData.year)}>
                        <div className="flex flex-col">
                          <span>{yearData.year}</span>
                          <span className="text-xs text-muted-foreground">Exam year</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Rotation</Label>
                <Select value={selectedRotation || "ALL"} onValueChange={(value) => setSelectedRotation(value === "ALL" ? undefined : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Rotations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Rotations</SelectItem>
                    {rotations.map((rotationData) => (
                      <SelectItem key={rotationData.rotation} value={rotationData.rotation}>
                        <div className="flex flex-col">
                          <span>{rotationData.rotation}</span>
                          <span className="text-xs text-muted-foreground">Residency rotation</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Question Type</Label>
                <Select value={questionType} onValueChange={(v) => setQuestionType(v as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Types</SelectItem>
                    <SelectItem value="SINGLE_CHOICE">Single Choice (QCS)</SelectItem>
                    <SelectItem value="MULTIPLE_CHOICE">Multiple Choice (QCM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
      </LoadingOverlay>
    </ApiErrorBoundary>
  );
}

