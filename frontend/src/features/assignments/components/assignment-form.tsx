'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useCreateAssignment } from '@/features/assignments/hooks/use-assignment';
import type {
  GatewayResponse,
  FarmResponse,
  GatewayAssignmentCreate,
} from '@/types/api';

interface AssignmentFormProps {
  gateways: GatewayResponse[];
  farms: FarmResponse[];
}

export function AssignmentForm({ gateways, farms }: AssignmentFormProps) {
  const [selectedGateway, setSelectedGateway] = useState<string>('');
  const [selectedFarm, setSelectedFarm] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const createMutation = useCreateAssignment();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedGateway || !selectedFarm) {
      return;
    }

    // Convert date to ISO datetime format
    const formatDateTime = (date: Date | undefined) => {
      if (!date) return null;
      return date.toISOString();
    };

    const data: GatewayAssignmentCreate = {
      gateway_id: parseInt(selectedGateway),
      farm_id: parseInt(selectedFarm),
      start_date: formatDateTime(startDate),
      end_date: formatDateTime(endDate),
    };

    console.log(data);

    createMutation.mutate(data, {
      onSuccess: () => {
        // Reset form
        setSelectedGateway('');
        setSelectedFarm('');
        setStartDate(undefined);
        setEndDate(undefined);
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Assignment</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="gateway">
                Gateway<span className="text-red-500 ml-[-5px]">*</span>
              </Label>
              <Select
                value={selectedGateway}
                onValueChange={setSelectedGateway}
                disabled={createMutation.isPending}
              >
                <SelectTrigger id="gateway">
                  <SelectValue placeholder="Select a gateway" />
                </SelectTrigger>
                <SelectContent>
                  {gateways.map((gateway) => (
                    <SelectItem key={gateway.id} value={gateway.id.toString()}>
                      {gateway.name || gateway.gateway_uid} (
                      {gateway.gateway_uid})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="farm">
                Farm<span className="text-red-500 ml-[-5px]">*</span>
              </Label>
              <Select
                value={selectedFarm}
                onValueChange={setSelectedFarm}
                disabled={createMutation.isPending}
              >
                <SelectTrigger id="farm">
                  <SelectValue placeholder="Select a farm" />
                </SelectTrigger>
                <SelectContent>
                  {farms.map((farm) => (
                    <SelectItem key={farm.id} value={farm.id.toString()}>
                      {farm.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Start Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !startDate && 'text-muted-foreground',
                    )}
                    disabled={createMutation.isPending}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label>End Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !endDate && 'text-muted-foreground',
                    )}
                    disabled={createMutation.isPending}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) => (startDate ? date < startDate : false)}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {createMutation.isError && (
            <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
              {createMutation.error?.message || 'Failed to create assignment'}
            </div>
          )}

          <div className="mt-6">
            <Button
              type="submit"
              disabled={
                !selectedGateway || !selectedFarm || createMutation.isPending
              }
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              {createMutation.isPending ? 'Creating...' : 'Create Assignment'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
