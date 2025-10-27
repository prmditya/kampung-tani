'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useFarmers } from '@/features/farmers/hooks/use-farmers';
import { useFarms } from '@/features/farmers/hooks/use-farms';
import type { FarmResponse } from '@/types/api';
import FarmerStatsCard from '@/features/farmers/components/farmer-stats-card';
import FarmersTable from '@/features/farmers/components/farmers-table';
import { Loader2, AlertCircle } from 'lucide-react';

export default function FarmersPage() {
  const { data: farmersData, isLoading, error } = useFarmers({ size: 100 });
  const { data: farmsData } = useFarms({ size: 100 });

  const farmers = farmersData?.items || [];
  const farms = farmsData?.items || [];

  // Helper function to get farms count for a farmer
  const getFarmsCount = (farmerId: number) => {
    return farms.filter((farm: FarmResponse) => farm.farmer_id === farmerId)
      .length;
  };

  // Helper function to get farmer's farms
  const getFarmerFarms = (farmerId: number) => {
    return farms.filter((farm: FarmResponse) => farm.farmer_id === farmerId);
  };

  if (isLoading) {
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
                  Make sure the backend server is running on
                  http://localhost:5000
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

      {/* Farmers Table */}
      <FarmersTable farmers={farmers} getFarmerFarms={getFarmerFarms} />
    </div>
  );
}
