import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { PivotedSensorDataResponse } from '@/types/api';
import { useMemo, useState } from 'react';
import { formatDateTimeToWIB } from '@/lib/date-utils';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReadingsTableProps {
  readings: PivotedSensorDataResponse[];
}

// Transform backend data to have measurements as a Record for easier column access
interface TableRow {
  id: string;
  timestamp: string;
  sensor_name: string;
  gateway_uid: string;
  farmer_name: string;
  farm_name: string;
  assigned_by: string;
  // Dynamic measurements keyed by type
  measurements: Record<string, { value: number; unit: string }>;
}

export function ReadingsTable({ readings }: ReadingsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  // Transform pivoted data and collect measurement types
  const { tableData, measurementTypes } = useMemo(() => {
    const types = new Set<string>();

    const data: TableRow[] = readings.map((reading, index) => {
      const measurementsRecord: Record<
        string,
        { value: number; unit: string }
      > = {};

      reading.measurements.forEach((m) => {
        types.add(m.measurement_type);
        measurementsRecord[m.measurement_type] = {
          value: m.value,
          unit: m.unit || '',
        };
      });

      return {
        id: `${reading.sensor_id}-${reading.timestamp}-${index}`,
        timestamp: reading.timestamp,
        sensor_name:
          reading.sensor_name || reading.sensor_uid || `${reading.sensor_id}`,
        gateway_uid: reading.gateway_uid || `${reading.gateway_id}`,
        farmer_name: reading.farmer_name || '-',
        farm_name: reading.farm_name || '-',
        assigned_by: reading.assigned_by_username || '-',
        measurements: measurementsRecord,
      };
    });

    return {
      tableData: data,
      measurementTypes: Array.from(types).sort(),
    };
  }, [readings]);

  const columnHelper = createColumnHelper<TableRow>();

  const columns = useMemo(() => {
    const baseColumns = [
      columnHelper.accessor('timestamp', {
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-4 h-8"
          >
            Time
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: (info) => formatDateTimeToWIB(info.getValue()),
      }),
      columnHelper.accessor('sensor_name', {
        header: 'Sensor',
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      }),
    ];

    // Dynamic measurement columns
    const dynamicColumns = measurementTypes.map((type) =>
      columnHelper.accessor((row) => row.measurements[type], {
        id: `measure_${type}`,
        header: type,
        cell: (info) => {
          const m = info.getValue();
          if (!m) return <span className="text-muted-foreground">-</span>;
          return (
            <div className="flex items-baseline gap-1 font-mono">
              <span>{m.value.toFixed(2)}</span>
              <span className="text-[10px] text-muted-foreground uppercase">
                {m.unit}
              </span>
            </div>
          );
        },
      }),
    );

    const trailingColumns = [
      columnHelper.accessor('farmer_name', {
        header: 'Farmer',
        cell: (info) => (
          <span className="text-muted-foreground">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('farm_name', {
        header: 'Farm',
        cell: (info) => (
          <span className="text-muted-foreground">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('gateway_uid', {
        header: 'Gateway',
        cell: (info) => (
          <span className="text-muted-foreground">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('assigned_by', {
        header: 'Assigned By',
        cell: (info) => (
          <span className="text-muted-foreground">{info.getValue()}</span>
        ),
      }),
    ];

    return [...baseColumns, ...dynamicColumns, ...trailingColumns];
  }, [measurementTypes, columnHelper]);

  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (!readings.length) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        No readings available
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="whitespace-nowrap">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="whitespace-nowrap">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
