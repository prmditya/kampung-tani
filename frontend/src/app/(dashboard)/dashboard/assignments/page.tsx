"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AssignmentForm, AssignmentsTable } from "@/features/assignments";
import useAssignments from "@/features/assignments/hooks/use-assignment";
import { useGateways } from "@/hooks/use-gateways";
import { useFarms } from "@/features/farmers/hooks/use-farms";

export default function AssignmentsPage() {
  const {
    data: assignmentsData,
    isLoading: assignmentsLoading,
    error: assignmentsError,
  } = useAssignments({ size: 100 });
  const { data: gatewaysData, isLoading: gatewaysLoading } = useGateways({
    size: 100,
  });
  const { data: farmsData, isLoading: farmsLoading } = useFarms({ size: 100 });

  // Handle data - provide empty arrays as fallback
  const assignments = assignmentsData?.items || [];
  const gateways = gatewaysData?.items || [];
  const farms = farmsData?.items || [];

  const isLoading = assignmentsLoading || gatewaysLoading || farmsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="text-muted-foreground">
                Loading assignments...
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (assignmentsError) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p>Error loading assignments: {assignmentsError.message}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Make sure the backend server is running on http://localhost:5000
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate stats
  const activeAssignments = assignments.filter((a) => a.is_active).length;
  const totalGateways = gateways.length;
  const totalFarms = farms.length;
  const assignedGateways = new Set(assignments.map((a) => a.gateway_id)).size;

  return (
    <>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignments.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeAssignments} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Assigned Gateways
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignedGateways}</div>
            <p className="text-xs text-muted-foreground">
              of {totalGateways} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Farms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFarms}</div>
            <p className="text-xs text-muted-foreground">Available farms</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Available Gateways
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalGateways - assignedGateways}
            </div>
            <p className="text-xs text-muted-foreground">Unassigned</p>
          </CardContent>
        </Card>
      </div>

      <AssignmentForm gateways={gateways} farms={farms} />

      <Card>
        <CardHeader>
          <CardTitle>Current Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <AssignmentsTable
            assignments={assignments}
            gateways={gateways}
            farms={farms}
          />
        </CardContent>
      </Card>
    </>
  );
}
