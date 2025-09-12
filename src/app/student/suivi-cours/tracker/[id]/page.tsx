// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { LoadingSpinner, FullPageLoading } from '@/components/loading-states';
import { ErrorBoundary } from '@/components/error-boundary';
import { 
  ArrowLeft, 
  Edit, 
  BookOpen, 
  Target,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  CheckCircle
} from 'lucide-react';
import { NewApiService } from '@/lib/api/new-api-services';
import { StudyCard, CardProgressResponse, CourseProgressDetails } from '@/types/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
// Note: Using manual collapsible implementation since @/components/ui/collapsible may not exist
// We'll implement this inline or use a different approach

interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  label: string;
  className?: string;
}

function CircularProgress({ 
  value, 
  size = 80, 
  strokeWidth = 8, 
  label, 
  className 
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className={cn("flex flex-col items-center space-y-2", className)}>
      <div className="relative">
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="hsl(var(--primary))"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300 ease-in-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold text-foreground">
            {Math.round(value)}%
          </span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground text-center font-medium">
        {label}
      </span>
    </div>
  );
}

interface CourseItemProps {
  course: CourseProgressDetails;
  onLayerToggle: (courseId: number, layerNumber: number, completed: boolean) => void;
}

function CourseItem({ course, onLayerToggle }: CourseItemProps) {
  const handleLayerChange = (layerNumber: number, checked: boolean) => {
    onLayerToggle(course.courseId, layerNumber, checked);
  };

  return (
    <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-foreground truncate">
          {course.courseName}
        </h4>
        <div className="flex items-center space-x-2 mt-1">
          <Progress value={course.progressPercentage} className="flex-1 h-2" />
          <span className="text-xs text-muted-foreground font-medium min-w-[3rem]">
            {Math.round(course.progressPercentage)}%
          </span>
        </div>
      </div>
      
      <div className="flex items-center space-x-4 ml-4">
        <div className="flex items-center space-x-1">
          <Checkbox
            id={`c1-${course.courseId}`}
            checked={course.layerProgress.layer1}
            onCheckedChange={(checked) => handleLayerChange(1, checked as boolean)}
          />
          <label 
            htmlFor={`c1-${course.courseId}`}
            className="text-xs text-muted-foreground cursor-pointer"
          >
            C1
          </label>
        </div>
        
        <div className="flex items-center space-x-1">
          <Checkbox
            id={`c2-${course.courseId}`}
            checked={course.layerProgress.layer2}
            onCheckedChange={(checked) => handleLayerChange(2, checked as boolean)}
          />
          <label 
            htmlFor={`c2-${course.courseId}`}
            className="text-xs text-muted-foreground cursor-pointer"
          >
            C2
          </label>
        </div>
        
        <div className="flex items-center space-x-1">
          <Checkbox
            id={`c3-${course.courseId}`}
            checked={course.layerProgress.layer3}
            onCheckedChange={(checked) => handleLayerChange(3, checked as boolean)}
          />
          <label 
            htmlFor={`c3-${course.courseId}`}
            className="text-xs text-muted-foreground cursor-pointer"
          >
            C3
          </label>
        </div>
        
        <div className="flex items-center space-x-1">
          <Checkbox
            id={`qcm-${course.courseId}`}
            checked={course.layerProgress.qcmLayer}
            onCheckedChange={(checked) => handleLayerChange(4, checked as boolean)}
          />
          <label 
            htmlFor={`qcm-${course.courseId}`}
            className="text-xs text-muted-foreground cursor-pointer"
          >
            QCM
          </label>
        </div>
      </div>
    </div>
  );
}

export default function TrackerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const trackerId = parseInt(params.id as string);

  const [tracker, setTracker] = useState<StudyCard | null>(null);
  const [progress, setProgress] = useState<CardProgressResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Fetch tracker details and progress
  const fetchTrackerData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch tracker details
      const trackerResponse = await NewApiService.getCardById(trackerId);
      if (!trackerResponse.success || !trackerResponse.data) {
        throw new Error(trackerResponse.error || 'Failed to fetch tracker');
      }

      setTracker(trackerResponse.data);

      // Fetch progress
      const progressResponse = await NewApiService.getCardProgress(trackerId);
      if (progressResponse.success && progressResponse.data) {
        setProgress(progressResponse.data);
      }
    } catch (err) {
      console.error('Error fetching tracker data:', err);
      setError('Failed to load tracker details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (trackerId) {
      fetchTrackerData();
    }
  }, [trackerId]);

  const handleBack = () => {
    router.back();
  };

  const handleEdit = () => {
    router.push(`/student/suivi-cours/tracker/${trackerId}/edit`);
  };

  const handleLayerToggle = async (courseId: number, layerNumber: number, completed: boolean) => {
    try {
      const response = await NewApiService.upsertCourseLayer({
        courseId,
        layerNumber,
        completed
      });

      if (response.success) {
        // Refresh progress data
        await fetchTrackerData();
        toast.success(`Couche ${layerNumber} ${completed ? 'complétée' : 'marquée comme incomplète'}`);
      } else {
        throw new Error(response.error || 'Failed to update layer');
      }
    } catch (err) {
      console.error('Error updating layer:', err);
      toast.error('Erreur lors de la mise à jour de la couche');
    }
  };

  const toggleCategory = (categoryName: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName);
    } else {
      newExpanded.add(categoryName);
    }
    setExpandedCategories(newExpanded);
  };

  if (loading) {
    return <FullPageLoading message="Chargement du suivi de cours..." />;
  }

  if (error || !tracker) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-4">{error || 'Suivi de cours introuvable'}</p>
            <Button onClick={() => router.back()}>
              Retourner
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Group courses by module for accordion display
  const coursesByModule = progress?.courseProgress?.reduce((acc, course) => {
    const moduleName = course.course?.module?.name || 'Autres cours';
    if (!acc[moduleName]) {
      acc[moduleName] = [];
    }
    acc[moduleName].push(course);
    return acc;
  }, {} as Record<string, CourseProgressDetails[]>) || {};

  // Calculate layer progress percentages
  const totalCourses = progress?.totalCourses || 0;
  const layerStats = progress?.courseProgress?.reduce((acc, course) => {
    if (course.layerProgress.layer1) acc.c1++;
    if (course.layerProgress.layer2) acc.c2++;
    if (course.layerProgress.layer3) acc.c3++;
    if (course.layerProgress.qcmLayer) acc.qcm++;
    return acc;
  }, { c1: 0, c2: 0, c3: 0, qcm: 0 }) || { c1: 0, c2: 0, c3: 0, qcm: 0 };

  const layerPercentages = {
    c1: totalCourses > 0 ? (layerStats.c1 / totalCourses) * 100 : 0,
    c2: totalCourses > 0 ? (layerStats.c2 / totalCourses) * 100 : 0,
    c3: totalCourses > 0 ? (layerStats.c3 / totalCourses) * 100 : 0,
    qcm: totalCourses > 0 ? (layerStats.qcm / totalCourses) * 100 : 0,
  };

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBack}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retourner
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {tracker.title}
              </h1>
              {tracker.description && (
                <p className="text-muted-foreground mt-2">
                  {tracker.description}
                </p>
              )}
            </div>
          </div>
          <Button 
            onClick={handleEdit}
            variant="outline"
          >
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </Button>
        </div>

        <Separator />

        {/* Progress Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span>Résumé des progrès</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <CircularProgress
                value={layerPercentages.c1}
                label="Couche 1"
              />
              <CircularProgress
                value={layerPercentages.c2}
                label="Couche 2"
              />
              <CircularProgress
                value={layerPercentages.c3}
                label="Couche 3"
              />
              <CircularProgress
                value={layerPercentages.qcm}
                label="Couche QCM"
              />
            </div>
            
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {totalCourses} cours au total
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    Progrès global: {Math.round(progress?.cardProgressPercentage || 0)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span>Liste des cours</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.keys(coursesByModule).length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Aucun cours trouvé dans ce suivi.
                </p>
              </div>
            ) : (
              Object.entries(coursesByModule).map(([moduleName, courses]) => (
                <div key={moduleName} className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-4 h-auto border border-border rounded-lg hover:bg-muted/50"
                    onClick={() => toggleCategory(moduleName)}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-foreground">
                        {moduleName}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {courses.length} cours
                      </Badge>
                    </div>
                    {expandedCategories.has(moduleName) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                  {expandedCategories.has(moduleName) && (
                    <div className="space-y-2 mt-2">
                      {courses.map((course) => (
                        <CourseItem
                          key={course.courseId}
                          course={course}
                          onLayerToggle={handleLayerToggle}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
}
