import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  MdWifi,
  MdWifiOff,
  MdRestartAlt,
  MdDeviceUnknown,
  MdRefresh,
} from "react-icons/md";
import type { Device, DeviceStatusHistory } from "../../hooks/useApiOptimized";

interface DeviceHistoryPanelProps {
  selectedDeviceId: number | null;
  devices: Device[] | null;
  statusHistory: DeviceStatusHistory[] | null;
  loading: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

const DeviceHistoryPanel: React.FC<DeviceHistoryPanelProps> = ({
  selectedDeviceId,
  devices,
  statusHistory,
  loading,
  error,
  onRefresh,
}) => {
  const selectedDevice = selectedDeviceId
    ? devices?.find((device) => device.id === selectedDeviceId)
    : undefined;

  const renderStatusIndicator = (status: string) => {
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
      maintenance: {
        icon: MdRestartAlt,
        text: "Maintenance",
        bgColor:
          "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
        pulseColor: "bg-amber-400 dark:bg-amber-500",
        iconBg: "bg-amber-100 dark:bg-amber-900",
      },
    };

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
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border ${config.bgColor}`}
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
  };

  const formatDuration = (seconds: number | null): string => {
    if (seconds === null) return "Unknown";

    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
    } else if (seconds < 86400) {
      const hours = Math.floor(seconds / 3600);
      const remainingMinutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${remainingMinutes}m`;
    } else {
      const days = Math.floor(seconds / 86400);
      const remainingHours = Math.floor((seconds % 86400) / 3600);
      return `${days}d ${remainingHours}h`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Device Status History</CardTitle>
            <CardDescription>
              {selectedDevice
                ? `Status history for ${selectedDevice.name} (${selectedDevice.device_type})`
                : "Select a device to view its status history"}
            </CardDescription>
          </div>
          {onRefresh && selectedDeviceId && (
            <Button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-all hover:shadow-lg"
            >
              <MdRefresh
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {!selectedDeviceId ? (
            <div className="text-center text-muted-foreground py-8">
              Select a device from the Device List tab to view its status
              history.
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-4">
              Error loading history: {error}
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  className="ml-2 px-2 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded"
                >
                  Retry
                </button>
              )}
            </div>
          ) : loading ? (
            <div className="text-center py-4 text-muted-foreground">
              Loading status history...
            </div>
          ) : !statusHistory || statusHistory.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">
              No status history available for this device.
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {statusHistory.map((entry, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center space-x-3">
                    {renderStatusIndicator(entry.status)}
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {entry.status === "online"
                          ? "🟢 Came Online"
                          : entry.status === "offline"
                          ? "🔴 Went Offline"
                          : "🟡 Maintenance Mode"}
                      </div>
                      {entry.status === "offline" &&
                        entry.uptime_seconds !== null && (
                          <div className="text-xs text-muted-foreground mt-1 font-medium">
                            Uptime:{" "}
                            {entry.uptime_formatted ||
                              formatDuration(entry.uptime_seconds)}
                          </div>
                        )}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {entry.created_at
                      ? new Date(entry.created_at).toLocaleString()
                      : "Unknown"}
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedDevice && (
            <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-700 rounded-xl border border-gray-200 dark:border-gray-600">
              <div className="text-sm font-semibold mb-3 text-gray-900 dark:text-gray-100">
                📊 Current Device Status
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {renderStatusIndicator(selectedDevice.status)}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {selectedDevice.status === "online"
                      ? "🟢 Currently Online"
                      : selectedDevice.status === "offline"
                      ? "🔴 Currently Offline"
                      : "🟡 Under Maintenance"}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground bg-white dark:bg-slate-800 px-2 py-1 rounded-md border">
                  Last seen:{" "}
                  {new Date(
                    selectedDevice.last_seen || selectedDevice.updated_at
                  ).toLocaleString()}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DeviceHistoryPanel;
