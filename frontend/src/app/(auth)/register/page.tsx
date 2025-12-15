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
      <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-6 md:p-10">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground mt-4">
          Checking system status...
        </p>
      </div>
    );
  }

  // If error or users already exist, show message
  if (error || (setupStatus && !setupStatus.needs_setup)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-6 md:p-10">
        <p className="text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-md">
        <RegisterForm />
      </div>
    </div>
  );
}
