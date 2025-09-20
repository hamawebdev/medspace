// @ts-nocheck
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useQuizFilters } from '@/hooks/use-quiz-api';
import { useUserSubscriptions, selectEffectiveActiveSubscription } from '@/hooks/use-subscription';
import { QuizService } from '@/lib/api-services';
import { NewApiService } from '@/lib/api/new-api-services';
import { toast } from 'sonner';
import { Stethoscope } from 'lucide-react';

export default function ResidencyCreatePage() {

  // Residency Filters and Form State
  const [filters, setFilters] = React.useState<{ universities: any[]; years: number[]; parts?: string[] } | null>(null);
  const [filtersLoading, setFiltersLoading] = React.useState(false);
  const [filtersError, setFiltersError] = React.useState<string | null>(null);

  const [title, setTitle] = React.useState('');
  const [selectedUniversityId, setSelectedUniversityId] = React.useState<string>('');
  const [selectedYear, setSelectedYear] = React.useState<string>('');
  const [selectedParts, setSelectedParts] = React.useState<string[]>([]);
  const [creating, setCreating] = React.useState(false);

  const loadFilters = React.useCallback(async () => {
    try {
      setFiltersLoading(true);
      setFiltersError(null);
      const res = await NewApiService.getResidencyFilters();
      const data = (res?.data?.data) ?? res?.data;
      if (res?.success && data) {
        setFilters({
          universities: data.universities || [],
          years: data.years || [],
          parts: data.parts || [],
        });
      } else {
        throw new Error(res?.error || 'Failed to load filters');
      }
    } catch (e) {
      setFiltersError('Impossible de charger les filtres de résidanat.');
    } finally {
      setFiltersLoading(false);
    }
  }, []);

  React.useEffect(() => { loadFilters(); }, [loadFilters]);

  const router = useRouter();
  const { filters: quizFilters } = useQuizFilters();
  const { subscriptions } = useUserSubscriptions();
  const { isResidency } = selectEffectiveActiveSubscription(subscriptions);

  const handleCreate = async () => {
    try {
      if (!isResidency) {
        toast.error('Residency subscription required');
        return;
      }

      if (!title.trim() || title.trim().length < 3) {
        toast.error('Please enter a title (min 3 characters)');
        return;
      }
      if (!selectedYear || !selectedUniversityId) {
        toast.error('Please select exam year and university');
        return;
      }

      setCreating(true);

      const payload = {
        title: title.trim().slice(0, 100),
        examYear: Number(selectedYear),
        universityId: Number(selectedUniversityId),
        ...(selectedParts.length ? { parts: selectedParts } : {}),
      };

      const res = await NewApiService.createResidencySession(payload);
      const sid = (res as any)?.data?.data?.sessionId ?? (res as any)?.data?.sessionId;

      if (res?.success && sid) {
        toast.success('Residency session created');
        router.push(`/session/${sid}`);
      } else {
        const errorMsg = (res as any)?.error || 'Aucune question trouvée pour ces filtres.';
        toast.error(errorMsg);
      }
    } catch (e: any) {
      console.error('[Residency/Create] error:', e);
      const message = e?.message || 'Failed to create residency session';
      toast.error(message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-8">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg">
                <Stethoscope className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-teal-600 to-teal-800 bg-clip-text text-transparent">
                  Create Residency Session
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">
                  Advanced medical training with specialized residency content
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push('/student/residency')}
              className="border-border/50 hover:bg-muted/50 self-start sm:self-center min-h-[44px]"
            >
              Back to Residency
            </Button>
          </div>
        </div>

        {/* Main Content */}
        {!isResidency ? (
          <Card className="border-border/50 shadow-lg">
            <CardHeader className="text-center pb-6">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 flex items-center justify-center mx-auto mb-4">
                <Stethoscope className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
              <CardTitle className="text-2xl">Residency Access Required</CardTitle>
            </CardHeader>
            <CardContent className="text-center pb-8">
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                You need an active Residency study pack subscription to create residency sessions with specialized medical content.
              </p>
              <Button
                onClick={() => router.push('/student/subscriptions')}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                View Subscription Plans
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border/50 shadow-lg">
            <CardContent className="p-6 space-y-6">
              {filtersError && (
                <Alert variant="destructive">
                  <AlertDescription>Impossible de charger les filtres de résidanat.</AlertDescription>
                </Alert>
              )}

              {!filtersError && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        placeholder="e.g. Residency Practice - 2024"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>University</Label>
                      <Select
                        value={selectedUniversityId}
                        onValueChange={setSelectedUniversityId}
                        disabled={filtersLoading || !filters}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={filtersLoading ? 'Loading...' : 'Select a university'} />
                        </SelectTrigger>
                        <SelectContent>
                          {filters?.universities?.map((u: any) => (
                            <SelectItem key={u.id} value={String(u.id)}>
                              {u.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Exam Year</Label>
                      <Select
                        value={selectedYear}
                        onValueChange={setSelectedYear}
                        disabled={filtersLoading || !filters}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={filtersLoading ? 'Loading...' : 'Select year'} />
                        </SelectTrigger>
                        <SelectContent>
                          {filters?.years?.map((y: number) => (
                            <SelectItem key={y} value={String(y)}>
                              {y}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Parts (optional)</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(filters?.parts || []).map((p: string) => (
                          <label key={p} className="flex items-center gap-2">
                            <Checkbox
                              checked={selectedParts.includes(p)}
                              onCheckedChange={(checked) => {
                                setSelectedParts((prev) => (checked ? [...prev, p] : prev.filter((x) => x !== p)));
                              }}
                            />
                            <span className="text-sm">{p}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-end gap-3">
                    <Button variant="outline" onClick={() => router.push('/student/residency')}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreate}
                      disabled={
                        creating || !title.trim() || title.trim().length < 3 || !selectedUniversityId || !selectedYear
                      }
                    >
                      {creating ? 'Creating...' : 'Create Session'}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

