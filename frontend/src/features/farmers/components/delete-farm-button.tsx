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
import { Trash2, Loader2 } from 'lucide-react';
import { useDeleteFarm } from '@/features/farmers/hooks/use-farms';
import { toast } from 'sonner';

interface DeleteFarmButtonProps {
  farmId: number;
  farmName: string;
}

export function DeleteFarmButton({ farmId, farmName }: DeleteFarmButtonProps) {
  const deleteMutation = useDeleteFarm();

  const handleDelete = () => {
    deleteMutation.mutate(farmId, {
      onSuccess: () => {
        toast.success('Farm deleted successfully');
      },
      onError: (error) => {
        toast.error(
          error?.message || 'Failed to delete farm. Please try again.',
        );
      },
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" disabled={deleteMutation.isPending}>
          {deleteMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4 text-destructive" />
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Farm?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete farm <strong>{farmName}</strong>. This
            action cannot be undone.
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
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Farm'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
