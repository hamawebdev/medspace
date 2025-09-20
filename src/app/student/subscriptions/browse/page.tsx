// @ts-nocheck
'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUserSubscriptions } from '@/hooks/use-subscription';
import { StudentService } from '@/lib/api-services';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from '@/components/loading-states/api-loading-states';
import { RedeemActivationCodeModal } from '@/components/student/subscription/redeem-activation-code-modal';
import { SubscriptionErrorBoundary, usePerformanceMonitoring, useErrorReporting } from '@/components/student/subscription/subscription-error-boundary';
import { Crown, BookOpen, Shield, RefreshCw, Clock, Gift, AlertCircle } from 'lucide-react';
import type { StudyPack } from '@/types/api';

type PricingMode = 'YEAR' | 'MONTH';

function BrowseSubscriptionsPageContent() {
  // Performance monitoring
  usePerformanceMonitoring('BrowseSubscriptionsPage');
  const { reportError } = useErrorReporting();
  const router = useRouter();
  const [packsLoading, setPacksLoading] = useState(true);
  const [packsError, setPacksError] = useState<string | null>(null);
  const [studyPacks, setStudyPacks] = useState<any[]>([]);
  const [pricingMode, setPricingMode] = useState<PricingMode>('YEAR');

  // Memoize the loadPacks function to prevent unnecessary re-renders
  const loadPacks = useCallback(async () => {
    try {
      setPacksLoading(true);
      setPacksError(null);
      const res = await StudentService.getStudyPacks({ page: 1, limit: 24 });
      const data = (res as any)?.data?.data || (res as any)?.data || res;
      const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      setStudyPacks(list);
    } catch (e: any) {
      console.error('Failed to load study packs:', e);
      reportError(e, 'loadPacks');
      setPacksError(e?.message || 'Failed to load study packs');
    } finally {
      setPacksLoading(false);
    }
  }, [reportError]);

  // Load packs on mount
  useEffect(() => {
    loadPacks();
  }, [loadPacks]);

  const { subscriptions, loading: subsLoading, error: subsError } = useUserSubscriptions();
  const [redeemOpen, setRedeemOpen] = useState(false);

  // Memoize the current time to prevent constant recalculation
  const now = useMemo(() => new Date(), []);

  // Optimize subscription calculations with better memoization
  const subscriptionData = useMemo(() => {
    const list = Array.isArray(subscriptions) ? subscriptions : [];
    const nowTime = now.getTime();
    const threeDaysMs = 3 * 24 * 60 * 60 * 1000;

    const activeSub = list.find((s) => s.status === 'ACTIVE' && new Date(s.endDate).getTime() >= nowTime);

    const cancelledWithinGraceIds = new Set(
      list
        .filter((s) => s.status !== 'ACTIVE')
        .filter((s) => {
          const updated = new Date(s.updatedAt).getTime();
          return nowTime - updated <= threeDaysMs;
        })
        .map((s) => s.studyPackId)
    );

    const cancelledExpiredIds = new Set(
      list
        .filter((s) => s.status !== 'ACTIVE')
        .filter((s) => {
          const updated = new Date(s.updatedAt).getTime();
          return nowTime - updated > threeDaysMs;
        })
        .map((s) => s.studyPackId)
    );

    return {
      activeSub,
      cancelledWithinGraceIds,
      cancelledExpiredIds
    };
  }, [subscriptions, now]);

  const { activeSub, cancelledWithinGraceIds, cancelledExpiredIds } = subscriptionData;

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

  // Memoize these functions to prevent recreation on every render
  const isDisabledForUser = useCallback((pack: StudyPack) => {
    // Cancelled within grace can be renewed
    if (cancelledWithinGraceIds.has(pack.id)) return false;
    // If user has active sub, all other packs are disabled due to single-subscription rule
    if (activeSub) return true;
    // Non-subscribers: cards are viewable; CTA is purchase, not disabled
    return false;
  }, [cancelledWithinGraceIds, activeSub]);

  const getCta = useCallback((pack: StudyPack) => {
    const isGrace = cancelledWithinGraceIds.has(pack.id);
    if (isGrace) return { label: 'Renew', variant: 'default' as const };
    if (activeSub) return { label: residencyActive ? 'Included with Residency' : 'Subscription Active', variant: 'outline' as const };
    return { label: 'Subscribe', variant: 'default' as const };
  }, [cancelledWithinGraceIds, activeSub, residencyActive]);

  const handleCtaClick = useCallback((pack: StudyPack) => {
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
  }, [cancelledWithinGraceIds, activeSub, pricingMode, router]);

  // Handle successful activation code redemption
  const handleRedeemSuccess = useCallback(() => {
    // Refresh both study packs and subscriptions after successful redemption
    loadPacks();
    // Note: We would need to add a refresh method to useUserSubscriptions hook
    setRedeemOpen(false);
  }, [loadPacks]);

  return (
    <div className="min-h-screen bg-background">
      <div className="space-y-6 sm:space-y-8 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Browse Subscriptions</h1>
              <p className="text-muted-foreground leading-relaxed">
                Explore all study packs. You can only have one active subscription at a time.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full sm:w-auto">
              <div className="flex gap-2">
                <Button 
                  className="flex-1" 
                  variant={pricingMode === 'YEAR' ? 'default' : 'outline'} 
                  onClick={() => setPricingMode('YEAR')}
                >
                  Yearly
                </Button>
                <Button 
                  className="flex-1" 
                  variant={pricingMode === 'MONTH' ? 'default' : 'outline'} 
                  onClick={() => setPricingMode('MONTH')}
                >
                  Monthly
                </Button>
              </div>
              <Button 
                className="w-full sm:w-auto" 
                variant="outline" 
                onClick={() => setRedeemOpen(true)}
              >
                <Gift className="h-4 w-4 mr-2" />
                Redeem Activation Code
              </Button>
            </div>
          </div>
        </div>

        {/* Loading / Error */}
        {packsLoading || subsLoading ? (
          <LoadingSpinner message="Loading subscriptions and study packs..." />
        ) : packsError || subsError ? (
          <Card>
            <CardContent className="py-8 text-center">
              <div className="flex items-center justify-center gap-2 text-destructive mb-4">
                <AlertCircle className="h-5 w-5" />
                <span>Failed to load data</span>
              </div>
              <p className="text-muted-foreground mb-4">
                {packsError || subsError || 'An error occurred while loading the page.'}
              </p>
              <Button
                onClick={() => {
                  if (packsError) loadPacks();
                  // Note: subscription refresh would need to be implemented in the hook
                }}
                variant="outline"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {visiblePacks.map((pack) => {
              const disabled = isDisabledForUser(pack);
              const cta = getCta(pack);
              const isResidency = pack.type === 'RESIDENCY';
              const isGrace = cancelledWithinGraceIds.has(pack.id);

              return (
                <Card key={pack.id} className={`h-full ${disabled && !isGrace ? 'opacity-60' : ''}`}>
                  <CardHeader className="pb-3 sm:pb-4 lg:pb-6">
                    <div className="flex items-start justify-between gap-2 sm:gap-3">
                      <div>
                        <CardTitle className="text-xl">{pack.name}</CardTitle>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {isGrace && (
                          <Badge variant="outline" className="text-amber-500 border-amber-500/40">
                            <Clock className="h-3 w-3 mr-1" /> Renew available 3 days
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4 lg:space-y-5">
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
                    <div className="flex gap-2 sm:gap-3">
                      <Button
                        className="flex-1"
                        variant={cta.variant}
                        disabled={disabled && !isGrace}
                        title={disabled && !isGrace ? 'You already have an active subscription' : ''}
                        onClick={() => handleCtaClick(pack)}
                      >
                        {cta.label}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Redeem Activation Code Modal */}
        <RedeemActivationCodeModal
          open={redeemOpen}
          onOpenChange={setRedeemOpen}
          onSuccess={handleRedeemSuccess}
        />
      </div>
    </div>
  );
}

// Main component with error boundary
export default function BrowseSubscriptionsPage() {
  return (
    <SubscriptionErrorBoundary>
      <BrowseSubscriptionsPageContent />
    </SubscriptionErrorBoundary>
  );
}

