import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type {
  GatewayAssignmentResponse,
  GatewayResponse,
  FarmResponse,
} from "@/types/api";
import { DeleteAssignmentButton } from "./delete-assignment-button";

interface AssignmentsTableProps {
  assignments: GatewayAssignmentResponse[];
  gateways: GatewayResponse[];
  farms: FarmResponse[];
}

export function AssignmentsTable({
  assignments,
  gateways,
  farms,
}: AssignmentsTableProps) {
  // Helper to find gateway by ID
  const getGateway = (gatewayId: number) => {
    return gateways.find((g) => g.id === gatewayId);
  };

  // Helper to find farm by ID
  const getFarm = (farmId: number) => {
    return farms.find((f) => f.id === farmId);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Gateway</TableHead>
          <TableHead>Farm</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Start Date</TableHead>
          <TableHead>End Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {assignments.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
              No assignments found. Create a new assignment to get started.
            </TableCell>
          </TableRow>
        ) : (
          assignments.map((assignment) => {
            const gateway = getGateway(assignment.gateway_id);
            const farm = getFarm(assignment.farm_id);

            return (
              <TableRow key={assignment.id}>
                <TableCell className="font-medium">
                  {gateway ? (
                    <div>
                      <div>{gateway.name || gateway.gateway_uid}</div>
                      <div className="text-xs text-muted-foreground">
                        {gateway.gateway_uid}
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">
                      Gateway #{assignment.gateway_id}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {farm ? (
                    farm.name
                  ) : (
                    <span className="text-muted-foreground">
                      Farm #{assignment.farm_id}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {farm?.location || "-"}
                </TableCell>
                <TableCell>
                  {assignment.start_date
                    ? new Date(assignment.start_date).toLocaleDateString()
                    : "-"}
                </TableCell>
                <TableCell>
                  {assignment.end_date
                    ? new Date(assignment.end_date).toLocaleDateString()
                    : "-"}
                </TableCell>
                <TableCell>
                  <Badge variant={assignment.is_active ? "default" : "secondary"}>
                    {assignment.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DeleteAssignmentButton
                    assignmentId={assignment.id}
                    gatewayName={gateway?.name || gateway?.gateway_uid || `Gateway #${assignment.gateway_id}`}
                    farmName={farm?.name || `Farm #${assignment.farm_id}`}
                  />
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
