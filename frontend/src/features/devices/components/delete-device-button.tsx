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
import { Trash2 } from 'lucide-react';
import { useDeleteGateway } from '@/hooks/use-gateways';
import { toast } from 'sonner';

interface DeleteDeviceButtonProps {
  deviceId: number;
  deviceName: string | null | undefined;
  gatewayUid: string;
}

export function DeleteDeviceButton({
  deviceId,
  deviceName,
  gatewayUid,
}: DeleteDeviceButtonProps) {
  const deleteMutation = useDeleteGateway();

  const handleDelete = () => {
    deleteMutation.mutate(deviceId, {
      onSuccess: () => {
        toast.success(`${deviceName} deleted successfully`);
      },
      onError: (error) => {
        toast.error(
          error?.message || `Failed to delete ${deviceName}. Please try again.`,
        );
      },
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" disabled={deleteMutation.isPending}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Device?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <p>
                This will permanently delete gateway device{' '}
                <strong>{deviceName || gatewayUid}</strong>.
              </p>
              <p className="text-destructive font-medium">
                ⚠️ Warning: All sensor data and assignments associated with this
                device will also be affected.
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
            {deleteMutation.isPending ? 'Deleting...' : 'Delete Device'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
