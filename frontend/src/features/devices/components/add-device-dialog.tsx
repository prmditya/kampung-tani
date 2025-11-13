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
import { Plus, Info } from 'lucide-react';
import { useCreateGateway } from '@/hooks/use-gateways';
import type { GatewayCreate } from '@/types/api';
import { Field, FieldError, FieldGroup } from '@/components/ui/field';
import { toast } from 'sonner';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { addGatewaySchema } from '@/features/devices/schemas';

export function AddDeviceDialog() {
  const [open, setOpen] = useState(false);
  const createMutation = useCreateGateway();

  const form = useForm<z.infer<typeof addGatewaySchema>>({
    resolver: zodResolver(addGatewaySchema),
    defaultValues: {
      gateway_uid: '',
      name: '',
      mac_address: '',
      description: '',
    },
  });

  const handleSubmit = (data: z.infer<typeof addGatewaySchema>) => {
    createMutation.mutate(
      {
        gateway_uid: data.gateway_uid,
        name: data.name,
        mac_address: data.mac_address,
        description: data.description,
        // Status will be set to 'offline' by default in backend
      } as GatewayCreate,
      {
        onSuccess: () => {
          toast.success('Device added successfully');
          form.reset();
          setOpen(false);
        },
        onError: (error) => {
          toast.error(
            error?.message || 'Failed to add device. Please try again.',
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
          Add Device
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <DialogHeader>
            <DialogTitle>Add New Device</DialogTitle>
            <DialogDescription>
              Register a new IoT gateway device to the system
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="grid gap-4 py-4">
            <Controller
              name="gateway_uid"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field className="grid gap-2">
                  <Label>
                    Gateway UID <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="gateway_uid"
                    placeholder="GTW-UID"
                    required
                    disabled={createMutation.isPending}
                    {...field}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              name="name"
              control={form.control}
              render={({ field }) => (
                <Field className="grid gap-2">
                  <Label htmlFor="name">Device Name</Label>
                  <Input
                    id="name"
                    placeholder="Main Farm Gateway"
                    disabled={createMutation.isPending}
                    {...field}
                  />
                </Field>
              )}
            />
            <Controller
              name="mac_address"
              control={form.control}
              render={({ field }) => (
                <Field className="grid gap-2">
                  <Label htmlFor="mac_address">MAC Address</Label>
                  <Input
                    id="mac_address"
                    placeholder="00:1B:44:11:3A:B7"
                    disabled={createMutation.isPending}
                    {...field}
                  />
                </Field>
              )}
            />
            <Field className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 mt-0.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Auto-detected Status
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    The device will start as offline and will automatically be
                    marked as online when it sends data. You can set it to
                    maintenance mode after creation if needed.
                  </p>
                </div>
              </div>
            </Field>
            <Controller
              name="description"
              control={form.control}
              render={({ field }) => (
                <Field className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Gateway device for monitoring farm sensors"
                    disabled={createMutation.isPending}
                    rows={3}
                    {...field}
                  />
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
              {createMutation.isPending ? 'Adding...' : 'Add Device'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
