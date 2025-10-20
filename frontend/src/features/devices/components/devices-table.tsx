import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Battery } from "lucide-react";
import type { Device } from "@/lib/types";

interface DevicesTableProps {
  devices: Device[];
}

export function DevicesTable({ devices }: DevicesTableProps) {
  const getStatusColor = (status: Device["status"]) => {
    switch (status) {
      case "active":
        return "default";
      case "inactive":
        return "secondary";
      case "maintenance":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getBatteryColor = (level: number) => {
    if (level >= 60) return "text-green-500";
    if (level >= 20) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Device ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Farm</TableHead>
          <TableHead>Last Active</TableHead>
          <TableHead>Battery</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {devices.map((device) => (
          <TableRow key={device.id}>
            <TableCell className="font-medium">{device.id}</TableCell>
            <TableCell>{device.name}</TableCell>
            <TableCell>
              <Badge variant={getStatusColor(device.status)}>
                {device.status}
              </Badge>
            </TableCell>
            <TableCell>
              {device.farmName || (
                <span className="text-muted-foreground">Unassigned</span>
              )}
            </TableCell>
            <TableCell>
              {new Date(device.lastActive).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Battery
                  className={`h-4 w-4 ${getBatteryColor(device.batteryLevel || 0)}`}
                />
                <span className="text-sm">{device.batteryLevel}%</span>
              </div>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="icon">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
