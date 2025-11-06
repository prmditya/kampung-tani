import { useMemo } from 'react';
import { navigationItems } from '../data/navigation-items';

export function useGlobalSearch() {
  const data = useMemo(() => navigationItems, []);

  return {
    data,
    isLoading: false,
    error: null,
  };
}
