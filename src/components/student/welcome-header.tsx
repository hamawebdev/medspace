// @ts-nocheck
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Calendar,
  TrendingUp,
  GraduationCap,
  MapPin
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface WelcomeHeaderProps {
  user: {
    name: string
    avatar?: string | null
    university?: string | null
    year?: number | null
  }
}

export function WelcomeHeader({ user }: WelcomeHeaderProps) {
  const router = useRouter()
  const { name, avatar, university, year } = user
  const fallback = name ? name.charAt(0).toUpperCase() : 'U'

  // Get current time for personalized greeting
  const currentHour = new Date().getHours()
  const getGreeting = () => {
    if (currentHour < 12) return 'Good morning'
    if (currentHour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const getYearDisplay = (yearNum: number) => {
    const yearMap: { [key: number]: string } = {
      1: '1st Year',
      2: '2nd Year',
      3: '3rd Year',
      4: '4th Year',
      5: '5th Year',
      6: '6th Year',
      7: '7th Year'
    }
    return yearMap[yearNum] || `Year ${yearNum}`
  }

  return (
    <Card className="relative overflow-hidden bg-gradient-to-r from-background via-accent/5 to-background border-0 shadow-lg">
      {/* Enhanced background decoration for better visual hierarchy */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-chart-1/10 to-chart-2/15 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-chart-3/8 to-chart-4/10 rounded-full blur-2xl"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-accent/3 to-muted/5 rounded-full blur-3xl"></div>

      <CardContent className="relative p-[calc(var(--spacing)*6)] sm:p-[calc(var(--spacing)*8)] backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[calc(var(--spacing)*4)]">
          {/* User Info Section */}
          <div className="flex items-center gap-[calc(var(--spacing)*3)] sm:gap-[calc(var(--spacing)*4)]">
            <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-gray-200 dark:border-gray-700 flex-shrink-0">
              <AvatarImage src={avatar || undefined} alt={name} />
              <AvatarFallback className="bg-gradient-to-br from-chart-1 to-chart-2 text-white font-semibold">
                {fallback}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-[calc(var(--spacing)*1)] min-w-0 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-[calc(var(--spacing)*1)] sm:gap-[calc(var(--spacing)*2)]">
                <h2 className="text-foreground tracking-tight text-lg sm:text-xl truncate">
                  {getGreeting()}, {name}!
                </h2>
                <Badge variant="outline" className="bg-card/50 backdrop-blur-sm text-xs font-medium self-start sm:self-auto">
                  Student
                </Badge>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-[calc(var(--spacing)*2)] sm:gap-[calc(var(--spacing)*4)] text-sm text-muted-foreground leading-relaxed">
                {university && (
                  <div className="flex items-center gap-[calc(var(--spacing)*1)]">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="font-medium truncate">{university}</span>
                  </div>
                )}

                {year && (
                  <div className="flex items-center gap-[calc(var(--spacing)*1)]">
                    <GraduationCap className="h-3 w-3 flex-shrink-0" />
                    <span className="font-medium">{getYearDisplay(year)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Date and Quick Action */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-[calc(var(--spacing)*3)] sm:gap-[calc(var(--spacing)*4)] w-full sm:w-auto">
            <div className="text-left sm:text-right order-2 sm:order-1">
              <div className="flex items-center gap-[calc(var(--spacing)*2)] text-sm font-medium text-muted-foreground mb-[calc(var(--spacing)*1)] leading-relaxed">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline">{new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}</span>
                <span className="sm:hidden">{new Date().toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                })}</span>
              </div>
              <div className="text-xs text-muted-foreground leading-relaxed hidden sm:block">
                Ready to continue learning?
              </div>
            </div>

            <Button onClick={() => router.push('/student/practice')} className="gap-[calc(var(--spacing)*2)] bg-gradient-to-r from-chart-1 to-chart-2 hover:opacity-90 text-white shadow-lg font-semibold tracking-tight order-1 sm:order-2 w-full sm:w-auto">
              <TrendingUp className="h-4 w-4" />
              <span className="sm:hidden">Continue</span>
              <span className="hidden sm:inline">Continue Learning</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
