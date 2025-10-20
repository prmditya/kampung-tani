"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dummyDevices } from "@/lib/dummy-data";
import type { Device } from "@/lib/types";
import { DevicesTable, AddDeviceDialog } from "@/features/devices";

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>(dummyDevices);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Device Management</h1>
          <p className="text-muted-foreground">
            Manage and monitor all IoT devices
          </p>
        </div>
        <AddDeviceDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Devices</CardTitle>
        </CardHeader>
        <CardContent>
          <DevicesTable devices={devices} />
        </CardContent>
      </Card>
    </div>
  );
}
