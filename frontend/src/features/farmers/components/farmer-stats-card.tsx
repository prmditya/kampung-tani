import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FarmerResponse, FarmResponse } from "@/types/api";

interface FarmerStatsCardProps {
  farmers: FarmerResponse[];
  farms: FarmResponse[];
  getFarmsCount: (farmerId: number) => number;
}

export default function farmerStatsCard({
  farmers,
  farms,
  getFarmsCount,
}: FarmerStatsCardProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Farmers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{farmers.length}</div>
          <p className="text-xs text-muted-foreground">Registered farmers</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Farms</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{farms.length}</div>
          <p className="text-xs text-muted-foreground">Registered farms</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Farmers with Farms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {farmers.filter((f) => getFarmsCount(f.id) > 0).length}
          </div>
          <p className="text-xs text-muted-foreground">
            Farmers who have farms
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
