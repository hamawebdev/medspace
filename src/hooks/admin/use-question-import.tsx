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
  IndependentModule,
  Course,
  ImportProgress,
  ImportWizardStep
} from '@/types/question-import';
import { apiClient } from '@/lib/api-client';
import { UniversityService } from '@/lib/api-services';

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
      // Fetch content filters, study packs, and universities separately for better data freshness
      const [filtersResponse, studyPacksResponse, universitiesResponse] = await Promise.all([
        apiClient.get<QuestionFiltersResponse['data']>('/admin/content/filters'),
        apiClient.get<{ studyPacks: StudyPack[] }>('/admin/study-packs'),
        UniversityService.getUniversities()
      ]);

      if (filtersResponse.success && universitiesResponse.success) {
        // Extract universities from the nested response structure
        // API returns: { success: true, data: { universities: [...] } }
        const universitiesData = universitiesResponse.data?.universities || [];

        // Log the university data for debugging
        console.log('🏫 [useQuestionImport] Fresh university data:', {
          count: universitiesData.length,
          universities: universitiesData.map(u => ({ id: u.id, name: u.name, country: u.country }))
        });

        // Merge the fresh university data with the filters data
        const filtersData: QuestionFiltersResponse = {
          success: true,
          data: {
            ...filtersResponse.data,
            filters: {
              ...filtersResponse.data.filters,
              // Use fresh university data from the dedicated endpoint
              universities: universitiesData
            }
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: Math.random().toString(36).substring(7)
          }
        };

        // Validate the data structure - handle both single and double-nested responses
        const hasValidStructure = filtersData.data && (
          filtersData.data.data || // Double-nested structure
          filtersData.data.filters || // Single-nested with filters
          filtersData.data.unites !== undefined || // Direct structure
          filtersData.data.independentModules !== undefined
        );

        if (!hasValidStructure) {
          console.error('🚨 [useQuestionImport] Invalid API response structure:', filtersData);
          toast.error('Invalid API response structure. Please contact support.');
          setProgress({
            step: 'error',
            message: 'Invalid API response structure',
            progress: 0,
            error: 'API returned unexpected data format'
          });
          return;
        }

        // Debug: Log the data structure to understand what we're getting
        console.log('🔍 [useQuestionImport] API Response Structure:', {
          hasData: !!filtersData.data,
          hasNestedData: !!(filtersData.data && filtersData.data.data),
          hasFilters: !!(filtersData.data && filtersData.data.filters),
          hasUnites: !!(filtersData.data && filtersData.data.unites),
          hasIndependentModules: !!(filtersData.data && filtersData.data.independentModules),
          nestedUnites: !!(filtersData.data && filtersData.data.data && filtersData.data.data.unites),
          nestedIndependentModules: !!(filtersData.data && filtersData.data.data && filtersData.data.data.independentModules),
          unitesCount: filtersData.data?.unites?.length || filtersData.data?.data?.unites?.length || 0,
          independentModulesCount: filtersData.data?.independentModules?.length || filtersData.data?.data?.independentModules?.length || 0
        });

        setFiltersData(filtersData);
      } else {
        console.error('🚨 [useQuestionImport] Failed to fetch data:', {
          filtersSuccess: filtersResponse.success,
          universitiesSuccess: universitiesResponse.success,
          filtersError: filtersResponse.error,
          universitiesError: universitiesResponse.error
        });

        // If universities failed but filters succeeded, still set filters data with empty universities
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
          toast.error('Failed to load universities. Please refresh the page.');
        }
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
        independentModules: [],
        courses: []
      };
    }

    // Handle the double-nested response structure: data.data.{unites, independentModules}
    const innerData = filtersData.data.data || filtersData.data || {};
    const { unites = [], independentModules = [] } = innerData;

    // For backward compatibility, try to get filters from various possible locations
    const filtersData_inner = filtersData.data.filters || innerData.filters || {};
    const { courses = [], universities = [], examYears = [] } = filtersData_inner;

    // Debug: Log what data we extracted
    console.log('🔍 [useQuestionImport] Extracted Data:', {
      unitesCount: unites.length,
      independentModulesCount: independentModules.length,
      coursesCount: courses.length,
      universitiesCount: universities.length,
      examYearsCount: examYears.length,
      sampleIndependentModule: independentModules[0] ? {
        id: independentModules[0].id,
        name: independentModules[0].name,
        studyPackId: independentModules[0].studyPackId
      } : null
    });

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
      independentModules,
      courses
    };
  }, [filtersData, studyPacksData]);

  // Get filtered options based on current selection
  const getAvailableOptions = useCallback(() => {
    if (!filtersData) return { universities: [], studyPacks: [], examYears: [], units: [], modules: [], independentModules: [], courses: [] };

    const { courses } = filtersData.data.filters;

    // Filter based on current selection
    let filteredCourses = courses;
    let filteredStudyPacks = hierarchyData.studyPacks;
    let filteredUnits = hierarchyData.units;
    let filteredIndependentModules = hierarchyData.independentModules;

    // Filter study packs by university (if there's a relationship)
    if (selection.university) {
      // For now, show all study packs since there's no direct university-studypack relationship in the API
      filteredStudyPacks = hierarchyData.studyPacks;
    }

    // Filter units and independent modules by study pack
    if (selection.studyPack) {
      filteredUnits = hierarchyData.units.filter(unit =>
        unit.studyPackId === selection.studyPack!.id
      );
      filteredIndependentModules = hierarchyData.independentModules.filter(module =>
        module.studyPackId === selection.studyPack!.id
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

    // Handle independent module selection for courses
    if (selection.independentModule) {
      // For independent modules, we need to get courses directly from the module
      // Since the courses array from filters might not include independent module courses
      filteredCourses = selection.independentModule.courses.map(course => ({
        ...course,
        moduleId: selection.independentModule!.id,
        createdAt: selection.independentModule!.createdAt,
        updatedAt: selection.independentModule!.updatedAt,
        module: {
          id: selection.independentModule!.id,
          uniteId: null, // Independent modules don't have a unit
          name: selection.independentModule!.name,
          description: selection.independentModule!.description,
          createdAt: selection.independentModule!.createdAt,
          updatedAt: selection.independentModule!.updatedAt,
          unite: null as any // Independent modules don't have a unit
        }
      }));
    }

    // Extract available modules from filtered courses
    const availableModules = selection.unit
      ? hierarchyData.modules.filter(module => module.unite.id === selection.unit!.id)
      : hierarchyData.modules;

    const result = {
      universities: hierarchyData.universities,
      studyPacks: filteredStudyPacks,
      examYears: hierarchyData.examYears,
      units: filteredUnits,
      modules: availableModules,
      independentModules: filteredIndependentModules,
      courses: filteredCourses
    };

    // Debug: Log available options
    console.log('🔍 [useQuestionImport] Available Options:', {
      currentStep: selection.studyPack ? 'after-studypack' : 'before-studypack',
      selectedStudyPackId: selection.studyPack?.id,
      unitesCount: result.units.length,
      independentModulesCount: result.independentModules.length,
      totalHierarchyIndependentModules: hierarchyData.independentModules.length,
      sampleIndependentModule: result.independentModules[0] ? {
        id: result.independentModules[0].id,
        name: result.independentModules[0].name,
        studyPackId: result.independentModules[0].studyPackId
      } : null
    });

    return result;
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
        delete newSelection.independentModule;
        delete newSelection.course;
      } else if (key === 'studyPack') {
        delete newSelection.unit;
        delete newSelection.module;
        delete newSelection.independentModule;
        delete newSelection.course;
      } else if (key === 'unit') {
        delete newSelection.module;
        delete newSelection.independentModule;
        delete newSelection.course;
      } else if (key === 'module') {
        delete newSelection.independentModule;
        delete newSelection.course;
      } else if (key === 'independentModule') {
        delete newSelection.unit;
        delete newSelection.module;
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

    // Either unit+module OR independent module path
    if (currentSelection.unit) progress += 15;
    if (currentSelection.module) progress += 15;
    if (currentSelection.independentModule) progress += 30; // Independent module replaces unit+module

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
