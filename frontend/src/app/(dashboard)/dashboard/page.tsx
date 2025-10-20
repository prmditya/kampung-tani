"use client";

import { Calendar } from "lucide-react";
import {
  dummyDashboardStats,
  dummyAssignments,
  sensorActivityData,
} from "@/lib/dummy-data";
import {
  StatsCards,
  ActivityChart,
  RecentActivity,
  QuickActions,
} from "@/features/dashboard";

export default function DashboardPage() {
  const stats = dummyDashboardStats;
  const recentAssignments = dummyAssignments.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div>
              <h1 className="text-3xl font-bold">
                Admin IoT Monitoring Dashboard
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-8 space-y-6">
          <StatsCards stats={stats} />
          <ActivityChart data={sensorActivityData} />
        </div>

        {/* Right Column - Sidebar */}
        <div className="lg:col-span-4 space-y-6 grid">
          <RecentActivity assignments={recentAssignments} />
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
