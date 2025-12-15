'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RegisterForm } from '@/features/auth/components/register-form';
import { useSetupStatus } from '@/features/auth/hooks/use-setup-status';
import { Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { data: setupStatus, isLoading, error } = useSetupStatus();

  useEffect(() => {
    // If setup is not needed (users exist), redirect to login
    if (setupStatus && !setupStatus.needs_setup) {
      router.replace('/login');
    }
  }, [setupStatus, router]);

  // Show loading while checking setup status
  if (isLoading) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Checking system status...</p>
      </div>
    );
  }

  // If error or users already exist, show message
  if (error || (setupStatus && !setupStatus.needs_setup)) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
        <p className="text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <RegisterForm />
      </div>
    </div>
  );
}
