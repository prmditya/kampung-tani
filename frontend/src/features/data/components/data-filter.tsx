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
import { Input } from "@/components/ui/input";
import { Download, Filter } from "lucide-react";
import type { Device, Farmer } from "@/lib/types";

interface DataFilterProps {
  devices: Device[];
  farmers: Farmer[];
  selectedDevice: string;
  selectedFarmer: string;
  dateFrom: string;
  dateTo: string;
  onDeviceChange: (value: string) => void;
  onFarmerChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
}

export function DataFilter({
  devices,
  farmers,
  selectedDevice,
  selectedFarmer,
  dateFrom,
  dateTo,
  onDeviceChange,
  onFarmerChange,
  onDateFromChange,
  onDateToChange,
}: DataFilterProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filter Data
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="grid gap-2">
            <Label htmlFor="device-filter">Device</Label>
            <Select value={selectedDevice} onValueChange={onDeviceChange}>
              <SelectTrigger id="device-filter">
                <SelectValue placeholder="All Devices" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Devices</SelectItem>
                {devices.map((device) => (
                  <SelectItem key={device.id} value={device.id}>
                    {device.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="farmer-filter">Farmer</Label>
            <Select value={selectedFarmer} onValueChange={onFarmerChange}>
              <SelectTrigger id="farmer-filter">
                <SelectValue placeholder="All Farmers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Farmers</SelectItem>
                {farmers.map((farmer) => (
                  <SelectItem key={farmer.id} value={farmer.id}>
                    {farmer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="date-from">Date From</Label>
            <Input
              id="date-from"
              type="date"
              value={dateFrom}
              onChange={(e) => onDateFromChange(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="date-to">Date To</Label>
            <Input
              id="date-to"
              type="date"
              value={dateTo}
              onChange={(e) => onDateToChange(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <Button className="flex-1">Apply Filters</Button>
          <Button variant="outline" className="flex-1">
            Reset
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
