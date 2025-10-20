import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link2Off } from "lucide-react";
import type { Assignment, Farm } from "@/lib/types";

interface AssignmentsTableProps {
  assignments: Assignment[];
  farms: Farm[];
}

export function AssignmentsTable({ assignments, farms }: AssignmentsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Assignment ID</TableHead>
          <TableHead>Device</TableHead>
          <TableHead>Farmer</TableHead>
          <TableHead>Farm</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Assigned Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {assignments.map((assignment) => {
          const farm = farms.find((f) => f.id === assignment.farmId);
          return (
            <TableRow key={assignment.id}>
              <TableCell className="font-medium">
                {assignment.id}
              </TableCell>
              <TableCell>{assignment.deviceName}</TableCell>
              <TableCell>{assignment.farmerName}</TableCell>
              <TableCell>{assignment.farmName}</TableCell>
              <TableCell className="text-muted-foreground">
                {farm?.location}
              </TableCell>
              <TableCell>
                {new Date(assignment.assignedAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    assignment.status === "active"
                      ? "default"
                      : "secondary"
                  }
                >
                  {assignment.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm">
                  <Link2Off className="mr-2 h-4 w-4" />
                  Unassign
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
