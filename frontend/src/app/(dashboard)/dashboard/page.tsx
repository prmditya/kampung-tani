'use client';

import { useMemo } from 'react';
import { Calendar, Loader2 } from 'lucide-react';
import {
  StatsCards,
  ActivityChart,
  RecentActivity,
  QuickActions,
} from '@/features/dashboard';
import { useGateways } from '@/hooks/use-gateways';
import useAssignments from '@/features/assignments/hooks/use-assignment';
import { useFarms } from '@/features/farmers/hooks/use-farms';
import { useDashboard } from '@/features/dashboard/hooks/use-dashboard';

export default function DashboardPage() {
  // Fetch dashboard data from new aggregated endpoint
  const { data: dashboardData, isLoading: isLoadingDashboard } = useDashboard();

  // Also fetch assignments and farms for recent activity
  const { data: assignmentsData } = useAssignments({ size: 100 });
  const { data: farmsData } = useFarms({ size: 100 });
  const { data: gatewaysData } = useGateways({ size: 100 });

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

  // Prepare recent assignments for display
  const recentAssignments = useMemo(() => {
    if (!assignmentsData?.items || !farmsData?.items || !gatewaysData?.items)
      return [];

    return assignmentsData.items.slice(0, 5).map((assignment) => {
      const gateway = gatewaysData.items.find(
        (g) => g.id === assignment.gateway_id,
      );
      const farm = farmsData.items.find((f) => f.id === assignment.farm_id);

      return {
        id: assignment.id.toString(),
        deviceName:
          gateway?.name ||
          gateway?.gateway_uid ||
          `Gateway ${assignment.gateway_id}`,
        farmName: farm?.name || `Farm ${assignment.farm_id}`,
        status: assignment.is_active ? 'active' : 'inactive',
      };
    });
  }, [assignmentsData, farmsData, gatewaysData]);

  const isLoading = isLoadingDashboard;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-start justify-between flex-col gap-1">
        <h1 className="text-3xl font-bold">Admin IoT Monitoring Dashboard</h1>
        <div className="flex items-center gap-1 text-muted-foreground">
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
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Main Grid Layout */}
      {!isLoading && (
        <div className="grid gap-4 lg:grid-cols-12">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-9 space-y-4">
            <StatsCards stats={stats} />
            <ActivityChart data={activityData} />
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-3 space-y-4  grid">
            <RecentActivity assignments={recentAssignments} />
            <QuickActions />
          </div>
        </div>
      )}
    </div>
  );
}
