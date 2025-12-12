export default function SummaryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Summary Report</h1>
          <p className="text-muted-foreground mt-1">
            Generate and export farm data summary.
          </p>
        </div>
      </div>
      {children}
    </div>
  );
}
