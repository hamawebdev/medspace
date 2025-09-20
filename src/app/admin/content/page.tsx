// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Database,
  School,
  Calendar,
  BookOpen,
  Layers,
  GraduationCap,
  ChevronRight,
  ArrowLeft,
  Upload,
  Plus,
  CheckCircle,
  Edit,
  Trash2
} from 'lucide-react';
import { useQuestionImport } from '@/hooks/admin/use-question-import';
import { useQuestionManagement } from '@/hooks/admin/use-question-management';
import { JsonQuestionInput } from '@/components/admin/content/json-question-input';
import { ImportUsageGuide } from '@/components/admin/content/import-usage-guide';
import { AddEntityDialog } from '@/components/admin/content/add-entity-dialog';
import { EntityCard } from '@/components/admin/content/entity-card';
import { EditEntityDialog } from '@/components/admin/content/edit-entity-dialog';
import { CourseSpecificQuestionDialog } from '@/components/admin/questions/course-specific-question-dialog';
import { BulkQuestionImportResponse, SelectionState, ImportQuestion, ValidationResult } from '@/types/question-import';

import { toast } from 'sonner';

type Step = 'university' | 'studyPack' | 'unit' | 'module' | 'course' | 'courseActions' | 'import';

export default function AdminContentPage() {
  const [currentStep, setCurrentStep] = useState<Step>('university');
  const [showUsageGuide, setShowUsageGuide] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [validation, setValidation] = useState<ValidationResult>({
    isValid: false,
    errors: [],
    warnings: [],
    questionCount: 0
  });
  const [parsedQuestions, setParsedQuestions] = useState<ImportQuestion[]>([]);
  const [importing, setImporting] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addEntityType, setAddEntityType] = useState<'university' | 'studyPack' | 'unit' | 'module' | 'course'>('university');
  const [selectedExamYear, setSelectedExamYear] = useState<number | undefined>(undefined);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editEntity, setEditEntity] = useState<any>(null);
  const [editEntityType, setEditEntityType] = useState<'university' | 'studyPack' | 'unit' | 'module' | 'course'>('university');
  const [customYearInput, setCustomYearInput] = useState<string>('');
  const [showCreateQuestionDialog, setShowCreateQuestionDialog] = useState(false);

  const {
    loading,
    selection,
    fetchFilters,
    updateSelection,
    getAvailableOptions,
    importQuestions,
    resetWizard
  } = useQuestionImport();

  // Question management hook
  const { createQuestion } = useQuestionManagement();

  // Load filters on mount
  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  // Get available options based on current selection
  const availableOptions = getAvailableOptions();

  // Handle card selection
  const handleCardSelection = (type: keyof SelectionState, value: any) => {
    updateSelection(type, value);

    // Move to next step
    switch (type) {
      case 'university':
        setCurrentStep('studyPack');
        break;
      case 'studyPack':
        setCurrentStep('unit');
        break;
      case 'unit':
        setCurrentStep('module');
        break;
      case 'module':
        setCurrentStep('course');
        break;
      case 'independentModule':
        setCurrentStep('course');
        break;
      case 'course':
        setCurrentStep('courseActions');
        break;
    }
  };

  // Handle going back
  const handleGoBack = () => {
    switch (currentStep) {
      case 'studyPack':
        updateSelection('university', undefined);
        setCurrentStep('university');
        break;
      case 'unit':
        updateSelection('studyPack', undefined);
        setCurrentStep('studyPack');
        break;
      case 'module':
        updateSelection('unit', undefined);
        setCurrentStep('unit');
        break;
      case 'course':
        if (selection.independentModule) {
          updateSelection('independentModule', undefined);
        } else {
          updateSelection('module', undefined);
        }
        setCurrentStep(selection.unit ? 'module' : 'unit');
        break;
      case 'import':
        updateSelection('course', undefined);
        setCurrentStep('course');
        break;
    }
  };

  // Handle successful question import
  const handleImportComplete = (result: BulkQuestionImportResponse) => {
    toast.success(`Successfully imported ${result.data.totalCreated} questions!`);
    // Reset to start
    resetWizard();
    setCurrentStep('university');
    setJsonInput('');
    setParsedQuestions([]);
    setSelectedExamYear(undefined);
    setValidation({
      isValid: false,
      errors: [],
      warnings: [],
      questionCount: 0
    });
  };

  // Handle validation results from JsonQuestionInput component
  const handleValidationResult = (validationResult: ValidationResult) => {
    setValidation(validationResult);
  };

  // Handle input change
  const handleInputChange = (newValue: string) => {
    setJsonInput(newValue);

    // Reset validation and questions if input is empty
    if (!newValue.trim()) {
      setValidation({
        isValid: false,
        errors: [],
        warnings: [],
        questionCount: 0
      });
      setParsedQuestions([]);
    }
  };

  // Handle JSON validation (for the component)
  const handleJsonValidation = (questions: ImportQuestion[]) => {
    setParsedQuestions(questions);
  };

  // Handle add entity
  const handleAddEntity = (entityType: 'university' | 'studyPack' | 'unit' | 'module' | 'course') => {
    setAddEntityType(entityType);
    setShowAddDialog(true);
  };

  // Handle add entity success
  const handleAddEntitySuccess = () => {
    // Refresh the filters to get the new entity
    fetchFilters();
  };

  // Handle edit entity
  const handleEditEntity = (entity: any, entityType: 'university' | 'studyPack' | 'unit' | 'module' | 'course') => {
    setEditEntity(entity);
    setEditEntityType(entityType);
    setShowEditDialog(true);
  };

  // Handle edit entity success
  const handleEditEntitySuccess = () => {
    // Refresh the filters to get the updated entity
    fetchFilters();
  };

  // Handle delete entity
  const handleDeleteEntity = (entityId: number) => {
    // Refresh the filters to remove the deleted entity
    fetchFilters();
  };

  // Handle add question dialog
  const handleAddQuestion = () => {
    if (selection.course) {
      setShowCreateQuestionDialog(true);
    }
  };

  // Handle question creation
  const handleCreateQuestion = async (questionData: any) => {
    try {
      await createQuestion(questionData);
      setShowCreateQuestionDialog(false);
      toast.success('Question created successfully!');
    } catch (error) {
      console.error('Failed to create question:', error);
      toast.error('Failed to create question');
    }
  };

  // Handle custom year confirmation
  const handleCustomYearConfirm = () => {
    const year = parseInt(customYearInput);
    if (year >= 2000 && year <= 2030) {
      setSelectedExamYear(year);
      setCustomYearInput('');
    }
  };

  // Get parent ID for entity creation
  const getParentId = () => {
    switch (addEntityType) {
      case 'unit':
        return selection.studyPack?.id;
      case 'module':
        return selection.unit?.id;
      case 'course':
        return selection.module?.id;
      default:
        return undefined;
    }
  };

  // Handle import
  const handleImport = async () => {
    if (!validation.isValid || parsedQuestions.length === 0 || !selectedExamYear || selectedExamYear === -1) {
      toast.error('Please select an exam year and provide valid questions');
      return;
    }

    if (!selection.course) {
      toast.error('Please complete the hierarchy selection first');
      return;
    }

    setImporting(true);
    try {
      // Import using hook API to avoid client-side class method issues
      const result = await importQuestions(parsedQuestions);
      if (result) {
        handleImportComplete(result);
      } else {
        throw new Error('Failed to import questions');
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import questions');
    } finally {
      setImporting(false);
    }
  };

  // Get step info
  const getStepInfo = () => {
    switch (currentStep) {
      case 'university':
        return {
          title: 'Select University',
          description: 'Choose the university for your questions',
          icon: School
        };
      case 'studyPack':
        return {
          title: 'Select Study Pack',
          description: `Choose the study pack for ${selection.university?.name}`,
          icon: BookOpen
        };
      case 'unit':
        return {
          title: 'Select Unit or Independent Module',
          description: `Choose a unit or independent module from ${selection.studyPack?.name}`,
          icon: Layers
        };
      case 'module':
        return {
          title: 'Select Module',
          description: `Choose the module from ${selection.unit?.name}`,
          icon: GraduationCap
        };
      case 'course':
        return {
          title: 'Select Course',
          description: `Choose the course from ${selection.module?.name || selection.independentModule?.name}`,
          icon: Database
        };
      case 'courseActions':
        return {
          title: 'Course Actions',
          description: `Choose an action for ${selection.course?.name}`,
          icon: BookOpen
        };
      case 'import':
        return {
          title: 'Import Questions',
          description: `Import questions for ${selection.course?.name}`,
          icon: Upload
        };
    }
  };

  const stepInfo = getStepInfo();
  const StepIcon = stepInfo.icon;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
      {/* Header with Breadcrumbs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Question Import Center</h1>
            <p className="text-muted-foreground">
              Import questions using our progressive drill-down selection system
            </p>
          </div>
          {currentStep !== 'university' && (
            <Button variant="outline" onClick={handleGoBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}
        </div>



        {/* Breadcrumbs */}
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <button
            onClick={() => setCurrentStep('university')}
            className={`hover:text-foreground transition-colors ${currentStep === 'university' ? 'text-foreground font-medium' : ''}`}
          >
            University
          </button>
          {selection.university && (
            <>
              <ChevronRight className="h-4 w-4" />
              <button
                onClick={() => setCurrentStep('studyPack')}
                className={`hover:text-foreground transition-colors ${currentStep === 'studyPack' ? 'text-foreground font-medium' : ''}`}
              >
                Study Pack
              </button>
            </>
          )}
          {selection.studyPack && (
            <>
              <ChevronRight className="h-4 w-4" />
              <button
                onClick={() => setCurrentStep('unit')}
                className={`hover:text-foreground transition-colors ${currentStep === 'unit' ? 'text-foreground font-medium' : ''}`}
              >
                {selection.independentModule ? 'Independent Module' : 'Unit'}
              </button>
            </>
          )}
          {selection.unit && (
            <>
              <ChevronRight className="h-4 w-4" />
              <button
                onClick={() => setCurrentStep('module')}
                className={`hover:text-foreground transition-colors ${currentStep === 'module' ? 'text-foreground font-medium' : ''}`}
              >
                Module
              </button>
            </>
          )}
          {(selection.module || selection.independentModule) && (
            <>
              <ChevronRight className="h-4 w-4" />
              <button
                onClick={() => setCurrentStep('course')}
                className={`hover:text-foreground transition-colors ${currentStep === 'course' ? 'text-foreground font-medium' : ''}`}
              >
                Course
              </button>
            </>
          )}
          {selection.course && (
            <>
              <ChevronRight className="h-4 w-4" />
              <button
                onClick={() => setCurrentStep('import')}
                className={`hover:text-foreground transition-colors ${currentStep === 'import' ? 'text-foreground font-medium' : ''}`}
              >
                Import
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Step Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <StepIcon className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">{stepInfo.title}</h2>
          </div>
          <p className="text-muted-foreground">{stepInfo.description}</p>

          {/* Add Entity Button */}
          {currentStep !== 'import' && (
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  switch (currentStep) {
                    case 'university':
                      handleAddEntity('university');
                      break;
                    case 'studyPack':
                      handleAddEntity('studyPack');
                      break;
                    case 'unit':
                      handleAddEntity('unit');
                      break;
                    case 'module':
                      handleAddEntity('module');
                      break;
                    case 'course':
                      handleAddEntity('course');
                      break;
                  }
                }}
                className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add {currentStep === 'university' ? 'University' :
                     currentStep === 'studyPack' ? 'Study Pack' :
                     currentStep === 'unit' ? 'Unit' :
                     currentStep === 'module' ? 'Module' :
                     currentStep === 'course' ? 'Course' : ''}
              </Button>
            </div>
          )}
        </div>

        {/* Content based on current step */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-3 bg-muted rounded w-full"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {currentStep === 'university' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableOptions.universities.map((university) => (
                  <EntityCard
                    key={university.id}
                    entity={university}
                    entityType="university"
                    onSelect={() => handleCardSelection('university', university)}
                    onEdit={(entity) => handleEditEntity(entity, 'university')}
                    onDelete={handleDeleteEntity}
                  />
                ))}
              </div>
            )}

            {currentStep === 'studyPack' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableOptions.studyPacks?.map((studyPack) => (
                  <EntityCard
                    key={studyPack.id}
                    entity={studyPack}
                    entityType="studyPack"
                    onSelect={() => handleCardSelection('studyPack', studyPack)}
                    onEdit={(entity) => handleEditEntity(entity, 'studyPack')}
                    onDelete={handleDeleteEntity}
                  />
                )) || (
                  <div className="col-span-full text-center py-8">
                    <p className="text-muted-foreground">No study packs available for this university</p>
                  </div>
                )}
              </div>
            )}



            {currentStep === 'unit' && (
              <div className="space-y-6">
                {/* Units Section */}
                {availableOptions.units.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Layers className="h-5 w-5" />
                      <h3 className="text-lg font-semibold">Units</h3>
                      <Badge variant="outline">{availableOptions.units.length}</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {availableOptions.units.map((unit) => (
                        <EntityCard
                          key={unit.id}
                          entity={unit}
                          entityType="unit"
                          onSelect={() => handleCardSelection('unit', unit)}
                          onEdit={(entity) => handleEditEntity(entity, 'unit')}
                          onDelete={handleDeleteEntity}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Independent Modules Section */}
                {availableOptions.independentModules && availableOptions.independentModules.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      <h3 className="text-lg font-semibold">Independent Modules</h3>
                      <Badge variant="outline">{availableOptions.independentModules.length}</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {availableOptions.independentModules.map((module) => (
                        <EntityCard
                          key={`independent-${module.id}`}
                          entity={module}
                          entityType="module"
                          onSelect={() => handleCardSelection('independentModule', module)}
                          onEdit={(entity) => handleEditEntity(entity, 'module')}
                          onDelete={handleDeleteEntity}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {availableOptions.units.length === 0 && (!availableOptions.independentModules || availableOptions.independentModules.length === 0) && (
                  <div className="text-center py-12">
                    <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Content Available</h3>
                    <p className="text-muted-foreground mb-4">
                      No units or independent modules are available for the selected study pack.
                    </p>
                    <Alert>
                      <AlertDescription>
                        If you expected to see content here, please check if the API endpoint is returning the correct data structure or contact support.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </div>
            )}

            {currentStep === 'module' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableOptions.modules.map((module) => (
                  <EntityCard
                    key={module.id}
                    entity={module}
                    entityType="module"
                    onSelect={() => handleCardSelection('module', module)}
                    onEdit={(entity) => handleEditEntity(entity, 'module')}
                    onDelete={handleDeleteEntity}
                  />
                ))}
              </div>
            )}

            {currentStep === 'course' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableOptions.courses.map((course) => (
                  <EntityCard
                    key={course.id}
                    entity={course}
                    entityType="course"
                    onSelect={() => handleCardSelection('course', course)}
                    onEdit={(entity) => handleEditEntity(entity, 'course')}
                    onDelete={handleDeleteEntity}
                  />
                ))}
              </div>
            )}

            {currentStep === 'courseActions' && (
              <div className="max-w-2xl mx-auto space-y-6">
                {/* Course Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      {selection.course?.name}
                    </CardTitle>
                    <CardDescription>
                      Choose an action for this course
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <School className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">University:</span>
                        <Badge variant="secondary">{selection.university?.name}</Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Study Pack:</span>
                        <Badge variant="secondary">{selection.studyPack?.name}</Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Unit:</span>
                        <Badge variant="secondary">{selection.unit?.name}</Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Layers className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Module:</span>
                        <Badge variant="secondary">{selection.module?.name || selection.independentModule?.name}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50" onClick={() => handleAddQuestion()}>
                    <CardHeader className="text-center">
                      <CardTitle className="flex items-center justify-center gap-2">
                        <Plus className="h-5 w-5" />
                        Add Question
                      </CardTitle>
                      <CardDescription>
                        Create a new question for this course
                      </CardDescription>
                    </CardHeader>
                  </Card>

                  <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50" onClick={() => setCurrentStep('import')}>
                    <CardHeader className="text-center">
                      <CardTitle className="flex items-center justify-center gap-2">
                        <Upload className="h-5 w-5" />
                        Bulk Import
                      </CardTitle>
                      <CardDescription>
                        Import multiple questions from JSON
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              </div>
            )}

            {currentStep === 'import' && (
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Selection Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Selection Summary</CardTitle>
                    <CardDescription>
                      Questions will be imported with the following metadata
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <School className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">University:</span>
                          <Badge variant="secondary">{selection.university?.name}</Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Study Pack:</span>
                          <Badge variant="secondary">{selection.studyPack?.name}</Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Layers className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Unit:</span>
                          <Badge variant="secondary">{selection.unit?.name}</Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <GraduationCap className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Module:</span>
                          <Badge variant="secondary">{selection.module?.name}</Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Database className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Course:</span>
                          <Badge variant="secondary">{selection.course?.name}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>



                {/* Exam Year Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle>Select Exam Year</CardTitle>
                    <CardDescription>
                      Choose the exam year for your questions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <select
                          value={selectedExamYear === -1 ? 'custom' : selectedExamYear || ''}
                          onChange={(e) => {
                            if (e.target.value === 'custom') {
                              setSelectedExamYear(-1); // Use -1 to indicate custom input mode
                            } else {
                              setSelectedExamYear(e.target.value ? parseInt(e.target.value) : undefined);
                            }
                          }}
                          className="flex h-10 w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select exam year...</option>
                          {availableOptions.examYears.map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                          {/* Allow custom year input */}
                          <option value="custom">Enter custom year...</option>
                        </select>
                        {selectedExamYear && selectedExamYear !== -1 && (
                          <Badge variant="secondary" className="text-green-600 border-green-600">
                            Year {selectedExamYear} selected
                          </Badge>
                        )}
                      </div>

                      {/* Custom year input */}
                      {selectedExamYear === -1 && (
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="2000"
                            max="2030"
                            placeholder="Enter year (e.g., 2024)"
                            value={customYearInput}
                            onChange={(e) => setCustomYearInput(e.target.value)}
                            className="flex h-10 w-32 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          />
                          <Button
                            size="sm"
                            onClick={handleCustomYearConfirm}
                            disabled={!customYearInput || parseInt(customYearInput) < 2000 || parseInt(customYearInput) > 2030}
                          >
                            Confirm
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* JSON Input */}
                <Card>
                  <CardHeader>
                    <CardTitle>Import Questions</CardTitle>
                    <CardDescription>
                      Paste your questions JSON array below
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <JsonQuestionInput
                      value={jsonInput}
                      onChange={handleInputChange}
                      validation={validation}
                      onValidate={handleJsonValidation}
                      onValidationResult={handleValidationResult}
                    />

                    {validation.isValid && (
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            {validation.questionCount} questions ready
                          </Badge>
                        </div>
                        <Button
                          onClick={handleImport}
                          disabled={importing || !validation.isValid || !selectedExamYear || selectedExamYear === -1}
                          className="min-w-[120px]"
                        >
                          {importing ? (
                            <>
                              <Database className="mr-2 h-4 w-4 animate-spin" />
                              Importing...
                            </>
                          ) : (
                            <>
                              <Upload className="mr-2 h-4 w-4" />
                              Import Questions
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Usage Guide Toggle */}
                <div className="text-center">
                  <Button
                    variant="ghost"
                    onClick={() => setShowUsageGuide(!showUsageGuide)}
                  >
                    {showUsageGuide ? 'Hide' : 'Show'} Usage Guide
                  </Button>
                </div>

                {/* Usage Guide */}
                {showUsageGuide && (
                  <>
                    {/* Import Guidelines */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Import Guidelines</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Questions must be in JSON array format</li>
                            <li>• Each question requires: questionText, questionType, and answers</li>
                            <li>• SINGLE_CHOICE questions need exactly one correct answer</li>
                            <li>• MULTIPLE_CHOICE questions need at least one correct answer</li>
                            <li>• Metadata will be automatically added based on your selections above</li>
                          </ul>
                        </div>

                        {/* Content Management Status */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-800">Content Management Status</span>
                          </div>
                          <div className="text-sm text-green-700 space-y-1">
                            <div>✅ All content entities can be created, edited, and deleted</div>
                            <div>✅ Full CRUD operations are now operational</div>
                            <div>✅ Question import system is ready for use</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <ImportUsageGuide />
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Entity Dialog */}
      <AddEntityDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        entityType={addEntityType}
        parentId={getParentId()}
        onSuccess={handleAddEntitySuccess}
      />

      <EditEntityDialog
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        entityType={editEntityType}
        entity={editEntity}
        onSuccess={handleEditEntitySuccess}
      />

      {/* Course-Specific Question Creation Dialog */}
      {selection.course && (
        <CourseSpecificQuestionDialog
          open={showCreateQuestionDialog}
          onOpenChange={setShowCreateQuestionDialog}
          onCreateQuestion={handleCreateQuestion}
          courseId={selection.course.id}
          courseName={selection.course.name}
        />
      )}
    </div>
  );
}
