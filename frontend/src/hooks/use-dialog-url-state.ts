'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';

export function useDialogUrlState(paramKey: string, paramValue: string) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const isOpen = searchParams.get(paramKey) === paramValue;

  const onOpenChange = useCallback(
    (open: boolean) => {
      const params = new URLSearchParams(searchParams.toString());

      if (open) {
        params.set(paramKey, paramValue);
      } else {
        params.delete(paramKey);
      }

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, paramKey, paramValue, router, searchParams],
  );

  return {
    isOpen,
    onOpenChange,
  };
}
