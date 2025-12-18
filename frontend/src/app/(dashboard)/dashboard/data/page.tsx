'use client';

import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataChart, ReadingsTable } from '@/features/data';
import { useGateways } from '@/hooks/use-gateways';
import {
  useSensorsByGateway,
  useSensorData,
} from '@/features/data/hooks/use-sensors';
import { useFarmers } from '@/features/farmers/hooks/use-farmers';
import { parseUTCTimestamp, formatTimeToWIB } from '@/lib/date-utils';
import { useFarms } from '@/features/farmers/hooks/use-farms';
import useAssignments from '@/features/assignments/hooks/use-assignment';
import { useGetUsers } from '@/features/settings/hooks/use-users';
import { useCurrentUser, isSuperAdmin } from '@/features/auth/hooks/use-auth';
import type { SensorDataResponse } from '@/types/api';
import {
  Loader2,
  Search,
  Filter,
  RefreshCw,
  Download,
  Clock,
  Calendar as CalendarIcon,
  RotateCw,
  X,
  Check,
  ChevronsUpDown,
} from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export default function DataPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Read initial values from URL params
  const initialGateway = searchParams.get('gateway') || 'none';
  const initialSensor = searchParams.get('sensor') || 'none';
  const initialFarmer = searchParams.get('farmer') || 'all';
  const initialFarm = searchParams.get('farm') || 'all';
  const initialAssignedBy = searchParams.get('assignedBy') || 'all';
  const initialHours = parseInt(searchParams.get('hours') || '12');
  const initialTimeMode =
    (searchParams.get('timeMode') as 'quick' | 'custom') || 'quick';
  const initialDateFrom = searchParams.get('dateFrom')
    ? new Date(searchParams.get('dateFrom')!)
    : undefined;
  const initialDateTo = searchParams.get('dateTo')
    ? new Date(searchParams.get('dateTo')!)
    : undefined;

  const [selectedGateway, setSelectedGateway] =
    useState<string>(initialGateway);
  const [selectedSensor, setSelectedSensor] = useState<string>(initialSensor);
  const [selectedFarmer, setSelectedFarmer] = useState<string>(initialFarmer);
  const [selectedFarm, setSelectedFarm] = useState<string>(initialFarm);
  const [selectedAssignedBy, setSelectedAssignedBy] =
    useState<string>(initialAssignedBy);
  const [dateFrom, setDateFrom] = useState<Date | undefined>(initialDateFrom);
  const [dateTo, setDateTo] = useState<Date | undefined>(initialDateTo);
  const [hours, setHours] = useState(initialHours);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedMeasurementTypes, setSelectedMeasurementTypes] = useState<
    string[]
  >([]);
  const [tableSearch, setTableSearch] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [timeMode, setTimeMode] = useState<'quick' | 'custom'>(initialTimeMode); // Time selection mode

  // Combobox open state
  const [gatewayComboboxOpen, setGatewayComboboxOpen] = useState(false);
  const [sensorComboboxOpen, setSensorComboboxOpen] = useState(false);
  const [farmerComboboxOpen, setFarmerComboboxOpen] = useState(false);
  const [farmComboboxOpen, setFarmComboboxOpen] = useState(false);
  const [assignedByComboboxOpen, setAssignedByComboboxOpen] = useState(false);

  // Sync filter state to URL params
  const updateUrlParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (
          value === null ||
          value === '' ||
          value === 'none' ||
          value === 'all'
        ) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      const newUrl = params.toString()
        ? `${pathname}?${params.toString()}`
        : pathname;
      router.replace(newUrl, { scroll: false });

      // Immediately save to localStorage
      localStorage.setItem('dataPageLastUrl', newUrl);
    },
    [pathname, router, searchParams],
  );

  // Save URL to localStorage on every searchParams change
  // Only save if searchParams is not empty (to avoid overwriting saved URL on page load)
  useEffect(() => {
    const searchParamsStr = searchParams.toString();
    if (searchParamsStr && pathname === '/dashboard/data') {
      const currentUrl = `${pathname}?${searchParamsStr}`;
      localStorage.setItem('dataPageLastUrl', currentUrl);
    }
  }, [pathname, searchParams]);

  // Fetch gateways
  const { data: gatewaysData, isLoading: isLoadingGateways } = useGateways();

  // Parse selected gateway ID
  const gatewayId = selectedGateway !== 'all' ? parseInt(selectedGateway) : 0;

  // Fetch sensors for selected gateway
  const { data: sensorsData, isLoading: isLoadingSensors } =
    useSensorsByGateway(gatewayId, { size: 20 });

  // Fetch farmers, farms, and gateway assignments data
  const { data: farmersData } = useFarmers({ size: 100 });
  const { data: farmsData } = useFarms({ size: 100 });
  const { data: assignmentsData } = useAssignments({ size: 100 });

  // Get current user and check if super admin
  const { data: currentUser } = useCurrentUser();
  const isUserSuperAdmin = isSuperAdmin(currentUser);

  // Parse selected sensor ID
  const sensorId = selectedSensor !== 'all' ? parseInt(selectedSensor) : 0;

  // Prepare start_date and end_date for API based on time mode
  const { startDate, endDate, calculatedHours } = useMemo(() => {
    const now = new Date();

    if (timeMode === 'quick') {
      // Quick Select: from (now - hours) to now
      const hoursValue = hours || 24;
      const startTime = new Date(now.getTime() - hoursValue * 60 * 60 * 1000);
      return {
        startDate: startTime.toISOString(),
        endDate: now.toISOString(),
        calculatedHours: hoursValue,
      };
    }

    // Custom Range mode
    if (dateFrom) {
      // Set start to beginning of the selected day (00:00:00)
      const startOfDay = new Date(dateFrom);
      startOfDay.setHours(0, 0, 0, 0);

      // If dateTo is specified, set end to beginning of that day (00:00:00)
      // If not specified, use current time
      let endTime: Date;
      if (dateTo) {
        endTime = new Date(dateTo);
        endTime.setHours(0, 0, 0, 0);
      } else {
        endTime = now;
      }

      // Calculate hours for chart display
      const diffHours =
        (endTime.getTime() - startOfDay.getTime()) / (1000 * 60 * 60);

      return {
        startDate: startOfDay.toISOString(),
        endDate: endTime.toISOString(),
        calculatedHours: diffHours > 0 ? diffHours : 24,
      };
    }

    // Default: last 24 hours
    const startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    return {
      startDate: startTime.toISOString(),
      endDate: now.toISOString(),
      calculatedHours: 24,
    };
  }, [timeMode, hours, dateFrom, dateTo]);

  // Parse farmer_id, farm_id, and assigned_by_id for API
  const farmerId =
    selectedFarmer !== 'all' ? parseInt(selectedFarmer) : undefined;
  const farmId = selectedFarm !== 'all' ? parseInt(selectedFarm) : undefined;
  // For regular admin, always filter by their own user ID
  const assignedById = useMemo(() => {
    if (!isUserSuperAdmin && currentUser?.id) {
      return currentUser.id; // Regular admin only sees their own assigned data
    }
    return selectedAssignedBy !== 'all'
      ? parseInt(selectedAssignedBy)
      : undefined;
  }, [isUserSuperAdmin, currentUser?.id, selectedAssignedBy]);

  // Get all users for Assigned By dropdown
  const { data: usersData } = useGetUsers();
  const assignedByUsers = useMemo(() => {
    if (!usersData) return [];
    return usersData.map((user) => ({
      id: user.id,
      username: user.username,
    }));
  }, [usersData]);

  // Fetch sensor data for table (paginated) with all filters
  const {
    data: sensorDataResponse,
    isLoading: isLoadingData,
    isFetching: isFetchingTable,
    refetch: refetchTable,
  } = useSensorData(sensorId, {
    page,
    size: pageSize,
    hours: calculatedHours,
    start_date: startDate,
    end_date: endDate,
    search: tableSearch || undefined,
    farmer_id: farmerId,
    farm_id: farmId,
    assigned_by_id: assignedById,
  });

  // Fetch sensor data for chart (non-paginated, using same filters as table but larger size)
  const {
    data: chartDataResponse,
    isLoading: isLoadingChartData,
    isFetching: isFetchingChart,
    refetch: refetchChart,
  } = useSensorData(sensorId, {
    page: 1,
    size: 1000, // Get more data for chart visualization
    hours: calculatedHours,
    start_date: startDate,
    end_date: endDate,
    search: tableSearch || undefined,
    farmer_id: farmerId,
    farm_id: farmId,
    assigned_by_id: assignedById,
  });

  // Process sensor data for table display
  const sensorReadings: SensorDataResponse[] = useMemo(() => {
    return sensorDataResponse?.items || [];
  }, [sensorDataResponse]);

  // Process sensor data for chart display
  const chartSensorReadings: SensorDataResponse[] = useMemo(() => {
    return chartDataResponse?.items || [];
  }, [chartDataResponse]);

  // Get all available measurement types from chart readings
  const availableMeasurementTypes = useMemo(() => {
    const types = new Set<string>();
    chartSensorReadings.forEach((reading) => {
      const measurementType = reading.metadata?.measurement_type || 'Unknown';
      types.add(measurementType);
    });
    return Array.from(types).sort();
  }, [chartSensorReadings]);

  // Auto-select all measurement types on first load
  useMemo(() => {
    if (
      availableMeasurementTypes.length > 0 &&
      selectedMeasurementTypes.length === 0
    ) {
      setSelectedMeasurementTypes(availableMeasurementTypes);
    }
  }, [availableMeasurementTypes, selectedMeasurementTypes.length]);

  // No need for client-side filtering anymore - all filtering is done by API

  // Create unified chart data with proper gap filling
  // This generates a continuous timeline with null values where data is missing
  const unifiedChartData = useMemo(() => {
    if (!chartSensorReadings.length || !selectedMeasurementTypes.length)
      return [];

    // Collect all data points with timestamps, grouped by measurement type
    const rawDataByType: Record<string, Map<number, number>> = {};
    let minTimestamp = Infinity;
    let maxTimestamp = -Infinity;

    chartSensorReadings.forEach((reading) => {
      const type = reading.metadata?.measurement_type || 'Unknown';
      if (!selectedMeasurementTypes.includes(type)) return;

      // Parse timestamp as UTC
      const date = parseUTCTimestamp(reading.timestamp);

      // Round down to nearest 10-second interval for consistency
      const seconds = date.getSeconds();
      const roundedSeconds = Math.floor(seconds / 10) * 10;
      date.setSeconds(roundedSeconds, 0);

      const timestamp = date.getTime();
      minTimestamp = Math.min(minTimestamp, timestamp);
      maxTimestamp = Math.max(maxTimestamp, timestamp);

      if (!rawDataByType[type]) rawDataByType[type] = new Map();
      rawDataByType[type].set(timestamp, reading.value);
    });

    if (minTimestamp === Infinity) return [];

    // Calculate a smart interval based on time range to avoid too many points
    const timeRangeMs = maxTimestamp - minTimestamp;
    const maxPoints = 1000; // Performance limit
    const minIntervalMs = Math.max(10000, Math.ceil(timeRangeMs / maxPoints)); // At least 10 seconds

    // Round interval to a nice value (10s, 30s, 1m, 5m, 15m, 30m, 1h)
    let intervalMs = 10000;
    const niceIntervals = [
      10000, 30000, 60000, 300000, 900000, 1800000, 3600000,
    ];
    for (const nice of niceIntervals) {
      if (nice >= minIntervalMs) {
        intervalMs = nice;
        break;
      }
    }
    // If even 1 hour isn't enough, just use the calculated interval
    if (minIntervalMs > 3600000) {
      intervalMs = minIntervalMs;
    }

    // Generate continuous timeline with gaps
    const result: Array<{
      time: string;
      [key: string]: string | number | null;
    }> = [];

    for (let ts = minTimestamp; ts <= maxTimestamp; ts += intervalMs) {
      const date = new Date(ts);
      const time = formatTimeToWIB(date);
      const point: { time: string; [key: string]: string | number | null } = {
        time,
      };

      // For each selected type, find closest data point within interval or set null
      selectedMeasurementTypes.forEach((type) => {
        const typeMap = rawDataByType[type];
        if (!typeMap) {
          point[type] = null;
          return;
        }

        // Look for data within this interval bucket
        let found = false;
        let sum = 0;
        let count = 0;
        for (let lookupTs = ts; lookupTs < ts + intervalMs; lookupTs += 10000) {
          if (typeMap.has(lookupTs)) {
            sum += typeMap.get(lookupTs)!;
            count++;
            found = true;
          }
        }

        if (found && count > 0) {
          point[type] = Math.round((sum / count) * 100) / 100; // Average if multiple points
        } else {
          point[type] = null; // Gap - Recharts will break the line here
        }
      });

      result.push(point);
    }

    return result;
  }, [chartSensorReadings, selectedMeasurementTypes]);

  // Extract units from readings for display
  const chartUnits = useMemo(() => {
    const units: Record<string, string> = {};
    chartSensorReadings.forEach((r) => {
      const type = r.metadata?.measurement_type || 'Unknown';
      if (r.unit) units[type] = r.unit;
    });
    return units;
  }, [chartSensorReadings]);

  const handleRefresh = async () => {
    await Promise.all([refetchTable(), refetchChart()]);
  };

  const handleTimeModeChange = (mode: 'quick' | 'custom') => {
    setTimeMode(mode);
    // Clear custom dates when switching to quick select
    if (mode === 'quick') {
      setDateFrom(undefined);
      setDateTo(undefined);
      updateUrlParams({ timeMode: mode, dateFrom: null, dateTo: null });
    } else {
      updateUrlParams({ timeMode: mode });
    }
  };

  // Reset page when filters change
  const handleGatewayChange = (value: string) => {
    setSelectedGateway(value);
    setSelectedSensor('none');
    setPage(1);
    updateUrlParams({ gateway: value, sensor: null });
  };

  const handleSensorChange = (value: string) => {
    setSelectedSensor(value);
    setPage(1);
    updateUrlParams({ sensor: value });
  };

  const handleDateFromChange = (date: Date | undefined) => {
    setDateFrom(date);
    setPage(1);
    updateUrlParams({ dateFrom: date ? date.toISOString() : null });
  };

  const handleDateToChange = (date: Date | undefined) => {
    setDateTo(date);
    setPage(1);
    updateUrlParams({ dateTo: date ? date.toISOString() : null });
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const searchValue = searchInputRef.current?.value || '';
    setTableSearch(searchValue);
    setPage(1);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchSubmit();
    }
  };

  const handleClearSearch = () => {
    setTableSearch('');
    if (searchInputRef.current) {
      searchInputRef.current.value = '';
    }
    setPage(1);
  };

  const handleFarmerChange = (value: string) => {
    setSelectedFarmer(value);
    setPage(1);
    updateUrlParams({ farmer: value });
  };

  const handleFarmChange = (value: string) => {
    setSelectedFarm(value);
    setPage(1);
    updateUrlParams({ farm: value });
  };

  const handleAssignedByChange = (value: string) => {
    setSelectedAssignedBy(value);
    setPage(1);
    updateUrlParams({ assignedBy: value });
  };

  const handleHoursChange = (value: number) => {
    setHours(value);
    setPage(1);
    updateUrlParams({ hours: value.toString() });
  };

  const handleReset = () => {
    setSelectedGateway('none');
    setSelectedSensor('none');
    setSelectedFarmer('all');
    setSelectedFarm('all');
    setSelectedAssignedBy('all');
    setDateFrom(undefined);
    setDateTo(undefined);
    setHours(12);
    setPage(1);
    setTableSearch('');
    if (searchInputRef.current) {
      searchInputRef.current.value = '';
    }
    setTimeMode('quick');
    // Clear all URL params and localStorage
    router.replace(pathname, { scroll: false });
    localStorage.removeItem('dataPageLastUrl');
  };

  const handleExport = () => {
    if (!sensorReadings.length) return;

    // Create CSV content
    const headers = [
      'Timestamp',
      'Sensor ID',
      'Gateway ID',
      'Measurement Type',
      'Value',
      'Unit',
      'Farmer',
      'Farm',
    ];
    const rows = sensorReadings.map((r) => {
      // Find assignment for this gateway
      const assignment = assignmentsData?.items.find(
        (a) => a.gateway_id === r.gateway_id && a.is_active,
      );
      const farm = assignment
        ? farmsData?.items.find((f) => f.id === assignment.farm_id)
        : null;
      const farmer = farm
        ? farmersData?.items.find((f) => f.id === farm.farmer_id)
        : null;

      return [
        r.timestamp,
        r.sensor_id,
        r.gateway_id,
        r.metadata?.measurement_type || 'Unknown',
        r.value,
        r.unit || '',
        farmer?.name || '',
        farm?.name || '',
      ];
    });

    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join(
      '\n',
    );

    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sensor-data-${new Date().toISOString()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const isLoading = isLoadingGateways || isLoadingSensors || isLoadingData;
  const isChartLoading = isLoadingChartData;
  const isRefreshing = isFetchingTable || isFetchingChart;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className={`grid gap-4 ${isUserSuperAdmin ? 'md:grid-cols-5' : 'md:grid-cols-4'}`}
          >
            {/* Gateway Selector */}
            <div className="space-y-2">
              <Label>Gateway</Label>
              <Popover
                open={gatewayComboboxOpen}
                onOpenChange={setGatewayComboboxOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={gatewayComboboxOpen}
                    className="w-full justify-between font-normal"
                  >
                    <span className="truncate">
                      {selectedGateway !== 'none'
                        ? gatewaysData?.items?.find(
                            (g) => g.id.toString() === selectedGateway,
                          )?.name ||
                          gatewaysData?.items?.find(
                            (g) => g.id.toString() === selectedGateway,
                          )?.gateway_uid ||
                          'Select Gateway'
                        : 'Select Gateway'}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Search gateway..." />
                    <CommandList>
                      <CommandEmpty>No gateway found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="none"
                          onSelect={() => {
                            handleGatewayChange('none');
                            setGatewayComboboxOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              selectedGateway === 'none'
                                ? 'opacity-100'
                                : 'opacity-0',
                            )}
                          />
                          Select Gateway
                        </CommandItem>
                        {(gatewaysData?.items || []).map((gateway) => (
                          <CommandItem
                            key={gateway.id}
                            value={gateway.name || gateway.gateway_uid}
                            onSelect={() => {
                              handleGatewayChange(gateway.id.toString());
                              setGatewayComboboxOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                selectedGateway === gateway.id.toString()
                                  ? 'opacity-100'
                                  : 'opacity-0',
                              )}
                            />
                            {gateway.name || gateway.gateway_uid}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Sensor Selector */}
            <div className="space-y-2">
              <Label>Sensor</Label>
              <Popover
                open={sensorComboboxOpen}
                onOpenChange={setSensorComboboxOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={sensorComboboxOpen}
                    className="w-full justify-between font-normal"
                    disabled={selectedGateway === 'none'}
                  >
                    <span className="truncate">
                      {selectedSensor !== 'none'
                        ? (() => {
                            const sensor = sensorsData?.items?.find(
                              (s) => s.id.toString() === selectedSensor,
                            );
                            return sensor
                              ? `${sensor.name || sensor.sensor_uid} (${sensor.type})`
                              : 'Select Sensor';
                          })()
                        : 'Select Sensor'}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Search sensor..." />
                    <CommandList>
                      <CommandEmpty>No sensor found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="none"
                          onSelect={() => {
                            handleSensorChange('none');
                            setSensorComboboxOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              selectedSensor === 'none'
                                ? 'opacity-100'
                                : 'opacity-0',
                            )}
                          />
                          Select Sensor
                        </CommandItem>
                        {(sensorsData?.items || []).map((sensor) => (
                          <CommandItem
                            key={sensor.id}
                            value={`${sensor.name || sensor.sensor_uid} ${sensor.type}`}
                            onSelect={() => {
                              handleSensorChange(sensor.id.toString());
                              setSensorComboboxOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                selectedSensor === sensor.id.toString()
                                  ? 'opacity-100'
                                  : 'opacity-0',
                              )}
                            />
                            {sensor.name || sensor.sensor_uid} ({sensor.type})
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Farmer Selector */}
            <div className="space-y-2">
              <Label>Farmer</Label>
              <Popover
                open={farmerComboboxOpen}
                onOpenChange={setFarmerComboboxOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={farmerComboboxOpen}
                    className="w-full justify-between font-normal"
                  >
                    <span className="truncate">
                      {selectedFarmer !== 'all'
                        ? farmersData?.items?.find(
                            (f) => f.id.toString() === selectedFarmer,
                          )?.name || 'All Farmers'
                        : 'All Farmers'}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Search farmer..." />
                    <CommandList>
                      <CommandEmpty>No farmer found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="all"
                          onSelect={() => {
                            handleFarmerChange('all');
                            setFarmerComboboxOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              selectedFarmer === 'all'
                                ? 'opacity-100'
                                : 'opacity-0',
                            )}
                          />
                          All Farmers
                        </CommandItem>
                        {(farmersData?.items || []).map((farmer) => (
                          <CommandItem
                            key={farmer.id}
                            value={farmer.name}
                            onSelect={() => {
                              handleFarmerChange(farmer.id.toString());
                              setFarmerComboboxOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                selectedFarmer === farmer.id.toString()
                                  ? 'opacity-100'
                                  : 'opacity-0',
                              )}
                            />
                            {farmer.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Farm Selector */}
            <div className="space-y-2">
              <Label>Farm</Label>
              <Popover
                open={farmComboboxOpen}
                onOpenChange={setFarmComboboxOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={farmComboboxOpen}
                    className="w-full justify-between font-normal"
                  >
                    <span className="truncate">
                      {selectedFarm !== 'all'
                        ? farmsData?.items?.find(
                            (f) => f.id.toString() === selectedFarm,
                          )?.name || 'All Farms'
                        : 'All Farms'}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Search farm..." />
                    <CommandList>
                      <CommandEmpty>No farm found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="all"
                          onSelect={() => {
                            handleFarmChange('all');
                            setFarmComboboxOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              selectedFarm === 'all'
                                ? 'opacity-100'
                                : 'opacity-0',
                            )}
                          />
                          All Farms
                        </CommandItem>
                        {(farmsData?.items || [])
                          .filter(
                            (farm) =>
                              selectedFarmer === 'all' ||
                              farm.farmer_id === parseInt(selectedFarmer),
                          )
                          .map((farm) => (
                            <CommandItem
                              key={farm.id}
                              value={farm.name}
                              onSelect={() => {
                                handleFarmChange(farm.id.toString());
                                setFarmComboboxOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  selectedFarm === farm.id.toString()
                                    ? 'opacity-100'
                                    : 'opacity-0',
                                )}
                              />
                              {farm.name}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Assigned By Selector - Only for Super Admin */}
            {isUserSuperAdmin && (
              <div className="space-y-2">
                <Label>Assigned By</Label>
                <Popover
                  open={assignedByComboboxOpen}
                  onOpenChange={setAssignedByComboboxOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={assignedByComboboxOpen}
                      className="w-full justify-between font-normal"
                    >
                      <span className="truncate">
                        {selectedAssignedBy !== 'all'
                          ? assignedByUsers.find(
                              (u) => u.id.toString() === selectedAssignedBy,
                            )?.username || 'All Users'
                          : 'All Users'}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput placeholder="Search user..." />
                      <CommandList>
                        <CommandEmpty>No user found.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            value="all"
                            onSelect={() => {
                              handleAssignedByChange('all');
                              setAssignedByComboboxOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                selectedAssignedBy === 'all'
                                  ? 'opacity-100'
                                  : 'opacity-0',
                              )}
                            />
                            All Users
                          </CommandItem>
                          {assignedByUsers.map((user) => (
                            <CommandItem
                              key={user.id}
                              value={user.username}
                              onSelect={() => {
                                handleAssignedByChange(user.id.toString());
                                setAssignedByComboboxOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  selectedAssignedBy === user.id.toString()
                                    ? 'opacity-100'
                                    : 'opacity-0',
                                )}
                              />
                              {user.username}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid sm:flex gap-2 w-full">
            <Button
              onClick={handleRefresh}
              variant="default"
              disabled={isRefreshing}
              className="flex-auto"
            >
              <RotateCw
                className={cn('mr-2 h-4 w-4', isRefreshing && 'animate-spin')}
              />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              className="flex-auto"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset Filters
            </Button>
            <Button onClick={handleExport} variant="ghost">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Time Range Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Time Range
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            value={timeMode}
            onValueChange={(v) => handleTimeModeChange(v as 'quick' | 'custom')}
          >
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="quick">Quick Select</TabsTrigger>
              <TabsTrigger value="custom">Custom Range</TabsTrigger>
            </TabsList>

            {/* Quick Select Tab */}
            <TabsContent value="quick" className="space-y-3">
              <div className="space-y-2">
                <Label>Select Time Range</Label>
                <Select
                  value={hours.toString()}
                  onValueChange={(value) => setHours(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Last 1 Hour</SelectItem>
                    <SelectItem value="12">Last 12 Hours</SelectItem>
                    <SelectItem value="24">Last 24 Hours</SelectItem>
                    <SelectItem value="48">Last 48 Hours (2 Days)</SelectItem>
                    <SelectItem value="72">Last 72 Hours (3 Days)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-sm text-muted-foreground">
                Showing data from the last {hours} hour{hours > 1 ? 's' : ''}{' '}
                until now
              </p>
            </TabsContent>

            {/* Custom Range Tab */}
            <TabsContent value="custom" className="space-y-3">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Date From</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
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
                        onSelect={handleDateFromChange}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Date To</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
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
                        onSelect={handleDateToChange}
                        disabled={(date) =>
                          dateFrom ? date < dateFrom : false
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              {dateFrom && (
                <p className="text-sm text-muted-foreground">
                  Showing data from {format(dateFrom, 'PPP')} 00:00 to{' '}
                  {dateTo ? `${format(dateTo, 'PPP')} 00:00` : 'now'}
                </p>
              )}
              {!dateFrom && (
                <p className="text-sm text-muted-foreground">
                  Select a start date to filter data
                </p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {!isLoading &&
        !isChartLoading &&
        sensorReadings.length === 0 &&
        chartSensorReadings.length === 0 && (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                No sensor data available. Please select a gateway and sensor to
                view data.
              </p>
            </CardContent>
          </Card>
        )}

      {!isLoading && selectedSensor !== 'none' && (
        <>
          {/* Chart Settings */}
          {availableMeasurementTypes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Chart Display Settings</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Measurement Type Filter */}
                <div className="space-y-2">
                  <Label>Select Measurement Types</Label>
                  <div className="flex flex-wrap gap-2">
                    {availableMeasurementTypes.map((type) => (
                      <Button
                        key={type}
                        variant={
                          selectedMeasurementTypes.includes(type)
                            ? 'default'
                            : 'outline'
                        }
                        size="sm"
                        onClick={() => {
                          setSelectedMeasurementTypes((prev) =>
                            prev.includes(type)
                              ? prev.filter((t) => t !== type)
                              : [...prev, type],
                          );
                        }}
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Select which measurement types to display in charts
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
          {/* Unified Sensor Chart */}
          {isChartLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : unifiedChartData.length > 0 ? (
            <div className="grid gap-4 grid-cols-1">
              <DataChart
                data={unifiedChartData}
                units={chartUnits}
                title="Unified Sensor Overview"
                durationHours={calculatedHours}
              />
            </div>
          ) : (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-muted-foreground">
                  {chartSensorReadings.length > 0
                    ? 'No data available for selected measurement types with current filters.'
                    : 'No sensor data available with current filters. Try adjusting your date range, filters, or check if the sensor is sending data.'}
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Sensor Readings</CardTitle>
              <form
                onSubmit={handleSearchSubmit}
                className="flex items-center gap-2 mt-4"
              >
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    ref={searchInputRef}
                    placeholder="Search readings..."
                    defaultValue={tableSearch}
                    onKeyDown={handleSearchKeyDown}
                    className="pl-9 pr-4"
                  />
                </div>
                <Button type="submit" size="sm" variant="default">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
                {tableSearch && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={handleClearSearch}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                )}
              </form>
            </CardHeader>
            <CardContent>
              <ReadingsTable
                readings={sensorReadings}
                sensors={sensorsData?.items || []}
                farmers={farmersData?.items || []}
                farms={farmsData?.items || []}
                assignments={assignmentsData?.items || []}
                gateways={gatewaysData?.items || []}
              />

              {/* Pagination Controls */}
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-sm text-muted-foreground text-center sm:text-left">
                  Showing {(page - 1) * pageSize + 1} to{' '}
                  {Math.min(page * pageSize, sensorDataResponse?.total || 0)} of{' '}
                  {sensorDataResponse?.total || 0} results
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3"
                    onClick={() => setPage(1)}
                    disabled={page === 1 || isLoadingData}
                    title="First page"
                  >
                    <span className="sr-only sm:not-sr-only sm:mr-1">
                      First
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 sm:hidden"
                    >
                      <polyline points="11 17 6 12 11 7" />
                      <polyline points="18 17 13 12 18 7" />
                    </svg>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || isLoadingData}
                    title="Previous page"
                  >
                    <span className="sr-only sm:not-sr-only">Prev</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 sm:hidden"
                    >
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </Button>
                  <div className="text-sm px-2 min-w-[80px] text-center">
                    {page} / {sensorDataResponse?.pages || 1}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={
                      page >= (sensorDataResponse?.pages || 1) || isLoadingData
                    }
                    title="Next page"
                  >
                    <span className="sr-only sm:not-sr-only">Next</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 sm:hidden"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3"
                    onClick={() => setPage(sensorDataResponse?.pages || 1)}
                    disabled={
                      page >= (sensorDataResponse?.pages || 1) || isLoadingData
                    }
                    title="Last page"
                  >
                    <span className="sr-only sm:not-sr-only sm:ml-1">Last</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 sm:hidden"
                    >
                      <polyline points="13 17 18 12 13 7" />
                      <polyline points="6 17 11 12 6 7" />
                    </svg>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
