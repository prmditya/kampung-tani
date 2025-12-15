'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/features/auth';
import { useSetupStatus } from '@/features/auth/hooks/use-setup-status';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { data: setupStatus, isLoading } = useSetupStatus();

  useEffect(() => {
    // If setup is needed (no users), redirect to register
    if (setupStatus?.needs_setup) {
      router.replace('/register');
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

  // If setup needed, show redirecting message
  if (setupStatus?.needs_setup) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-6 md:p-10">
        <p className="text-muted-foreground">Redirecting to setup...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}
