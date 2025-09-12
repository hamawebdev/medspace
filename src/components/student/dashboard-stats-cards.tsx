// @ts-nocheck
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BookOpen, 
  FileText, 
  GraduationCap, 
  Layers
} from 'lucide-react';
import { useDashboardStats } from '@/hooks/use-dashboard-stats';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  loading?: boolean;
  className?: string;
}

function StatCard({ title, value, icon: Icon, loading, className }: StatCardProps) {
  if (loading) {
    return (
      <Card className={cn("relative overflow-hidden", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-[calc(var(--spacing)*2)]">
          <CardTitle className="text-sm font-medium">
            <Skeleton className="h-4 w-24" />
          </CardTitle>
          <Skeleton className="h-4 w-4 rounded" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 mb-1" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02]",
      "bg-card border-border",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-[calc(var(--spacing)*2)]">
        <CardTitle className="text-sm font-medium text-muted-foreground tracking-tight">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground tracking-tight">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardStatsCards() {
  const { 
    availableQuestions, 
    availableExams, 
    availableModules, 
    availableUnits, 
    loading, 
    error 
  } = useDashboardStats();

  if (error) {
    return (
      <div className="grid gap-[calc(var(--spacing)*4)] md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="relative overflow-hidden bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-[calc(var(--spacing)*2)]">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Error loading data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">--</div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-[calc(var(--spacing)*4)] md:grid-cols-2 lg:grid-cols-4">
      {/* Available Questions */}
      <StatCard
        title="Available Questions"
        value={availableQuestions}
        icon={FileText}
        loading={loading}
        className="hover:bg-gradient-to-br hover:from-chart-1/5 hover:to-chart-1/10"
      />

      {/* Available Exams */}
      <StatCard
        title="Available Exams"
        value={availableExams}
        icon={GraduationCap}
        loading={loading}
        className="hover:bg-gradient-to-br hover:from-chart-2/5 hover:to-chart-2/10"
      />

      {/* Available Modules */}
      <StatCard
        title="Available Modules"
        value={availableModules}
        icon={BookOpen}
        loading={loading}
        className="hover:bg-gradient-to-br hover:from-chart-3/5 hover:to-chart-3/10"
      />

      {/* Available Units */}
      <StatCard
        title="Available Units"
        value={availableUnits}
        icon={Layers}
        loading={loading}
        className="hover:bg-gradient-to-br hover:from-chart-4/5 hover:to-chart-4/10"
      />
    </div>
  );
}
