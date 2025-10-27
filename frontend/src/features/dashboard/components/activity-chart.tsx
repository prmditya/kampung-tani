import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
} from 'recharts';

interface ActivityData {
  date: string;
  readings: number;
}

interface ActivityChartProps {
  data: ActivityData[];
}

export function ActivityChart({ data }: ActivityChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Sensor Activity Trends
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2 md:px-6">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
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
              strokeDasharray="5 5"
              horizontal={true}
              vertical={false}
              className="stroke-border"
            />
            <XAxis
              dataKey="date"
              className="text-xs"
              tick={{ fill: 'currentColor' }}
              stroke="hsl(var(--border))"
              axisLine={true}
              tickLine={false}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: 'currentColor' }}
              stroke="hsl(var(--border))"
              axisLine={true}
              tickLine={false}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                color: 'var(--foreground)',
              }}
            />
            <Area
              type="monotone"
              dataKey="readings"
              stroke="var(--chart-1)"
              strokeWidth={3}
              fill="url(#colorQty)"
              dot={{
                r: 3,
                fill: 'var(--chart-1)',
                strokeWidth: 2,
                stroke: 'var(--chart-1)',
              }}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
