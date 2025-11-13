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
import { Textarea } from '@/components/ui/textarea';
import { Pencil } from 'lucide-react';
import { useUpdateFarmer } from '@/features/farmers/hooks/use-farmers';
import type { FarmerResponse, FarmerUpdate } from '@/types/api';
import { Field, FieldError, FieldGroup } from '@/components/ui/field';
import { toast } from 'sonner';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updateFarmerSchema } from '@/features/farmers/schemas';

interface EditFarmerDialogProps {
  farmer: FarmerResponse;
}

export function EditFarmerDialog({ farmer }: EditFarmerDialogProps) {
  const [open, setOpen] = useState(false);
  const updateMutation = useUpdateFarmer();

  const form = useForm<z.infer<typeof updateFarmerSchema>>({
    resolver: zodResolver(updateFarmerSchema),
    defaultValues: {
      id: farmer.id,
      name: farmer.name,
      contact: farmer.contact || '',
      address: farmer.address || '',
    },
  });

  const handleSubmit = (data: z.infer<typeof updateFarmerSchema>) => {
    updateMutation.mutate(
      {
        id: farmer.id,
        data: {
          name: data.name,
          contact: data.contact || null,
          address: data.address || null,
        },
      },
      {
        onSuccess: () => {
          toast.success('Farmer updated successfully');
          setOpen(false);
        },
        onError: (error) => {
          toast.error(
            error?.message || 'Failed to update farmer. Please try again.',
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
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <DialogHeader>
              <DialogTitle>Edit Farmer</DialogTitle>
              <DialogDescription>Update farmer information</DialogDescription>
            </DialogHeader>
            <FieldGroup className="grid gap-4 py-4">
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field className="grid gap-2">
                    <Label htmlFor="edit-name">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="edit-name"
                      disabled={updateMutation.isPending}
                      {...field}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              <Controller
                name="contact"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field className="grid gap-2">
                    <Label htmlFor="edit-contact">Phone Number</Label>
                    <Input
                      id="edit-contact"
                      type="tel"
                      disabled={updateMutation.isPending}
                      {...field}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              <Controller
                name="address"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field className="grid gap-2">
                    <Label htmlFor="edit-address">Address</Label>
                    <Textarea
                      id="edit-address"
                      disabled={updateMutation.isPending}
                      rows={3}
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
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Updating...' : 'Update Farmer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
