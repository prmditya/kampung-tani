'use client';

import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Link2Off } from 'lucide-react';
import { useDeleteAssignment } from '@/features/assignments/hooks/use-assignment';
import { toast } from 'sonner';

interface DeleteAssignmentButtonProps {
  assignmentId: number;
  gatewayName: string;
  farmName: string;
  canUnassign: boolean;
}

export function DeleteAssignmentButton({
  assignmentId,
  gatewayName,
  farmName,
  canUnassign,
}: DeleteAssignmentButtonProps) {
  const deleteMutation = useDeleteAssignment();

  const handleDelete = () => {
    deleteMutation.mutate(assignmentId, {
      onSuccess: () => {
        toast.success(`Assignment deleted successfully`);
      },
      onError: (error) => {
        toast.error(
          error?.message || `Failed to delete Assignment. Please try again.`,
        );
      },
    });
  };

  const isDisabled = !canUnassign || deleteMutation.isPending;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant={canUnassign ? 'ghost' : 'ghost'}
          size="sm"
          disabled={isDisabled}
          className={!canUnassign ? 'opacity-50 cursor-not-allowed' : ''}
        >
          <Link2Off className="mr-2 h-4 w-4" />
          {canUnassign ? 'Unassign' : 'Restricted'}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unassign Gateway?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <p>
                This will unassign gateway <strong>{gatewayName}</strong> from{' '}
                <strong>{farmName}</strong>.
              </p>
              <p className="text-muted-foreground">
                This action cannot be undone.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending ? 'Unassigning...' : 'Unassign'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
