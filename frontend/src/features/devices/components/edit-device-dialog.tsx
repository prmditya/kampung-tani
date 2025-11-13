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
import { Switch } from '@/components/ui/switch';
import { Pencil, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useUpdateGateway } from '@/hooks/use-gateways';
import type {
  GatewayResponse,
  GatewayUpdate,
  GatewayStatus,
} from '@/types/api';
import { Field, FieldError, FieldGroup } from '@/components/ui/field';
import { toast } from 'sonner';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updateGatewaySchema } from '@/features/devices/schemas';

interface EditDeviceDialogProps {
  device: GatewayResponse;
}

export function EditDeviceDialog({ device }: EditDeviceDialogProps) {
  const [open, setOpen] = useState(false);
  const updateMutation = useUpdateGateway();

  // Track the original device status when dialog opens
  const [originalStatus, setOriginalStatus] = useState(device.status);

  const form = useForm<z.infer<typeof updateGatewaySchema>>({
    resolver: zodResolver(updateGatewaySchema),
    defaultValues: {
      id: device.id,
      name: device.name || '',
      mac_address: device.mac_address || '',
      description: device.description || '',
      status: device.status,
    },
  });

  // Reset form when dialog opens with fresh device data
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      // Store original status
      setOriginalStatus(device.status);
      form.reset({
        id: device.id,
        name: device.name || '',
        mac_address: device.mac_address || '',
        description: device.description || '',
        status: device.status,
      });
    }
  };

  const handleSubmit = (data: z.infer<typeof updateGatewaySchema>) => {
    updateMutation.mutate(
      {
        id: device.id,
        data: {
          name: data.name,
          mac_address: data.mac_address,
          description: data.description,
          status: data.status as GatewayStatus,
        },
      },
      {
        onSuccess: () => {
          toast.success('Device updated successfully');
          handleOpenChange(false);
        },
        onError: (error) => {
          toast.error(
            error?.message || 'Failed to update device. Please try again.',
          );
        },
      },
    );
  };

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => handleOpenChange(true)}>
        <Pencil className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <DialogHeader>
              <DialogTitle>Edit Device</DialogTitle>
              <DialogDescription>
                Update gateway device information
              </DialogDescription>
            </DialogHeader>
            <FieldGroup className="grid gap-4 py-4">
              <Field className="grid gap-2">
                <Label htmlFor="edit-gateway_uid">Gateway UID</Label>
                <Input
                  id="edit-gateway_uid"
                  value={device.gateway_uid}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Gateway UID cannot be changed
                </p>
              </Field>

              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field className="grid gap-2">
                    <Label htmlFor="edit-name">Device Name</Label>
                    <Input
                      id="edit-name"
                      placeholder="Main Farm Gateway"
                      disabled={updateMutation.isPending}
                      {...field}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              <Controller
                name="mac_address"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field className="grid gap-2">
                    <Label htmlFor="edit-mac_address">MAC Address</Label>
                    <Input
                      id="edit-mac_address"
                      placeholder="00:1B:44:11:3A:B7"
                      disabled={updateMutation.isPending}
                      {...field}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              <Field className="grid gap-2">
                <Label>Current Status (Auto-detected)</Label>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      device.status === 'online'
                        ? 'default'
                        : device.status === 'offline'
                          ? 'secondary'
                          : 'outline'
                    }
                  >
                    {device.status === 'online'
                      ? 'Online'
                      : device.status === 'offline'
                        ? 'Offline'
                        : 'Maintenance'}
                  </Badge>
                  {device.status !== 'maintenance' && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      Online/Offline status is automatically detected
                    </p>
                  )}
                </div>
              </Field>

              <Controller
                name="status"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="edit-maintenance">Maintenance Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Device will not store data when in maintenance mode
                      </p>
                    </div>
                    <Switch
                      id="edit-maintenance"
                      checked={field.value === 'maintenance'}
                      className="!w-[32.5px]"
                      onCheckedChange={(checked) => {
                        // Toggle: ON = maintenance, OFF = return to original status (offline if was in maintenance)
                        field.onChange(
                          checked
                            ? 'maintenance'
                            : originalStatus === 'maintenance'
                              ? 'offline'
                              : originalStatus,
                        );
                      }}
                      disabled={updateMutation.isPending}
                    />
                  </Field>
                )}
              />

              <Controller
                name="description"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field className="grid gap-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      placeholder="Gateway device for monitoring farm sensors"
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
                onClick={() => handleOpenChange(false)}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Updating...' : 'Update Device'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
