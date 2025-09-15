// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/loading-states';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Plus,
  BookOpen,
  Target,
  X,
  GraduationCap,
  ChevronRight,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';
import { NewApiService } from '@/lib/api/new-api-services';
import { ContentFilters, CardCreateRequest } from '@/types/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { suiviCoursStorage } from '@/lib/suivi-cours-storage';

interface Course {
  id: number;
  name: string;
  description?: string;
}

interface Module {
  id: number;
  name: string;
  description?: string;
  courses?: Course[];
}

interface Unit {
  id: number;
  name: string;
  logoUrl?: string;
  modules?: Module[];
}

interface SelectedCourse {
  id: number;
  name: string;
  description?: string;
  moduleName: string;
  uniteName?: string;
}

interface TrackerCreatePageProps {
  onSuccess?: (trackerId?: number) => void;
}

export function TrackerCreatePage({ onSuccess }: TrackerCreatePageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<'units' | 'modules' | 'courses' | 'details'>('units');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentFilters, setContentFilters] = useState<ContentFilters | null>(null);
  const [selectedCourses, setSelectedCourses] = useState<SelectedCourse[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(false);
  const [filtersLoading, setFiltersLoading] = useState(false);

  // Update URL to reflect current state
  const updateURL = (newStep: string, unitId?: number, moduleId?: number) => {
    const params = new URLSearchParams();
    params.set('step', newStep);

    if (unitId) {
      params.set('unitId', unitId.toString());
    }
    if (moduleId) {
      params.set('moduleId', moduleId.toString());
    }

    const newURL = `/student/suivi-cours/create-tracker?${params.toString()}`;
    router.replace(newURL);
  };

  // Fetch content filters when component mounts
  useEffect(() => {
    fetchContentFilters();
  }, []);

  // Restore state from URL parameters
  useEffect(() => {
    const stepParam = searchParams.get('step');
    const unitIdParam = searchParams.get('unitId');
    const moduleIdParam = searchParams.get('moduleId');

    if (stepParam && ['units', 'modules', 'courses', 'details'].includes(stepParam)) {
      setStep(stepParam as 'units' | 'modules' | 'courses' | 'details');
    }

    // If we have unit/module IDs in URL, we need to restore those selections
    // This would require additional logic to find and set the selected unit/module
    // from the contentFilters once they're loaded
  }, [searchParams]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      // The URL has changed due to browser navigation
      // The useEffect above will handle restoring the state
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const fetchContentFilters = async () => {
    try {
      setFiltersLoading(true);

      const response = await NewApiService.getContentFilters();

      if (response.success && response.data) {
        setContentFilters(response.data);
        console.log('📚 [TrackerCreatePage] Content filters loaded:', {
          unites: response.data.unites?.length || 0,
          independentModules: response.data.independentModules?.length || 0
        });
      } else {
        throw new Error(response.error || 'Failed to fetch content filters');
      }
    } catch (err) {
      console.error('Error fetching content filters:', err);
      toast.error('Erreur lors du chargement des données');
      setContentFilters(null);
    } finally {
      setFiltersLoading(false);
    }
  };

  // Navigation handlers
  const handleUnitSelect = (unit: Unit) => {
    setSelectedUnit(unit);
    setSelectedModule(null);
    setStep('modules');
    updateURL('modules', unit.id);
  };

  const handleModuleSelect = (module: Module) => {
    setSelectedModule(module);
    setStep('courses');
    updateURL('courses', selectedUnit?.id, module.id);
  };

  const handleCourseSelect = (course: Course) => {
    // Check if course is already being tracked in another suivi
    const isTrackedElsewhere = suiviCoursStorage.isCourseTracked(course.id);
    if (isTrackedElsewhere) {
      const trackerInfo = suiviCoursStorage.getTrackerForCourse(course.id);
      toast.error(`Ce cours est déjà suivi dans le tracker "${trackerInfo?.trackerTitle || 'un autre tracker'}"`);
      return;
    }

    const newCourse: SelectedCourse = {
      id: course.id,
      name: course.name,
      description: course.description,
      moduleName: selectedModule?.name || 'Independent Module',
      uniteName: selectedUnit?.name
    };

    // Check if course is already selected in current session
    const isAlreadySelected = selectedCourses.some(c => c.id === course.id);
    if (isAlreadySelected) {
      toast.error('Ce cours est déjà sélectionné');
      return;
    }

    setSelectedCourses(prev => [...prev, newCourse]);
    setStep('details');
    updateURL('details', selectedUnit?.id, selectedModule?.id);
  };

  const handleRemoveCourse = (courseId: number) => {
    setSelectedCourses(prev => prev.filter(c => c.id !== courseId));
    if (selectedCourses.length === 1) {
      // If removing the last course, go back to course selection
      setStep('courses');
      updateURL('courses', selectedUnit?.id, selectedModule?.id);
    }
  };

  const handleAddAnotherCourse = () => {
    setStep('courses');
    updateURL('courses', selectedUnit?.id, selectedModule?.id);
  };

  const handleBackToUnits = () => {
    setSelectedUnit(null);
    setSelectedModule(null);
    setStep('units');
    updateURL('units');
  };

  const handleBackToModules = () => {
    setSelectedModule(null);
    setStep('modules');
    updateURL('modules', selectedUnit?.id);
  };

  const handleBackToCourses = () => {
    setStep('courses');
    updateURL('courses', selectedUnit?.id, selectedModule?.id);
  };

  const handleBackToSuiviCours = () => {
    router.push('/student/suivi-cours');
  };

  // Auto-generate title when courses are selected
  useEffect(() => {
    if (selectedCourses.length > 0 && step === 'details') {
      const courseNames = selectedCourses.map(c => c.name);
      const generatedTitle = selectedCourses.length === 1
        ? `Suivi ${courseNames[0]}`
        : `Suivi ${courseNames.length} cours: ${courseNames.slice(0, 2).join(', ')}${courseNames.length > 2 ? '...' : ''}`;

      setTitle(generatedTitle);
    }
  }, [selectedCourses, step]);

  const handleSubmit = async () => {
    if (selectedCourses.length === 0) {
      toast.error('Veuillez sélectionner au moins un cours');
      return;
    }

    if (!title.trim()) {
      toast.error('Le titre est requis');
      return;
    }

    try {
      setLoading(true);

      const createRequest: CardCreateRequest = {
        title: title.trim(),
        description: description.trim() || undefined,
        courseIds: selectedCourses.map(c => c.id)
      };

      const response = await NewApiService.createCard(createRequest);

      console.log('📋 [TrackerCreatePage] Create card response:', {
        success: response.success,
        hasData: !!response.data,
        dataId: response.data?.id,
        nestedDataId: response.data?.data?.id,
        dataType: typeof response.data?.id,
        nestedDataType: typeof response.data?.data?.id,
        fullResponse: response
      });

      if (response.success) {
        // Check for ID in both possible locations: response.data.id or response.data.data.id
        const actualData = response.data?.data || response.data;
        const trackerId = actualData?.id;

        if (trackerId !== undefined && trackerId !== null) {
          console.log('✅ [TrackerCreatePage] Redirecting to tracker:', trackerId);

          // Save tracked courses to localStorage
          try {
            suiviCoursStorage.addTrackedCourses(
              trackerId,
              title.trim(),
              selectedCourses.map(c => c.id)
            );
          } catch (error) {
            console.error('Failed to save tracked courses to localStorage:', error);
            // Don't block the success flow for localStorage errors
          }

          toast.success('Suivi de cours créé avec succès');

          // Redirect to the tracker page
          router.replace(`/student/suivi-cours/tracker/${trackerId}`);

          // Call onSuccess with the tracker ID for any additional handling
          onSuccess?.(trackerId);
        } else {
          // Handle case where creation was successful but no ID was returned
          console.error('❌ [TrackerCreatePage] Tracker created but no ID returned:', {
            response,
            dataExists: !!response.data,
            dataKeys: response.data ? Object.keys(response.data) : 'no data',
            nestedDataExists: !!response.data?.data,
            nestedDataKeys: response.data?.data ? Object.keys(response.data.data) : 'no nested data',
            actualData,
            actualDataKeys: actualData ? Object.keys(actualData) : 'no actual data'
          });
          toast.error('Suivi créé mais impossible de rediriger. Veuillez vérifier la liste des suivis.');
          router.replace('/student/suivi-cours');
          onSuccess?.();
        }
      } else {
        console.error('❌ [TrackerCreatePage] Create card failed:', response);
        throw new Error(response.error || 'Failed to create tracker');
      }
    } catch (err) {
      console.error('Error creating tracker:', err);
      toast.error('Erreur lors de la création du suivi');
    } finally {
      setLoading(false);
    }
  };

  const selectedCount = selectedCourses.length;

  // Render functions for each step
  const renderUnitsSelection = () => (
    <div className="space-y-6">
      {/* Study Units */}
      {contentFilters.unites && contentFilters.unites.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-3">
            <GraduationCap className="h-6 w-6 text-primary" />
            Unités d'étude
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {contentFilters.unites.map((unit) => (
              <Card
                key={unit.id}
                className="cursor-pointer hover:shadow-lg transition-all border-l-[4px] border-l-primary/30 hover:border-l-primary group"
                onClick={() => handleUnitSelect(unit)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                        <GraduationCap className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{unit.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {unit.modules?.length || 0} module{(unit.modules?.length || 0) !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Independent Modules */}
      {contentFilters.independentModules && contentFilters.independentModules.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-primary" />
            Modules indépendants
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {contentFilters.independentModules.map((module) => (
              <Card
                key={module.id}
                className="cursor-pointer hover:shadow-lg transition-all border-l-[4px] border-l-primary/30 hover:border-l-primary group"
                onClick={() => handleModuleSelect(module)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                        <BookOpen className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{module.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {module.courses?.length || 0} cours
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* No content available */}
      {(!contentFilters.unites || contentFilters.unites.length === 0) &&
       (!contentFilters.independentModules || contentFilters.independentModules.length === 0) && (
        <Card className="border-dashed">
          <CardContent className="text-center py-16 space-y-4">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto" />
            <div>
              <h3 className="font-medium text-xl">Aucun contenu disponible</h3>
              <p className="text-muted-foreground mt-2">
                Aucune unité d'étude ou module trouvé dans votre abonnement actuel.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderModulesSelection = () => {
    if (!selectedUnit) return null;

    return (
      <div className="space-y-6">
        {/* Breadcrumb navigation */}
        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToUnits}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux unités
          </Button>
          <div className="h-6 w-px bg-border" />
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <span className="font-medium">{selectedUnit.name}</span>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-primary" />
            Modules
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {selectedUnit.modules && selectedUnit.modules.length > 0 ? (
              selectedUnit.modules.map((module) => (
                <Card
                  key={module.id}
                  className="cursor-pointer hover:shadow-lg transition-all border-l-[4px] border-l-primary/30 hover:border-l-primary group"
                  onClick={() => handleModuleSelect(module)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                          <BookOpen className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{module.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {module.courses?.length || 0} cours
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="border-dashed col-span-full">
                <CardContent className="text-center py-12 space-y-4">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground">Aucun module dans cette unité</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCoursesSelection = () => {
    if (!selectedModule) return null;

    const coursesToShow = selectedModule.courses || [];

    return (
      <div className="space-y-6">
        {/* Breadcrumb navigation */}
        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
          <Button
            variant="ghost"
            size="sm"
            onClick={selectedUnit ? handleBackToModules : handleBackToUnits}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {selectedUnit ? 'Retour aux modules' : 'Retour aux unités'}
          </Button>
          <div className="h-6 w-px bg-border" />
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="font-medium">{selectedModule.name}</span>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-primary" />
            Cours
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {coursesToShow.length > 0 ? (
              coursesToShow.map((course) => {
                const isSelected = selectedCourses.some(c => c.id === course.id);
                const isTrackedElsewhere = suiviCoursStorage.isCourseTracked(course.id);
                const trackerInfo = isTrackedElsewhere ? suiviCoursStorage.getTrackerForCourse(course.id) : null;
                const isDisabled = isTrackedElsewhere;

                return (
                  <TooltipProvider key={course.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Card
                          className={cn(
                            "transition-all border-l-[4px] group",
                            isDisabled
                              ? "opacity-60 cursor-not-allowed border-l-muted bg-muted/20"
                              : "cursor-pointer hover:shadow-lg",
                            !isDisabled && isSelected
                              ? "border-l-primary bg-primary/5 shadow-md"
                              : !isDisabled && "border-l-primary/30 hover:border-l-primary"
                          )}
                          onClick={() => !isDisabled && handleCourseSelect(course)}
                        >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "p-3 rounded-lg transition-colors",
                            isDisabled
                              ? "bg-muted/30"
                              : isSelected
                                ? "bg-primary/20"
                                : "bg-primary/10 group-hover:bg-primary/20"
                          )}>
                            <BookOpen className={cn(
                              "h-6 w-6",
                              isDisabled ? "text-muted-foreground" : "text-primary"
                            )} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className={cn(
                                "font-semibold text-lg",
                                isDisabled ? "text-muted-foreground" : ""
                              )}>{course.name}</h3>
                              {isSelected && !isDisabled && (
                                <CheckCircle className="h-5 w-5 text-primary" />
                              )}
                              {isDisabled && (
                                <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                                  Déjà suivi
                                </span>
                              )}
                            </div>
                            {course.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {course.description}
                              </p>
                            )}
                            {isDisabled && trackerInfo && (
                              <p className="text-xs text-muted-foreground mt-1 italic">
                                Dans: {trackerInfo.trackerTitle}
                              </p>
                            )}
                          </div>
                        </div>
                        <ChevronRight className={cn(
                          "h-5 w-5 transition-colors",
                          isDisabled
                            ? "text-muted-foreground/50"
                            : "text-muted-foreground group-hover:text-primary"
                        )} />
                        </div>
                      </CardContent>
                    </Card>
                  </TooltipTrigger>
                  {isDisabled && (
                    <TooltipContent>
                      <p>Ce cours est déjà suivi dans le tracker "{trackerInfo?.trackerTitle}"</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            );
              })
            ) : (
              <Card className="border-dashed col-span-full">
                <CardContent className="text-center py-12 space-y-4">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground">Aucun cours dans ce module</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderDetailsForm = () => (
    <div className="space-y-6">
      {/* Breadcrumb navigation */}
      <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBackToCourses}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux cours
        </Button>
        <div className="h-6 w-px bg-border" />
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <span className="font-medium">Finalisation du suivi</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Selected courses info */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Cours sélectionnés ({selectedCount})
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddAnotherCourse}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Ajouter un cours
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedCourses.map((course) => (
              <div key={course.id} className="flex items-start gap-4 p-4 bg-background rounded-lg border">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{course.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {course.uniteName && `${course.uniteName} • `}
                    {course.moduleName}
                  </div>
                  {course.description && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {course.description}
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveCourse(course.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Form fields */}
        <Card>
          <CardHeader>
            <CardTitle>Détails du suivi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre du suivi *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Anatomie et Physiologie - Semestre 1"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optionnel)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description détaillée du suivi de cours..."
                className="w-full"
                rows={4}
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleBackToCourses}
                disabled={loading}
                className="flex-1"
              >
                Retour
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading || selectedCount === 0 || !title.trim()}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Création...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Créer le suivi ({selectedCount})
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Get step title and description
  const getStepInfo = () => {
    switch (step) {
      case 'units':
        return {
          title: 'Sélectionner une unité ou un module',
          description: 'Choisissez une unité d\'étude ou un module indépendant pour commencer'
        };
      case 'modules':
        return {
          title: `Modules de ${selectedUnit?.name}`,
          description: `Sélectionnez un module dans ${selectedUnit?.name}`
        };
      case 'courses':
        return {
          title: `Cours de ${selectedModule?.name}`,
          description: `Sélectionnez un cours dans ${selectedModule?.name}`
        };
      case 'details':
        return {
          title: 'Finaliser votre suivi',
          description: `Configurez votre suivi de cours (${selectedCount} cours sélectionné${selectedCount !== 1 ? 's' : ''})`
        };
      default:
        return { title: '', description: '' };
    }
  };

  const stepInfo = getStepInfo();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToSuiviCours}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Button>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold">{stepInfo.title}</h1>
                  <p className="text-sm text-muted-foreground">{stepInfo.description}</p>
                </div>
              </div>
            </div>
            
            {/* Step indicator */}
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium",
                step === 'units' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                1
              </div>
              <div className="w-8 h-px bg-border" />
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium",
                step === 'modules' || step === 'courses' || step === 'details' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                2
              </div>
              <div className="w-8 h-px bg-border" />
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium",
                step === 'details' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                3
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {filtersLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-muted-foreground">Chargement des données...</p>
              </div>
            </div>
          ) : !contentFilters ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Erreur lors du chargement des données</p>
                <Button onClick={fetchContentFilters} className="mt-4">
                  Réessayer
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {step === 'units' && renderUnitsSelection()}
              {step === 'modules' && renderModulesSelection()}
              {step === 'courses' && renderCoursesSelection()}
              {step === 'details' && renderDetailsForm()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
