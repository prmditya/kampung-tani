import { AddFarmerDialog } from '@/features/farmers';

export default function devicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your profile</p>
        </div>
      </div>
      {children}
    </div>
  );
}
