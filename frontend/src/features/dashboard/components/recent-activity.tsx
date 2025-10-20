import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HardDrive } from "lucide-react";

interface Assignment {
  id: string;
  deviceName: string;
  farmName: string;
  status: string;
}

interface RecentActivityProps {
  assignments: Assignment[];
}

export function RecentActivity({ assignments }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {assignments.slice(0, 4).map((assignment) => (
            <div
              key={assignment.id}
              className="flex gap-3 pb-4 border-b last:border-0 last:pb-0"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted shrink-0">
                <HardDrive className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {assignment.deviceName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {assignment.farmName}
                </p>
              </div>
              <Badge
                variant={
                  assignment.status === "active" ? "default" : "secondary"
                }
                className="text-xs shrink-0"
              >
                {assignment.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
