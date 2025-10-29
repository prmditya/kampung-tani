import { AddDeviceDialog } from '@/features/devices';

export default function devicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="flex-row md:flex items-center justify-between">
        <div className="mb-2 md:mb-0">
          <h1 className="text-4xl font-bold tracking-tight">
            Device Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and monitor all IoT devices
          </p>
        </div>
        <AddDeviceDialog />
      </div>
      {children}
    </div>
  );
}
