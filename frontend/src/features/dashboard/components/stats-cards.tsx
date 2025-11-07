import { Card } from '@/components/ui/card';
import { Activity, HardDrive, TrendingUp, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

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
  gradient: string;
  description: string;
}

const STATS_CONFIG: StatConfig[] = [
  {
    title: 'Total Gateways',
    key: 'totalDevices',
    icon: HardDrive,
    gradient: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
    description: 'Total in system',
  },
  {
    title: 'Active Now',
    key: 'activeDevices',
    icon: Activity,
    gradient: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
    description: 'Currently operational',
  },
  {
    title: 'Assignments',
    key: 'assignedDevices',
    icon: Users,
    gradient: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
    description: 'Deployed to farms',
  },
  {
    title: "Today's Readings",
    key: 'todayReadings',
    icon: TrendingUp,
    gradient: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
    description: 'Sensor data points',
  },
];

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {STATS_CONFIG.map(({ key, title, icon: Icon, gradient, description }) => {
        return (
          <Card
            key={key}
            className={`relative overflow-hidden ${gradient} text-white border-0 hover:shadow-lg hover:scale-105 transition-all duration-300`}
          >
            <div className="absolute top-0 right-0 -mt-4 -mr-8 opacity-15">
              <Icon className="h-32 w-32" />
            </div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="rounded-lg bg-white/20 p-3 backdrop-blur-sm">
                  <Icon className="h-6 w-6" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-white/90">{title}</p>
                <p className="text-4xl font-bold tracking-tight">
                  {stats[key].toLocaleString()}
                </p>
                <p className="text-xs text-white/80">{description}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
