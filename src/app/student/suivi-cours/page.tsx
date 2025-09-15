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
  uniteId?: number;
  uniteName?: string;
  onClick: () => void;
  isLoading?: boolean;
  isExpanded?: boolean;
  trackerData?: any;
}

function UnitModuleCard({
  id,
  name,
  type,
  logoUrl,
  uniteId,
  uniteName,
  onClick,
  isLoading = false,
  isExpanded = false,
  trackerData
}: UnitModuleCardProps) {
  const cardKey = `${type}-${id}`;

  return (
    <Card
      className={cn(
        "group cursor-pointer transition-all duration-200 border-border/50",
        isExpanded
          ? "shadow-lg border-primary/30 bg-primary/5"
          : "hover:shadow-lg hover:scale-[1.02] hover:border-primary/30"
      )}
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
          <div className="flex items-center space-x-2">
            {isLoading && (
              <LoadingSpinner size="sm" />
            )}
            <ChevronRight
              className={cn(
                "h-5 w-5 text-muted-foreground group-hover:text-primary transition-all duration-200",
                isExpanded && "rotate-90"
              )}
            />
          </div>
        </div>
      </CardHeader>

      {/* Expanded Content */}
      {isExpanded && (
        <CardContent className="pt-0">
          <Separator className="mb-4" />
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="md" />
              <span className="ml-2 text-muted-foreground">Chargement des trackers...</span>
            </div>
          ) : trackerData ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-foreground">Trackers disponibles</h4>
                <Badge variant="secondary">
                  {trackerData.count} tracker{trackerData.count !== 1 ? 's' : ''}
                </Badge>
              </div>

              {trackerData.count > 0 ? (
                <div className="space-y-2">
                  {trackerData.trackers.slice(0, 3).map((tracker: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                      <span className="text-sm font-medium">{tracker.title || `Tracker ${index + 1}`}</span>
                      <Badge variant="outline" className="text-xs">
                        {tracker.courseCount || 0} cours
                      </Badge>
                    </div>
                  ))}
                  {trackerData.count > 3 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{trackerData.count - 3} autres trackers
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Aucun tracker disponible</p>
                </div>
              )}

              <Button
                className="w-full mt-4"
                onClick={(e) => {
                  e.stopPropagation();
                  // Navigate to trackers page
                  window.location.href = `/student/suivi-cours/trackers?type=${type}&id=${id}&name=${encodeURIComponent(name)}${uniteId ? `&uniteId=${uniteId}&uniteName=${encodeURIComponent(uniteName || '')}` : ''}`;
                }}
              >
                Voir tous les trackers
              </Button>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">Erreur lors du chargement</p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export default function SuiviCoursPage() {
  const router = useRouter();
  const { filters, loading: filtersLoading, error: filtersError } = useContentFilters();
  // State for on-demand loading and caching
  const [cardLoadingStates, setCardLoadingStates] = useState<Record<string, boolean>>({});
  const [cardData, setCardData] = useState<Record<string, any>>({});
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  // Debounce timeout ref to prevent rapid duplicate requests
  const debounceTimeouts = useRef<Record<string, NodeJS.Timeout>>({});

  // Fetch tracker data for a specific unit or module on-demand
  const fetchCardData = async (type: 'unite' | 'module', id: number, name: string) => {
    const cardKey = `${type}-${id}`;

    // Check if data is already cached
    if (cardData[cardKey]) {
      console.log(`📋 [SuiviCoursPage] Using cached data for ${cardKey}`);
      return cardData[cardKey];
    }

    // Check if request is already in progress
    if (cardLoadingStates[cardKey]) {
      console.log(`📋 [SuiviCoursPage] Request already in progress for ${cardKey}`);
      return null;
    }

    try {
      // Set loading state
      setCardLoadingStates(prev => ({ ...prev, [cardKey]: true }));

      console.log(`📋 [SuiviCoursPage] Fetching data for ${cardKey}`);

      const params = type === 'unite'
        ? { uniteId: id }
        : { moduleId: id };

      const response = await NewApiService.getCardsByUnitOrModule(params);

      if (response.success && response.data) {
        const data = {
          trackers: response.data,
          count: response.data.length,
          fetchedAt: new Date().toISOString()
        };

        // Cache the response
        setCardData(prev => ({ ...prev, [cardKey]: data }));

        console.log(`📋 [SuiviCoursPage] Successfully fetched ${data.count} trackers for ${cardKey}`);
        return data;
      } else {
        throw new Error(response.error || 'Failed to fetch tracker data');
      }
    } catch (err) {
      console.error(`💥 [SuiviCoursPage] Error fetching data for ${cardKey}:`, err);
      toast.error(`Erreur lors du chargement des données pour ${name}`);
      return null;
    } finally {
      // Clear loading state
      setCardLoadingStates(prev => ({ ...prev, [cardKey]: false }));
    }
  };

  // Debounced card click handler to prevent rapid duplicate requests
  const handleCardClick = (type: 'unite' | 'module', id: number, name: string, uniteId?: number, uniteName?: string) => {
    const cardKey = `${type}-${id}`;

    console.log(`🎯 [SuiviCoursPage] Card clicked: ${cardKey}`, {
      type,
      id,
      name,
      isExpanded: expandedCards.has(cardKey),
      hasCachedData: !!cardData[cardKey],
      isLoading: cardLoadingStates[cardKey]
    });

    // Clear any existing timeout for this card
    if (debounceTimeouts.current[cardKey]) {
      clearTimeout(debounceTimeouts.current[cardKey]);
      console.log(`⏰ [SuiviCoursPage] Cleared existing timeout for ${cardKey}`);
    }

    // Set a new timeout to debounce rapid clicks
    debounceTimeouts.current[cardKey] = setTimeout(async () => {
      // Toggle card expansion
      const isCurrentlyExpanded = expandedCards.has(cardKey);

      if (isCurrentlyExpanded) {
        // Collapse the card
        console.log(`📉 [SuiviCoursPage] Collapsing card: ${cardKey}`);
        setExpandedCards(prev => {
          const newSet = new Set(prev);
          newSet.delete(cardKey);
          return newSet;
        });
      } else {
        // Expand the card and fetch data if needed
        console.log(`📈 [SuiviCoursPage] Expanding card: ${cardKey}`);
        setExpandedCards(prev => new Set(prev).add(cardKey));

        // Fetch data if not already cached
        if (!cardData[cardKey]) {
          console.log(`🚀 [SuiviCoursPage] Fetching data for ${cardKey} (not cached)`);
          await fetchCardData(type, id, name);
        } else {
          console.log(`💾 [SuiviCoursPage] Using cached data for ${cardKey}`);
        }
      }
    }, 200); // 200ms debounce
  };

  // Cleanup debounce timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimeouts.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, []);

  // Updated click handlers to use the new on-demand loading system
  const handleUnitClick = (unite: any) => {
    handleCardClick('unite', unite.id, unite.name);
  };

  const handleModuleClick = (module: any, unite?: any) => {
    handleCardClick('module', module.id, module.name, unite?.id, unite?.name);
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
              {filters.unites.map((unite) => {
                const cardKey = `unite-${unite.id}`;
                return (
                  <UnitModuleCard
                    key={cardKey}
                    id={unite.id}
                    name={unite.name}
                    type="unite"
                    logoUrl={unite.logoUrl}
                    onClick={() => handleUnitClick(unite)}
                    isLoading={cardLoadingStates[cardKey] || false}
                    isExpanded={expandedCards.has(cardKey)}
                    trackerData={cardData[cardKey]}
                  />
                );
              })}
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
              {filters.independentModules.map((module) => {
                const cardKey = `module-${module.id}`;
                return (
                  <UnitModuleCard
                    key={cardKey}
                    id={module.id}
                    name={module.name}
                    type="module"
                    logoUrl={module.logoUrl}
                    onClick={() => handleModuleClick(module)}
                    isLoading={cardLoadingStates[cardKey] || false}
                    isExpanded={expandedCards.has(cardKey)}
                    trackerData={cardData[cardKey]}
                  />
                );
              })}
            </div>
          </div>
        )}


      </div>
    </ErrorBoundary>
  );
}
