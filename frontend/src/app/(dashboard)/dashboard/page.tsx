"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, HardDrive, Calendar, TrendingUp, Users } from "lucide-react";
import {
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
} from "recharts";
import {
  dummyDashboardStats,
  dummyAssignments,
  sensorActivityData,
} from "@/lib/dummy-data";

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
          {/* Primary Stats Grid */}
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

          {/* Sensor Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Sensor Activity Trends
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 md:px-6">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart
                  data={sensorActivityData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorQty" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="rgb(59, 130, 246)"
                        stopOpacity={0.4}
                      />
                      <stop
                        offset="95%"
                        stopColor="rgb(59, 130, 246)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="5 5"
                    horizontal={true}
                    vertical={false}
                    className="stroke-border"
                  />
                  <XAxis
                    dataKey="date"
                    className="text-xs"
                    tick={{ fill: "currentColor" }}
                    stroke="hsl(var(--border))"
                    axisLine={true}
                    tickLine={false}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: "currentColor" }}
                    stroke="hsl(var(--border))"
                    axisLine={true}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="readings"
                    stroke="rgb(59, 130, 246)"
                    strokeWidth={3}
                    fill="url(#colorQty)"
                    dot={{
                      r: 5,
                      fill: "rgb(59, 130, 246)",
                      strokeWidth: 2,
                      stroke: "hsl(var(--card))",
                    }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Sidebar */}
        <div className="lg:col-span-4 space-y-6 grid">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAssignments.slice(0, 4).map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex gap-3 pb-4 border-b last:border-0 last:pb-0"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted shrink-0">
                      <HardDrive className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {assignment.deviceName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {assignment.farmName}
                      </p>
                    </div>
                    <Badge
                      variant={
                        assignment.status === "active" ? "default" : "secondary"
                      }
                      className="text-xs shrink-0"
                    >
                      {assignment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                size="sm"
              >
                <HardDrive className="mr-2 h-4 w-4" />
                Add New Device
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                size="sm"
              >
                <Users className="mr-2 h-4 w-4" />
                Assign to Farm
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                size="sm"
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
