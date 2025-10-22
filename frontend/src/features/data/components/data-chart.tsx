import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
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
  "rgb(59, 130, 246)",   // blue
  "rgb(16, 185, 129)",   // green
  "rgb(249, 115, 22)",   // orange
  "rgb(168, 85, 247)",   // purple
  "rgb(236, 72, 153)",   // pink
  "rgb(234, 179, 8)",    // yellow
  "rgb(239, 68, 68)",    // red
  "rgb(20, 184, 166)",   // teal
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
        <CardTitle className="text-lg">{title || "Sensor Data Trends (10s intervals)"}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
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
              angle={-45}
              textAnchor="end"
              height={50}
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
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            {sensorTypes.length > 1 && <Legend />}
            {sensorTypes.map((type, index) => (
              <Line
                key={type}
                type="monotone"
                dataKey={type}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={2}
                name={type}
                dot={false}
                connectNulls
                animationDuration={300}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
