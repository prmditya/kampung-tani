"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useFarmers } from "@/features/farmers/hooks/use-farmers";
import { useFarms } from "@/features/farmers/hooks/use-farms";
import type { FarmResponse } from "@/types/api";
import FarmerStatsCard from "@/features/farmers/components/farmer-stats-card";
import FarmersTable from "@/features/farmers/components/farmers-table";

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
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-muted-foreground">Loading farmers...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Error loading farmers: {error.message}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Make sure the backend server is running on http://localhost:5000
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Stats Cards */}
      <FarmerStatsCard
        farmers={farmers}
        farms={farms}
        getFarmsCount={getFarmsCount}
      />

      {/* Farmers Table */}
      <FarmersTable farmers={farmers} getFarmerFarms={getFarmerFarms} />
    </>
  );
}
