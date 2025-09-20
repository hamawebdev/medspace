"use client";

import React, { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from 'next/navigation';
// Card components removed - component is now wrapped by parent Card
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, GraduationCap } from "lucide-react";
import { useContentFilters, useQuizSessionFilters } from '@/hooks/use-content-filters';
import { useUserSubscriptions, selectEffectiveActiveSubscription } from '@/hooks/use-subscription';
import { useUniversitySelection, validateUniversitySelection } from '@/hooks/use-university-selection';
import { analyzeSessionCreationError, logErrorDetails, getUserErrorMessage, getSuggestedActions } from '@/utils/session-error-handler';
import { UniversitySelector } from '@/components/ui/university-selector';
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
  const [questionSources, setQuestionSources] = useState<Array<{ id: number; name: string; questionCount: number }>>([]);
  const [examYears, setExamYears] = useState<Array<{ year: number; questionCount: number }>>([]);
  const [rotations, setRotations] = useState<Array<{ rotation: string; questionCount: number }>>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [selectedSource, setSelectedSource] = useState<string | undefined>(undefined);
  const [selectedYear, setSelectedYear] = useState<string | undefined>(undefined);
  const [selectedRotation, setSelectedRotation] = useState<string | undefined>(undefined);

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
    universitySelection.clearSelection();
    setSelectedSource(undefined);
    setSelectedYear(undefined);
    setSelectedRotation(undefined);


  };

  const handleModuleSelection = (module: { id: number; name: string }) => {
    console.log('[ExamWizard] Independent module selected - automatically deselecting any selected unit:', {
      selectedModule: module.name,
      previousUnit: selectedUnite?.name
    });

    setSelectedModule(module);
    setSelectedUnite(undefined); // Auto-deselect unit when module is selected

    // Reset all filters when changing unite/module to ensure consistency
    universitySelection.clearSelection();
    setSelectedSource(undefined);
    setSelectedYear(undefined);
    setSelectedRotation(undefined);


  };

  const handleUniteDeselection = () => {
    console.log('[ExamWizard] Unit deselected - clearing all related filters');
    setSelectedUnite(undefined);
    universitySelection.clearSelection();
    setSelectedSource(undefined);
    setSelectedYear(undefined);
    setSelectedRotation(undefined);

  };

  const handleModuleDeselection = () => {
    console.log('[ExamWizard] Independent module deselected - clearing all related filters');
    setSelectedModule(undefined);
    universitySelection.clearSelection();
    setSelectedSource(undefined);
    setSelectedYear(undefined);
    setSelectedRotation(undefined);

  };

  // Step 1: Get Content Structure - Use content filters for unite/module structure
  const { filters: contentFilters } = useContentFilters();
  const { filters: sessionFilters, loading: sessionFiltersLoading, error: sessionFiltersError } = useQuizSessionFilters();
  const { subscriptions } = useUserSubscriptions();
  const { allowedYearLevels } = selectEffectiveActiveSubscription(subscriptions);
  const allowedYearLevelsKey = React.useMemo(() => (allowedYearLevels || []).join(','), [allowedYearLevels]);

  // University selection logic
  const universitySelection = useUniversitySelection({
    universities: sessionFilters?.universities || [],
    allowMultiple: false, // Exam sessions require single university selection
    required: true, // Universities are required for exam sessions
    initialSelection: []
  });

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
    const hasUniversitySelection = universitySelection.isValid && universitySelection.selectedUniversityIds.length > 0;
    const hasRequiredFilters = hasUniversitySelection &&
                              !!selectedSource && selectedSource !== 'ALL' &&
                              !!selectedYear && selectedYear !== 'ALL';

    console.log('🔍 [ExamWizard] Filter validation:', {
      hasSelection,
      hasRequiredFilters,
      selectedUnite: selectedUnite?.name,
      selectedModule: selectedModule?.name,
      selectedUniversityIds: universitySelection.selectedUniversityIds,
      selectedSource,
      selectedYear,
      isComplete: hasSelection && hasRequiredFilters
    });

    return hasSelection && hasRequiredFilters;
  }, [selectedUnite, selectedModule, universitySelection.isValid, universitySelection.selectedUniversityIds, selectedSource, selectedYear]);



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



  // Require a title, either unite or module selection, and required exam filters
  const canCreate = useMemo(() => {
    const hasTitle = title.trim().length >= 3;
    const hasSelection = !!selectedUnite || !!selectedModule;
    const hasUniversitySelection = universitySelection.isValid && universitySelection.selectedUniversityIds.length > 0;
    const hasRequiredFilters = hasUniversitySelection &&
                              !!selectedSource && selectedSource !== 'ALL' &&
                              !!selectedYear && selectedYear !== 'ALL';

    return hasTitle && hasSelection && hasRequiredFilters;
  }, [title, selectedUnite, selectedModule, universitySelection.isValid, universitySelection.selectedUniversityIds, selectedSource, selectedYear]);

  const handleCreate = async () => {
    try {
      if (!selectedUnite && !selectedModule) {
        toast.error('Please select either a Unite or Module');
        return;
      }
      setLoading(true);

      // Step 1: Extract course IDs from content filters
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

      // Step 2: Validate required fields for EXAM sessions
      if (!selectedYear || selectedYear === 'ALL') {
        toast.error('Please select a specific exam year for the exam session');
        return;
      }

      // Validation: University selection is required for exam sessions
      const universityValidation = validateUniversitySelection(universitySelection, 'EXAM');
      if (!universityValidation.isValid) {
        toast.error(universityValidation.errorMessage || 'Please select a university for the exam session');
        return;
      }

      if (!selectedSource || selectedSource === 'ALL') {
        toast.error('Please select a specific question source for the exam session');
        return;
      }

      // Step 3: Create session using new endpoint directly
      const sessionData = {
        title: title.trim() || 'Custom Exam Session',
        courseIds: finalCourseIds,
        sessionType: 'EXAM' as const,
        // Fixed question types for EXAM sessions as per requirements
        questionTypes: ['SINGLE_CHOICE', 'MULTIPLE_CHOICE'] as Array<'SINGLE_CHOICE' | 'MULTIPLE_CHOICE'>,
        // Required fields for EXAM sessions (exactly one item each)
        years: [Number(selectedYear)],
        universityIds: universitySelection.selectedUniversityIds,
        questionSourceIds: [Number(selectedSource)],
        // Optional rotations field - default to empty array if not selected
        rotations: (selectedRotation && selectedRotation !== 'ALL')
          ? [selectedRotation as 'R1' | 'R2' | 'R3' | 'R4']
          : []
      };

      // Validation: Verify payload matches required schema
      console.log('[ExamWizard] Session creation payload validation:', {
        title: sessionData.title,
        courseIdsCount: sessionData.courseIds.length,
        courseIds: sessionData.courseIds,
        sessionType: sessionData.sessionType,
        questionTypes: sessionData.questionTypes,
        years: sessionData.years,
        universityIds: sessionData.universityIds,
        questionSourceIds: sessionData.questionSourceIds,
        rotations: sessionData.rotations,
        payloadSize: JSON.stringify(sessionData).length,
        universitySelectionState: {
          isValid: universitySelection.isValid,
          selectedCount: universitySelection.selectedUniversityIds.length,
          availableCount: universitySelection.availableUniversities.length
        }
      });

      // Final validation before sending
      if (!sessionData.title || sessionData.title.length < 3) {
        toast.error('Session title must be at least 3 characters long');
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
        sessionId: created?.data?.sessionId,
        error: created?.error
      });

      // Check if the API returned an error response
      if (!created || !created.success) {
        const errorDetails = analyzeSessionCreationError(created, 'EXAM');
        logErrorDetails(errorDetails, 'Exam Session Creation');

        const userMessage = getUserErrorMessage(errorDetails);
        const suggestedActions = getSuggestedActions(errorDetails);

        // Show user-friendly error message
        toast.error(userMessage);

        // Log suggested actions for user guidance
        console.log('💡 [ExamWizard] Suggested actions for user:', suggestedActions);

        return;
      }

      // According to documentation, sessionId is at response.data.sessionId
      const sessionId = created?.data?.sessionId;

      if (sessionId) {
        console.log('✅ [ExamWizard] Session created successfully with ID:', sessionId);

        // Step 4: Fetch the complete session data using GET /quiz-sessions/{sessionId}
        try {
          const sessionResponse = await NewApiService.getQuizSession(sessionId);
          if (sessionResponse.success && sessionResponse.data) {
            console.log('📋 [ExamWizard] Session data retrieved:', sessionResponse.data);
            toast.success('Exam session created successfully');
            router.push(`/session/${sessionId}`);
            return;
          } else {
            console.warn('⚠️ [ExamWizard] Failed to retrieve session data, but session was created');
            toast.success('Exam session created successfully');
            router.push(`/session/${sessionId}`);
            return;
          }
        } catch (sessionError) {
          console.warn('⚠️ [ExamWizard] Error retrieving session data:', sessionError);
          toast.success('Exam session created successfully');
          router.push(`/session/${sessionId}`);
          return;
        }
      }

      console.error('❌ [ExamWizard] Session created but no sessionId found in response');
      toast.error('Session created but no sessionId returned');
    } catch (e: any) {
      console.error('💥 [ExamWizard] Exception during session creation:', e);

      // Use comprehensive error analysis
      const errorDetails = analyzeSessionCreationError(e, 'EXAM');
      logErrorDetails(errorDetails, 'Exam Session Creation Exception');

      const userMessage = getUserErrorMessage(errorDetails);
      const suggestedActions = getSuggestedActions(errorDetails);

      // Show user-friendly error message
      toast.error(userMessage);

      // Log suggested actions for debugging
      console.log('💡 [ExamWizard] Suggested actions for user:', suggestedActions);

      // TODO: Implement UI highlighting for problematic fields
      // const highlightFields = getHighlightFields(errorDetails);
      // if (highlightFields.length > 0) {
      //   console.log('🎯 [ExamWizard] Fields to highlight:', highlightFields);
      // }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ApiErrorBoundary>
      <LoadingOverlay loading={loading} message="Creating exam session...">
        <div>
          {/* Header Section */}
          <div className="px-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div>
               
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="space-y-6 px-4 sm:px-6 pb-4 sm:pb-6">

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
              
            </div>

            <div className="space-y-4">
              <UniversitySelector
                universitySelection={universitySelection}
                allowMultiple={false}
                required={true}
                loading={sessionFiltersLoading}
                label="Université"
                sessionType="EXAM"
              />

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

              {/* Conditional Rotations dropdown - only show if rotations are available */}
              {rotations.length > 0 && (
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
              )}


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
          </div>
        </div>
      </LoadingOverlay>
    </ApiErrorBoundary>
  );
}

