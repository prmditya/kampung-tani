import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SensorReading } from "@/lib/types";

interface ReadingsTableProps {
  readings: SensorReading[];
}

export function ReadingsTable({ readings }: ReadingsTableProps) {
  return (
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
  );
}
