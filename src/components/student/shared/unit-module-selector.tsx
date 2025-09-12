'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LogoDisplay } from '@/components/ui/logo-display';
import { BookOpen, Users, ChevronRight, ArrowLeft } from 'lucide-react';
import { useContentFilters } from '@/hooks/use-content-filters';
import { LoadingSpinner } from '@/components/loading-states';
import { cn } from '@/lib/utils';

export interface UnitModuleSelection {
  type: 'unite' | 'module';
  id: number;
  name: string;
  uniteId?: number;
  uniteName?: string;
}

interface UnitModuleSelectorProps {
  onSelection: (selection: UnitModuleSelection) => void;
  selectedItem?: UnitModuleSelection | null;
  onBack?: () => void;
  title?: string;
  description?: string;
  className?: string;
}

export function UnitModuleSelector({
  onSelection,
  selectedItem,
  onBack,
  title = "Select Unit or Module",
  description = "Choose a unit to view all modules within it, or select a specific module",
  className
}: UnitModuleSelectorProps) {
  const { filters, loading, error } = useContentFilters();
  const [expandedUnites, setExpandedUnites] = useState<Set<number>>(new Set());

  const toggleUniteExpansion = (uniteId: number) => {
    const newExpanded = new Set(expandedUnites);
    if (newExpanded.has(uniteId)) {
      newExpanded.delete(uniteId);
    } else {
      newExpanded.add(uniteId);
    }
    setExpandedUnites(newExpanded);
  };

  const handleUniteSelection = (unite: any) => {
    const selection = {
      type: 'unite' as const,
      id: unite.id,
      name: unite.name,
      uniteId: unite.id,  // For unite selections, uniteId should be the unite's own ID
      uniteName: unite.name  // For unite selections, uniteName should be the unite's own name
    };

    // Log the unite selection for debugging
    console.log('🏗️ [UnitModuleSelector] Unite selected:', {
      selection,
      unite,
      timestamp: new Date().toISOString()
    });

    onSelection(selection);
  };

  const handleModuleSelection = (module: any, unite?: any) => {
    const selection = {
      type: 'module' as const,
      id: module.id,
      name: module.name,
      uniteId: unite?.id,
      uniteName: unite?.name
    };

    // Log the module selection for debugging
    console.log('📚 [UnitModuleSelector] Module selected:', {
      selection,
      module,
      unite,
      timestamp: new Date().toISOString()
    });

    onSelection(selection);
  };

  if (loading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <LoadingSpinner size="md" />
            <span className="ml-3 text-muted-foreground">Loading units and modules...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("w-full border-destructive", className)}>
        <CardContent className="p-8 text-center">
          <div className="text-destructive mb-2">Failed to load content</div>
          <div className="text-sm text-muted-foreground">{error}</div>
        </CardContent>
      </Card>
    );
  }

  if (!filters) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">No content available</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <CardTitle className="text-xl">{title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Units Section */}
        {filters?.unites && filters.unites.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">Units</h3>
              <Badge variant="secondary">{filters.unites.length}</Badge>
            </div>
            
            <div className="space-y-3">
              {filters.unites.map((unite) => (
                <div key={unite.id} className="space-y-2">
                  {/* Unite Card */}
                  <Card className={cn(
                    "transition-all duration-200 hover:shadow-md cursor-pointer",
                    selectedItem?.type === 'unite' && selectedItem.id === unite.id
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/30"
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div
                          className="flex items-center gap-3 flex-1"
                          onClick={() => handleUniteSelection(unite)}
                        >
                          <LogoDisplay
                            logoUrl={unite.logoUrl}
                            fallbackIcon={Users}
                            alt={`${unite.name} logo`}
                            size="md"
                            variant="rounded"
                          />
                          <div>
                            <h4 className="font-medium text-foreground">{unite.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {unite.modules?.length || 0} modules
                            </p>
                          </div>
                        </div>
                        
                        {unite.modules && unite.modules.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleUniteExpansion(unite.id);
                            }}
                          >
                            <ChevronRight 
                              className={cn(
                                "h-4 w-4 transition-transform",
                                expandedUnites.has(unite.id) && "rotate-90"
                              )} 
                            />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Modules within Unite */}
                  {expandedUnites.has(unite.id) && unite.modules && (
                    <div className="ml-6 space-y-2">
                      {unite.modules.map((module) => (
                        <Card 
                          key={module.id}
                          className={cn(
                            "transition-all duration-200 hover:shadow-sm cursor-pointer",
                            selectedItem?.type === 'module' && selectedItem.id === module.id
                              ? "border-primary bg-primary/5"
                              : "hover:border-primary/30"
                          )}
                          onClick={() => handleModuleSelection(module, unite)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center gap-3">
                              <LogoDisplay
                                logoUrl={module.logoUrl}
                                fallbackIcon={BookOpen}
                                alt={`${module.name} logo`}
                                size="sm"
                                variant="rounded"
                              />
                              <div>
                                <h5 className="font-medium text-sm">{module.name}</h5>
                                {module.description && (
                                  <p className="text-xs text-muted-foreground">{module.description}</p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Separator if both sections exist */}
        {filters?.unites && filters.unites.length > 0 &&
         filters?.independentModules && filters.independentModules.length > 0 && (
          <Separator />
        )}

        {/* Independent Modules Section */}
        {filters?.independentModules && filters.independentModules.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">Independent Modules</h3>
              <Badge variant="secondary">{filters.independentModules.length}</Badge>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filters.independentModules.map((module) => (
                <Card 
                  key={module.id}
                  className={cn(
                    "transition-all duration-200 hover:shadow-md cursor-pointer",
                    selectedItem?.type === 'module' && selectedItem.id === module.id
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/30"
                  )}
                  onClick={() => handleModuleSelection(module)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <LogoDisplay
                        logoUrl={module.logoUrl}
                        fallbackIcon={BookOpen}
                        alt={`${module.name} logo`}
                        size="md"
                        variant="rounded"
                      />
                      <div>
                        <h4 className="font-medium text-foreground">{module.name}</h4>
                        {module.description && (
                          <p className="text-sm text-muted-foreground">{module.description}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {(!filters?.unites || filters.unites.length === 0) &&
         (!filters?.independentModules || filters.independentModules.length === 0) && (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
            <h3 className="font-medium text-muted-foreground mb-1">No Content Available</h3>
            <p className="text-sm text-muted-foreground">
              No units or modules are available in your current subscription.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
