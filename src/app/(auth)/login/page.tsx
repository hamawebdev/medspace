// @ts-nocheck
export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { ModernLoginForm } from '@/components/auth/modern-login-form';

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ModernLoginForm />
    </Suspense>
  );
}