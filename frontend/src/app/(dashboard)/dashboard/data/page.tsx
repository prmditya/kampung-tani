"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Download, Filter } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  dummySensorReadings,
  dummyDevices,
  dummyFarmers,
} from "@/lib/dummy-data";
import type { SensorReading } from "@/lib/types";

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

      {/* Filter Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="grid gap-2">
              <Label htmlFor="device-filter">Device</Label>
              <Select value={selectedDevice} onValueChange={setSelectedDevice}>
                <SelectTrigger id="device-filter">
                  <SelectValue placeholder="All Devices" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Devices</SelectItem>
                  {dummyDevices.map((device) => (
                    <SelectItem key={device.id} value={device.id}>
                      {device.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="farmer-filter">Farmer</Label>
              <Select value={selectedFarmer} onValueChange={setSelectedFarmer}>
                <SelectTrigger id="farmer-filter">
                  <SelectValue placeholder="All Farmers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Farmers</SelectItem>
                  {dummyFarmers.map((farmer) => (
                    <SelectItem key={farmer.id} value={farmer.id}>
                      {farmer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="date-from">Date From</Label>
              <Input
                id="date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="date-to">Date To</Label>
              <Input
                id="date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <Button className="flex-1">Apply Filters</Button>
            <Button variant="outline" className="flex-1">
              Reset
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Sensor Data Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid
                strokeDasharray="5 5"
                className="stroke-border"
                horizontal={true}
                vertical={false}
              />
              <XAxis
                dataKey="time"
                className="text-xs"
                tick={{ fill: "currentColor" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: "currentColor" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="pH"
                stroke="rgb(59, 130, 246)"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="Temp"
                stroke="rgb(16, 185, 129)"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="Turbidity"
                stroke="rgb(249, 115, 22)"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="Level"
                stroke="rgb(168, 85, 247)"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Sensor Readings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sensor Readings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Device ID</TableHead>
                <TableHead>pH Level</TableHead>
                <TableHead>Temperature (°C)</TableHead>
                <TableHead>Turbidity (NTU)</TableHead>
                <TableHead>Water Level (%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {readings.map((reading) => (
                <TableRow key={reading.id}>
                  <TableCell>
                    {new Date(reading.timestamp).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell className="font-medium">
                    {reading.deviceId}
                  </TableCell>
                  <TableCell>{reading.ph.toFixed(1)}</TableCell>
                  <TableCell>{reading.temperature.toFixed(1)}</TableCell>
                  <TableCell>{reading.turbidity.toFixed(1)}</TableCell>
                  <TableCell>{reading.waterLevel.toFixed(1)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
