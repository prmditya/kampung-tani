"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  dummyAssignments,
  dummyDevices,
  dummyFarmers,
  dummyFarms,
} from "@/lib/dummy-data";
import type { Assignment } from "@/lib/types";
import { AssignmentForm, AssignmentsTable } from "@/features/assignments";

export default function AssignmentsPage() {
  const [assignments, setAssignments] =
    useState<Assignment[]>(dummyAssignments);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [selectedFarmer, setSelectedFarmer] = useState("");
  const [selectedFarm, setSelectedFarm] = useState("");

  // Filter only unassigned devices
  const unassignedDevices = dummyDevices.filter(
    (device) => !assignments.some((a) => a.deviceId === device.id)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Assignment Management
        </h1>
        <p className="text-muted-foreground">
          Assign devices to farmers and manage deployments
        </p>
      </div>

      <AssignmentForm
        unassignedDevices={unassignedDevices}
        farmers={dummyFarmers}
        farms={dummyFarms}
        selectedDevice={selectedDevice}
        selectedFarmer={selectedFarmer}
        selectedFarm={selectedFarm}
        onDeviceChange={setSelectedDevice}
        onFarmerChange={setSelectedFarmer}
        onFarmChange={setSelectedFarm}
      />

      <Card>
        <CardHeader>
          <CardTitle>Current Assignments</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto -mx-6 px-6">
          <AssignmentsTable assignments={assignments} farms={dummyFarms} />
        </CardContent>
      </Card>
    </div>
  );
}
