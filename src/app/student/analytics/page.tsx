// @ts-nocheck
'use client';

import { ErrorBoundary } from '@/components/error-boundary';
import { SessionStats } from '@/components/student/analytics/session-stats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Target, Clock, Award, BookOpen } from 'lucide-react';

export default function StudentAnalyticsPage() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8 max-w-7xl">
          {/* Header Section */}
          <div className="mb-4 sm:mb-6 lg:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-primary flex items-center justify-center shadow-lg">
                  <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
                    Analytics Dashboard
                  </h1>
                  <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">
                    Track your learning progress and performance insights
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 self-start sm:self-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                Live Data
              </Badge>
            </div>
          </div>

          {/* Quick Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
            <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 p-3 sm:p-4 lg:pb-3 lg:p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Total Sessions</CardTitle>
                  <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="pt-0 p-3 sm:p-4 lg:p-6">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-primary">247</div>
                <p className="text-xs text-muted-foreground">+12 this week</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 p-3 sm:p-4 lg:pb-3 lg:p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Average Score</CardTitle>
                  <Target className="h-3 w-3 sm:h-4 sm:w-4 text-chart-1" />
                </div>
              </CardHeader>
              <CardContent className="pt-0 p-3 sm:p-4 lg:p-6">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-chart-1">84%</div>
                <p className="text-xs text-muted-foreground">+3% improvement</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 p-3 sm:p-4 lg:pb-3 lg:p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Study Time</CardTitle>
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent className="pt-0 p-3 sm:p-4 lg:p-6">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">42h</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 p-3 sm:p-4 lg:pb-3 lg:p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Achievements</CardTitle>
                  <Award className="h-3 w-3 sm:h-4 sm:w-4 text-chart-4" />
                </div>
              </CardHeader>
              <CardContent className="pt-0 p-3 sm:p-4 lg:p-6">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-chart-4">15</div>
                <p className="text-xs text-muted-foreground">Badges earned</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Analytics Content */}
          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-0">
              <SessionStats />
            </CardContent>
          </Card>
        </div>
      </div>
    </ErrorBoundary>
  );
}
