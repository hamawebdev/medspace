// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { AuthAPI } from '@/lib/auth-api';
import { toast } from 'sonner';

export default function PaymentSuccessPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const router = useRouter();

  // Handle keyboard navigation and accessibility
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && !isLoading) {
        handleGoToDashboard();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isLoading]);

  const handleGoToDashboard = async (isRetry = false) => {
    setIsLoading(true);
    if (!isRetry) {
      setError(null);
    }

    try {
      // Refresh user token using the auth API
      console.log('🔄 PaymentSuccess: Refreshing user token...', { attempt: retryCount + 1 });
      await AuthAPI.refreshTokens();
      console.log('✅ PaymentSuccess: Token refresh successful');

      // Reset retry count on success
      setRetryCount(0);

      // Show success message
      toast.success('Session actualisée avec succès');

      // Redirect to student dashboard
      router.push('/student/dashboard');
    } catch (error) {
      console.error('❌ PaymentSuccess: Token refresh failed:', error);

      // Default user-facing message per requirements
      let errorMessage = 'Impossible d’actualiser la session. Veuillez réessayer.';

      // Increment retry counter (manual retries only)
      setRetryCount(prev => prev + 1);

      // Refine message based on known API error patterns
      if (error instanceof Error) {
        if (error.message.includes('No refresh token available') ||
            error.message.includes('Invalid refresh token') ||
            error.message.includes('Refresh token has expired')) {
          errorMessage = 'Votre session a expiré. Redirection vers la page de connexion...';
        } else if (error.message.includes('User account not found') ||
                   error.message.includes('account has been deactivated')) {
          errorMessage = 'Problème avec votre compte. Veuillez contacter le support.';
        }
      }

      // If multiple failures, redirect to login
      const failures = retryCount + 1;
      if (failures >= 2 || errorMessage.includes('session a expiré')) {
        setError('Échec après plusieurs tentatives. Redirection vers la page de connexion...');
        toast.error('Échec après plusieurs tentatives. Redirection vers la page de connexion...');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />

      <div className="relative z-10 w-full max-w-sm sm:max-w-md lg:max-w-lg">
        <Card className="glass border-border/20 card-hover-lift animate-fade-in-up shadow-lg sm:shadow-xl">
          <CardHeader className="text-center space-y-4 sm:space-y-6 pb-4 sm:pb-6 px-4 sm:px-6">
            {/* Success Icon */}
            <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-green-500/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
            </div>

            {/* Success Title */}
            <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight text-foreground">
              Paiement réussi !
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6 pb-6 sm:pb-8">
            {/* Error Message */}
            {error && (
              <div className="p-3 sm:p-4 bg-destructive/10 border border-destructive/20 rounded-xl animate-slide-up">
                <p className="text-destructive text-xs sm:text-sm font-medium text-center leading-relaxed">{error}</p>
              </div>
            )}

            {/* Dashboard Button */}
            <Button
              onClick={handleGoToDashboard}
              disabled={isLoading}
              className="w-full h-11 sm:h-12 lg:h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base"
              size="lg"
            >
              {isLoading ? (
                <>


                  <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                  <span className="text-xs sm:text-sm lg:text-base">Actualisation en cours...</span>
                </>
              ) : (
                <>
                  <span className="text-sm sm:text-base lg:text-lg">Aller au tableau de bord</span>
                  <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                </>
              )}
            </Button>

            {/* Retry Button (shown on error) */}
            {error && (
              <Button
                onClick={() => handleGoToDashboard(true)}
                disabled={isLoading}
                variant="outline"
                className="w-full h-10 sm:h-11 lg:h-12 mt-2"
              >
                R\u00e9essayer
              </Button>
            )}


            {/* Additional Info */}
            <div className="text-center px-2">
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Votre paiement a été traité avec succès. Vous pouvez maintenant accéder à votre tableau de bord.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
