"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataFilter, DataChart, ReadingsTable } from "@/features/data";
import { useGateways } from "@/hooks/use-gateways";
import { useSensorsByGateway, useSensorData } from "@/hooks/use-sensors";
import type { SensorDataResponse } from "@/types/api";
import { Loader2 } from "lucide-react";

export default function DataPage() {
  const [selectedGateway, setSelectedGateway] = useState<string>("all");
  const [selectedSensor, setSelectedSensor] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [hours, setHours] = useState(24);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [selectedMeasurementTypes, setSelectedMeasurementTypes] = useState<string[]>([]);

  // Fetch gateways
  const { data: gatewaysData, isLoading: isLoadingGateways } = useGateways();

  // Parse selected gateway ID
  const gatewayId = selectedGateway !== "all" ? parseInt(selectedGateway) : 0;

  // Fetch sensors for selected gateway
  const { data: sensorsData, isLoading: isLoadingSensors } =
    useSensorsByGateway(gatewayId, { size: 100 });

  // Parse selected sensor ID
  const sensorId = selectedSensor !== "all" ? parseInt(selectedSensor) : 0;

  // Calculate hours from date range if provided
  const calculatedHours = useMemo(() => {
    if (dateFrom && dateTo) {
      const from = new Date(dateFrom);
      const to = new Date(dateTo);
      return Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60));
    }
    return hours;
  }, [dateFrom, dateTo, hours]);

  // Fetch sensor data for selected sensor
  const { data: sensorDataResponse, isLoading: isLoadingData, refetch } = useSensorData(
    sensorId,
    {
      page,
      size: pageSize,
      hours: calculatedHours,
    }
  );

  // Process sensor data for display
  const sensorReadings: SensorDataResponse[] = useMemo(() => {
    return sensorDataResponse?.items || [];
  }, [sensorDataResponse]);

  // Get all available measurement types from readings
  const availableMeasurementTypes = useMemo(() => {
    const types = new Set<string>();
    sensorReadings.forEach((reading) => {
      const measurementType = reading.metadata?.measurement_type || "Unknown";
      types.add(measurementType);
    });
    return Array.from(types).sort();
  }, [sensorReadings]);

  // Auto-select all measurement types on first load
  useMemo(() => {
    if (availableMeasurementTypes.length > 0 && selectedMeasurementTypes.length === 0) {
      setSelectedMeasurementTypes(availableMeasurementTypes);
    }
  }, [availableMeasurementTypes, selectedMeasurementTypes.length]);

  // Prepare separate chart data for each measurement type (to avoid scale issues)
  const chartDataByType = useMemo(() => {
    if (!sensorReadings.length) return {};

    const dataByType: Record<string, Array<{ time: string; value: number; unit?: string }>> = {};

    // Filter by selected measurement types
    const filteredReadings = sensorReadings.filter((reading) => {
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
      const existingPoint = dataByType[measurementType].find((d) => d.time === time);
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
  }, [sensorReadings, selectedMeasurementTypes]);

  const handleReset = () => {
    setSelectedGateway("all");
    setSelectedSensor("all");
    setDateFrom(undefined);
    setDateTo(undefined);
    setHours(24);
    setPage(1);
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
    const headers = ["Timestamp", "Sensor ID", "Gateway ID", "Measurement Type", "Value", "Unit"];
    const rows = sensorReadings.map((r) => [
      r.timestamp,
      r.sensor_id,
      r.gateway_id,
      r.metadata?.measurement_type || "Unknown",
      r.value,
      r.unit || "",
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

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

      {!isLoading && sensorReadings.length === 0 && (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              No sensor data available. Please select a gateway and sensor to
              view data.
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && sensorReadings.length > 0 && (
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
                      variant={selectedMeasurementTypes.includes(type) ? "default" : "outline"}
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

          {/* Separate Charts for Each Measurement Type */}
          {Object.entries(chartDataByType).length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Object.entries(chartDataByType).map(([type, data]) => (
                <DataChart
                  key={type}
                  data={data.map((d) => ({ time: d.time, [type]: d.value }))}
                  title={`${type} ${data[0]?.unit ? `(${data[0].unit})` : ""}`}
                />
              ))}
            </div>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>Sensor Readings</CardTitle>
            </CardHeader>
            <CardContent>
              <ReadingsTable
                readings={sensorReadings}
                sensors={sensorsData?.items || []}
              />

              {/* Pagination Controls */}
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, sensorDataResponse?.total || 0)} of {sensorDataResponse?.total || 0} results
                </div>
                <div className="flex items-center gap-2">
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
                    disabled={page >= (sensorDataResponse?.pages || 1) || isLoadingData}
                  >
                    Next
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
