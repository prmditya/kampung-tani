import Head from "next/head";
import React from "react";
import { IoThermometer, IoWater } from "react-icons/io5";
import {
  MdCheckCircle,
  MdElectricBolt,
  MdError,
  MdRefresh,
  MdScience,
  MdWaterDrop,
} from "react-icons/md";

import { DashboardLayout } from "../components/dashboard-layout";
import { Button } from "../components/ui/button";
import { SensorCard } from "../components/ui/sensor-card";
import { LoadingSpinner } from "../components/ui/loading-spinner";
import { ErrorMessage } from "../components/ui/error-message";
import { useDeviceStats, useSensorData } from "../hooks/useApiData";
import { useDashboardPreferences } from "../hooks/useLocalStorage";

export default function Dashboard() {
  const [preferences] = useDashboardPreferences();

  const { data: sensorData, isLoading, error, refetch } = useSensorData();

  const { data: deviceStats, isLoading: statsLoading } = useDeviceStats();

  // Helper to get latest value for a sensor type
  const getLatestSensorValue = (sensorType: string): number | null => {
    if (!sensorData || sensorData.length === 0) return null;
    const latestData = sensorData[0]; // Get most recent data
    return (
      (latestData[sensorType as keyof typeof latestData] as number) || null
    );
  };

  const handleRefresh = async () => {
    await refetch();
  };

  if (isLoading && !sensorData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Loading Sensors data..." />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <ErrorMessage
          title="Failed to load dashboard data"
          message={error}
          retry={handleRefresh}
          className="max-w-md mx-auto mt-8"
        />
      </DashboardLayout>
    );
  }

  // Define sensor configurations with their display properties
  const sensorConfigs = [
    { type: "moisture" as const, title: "Soil Moisture", icon: IoWater },
    { type: "temperature" as const, title: "Temperature", icon: IoThermometer },
    { type: "ph" as const, title: "pH Level", icon: MdScience },
    {
      type: "conductivity" as const,
      title: "Conductivity",
      icon: MdElectricBolt,
    },
    { type: "nitrogen" as const, title: "Nitrogen (N)", iconText: "N" },
    { type: "phosphorus" as const, title: "Phosphorus (P)", iconText: "P" },
    { type: "potassium" as const, title: "Potassium (K)", iconText: "K" },
    { type: "salinity" as const, title: "Salinity", icon: MdWaterDrop },
  ];

  const onlineCount = deviceStats?.status_counts?.online ?? 0;
  const offlineCount = deviceStats?.status_counts?.offline ?? 0;
  const totalDevices = deviceStats?.total_devices ?? 0;
  const isSystemOnline = onlineCount > 0;

  return (
    <DashboardLayout>
      <Head>
        <title>IoT Monitoring - Dashboard</title>
      </Head>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Real-time sensor monitoring and current values
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MdRefresh
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        {/* System Status Banner */}
        <div
          className={`
          flex items-center justify-between p-4 rounded-lg border
          ${
            isSystemOnline
              ? "bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800"
              : "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
          }
        `}
        >
          <div className="flex items-center gap-3">
            {isSystemOnline ? (
              <MdCheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <MdError className="w-5 h-5 text-red-600 dark:text-red-400" />
            )}
            <div>
              <h3
                className={`font-semibold ${
                  isSystemOnline
                    ? "text-emerald-800 dark:text-emerald-200"
                    : "text-red-800 dark:text-red-200"
                }`}
              >
                System Status
              </h3>
              <p
                className={`text-sm ${
                  isSystemOnline
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {isSystemOnline
                  ? `${onlineCount} devices online - System active`
                  : "No devices online - System inactive"}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground dark:text-slate-300">
                Active Devices
              </p>
              <p
                className={`text-lg font-bold ${
                  isSystemOnline
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {onlineCount}/{totalDevices}
              </p>
              <p
                className={`text-xs font-medium ${
                  isSystemOnline
                    ? "text-emerald-700 dark:text-emerald-300"
                    : "text-red-700 dark:text-red-300"
                }`}
              >
                {isSystemOnline ? "ONLINE" : "OFFLINE"}
              </p>
            </div>
            <div className="w-12"></div>

            <div className="text-right">
              <p className="text-sm font-medium text-muted-foreground dark:text-slate-300">
                Device
              </p>
              <p className="text-sm font-medium text-foreground">
                ECU-1051-Address-1
              </p>
              <p
                className={`text-xs font-medium ${
                  isSystemOnline
                    ? "text-emerald-700 dark:text-emerald-300"
                    : "text-red-700 dark:text-red-300"
                }`}
              >
                {isSystemOnline ? "CONNECTED" : "DISCONNECTED"}
              </p>
            </div>
          </div>
        </div>

        {/* Sensor Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sensorConfigs.map((config) => (
            <SensorCard
              key={config.type}
              sensorType={config.type}
              title={config.title}
              value={getLatestSensorValue(config.type) ?? 0}
              iconText={"iconText" in config ? config.iconText : undefined}
              icon={"icon" in config ? config.icon : undefined}
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
