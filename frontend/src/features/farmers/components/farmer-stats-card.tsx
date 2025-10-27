import { Card } from '@/components/ui/card';
import { FarmerResponse, FarmResponse } from '@/types/api';
import { Users, MapPin, CheckCircle2 } from 'lucide-react';

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
  const farmersWithFarms = farmers.filter((f) => getFarmsCount(f.id) > 0)
    .length;
  const percentage =
    farmers.length > 0
      ? Math.round((farmersWithFarms / farmers.length) * 100)
      : 0;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 hover:shadow-lg hover:scale-105 transition-all duration-300">
        <div className="absolute top-0 right-0 -mt-4 -mr-8 opacity-15">
          <Users className="h-32 w-32" />
        </div>
        <div className="relative p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="rounded-lg bg-white/20 p-3 backdrop-blur-sm">
              <Users className="h-6 w-6" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-white/90">Total Farmers</p>
            <p className="text-4xl font-bold tracking-tight">
              {farmers.length}
            </p>
            <p className="text-xs text-white/80">Registered farmers</p>
          </div>
        </div>
      </Card>

      <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 hover:shadow-lg hover:scale-105 transition-all duration-300">
        <div className="absolute top-0 right-0 -mt-4 -mr-8 opacity-15">
          <MapPin className="h-32 w-32" />
        </div>
        <div className="relative p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="rounded-lg bg-white/20 p-3 backdrop-blur-sm">
              <MapPin className="h-6 w-6" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-white/90">Total Farms</p>
            <p className="text-4xl font-bold tracking-tight">{farms.length}</p>
            <p className="text-xs text-white/80">Registered farms</p>
          </div>
        </div>
      </Card>

      <Card className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0 hover:shadow-lg hover:scale-105 transition-all duration-300">
        <div className="absolute top-0 right-0 -mt-4 -mr-8 opacity-15">
          <CheckCircle2 className="h-32 w-32" />
        </div>
        <div className="relative p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="rounded-lg bg-white/20 p-3 backdrop-blur-sm">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-white/90">
              Farmers with Farms
            </p>
            <p className="text-4xl font-bold tracking-tight">
              {farmersWithFarms}
            </p>
            <p className="text-xs text-white/80">
              {farmersWithFarms > 0
                ? `${percentage}% of total`
                : 'No farmers with farms'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
