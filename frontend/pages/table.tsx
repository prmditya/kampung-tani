import Head from "next/head";
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
import { DashboardLayout } from "../components/dashboard-layout";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { useSensorData, type SensorData } from "../hooks/useApiOptimized";
import { useDeviceStats } from "../hooks/useApiData";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { withAuth } from "../hooks/useAuth";
import { ErrorMessage } from "@/components/ui/error-message";

function HistoricalData() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Items per page for grouped data display
  const [searchTerm, setSearchTerm] = useState("");
  const [deviceFilter, setDeviceFilter] = useState("all");

  // Fetch more raw data to ensure we have enough for grouping
  const {
    data: sensorData,
    pagination,
    loading,
    error,
    refetch,
    nextPage,
    prevPage,
  } = useSensorData(false, 30000, 1, 200); // Fetch 200 records for better grouping

  // Get device statistics for actual active device count
  const { data: deviceStats } = useDeviceStats();

  // Group sensor data by device and timestamp
  const groupSensorData = (sensors: typeof sensorData) => {
    if (!sensors) return [];

    const grouped = new Map();

    sensors.forEach((sensor) => {
      const deviceName =
        sensor.metadata?.device || `Device ${sensor.device_id}`;
      // Group by device and rounded timestamp (to group readings from same time)
      const timeKey = new Date(sensor.timestamp).toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
      const key = `${deviceName}-${timeKey}`;

      if (!grouped.has(key)) {
        grouped.set(key, {
          id: sensor.id,
          device_name: deviceName,
          device_id: sensor.device_id,
          timestamp: sensor.timestamp,
          sensors: {},
        });
      }

      const group = grouped.get(key);
      group.sensors[sensor.sensor_type.toLowerCase()] = {
        value: sensor.value,
        unit: sensor.unit,
      };
    });

    return Array.from(grouped.values()).sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  };

  // Filter and search data (now done client-side for current page)
  const filteredData =
    sensorData?.filter((item) => {
      const deviceName = item.metadata?.device || `Device ${item.device_id}`;
      const matchesSearch =
        deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sensor_type.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDevice =
        deviceFilter === "all" || deviceName === deviceFilter;

      return matchesSearch && matchesDevice;
    }) || [];

  // Group sensor data by device and timestamp
  const groupedData = groupSensorData(filteredData);

  // Filter and search grouped data
  const filteredGroupedData = groupedData.filter((item) => {
    const matchesSearch = item.device_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesDevice =
      deviceFilter === "all" || item.device_name === deviceFilter;
    return matchesSearch && matchesDevice;
  });

  // Client-side pagination for grouped data
  const totalFilteredItems = filteredGroupedData.length;
  const totalPages = Math.ceil(totalFilteredItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalFilteredItems);
  const currentData = filteredGroupedData.slice(startIndex, endIndex);

  // Get unique devices for filter from current page data
  const uniqueDevices = Array.from(
    new Set(
      sensorData?.map(
        (item) => item.metadata?.device || `Device ${item.device_id}`
      ) || []
    )
  );

  const handleRefresh = async () => {
    await refetch(1, 200); // Always fetch from first page with more data
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    // No need to call API, we handle pagination client-side
  };

  const formatValue = (
    value: number | null | undefined,
    unit: string = "",
    decimals: number = 1
  ): string => {
    if (value === null || value === undefined || isNaN(value)) return "---";
    return `${Number(value).toFixed(decimals)}${unit}`;
  };

  const formatDateTime = (timestamp: string | null): string => {
    if (!timestamp) return "---";
    try {
      return new Date(timestamp).toLocaleString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid";
    }
  };

  const getStatusBadge = (
    value: number | null | undefined,
    min: number,
    max: number
  ) => {
    if (value === null || value === undefined || isNaN(value))
      return <Badge variant="outline">No Data</Badge>;
    const numValue = Number(value);
    if (numValue < min) return <Badge variant="destructive">Low</Badge>;
    if (numValue > max) return <Badge variant="secondary">High</Badge>;
    return <Badge className="bg-green-600 text-white">Normal</Badge>;
  };

  const getSensorStatusBadge = (
    sensorType: string,
    value: number | null | undefined
  ) => {
    if (value === null || value === undefined || isNaN(value))
      return <Badge variant="outline">No Data</Badge>;

    const numValue = Number(value);

    // Define ranges based on sensor type
    switch (sensorType.toLowerCase()) {
      case "moisture":
        return getStatusBadge(value, 30, 70);
      case "temperature":
        return getStatusBadge(value, 20, 30);
      case "ph":
        return getStatusBadge(value, 6.0, 7.5);
      case "conductivity":
        return getStatusBadge(value, 100, 800);
      case "nitrogen":
        return getStatusBadge(value, 20, 50);
      case "phosphorus":
        return getStatusBadge(value, 10, 30);
      case "potassium":
        return getStatusBadge(value, 80, 150);
      case "salinity":
        return getStatusBadge(value, 0, 2);
      case "humidity":
        return getStatusBadge(value, 40, 80);
      default:
        return <Badge variant="outline">—</Badge>;
    }
  };

  const exportToCSV = () => {
    if (!groupedData.length) return;

    const headers = [
      "ID",
      "Device",
      "Timestamp",
      "Moisture (%)",
      "Temperature (°C)",
      "pH",
      "Conductivity (μS/cm)",
      "Nitrogen (mg/kg)",
      "Phosphorus (mg/kg)",
      "Potassium (mg/kg)",
      "Salinity (ppt)",
      "Humidity (%)",
      "TDS (ppm)",
    ];

    const csvContent = [
      headers.join(","),
      ...groupedData.map((row) =>
        [
          row.id,
          `"${row.device_name}"`,
          `"${formatDateTime(row.timestamp)}"`,
          row.sensors.moisture?.value ?? "",
          row.sensors.temperature?.value ?? "",
          row.sensors.ph?.value ?? "",
          row.sensors.conductivity?.value ?? "",
          row.sensors.nitrogen?.value ?? "",
          row.sensors.phosphorus?.value ?? "",
          row.sensors.potassium?.value ?? "",
          row.sensors.salinity?.value ?? "",
          row.sensors.humidity?.value ?? "",
          row.sensors.tds?.value ?? "",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sensor-data-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading && !sensorData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Loading Historical data..." />
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

  return (
    <>
      <Head>
        <title>IoT Monitoring - Historical Data</title>
        <meta
          name="description"
          content="Sensor readings history and data analysis"
        />
      </Head>
      <DashboardLayout>
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
                onClick={exportToCSV}
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
                <MdRefresh
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
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
                  {sensorData?.length || 0}
                </div>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Raw Records
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
                  {totalFilteredItems}
                </div>
                <p className="text-sm text-purple-600 dark:text-purple-400">
                  Grouped Records
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
                      placeholder="Search by device name or user..."
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
                    {uniqueDevices.map((device) => (
                      <option key={device} value={device}>
                        {device}
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
                Showing {startIndex + 1}-{endIndex} of{" "}
                {totalFilteredItems} grouped records (Page {currentPage} of{" "}
                {totalPages})
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[800px]">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left p-2 sm:p-3 font-semibold text-foreground text-sm whitespace-nowrap">
                        Device
                      </th>
                      <th className="text-left p-2 sm:p-3 font-semibold text-foreground text-sm whitespace-nowrap">
                        Timestamp
                      </th>
                      <th className="text-left p-2 sm:p-3 font-semibold text-foreground text-sm whitespace-nowrap">
                        Moisture
                      </th>
                      <th className="text-left p-2 sm:p-3 font-semibold text-foreground text-sm whitespace-nowrap">
                        Temp
                      </th>
                      <th className="text-left p-2 sm:p-3 font-semibold text-foreground text-sm whitespace-nowrap">
                        pH
                      </th>
                      <th className="text-left p-2 sm:p-3 font-semibold text-foreground text-sm whitespace-nowrap">
                        Conductivity
                      </th>
                      <th className="text-left p-2 sm:p-3 font-semibold text-foreground text-sm whitespace-nowrap">
                        N-P-K
                      </th>
                      <th className="text-left p-2 sm:p-3 font-semibold text-foreground text-sm whitespace-nowrap">
                        Salinity
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.map((row, index) => (
                      <tr
                        key={row.id}
                        className={`border-b border-border hover:bg-muted/50 ${
                          index % 2 === 0 ? "bg-background" : "bg-muted/20"
                        }`}
                      >
                        <td className="p-2 sm:p-3">
                          <div className="font-medium text-foreground text-sm">
                            {row.device_name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ID: {row.device_id}
                          </div>
                        </td>
                        <td className="p-2 sm:p-3 text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                          {formatDateTime(row.timestamp)}
                        </td>
                        <td className="p-3">
                          <div className="text-sm font-medium">
                            {formatValue(row.sensors.moisture?.value, "%")}
                          </div>
                          {getSensorStatusBadge(
                            "moisture",
                            row.sensors.moisture?.value
                          )}
                        </td>
                        <td className="p-3">
                          <div className="text-sm font-medium">
                            {formatValue(row.sensors.temperature?.value, "°C")}
                          </div>
                          {getSensorStatusBadge(
                            "temperature",
                            row.sensors.temperature?.value
                          )}
                        </td>
                        <td className="p-3">
                          <div className="text-sm font-medium">
                            {formatValue(row.sensors.ph?.value, "", 1)}
                          </div>
                          {getSensorStatusBadge("ph", row.sensors.ph?.value)}
                        </td>
                        <td className="p-3">
                          <div className="text-sm font-medium">
                            {formatValue(
                              row.sensors.conductivity?.value,
                              " μS/cm",
                              0
                            )}
                          </div>
                          {getSensorStatusBadge(
                            "conductivity",
                            row.sensors.conductivity?.value
                          )}
                        </td>
                        <td className="p-3">
                          <div className="text-xs space-y-1">
                            <div>
                              N:{" "}
                              {formatValue(row.sensors.nitrogen?.value, "", 0)}
                            </div>
                            <div>
                              P:{" "}
                              {formatValue(
                                row.sensors.phosphorus?.value,
                                "",
                                0
                              )}
                            </div>
                            <div>
                              K:{" "}
                              {formatValue(row.sensors.potassium?.value, "", 0)}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="text-sm font-medium">
                            {formatValue(
                              row.sensors.salinity?.value,
                              " ppt",
                              1
                            )}
                          </div>
                          {getSensorStatusBadge(
                            "salinity",
                            row.sensors.salinity?.value
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {currentData.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto text-gray-300 mb-4 flex items-center justify-center">
                      <MdBarChart className="h-16 w-16" />
                    </div>
                    <p className="text-gray-500">
                      No data found matching your filters
                    </p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 p-6 border-t">
                  <div className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages} ({totalFilteredItems}{" "}
                    grouped records)
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1 || loading}
                    >
                      <MdFirstPage className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || loading}
                    >
                      <MdNavigateBefore className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || loading}
                    >
                      <MdNavigateNext className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage === totalPages || loading}
                    >
                      <MdLastPage className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </>
  );
}

export default withAuth(HistoricalData);
