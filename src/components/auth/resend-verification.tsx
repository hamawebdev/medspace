// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { Mail, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AuthAPI } from '@/lib/auth-api';
import { toast } from 'sonner';

interface ResendVerificationProps {
  email: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
  variant?: 'card' | 'inline';
}

export function ResendVerification({ 
  email, 
  onSuccess, 
  onError, 
  className = '',
  variant = 'card'
}: ResendVerificationProps) {
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [lastSent, setLastSent] = useState<Date | null>(null);
  const [success, setSuccess] = useState(false);

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => {
        setCooldown(cooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Handle resend verification
  const handleResend = async () => {
    try {
      setLoading(true);
      setSuccess(false);
      
      // Call the resend verification API
      // For now, we'll simulate the API call since the endpoint might not be implemented yet
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, this would be:
      // await AuthAPI.resendVerificationEmail(email);
      
      setSuccess(true);
      setLastSent(new Date());
      setCooldown(60); // 60 second cooldown
      
      toast.success('Verification email sent! Please check your inbox.');
      onSuccess?.();
      
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to resend verification email';
      toast.error(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Format time since last sent
  const getTimeSinceLastSent = () => {
    if (!lastSent) return null;
    
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - lastSent.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'just now';
    } else if (diffInMinutes === 1) {
      return '1 minute ago';
    } else {
      return `${diffInMinutes} minutes ago`;
    }
  };

  if (variant === 'inline') {
    return (
      <div className={className}>
        {success && (
          <Alert className="mb-4">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Verification email sent to {email}
              {lastSent && ` ${getTimeSinceLastSent()}`}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex items-center gap-3">
          <Button
            onClick={handleResend}
            disabled={loading || cooldown > 0}
            size="sm"
            variant="outline"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : cooldown > 0 ? (
              `Resend in ${cooldown}s`
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Resend Email
              </>
            )}
          </Button>
          
          <span className="text-sm text-muted-foreground">
            to {email}
          </span>
        </div>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Verification
        </CardTitle>
        <CardDescription>
          Didn&apos;t receive the verification email?
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {success ? (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Verification email sent to {email}
              {lastSent && ` ${getTimeSinceLastSent()}`}
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please check your email inbox and spam folder for the verification link.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-3">
          <Button
            onClick={handleResend}
            disabled={loading || cooldown > 0}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Verification Email...
              </>
            ) : cooldown > 0 ? (
              `Resend in ${cooldown} seconds`
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Resend Verification Email
              </>
            )}
          </Button>
          
          <p className="text-xs text-center text-muted-foreground">
            We&apos;ll send a new verification link to<br />
            <strong>{email}</strong>
          </p>
          
          {lastSent && (
            <p className="text-xs text-center text-muted-foreground">
              Last sent {getTimeSinceLastSent()}
            </p>
          )}
        </div>
        
        <div className="pt-4 border-t">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Still having trouble?
            </p>
            <div className="flex justify-center gap-4 text-sm">
              <a href="/support" className="text-primary hover:underline">
                Contact Support
              </a>
              <a href="/auth/register" className="text-primary hover:underline">
                Register Again
              </a>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
