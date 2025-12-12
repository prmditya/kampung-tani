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
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { useCreateFarmer } from '@/features/farmers/hooks/use-farmers';
import type { FarmerCreate } from '@/types/api';
import { Field, FieldError, FieldGroup } from '@/components/ui/field';
import { toast } from 'sonner';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { addFarmerSchema } from '@/features/farmers/schemas';

export function AddFarmerDialog() {
  const [open, setOpen] = useState(false);
  const createMutation = useCreateFarmer();

  const form = useForm<z.infer<typeof addFarmerSchema>>({
    resolver: zodResolver(addFarmerSchema),
    defaultValues: {
      name: '',
      contact: '',
      address: '',
    },
  });

  const handleSubmit = (data: z.infer<typeof addFarmerSchema>) => {
    // Add +62 prefix to phone number if provided
    const formattedContact = data.contact ? `+62${data.contact}` : null;

    createMutation.mutate(
      {
        name: data.name,
        contact: formattedContact,
        address: data.address || null,
      } as FarmerCreate,
      {
        onSuccess: () => {
          toast.success('Farmer added successfully');
          form.reset();
          setOpen(false);
        },
        onError: (error) => {
          toast.error(
            error?.message || 'Failed to add farmer. Please try again.',
          );
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Farmer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <DialogHeader>
            <DialogTitle>Add New Farmer</DialogTitle>
            <DialogDescription>
              Register a new farmer to the system
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="grid gap-4 py-4">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field className="grid gap-2">
                  <Label htmlFor="name">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    disabled={createMutation.isPending}
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
                  <Label htmlFor="contact">Phone Number</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                      +62
                    </span>
                    <Input
                      id="contact"
                      type="tel"
                      inputMode="numeric"
                      placeholder="8123456789"
                      className="rounded-l-none"
                      disabled={createMutation.isPending}
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
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    placeholder="Bandung, West Java"
                    disabled={createMutation.isPending}
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
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Adding...' : 'Add Farmer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
