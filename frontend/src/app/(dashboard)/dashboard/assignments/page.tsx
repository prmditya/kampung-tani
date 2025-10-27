'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { AssignmentForm, AssignmentsTable } from '@/features/assignments';
import useAssignments from '@/features/assignments/hooks/use-assignment';
import { useGateways } from '@/hooks/use-gateways';
import { useFarms } from '@/features/farmers/hooks/use-farms';
import {
  Unplug,
  HardDrive,
  Tractor,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from 'lucide-react';

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
      <div className="space-y-8 animate-in fade-in duration-500">
        <Card>
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Loading assignments...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (assignmentsError) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <Card className="border-destructive">
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center gap-3 text-center">
              <div className="rounded-full bg-destructive/10 p-3">
                <AlertCircle className="h-10 w-10 text-destructive" />
              </div>
              <div>
                <p className="font-semibold text-destructive">
                  Error loading assignments
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {assignmentsError.message}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Make sure the backend server is running on
                  http://localhost:5000
                </p>
              </div>
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
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 hover:shadow-lg hover:scale-105 transition-all duration-300">
          <div className="absolute top-0 right-0 -mt-4 -mr-8 opacity-15">
            <Unplug className="h-32 w-32" />
          </div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="rounded-lg bg-white/20 p-3 backdrop-blur-sm">
                <Unplug className="h-6 w-6" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-white/90">
                Total Assignments
              </p>
              <p className="text-4xl font-bold tracking-tight">
                {assignments.length}
              </p>
              <p className="text-xs text-white/80 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                {activeAssignments} active
              </p>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 hover:shadow-lg hover:scale-105 transition-all duration-300">
          <div className="absolute top-0 right-0 -mt-4 -mr-8 opacity-15">
            <HardDrive className="h-32 w-32" />
          </div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="rounded-lg bg-white/20 p-3 backdrop-blur-sm">
                <HardDrive className="h-6 w-6" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-white/90">
                Assigned Gateways
              </p>
              <p className="text-4xl font-bold tracking-tight">
                {assignedGateways}
              </p>
              <p className="text-xs text-white/80">
                of {totalGateways} total gateways
              </p>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0 hover:shadow-lg hover:scale-105 transition-all duration-300">
          <div className="absolute top-0 right-0 -mt-4 -mr-8 opacity-15">
            <Tractor className="h-32 w-32" />
          </div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="rounded-lg bg-white/20 p-3 backdrop-blur-sm">
                <Tractor className="h-6 w-6" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-white/90">Total Farms</p>
              <p className="text-4xl font-bold tracking-tight">{totalFarms}</p>
              <p className="text-xs text-white/80">Available farms</p>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 hover:shadow-lg hover:scale-105 transition-all duration-300">
          <div className="absolute top-0 right-0 -mt-4 -mr-8 opacity-15">
            <HardDrive className="h-32 w-32" />
          </div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="rounded-lg bg-white/20 p-3 backdrop-blur-sm">
                <HardDrive className="h-6 w-6" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-white/90">
                Available Gateways
              </p>
              <p className="text-4xl font-bold tracking-tight">
                {totalGateways - assignedGateways}
              </p>
              <p className="text-xs text-white/80">Unassigned</p>
            </div>
          </div>
        </Card>
      </div>

      <AssignmentForm gateways={gateways} farms={farms} />

      <Card>
        <CardHeader>
          <CardTitle>Current Assignments</CardTitle>
          <CardDescription>
            View and manage all gateway-to-farm assignments in your system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AssignmentsTable
            assignments={assignments}
            gateways={gateways}
            farms={farms}
          />
        </CardContent>
      </Card>
    </div>
  );
}
