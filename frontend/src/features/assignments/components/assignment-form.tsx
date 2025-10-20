import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Unplug, Link2Off } from "lucide-react";
import type { Device, Farmer, Farm } from "@/lib/types";

interface AssignmentFormProps {
  unassignedDevices: Device[];
  farmers: Farmer[];
  farms: Farm[];
  selectedDevice: string;
  selectedFarmer: string;
  selectedFarm: string;
  onDeviceChange: (value: string) => void;
  onFarmerChange: (value: string) => void;
  onFarmChange: (value: string) => void;
}

export function AssignmentForm({
  unassignedDevices,
  farmers,
  farms,
  selectedDevice,
  selectedFarmer,
  selectedFarm,
  onDeviceChange,
  onFarmerChange,
  onFarmChange,
}: AssignmentFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Assignment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="grid gap-2">
            <Label htmlFor="device">Select Device</Label>
            <Select value={selectedDevice} onValueChange={onDeviceChange}>
              <SelectTrigger id="device">
                <SelectValue placeholder="Choose a device" />
              </SelectTrigger>
              <SelectContent>
                {unassignedDevices.map((device) => (
                  <SelectItem key={device.id} value={device.id}>
                    {device.name} ({device.id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="farmer">Select Farmer</Label>
            <Select value={selectedFarmer} onValueChange={onFarmerChange}>
              <SelectTrigger id="farmer">
                <SelectValue placeholder="Choose a farmer" />
              </SelectTrigger>
              <SelectContent>
                {farmers.map((farmer) => (
                  <SelectItem key={farmer.id} value={farmer.id}>
                    {farmer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="farm">Select Farm</Label>
            <Select value={selectedFarm} onValueChange={onFarmChange}>
              <SelectTrigger id="farm">
                <SelectValue placeholder="Choose a farm" />
              </SelectTrigger>
              <SelectContent>
                {farms.map((farm) => (
                  <SelectItem key={farm.id} value={farm.id}>
                    {farm.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-6 grid md:grid-cols-2 gap-3">
          <Button className="flex-1">
            <Unplug className="mr-2 h-4 w-4" />
            Assign Device
          </Button>
          <Button variant="outline" className="flex-1">
            <Link2Off className="mr-2 h-4 w-4" />
            Unassign Selected
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
