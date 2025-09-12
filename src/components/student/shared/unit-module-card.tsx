'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LogoDisplay } from '@/components/ui/logo-display';
import {
  Building2,
  BookOpen,
  Users,
  GraduationCap,
  ChevronRight,
  Play,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface UnitModuleItem {
  id: number;
  name: string;
  description?: string;
  logoUrl?: string;
  type: 'unite' | 'module';
  isIndependent?: boolean;
  moduleCount?: number;
  sessionCount?: number;
}

interface UnitModuleCardProps {
  item: UnitModuleItem;
  onClick: (item: UnitModuleItem) => void;
  variant?: 'practice' | 'exam';
  className?: string;
  showSessionCount?: boolean;
  isSelected?: boolean;
}

export function UnitModuleCard({
  item,
  onClick,
  variant = 'practice',
  className,
  showSessionCount = true,
  isSelected = false
}: UnitModuleCardProps) {
  const isUnit = item.type === 'unite';
  const isIndependentModule = item.type === 'module' && item.isIndependent;
  
  // Determine colors and icons based on type and variant
  const getCardStyles = () => {
    if (isUnit) {
      return {
        borderColor: variant === 'practice' ? 'border-l-primary/30 hover:border-l-primary/50' : 'border-l-chart-2/30 hover:border-l-chart-2/50',
        bgColor: variant === 'practice' ? 'bg-primary/10' : 'bg-chart-2/10',
        iconColor: variant === 'practice' ? 'text-primary' : 'text-chart-2',
        icon: Building2
      };
    } else if (isIndependentModule) {
      return {
        borderColor: variant === 'practice' ? 'border-l-chart-1/30 hover:border-l-chart-1/50' : 'border-l-chart-3/30 hover:border-l-chart-3/50',
        bgColor: variant === 'practice' ? 'bg-chart-1/10' : 'bg-chart-3/10',
        iconColor: variant === 'practice' ? 'text-chart-1' : 'text-chart-3',
        icon: GraduationCap
      };
    } else {
      return {
        borderColor: variant === 'practice' ? 'border-l-primary-foreground/30 hover:border-l-primary-foreground/50' : 'border-l-chart-4/30 hover:border-l-chart-4/50',
        bgColor: variant === 'practice' ? 'bg-primary-foreground/10' : 'bg-chart-4/10',
        iconColor: variant === 'practice' ? 'text-primary-foreground' : 'text-chart-4',
        icon: BookOpen
      };
    }
  };

  const styles = getCardStyles();
  const IconComponent = styles.icon;

  const handleClick = () => {
    // Log the card click for debugging
    console.log(`🎯 [UnitModuleCard] ${variant} card clicked:`, {
      item,
      type: item.type,
      id: item.id,
      name: item.name,
      isIndependent: item.isIndependent,
      moduleCount: item.moduleCount,
      sessionCount: item.sessionCount,
      variant,
      timestamp: new Date().toISOString()
    });

    onClick(item);
  };

  return (
    <Card
      className={cn(
        "cursor-pointer hover:shadow-md transition-all duration-200 border-l-[4px]",
        styles.borderColor,
        isSelected && "border-primary bg-primary/5 shadow-md",
        className
      )}
      onClick={handleClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <LogoDisplay
              logoUrl={item.logoUrl}
              fallbackIcon={IconComponent}
              alt={`${item.name} logo`}
              size="lg"
              variant="rounded"
              className={cn("p-3", styles.bgColor)}
              iconClassName={styles.iconColor}
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg text-foreground truncate">
                  {item.name}
                </h3>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs",
                    isUnit && "border-primary/30 text-primary",
                    isIndependentModule && "border-chart-1/30 text-chart-1",
                    !isUnit && !isIndependentModule && "border-primary-foreground/30 text-primary-foreground"
                  )}
                >
                  {isUnit ? 'Unit' : isIndependentModule ? 'Independent Module' : 'Module'}
                </Badge>
              </div>
              
              {item.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {item.description}
                </p>
              )}
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {isUnit && item.moduleCount !== undefined && (
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{item.moduleCount} modules</span>
                  </div>
                )}
                
                {showSessionCount && item.sessionCount !== undefined && (
                  <div className="flex items-center gap-1">
                    {variant === 'practice' ? (
                      <Play className="h-4 w-4" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                    <span>
                      {item.sessionCount} {variant === 'practice' ? 'practice' : 'exam'} session{item.sessionCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-accent"
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
