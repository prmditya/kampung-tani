import { AddFarmerDialog } from '@/features/farmers';

export default function devicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="flex-row md:flex items-center justify-between">
        <div className="mb-2 md:mb-0">
          <h1 className="text-4xl font-bold tracking-tight">Farmers</h1>
          <p className="text-muted-foreground mt-1">
            Manage farmer profiles and farm information
          </p>
        </div>
        <AddFarmerDialog />
      </div>
      {children}
    </div>
  );
}
