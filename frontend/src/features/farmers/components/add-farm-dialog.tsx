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
import { Field, FieldError, FieldGroup } from '@/components/ui/field';
import { toast } from 'sonner';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { addFarmSchema, FarmFormData } from '@/features/farmers/schemas';

interface AddFarmDialogProps {
  farmerId: number;
}

export function AddFarmDialog({ farmerId }: AddFarmDialogProps) {
  const [open, setOpen] = useState(false);
  const createMutation = useCreateFarm();

  const form = useForm<FarmFormData>({
    resolver: zodResolver(addFarmSchema),
    defaultValues: {
      farmer_id: farmerId,
      name: '',
      location: '',
      latitude: undefined,
      longitude: undefined,
      area_size: undefined,
      soil_type: '',
    },
  });

  const handleSubmit = (data: FarmFormData) => {
    const farmData: FarmCreate = {
      farmer_id: data.farmer_id,
      name: data.name,
      location: data.location || null,
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      area_size: data.area_size || null,
      soil_type: data.soil_type || null,
    };

    createMutation.mutate(farmData, {
      onSuccess: () => {
        toast.success(`Farm ${data.name} added successfully`);
        form.reset();
        setOpen(false);
      },
      onError: (error) => {
        toast.error(
          error?.message ||
            `Failed to add farm ${data.name}. Please try again.`,
        );
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
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <DialogHeader>
            <DialogTitle>Add New Farm</DialogTitle>
            <DialogDescription>
              Register a new farm for this farmer
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="grid gap-4 py-4">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field className="grid gap-2">
                  <Label htmlFor="name">
                    Farm Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="Green Valley Farm"
                    disabled={createMutation.isPending}
                    {...field}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              name="location"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="Bandung, West Java"
                    disabled={createMutation.isPending}
                    {...field}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="latitude"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field className="grid gap-2">
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      placeholder="-6.917464"
                      disabled={createMutation.isPending}
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value
                            ? parseFloat(e.target.value)
                            : undefined,
                        )
                      }
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              <Controller
                name="longitude"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field className="grid gap-2">
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      placeholder="107.619123"
                      disabled={createMutation.isPending}
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value
                            ? parseFloat(e.target.value)
                            : undefined,
                        )
                      }
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </div>

            <Controller
              name="area_size"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field className="grid gap-2">
                  <Label htmlFor="area_size">Area Size (hectares)</Label>
                  <Input
                    id="area_size"
                    type="number"
                    step="0.01"
                    placeholder="2.5"
                    disabled={createMutation.isPending}
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? parseFloat(e.target.value) : undefined,
                      )
                    }
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              name="soil_type"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field className="grid gap-2">
                  <Label htmlFor="soil_type">Soil Type</Label>
                  <Input
                    id="soil_type"
                    placeholder="Loamy, Clay, Sandy, etc."
                    disabled={createMutation.isPending}
                    {...field}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </FieldGroup>
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
