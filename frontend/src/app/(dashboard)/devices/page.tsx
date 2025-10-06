"use client";

import dynamic from "next/dynamic";
import React, { useCallback, useEffect, useState } from "react";
import {
  MdAccessTime,
  MdDeviceUnknown,
  MdCheckCircle,
  MdDevices,
  MdError,
  MdRefresh,
  MdRestartAlt,
  MdTrendingUp,
  MdWifi,
  MdWifiOff,
} from "react-icons/md";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import {
  useDeviceStats,
  useDeviceStatusHistory,
  useDevicesWithUptime,
} from "@/shared/hooks/useApi";
import { LoadingSpinner } from "@/shared/components/ui/loading-spinner";
import { ErrorMessage } from "@/shared/components/ui/error-message";

const DeviceHistoryPanel = dynamic(
  () => import("@/features/devices/device-history-panel"),
  {
    loading: () => (
      <div className="space-y-4">
        <div className="h-6 w-48 animate-pulse rounded bg-muted" />
        <div className="h-32 rounded border border-dashed border-muted animate-pulse" />
      </div>
    ),
    ssr: false,
  }
);

interface DeviceStatusIndicatorProps {
  status: string;
  className?: string;
}

const STATUS_VARIANTS = {
  online: {
    icon: MdWifi,
    text: "Online",
    bgColor:
      "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    pulseColor: "bg-emerald-400 dark:bg-emerald-500",
    iconBg: "bg-emerald-100 dark:bg-emerald-900",
  },
  offline: {
    icon: MdWifiOff,
    text: "Offline",
    bgColor:
      "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
    pulseColor: "bg-red-400 dark:bg-red-500",
    iconBg: "bg-red-100 dark:bg-red-900",
  },
  restarted: {
    icon: MdRestartAlt,
    text: "Restarted",
    bgColor:
      "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    pulseColor: "bg-amber-400 dark:bg-amber-500",
    iconBg: "bg-amber-100 dark:bg-amber-900",
  },
} as const;

const DeviceStatusIndicator: React.FC<DeviceStatusIndicatorProps> = React.memo(
  ({ status, className }) => {
    const config = STATUS_VARIANTS[status as keyof typeof STATUS_VARIANTS] || {
      icon: MdDeviceUnknown,
      text: "Unknown",
      bgColor:
        "bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800",
      pulseColor: "bg-slate-400 dark:bg-slate-500",
      iconBg: "bg-slate-100 dark:bg-slate-900",
    };

    const Icon = config.icon;

    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border ${config.bgColor} ${className}`}
      >
        <div className={`rounded-md p-1 ${config.iconBg}`}>
          {status === "online" && (
            <div className="relative">
              <div
                className={`absolute -inset-0.5 rounded-md ${config.pulseColor} opacity-75 animate-pulse`}
              ></div>
              <Icon className="relative h-4 w-4" />
            </div>
          )}
          {status !== "online" && <Icon className="h-4 w-4" />}
        </div>
        <span className="font-medium">{config.text}</span>
      </div>
    );
  }
);

DeviceStatusIndicator.displayName = "DeviceStatusIndicator";

function DevicesPage() {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const {
    data: devices,
    loading: devicesLoading,
    error: devicesError,
    refetch: refetchDevices,
    devicesUptime,
  } = useDevicesWithUptime();

  const {
    data: deviceStats,
    loading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useDeviceStats();

  const {
    data: statusHistory,
    loading: historyLoading,
    error: historyError,
    refetch: refetchHistory,
  } = useDeviceStatusHistory(
    selectedDeviceId ? parseInt(selectedDeviceId) : null
  );

  const formatDuration = useCallback((seconds: number): string => {
    if (seconds < 60) return `${Math.floor(seconds)}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
  }, []);

  const formatDateTimeWIB = useCallback((dateTimeString: string): string => {
    try {
      const date = new Date(dateTimeString);
      const wibTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);

      return (
        wibTime.toLocaleString("id-ID", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "UTC",
        }) + " WIB"
      );
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateTimeString;
    }
  }, []);

  const formatLastSeen = useCallback((device: any): string => {
    try {
      const date = new Date(device.last_seen || device.updated_at);
      const wibTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);
      return (
        wibTime.toLocaleString("id-ID", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }) + " WIB"
      );
    } catch {
      return "Never";
    }
  }, []);

  const getOfflineDuration = useCallback(
    (device: any): string => {
      if (!device.last_seen) return "Unknown";

      try {
        const lastSeen = new Date(device.last_seen);
        const now = new Date();
        const diffInSeconds = Math.floor(
          (now.getTime() - lastSeen.getTime()) / 1000
        );
        return formatDuration(diffInSeconds);
      } catch (error) {
        console.error("Error calculating offline duration:", error);
        return "Unknown";
      }
    },
    [formatDuration]
  );

  const getStatusDuration = useCallback(
    (device: any): string => {
      // For online devices, use current_uptime_formatted if available
      if (device.status === "online" && device.current_uptime_formatted) {
        return device.current_uptime_formatted;
      }

      // Fallback calculation for online devices
      if (device.status === "online" && device.last_seen) {
        try {
          const lastSeen = new Date(device.last_seen);
          const now = new Date();
          const diffInSeconds = Math.floor(
            (now.getTime() - lastSeen.getTime()) / 1000
          );
          return formatDuration(Math.abs(diffInSeconds));
        } catch (error) {
          console.error("Error calculating uptime duration:", error);
          return "N/A";
        }
      }

      return "N/A";
    },
    [formatDuration]
  );

  const handleRefresh = async () => {
    await Promise.all([refetchDevices(), refetchStats()]);
  };

  if (devicesLoading && !devices) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading devices..." />
      </div>
    );
  }

  if (devicesError) {
    return (
      <ErrorMessage
        title="Failed to load devices"
        message={devicesError}
        retry={handleRefresh}
        className="max-w-md mx-auto mt-8"
      />
    );
  }

  const totalDevices = deviceStats?.total_devices ?? 0;
  const onlineDevices = deviceStats?.online_devices ?? 0;
  const offlineDevices = deviceStats?.offline_devices ?? 0;
  const recentDataCount = deviceStats?.recent_data_count ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Devices</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage your IoT devices
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={devicesLoading || statsLoading}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <MdRefresh
            className={`w-4 h-4 ${
              devicesLoading || statsLoading ? "animate-spin" : ""
            }`}
          />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Total Devices
            </CardTitle>
            <div className="p-3 bg-blue-500 dark:bg-blue-600 rounded-xl shadow-lg">
              <MdDevices className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
              {totalDevices}
            </div>
            <p className="text-sm text-blue-600 dark:text-blue-300 mt-1 font-medium">
              Registered devices
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-950 dark:to-green-950 border-emerald-200 dark:border-emerald-800 hover:shadow-lg transition-all hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
              Online
            </CardTitle>
            <div className="p-3 bg-emerald-500 dark:bg-emerald-600 rounded-xl shadow-lg">
              <MdCheckCircle className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
              {onlineDevices}
            </div>
            <p className="text-sm text-emerald-600 dark:text-emerald-300 mt-1 font-medium">
              Active devices
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-950 dark:to-rose-950 border-red-200 dark:border-red-800 hover:shadow-lg transition-all hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-red-800 dark:text-red-200">
              Offline
            </CardTitle>
            <div className="p-3 bg-red-500 dark:bg-red-600 rounded-xl shadow-lg">
              <MdError className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-900 dark:text-red-100">
              {offlineDevices}
            </div>
            <p className="text-sm text-red-600 dark:text-red-300 mt-1 font-medium">
              Inactive devices
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-950 dark:to-violet-950 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-purple-800 dark:text-purple-200">
              Recent Data
            </CardTitle>
            <div className="p-3 bg-purple-500 dark:bg-purple-600 rounded-xl shadow-lg">
              <MdTrendingUp className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
              {recentDataCount}
            </div>
            <p className="text-sm text-purple-600 dark:text-purple-300 mt-1 font-medium">
              Data points (last hour)
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="devices" className="space-y-6">
        <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <TabsTrigger
            value="devices"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm"
          >
            <MdDevices className="h-4 w-4 mr-2" />
            Device List
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm"
          >
            <MdAccessTime className="h-4 w-4 mr-2" />
            Status History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="devices" className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Device Status Overview
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Current status of all devices
              </p>
            </div>
            <div className="grid gap-4">
              {devices && devices.length > 0 ? (
                devices.map((device) => (
                  <Card
                    key={device.id}
                    className={`hover:shadow-md transition-all duration-200 cursor-pointer border-l-4 ${
                      device.status === "online"
                        ? "border-l-green-500 hover:border-l-green-600"
                        : device.status === "offline"
                        ? "border-l-red-500 hover:border-l-red-600"
                        : "border-l-orange-500 hover:border-l-orange-600"
                    } ${
                      selectedDeviceId === device.id.toString()
                        ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950"
                        : "bg-white dark:bg-slate-800"
                    }`}
                    onClick={() => setSelectedDeviceId(device.id.toString())}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                              {device.name}
                            </h3>
                            <DeviceStatusIndicator status={device.status} />
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                            <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                              {device.device_type || "ECU-1051"}
                            </span>
                            <span>Location: {device.location}</span>
                            {device.description && (
                              <span>Description: {device.description}</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {device.status === "online" ? (
                              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                Status: Online
                              </span>
                            ) : (
                              <span className="text-red-600 dark:text-red-400 font-medium">
                                Status: Offline
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="text-sm">
                            <span className="text-gray-500 dark:text-gray-400">
                              {device.status === "online"
                                ? "Uptime:"
                                : "Offline for:"}
                            </span>
                            <span className="font-medium ml-2 text-gray-900 dark:text-gray-100">
                              {devicesUptime[device.id]
                                ?.current_uptime_formatted || "Loading..."}
                            </span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-500 dark:text-gray-400">
                              Last seen:
                            </span>
                            <span className="font-medium ml-2 text-gray-900 dark:text-gray-100">
                              {formatLastSeen(device)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                  <MdDeviceUnknown className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No devices found
                  </h3>
                  <p>Devices will appear here once they start sending data.</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <DeviceHistoryPanel
            selectedDeviceId={
              selectedDeviceId ? parseInt(selectedDeviceId) : null
            }
            devices={devices ?? null}
            statusHistory={statusHistory ?? null}
            loading={historyLoading}
            error={historyError}
            onRefresh={refetchHistory}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default DevicesPage;
