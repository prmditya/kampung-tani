"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil } from "lucide-react";
import { useUpdateGateway } from "@/hooks/use-gateways";
import type { GatewayResponse, GatewayUpdate, GatewayStatus } from "@/types/api";

interface EditDeviceDialogProps {
  device: GatewayResponse;
}

export function EditDeviceDialog({ device }: EditDeviceDialogProps) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<GatewayStatus>(device.status);
  const updateMutation = useUpdateGateway();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data: GatewayUpdate = {
      name: (formData.get("name") as string) || null,
      mac_address: (formData.get("mac_address") as string) || null,
      description: (formData.get("description") as string) || null,
      status: status,
    };

    updateMutation.mutate(
      { id: device.id, data },
      {
        onSuccess: () => {
          setOpen(false);
        },
      }
    );
  };

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
        <Pencil className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Device</DialogTitle>
              <DialogDescription>
                Update gateway device information
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
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
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Device Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  defaultValue={device.name || ""}
                  placeholder="Main Farm Gateway"
                  disabled={updateMutation.isPending}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-mac_address">MAC Address</Label>
                <Input
                  id="edit-mac_address"
                  name="mac_address"
                  defaultValue={device.mac_address || ""}
                  placeholder="00:1B:44:11:3A:B7"
                  disabled={updateMutation.isPending}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status *</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as GatewayStatus)}>
                  <SelectTrigger disabled={updateMutation.isPending}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  defaultValue={device.description || ""}
                  placeholder="Gateway device for monitoring farm sensors"
                  disabled={updateMutation.isPending}
                  rows={3}
                />
              </div>

              {updateMutation.isError && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                  {updateMutation.error?.message || "Failed to update device"}
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
                {updateMutation.isPending ? "Updating..." : "Update Device"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
