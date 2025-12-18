'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  Droplets,
  Thermometer,
  Leaf,
  FlaskRound,
  Zap,
  Waves,
  TestTube,
  Activity,
  MapPin,
  AlertCircle,
  Clock,
  FileText,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import Image from 'next/image';

// Dynamically import PDF Download wrapper (client-only)
const PDFDownloadWrapper = dynamic(
  () => import('@/features/summary/components/pdf-download-wrapper'),
  {
    ssr: false,
    loading: () => (
      <Button size="lg" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    ),
  },
);

// Dynamically import MapView (client-only)
const MapView = dynamic(
  () => import('@/components/ui/map-view').then((mod) => mod.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[200px] rounded-md border bg-muted animate-pulse flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    ),
  },
);

interface SharedSummaryData {
  farm_id: number;
  farm_name: string;
  farm_location: string | null;
  farm_latitude: number | null;
  farm_longitude: number | null;
  farmer_id: number;
  farmer_name: string | null;
  start_date: string | null;
  end_date: string | null;
  summary: Record<
    string,
    {
      unit: string;
      count: number;
      min_value: number | null;
      max_value: number | null;
      avg_value: number | null;
      first_reading: string;
      last_reading: string;
    }
  >;
  created_at: string;
  expires_at: string;
}

const measurementConfig: Record<
  string,
  { icon: React.ElementType; color: string; bgColor: string }
> = {
  Moisture: {
    icon: Droplets,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  Temperature: {
    icon: Thermometer,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
  Nitrogen: { icon: Leaf, color: 'text-green-500', bgColor: 'bg-green-500/10' },
  Phosphorus: {
    icon: FlaskRound,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  Potassium: {
    icon: Zap,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
  },
  PH: { icon: TestTube, color: 'text-cyan-500', bgColor: 'bg-cyan-500/10' },
  Conductivity: {
    icon: Activity,
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
  },
  TDS: { icon: Waves, color: 'text-indigo-500', bgColor: 'bg-indigo-500/10' },
  Salinity: { icon: Waves, color: 'text-teal-500', bgColor: 'bg-teal-500/10' },
};

export default function SharedSummaryPage() {
  const params = useParams();
  const token = params.token as string;

  const [data, setData] = useState<SharedSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<{
    status: number;
    message: string;
  } | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/summary/share/${token}`,
        );

        if (!response.ok) {
          const errorData = await response.json();
          setError({
            status: response.status,
            message: errorData.detail || 'Failed to load summary',
          });
          return;
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError({
          status: 500,
          message: 'Failed to connect to server',
        });
      } finally {
        setIsLoading(false);
      }
    }

    if (token) {
      fetchData();
    }
  }, [token]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading summary report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="rounded-full bg-destructive/10 w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold mb-2">
              {error.status === 404 && 'Link Not Found'}
              {error.status === 410 && 'Link Expired'}
              {error.status !== 404 && error.status !== 410 && 'Error'}
            </h2>
            <p className="text-muted-foreground mb-4">{error.message}</p>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>This link may have expired or been revoked</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const summaryEntries = Object.entries(data.summary);
  const periodText =
    data.start_date && data.end_date
      ? `${format(new Date(data.start_date), 'PP')} - ${format(new Date(data.end_date), 'PP')}`
      : 'All Time';

  const pdfProps = {
    farmerName: data.farmer_name || '-',
    farmName: data.farm_name || '-',
    location: data.farm_location || '-',
    period: periodText,
    generatedAt: format(new Date(), 'PPP p'),
    summary: data.summary || {},
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white dark:bg-zinc-950">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-emerald-300 to-emerald-500 p-2 rounded-xl shadow-sm">
              <Image
                src="/favicon.webp"
                alt="Kampoeng Tani Logo"
                width={24}
                height={24}
                className="brightness-10 invert"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-white">
                Kampoeng Tani
              </span>
              <span className="text-xs text-white/70">Summary Report</span>
            </div>
          </div>
          <PDFDownloadWrapper
            {...pdfProps}
            fileName={`summary-report-${data.farm_name || 'farm'}-${format(new Date(), 'yyyy-MM-dd')}.pdf`}
          />
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-6 space-y-6 max-w-5xl">
        {/* Farm Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Farm Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              {/* Left: Farm Details */}
              <div className="w-full md:w-[300px] shrink-0 space-y-1 text-sm">
                <div className="flex items-center justify-between py-2.5 border-b">
                  <span className="text-muted-foreground">Farmer</span>
                  <span className="font-medium">{data.farmer_name || '-'}</span>
                </div>
                <div className="flex items-center justify-between py-2.5 border-b">
                  <span className="text-muted-foreground">Farm</span>
                  <span className="font-medium">{data.farm_name || '-'}</span>
                </div>
                <div className="flex items-center justify-between py-2.5 border-b">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium">
                    {data.farm_location || '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-muted-foreground">Period</span>
                  <span className="font-medium">{periodText}</span>
                </div>
              </div>

              {/* Right: Map */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-2">
                  Farm Location
                </p>
                {data.farm_latitude && data.farm_longitude ? (
                  <div className="rounded-lg overflow-hidden border h-[180px] md:h-[160px]">
                    <MapView
                      latitude={data.farm_latitude}
                      longitude={data.farm_longitude}
                      height="100%"
                      zoom={14}
                      className="border-0"
                    />
                  </div>
                ) : (
                  <div className="rounded-lg border h-[180px] md:h-[160px] flex items-center justify-center bg-muted/30">
                    <div className="text-center">
                      <MapPin className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No location data
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        {summaryEntries.length > 0 ? (
          <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {summaryEntries.map(([type, stats]) => {
              const config = measurementConfig[type] || {
                icon: Activity,
                color: 'text-emerald-500',
                bgColor: 'bg-emerald-500/10',
              };
              const Icon = config.icon;
              return (
                <Card key={type}>
                  <CardContent>
                    <div className="flex items-start gap-3">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className={cn('rounded-lg p-2', config.bgColor)}>
                            <Icon className={cn('h-4 w-4', config.color)} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm">{type}</h3>
                            <p className="text-xs text-muted-foreground">
                              {stats.unit} • {stats.count} readings
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5">
                          <div className="text-center rounded-md bg-muted/50 p-1.5">
                            <p className="text-[10px] text-muted-foreground">
                              Min
                            </p>
                            <p className="font-mono font-semibold text-xs">
                              {stats.min_value?.toFixed(2) ?? '-'}
                            </p>
                          </div>
                          <div className="text-center rounded-md bg-emerald-500/10 p-1.5">
                            <p className="text-[10px] text-muted-foreground">
                              Avg
                            </p>
                            <p className="font-mono font-semibold text-xs text-emerald-600">
                              {stats.avg_value?.toFixed(2) ?? '-'}
                            </p>
                          </div>
                          <div className="text-center rounded-md bg-muted/50 p-1.5">
                            <p className="text-[10px] text-muted-foreground">
                              Max
                            </p>
                            <p className="font-mono font-semibold text-xs">
                              {stats.max_value?.toFixed(2) ?? '-'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No sensor data available for this period.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Monitor soil parameters regularly</li>
              <li>Maintain balanced N-P-K levels</li>
              <li>Keep soil moisture within optimal range</li>
              <li>Ensure pH is suitable for nutrient availability</li>
            </ul>
            <p className="text-xs text-muted-foreground mt-3 pt-2 border-t">
              Note: Consult agricultural experts for specific recommendations.
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground py-4 border-t">
          <p>Generated by Kampoeng Tani IoT System</p>
          <p className="mt-1">
            Report shared on {format(new Date(data.created_at), 'PPP')} •
            Expires {format(new Date(data.expires_at), 'PPP')}
          </p>
        </div>
      </main>
    </div>
  );
}
