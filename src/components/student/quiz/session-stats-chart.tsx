// @ts-nocheck
'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

// Chart colors following the design system
const CHART_COLORS = {
  correct: '#00B050', // Green for correct answers
  incorrect: '#FF0000', // Red for incorrect answers  
  unanswered: '#3b82f6', // Blue for unanswered questions
};

interface SessionStatsData {
  totalQuestions: number;
  answeredQuestions?: number;
  correctAnswers?: number;
  incorrectAnswers?: number;
  // Alternative data sources
  scoreOutOf20?: number;
  percentageScore?: number;
  timeSpent?: number;
  status?: string;
}

interface SessionStatsChartProps {
  data: SessionStatsData | null;
  className?: string;
  showTitle?: boolean;
  title?: string;
  size?: 'sm' | 'md' | 'lg';
  showLegend?: boolean;
  showTooltip?: boolean;
  fallbackMessage?: string;
}

interface ChartDataPoint {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

export function SessionStatsChart({
  data,
  className = '',
  showTitle = true,
  title = 'Session Statistics',
  size = 'md',
  showLegend = true,
  showTooltip = true,
  fallbackMessage = 'Aucune statistique disponible.'
}: SessionStatsChartProps) {
  
  // Calculate chart data from session stats
  const calculateChartData = (sessionData: SessionStatsData): ChartDataPoint[] | null => {
    if (!sessionData || sessionData.totalQuestions === 0) {
      return null;
    }

    const { totalQuestions, answeredQuestions, correctAnswers, incorrectAnswers } = sessionData;
    
    // Calculate values with fallbacks
    let correct = correctAnswers || 0;
    let incorrect = incorrectAnswers || 0;
    let answered = answeredQuestions || (correct + incorrect);
    let unanswered = Math.max(0, totalQuestions - answered);

    // If we don't have correct/incorrect breakdown but have percentage and answered count
    if (correct === 0 && incorrect === 0 && answered > 0 && sessionData.percentageScore !== undefined) {
      correct = Math.round((sessionData.percentageScore / 100) * answered);
      incorrect = answered - correct;
    }

    // Validate data consistency
    if (correct + incorrect + unanswered !== totalQuestions) {
      // Adjust unanswered to maintain total
      unanswered = Math.max(0, totalQuestions - correct - incorrect);
    }

    const chartData: ChartDataPoint[] = [];

    if (correct > 0) {
      chartData.push({
        name: 'Correct',
        value: correct,
        color: CHART_COLORS.correct,
        percentage: Math.round((correct / totalQuestions) * 100)
      });
    }

    if (incorrect > 0) {
      chartData.push({
        name: 'Incorrect', 
        value: incorrect,
        color: CHART_COLORS.incorrect,
        percentage: Math.round((incorrect / totalQuestions) * 100)
      });
    }

    if (unanswered > 0) {
      chartData.push({
        name: 'Unanswered',
        value: unanswered,
        color: CHART_COLORS.unanswered,
        percentage: Math.round((unanswered / totalQuestions) * 100)
      });
    }

    return chartData.length > 0 ? chartData : null;
  };

  const chartData = data ? calculateChartData(data) : null;

  // Size configurations
  const sizeConfig = {
    sm: { 
      chartSize: 120, 
      innerRadius: 35, 
      outerRadius: 55,
      containerHeight: 'h-48',
      textSize: 'text-xs'
    },
    md: { 
      chartSize: 200, 
      innerRadius: 60, 
      outerRadius: 90,
      containerHeight: 'h-64',
      textSize: 'text-sm'
    },
    lg: { 
      chartSize: 280, 
      innerRadius: 80, 
      outerRadius: 120,
      containerHeight: 'h-80',
      textSize: 'text-base'
    }
  };

  const config = sizeConfig[size];

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-semibold text-popover-foreground">
            {data.name}: {data.value} ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  // Error/fallback state
  if (!data || !chartData || chartData.length === 0) {
    return (
      <Card className={cn("border-border/50 shadow-sm", className)}>
        {showTitle && (
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-lg flex items-center justify-center gap-2">
              <AlertTriangle className="h-5 w-5 text-muted-foreground" />
              {title}
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className={cn("flex items-center justify-center text-muted-foreground", config.containerHeight)}>
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className={config.textSize}>{fallbackMessage}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-border/50 shadow-sm", className)}>
      {showTitle && (
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-lg flex items-center justify-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            {title}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className={cn("w-full", config.containerHeight)}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={config.innerRadius}
                outerRadius={config.outerRadius}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              {showTooltip && <Tooltip content={<CustomTooltip />} />}
              {showLegend && (
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  wrapperStyle={{ fontSize: '12px' }}
                  formatter={(value, entry: any) => (
                    <span style={{ color: entry.color }}>
                      {value} ({entry.payload.percentage}%)
                    </span>
                  )}
                />
              )}
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Summary stats below chart */}
        {data && (
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className={cn("font-bold text-2xl", config.textSize)} style={{ color: CHART_COLORS.correct }}>
                {chartData.find(d => d.name === 'Correct')?.value || 0}
              </div>
              <div className="text-xs text-muted-foreground">Correct</div>
            </div>
            <div className="space-y-1">
              <div className={cn("font-bold text-2xl", config.textSize)} style={{ color: CHART_COLORS.incorrect }}>
                {chartData.find(d => d.name === 'Incorrect')?.value || 0}
              </div>
              <div className="text-xs text-muted-foreground">Incorrect</div>
            </div>
            <div className="space-y-1">
              <div className={cn("font-bold text-2xl", config.textSize)} style={{ color: CHART_COLORS.unanswered }}>
                {chartData.find(d => d.name === 'Unanswered')?.value || 0}
              </div>
              <div className="text-xs text-muted-foreground">Unanswered</div>
            </div>
          </div>
        )}

        {/* Additional metrics if available */}
        {data?.percentageScore !== undefined && (
          <div className="mt-4 pt-4 border-t border-border/50 text-center">
            <div className="text-2xl font-bold text-primary">
              {Math.round(data.percentageScore)}%
            </div>
            <div className="text-sm text-muted-foreground">Accuracy</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SessionStatsChart;
