import { useMemo } from 'react';
import type { NavigationItem } from '../types/search-result';

interface UseSearchFilterOptions {
  query: string;
  results: NavigationItem[];
}

export function useSearchFilter({ query, results }: UseSearchFilterOptions) {
  const filteredResults = useMemo(() => {
    if (!query.trim()) {
      return results;
    }

    const normalizedQuery = query.toLowerCase().trim();

    return results.filter((result) => {
      const searchableText = [
        result.title,
        result.description,
        ...(result.keywords || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [query, results]);

  const groupedResults = useMemo(() => {
    return {
      navigation: filteredResults.filter((r) => r.category === 'navigation'),
      actions: filteredResults.filter((r) => r.category === 'action'),
    };
  }, [filteredResults]);

  return {
    filteredResults,
    groupedResults,
    hasResults: filteredResults.length > 0,
    totalResults: filteredResults.length,
  };
}
