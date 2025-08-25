// @ts-nocheck
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import AuthAPI from '@/lib/auth-api';

export default function VerifyEmailPage() {
  const params = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      toast.error('Invalid or missing verification token');
      router.replace('/login');
      return;
    }

    const verify = async () => {
      setStatus('verifying');
      try {
        const res = await AuthAPI.verifyEmail(token);
        setStatus('success');
        setMessage(res?.message || 'Email verified successfully');
        toast.success(res?.message || 'Email verified successfully');
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message || 'Verification failed');
        toast.error(err.message || 'Verification failed');
      }
    };

    verify();
  }, [params, router]);

  // Guard: do not render main content without token
  if (!params.get('token')) return null;

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verify email</CardTitle>
        </CardHeader>
        <CardContent>
          {status === 'verifying' && <p>Verifying...</p>}
          {status !== 'verifying' && (
            <div className="space-y-4">
              <p className={status === 'error' ? 'text-destructive' : 'text-foreground'}>{message}</p>
              <div className="flex gap-2">
                <Button onClick={() => router.push('/login')}>Go to login</Button>
                <Button variant="secondary" onClick={() => router.push('/')}>Home</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

