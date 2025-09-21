// @ts-nocheck
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LogoDisplay } from '@/components/ui/logo-display';
import { LoadingSpinner, FullPageLoading } from '@/components/loading-states';
import { ErrorBoundary } from '@/components/error-boundary';
import { UnitModuleGrid } from '@/components/student/shared/unit-module-grid';
import { UnitModuleItem } from '@/components/student/shared/unit-module-compact-card';
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

export default function SuiviCoursPage() {
  const router = useRouter();
  const { filters, loading: filtersLoading, error: filtersError } = useContentFilters();

  // Updated click handlers to navigate to trackers page
  const handleUnitClick = (unite: any) => {
    router.push(`/student/suivi-cours/trackers?type=unite&id=${unite.id}&name=${encodeURIComponent(unite.name)}`);
  };

  const handleModuleClick = (module: any, unite?: any) => {
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

  // Handle unit/module selection using UnitModuleGrid
  const handleUnitModuleSelection = (item: UnitModuleItem) => {
    if (item.type === 'unite') {
      handleUnitClick({ id: item.id, name: item.name, logoUrl: item.logoUrl });
    } else if (item.type === 'module') {
      handleModuleClick({ id: item.id, name: item.name, logoUrl: item.logoUrl });
    }
  };

  const handleCreateTracker = () => {
    router.push('/student/suivi-cours/create-tracker');
  };

  if (filtersLoading) {
    return <FullPageLoading message="Chargement des unités et modules..." />;
  }

  if (filtersError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-4">{filtersError}</p>
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
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            La liste de suivi de cours
          </h1>
          <p className="text-muted-foreground mt-2">
            Sélectionnez une unité ou un module pour gérer vos suivis de cours
          </p>
        </div>

        {/* Create Button */}
        <div className="flex justify-start">
          <Button 
            onClick={handleCreateTracker}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Créer un nouveau suivi de cours
          </Button>
        </div>

        <Separator />

        {/* Use UnitModuleGrid for consistent layout */}
        <UnitModuleGrid
          units={filters.unites}
          independentModules={filters.independentModules}
          onItemClick={handleUnitModuleSelection}
          variant="practice"
          layout="compact"
          loading={false}
          error={null}
          showSessionCounts={false}
          selectedItem={null}
        />


      </div>
    </ErrorBoundary>
  );
}
