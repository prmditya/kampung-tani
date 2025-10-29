export default function DataLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Data Viewer</h1>
          <p className="text-muted-foreground mt-1">View and analyze data.</p>
        </div>
      </div>
      {children}
    </div>
  );
}
