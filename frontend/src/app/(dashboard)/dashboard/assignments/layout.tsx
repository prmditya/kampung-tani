export default function AssignmentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Gateway Assignments
        </h1>
        <p className="text-muted-foreground">
          Assign gateways to farms for monitoring
        </p>
      </div>
      {children}
    </div>
  );
}
