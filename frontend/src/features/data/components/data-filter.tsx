import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Download,
  Filter,
  RefreshCw,
  CalendarIcon,
  RotateCw,
} from 'lucide-react';
import { format } from 'date-fns';
import type { GatewayResponse, SensorResponse } from '@/types/api';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

interface DataFilterProps {
  gateways: GatewayResponse[];
  sensors: SensorResponse[];
  selectedGateway: string;
  selectedSensor: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  onGatewayChange: (value: string) => void;
  onSensorChange: (value: string) => void;
  onDateFromChange: (date: Date | undefined) => void;
  onDateToChange: (date: Date | undefined) => void;
  onReset: () => void;
  onRefresh: () => void;
  onExport: () => void;
  isRefreshing?: boolean;
}

export function DataFilter({
  gateways,
  sensors,
  selectedGateway,
  selectedSensor,
  dateFrom,
  dateTo,
  onGatewayChange,
  onSensorChange,
  onDateFromChange,
  onDateToChange,
  onReset,
  onRefresh,
  onExport,
  isRefreshing = false,
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
            <Label htmlFor="gateway-filter">Gateway</Label>
            <Select value={selectedGateway} onValueChange={onGatewayChange}>
              <SelectTrigger id="gateway-filter">
                <SelectValue placeholder="Select Gateway" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Gateways</SelectItem>
                {gateways.map((gateway) => (
                  <SelectItem key={gateway.id} value={gateway.id.toString()}>
                    {gateway.name || gateway.gateway_uid}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="sensor-filter">Sensor</Label>
            <Select
              value={selectedSensor}
              onValueChange={onSensorChange}
              disabled={selectedGateway === 'all'}
            >
              <SelectTrigger id="sensor-filter">
                <SelectValue placeholder="Select Sensor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sensors</SelectItem>
                {sensors.map((sensor) => (
                  <SelectItem key={sensor.id} value={sensor.id.toString()}>
                    {sensor.name || sensor.sensor_uid} ({sensor.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Date From</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'justify-start text-left font-normal',
                    !dateFrom && 'text-muted-foreground',
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom ? format(dateFrom, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  captionLayout="dropdown"
                  onSelect={onDateFromChange}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-2">
            <Label>Date To</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'justify-start text-left font-normal',
                    !dateTo && 'text-muted-foreground',
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTo ? format(dateTo, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  captionLayout="dropdown"
                  onSelect={onDateToChange}
                  disabled={(date) => (dateFrom ? date < dateFrom : false)}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <Button
            onClick={onRefresh}
            variant="outline"
            className="flex-1"
            disabled={isRefreshing}
          >
            <RotateCw
              className={cn('mr-2 h-4 w-4', isRefreshing && 'animate-spin')}
            />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button onClick={onReset} variant="outline" className="flex-1">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset Filters
          </Button>
          <Button onClick={onExport} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
