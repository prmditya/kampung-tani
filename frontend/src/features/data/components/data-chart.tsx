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

interface ChartDataPoint {
  time: string;
  pH: number;
  Temp: number;
  Turbidity: number;
  Level: number;
}

interface DataChartProps {
  data: ChartDataPoint[];
}

export function DataChart({ data }: DataChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sensor Data Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="5 5"
              className="stroke-border"
              horizontal={true}
              vertical={false}
            />
            <XAxis
              dataKey="time"
              className="text-xs"
              tick={{ fill: "currentColor" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: "currentColor" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="pH"
              stroke="rgb(59, 130, 246)"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="Temp"
              stroke="rgb(16, 185, 129)"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="Turbidity"
              stroke="rgb(249, 115, 22)"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="Level"
              stroke="rgb(168, 85, 247)"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
