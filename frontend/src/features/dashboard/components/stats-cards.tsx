import { Card, CardContent } from "@/components/ui/card";
import { Activity, HardDrive, TrendingUp, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface DashboardStats {
  totalDevices: number;
  activeDevices: number;
  assignedDevices: number;
  totalFarms: number;
  todayReadings: number;
}

interface StatsCardsProps {
  stats: DashboardStats;
}

interface StatCard {
  title: string;
  key: keyof DashboardStats;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  description: string;
}

const statsConfig: StatCard[] = [
  {
    title: "Total Gateways",
    key: "totalDevices",
    icon: HardDrive,
    iconColor: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-100 dark:bg-blue-950",
    description: "Registered in system",
  },
  {
    title: "Active Now",
    key: "activeDevices",
    icon: Activity,
    iconColor: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-100 dark:bg-emerald-950",
    description: "Currently operational",
  },
  {
    title: "Assignments",
    key: "assignedDevices",
    icon: Users,
    iconColor: "text-purple-600 dark:text-purple-400",
    iconBg: "bg-purple-100 dark:bg-purple-950",
    description: "Deployed to farms",
  },
  {
    title: "Today's Readings",
    key: "todayReadings",
    icon: TrendingUp,
    iconColor: "text-orange-600 dark:text-orange-400",
    iconBg: "bg-orange-100 dark:bg-orange-950",
    description: "Sensor data points",
  },
];

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {statsConfig.map((config) => {
        const Icon = config.icon;
        const value = stats[config.key];

        return (
          <Card key={config.key} className="relative overflow-hidden">
            <CardContent className="px-6">
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${config.iconBg}`}
                >
                  <Icon className={`h-6 w-6 ${config.iconColor}`} />
                </div>
                {config.key === "activeDevices" && (
                  <div className="flex h-6 items-center rounded-full bg-emerald-100 dark:bg-emerald-950 px-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    Online
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {config.title}
                </p>
                <p className="text-3xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">
                  {config.description}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
