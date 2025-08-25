// @ts-nocheck
import { ResponsiveContainer, BarChart, XAxis, YAxis, Bar, Tooltip, Legend, LineChart, Line, Area, AreaChart } from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart as LineChartIcon,
  Calendar,
  Target,
  Award
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface DataPoint {
  date: string
  correct: number
  incorrect: number
  viewed: number
}

interface Props {
  weeklyPerformance: DataPoint[]
}

export function WeeklyPerformanceChart({ weeklyPerformance }: Props) {
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area'>('bar')

  const data = weeklyPerformance.map((d) => ({
    name: new Date(d.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    date: d.date,
    Correct: d.correct,
    Incorrect: d.incorrect,
    Viewed: d.viewed,
    Total: d.correct + d.incorrect + d.viewed,
    Accuracy: Math.round((d.correct / (d.correct + d.incorrect)) * 100) || 0
  }))

  // Chart colors using design system values
  const colors = {
    Correct: '#10b981', // chart-2 equivalent - Green
    Incorrect: '#ec4899', // chart-5 equivalent - Pink
    Viewed: '#f59e0b', // chart-3 equivalent - Orange
    Accuracy: '#3b82f6' // chart-1 equivalent - Blue
  }

  // Calculate trends
  const totalQuestions = data.reduce((sum, d) => sum + d.Total, 0)
  const totalCorrect = data.reduce((sum, d) => sum + d.Correct, 0)
  const overallAccuracy = Math.round((totalCorrect / (totalQuestions - data.reduce((sum, d) => sum + d.Viewed, 0))) * 100) || 0

  const lastWeekAccuracy = data[data.length - 1]?.Accuracy || 0
  const previousWeekAccuracy = data[data.length - 2]?.Accuracy || 0
  const accuracyTrend = lastWeekAccuracy - previousWeekAccuracy

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className='bg-card/95 backdrop-blur-sm border border-border rounded-lg p-[calc(var(--spacing)*3)] shadow-xl'>
          <p className='text-sm font-semibold mb-[calc(var(--spacing)*2)] tracking-tight text-foreground'>{`Week: ${label}`}</p>
          <div className='space-y-[calc(var(--spacing)*1)]'>
            {payload.map((entry: any, index: number) => (
              <div key={index} className='flex items-center gap-[calc(var(--spacing)*2)]'>
                <div
                  className='w-2 h-2 rounded-full shadow-sm'
                  style={{ backgroundColor: entry.color }}
                ></div>
                <p className='text-xs leading-relaxed text-muted-foreground font-medium'>
                  <span className='font-semibold text-foreground'>{entry.dataKey}:</span> {entry.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )
    }
    return null
  }

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 20, right: 10, left: 10, bottom: 5 }
    }

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <XAxis
              dataKey="name"
              stroke="hsl(var(--muted-foreground))"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              tick={{ fontSize: 10 }}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10 }}
              width={30}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '12px' }}
              iconType="circle"
            />
            <Line
              type="monotone"
              dataKey="Correct"
              stroke={colors.Correct}
              strokeWidth={2}
              dot={{ fill: colors.Correct, strokeWidth: 1, r: 3 }}
              activeDot={{ r: 5, strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="Incorrect"
              stroke={colors.Incorrect}
              strokeWidth={2}
              dot={{ fill: colors.Incorrect, strokeWidth: 1, r: 3 }}
              activeDot={{ r: 5, strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="Viewed"
              stroke={colors.Viewed}
              strokeWidth={2}
              dot={{ fill: colors.Viewed, strokeWidth: 1, r: 3 }}
              activeDot={{ r: 5, strokeWidth: 2 }}
            />
          </LineChart>
        )

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <XAxis
              dataKey="name"
              stroke="hsl(var(--muted-foreground))"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              tick={{ fontSize: 10 }}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10 }}
              width={30}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '12px' }}
              iconType="rect"
            />
            <Area
              type="monotone"
              dataKey="Correct"
              stackId="1"
              stroke={colors.Correct}
              fill={colors.Correct}
              fillOpacity={0.7}
            />
            <Area
              type="monotone"
              dataKey="Incorrect"
              stackId="1"
              stroke={colors.Incorrect}
              fill={colors.Incorrect}
              fillOpacity={0.7}
            />
            <Area
              type="monotone"
              dataKey="Viewed"
              stackId="1"
              stroke={colors.Viewed}
              fill={colors.Viewed}
              fillOpacity={0.7}
            />
          </AreaChart>
        )

      default:
        return (
          <BarChart {...commonProps}>
            <XAxis
              dataKey="name"
              stroke="hsl(var(--muted-foreground))"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              tick={{ fontSize: 10 }}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10 }}
              width={30}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '12px' }}
              iconType="rect"
            />
            <Bar dataKey="Correct" fill={colors.Correct} radius={[3, 3, 0, 0]} />
            <Bar dataKey="Incorrect" fill={colors.Incorrect} radius={[3, 3, 0, 0]} />
            <Bar dataKey="Viewed" fill={colors.Viewed} radius={[3, 3, 0, 0]} />
          </BarChart>
        )
    }
  }

  return (
    <Card className='relative overflow-hidden bg-gradient-to-br from-chart-2/12 to-chart-2/8 border border-chart-2/20 shadow-xl hover:shadow-2xl transition-all duration-300'>
      {/* Enhanced background elements for visual depth */}
      <div className='absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-chart-2/15 to-chart-2/25 rounded-full blur-3xl'></div>
      <div className='absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-chart-1/10 to-chart-3/15 rounded-full blur-2xl'></div>
      <div className='absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/5'></div>

      <CardHeader className='relative pb-[calc(var(--spacing)*4)]'>
        <div className='flex flex-col gap-[calc(var(--spacing)*3)]'>
          <div className='flex flex-col sm:flex-row sm:items-start justify-between gap-[calc(var(--spacing)*3)] sm:gap-[calc(var(--spacing)*4)]'>
            <div className='space-y-[calc(var(--spacing)*1)] min-w-0 flex-1'>
              <CardTitle className='flex items-center gap-[calc(var(--spacing)*2)] tracking-tight text-lg sm:text-xl'>
                <div className='p-[calc(var(--spacing)*1)] bg-gradient-to-r from-chart-2/20 to-chart-1/20 rounded-lg'>
                  <BarChart3 className='h-4 w-4 text-chart-2 flex-shrink-0' />
                </div>
                <span className='truncate'>Weekly Performance</span>
              </CardTitle>
              <CardDescription className='flex items-center gap-[calc(var(--spacing)*2)] leading-relaxed text-sm pl-[calc(var(--spacing)*7)]'>
                {accuracyTrend !== 0 && (
                  <>
                    <div className='p-[calc(var(--spacing)*0.5)] bg-gradient-to-r from-muted/20 to-muted/10 rounded-full'>
                      {accuracyTrend > 0 ? (
                        <TrendingUp className='h-3 w-3 text-chart-2 flex-shrink-0' />
                      ) : (
                        <TrendingDown className='h-3 w-3 text-chart-5 flex-shrink-0' />
                      )}
                    </div>
                    <span className='truncate'>
                      {accuracyTrend > 0 ? 'Improving' : 'Declining'} by {Math.abs(accuracyTrend)}%
                    </span>
                  </>
                )}
              </CardDescription>
            </div>

            <Badge variant='outline' className='bg-card/50 backdrop-blur-sm text-xs font-medium self-start sm:self-auto flex-shrink-0 border-chart-2/30'>
              {data.length} Week{data.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          {/* Mobile-Optimized Chart Type Controls */}
          <div className='flex items-center justify-center sm:justify-end'>
            <div className='flex items-center gap-[calc(var(--spacing)*1)] bg-card/50 backdrop-blur-sm rounded-lg p-[calc(var(--spacing)*1)] border border-border/30'>
              <Button
                variant={chartType === 'bar' ? 'default' : 'ghost'}
                size='sm'
                onClick={() => setChartType('bar')}
                className='h-8 px-[calc(var(--spacing)*2)] text-xs'
              >
                <BarChart3 className='h-3 w-3 sm:mr-[calc(var(--spacing)*1)]' />
                <span className='hidden sm:inline'>Bar</span>
              </Button>
              <Button
                variant={chartType === 'line' ? 'default' : 'ghost'}
                size='sm'
                onClick={() => setChartType('line')}
                className='h-8 px-[calc(var(--spacing)*2)] text-xs'
              >
                <LineChartIcon className='h-3 w-3 sm:mr-[calc(var(--spacing)*1)]' />
                <span className='hidden sm:inline'>Line</span>
              </Button>
              <Button
                variant={chartType === 'area' ? 'default' : 'ghost'}
                size='sm'
                onClick={() => setChartType('area')}
                className='h-8 px-[calc(var(--spacing)*2)] text-xs'
              >
                <Target className='h-3 w-3 sm:mr-[calc(var(--spacing)*1)]' />
                <span className='hidden sm:inline'>Area</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Performance Summary */}
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-[calc(var(--spacing)*3)] mt-[calc(var(--spacing)*4)]'>
          <div className='group bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm rounded-lg p-[calc(var(--spacing)*3)] text-center border border-chart-2/20 hover:border-chart-2/30 transition-all'>
            <div className='flex items-center justify-center mb-[calc(var(--spacing)*1)]'>
              <div className='p-[calc(var(--spacing)*1)] bg-chart-2/20 rounded-full'>
                <Target className='h-3 w-3 text-chart-2' />
              </div>
            </div>
            <div className='text-lg font-bold text-chart-2 tracking-tight'>{overallAccuracy}%</div>
            <div className='text-xs text-muted-foreground font-medium leading-relaxed'>Overall Accuracy</div>
          </div>

          <div className='group bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm rounded-lg p-[calc(var(--spacing)*3)] text-center border border-chart-1/20 hover:border-chart-1/30 transition-all'>
            <div className='flex items-center justify-center mb-[calc(var(--spacing)*1)]'>
              <div className='p-[calc(var(--spacing)*1)] bg-chart-1/20 rounded-full'>
                <BarChart3 className='h-3 w-3 text-chart-1' />
              </div>
            </div>
            <div className='text-lg font-bold text-chart-1 tracking-tight'>{totalQuestions}</div>
            <div className='text-xs text-muted-foreground font-medium leading-relaxed'>Total Questions</div>
          </div>

          <div className='group bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm rounded-lg p-[calc(var(--spacing)*3)] text-center border border-chart-3/20 hover:border-chart-3/30 transition-all'>
            <div className='flex items-center justify-center mb-[calc(var(--spacing)*1)]'>
              <div className={cn(
                'p-[calc(var(--spacing)*1)] rounded-full',
                accuracyTrend > 0 ? 'bg-chart-2/20' : accuracyTrend < 0 ? 'bg-chart-5/20' : 'bg-chart-3/20'
              )}>
                {accuracyTrend > 0 ? (
                  <TrendingUp className='h-3 w-3 text-chart-2' />
                ) : accuracyTrend < 0 ? (
                  <TrendingDown className='h-3 w-3 text-chart-5' />
                ) : (
                  <Award className='h-3 w-3 text-chart-3' />
                )}
              </div>
            </div>
            <div className={cn(
              'text-lg font-bold tracking-tight',
              accuracyTrend > 0 ? 'text-chart-2' : accuracyTrend < 0 ? 'text-chart-5' : 'text-chart-3'
            )}>
              {Math.abs(accuracyTrend)}%
            </div>
            <div className='text-xs text-muted-foreground font-medium leading-relaxed'>Weekly Trend</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className='relative'>
        {/* Enhanced Mobile-Responsive Chart Container */}
        <div className='w-full h-56 sm:h-72 lg:h-80 bg-gradient-to-br from-background/50 to-card/30 rounded-lg p-[calc(var(--spacing)*2)] sm:p-[calc(var(--spacing)*3)] border border-border/30'>
          <ResponsiveContainer width='100%' height='100%'>
            {renderChart()}
          </ResponsiveContainer>
        </div>


      </CardContent>
    </Card>
  )
}