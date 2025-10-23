"use client";

import { Button } from "@/components/ui/button";
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
} from "@/components/ui/alert-dialog";
import { Trash2, Loader2 } from "lucide-react";
import { useDeleteFarmer } from "@/features/farmers/hooks/use-farmers";

interface DeleteFarmerButtonProps {
  farmerId: number;
  farmerName: string;
  farmsCount?: number;
}

export function DeleteFarmerButton({
  farmerId,
  farmerName,
  farmsCount = 0,
}: DeleteFarmerButtonProps) {
  const deleteMutation = useDeleteFarmer();

  const handleDelete = () => {
    deleteMutation.mutate(farmerId);
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
          <AlertDialogTitle>Delete Farmer?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <p>
                This will permanently delete farmer{" "}
                <strong>{farmerName}</strong>.
              </p>
              {farmsCount > 0 && (
                <p className="text-red-600 font-medium">
                  ⚠️ Warning: This will also delete {farmsCount} farm
                  {farmsCount > 1 ? "s" : ""} associated with this farmer.
                </p>
              )}
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
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Farmer"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
