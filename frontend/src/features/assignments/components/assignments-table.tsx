import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type {
  GatewayAssignmentResponse,
  GatewayResponse,
  FarmResponse,
} from '@/types/api';
import { DeleteAssignmentButton } from './delete-assignment-button';

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

  // Note: We no longer need to fetch users separately since
  // assigned_by_user is now included in the assignment response

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Gateway</TableHead>
          <TableHead>Farm</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Start Date</TableHead>
          <TableHead>End Date</TableHead>
          <TableHead>Assigned by</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {assignments.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={7}
              className="text-center py-8 text-muted-foreground"
            >
              No assignments found. Create a new assignment to get started.
            </TableCell>
          </TableRow>
        ) : (
          assignments.map((assignment) => {
            const gateway = getGateway(assignment.gateway_id);
            const farm = getFarm(assignment.farm_id);

            // Use nested data from assignment if gateway/farm not found in accessible list
            const gatewayDisplay = gateway || assignment.gateway;
            const farmDisplay = farm || assignment.farm;

            return (
              <TableRow key={assignment.id}>
                <TableCell className="font-medium">
                  {gatewayDisplay ? (
                    <div>
                      <div>
                        {gateway?.name ||
                          gatewayDisplay.name ||
                          gatewayDisplay.gateway_uid}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {gateway?.gateway_uid || gatewayDisplay.gateway_uid}
                      </div>
                    </div>
                  ) : (
                    <div className="text-muted-foreground">
                      <div className="text-sm">Restricted Access</div>
                      <div className="text-xs">
                        Gateway ID: {assignment.gateway_id}
                      </div>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {farmDisplay ? (
                    farmDisplay.name
                  ) : (
                    <div className="text-muted-foreground">
                      <div className="text-sm">Restricted Access</div>
                      <div className="text-xs">
                        Farm ID: {assignment.farm_id}
                      </div>
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {farm?.location || assignment.farm?.location || '-'}
                </TableCell>
                <TableCell>
                  {assignment.start_date
                    ? new Date(assignment.start_date).toLocaleDateString()
                    : '-'}
                </TableCell>
                <TableCell>
                  {assignment.end_date
                    ? new Date(assignment.end_date).toLocaleDateString()
                    : '-'}
                </TableCell>
                <TableCell>
                  {assignment.assigned_by_user?.username || '-'}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={assignment.is_active ? 'default' : 'secondary'}
                  >
                    {assignment.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>

                <TableCell className="text-right">
                  <DeleteAssignmentButton
                    assignmentId={assignment.id}
                    gatewayName={
                      gatewayDisplay
                        ? gateway?.name ||
                          gatewayDisplay.name ||
                          gatewayDisplay.gateway_uid
                        : 'Restricted Gateway'
                    }
                    farmName={
                      farmDisplay ? farmDisplay.name : 'Restricted Farm'
                    }
                    canUnassign={assignment.can_unassign}
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
