"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGateways } from "@/hooks/use-gateways";
import { DevicesTable } from "@/features/devices";

export default function DevicesPage() {
  const { data: devicesData, isLoading, error } = useGateways({ size: 20 });

  const devices = devicesData?.items || [];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-muted-foreground">Loading devices...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-destructive">
              Error loading devices: {(error as Error).message}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Devices</CardTitle>
      </CardHeader>
      <CardContent>
        <DevicesTable devices={devices} />
      </CardContent>
    </Card>
  );
}
