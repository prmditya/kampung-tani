import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useMemo } from "react";

interface ChartDataPoint {
  time: string;
  [key: string]: string | number;
}

interface DataChartProps {
  data: ChartDataPoint[];
  title?: string;
}

// Color palette for different sensor types
const COLORS = [
  "rgb(59, 130, 246)", // blue
  "rgb(16, 185, 129)", // green
  "rgb(249, 115, 22)", // orange
  "rgb(168, 85, 247)", // purple
  "rgb(236, 72, 153)", // pink
  "rgb(234, 179, 8)", // yellow
  "rgb(239, 68, 68)", // red
  "rgb(20, 184, 166)", // teal
];

export function DataChart({ data, title }: DataChartProps) {
  // Extract unique sensor types from data
  const sensorTypes = useMemo(() => {
    if (!data.length) return [];
    const types = new Set<string>();
    data.forEach((point) => {
      Object.keys(point).forEach((key) => {
        if (key !== "time") {
          types.add(key);
        }
      });
    });
    return Array.from(types);
  }, [data]);

  // Calculate tick interval based on data length
  const tickInterval = useMemo(() => {
    const dataLength = data.length;
    if (dataLength <= 10) return 0; // Show all ticks
    if (dataLength <= 50) return Math.floor(dataLength / 5); // Show ~5 ticks
    if (dataLength <= 100) return Math.floor(dataLength / 8); // Show ~8 ticks
    return Math.floor(dataLength / 10); // Show ~10 ticks for larger datasets
  }, [data.length]);

  if (!data.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title || "Sensor Data Trends"}</CardTitle>
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
          {title || "Sensor Data Trends (10s intervals)"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorQty" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="rgb(59, 130, 246)"
                  stopOpacity={0.4}
                />
                <stop
                  offset="95%"
                  stopColor="rgb(59, 130, 246)"
                  stopOpacity={0}
                />
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
              tick={{ fill: "currentColor", fontSize: 9 }}
              axisLine={false}
              tickLine={false}
              angle={0}
              textAnchor="start"
              height={20}
              interval={tickInterval}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: "currentColor", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={50}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
                color: 'hsl(var(--popover-foreground))',
              }}
              labelStyle={{
                color: 'hsl(var(--popover-foreground))',
                fontWeight: 'bold',
              }}
            />
            {sensorTypes.length > 1 && <Legend />}
            {sensorTypes.map((type, index) => (
              <Area
                key={type}
                type="monotone"
                dataKey={type}
                stroke={COLORS[index % COLORS.length]}
                fill="url(#colorQty)"
                strokeWidth={2}
                name={type}
                dot={{
                  r: 3,
                  fill: "rgb(59, 130, 246)",
                  strokeWidth: 2,
                  stroke: "hsl(var(--card))",
                }}
                connectNulls
                animationDuration={300}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
