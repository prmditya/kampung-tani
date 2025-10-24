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

interface StatConfig {
  title: string;
  key: keyof DashboardStats;
  icon: LucideIcon;
  color: "blue" | "emerald" | "purple" | "orange";
  description: string;
  showBadge?: boolean;
}

const COLOR_CLASSES = {
  blue: {
    icon: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-100 dark:bg-blue-950",
  },
  emerald: {
    icon: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-950",
  },
  purple: {
    icon: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-100 dark:bg-purple-950",
  },
  orange: {
    icon: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-100 dark:bg-orange-950",
  },
} as const;

const STATS_CONFIG: StatConfig[] = [
  {
    title: "Total Gateways",
    key: "totalDevices",
    icon: HardDrive,
    color: "blue",
    description: "Registered in system",
  },
  {
    title: "Active Now",
    key: "activeDevices",
    icon: Activity,
    color: "emerald",
    description: "Currently operational",
    showBadge: true,
  },
  {
    title: "Assignments",
    key: "assignedDevices",
    icon: Users,
    color: "purple",
    description: "Deployed to farms",
  },
  {
    title: "Today's Readings",
    key: "todayReadings",
    icon: TrendingUp,
    color: "orange",
    description: "Sensor data points",
  },
];

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {STATS_CONFIG.map(
        ({ key, title, icon: Icon, color, description, showBadge }) => {
          const colorClass = COLOR_CLASSES[color];

          return (
            <Card key={key} className="transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-lg ${colorClass.bg}`}
                  >
                    <Icon className={`h-5 w-5 ${colorClass.icon}`} />
                  </div>
                  {showBadge && (
                    <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                      Live
                    </span>
                  )}
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-muted-foreground">
                    {title}
                  </p>
                  <p className="text-2xl font-bold tracking-tight">
                    {stats[key]}
                  </p>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
              </CardContent>
            </Card>
          );
        },
      )}
    </div>
  );
}
