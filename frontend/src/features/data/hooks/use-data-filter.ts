import { useCallback, useState, useEffect } from 'react';
import type { GatewayResponse, SensorResponse } from '@/types/api';

interface UseDataFilterParams {
  gateways: GatewayResponse[];
  sensors: SensorResponse[];
  // Controlled state props (optional)
  selectedGateway?: string;
  selectedSensor?: string;
  dateFrom?: Date | undefined;
  dateTo?: Date | undefined;
  isRefreshing?: boolean;
  // Callbacks for controlled state
  onGatewayChange?: (value: string) => void;
  onSensorChange?: (value: string) => void;
  onDateFromChange?: (date: Date | undefined) => void;
  onDateToChange?: (date: Date | undefined) => void;
  // Initial values for uncontrolled state
  initialGateway?: string;
  initialSensor?: string;
  initialDateFrom?: Date | undefined;
  initialDateTo?: Date | undefined;
  initialRefreshing?: boolean;
}

export function useDataFilter(
  params: UseDataFilterParams,
  callbacks?: {
    onReset?: () => void;
    onRefresh?: () => void;
    onExport?: () => void;
  },
) {
  // Determine if component is controlled
  const isControlled = params.selectedGateway !== undefined;

  const {
    initialGateway = 'none',
    initialSensor = 'none',
    initialDateFrom,
    initialDateTo,
    initialRefreshing = false,
  } = params;

  // Internal state (used only when uncontrolled)
  const [internalSelectedGateway, setInternalSelectedGateway] =
    useState<string>(initialGateway);
  const [internalSelectedSensor, setInternalSelectedSensor] =
    useState<string>(initialSensor);
  const [internalDateFrom, setInternalDateFrom] = useState<Date | undefined>(
    initialDateFrom,
  );
  const [internalDateTo, setInternalDateTo] = useState<Date | undefined>(
    initialDateTo,
  );
  const [internalIsRefreshing, setInternalIsRefreshing] =
    useState<boolean>(initialRefreshing);

  // Use controlled values if provided, otherwise use internal state
  const selectedGateway = isControlled
    ? params.selectedGateway!
    : internalSelectedGateway;
  const selectedSensor = isControlled
    ? params.selectedSensor!
    : internalSelectedSensor;
  const dateFrom = isControlled ? params.dateFrom : internalDateFrom;
  const dateTo = isControlled ? params.dateTo : internalDateTo;
  const isRefreshing = params.isRefreshing ?? internalIsRefreshing;

  const handleGatewayChange = useCallback(
    (value: string) => {
      if (params.onGatewayChange) {
        params.onGatewayChange(value);
      } else {
        setInternalSelectedGateway(value);
        // Clear sensor when gateway changes
        setInternalSelectedSensor('none');
      }
    },
    [params],
  );

  const handleSensorChange = useCallback(
    (value: string) => {
      if (params.onSensorChange) {
        params.onSensorChange(value);
      } else {
        setInternalSelectedSensor(value);
      }
    },
    [params],
  );

  const handleDateFromChange = useCallback(
    (d: Date | undefined) => {
      if (params.onDateFromChange) {
        params.onDateFromChange(d);
      } else {
        setInternalDateFrom(d);
        // If dateTo is earlier than new from, clear it
        if (d && internalDateTo && internalDateTo < d) {
          setInternalDateTo(undefined);
        }
      }
    },
    [params, internalDateTo],
  );

  const handleDateToChange = useCallback(
    (d: Date | undefined) => {
      if (params.onDateToChange) {
        params.onDateToChange(d);
      } else {
        setInternalDateTo(d);
      }
    },
    [params],
  );

  const handleReset = useCallback(() => {
    if (isControlled) {
      // For controlled mode, just call the callback
      callbacks?.onReset?.();
    } else {
      // For uncontrolled mode, reset internal state
      setInternalSelectedGateway('none');
      setInternalSelectedSensor('none');
      setInternalDateFrom(undefined);
      setInternalDateTo(undefined);
      callbacks?.onReset?.();
    }
  }, [isControlled, callbacks]);

  const handleRefresh = useCallback(async () => {
    if (!isControlled) {
      setInternalIsRefreshing(true);
    }
    try {
      await callbacks?.onRefresh?.();
    } finally {
      if (!isControlled) {
        setInternalIsRefreshing(false);
      }
    }
  }, [isControlled, callbacks]);

  const handleExport = useCallback(() => {
    callbacks?.onExport?.();
  }, [callbacks]);

  return {
    selectedGateway,
    selectedSensor,
    dateFrom,
    dateTo,
    isRefreshing,
    onGatewayChange: handleGatewayChange,
    onSensorChange: handleSensorChange,
    onDateFromChange: handleDateFromChange,
    onDateToChange: handleDateToChange,
    onReset: handleReset,
    onRefresh: handleRefresh,
    onExport: handleExport,
    // Also expose setters for advanced uses (only affect uncontrolled state)
    setSelectedGateway: setInternalSelectedGateway,
    setSelectedSensor: setInternalSelectedSensor,
    setDateFrom: setInternalDateFrom,
    setDateTo: setInternalDateTo,
    setIsRefreshing: setInternalIsRefreshing,
  } as const;
}
