'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
  CalendarIcon,
  Download,
  FileText,
  Loader2,
  Droplets,
  Thermometer,
  Leaf,
  FlaskRound,
  Zap,
  Waves,
  TestTube,
  Activity,
} from 'lucide-react';
import { format } from 'date-fns';
import { useFarmers } from '@/features/farmers/hooks/use-farmers';
import { useFarms } from '@/features/farmers/hooks/use-farms';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import dynamic from 'next/dynamic';

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

interface FarmSummaryResponse {
  farm_id: number;
  farm_name: string;
  farmer_id: number;
  start_date: string | null;
  end_date: string | null;
  summary: {
    [measurementType: string]: {
      unit: string;
      count: number;
      min_value: number | null;
      max_value: number | null;
      avg_value: number | null;
      first_reading: string;
      last_reading: string;
    };
  };
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

export default function SummaryPage() {
  const [selectedFarmer, setSelectedFarmer] = useState<string>('');
  const [selectedFarm, setSelectedFarm] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [summaryGenerated, setSummaryGenerated] = useState(false);

  const { data: farmersData } = useFarmers({ size: 100 });
  const { data: farmsData } = useFarms({ size: 100 });

  const filteredFarms = useMemo(() => {
    if (!farmsData?.items || !selectedFarmer) return [];
    return farmsData.items.filter(
      (farm) => farm.farmer_id.toString() === selectedFarmer,
    );
  }, [farmsData, selectedFarmer]);

  const {
    data: summaryData,
    isLoading: isLoadingSummary,
    refetch: refetchSummary,
  } = useQuery<FarmSummaryResponse>({
    queryKey: ['farm-summary', selectedFarm, dateFrom, dateTo],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dateFrom) {
        const y = dateFrom.getFullYear();
        const m = String(dateFrom.getMonth() + 1).padStart(2, '0');
        const d = String(dateFrom.getDate()).padStart(2, '0');
        params.append('start_date', `${y}-${m}-${d}T00:00:00`);
      }
      if (dateTo) {
        const y = dateTo.getFullYear();
        const m = String(dateTo.getMonth() + 1).padStart(2, '0');
        const d = String(dateTo.getDate()).padStart(2, '0');
        params.append('end_date', `${y}-${m}-${d}T23:59:59`);
      }
      const response = await apiClient.get<FarmSummaryResponse>(
        `/sensors/summary/farm/${selectedFarm}?${params}`,
      );
      return response.data;
    },
    enabled: false,
  });

  const handleGenerateSummary = () => {
    if (!selectedFarm) return;
    setSummaryGenerated(true);
    refetchSummary();
  };

  const handleReset = () => {
    setSelectedFarmer('');
    setSelectedFarm('');
    setDateFrom(undefined);
    setDateTo(undefined);
    setSummaryGenerated(false);
  };

  const selectedFarmerData = farmersData?.items?.find(
    (f) => f.id.toString() === selectedFarmer,
  );
  const selectedFarmData = farmsData?.items?.find(
    (f) => f.id.toString() === selectedFarm,
  );
  const summaryEntries = summaryData?.summary
    ? Object.entries(summaryData.summary)
    : [];

  // PDF props
  const pdfProps = {
    farmerName: selectedFarmerData?.name || '-',
    farmName: selectedFarmData?.name || '-',
    location: selectedFarmData?.location || '-',
    period:
      dateFrom && dateTo
        ? `${format(dateFrom, 'PP')} - ${format(dateTo, 'PP')}`
        : 'All Time',
    generatedAt: format(new Date(), 'PPP p'),
    summary: summaryData?.summary || {},
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Summary Report</h1>
        <p className="text-muted-foreground">
          Generate and export farm data summary
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Report Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label className="text-xs">Farmer</Label>
              <Select
                value={selectedFarmer}
                onValueChange={(v) => {
                  setSelectedFarmer(v);
                  setSelectedFarm('');
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select farmer" />
                </SelectTrigger>
                <SelectContent>
                  {(farmersData?.items || []).map((farmer) => (
                    <SelectItem key={farmer.id} value={farmer.id.toString()}>
                      {farmer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Farm</Label>
              <Select
                value={selectedFarm}
                onValueChange={setSelectedFarm}
                disabled={!selectedFarmer}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select farm" />
                </SelectTrigger>
                <SelectContent>
                  {filteredFarms.map((farm) => (
                    <SelectItem key={farm.id} value={farm.id.toString()}>
                      {farm.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">From Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !dateFrom && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, 'PP') : 'Start date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">To Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !dateTo && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, 'PP') : 'End date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleGenerateSummary}
              disabled={!selectedFarm || isLoadingSummary}
              className="flex-1"
            >
              {isLoadingSummary ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Report
                </>
              )}
            </Button>
            <Button onClick={handleReset} variant="outline">
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Preview */}
      {summaryGenerated && summaryData && summaryEntries.length > 0 && (
        <>
          {/* Download Button */}
          <div className="flex justify-end">
            <PDFDownloadWrapper
              {...pdfProps}
              fileName={`summary-report-${selectedFarmData?.name || 'farm'}-${format(new Date(), 'yyyy-MM-dd')}.pdf`}
            />
          </div>

          {/* Preview Cards */}
          <div className="space-y-4">
            {/* Farm Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Farm Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Farmer</p>
                    <p className="font-semibold">
                      {selectedFarmerData?.name || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Farm</p>
                    <p className="font-semibold">
                      {selectedFarmData?.name || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="font-semibold">
                      {selectedFarmData?.location || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Period</p>
                    <p className="font-semibold">
                      {dateFrom && dateTo
                        ? `${format(dateFrom, 'PP')} - ${format(dateTo, 'PP')}`
                        : 'All Time'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-3">
              {summaryEntries.map(([type, stats]) => {
                const config = measurementConfig[type] || {
                  icon: Activity,
                  color: 'text-emerald-500',
                  bgColor: 'bg-emerald-500/10',
                };
                const Icon = config.icon;
                return (
                  <Card key={type}>
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-start gap-3">
                        <div className={cn('rounded-lg p-2', config.bgColor)}>
                          <Icon className={cn('h-4 w-4', config.color)} />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div>
                            <h3 className="font-semibold text-sm">{type}</h3>
                            <p className="text-xs text-muted-foreground">
                              {stats.unit} • {stats.count} readings
                            </p>
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
                  Note: Consult agricultural experts for specific
                  recommendations.
                </p>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Empty State */}
      {summaryGenerated &&
        (!summaryData || summaryEntries.length === 0) &&
        !isLoadingSummary && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No data available for the selected parameters.
              </p>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
