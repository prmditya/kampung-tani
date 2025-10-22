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
  DialogTrigger,
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
import { Plus } from "lucide-react";
import { useCreateGateway } from "@/hooks/use-gateways";
import { GatewayStatus } from "@/types/api";
import type { GatewayCreate } from "@/types/api";

export function AddDeviceDialog() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<GatewayStatus>(GatewayStatus.ONLINE);
  const createMutation = useCreateGateway();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data: GatewayCreate = {
      gateway_uid: formData.get("gateway_uid") as string,
      name: (formData.get("name") as string) || null,
      mac_address: (formData.get("mac_address") as string) || null,
      description: (formData.get("description") as string) || null,
      status: status,
    };

    createMutation.mutate(data, {
      onSuccess: () => {
        setOpen(false);
        e.currentTarget.reset();
        setStatus(GatewayStatus.ONLINE);
      },
    });
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
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Device</DialogTitle>
            <DialogDescription>
              Register a new IoT gateway device to the system
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="gateway_uid">Gateway UID *</Label>
              <Input
                id="gateway_uid"
                name="gateway_uid"
                placeholder="GW001"
                required
                disabled={createMutation.isPending}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Device Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Main Farm Gateway"
                disabled={createMutation.isPending}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="mac_address">MAC Address</Label>
              <Input
                id="mac_address"
                name="mac_address"
                placeholder="00:1B:44:11:3A:B7"
                disabled={createMutation.isPending}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as GatewayStatus)}>
                <SelectTrigger disabled={createMutation.isPending}>
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
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Gateway device for monitoring farm sensors"
                disabled={createMutation.isPending}
                rows={3}
              />
            </div>

            {createMutation.isError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                {createMutation.error?.message || "Failed to create device"}
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
              {createMutation.isPending ? "Adding..." : "Add Device"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
