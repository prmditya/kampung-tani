"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataFilter, DataChart, ReadingsTable } from "@/features/data";
import { useGateways } from "@/hooks/use-gateways";
import {
  useSensorsByGateway,
  useSensorData,
} from "@/features/data/hooks/use-sensors";
import { useFarmers } from "@/features/farmers/hooks/use-farmers";
import { useFarms } from "@/features/farmers/hooks/use-farms";
import useAssignments from "@/features/assignments/hooks/use-assignment";
import type { SensorDataResponse } from "@/types/api";
import { Loader2, Clock, Search } from "lucide-react";

export default function DataPage() {
  const [selectedGateway, setSelectedGateway] = useState<string>("all");
  const [selectedSensor, setSelectedSensor] = useState<string>("all");
  const [selectedFarmer, setSelectedFarmer] = useState<string>("all");
  const [selectedFarm, setSelectedFarm] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [hours, setHours] = useState(5);
  const [chartHours, setChartHours] = useState(5);
  const [customHours, setCustomHours] = useState<number>(5);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedMeasurementTypes, setSelectedMeasurementTypes] = useState<
    string[]
  >([]);
  const [tableSearch, setTableSearch] = useState("");

  // Fetch gateways
  const { data: gatewaysData, isLoading: isLoadingGateways } = useGateways();

  // Parse selected gateway ID
  const gatewayId = selectedGateway !== "all" ? parseInt(selectedGateway) : 0;

  // Fetch sensors for selected gateway
  const { data: sensorsData, isLoading: isLoadingSensors } =
    useSensorsByGateway(gatewayId, { size: 20 });

  // Fetch farmers, farms, and gateway assignments data
  const { data: farmersData } = useFarmers({ size: 100 });
  const { data: farmsData } = useFarms({ size: 100 });
  const { data: assignmentsData } = useAssignments({ size: 100 });

  // Parse selected sensor ID
  const sensorId = selectedSensor !== "all" ? parseInt(selectedSensor) : 0;

  // Calculate hours from date range if provided (for table data)
  const calculatedHours = useMemo(() => {
    if (dateFrom && dateTo) {
      const from = new Date(dateFrom);
      const to = new Date(dateTo);
      return Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60));
    }
    return hours;
  }, [dateFrom, dateTo, hours]);

  // Fetch sensor data for table (paginated)
  const {
    data: sensorDataResponse,
    isLoading: isLoadingData,
    refetch,
  } = useSensorData(sensorId, {
    page,
    size: pageSize,
    hours: calculatedHours,
  });

  // Fetch sensor data for chart (non-paginated, based on chartHours)
  const { data: chartDataResponse, isLoading: isLoadingChartData } =
    useSensorData(sensorId, {
      page: 1,
      size: 1000,
      hours: chartHours,
    });

  // Process sensor data for table display
  const sensorReadings: SensorDataResponse[] = useMemo(() => {
    return sensorDataResponse?.items || [];
  }, [sensorDataResponse]);

  // Process sensor data for chart display
  const chartSensorReadings: SensorDataResponse[] = useMemo(() => {
    return chartDataResponse?.items || [];
  }, [chartDataResponse]);

  // Get all available measurement types from chart readings
  const availableMeasurementTypes = useMemo(() => {
    const types = new Set<string>();
    chartSensorReadings.forEach((reading) => {
      const measurementType = reading.metadata?.measurement_type || "Unknown";
      types.add(measurementType);
    });
    return Array.from(types).sort();
  }, [chartSensorReadings]);

  // Auto-select all measurement types on first load
  useMemo(() => {
    if (
      availableMeasurementTypes.length > 0 &&
      selectedMeasurementTypes.length === 0
    ) {
      setSelectedMeasurementTypes(availableMeasurementTypes);
    }
  }, [availableMeasurementTypes, selectedMeasurementTypes.length]);

  // Filter table data by search, farmer, and farm
  const filteredTableReadings = useMemo(() => {
    let filtered = sensorReadings;

    // Filter by search
    if (tableSearch) {
      const searchLower = tableSearch.toLowerCase();
      filtered = filtered.filter((reading) => {
        const measurementType = reading.metadata?.measurement_type || "Unknown";
        const sensorInfo = sensorsData?.items.find(
          (s) => s.id === reading.sensor_id
        );
        const sensorName = sensorInfo?.name || sensorInfo?.sensor_uid || "";

        return (
          measurementType.toLowerCase().includes(searchLower) ||
          sensorName.toLowerCase().includes(searchLower) ||
          reading.value.toString().includes(searchLower)
        );
      });
    }

    // Filter by farmer
    if (selectedFarmer !== "all") {
      const farmerId = parseInt(selectedFarmer);
      filtered = filtered.filter((reading) => {
        const assignment = assignmentsData?.items.find(
          (a) => a.gateway_id === reading.gateway_id && a.is_active
        );
        const farm = assignment
          ? farmsData?.items.find((f) => f.id === assignment.farm_id)
          : null;
        return farm?.farmer_id === farmerId;
      });
    }

    // Filter by farm
    if (selectedFarm !== "all") {
      const farmId = parseInt(selectedFarm);
      filtered = filtered.filter((reading) => {
        const assignment = assignmentsData?.items.find(
          (a) => a.gateway_id === reading.gateway_id && a.is_active
        );
        return assignment?.farm_id === farmId;
      });
    }

    return filtered;
  }, [
    sensorReadings,
    tableSearch,
    selectedFarmer,
    selectedFarm,
    sensorsData?.items,
    assignmentsData?.items,
    farmsData?.items,
  ]);

  // Prepare separate chart data for each measurement type (to avoid scale issues)
  const chartDataByType = useMemo(() => {
    if (!chartSensorReadings.length) return {};

    const dataByType: Record<
      string,
      Array<{ time: string; value: number; unit?: string }>
    > = {};

    // Filter by selected measurement types only (time filtering is done by API)
    const filteredReadings = chartSensorReadings.filter((reading) => {
      const measurementType = reading.metadata?.measurement_type || "Unknown";
      return selectedMeasurementTypes.includes(measurementType);
    });

    filteredReadings.forEach((reading) => {
      const date = new Date(reading.timestamp);

      // Round down to nearest 10-second interval
      const seconds = date.getSeconds();
      const roundedSeconds = Math.floor(seconds / 10) * 10;
      date.setSeconds(roundedSeconds, 0);

      // Format time to show hours:minutes:seconds
      const time = date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      const measurementType = reading.metadata?.measurement_type || "Unknown";

      if (!dataByType[measurementType]) {
        dataByType[measurementType] = [];
      }

      // Check if we already have this time point
      const existingPoint = dataByType[measurementType].find(
        (d) => d.time === time
      );
      if (existingPoint) {
        // Update with latest value
        existingPoint.value = reading.value;
        existingPoint.unit = reading.unit || undefined;
      } else {
        dataByType[measurementType].push({
          time,
          value: reading.value,
          unit: reading.unit || undefined,
        });
      }
    });

    // Sort each type's data by time
    Object.keys(dataByType).forEach((type) => {
      dataByType[type].sort((a, b) => {
        const timeA = new Date(`1970-01-01 ${a.time}`).getTime();
        const timeB = new Date(`1970-01-01 ${b.time}`).getTime();
        return timeA - timeB;
      });
    });

    return dataByType;
  }, [chartSensorReadings, selectedMeasurementTypes]);

  const handleReset = () => {
    setSelectedGateway("all");
    setSelectedSensor("all");
    setSelectedFarmer("all");
    setSelectedFarm("all");
    setDateFrom(undefined);
    setDateTo(undefined);
    setHours(5);
    setChartHours(5);
    setCustomHours(5);
    setPage(1);
    setTableSearch("");
  };

  const handleRefresh = () => {
    refetch();
  };

  // Reset page when filters change
  const handleGatewayChange = (value: string) => {
    setSelectedGateway(value);
    setSelectedSensor("all");
    setPage(1);
  };

  const handleSensorChange = (value: string) => {
    setSelectedSensor(value);
    setPage(1);
  };

  const handleDateFromChange = (date: Date | undefined) => {
    setDateFrom(date);
    setPage(1);
  };

  const handleDateToChange = (date: Date | undefined) => {
    setDateTo(date);
    setPage(1);
  };

  const handleExport = () => {
    if (!sensorReadings.length) return;

    // Create CSV content
    const headers = [
      "Timestamp",
      "Sensor ID",
      "Gateway ID",
      "Measurement Type",
      "Value",
      "Unit",
      "Farmer",
      "Farm",
    ];
    const rows = sensorReadings.map((r) => {
      // Find assignment for this gateway
      const assignment = assignmentsData?.items.find(
        (a) => a.gateway_id === r.gateway_id && a.is_active
      );
      const farm = assignment
        ? farmsData?.items.find((f) => f.id === assignment.farm_id)
        : null;
      const farmer = farm
        ? farmersData?.items.find((f) => f.id === farm.farmer_id)
        : null;

      return [
        r.timestamp,
        r.sensor_id,
        r.gateway_id,
        r.metadata?.measurement_type || "Unknown",
        r.value,
        r.unit || "",
        farmer?.name || "",
        farm?.name || "",
      ];
    });

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join(
      "\n"
    );

    // Download CSV
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sensor-data-${new Date().toISOString()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const isLoading = isLoadingGateways || isLoadingSensors || isLoadingData;
  const isChartLoading = isLoadingChartData;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Data Viewer</h1>
        <p className="text-muted-foreground">
          View and analyze sensor readings from all gateways
        </p>
      </div>

      <DataFilter
        gateways={gatewaysData?.items || []}
        sensors={sensorsData?.items || []}
        selectedGateway={selectedGateway}
        selectedSensor={selectedSensor}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onGatewayChange={handleGatewayChange}
        onSensorChange={handleSensorChange}
        onDateFromChange={handleDateFromChange}
        onDateToChange={handleDateToChange}
        onReset={handleReset}
        onRefresh={handleRefresh}
        onExport={handleExport}
        isRefreshing={isLoadingData}
      />

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {!isLoading &&
        !isChartLoading &&
        sensorReadings.length === 0 &&
        chartSensorReadings.length === 0 && (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                No sensor data available. Please select a gateway and sensor to
                view data.
              </p>
            </CardContent>
          </Card>
        )}

      {!isLoading &&
        (sensorReadings.length > 0 || chartSensorReadings.length > 0) && (
          <>
            {/* Measurement Type Filter */}
            {availableMeasurementTypes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Select Measurement Types to Display</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {availableMeasurementTypes.map((type) => (
                      <Button
                        key={type}
                        variant={
                          selectedMeasurementTypes.includes(type)
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => {
                          setSelectedMeasurementTypes((prev) =>
                            prev.includes(type)
                              ? prev.filter((t) => t !== type)
                              : [...prev, type]
                          );
                        }}
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Chart Time Range Selector */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Chart Time Range
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 items-center">
                  <Button
                    variant={chartHours === 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChartHours(1)}
                  >
                    1 Hour
                  </Button>
                  <Button
                    variant={chartHours === 5 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChartHours(5)}
                  >
                    5 Hours
                  </Button>
                  <Button
                    variant={chartHours === 12 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChartHours(12)}
                  >
                    12 Hours
                  </Button>
                  <Button
                    variant={chartHours === 24 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChartHours(24)}
                  >
                    24 Hours
                  </Button>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="custom-hours" className="text-sm">
                      Custom:
                    </Label>
                    <Input
                      id="custom-hours"
                      type="number"
                      min="1"
                      max="168"
                      value={customHours}
                      onChange={(e) =>
                        setCustomHours(parseInt(e.target.value) || 1)
                      }
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">hours</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setChartHours(customHours)}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Separate Charts for Each Measurement Type */}
            {isChartLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : Object.entries(chartDataByType).length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(chartDataByType).map(([type, data]) => (
                  <DataChart
                    key={type}
                    data={data.map((d) => ({ time: d.time, [type]: d.value }))}
                    title={`${type} ${
                      data[0]?.unit ? `(${data[0].unit})` : ""
                    } - Last ${chartHours}h`}
                  />
                ))}
              </div>
            ) : chartSensorReadings.length > 0 ? (
              <Card>
                <CardContent className="py-8">
                  <p className="text-center text-muted-foreground">
                    No data available for selected measurement types in the last{" "}
                    {chartHours} hour(s).
                  </p>
                </CardContent>
              </Card>
            ) : null}

            <Card>
              <CardHeader>
                <CardTitle>Sensor Readings</CardTitle>
                <div className="flex flex-wrap items-center gap-4 mt-4">
                  {/* Search */}
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search readings..."
                      value={tableSearch}
                      onChange={(e) => setTableSearch(e.target.value)}
                      className="w-64"
                    />
                  </div>

                  {/* Farmer Filter */}
                  <div className="flex items-center gap-2">
                    <Label className="text-sm whitespace-nowrap">Farmer:</Label>
                    <Select
                      value={selectedFarmer}
                      onValueChange={setSelectedFarmer}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="All Farmers" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Farmers</SelectItem>
                        {farmersData?.items.map((farmer) => (
                          <SelectItem
                            key={farmer.id}
                            value={farmer.id.toString()}
                          >
                            {farmer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Farm Filter */}
                  <div className="flex items-center gap-2">
                    <Label className="text-sm whitespace-nowrap">Farm:</Label>
                    <Select
                      value={selectedFarm}
                      onValueChange={setSelectedFarm}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="All Farms" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Farms</SelectItem>
                        {farmsData?.items
                          .filter(
                            (farm) =>
                              selectedFarmer === "all" ||
                              farm.farmer_id === parseInt(selectedFarmer)
                          )
                          .map((farm) => (
                            <SelectItem
                              key={farm.id}
                              value={farm.id.toString()}
                            >
                              {farm.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ReadingsTable
                  readings={filteredTableReadings}
                  sensors={sensorsData?.items || []}
                  farmers={farmersData?.items || []}
                  farms={farmsData?.items || []}
                  assignments={assignmentsData?.items || []}
                  gateways={gatewaysData?.items || []}
                />

                {/* Pagination Controls */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {(page - 1) * pageSize + 1} to{" "}
                    {Math.min(page * pageSize, sensorDataResponse?.total || 0)}{" "}
                    of {sensorDataResponse?.total || 0} results
                    {tableSearch &&
                      ` (filtered from ${sensorReadings.length} total)`}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(1)}
                      disabled={page === 1 || isLoadingData}
                    >
                      First
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1 || isLoadingData}
                    >
                      Previous
                    </Button>
                    <div className="text-sm">
                      Page {page} of {sensorDataResponse?.pages || 1}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={
                        page >= (sensorDataResponse?.pages || 1) ||
                        isLoadingData
                      }
                    >
                      Next
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(sensorDataResponse?.pages || 1)}
                      disabled={
                        page >= (sensorDataResponse?.pages || 1) ||
                        isLoadingData
                      }
                    >
                      Last
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
    </div>
  );
}
