import { useMemo } from 'react';
import type { NavigationItem } from '../types/search-result';
import { navigationItems } from '../data/navigation-items';

export function useGlobalSearch() {
  const data = useMemo(() => navigationItems, []);

  return {
    data,
    isLoading: false,
    error: null,
  };
}
