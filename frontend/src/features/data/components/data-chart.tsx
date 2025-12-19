'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMemo } from 'react';
import { useTheme } from 'next-themes';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
} from 'recharts';

interface ChartDataPoint {
  time: string;
  [key: string]: string | number | null | undefined;
}

interface DataChartProps {
  data: ChartDataPoint[];
  title?: string;
  units?: Record<string, string>;
  durationHours?: number;
  /** Optional chart group identifier for grouped charts */
  groupId?: string;
  /** Optional accent color for the chart group */
  groupColor?: string;
}

import { format, parseISO, isValid } from 'date-fns';

// Minimalist color palette - softer, professional colors
const COLORS = [
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#84cc16', // Lime
];

export function DataChart({
  data,
  title,
  units = {},
  durationHours = 24,
  groupId,
  groupColor,
}: DataChartProps) {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';

  // Extract sensor types from data
  const sensorTypes = useMemo(() => {
    if (!data || !data.length) return [];
    const types = new Set<string>();
    data.slice(0, Math.min(100, data.length)).forEach((point) => {
      Object.keys(point).forEach((key) => {
        if (key !== 'time' && key !== 'unit' && key !== 'timestamp') {
          types.add(key);
        }
      });
    });
    return Array.from(types).sort();
  }, [data]);

  // Downsample for performance
  const displayData = useMemo(() => {
    if (!data || !data.length) return [];
    const maxPoints = 1000;
    if (data.length <= maxPoints) return data;
    const step = Math.ceil(data.length / maxPoints);
    return data.filter((_, i) => i % step === 0);
  }, [data]);

  // Theme colors - dark green for dark mode tooltip
  const textColor = isDarkMode ? '#a1a1aa' : '#71717a';
  const gridColor = isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)';
  const tooltipBg = isDarkMode ? '#08120d' : '#ffffff';
  const tooltipBorder = isDarkMode ? '#1c2b22' : '#e4e4e7'; // Match card border style
  const tooltipText = isDarkMode ? '#d1fae5' : '#374151';
  const brushColor = isDarkMode ? '#3f3f46' : '#e4e4e7';

  // Format Helper
  const formatLabel = (label: string) => {
    try {
      if (!label) return '';
      // If it looks like a time string (HH:mm), return as is (legacy support)
      if (label.includes(':') && !label.includes('T')) return label;

      const date = parseISO(label);
      if (!isValid(date)) return label;

      return format(date, 'MMM dd, HH:mm:ss');
    } catch (e) {
      return label;
    }
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    // Filter out null values
    const validPayload = payload.filter((entry: any) => entry.value !== null);
    if (!validPayload.length) return null;

    return (
      <div
        className="rounded-lg border px-3 py-2 shadow-xl"
        style={{
          backgroundColor: tooltipBg,
          borderColor: tooltipBorder,
        }}
      >
        <p
          className="font-medium mb-1.5 text-xs"
          style={{ color: tooltipText }}
        >
          {formatLabel(label)}
        </p>
        {validPayload.map((entry: any, index: number) => (
          <p
            key={index}
            style={{ color: entry.color }}
            className="text-xs leading-relaxed"
          >
            {entry.name}: {entry.value.toFixed(2)}
            {units[entry.name] ? ` ${units[entry.name]}` : ''}
          </p>
        ))}
      </div>
    );
  };

  // Empty state
  if (!data || !data.length) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{title || 'Sensor Data'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[400px] items-center justify-center text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!sensorTypes.length) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{title || 'Sensor Data'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[400px] items-center justify-center text-muted-foreground">
            No sensor types found
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title || 'Sensor Overview'}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 overflow-x-auto">
        {/* Scrollable container for mobile - minimum width ensures chart is readable */}
        <div
          className="h-[400px]"
          style={{
            minWidth: `${Math.max(600, 600 + sensorTypes.length * 20)}px`,
            width: '100%',
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={displayData}
              margin={{
                top: 16,
                // Dynamic margin: base 50px + extra 40px for each additional axis on that side
                right: 50 + Math.floor((sensorTypes.length - 1) / 2) * 40,
                left: 0 + Math.floor(sensorTypes.length / 2) * 40,
                bottom: 50,
              }}
            >
              <CartesianGrid
                strokeDasharray="4 4"
                stroke={gridColor}
                vertical={false}
              />
              <XAxis
                dataKey="time"
                stroke={textColor}
                tick={{
                  fontSize: 10,
                  fill: textColor,
                  fontFamily: 'Inter, sans-serif',
                }}
                angle={-45}
                textAnchor="end"
                height={40}
                interval="preserveStartEnd"
                axisLine={false}
                tickLine={false}
                tickFormatter={(value: string) => {
                  try {
                    // Legacy support
                    if (value.includes(':') && !value.includes('T')) {
                      const parts = value.split(':');
                      if (parts.length >= 2) return `${parts[0]}:${parts[1]}`;
                      return value;
                    }

                    const date = parseISO(value);
                    if (!isValid(date)) return value;

                    // If duration is more than 24 hours (or not specified), show date
                    if (durationHours && durationHours > 24) {
                      return format(date, 'MMM dd HH:mm');
                    }
                    // Otherwise just show time
                    return format(date, 'HH:mm');
                  } catch (e) {
                    return value;
                  }
                }}
              />

              {/* Y-Axis for each sensor type - alternating left/right with offset */}
              {sensorTypes.map((type, index) => {
                const isLeft = index % 2 === 0;
                // Calculate which position this axis is on its side (0, 1, 2...)
                const sideIndex = Math.floor(index / 2);
                // Offset each additional axis on same side - more compact
                const offset = sideIndex * 40;

                return (
                  <YAxis
                    key={type}
                    yAxisId={type}
                    orientation={isLeft ? 'left' : 'right'}
                    stroke={COLORS[index % COLORS.length]}
                    tick={{
                      fontSize: 9,
                      fill: COLORS[index % COLORS.length],
                      fontFamily: 'Inter, sans-serif',
                    }}
                    tickLine={false}
                    axisLine={{
                      stroke: COLORS[index % COLORS.length],
                      strokeWidth: 1.5,
                    }}
                    width={35}
                    // Move additional axes outward
                    {...(sideIndex > 0 && {
                      tickMargin: 4,
                    })}
                    style={{
                      transform: isLeft
                        ? `translateX(-${offset}px)`
                        : `translateX(${offset}px)`,
                    }}
                    label={{
                      value: units[type] ? `${type} (${units[type]})` : type,
                      angle: isLeft ? -90 : 90,
                      position: isLeft ? 'insideLeft' : 'insideRight',
                      style: {
                        fontSize: 9,
                        fill: COLORS[index % COLORS.length],
                        textAnchor: 'middle',
                        fontFamily: 'Inter, sans-serif',
                      },
                      offset: isLeft ? -offset - 8 : -offset - 8,
                    }}
                    tickFormatter={(value: number) => value.toFixed(1)}
                  />
                );
              })}

              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{
                  paddingTop: '8px',
                  fontSize: '12px',
                  fontFamily: 'Inter, sans-serif',
                }}
                formatter={(value: string) => (
                  <span
                    style={{
                      color: textColor,
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    {value}
                  </span>
                )}
              />

              {/* Lines for each sensor type */}
              {sensorTypes.map((type, index) => (
                <Line
                  key={type}
                  type="monotone"
                  dataKey={type}
                  yAxisId={type}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 3, strokeWidth: 0 }}
                  connectNulls={false}
                  isAnimationActive={displayData.length < 200}
                />
              ))}

              <Brush
                dataKey="time"
                height={20}
                stroke={brushColor}
                fill={isDarkMode ? '#18181b' : '#fafafa'}
                tickFormatter={() => ''}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
