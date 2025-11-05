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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { useCreateFarm } from '@/features/farmers/hooks/use-farms';
import type { FarmCreate } from '@/types/api';

interface AddFarmDialogProps {
  farmerId: number;
}

export function AddFarmDialog({ farmerId }: AddFarmDialogProps) {
  const [open, setOpen] = useState(false);
  const createMutation = useCreateFarm();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data: FarmCreate = {
      farmer_id: farmerId,
      name: formData.get('name') as string,
      location: (formData.get('location') as string) || null,
      latitude: formData.get('latitude')
        ? parseFloat(formData.get('latitude') as string)
        : null,
      longitude: formData.get('longitude')
        ? parseFloat(formData.get('longitude') as string)
        : null,
      area_size: formData.get('area_size')
        ? parseFloat(formData.get('area_size') as string)
        : null,
      soil_type: (formData.get('soil_type') as string) || null,
    };

    createMutation.mutate(data, {
      onSuccess: () => {
        setOpen(false);
        e.currentTarget.reset();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Farm
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Farm</DialogTitle>
            <DialogDescription>
              Register a new farm for this farmer
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Farm Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Green Valley Farm"
                required
                disabled={createMutation.isPending}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                placeholder="Bandung, West Java"
                disabled={createMutation.isPending}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  name="latitude"
                  type="number"
                  step="any"
                  placeholder="-6.917464"
                  disabled={createMutation.isPending}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  name="longitude"
                  type="number"
                  step="any"
                  placeholder="107.619123"
                  disabled={createMutation.isPending}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="area_size">Area Size (hectares)</Label>
              <Input
                id="area_size"
                name="area_size"
                type="number"
                step="0.01"
                placeholder="2.5"
                disabled={createMutation.isPending}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="soil_type">Soil Type</Label>
              <Input
                id="soil_type"
                name="soil_type"
                placeholder="Loamy, Clay, Sandy, etc."
                disabled={createMutation.isPending}
              />
            </div>

            {createMutation.isError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                {createMutation.error?.message || 'Failed to create farm'}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Adding...' : 'Add Farm'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
