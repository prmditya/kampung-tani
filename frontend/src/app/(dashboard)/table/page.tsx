"use client";

import { useState } from "react";
import {
  MdBarChart,
  MdDevices,
  MdDownload,
  MdError,
  MdFilterList,
  MdFirstPage,
  MdLastPage,
  MdNavigateBefore,
  MdNavigateNext,
  MdPages,
  MdRefresh,
  MdSearch,
  MdStorage,
} from "react-icons/md";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  useSensorData,
  useDeviceStats,
  type SensorData,
} from "@/shared/hooks/useApi";
import { LoadingSpinner } from "@/shared/components/ui/loading-spinner";
import { ErrorMessage } from "@/shared/components/ui/error-message";

function HistoricalData() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [deviceFilter, setDeviceFilter] = useState("all");

  // Fetch sensor data with standard pagination
  const {
    data: sensorData,
    pagination: apiPagination,
    loading,
    error,
    refetch,
    nextPage,
    prevPage,
  } = useSensorData(false, 0, 1, 20);

  const { data: deviceStats } = useDeviceStats();

  // Current page from API pagination
  const currentApiPage = apiPagination?.page || 1;
  const totalPages = apiPagination?.pages || 1;
  const totalItems = apiPagination?.total || 0;

  // Format date to WIB
  const formatDateTime = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
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
      return timestamp;
    }
  };

  // Format numeric values
  const formatValue = (value: number, prefix = "", decimals = 2): string => {
    if (value === null || value === undefined) return "N/A";
    return `${prefix}${Number(value).toFixed(decimals)}`;
  };

  // Filter data based on search and device filter
  const filteredData =
    sensorData?.filter((item: SensorData) => {
      const matchesSearch =
        searchTerm === "" ||
        item.sensor_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.value.toString().includes(searchTerm) ||
        (item.metadata?.device &&
          item.metadata.device
            .toLowerCase()
            .includes(searchTerm.toLowerCase()));

      const matchesDevice =
        deviceFilter === "all" || item.device_id.toString() === deviceFilter;

      return matchesSearch && matchesDevice;
    }) || [];

  // Get unique devices for filter
  const uniqueDevices = Array.from(
    new Set(sensorData?.map((item: SensorData) => item.device_id) || [])
  ).sort();

  // Handle page changes
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      refetch(newPage, 20);
    }
  };

  // Get sensor status badge
  const getSensorStatusBadge = (sensorType: string, value: number) => {
    const getStatus = () => {
      switch (sensorType.toLowerCase()) {
        case "moisture":
          if (value < 30)
            return { status: "Low", variant: "destructive" as const };
          if (value > 70)
            return { status: "High", variant: "default" as const };
          return { status: "Normal", variant: "secondary" as const };
        case "temperature":
          if (value < 20 || value > 35)
            return { status: "Warning", variant: "destructive" as const };
          return { status: "Normal", variant: "secondary" as const };
        case "ph":
          if (value < 6.0 || value > 8.0)
            return { status: "Warning", variant: "destructive" as const };
          return { status: "Normal", variant: "secondary" as const };
        default:
          return { status: "Active", variant: "secondary" as const };
      }
    };

    const { status, variant } = getStatus();
    return <Badge variant={variant}>{status}</Badge>;
  };

  // Handle refresh
  const handleRefresh = async () => {
    await refetch();
  };

  if (loading && !sensorData) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading historical data..." />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        title="Failed to load historical data"
        message={error}
        retry={handleRefresh}
        className="max-w-md mx-auto mt-8"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Historical Data
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Sensor readings history and data analysis
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Button
            onClick={() => {}}
            variant="outline"
            className="flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <MdDownload className="h-4 w-4" />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">Export</span>
          </Button>
          <Button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white w-full sm:w-auto"
          >
            <MdRefresh className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/50 dark:to-indigo-950/50 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="rounded-full bg-blue-200 dark:bg-blue-800/50 p-2">
                <MdStorage className="h-5 w-5 text-blue-700 dark:text-blue-300" />
              </div>
            </div>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {totalItems || 0}
            </div>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              Raw Sensor Records
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/50 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="rounded-full bg-green-200 dark:bg-green-800/50 p-2">
                <MdDevices className="h-5 w-5 text-green-700 dark:text-green-300" />
              </div>
            </div>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              {deviceStats?.online_devices || 0}
            </div>
            <p className="text-sm text-green-600 dark:text-green-400">
              Active Devices
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-950/50 dark:to-violet-950/50 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="rounded-full bg-purple-200 dark:bg-purple-800/50 p-2">
                <MdFilterList className="h-5 w-5 text-purple-700 dark:text-purple-300" />
              </div>
            </div>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {filteredData.length}
            </div>
            <p className="text-sm text-purple-600 dark:text-purple-400">
              Filtered Records
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-950/50 dark:to-amber-950/50 border-orange-200 dark:border-orange-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="rounded-full bg-orange-200 dark:bg-orange-800/50 p-2">
                <MdPages className="h-5 w-5 text-orange-700 dark:text-orange-300" />
              </div>
            </div>
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
              {totalPages}
            </div>
            <p className="text-sm text-orange-600 dark:text-orange-400">
              Total Pages
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MdSearch className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by device name or sensor type..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
            <div className="sm:w-64">
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                value={deviceFilter}
                onChange={(e) => {
                  setDeviceFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Devices</option>
                {uniqueDevices.map((deviceId) => (
                  <option key={deviceId} value={deviceId.toString()}>
                    Device {deviceId}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MdBarChart className="h-5 w-5" />
            Sensor Data Table
          </CardTitle>
          <CardDescription>
            Showing page {currentApiPage} of {totalPages} ({totalItems} total
            sensor readings)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-2 sm:p-3 font-semibold text-foreground text-sm whitespace-nowrap">
                    Device
                  </th>
                  <th className="text-left p-2 sm:p-3 font-semibold text-foreground text-sm whitespace-nowrap">
                    Timestamp
                  </th>
                  <th className="text-left p-2 sm:p-3 font-semibold text-foreground text-sm whitespace-nowrap">
                    Sensor Type
                  </th>
                  <th className="text-left p-2 sm:p-3 font-semibold text-foreground text-sm whitespace-nowrap">
                    Value
                  </th>
                  <th className="text-left p-2 sm:p-3 font-semibold text-foreground text-sm whitespace-nowrap">
                    Unit
                  </th>
                  <th className="text-left p-2 sm:p-3 font-semibold text-foreground text-sm whitespace-nowrap">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, index) => (
                  <tr
                    key={row.id}
                    className={`border-b border-border hover:bg-muted/50 ${
                      index % 2 === 0 ? "bg-background" : "bg-muted/20"
                    }`}
                  >
                    <td className="p-2 sm:p-3">
                      <div className="font-medium text-foreground text-sm">
                        {row.metadata?.device || `Device ${row.device_id}`}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ID: {row.device_id}
                      </div>
                    </td>
                    <td className="p-2 sm:p-3 text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                      {formatDateTime(row.timestamp)}
                    </td>
                    <td className="p-2 sm:p-3">
                      <div className="text-sm font-medium capitalize">
                        {row.sensor_type}
                      </div>
                    </td>
                    <td className="p-2 sm:p-3">
                      <div className="text-sm font-medium">
                        {formatValue(row.value, "", 1)}
                      </div>
                    </td>
                    <td className="p-2 sm:p-3">
                      <div className="text-sm text-muted-foreground">
                        {row.unit}
                      </div>
                    </td>
                    <td className="p-2 sm:p-3">
                      {getSensorStatusBadge(row.sensor_type, row.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredData.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto text-gray-300 mb-4 flex items-center justify-center">
                  <MdBarChart className="h-16 w-16" />
                </div>
                <p className="text-gray-500">
                  No sensor data found matching your filters
                </p>
              </div>
            )}
          </div>

          {/* Pagination - Always show info, buttons only when needed */}
          <div className="flex items-center justify-between mt-6 pt-4 p-6 border-t">
            <div className="text-sm text-gray-600">
              Page {currentApiPage} of {totalPages} ({totalItems} total records)
            </div>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(1)}
                  disabled={currentApiPage === 1 || loading}
                >
                  <MdFirstPage className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentApiPage - 1)}
                  disabled={currentApiPage === 1 || loading}
                >
                  <MdNavigateBefore className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentApiPage + 1)}
                  disabled={currentApiPage === totalPages || loading}
                >
                  <MdNavigateNext className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentApiPage === totalPages || loading}
                >
                  <MdLastPage className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default HistoricalData;
