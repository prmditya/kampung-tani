import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useMemo } from 'react';

interface ChartDataPoint {
  time: string;
  [key: string]: string | number | null;
}

interface DataChartProps {
  data: ChartDataPoint[];
  title?: string;
  labelInterval?: number; // in minutes (15, 30, 60, 120)
}

export function DataChart({ data, title, labelInterval = 60 }: DataChartProps) {
  // Extract unique sensor types from data
  const sensorTypes = useMemo(() => {
    if (!data.length) return [];
    const types = new Set<string>();
    data.forEach((point) => {
      Object.keys(point).forEach((key) => {
        if (key !== 'time') {
          types.add(key);
        }
      });
    });
    return Array.from(types);
  }, [data]);

  // Calculate tick interval - how many data points to skip between labels
  const tickInterval = useMemo(() => {
    if (!data.length) return 0;
    if (data.length <= 3) return 0; // Show all ticks

    // Parse first and last time to get total span
    const parseTime = (timeStr: string): number => {
      const parts = timeStr.toString().split(':');
      if (parts.length === 3) {
        const hours = parseInt(parts[0], 10);
        const minutes = parseInt(parts[1], 10);
        const seconds = parseInt(parts[2], 10);
        return hours * 60 + minutes + seconds / 60;
      }
      return 0;
    };

    const firstTime = parseTime(data[0].time as string);
    const lastTime = parseTime(data[data.length - 1].time as string);
    const totalSpanMinutes = lastTime - firstTime;

    if (totalSpanMinutes <= 0) {
      return Math.max(1, Math.floor(data.length / 8));
    }

    // Calculate how many data points represent the desired label interval
    const minutesPerDataPoint = totalSpanMinutes / data.length;
    const dataPointsPerInterval = Math.round(
      labelInterval / minutesPerDataPoint,
    );

    // Return the interval (how many points to skip)
    return Math.max(1, dataPointsPerInterval);
  }, [data, labelInterval]);

  // Generate custom ticks based on the interval
  const customTicks = useMemo(() => {
    if (!data.length) return [];
    if (data.length <= 3) return data.map((d) => d.time.toString());

    const ticks: string[] = [];

    // Always include first tick
    ticks.push(data[0].time.toString());

    // Add ticks at interval steps
    for (let i = tickInterval; i < data.length - 1; i += tickInterval) {
      ticks.push(data[i].time.toString());
    }

    // Always include last tick
    if (data.length > 1) {
      ticks.push(data[data.length - 1].time.toString());
    }

    return ticks;
  }, [data, tickInterval]);

  if (!data.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title || 'Sensor Data Trends'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[250px] items-center justify-center text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {title || 'Sensor Data Trends (10s intervals)'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={150}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorQty" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--chart-1)"
                  stopOpacity={0.4}
                />
                <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-border"
              horizontal={true}
              vertical={false}
            />
            <XAxis
              dataKey="time"
              className="text-xs"
              tick={{ fill: 'currentColor', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              angle={0}
              textAnchor="middle"
              height={20}
              ticks={customTicks}
              tickFormatter={(value) => {
                // Format to show only HH:MM
                if (typeof value === 'string' && value.includes(':')) {
                  const parts = value.split(':');
                  if (parts.length >= 2) {
                    return `${parts[0]}:${parts[1]}`;
                  }
                }
                return value;
              }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: 'currentColor', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--popover)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                color: 'var(--popover-foreground)',
              }}
              labelStyle={{
                color: 'var(--popover-foreground)',
                fontWeight: 'bold',
              }}
            />
            {sensorTypes.length > 1 && <Legend />}
            {sensorTypes.map((type, index) => (
              <Area
                key={type}
                type="monotone"
                dataKey={type}
                stroke="var(--chart-1)"
                fill="url(#colorQty)"
                strokeWidth={2}
                name={type}
                dot={(props: any) => {
                  // Don't show dots for null values or non-tick labels
                  const isTickShown = customTicks.includes(props.payload?.time);
                  const value = props.payload?.[type];

                  if (!isTickShown || value === null || value === undefined) {
                    return null;
                  }

                  return (
                    <circle
                      cx={props.cx}
                      cy={props.cy}
                      r={3}
                      fill="var(--chart-1)"
                      stroke="var(--chart-1)"
                      strokeWidth={2}
                    />
                  );
                }}
                activeDot={{
                  r: 5,
                  fill: 'var(--chart-1)',
                  strokeWidth: 2,
                  stroke: 'var(--background)',
                }}
                connectNulls={false}
                animationDuration={300}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
