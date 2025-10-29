import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { GatewayResponse } from "@/types/api";
import { EditDeviceDialog } from "./edit-device-dialog";
import { DeleteDeviceButton } from "./delete-device-button";

interface DevicesTableProps {
  devices: GatewayResponse[];
}

export function DevicesTable({ devices }: DevicesTableProps) {
  const getStatusColor = (status: GatewayResponse["status"]) => {
    switch (status) {
      case "online":
        return "default";
      case "offline":
        return "secondary";
      case "maintenance":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Gateway UID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>MAC Address</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Last Seen</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {devices.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={6}
              className="text-center py-8 text-muted-foreground"
            >
              No devices found. Add a new device to get started.
            </TableCell>
          </TableRow>
        ) : (
          devices.map((device) => (
            <TableRow key={device.id}>
              <TableCell className="font-medium">
                {device.gateway_uid}
              </TableCell>
              <TableCell>
                {device.name || (
                  <span className="text-muted-foreground">Unnamed</span>
                )}
              </TableCell>
              <TableCell>
                {device.mac_address || (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={getStatusColor(device.status)}>
                  {device.status}
                </Badge>
              </TableCell>
              <TableCell>
                {device.last_seen ? (
                  new Date(device.last_seen).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                ) : (
                  <span className="text-muted-foreground">Never</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <EditDeviceDialog device={device} />
                  <DeleteDeviceButton
                    deviceId={device.id}
                    deviceName={device.name}
                    gatewayUid={device.gateway_uid}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
