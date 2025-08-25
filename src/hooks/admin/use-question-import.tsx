import { useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import {
  QuestionFiltersResponse,
  BulkQuestionImportPayload,
  BulkQuestionImportResponse,
  HierarchyData,
  SelectionState,
  University,
  Unit,
  Module,
  Course,
  ImportProgress,
  ImportWizardStep
} from '@/types/question-import';
import { apiClient } from '@/lib/api-client';

// Extended StudyPack type with unites
type ExtendedStudyPack = StudyPack & {
  unites?: Array<{
    id: number;
    name: string;
    description: string;
    logoUrl?: string;
    modules?: Array<{
      id: number;
      name: string;
      description: string;
      courses?: Array<{
        id: number;
        name: string;
        description: string;
      }>;
    }>;
  }>;
};

export function useQuestionImport() {
  const [loading, setLoading] = useState(false);
  const [filtersData, setFiltersData] = useState<QuestionFiltersResponse | null>(null);
  const [studyPacksData, setStudyPacksData] = useState<ExtendedStudyPack[]>([]);
  const [selection, setSelection] = useState<SelectionState>({});
  const [progress, setProgress] = useState<ImportProgress>({
    step: 'selecting',
    message: 'Select hierarchy to begin import',
    progress: 0
  });

  // Fetch hierarchy filters data
  const fetchFilters = useCallback(async () => {
    setLoading(true);
    setProgress({
      step: 'selecting',
      message: 'Loading hierarchy data...',
      progress: 5
    });

    try {
      // Fetch both question filters and study packs
      const [filtersResponse, studyPacksResponse] = await Promise.all([
        apiClient.get<QuestionFiltersResponse['data']>('/admin/questions/filters'),
        apiClient.get<{ studyPacks: StudyPack[] }>('/admin/study-packs')
      ]);

      if (filtersResponse.success) {
        const filtersData: QuestionFiltersResponse = {
          success: true,
          data: filtersResponse.data,
          meta: {
            timestamp: new Date().toISOString(),
            requestId: Math.random().toString(36).substring(7)
          }
        };
        setFiltersData(filtersData);
      }

      if (studyPacksResponse.success) {
        setStudyPacksData(studyPacksResponse.data.studyPacks || []);
      }

      setProgress({
        step: 'selecting',
        message: 'Ready to select hierarchy',
        progress: 10
      });
    } catch (error) {
      let errorMessage = 'Failed to fetch hierarchy data';

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      console.error('Filter fetch error:', error);
      toast.error(`Unable to load hierarchy data: ${errorMessage}`);
      setProgress({
        step: 'error',
        message: 'Failed to load hierarchy data',
        progress: 0,
        error: errorMessage
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Process hierarchy data for progressive selection
  const hierarchyData = useMemo<HierarchyData>(() => {
    if (!filtersData) {
      return {
        universities: [],
        studyPacks: [],
        examYears: [],
        units: [],
        modules: [],
        courses: []
      };
    }

    const { courses, universities, examYears } = filtersData.data.filters;

    // Extract unique units from study packs (not from courses)
    const unitsMap = new Map<number, Unit>();
    const modulesMap = new Map<number, Module>();

    // Get units from study packs data
    studyPacksData.forEach(studyPack => {
      if (studyPack.unites && Array.isArray(studyPack.unites)) {
        studyPack.unites.forEach(unit => {
          if (!unitsMap.has(unit.id)) {
            // Convert StudyPackUnit to Unit format
            unitsMap.set(unit.id, {
              id: unit.id,
              studyPackId: studyPack.id,
              name: unit.name,
              description: unit.description,
              logoUrl: unit.logoUrl,
              createdAt: new Date().toISOString(), // Fallback
              updatedAt: new Date().toISOString()  // Fallback
            });
          }

          // Also extract modules from units
          if (unit.modules && Array.isArray(unit.modules)) {
            unit.modules.forEach(module => {
              if (!modulesMap.has(module.id)) {
                modulesMap.set(module.id, {
                  id: module.id,
                  uniteId: unit.id,
                  name: module.name,
                  description: module.description,
                  createdAt: new Date().toISOString(), // Fallback
                  updatedAt: new Date().toISOString(), // Fallback
                  unite: {
                    id: unit.id,
                    studyPackId: studyPack.id,
                    name: unit.name,
                    description: unit.description,
                    logoUrl: unit.logoUrl,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  }
                });
              }
            });
          }
        });
      }
    });

    // Also extract modules from courses (for backward compatibility)
    courses.forEach(course => {
      const module = course.module;
      const unit = module.unite;

      if (!unitsMap.has(unit.id)) {
        unitsMap.set(unit.id, unit);
      }

      if (!modulesMap.has(module.id)) {
        modulesMap.set(module.id, module);
      }
    });

    return {
      universities,
      studyPacks: studyPacksData,
      examYears,
      units: Array.from(unitsMap.values()),
      modules: Array.from(modulesMap.values()),
      courses
    };
  }, [filtersData, studyPacksData]);

  // Get filtered options based on current selection
  const getAvailableOptions = useCallback(() => {
    if (!filtersData) return { universities: [], studyPacks: [], examYears: [], units: [], modules: [], courses: [] };

    const { courses } = filtersData.data.filters;

    // Filter based on current selection
    let filteredCourses = courses;
    let filteredStudyPacks = hierarchyData.studyPacks;
    let filteredUnits = hierarchyData.units;

    // Filter study packs by university (if there's a relationship)
    if (selection.university) {
      // For now, show all study packs since there's no direct university-studypack relationship in the API
      filteredStudyPacks = hierarchyData.studyPacks;
    }

    // Filter units by study pack
    if (selection.studyPack) {
      filteredUnits = hierarchyData.units.filter(unit =>
        unit.studyPackId === selection.studyPack!.id
      );
    }

    if (selection.unit) {
      filteredCourses = filteredCourses.filter(course =>
        course.module.unite.id === selection.unit!.id
      );
    }

    if (selection.module) {
      filteredCourses = filteredCourses.filter(course =>
        course.module.id === selection.module!.id
      );
    }

    // Extract available modules from filtered courses
    const availableModules = selection.unit
      ? hierarchyData.modules.filter(module => module.unite.id === selection.unit!.id)
      : hierarchyData.modules;

    return {
      universities: hierarchyData.universities,
      studyPacks: filteredStudyPacks,
      examYears: hierarchyData.examYears,
      units: filteredUnits,
      modules: availableModules,
      courses: filteredCourses
    };
  }, [filtersData, selection, hierarchyData]);

  // Update selection and progress
  const updateSelection = useCallback((key: keyof SelectionState, value: any) => {
    setSelection(prev => {
      const newSelection = { ...prev, [key]: value };
      
      // Clear dependent selections
      if (key === 'university') {
        delete newSelection.studyPack;
        delete newSelection.unit;
        delete newSelection.module;
        delete newSelection.course;
      } else if (key === 'studyPack') {
        delete newSelection.unit;
        delete newSelection.module;
        delete newSelection.course;
      } else if (key === 'unit') {
        delete newSelection.module;
        delete newSelection.course;
      } else if (key === 'module') {
        delete newSelection.course;
      }
      
      return newSelection;
    });

    // Update progress based on selection completeness
    const progressValue = calculateSelectionProgress({ ...selection, [key]: value });
    setProgress(prev => ({
      ...prev,
      progress: progressValue,
      message: getProgressMessage(progressValue)
    }));
  }, [selection]);

  // Calculate selection progress
  const calculateSelectionProgress = useCallback((currentSelection: SelectionState): number => {
    let progress = 10; // Base progress for loading filters

    if (currentSelection.university) progress += 15;
    if (currentSelection.studyPack) progress += 15;
    if (currentSelection.unit) progress += 15;
    if (currentSelection.module) progress += 15;
    if (currentSelection.course) progress += 30; // Course selection is most important

    return progress;
  }, []);

  // Get progress message
  const getProgressMessage = useCallback((progressValue: number): string => {
    if (progressValue <= 10) return 'Select hierarchy to begin import';
    if (progressValue <= 25) return 'Continue selecting hierarchy...';
    if (progressValue <= 55) return 'Almost there, select remaining options...';
    if (progressValue <= 85) return 'Ready to import questions';
    return 'All selections complete, ready for JSON input';
  }, []);

  // Generate wizard steps
  const wizardSteps = useMemo<ImportWizardStep[]>(() => {
    const progressValue = calculateSelectionProgress(selection);
    
    return [
      {
        id: 'university',
        title: 'University',
        description: 'Select target university',
        completed: !!selection.university,
        active: !selection.university && progressValue >= 10
      },
      {
        id: 'examYear',
        title: 'Exam Year',
        description: 'Choose exam year',
        completed: !!selection.examYear,
        active: !!selection.university && !selection.examYear
      },
      {
        id: 'unit',
        title: 'Unit',
        description: 'Select study unit',
        completed: !!selection.unit,
        active: !!selection.examYear && !selection.unit
      },
      {
        id: 'module',
        title: 'Module',
        description: 'Choose module',
        completed: !!selection.module,
        active: !!selection.unit && !selection.module
      },
      {
        id: 'course',
        title: 'Course',
        description: 'Select target course',
        completed: !!selection.course,
        active: !!selection.module && !selection.course
      },
      {
        id: 'import',
        title: 'Import',
        description: 'Add questions JSON',
        completed: progress.step === 'completed',
        active: !!selection.course && progress.step !== 'completed'
      }
    ];
  }, [selection, progress.step, calculateSelectionProgress]);

  // Bulk import questions
  const importQuestions = useCallback(async (questions: any[]): Promise<BulkQuestionImportResponse | null> => {
    if (!selection.course) {
      toast.error('Please complete hierarchy selection first');
      return null;
    }

    if (!questions || questions.length === 0) {
      toast.error('No valid questions to import');
      return null;
    }

    setProgress({
      step: 'importing',
      message: `Importing ${questions.length} questions...`,
      progress: 85
    });

    try {
      const payload: BulkQuestionImportPayload = {
        metadata: {
          courseId: selection.course.id,
          universityId: selection.university?.id,
          examYear: selection.examYear
        },
        questions
      };

      // Add a small delay to show progress
      await new Promise(resolve => setTimeout(resolve, 500));

      setProgress({
        step: 'importing',
        message: 'Processing questions...',
        progress: 95
      });

      const response = await apiClient.post<BulkQuestionImportResponse['data']>('/admin/questions/bulk', payload);

      if (response.success) {
        const result: BulkQuestionImportResponse = {
          success: true,
          data: response.data
        };

        setProgress({
          step: 'completed',
          message: `Successfully imported ${response.data.totalCreated} questions`,
          progress: 100
        });

        toast.success(`🎉 Successfully imported ${response.data.totalCreated} questions!`);
        return result;
      } else {
        throw new Error(response.error || 'Failed to import questions');
      }
    } catch (error) {
      let errorMessage = 'Failed to import questions';

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      console.error('Import error:', error);

      setProgress({
        step: 'error',
        message: 'Import failed',
        progress: 85,
        error: errorMessage
      });

      toast.error(`Import failed: ${errorMessage}`);
      return null;
    }
  }, [selection]);

  // Reset wizard
  const resetWizard = useCallback(() => {
    setSelection({});
    setProgress({
      step: 'selecting',
      message: 'Select hierarchy to begin import',
      progress: 10
    });
  }, []);

  // Check if ready for import
  const isReadyForImport = useMemo(() => {
    return !!(selection.university && selection.examYear && selection.unit && selection.module && selection.course);
  }, [selection]);

  return {
    loading,
    filtersData,
    hierarchyData,
    selection,
    progress,
    wizardSteps,
    isReadyForImport,
    fetchFilters,
    updateSelection,
    getAvailableOptions,
    importQuestions,
    resetWizard
  };
}
