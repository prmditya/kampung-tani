'use client';

import { useMemo } from 'react';
import { Calendar, Loader2 } from 'lucide-react';
import {
  StatsCards,
  ActivityChart,
  RecentActivity,
  QuickActions,
} from '@/features/dashboard';
import { useDashboard } from '@/features/dashboard/hooks/use-dashboard';
import { useRecentStatusChanges } from '@/hooks/use-gateway-status-history';

export default function DashboardPage() {
  // Fetch dashboard data from new aggregated endpoint
  const { data: dashboardData, isLoading: isLoadingDashboard } = useDashboard();

  // Fetch recent device status changes
  const { data: statusChanges, isLoading: isLoadingStatusChanges } =
    useRecentStatusChanges(10);

  // Prepare stats from dashboard data
  const stats = useMemo(() => {
    if (!dashboardData?.stats) {
      return {
        totalDevices: 0,
        activeDevices: 0,
        assignedDevices: 0,
        totalFarms: 0,
        todayReadings: 0,
      };
    }

    return {
      totalDevices: dashboardData.stats.total_gateways,
      activeDevices: dashboardData.stats.active_gateways,
      assignedDevices: dashboardData.stats.active_assignments,
      totalFarms: dashboardData.stats.total_farms,
      todayReadings: dashboardData.stats.today_readings_count,
    };
  }, [dashboardData]);

  // Prepare activity data for chart
  const activityData = useMemo(() => {
    if (!dashboardData?.activity?.data) return [];
    return dashboardData.activity.data;
  }, [dashboardData]);

  const isLoading = isLoadingDashboard || isLoadingStatusChanges;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex items-start justify-between flex-col gap-2">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's what's happening with your IoT system today.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-md">
          <Calendar className="h-4 w-4" />
          <span>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Loading dashboard...
            </p>
          </div>
        </div>
      )}

      {/* Main Grid Layout */}
      {!isLoading && (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-9 space-y-6">
            <StatsCards stats={stats} />
            <ActivityChart data={activityData} />
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-3 space-y-6 grid">
            <RecentActivity statusChanges={statusChanges || []} />
            <QuickActions />
          </div>
        </div>
      )}
    </div>
  );
}
