export default function AssignmentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">
          Gateway Assignments
        </h1>
        <p className="text-muted-foreground mt-1">
          Assign gateways to farms for monitoring
        </p>
      </div>
      {children}
    </div>
  );
}
