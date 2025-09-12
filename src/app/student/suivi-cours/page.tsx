// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LogoDisplay } from '@/components/ui/logo-display';
import { LoadingSpinner, FullPageLoading } from '@/components/loading-states';
import { ErrorBoundary } from '@/components/error-boundary';
import { 
  BookOpen, 
  Plus, 
  Users, 
  ChevronRight, 
  GraduationCap,
  Target,
  TrendingUp
} from 'lucide-react';
import { useContentFilters } from '@/hooks/use-content-filters';
import { NewApiService } from '@/lib/api/new-api-services';
import { StudyCard, UnitModuleSelection } from '@/types/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface UnitModuleCardProps {
  id: number;
  name: string;
  type: 'unite' | 'module';
  logoUrl?: string;
  trackerCount: number;
  uniteId?: number;
  uniteName?: string;
  onClick: () => void;
}

function UnitModuleCard({ 
  id, 
  name, 
  type, 
  logoUrl, 
  trackerCount, 
  uniteId, 
  uniteName, 
  onClick 
}: UnitModuleCardProps) {
  return (
    <Card 
      className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-border/50 hover:border-primary/30"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <LogoDisplay
                logoUrl={logoUrl}
                fallbackIcon={type === 'unite' ? GraduationCap : BookOpen}
                alt={`${type === 'unite' ? 'Unité' : 'Module'} ${name}`}
                size="md"
                className="bg-primary/10 text-primary"
              />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                {name}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {type === 'unite' ? 'Unité' : 'Module indépendant'}
                {uniteName && type === 'module' && (
                  <span className="ml-1">• {uniteName}</span>
                )}
              </p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {trackerCount} suivi{trackerCount !== 1 ? 's' : ''}
            </span>
          </div>
          <Badge 
            variant={trackerCount > 0 ? "default" : "secondary"}
            className="text-xs"
          >
            {trackerCount > 0 ? `${trackerCount} actif${trackerCount !== 1 ? 's' : ''}` : 'Aucun suivi'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SuiviCoursPage() {
  const router = useRouter();
  const { filters, loading: filtersLoading, error: filtersError } = useContentFilters();
  const [trackerCounts, setTrackerCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tracker counts for each unit and module
  const fetchTrackerCounts = async () => {
    if (!filters) return;

    try {
      setLoading(true);
      const counts: Record<string, number> = {};

      // Fetch tracker counts for units
      if (filters.unites) {
        for (const unite of filters.unites) {
          try {
            const response = await NewApiService.getCardsByUnitOrModule({ uniteId: unite.id });
            if (response.success && response.data) {
              counts[`unite-${unite.id}`] = response.data.length;
            } else {
              counts[`unite-${unite.id}`] = 0;
            }
          } catch (err) {
            console.warn(`Failed to fetch tracker count for unite ${unite.id}:`, err);
            counts[`unite-${unite.id}`] = 0;
          }
        }
      }

      // Fetch tracker counts for independent modules
      if (filters.independentModules) {
        for (const module of filters.independentModules) {
          try {
            const response = await NewApiService.getCardsByUnitOrModule({ moduleId: module.id });
            if (response.success && response.data) {
              counts[`module-${module.id}`] = response.data.length;
            } else {
              counts[`module-${module.id}`] = 0;
            }
          } catch (err) {
            console.warn(`Failed to fetch tracker count for module ${module.id}:`, err);
            counts[`module-${module.id}`] = 0;
          }
        }
      }

      setTrackerCounts(counts);
    } catch (err) {
      console.error('Error fetching tracker counts:', err);
      setError('Failed to load tracker counts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filters && !filtersLoading) {
      fetchTrackerCounts();
    }
  }, [filters, filtersLoading]);

  const handleUnitClick = (unite: any) => {
    const selection: UnitModuleSelection = {
      type: 'unite',
      id: unite.id,
      name: unite.name
    };
    
    // Navigate to tracker list page for this unit
    router.push(`/student/suivi-cours/trackers?type=unite&id=${unite.id}&name=${encodeURIComponent(unite.name)}`);
  };

  const handleModuleClick = (module: any, unite?: any) => {
    const selection: UnitModuleSelection = {
      type: 'module',
      id: module.id,
      name: module.name,
      uniteId: unite?.id,
      uniteName: unite?.name
    };
    
    // Navigate to tracker list page for this module
    const params = new URLSearchParams({
      type: 'module',
      id: module.id.toString(),
      name: module.name
    });
    
    if (unite) {
      params.append('uniteId', unite.id.toString());
      params.append('uniteName', unite.name);
    }
    
    router.push(`/student/suivi-cours/trackers?${params.toString()}`);
  };

  const handleCreateTracker = () => {
    router.push('/student/suivi-cours/create-tracker');
  };

  if (filtersLoading || loading) {
    return <FullPageLoading message="Chargement des unités et modules..." />;
  }

  if (filtersError || error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-4">{filtersError || error}</p>
            <Button onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!filters || (!filters.unites?.length && !filters.independentModules?.length)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              Aucune unité ou module disponible pour le moment.
            </p>
            <Button onClick={() => window.location.reload()}>
              Actualiser
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              La liste de suivi de cours
            </h1>
            <p className="text-muted-foreground mt-2">
              Sélectionnez une unité ou un module pour gérer vos suivis de cours
            </p>
          </div>
          <Button 
            onClick={handleCreateTracker}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Créer un nouveau suivi de cours
          </Button>
        </div>

        <Separator />

        {/* Units Section */}
        {filters.unites && filters.unites.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Unités</h2>
              <Badge variant="secondary" className="text-xs">
                {filters.unites.length}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filters.unites.map((unite) => (
                <UnitModuleCard
                  key={`unite-${unite.id}`}
                  id={unite.id}
                  name={unite.name}
                  type="unite"
                  logoUrl={unite.logoUrl}
                  trackerCount={trackerCounts[`unite-${unite.id}`] || 0}
                  onClick={() => handleUnitClick(unite)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Independent Modules Section */}
        {filters.independentModules && filters.independentModules.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Modules indépendants</h2>
              <Badge variant="secondary" className="text-xs">
                {filters.independentModules.length}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filters.independentModules.map((module) => (
                <UnitModuleCard
                  key={`module-${module.id}`}
                  id={module.id}
                  name={module.name}
                  type="module"
                  logoUrl={module.logoUrl}
                  trackerCount={trackerCounts[`module-${module.id}`] || 0}
                  onClick={() => handleModuleClick(module)}
                />
              ))}
            </div>
          </div>
        )}


      </div>
    </ErrorBoundary>
  );
}
