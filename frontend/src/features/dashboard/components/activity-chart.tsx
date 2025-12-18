'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { useTheme } from 'next-themes';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ActivityData {
  date: string;
  readings: number;
}

interface ActivityChartProps {
  data: ActivityData[];
}

export function ActivityChart({ data }: ActivityChartProps) {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';

  // Theme colors - matching DataChart style
  const textColor = isDarkMode ? '#a1a1aa' : '#71717a';
  const gridColor = isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)';
  const tooltipBg = isDarkMode ? '#08120d' : '#ffffff';
  const tooltipBorder = isDarkMode ? '#1c2b22' : '#e4e4e7';
  const tooltipText = isDarkMode ? '#d1fae5' : '#374151';
  const primaryColor = '#10b981'; // Emerald

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div
        className="rounded-lg border px-3 py-2 shadow-xl"
        style={{
          backgroundColor: tooltipBg,
          borderColor: tooltipBorder,
        }}
      >
        <p className="font-medium mb-1 text-xs" style={{ color: tooltipText }}>
          {label}
        </p>
        <p style={{ color: primaryColor }} className="text-xs">
          {payload[0].value} readings
        </p>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Sensor Activity Trends
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2 md:px-6 pt-0">
        <div className="w-full h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorReadings" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={primaryColor}
                    stopOpacity={0.3}
                  />
                  <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="4 4"
                stroke={gridColor}
                vertical={false}
              />
              <XAxis
                dataKey="date"
                stroke={textColor}
                tick={{ fontSize: 9, fill: textColor }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                stroke={textColor}
                tick={{ fontSize: 9, fill: textColor }}
                axisLine={false}
                tickLine={false}
                width={35}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="readings"
                stroke={primaryColor}
                strokeWidth={1.5}
                fill="url(#colorReadings)"
                dot={false}
                activeDot={{ r: 3, strokeWidth: 0, fill: primaryColor }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
