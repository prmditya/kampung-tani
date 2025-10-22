import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  SensorDataResponse,
  SensorResponse,
  FarmerResponse,
  FarmResponse,
  GatewayAssignmentResponse,
  GatewayResponse
} from "@/types/api";
import { useMemo } from "react";

interface ReadingsTableProps {
  readings: SensorDataResponse[];
  sensors: SensorResponse[];
  farmers: FarmerResponse[];
  farms: FarmResponse[];
  assignments: GatewayAssignmentResponse[];
  gateways: GatewayResponse[];
}

export function ReadingsTable({ readings, sensors, farmers, farms, assignments, gateways }: ReadingsTableProps) {
  // Create a map of sensor IDs to sensor info
  const sensorMap = useMemo(() => {
    return new Map(
      sensors.map((s) => [s.id, { type: s.type, name: s.name, uid: s.sensor_uid }])
    );
  }, [sensors]);

  // Create maps for farmers and farms
  const farmerMap = useMemo(() => {
    return new Map(farmers.map((f) => [f.id, f]));
  }, [farmers]);

  const farmMap = useMemo(() => {
    return new Map(farms.map((f) => [f.id, f]));
  }, [farms]);

  // Create a map of gateway IDs to gateway info
  const gatewayMap = useMemo(() => {
    return new Map(gateways.map((g) => [g.id, g]));
  }, [gateways]);

  // Create a map of gateway IDs to active assignments
  const assignmentMap = useMemo(() => {
    const activeAssignments = assignments.filter((a) => a.is_active);
    return new Map(
      activeAssignments.map((a) => [a.gateway_id, a])
    );
  }, [assignments]);

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
            <TableHead>Farmer</TableHead>
            <TableHead>Farm</TableHead>
            <TableHead>Gateway</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {readings.map((reading) => {
            const sensor = sensorMap.get(reading.sensor_id);
            // Extract measurement type from metadata
            const measurementType = reading.metadata?.measurement_type || sensor?.type || "Unknown";

            // Get farmer and farm from gateway assignment
            const assignment = assignmentMap.get(reading.gateway_id);
            const farm = assignment ? farmMap.get(assignment.farm_id) : null;
            const farmer = farm ? farmerMap.get(farm.farmer_id) : null;

            // Get gateway info
            const gateway = gatewayMap.get(reading.gateway_id);

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
                  {farmer ? farmer.name : assignment ? "No farmer found" : "No assignment"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {farm ? farm.name : assignment ? "No farm found" : "No assignment"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {gateway ? gateway.gateway_uid : reading.gateway_id}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
