import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SensorDataResponse, SensorResponse } from "@/types/api";
import { useMemo } from "react";

interface ReadingsTableProps {
  readings: SensorDataResponse[];
  sensors: SensorResponse[];
}

export function ReadingsTable({ readings, sensors }: ReadingsTableProps) {
  // Create a map of sensor IDs to sensor info
  const sensorMap = useMemo(() => {
    return new Map(
      sensors.map((s) => [s.id, { type: s.type, name: s.name, uid: s.sensor_uid }])
    );
  }, [sensors]);

  if (!readings.length) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        No readings available
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>Sensor</TableHead>
            <TableHead>Measurement Type</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Gateway ID</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {readings.map((reading) => {
            const sensor = sensorMap.get(reading.sensor_id);
            // Extract measurement type from metadata
            const measurementType = reading.metadata?.measurement_type || sensor?.type || "Unknown";

            return (
              <TableRow key={reading.id}>
                <TableCell>
                  {new Date(reading.timestamp).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </TableCell>
                <TableCell className="font-medium">
                  {sensor?.name || sensor?.uid || reading.sensor_id}
                </TableCell>
                <TableCell>
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                    {measurementType}
                  </span>
                </TableCell>
                <TableCell className="font-mono">
                  {typeof reading.value === "number"
                    ? reading.value.toFixed(2)
                    : reading.value}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {reading.unit || "-"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {reading.gateway_id}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
