// @ts-nocheck
'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserSubscriptions } from '@/hooks/use-subscription';
import { StudentService } from '@/lib/api-services';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DataLoadingState } from '@/components/loading-states';
type PricingMode = 'YEAR' | 'MONTH';
import { Crown, BookOpen, Shield, RefreshCw, Clock, Gift } from 'lucide-react';
import type { StudyPack } from '@/types/api';

export default function BrowseSubscriptionsPage() {
  const router = useRouter();
  const [packsLoading, setPacksLoading] = useState(true);
  const [packsError, setPacksError] = useState<string | null>(null);
  const [studyPacks, setStudyPacks] = useState<any[]>([]);

  const [pricingMode, setPricingMode] = useState<PricingMode>('YEAR');
  const loadPacks = async () => {
    try {
      setPacksLoading(true);
      setPacksError(null);
      const res = await StudentService.getStudyPacks({ page: 1, limit: 24 });
      const data = (res as any)?.data?.data || (res as any)?.data || res;
      const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      setStudyPacks(list);
    } catch (e: any) {
      setPacksError(e?.message || 'Failed to load study packs');
    } finally {
      setPacksLoading(false);
    }
  };
  // initial load
  useEffect(() => { loadPacks(); }, []);

  const { subscriptions, loading: subsLoading } = useUserSubscriptions();
  const [redeemOpen, setRedeemOpen] = useState(false);

  const now = new Date();

  const activeSub = useMemo(() => {
    const list = Array.isArray(subscriptions) ? subscriptions : [];
    return list.find((s) => s.status === 'ACTIVE' && new Date(s.endDate).getTime() >= now.getTime());
  }, [subscriptions]);

  const cancelledWithinGraceIds = useMemo(() => {
    const list = Array.isArray(subscriptions) ? subscriptions : [];
    const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
    return new Set(
      list
        .filter((s) => s.status !== 'ACTIVE')
        .filter((s) => {
          const updated = new Date(s.updatedAt).getTime();
          return now.getTime() - updated <= threeDaysMs;
        })
        .map((s) => s.studyPackId)
    );
  }, [subscriptions]);

  const cancelledExpiredIds = useMemo(() => {
    const list = Array.isArray(subscriptions) ? subscriptions : [];
    const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
    return new Set(
      list
        .filter((s) => s.status !== 'ACTIVE')
        .filter((s) => {
          const updated = new Date(s.updatedAt).getTime();
          return now.getTime() - updated > threeDaysMs;
        })
        .map((s) => s.studyPackId)
    );
  }, [subscriptions]);

  const residencyActive = useMemo(() => {
    if (!activeSub) return false;
    const pack = subscriptions?.find((s) => s.studyPackId === activeSub.studyPackId)?.studyPack;
    return pack?.type === 'RESIDENCY';
  }, [activeSub, subscriptions]);

  const visiblePacks: StudyPack[] = useMemo(() => {
    const list = Array.isArray(studyPacks) ? studyPacks : [];
    return list.filter((p) => {
      // Hide user's currently active pack
      if (activeSub && p.id === activeSub.studyPackId) return false;
      // Hide cancelled/expired packs beyond grace period
      if (cancelledExpiredIds.has(p.id)) return false;
      return true;
    });
  }, [studyPacks, activeSub, cancelledExpiredIds]);

  const isDisabledForUser = (pack: StudyPack) => {
    // Cancelled within grace can be renewed
    if (cancelledWithinGraceIds.has(pack.id)) return false;
    // If user has active sub, all other packs are disabled due to single-subscription rule
    if (activeSub) return true;
    // Non-subscribers: cards are viewable; CTA is purchase, not disabled
    return false;
  };

  const getCta = (pack: StudyPack) => {
    const isGrace = cancelledWithinGraceIds.has(pack.id);
    if (isGrace) return { label: 'Renew', variant: 'default' as const };
    if (activeSub) return { label: residencyActive ? 'Included with Residency' : 'Subscription Active', variant: 'outline' as const };
    return { label: 'Subscribe', variant: 'default' as const };
  };

  const handleCtaClick = (pack: StudyPack) => {
    const isGrace = cancelledWithinGraceIds.has(pack.id);
    if (isGrace) {
      // Redirect to manage subscriptions for renewal flow (payment integration TBD)
      router.push('/student/subscriptions');
      return;
    }
    if (activeSub) {
      // Do nothing; disabled
      return;
    }

    // Non-subscriber subscribe flow - redirect to payment page
    const durationType = pricingMode === 'YEAR' ? 'yearly' : 'monthly';
    const durationValue = pricingMode === 'YEAR' ? '1' : '1'; // Default to 1 year or 1 month

    const paymentUrl = `/student/subscriptions/payment?studyPackId=${pack.id}&durationType=${durationType}&durationValue=${durationValue}`;
    router.push(paymentUrl);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="space-y-8 p-4 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Browse Subscriptions</h1>
            <p className="text-muted-foreground leading-relaxed">
              Explore all study packs. You can only have one active subscription at a time.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => loadPacks()} disabled={packsLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${packsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant={pricingMode === 'YEAR' ? 'default' : 'outline'} onClick={() => setPricingMode('YEAR')}>
              Yearly
            </Button>
            <Button variant={pricingMode === 'MONTH' ? 'default' : 'outline'} onClick={() => setPricingMode('MONTH')}>
              Monthly
            </Button>
            <Button variant="outline" onClick={() => setRedeemOpen(true)}>
              <Gift className="h-4 w-4 mr-2" />
              Redeem Activation Code
            </Button>
          </div>
        </div>

        {/* Loading / Error */}
        {packsLoading || subsLoading ? (
          <DataLoadingState />
        ) : packsError ? (
          <Card>
            <CardContent className="py-8 text-center">Failed to load study packs.</CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visiblePacks.map((pack) => {
              const disabled = isDisabledForUser(pack);
              const cta = getCta(pack);
              const isResidency = pack.type === 'RESIDENCY';
              const isGrace = cancelledWithinGraceIds.has(pack.id);

              return (
                <Card key={pack.id} className={`h-full ${disabled && !isGrace ? 'opacity-60' : ''}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-xl">{pack.name}</CardTitle>
                        <CardDescription>{pack.description}</CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant={isResidency ? 'default' : 'secondary'}>
                          {isResidency ? 'Residency' : pack.yearNumber ? `${pack.yearNumber} Year` : 'Year Pack'}
                        </Badge>
                        {isGrace && (
                          <Badge variant="outline" className="text-amber-500 border-amber-500/40">
                            <Clock className="h-3 w-3 mr-1" /> Renew available 3 days
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">Price</div>
                      <div className="font-semibold">
                        {pricingMode === 'YEAR'
                          ? (pack.pricePerYear ? `${pack.pricePerYear} DA / year` : 'N/A')
                          : (pack.pricePerMonth ? `${pack.pricePerMonth} DA / month` : 'N/A')}
                      </div>
                    </div>
                    {isResidency && (
                      <div className="text-xs text-muted-foreground">
                        <Shield className="inline h-3 w-3 mr-1" /> Includes access to ALL Year Packs (ONE–SEVEN)
                      </div>
                    )}
                    <Separator />
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        variant={cta.variant}
                        disabled={disabled && !isGrace}
                        title={disabled && !isGrace ? 'You already have an active subscription' : ''}
                        onClick={() => handleCtaClick(pack)}
                      >
                        {cta.label}
                      </Button>
                      <Button
                        variant="outline"
                        disabled
                        title="Content access is restricted to your active pack"
                      >
                        <BookOpen className="h-4 w-4 mr-2" /> View Content
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Simple placeholder for upcoming activation-code flow */}
        {redeemOpen && (
          <Card>
            <CardHeader>
              <CardTitle>Redeem Activation Code</CardTitle>
              <CardDescription>Coming soon. You will be able to activate a pack with a code.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setRedeemOpen(false)}>Close</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

