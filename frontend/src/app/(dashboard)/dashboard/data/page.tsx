"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  dummySensorReadings,
  dummyDevices,
  dummyFarmers,
} from "@/lib/dummy-data";
import type { SensorReading } from "@/lib/types";
import { DataFilter, DataChart, ReadingsTable } from "@/features/data";

export default function DataPage() {
  const [readings, setReadings] =
    useState<SensorReading[]>(dummySensorReadings);
  const [selectedDevice, setSelectedDevice] = useState("all");
  const [selectedFarmer, setSelectedFarmer] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Prepare chart data
  const chartData = readings.map((reading) => ({
    time: new Date(reading.timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    pH: reading.ph,
    Temp: reading.temperature,
    Turbidity: reading.turbidity,
    Level: reading.waterLevel,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Data Viewer</h1>
        <p className="text-muted-foreground">
          View and analyze sensor readings from all devices
        </p>
      </div>

      <DataFilter
        devices={dummyDevices}
        farmers={dummyFarmers}
        selectedDevice={selectedDevice}
        selectedFarmer={selectedFarmer}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDeviceChange={setSelectedDevice}
        onFarmerChange={setSelectedFarmer}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
      />

      <DataChart data={chartData} />

      <Card>
        <CardHeader>
          <CardTitle>Sensor Readings</CardTitle>
        </CardHeader>
        <CardContent>
          <ReadingsTable readings={readings} />
        </CardContent>
      </Card>
    </div>
  );
}
