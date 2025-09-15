// @ts-nocheck
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BookOpen, 
  FileText, 
  Layers
} from 'lucide-react';
import { useStudentDashboardStats } from '@/hooks/use-student-dashboard-stats';
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
    derivedData,
    loading,
    error
  } = useStudentDashboardStats();

  if (error) {
    return (
      <div className="grid gap-[calc(var(--spacing)*4)] md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="relative overflow-hidden bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-[calc(var(--spacing)*2)]">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Impossible de charger les statistiques du tableau de bord.
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

  const statsCards = derivedData?.statsCards;

  return (
    <div className="grid gap-[calc(var(--spacing)*4)] md:grid-cols-2 lg:grid-cols-3">
      {/* Total Questions */}
      <StatCard
        title="Total Questions"
        value={statsCards?.totalQuestions || 0}
        icon={FileText}
        loading={loading}
        className="hover:bg-gradient-to-br hover:from-chart-1/5 hover:to-chart-1/10"
      />

      {/* Independent Modules */}
      <StatCard
        title="Independent Modules"
        value={statsCards?.independentModules || 0}
        icon={BookOpen}
        loading={loading}
        className="hover:bg-gradient-to-br hover:from-chart-3/5 hover:to-chart-3/10"
      />

      {/* Total Units */}
      <StatCard
        title="Total Units"
        value={statsCards?.totalUnits || 0}
        icon={Layers}
        loading={loading}
        className="hover:bg-gradient-to-br hover:from-chart-4/5 hover:to-chart-4/10"
      />
    </div>
  );
}
