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
  // For URL-controlled mode
  externalOpen?: boolean;
  onExternalOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
}

export function EditFarmerDialog({
  farmer,
  externalOpen,
  onExternalOpenChange,
  hideTrigger = false,
}: EditFarmerDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const updateMutation = useUpdateFarmer();

  // Use external state if provided, otherwise use internal state
  const isControlled = externalOpen !== undefined;
  const open = isControlled ? externalOpen : internalOpen;
  const setOpen = isControlled ? onExternalOpenChange! : setInternalOpen;

  // Helper to strip +62 prefix from existing contact
  const stripPhonePrefix = (phone: string | null | undefined): string => {
    if (!phone) return '';
    if (phone.startsWith('+62')) return phone.slice(3);
    if (phone.startsWith('62')) return phone.slice(2);
    return phone;
  };

  const form = useForm<z.infer<typeof updateFarmerSchema>>({
    resolver: zodResolver(updateFarmerSchema),
    defaultValues: {
      id: farmer.id,
      name: farmer.name,
      contact: stripPhonePrefix(farmer.contact),
      address: farmer.address || '',
    },
  });

  const handleSubmit = (data: z.infer<typeof updateFarmerSchema>) => {
    // Add +62 prefix to phone number if provided
    const formattedContact = data.contact ? `+62${data.contact}` : null;

    updateMutation.mutate(
      {
        id: farmer.id,
        data: {
          name: data.name,
          contact: formattedContact,
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
      {!hideTrigger && (
        <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
          <Pencil className="h-4 w-4" />
        </Button>
      )}

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
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                        +62
                      </span>
                      <Input
                        id="edit-contact"
                        type="tel"
                        inputMode="numeric"
                        placeholder="8123456789"
                        className="rounded-l-none"
                        disabled={updateMutation.isPending}
                        {...field}
                        onChange={(e) => {
                          // Only allow digits
                          const value = e.target.value.replace(/\D/g, '');
                          field.onChange(value);
                        }}
                      />
                    </div>
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
