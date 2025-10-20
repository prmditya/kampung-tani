import { Card, CardContent } from "@/components/ui/card";
import { Activity, HardDrive, TrendingUp, Users } from "lucide-react";

interface DashboardStats {
  totalDevices: number;
  activeDevices: number;
  assignedDevices: number;
  todayReadings: number;
}

interface StatsCardsProps {
  stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* Total Devices */}
      <Card className="relative overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950">
              <HardDrive className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              Total Devices
            </p>
            <p className="text-3xl font-bold">{stats.totalDevices}</p>
            <p className="text-xs text-muted-foreground">
              Registered in system
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Active Devices */}
      <Card className="relative overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950">
              <Activity className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex h-6 items-center rounded-full bg-emerald-100 dark:bg-emerald-950 px-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">
              Online
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              Active Now
            </p>
            <p className="text-3xl font-bold">{stats.activeDevices}</p>
            <p className="text-xs text-muted-foreground">
              Currently operational
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Assigned Devices */}
      <Card className="relative overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-950">
              <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              Assignments
            </p>
            <p className="text-3xl font-bold">{stats.assignedDevices}</p>
            <p className="text-xs text-muted-foreground">
              Deployed to farms
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Today's Readings */}
      <Card className="relative overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-950">
              <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex h-6 items-center rounded-full bg-orange-100 dark:bg-orange-950 px-2 text-xs font-medium text-orange-700 dark:text-orange-400">
              +12%
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              Today&apos;s Data
            </p>
            <p className="text-3xl font-bold">{stats.todayReadings}</p>
            <p className="text-xs text-muted-foreground">
              Sensor readings
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
