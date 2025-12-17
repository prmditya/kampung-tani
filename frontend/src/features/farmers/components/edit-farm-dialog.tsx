'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil } from 'lucide-react';
import { useUpdateFarm } from '@/features/farmers/hooks/use-farms';
import type { FarmResponse, FarmUpdate } from '@/types/api';
import { MapPicker } from '@/components/ui/map-picker';
import { toast } from 'sonner';

interface EditFarmDialogProps {
  farm: FarmResponse;
}

export function EditFarmDialog({ farm }: EditFarmDialogProps) {
  const [open, setOpen] = useState(false);
  const updateMutation = useUpdateFarm();

  // State for map coordinates
  const [coordinates, setCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(
    farm.latitude && farm.longitude
      ? { latitude: farm.latitude, longitude: farm.longitude }
      : null,
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data: FarmUpdate = {
      name: formData.get('name') as string,
      location: (formData.get('location') as string) || null,
      latitude: coordinates?.latitude ?? null,
      longitude: coordinates?.longitude ?? null,
      area_size: formData.get('area_size')
        ? parseFloat(formData.get('area_size') as string)
        : null,
      soil_type: (formData.get('soil_type') as string) || null,
    };

    updateMutation.mutate(
      { id: farm.id, data },
      {
        onSuccess: () => {
          toast.success('Farm updated successfully');
          setOpen(false);
        },
        onError: (error) => {
          toast.error(
            error?.message || 'Failed to update farm. Please try again.',
          );
        },
      },
    );
  };

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
        <Pencil className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Farm</DialogTitle>
              <DialogDescription>Update farm information</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">
                  Farm Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-name"
                  name="name"
                  defaultValue={farm.name}
                  required
                  disabled={updateMutation.isPending}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  name="location"
                  defaultValue={farm.location || ''}
                  disabled={updateMutation.isPending}
                />
              </div>
              {/* Map Location Picker */}
              <div className="grid gap-2">
                <Label>Farm Location</Label>
                <MapPicker
                  value={coordinates}
                  onChange={setCoordinates}
                  disabled={updateMutation.isPending}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-area_size">Area Size (hectares)</Label>
                <Input
                  id="edit-area_size"
                  name="area_size"
                  type="number"
                  step="0.01"
                  defaultValue={farm.area_size || ''}
                  disabled={updateMutation.isPending}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-soil_type">Soil Type</Label>
                <Input
                  id="edit-soil_type"
                  name="soil_type"
                  defaultValue={farm.soil_type || ''}
                  disabled={updateMutation.isPending}
                />
              </div>

              {updateMutation.isError && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                  {updateMutation.error?.message || 'Failed to update farm'}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Updating...' : 'Update Farm'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
