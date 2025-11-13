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
import { useDataFilter } from '@/features/data/hooks/use-data-filter';
import type { GatewayResponse, SensorResponse } from '@/types/api';
import { cn } from '@/lib/utils';

interface DataFilterProps {
  gateways: GatewayResponse[];
  sensors: SensorResponse[];
  // Controlled state props (optional - for controlled usage)
  selectedGateway?: string;
  selectedSensor?: string;
  dateFrom?: Date | undefined;
  dateTo?: Date | undefined;
  isRefreshing?: boolean;
  // Handlers (optional - for controlled usage)
  onGatewayChange?: (value: string) => void;
  onSensorChange?: (value: string) => void;
  onDateFromChange?: (date: Date | undefined) => void;
  onDateToChange?: (date: Date | undefined) => void;
  onReset?: () => void;
  onRefresh?: () => void;
  onExport?: () => void;
  // Initial values (optional - for uncontrolled usage)
  initialGateway?: string;
  initialSensor?: string;
  initialDateFrom?: Date | undefined;
  initialDateTo?: Date | undefined;
}

export function DataFilter({
  gateways,
  sensors,
  selectedGateway,
  selectedSensor,
  dateFrom,
  dateTo,
  isRefreshing,
  onGatewayChange,
  onSensorChange,
  onDateFromChange,
  onDateToChange,
  onReset,
  onRefresh,
  onExport,
  initialGateway,
  initialSensor,
  initialDateFrom,
  initialDateTo,
}: DataFilterProps) {
  const state = useDataFilter(
    {
      gateways,
      sensors,
      selectedGateway,
      selectedSensor,
      dateFrom,
      dateTo,
      isRefreshing,
      onGatewayChange,
      onSensorChange,
      onDateFromChange,
      onDateToChange,
      initialGateway,
      initialSensor,
      initialDateFrom,
      initialDateTo,
    },
    { onReset, onRefresh, onExport },
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filter Data
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid space-x-2 md:grid-cols-4">
          <div className="grid gap-2">
            <Label htmlFor="gateway-filter">Gateway</Label>
            <Select
              value={state.selectedGateway}
              onValueChange={state.onGatewayChange}
            >
              <SelectTrigger id="gateway-filter" className="w-full">
                <SelectValue placeholder="Select Gateway" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Select Gateway</SelectItem>
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
              value={state.selectedSensor}
              onValueChange={state.onSensorChange}
              disabled={state.selectedGateway === 'none'}
            >
              <SelectTrigger id="sensor-filter" className="w-full truncate">
                <SelectValue placeholder="Select Sensor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Select Sensor</SelectItem>
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
                    'justify-start text-left font-normal truncate',
                    !state.dateFrom && 'text-muted-foreground',
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {state.dateFrom
                    ? format(state.dateFrom, 'PPP')
                    : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={state.dateFrom}
                  captionLayout="dropdown"
                  onSelect={state.onDateFromChange}
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
                    'justify-start text-left font-normal truncate',
                    !state.dateTo && 'text-muted-foreground',
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {state.dateTo ? format(state.dateTo, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={state.dateTo}
                  captionLayout="dropdown"
                  onSelect={state.onDateToChange}
                  disabled={(date) =>
                    state.dateFrom ? date < state.dateFrom : false
                  }
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="mt-4 grid md:flex gap-2 md:gap-3">
          <Button
            onClick={state.onRefresh}
            variant="default"
            className="flex-1"
            disabled={state.isRefreshing}
          >
            <RotateCw
              className={cn(
                'mr-2 h-4 w-4',
                state.isRefreshing && 'animate-spin',
              )}
            />
            {state.isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button onClick={state.onReset} variant="outline" className="flex-1">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset Filters
          </Button>
          <Button onClick={state.onExport} variant="secondary">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
