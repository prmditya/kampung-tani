import { useMemo } from 'react';
import { navigationItems } from '../data/navigation-items';
import { useFarmers } from '@/features/farmers/hooks/use-farmers';
import type { NavigationItem } from '../types/search-result';

export function useGlobalSearch() {
  const { data: farmersData, isLoading, error } = useFarmers({ size: 100 });

  const data = useMemo(() => {
    const allItems: NavigationItem[] = [...navigationItems];

    // Add farmer items dynamically
    if (farmersData?.items) {
      farmersData.items.forEach((farmer) => {
        // View action
        allItems.push({
          id: `farmer-view-${farmer.id}`,
          title: `View ${farmer.name}`,
          description: farmer.contact || farmer.address || 'Farmer details',
          href: `/dashboard/farmers?farmer=${farmer.id}&action=view`,
          icon: 'Eye',
          category: 'farmer',
          keywords: [
            farmer.name,
            farmer.contact || '',
            farmer.address || '',
            'farmer',
            'view',
          ],
        });
        // Edit action
        allItems.push({
          id: `farmer-edit-${farmer.id}`,
          title: `Edit ${farmer.name}`,
          description: 'Edit farmer information',
          href: `/dashboard/farmers?farmer=${farmer.id}&action=edit`,
          icon: 'Pencil',
          category: 'farmer',
          keywords: [farmer.name, 'farmer', 'edit'],
        });
      });
    }

    return allItems;
  }, [farmersData]);

  return {
    data,
    isLoading,
    error,
  };
}
