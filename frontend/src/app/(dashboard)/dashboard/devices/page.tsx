'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { useGateways } from '@/hooks/use-gateways';
import { DevicesTable } from '@/features/devices';
import {
  HardDrive,
  Activity,
  Power,
  Wrench,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export default function DevicesPage() {
  const { data: devicesData, isLoading, error } = useGateways({ size: 100 });

  const devices = devicesData?.items || [];

  // Calculate stats
  const totalDevices = devices.length;
  const onlineDevices = devices.filter((d) => d.status === 'online').length;
  const offlineDevices = devices.filter((d) => d.status === 'offline').length;
  const maintenanceDevices = devices.filter(
    (d) => d.status === 'maintenance',
  ).length;

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <Card>
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Loading devices...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <Card className="border-destructive">
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center gap-3 text-center">
              <div className="rounded-full bg-destructive/10 p-3">
                <AlertCircle className="h-10 w-10 text-destructive" />
              </div>
              <div>
                <p className="font-semibold text-destructive">
                  Error loading devices
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {(error as Error).message}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 hover:shadow-lg hover:scale-105 transition-all duration-300">
          <div className="absolute top-0 right-0 -mt-4 -mr-8 opacity-15">
            <HardDrive className="h-32 w-32" />
          </div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="rounded-lg bg-white/20 p-3 backdrop-blur-sm">
                <HardDrive className="h-6 w-6" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-white/90">Total Devices</p>
              <p className="text-4xl font-bold tracking-tight">
                {totalDevices}
              </p>
              <p className="text-xs text-white/80">Registered gateways</p>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 hover:shadow-lg hover:scale-105 transition-all duration-300">
          <div className="absolute top-0 right-0 -mt-4 -mr-8 opacity-15">
            <Activity className="h-32 w-32" />
          </div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="rounded-lg bg-white/20 p-3 backdrop-blur-sm">
                <Activity className="h-6 w-6" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-white/90">Online</p>
              <p className="text-4xl font-bold tracking-tight">
                {onlineDevices}
              </p>
              <p className="text-xs text-white/80">Active devices</p>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 hover:shadow-lg hover:scale-105 transition-all duration-300">
          <div className="absolute top-0 right-0 -mt-4 -mr-8 opacity-15">
            <Power className="h-32 w-32" />
          </div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="rounded-lg bg-white/20 p-3 backdrop-blur-sm">
                <Power className="h-6 w-6" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-white/90">Offline</p>
              <p className="text-4xl font-bold tracking-tight">
                {offlineDevices}
              </p>
              <p className="text-xs text-white/80">Inactive devices</p>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 hover:shadow-lg hover:scale-105 transition-all duration-300">
          <div className="absolute top-0 right-0 -mt-4 -mr-8 opacity-15">
            <Wrench className="h-32 w-32" />
          </div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="rounded-lg bg-white/20 p-3 backdrop-blur-sm">
                <Wrench className="h-6 w-6" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-white/90">Maintenance</p>
              <p className="text-4xl font-bold tracking-tight">
                {maintenanceDevices}
              </p>
              <p className="text-xs text-white/80">Under maintenance</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Devices</CardTitle>
          <CardDescription>
            View and manage all gateway devices registered in your system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DevicesTable devices={devices} />
        </CardContent>
      </Card>
    </div>
  );
}
