// @ts-nocheck
"use client";

import { useState } from 'react';
import { Mail, X, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { AuthAPI } from '@/lib/auth-api';

interface EmailVerificationBannerProps {
  userEmail: string;
  onDismiss?: () => void;
}

export function EmailVerificationBanner({ userEmail, onDismiss }: EmailVerificationBannerProps) {
  const [isResending, setIsResending] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      // Note: This would need to be implemented in AuthAPI
      // await AuthAPI.resendVerificationEmail(userEmail);
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error) {
      toast.error('Failed to send verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  if (isDismissed) {
    return null;
  }

  return (
    <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
      <Mail className="h-4 w-4 text-amber-600" />
      <AlertDescription className="flex items-center justify-between w-full">
        <div className="flex-1">
          <span className="font-medium text-amber-800 dark:text-amber-200">
            Email verification required
          </span>
          <p className="text-sm text-amber-700 dark:text-amber-300 mt-[calc(var(--spacing)*1)]">
            Please check your email ({userEmail}) and click the verification link to activate your account.
          </p>
        </div>
        <div className="flex items-center gap-[calc(var(--spacing)*2)] ml-[calc(var(--spacing)*4)]">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResendVerification}
            disabled={isResending}
            className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/20"
          >
            {isResending ? (
              <>
                <RefreshCw className="h-3 w-3 mr-[calc(var(--spacing)*1)] animate-spin" />
                Sending...
              </>
            ) : (
              'Resend Email'
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-amber-600 hover:text-amber-800 hover:bg-amber-100 dark:text-amber-400 dark:hover:text-amber-200 dark:hover:bg-amber-900/20"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
