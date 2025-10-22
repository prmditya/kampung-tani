import { AddDeviceDialog } from "@/features/devices";

export default function devicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Device Management
          </h1>
          <p className="text-muted-foreground">
            Manage and monitor all IoT devices
          </p>
        </div>
        <AddDeviceDialog />
      </div>
      {children}
    </div>
  );
}
