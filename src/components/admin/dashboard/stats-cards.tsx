'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  BookOpen, 
  Activity, 
  CreditCard,
  TrendingUp,
  TrendingDown,
  UserPlus,
  PlayCircle
} from 'lucide-react';
import { DashboardStats } from '@/types/api';
import { cn } from '@/lib/utils';

interface StatsCardsProps {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
}

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ElementType;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  loading?: boolean;
  className?: string;
}

function StatCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend, 
  loading = false,
  className 
}: StatCardProps) {
  if (loading) {
    return (
      <Card className={cn("relative overflow-hidden", className)}>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <Skeleton className="w-24 h-4" />
          <Skeleton className="w-4 h-4 rounded" />
        </CardHeader>
        <CardContent>
          <Skeleton className="w-16 h-8 mb-2" />
          <Skeleton className="w-32 h-3" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("relative overflow-hidden hover:shadow-md transition-all duration-300", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0">
        <CardTitle className="text-sm font-semibold text-muted-foreground tracking-tight">
          {title}
        </CardTitle>
        <div className="flex items-center justify-center w-8 h-8 bg-muted/30 rounded-lg">
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-3xl font-bold tracking-tight text-foreground leading-none">
          {value.toLocaleString()}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
        {trend && (
          <div className="flex items-center gap-2 pt-1">
            <div className={cn(
              "flex items-center justify-center w-5 h-5 rounded-full",
              trend.isPositive ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"
            )}>
              {trend.isPositive ? (
                <TrendingUp className="w-3 h-3 text-green-600 dark:text-green-400" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-600 dark:text-red-400" />
              )}
            </div>
            <span className={cn(
              "text-sm font-semibold",
              trend.isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
            )}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
            <span className="text-sm text-muted-foreground">
              {trend.label}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function StatsCards({ stats, loading, error }: StatsCardsProps) {
  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-red-200 bg-red-50/50">
            <CardContent className="p-6">
              <div className="text-center text-red-600">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Failed to load</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Users */}
      <StatCard
        title="Total Users"
        value={stats?.users?.total || 0}
        description={`${stats?.users?.students || 0} students, ${stats?.users?.employees || 0} employees`}
        icon={Users}
        trend={stats?.users?.newThisMonth ? {
          value: stats.users.newThisMonth,
          isPositive: stats.users.newThisMonth > 0,
          label: "new this month"
        } : undefined}
        loading={loading}
      />

      {/* Total Content */}
      <StatCard
        title="Content Library"
        value={stats?.content?.totalQuestions || 0}
        description={`${stats?.content?.totalQuizzes || 0} quizzes, ${stats?.content?.totalExams || 0} exams`}
        icon={BookOpen}
        loading={loading}
      />

      {/* Active Users */}
      <StatCard
        title="Active Users"
        value={stats?.activity?.activeUsers || 0}
        description={`${stats?.activity?.sessionsToday || 0} sessions today`}
        icon={Activity}
        loading={loading}
      />

      {/* Revenue */}
      <StatCard
        title="Revenue"
        value={`$${(stats?.subscriptions?.revenue || 0).toLocaleString()}`}
        description={`${stats?.subscriptions?.active || 0} active subscriptions`}
        icon={CreditCard}
        loading={loading}
      />
    </div>
  );
}

// Additional detailed stats cards for expanded view
export function DetailedStatsCards({ stats, loading, error }: StatsCardsProps) {
  if (error || loading) {
    return null;
  }

  return (
    <div className="grid gap-6 mt-8 md:grid-cols-2 lg:grid-cols-3">
      {/* User Breakdown */}
      <Card className="hover:shadow-md transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-lg font-semibold">
            <div className="flex items-center justify-center w-8 h-8 bg-chart-1/10 rounded-lg">
              <UserPlus className="w-4 h-4 text-chart-1" />
            </div>
            User Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-medium text-muted-foreground">Students</span>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="font-semibold">{stats?.users?.students || 0}</Badge>
              <span className="text-xs text-muted-foreground font-medium min-w-[3rem] text-right">
                {stats?.users?.total ? Math.round((stats.users.students / stats.users.total) * 100) : 0}%
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-medium text-muted-foreground">Employees</span>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="font-semibold">{stats?.users?.employees || 0}</Badge>
              <span className="text-xs text-muted-foreground font-medium min-w-[3rem] text-right">
                {stats?.users?.total ? Math.round((stats.users.employees / stats.users.total) * 100) : 0}%
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-medium text-muted-foreground">Admins</span>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="font-semibold">{stats?.users?.admins || 0}</Badge>
              <span className="text-xs text-muted-foreground font-medium min-w-[3rem] text-right">
                {stats?.users?.total ? Math.round((stats.users.admins / stats.users.total) * 100) : 0}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Performance */}
      <Card className="hover:shadow-md transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-lg font-semibold">
            <div className="flex items-center justify-center w-8 h-8 bg-chart-2/10 rounded-lg">
              <PlayCircle className="w-4 h-4 text-chart-2" />
            </div>
            Session Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-medium text-muted-foreground">Total Sessions</span>
            <Badge variant="secondary" className="font-semibold">{stats?.content?.totalSessions || 0}</Badge>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-medium text-muted-foreground">Today's Sessions</span>
            <Badge variant="secondary" className="font-semibold">{stats?.activity?.sessionsToday || 0}</Badge>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-medium text-muted-foreground">Avg. Score</span>
            <Badge variant="outline" className="font-semibold">
              {stats?.activity?.averageSessionScore ? `${stats.activity.averageSessionScore}%` : 'N/A'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Status */}
      <Card className="hover:shadow-md transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-lg font-semibold">
            <div className="flex items-center justify-center w-8 h-8 bg-chart-4/10 rounded-lg">
              <CreditCard className="w-4 h-4 text-chart-4" />
            </div>
            Subscriptions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-medium text-muted-foreground">Active</span>
            <Badge variant="default" className="font-semibold">{stats?.subscriptions?.active || 0}</Badge>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-medium text-muted-foreground">Expired</span>
            <Badge variant="destructive" className="font-semibold">{stats?.subscriptions?.expired || 0}</Badge>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-medium text-muted-foreground">Total Revenue</span>
            <Badge variant="outline" className="font-semibold">
              ${(stats?.subscriptions?.revenue || 0).toLocaleString()}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
