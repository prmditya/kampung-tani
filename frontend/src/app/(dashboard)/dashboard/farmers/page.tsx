'use client';

import { useState, useRef, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFarmers, useFarmer } from '@/features/farmers/hooks/use-farmers';
import { useFarms } from '@/features/farmers/hooks/use-farms';
import type { FarmResponse } from '@/types/api';
import FarmerStatsCard from '@/features/farmers/components/farmer-stats-card';
import FarmersTable from '@/features/farmers/components/farmers-table';
import { ViewFarmerDialog, EditFarmerDialog } from '@/features/farmers';
import { Loader2, AlertCircle, Search, X } from 'lucide-react';

export default function FarmersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // URL params for controlled dialogs
  const farmerId = searchParams.get('farmer');
  const action = searchParams.get('action');

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const {
    data: farmersData,
    isLoading,
    error,
  } = useFarmers({ page, size: pageSize, search: searchQuery || undefined });
  const { data: farmsData } = useFarms({ size: 100 });

  // Fetch specific farmer for URL-controlled dialogs
  const { data: selectedFarmer } = useFarmer(farmerId ? parseInt(farmerId) : 0);

  const farmers = farmersData?.items || [];
  const farms = farmsData?.items || [];

  // Get farms for selected farmer
  const selectedFarmerFarms = useMemo(() => {
    if (!selectedFarmer) return [];
    return farms.filter((farm) => farm.farmer_id === selectedFarmer.id);
  }, [selectedFarmer, farms]);

  // Handle dialog close - remove URL params
  const handleDialogClose = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('farmer');
    params.delete('action');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  // Helper function to get farms count for a farmer
  const getFarmsCount = (farmerId: number) => {
    return farms.filter((farm: FarmResponse) => farm.farmer_id === farmerId)
      .length;
  };

  // Helper function to get farmer's farms
  const getFarmerFarms = (farmerId: number) => {
    return farms.filter((farm: FarmResponse) => farm.farmer_id === farmerId);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const searchValue = searchInputRef.current?.value || '';
    setSearchQuery(searchValue);
    setPage(1);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchSubmit();
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    if (searchInputRef.current) {
      searchInputRef.current.value = '';
    }
    setPage(1);
  };

  if (isLoading && !farmersData) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <Card>
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Loading farmers...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <Card className="border-destructive">
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center gap-3 text-center">
              <div className="rounded-full bg-destructive/10 p-3">
                <AlertCircle className="h-10 w-10 text-destructive" />
              </div>
              <div>
                <p className="font-semibold text-destructive">
                  Error loading farmers
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {error.message}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Make sure the backend server is running
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Stats Cards */}
      <FarmerStatsCard
        farmers={farmers}
        farms={farms}
        getFarmsCount={getFarmsCount}
      />

      {/* Search Bar */}
      <Card>
        <CardHeader>
          <CardTitle>All Farmers</CardTitle>
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-2 mt-4"
          >
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                placeholder="Search farmers by name..."
                defaultValue={searchQuery}
                onKeyDown={handleSearchKeyDown}
                className="pl-9 pr-4"
              />
            </div>
            <Button type="submit" size="sm" variant="default">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            {searchQuery && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={handleClearSearch}
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </form>
        </CardHeader>
        <CardContent>
          {/* Farmers Table */}
          <FarmersTable farmers={farmers} getFarmerFarms={getFarmerFarms} />

          {/* Pagination Controls */}
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground text-center sm:text-left">
              Showing {farmersData?.total ? (page - 1) * pageSize + 1 : 0} to{' '}
              {Math.min(page * pageSize, farmersData?.total || 0)} of{' '}
              {farmersData?.total || 0} farmers
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3"
                onClick={() => setPage(1)}
                disabled={page === 1 || isLoading}
                title="First page"
              >
                <span className="sr-only sm:not-sr-only sm:mr-1">First</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 sm:hidden"
                >
                  <polyline points="11 17 6 12 11 7" />
                  <polyline points="18 17 13 12 18 7" />
                </svg>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
                title="Previous page"
              >
                <span className="sr-only sm:not-sr-only">Prev</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 sm:hidden"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </Button>
              <div className="text-sm px-2 min-w-[80px] text-center">
                {page} / {farmersData?.pages || 1}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= (farmersData?.pages || 1) || isLoading}
                title="Next page"
              >
                <span className="sr-only sm:not-sr-only">Next</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 sm:hidden"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3"
                onClick={() => setPage(farmersData?.pages || 1)}
                disabled={page >= (farmersData?.pages || 1) || isLoading}
                title="Last page"
              >
                <span className="sr-only sm:not-sr-only sm:ml-1">Last</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 sm:hidden"
                >
                  <polyline points="13 17 18 12 13 7" />
                  <polyline points="6 17 11 12 6 7" />
                </svg>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* URL-controlled dialogs for global search integration */}
      {selectedFarmer && action === 'view' && (
        <ViewFarmerDialog
          farmer={selectedFarmer}
          farms={selectedFarmerFarms}
          externalOpen={true}
          onExternalOpenChange={(open) => {
            if (!open) handleDialogClose();
          }}
          hideTrigger
        />
      )}

      {selectedFarmer && action === 'edit' && (
        <EditFarmerDialog
          farmer={selectedFarmer}
          externalOpen={true}
          onExternalOpenChange={(open) => {
            if (!open) handleDialogClose();
          }}
          hideTrigger
        />
      )}
    </div>
  );
}
