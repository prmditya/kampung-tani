'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { z } from 'zod';
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
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
  MapPin,
  Check,
  ChevronsUpDown,
  Share2,
  Copy,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import { format } from 'date-fns';
import { useFarmers } from '@/features/farmers/hooks/use-farmers';
import { useFarms } from '@/features/farmers/hooks/use-farms';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import dynamic from 'next/dynamic';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

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

// Dynamically import MapView (client-only, uses WebGL)
const MapView = dynamic(
  () => import('@/components/ui/map-view').then((mod) => mod.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[200px] rounded-md border border-input bg-muted animate-pulse flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
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

// Form validation schema
const summaryFormSchema = z.object({
  farmId: z.string().min(1, 'Farm is required'),
  dateFrom: z.date({ required_error: 'Start date is required' }),
  dateTo: z.date({ required_error: 'End date is required' }),
});

export default function SummaryPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Read initial values from URL params
  const initialFarmer = searchParams.get('farmer') || '';
  const initialFarm = searchParams.get('farm') || '';
  const initialDateFrom = searchParams.get('dateFrom')
    ? new Date(searchParams.get('dateFrom')!)
    : undefined;
  const initialDateTo = searchParams.get('dateTo')
    ? new Date(searchParams.get('dateTo')!)
    : undefined;

  const [selectedFarmer, setSelectedFarmer] = useState<string>(initialFarmer);
  const [selectedFarm, setSelectedFarm] = useState<string>(initialFarm);
  const [dateFrom, setDateFrom] = useState<Date | undefined>(initialDateFrom);
  const [dateTo, setDateTo] = useState<Date | undefined>(initialDateTo);
  const [summaryGenerated, setSummaryGenerated] = useState(false);

  // Combobox open state
  const [farmerComboboxOpen, setFarmerComboboxOpen] = useState(false);
  const [farmComboboxOpen, setFarmComboboxOpen] = useState(false);

  // Share dialog state
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);

  // Create share mutation
  const createShareMutation = useMutation({
    mutationFn: async () => {
      const params = new URLSearchParams();
      params.append('farm_id', selectedFarm);
      if (dateFrom) params.append('start_date', dateFrom.toISOString());
      if (dateTo) params.append('end_date', dateTo.toISOString());

      const response = await apiClient.post(
        `/summary/share?${params.toString()}`,
      );
      return response.data;
    },
    onSuccess: (data) => {
      const baseUrl = window.location.origin;
      setShareLink(`${baseUrl}/share/summary/${data.token}`);
      setShareDialogOpen(true);
    },
    onError: () => {
      toast.error('Failed to create share link');
    },
  });

  const handleShare = () => {
    createShareMutation.mutate();
  };

  const handleCopyLink = async () => {
    if (shareLink) {
      await navigator.clipboard.writeText(shareLink);
      toast.success('Link copied to clipboard');
    }
  };

  // Fetch my shares
  const { data: sharesData, refetch: refetchShares } = useQuery({
    queryKey: ['my-shares'],
    queryFn: async () => {
      const response = await apiClient.get('/summary/shares?size=50');
      return response.data;
    },
    enabled: shareDialogOpen, // Only fetch when dialog is open
  });

  // Delete share mutation
  const deleteShareMutation = useMutation({
    mutationFn: async (token: string) => {
      await apiClient.delete(`/summary/share/${token}`);
    },
    onSuccess: () => {
      toast.success('Link deleted successfully');
      refetchShares();
    },
    onError: () => {
      toast.error('Failed to delete link');
    },
  });

  // Sync filter state to URL params
  const updateUrlParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      const newUrl = params.toString()
        ? `${pathname}?${params.toString()}`
        : pathname;
      router.replace(newUrl, { scroll: false });
    },
    [pathname, router, searchParams],
  );

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
        `/summary/farm/${selectedFarm}?${params}`,
      );
      return response.data;
    },
    enabled: false,
  });

  // Auto-generate summary if farm is in URL on initial load
  // Auto-generate removed - user must click button manually

  const handleFarmerChange = (value: string) => {
    setSelectedFarmer(value);
    setSelectedFarm('');
    updateUrlParams({ farmer: value, farm: null });
  };

  const handleFarmChange = (value: string) => {
    setSelectedFarm(value);
    updateUrlParams({ farm: value });
  };

  const handleDateFromChange = (date: Date | undefined) => {
    setDateFrom(date);
    updateUrlParams({ dateFrom: date ? date.toISOString() : null });
  };

  const handleDateToChange = (date: Date | undefined) => {
    setDateTo(date);
    updateUrlParams({ dateTo: date ? date.toISOString() : null });
  };

  const handleGenerateSummary = () => {
    const result = summaryFormSchema.safeParse({
      farmId: selectedFarm,
      dateFrom,
      dateTo,
    });

    if (!result.success) {
      return;
    }

    setSummaryGenerated(true);
    refetchSummary();
  };

  // Validate form state
  const formValidation = useMemo(() => {
    return summaryFormSchema.safeParse({
      farmId: selectedFarm,
      dateFrom,
      dateTo,
    });
  }, [selectedFarm, dateFrom, dateTo]);

  const handleReset = () => {
    setSelectedFarmer('');
    setSelectedFarm('');
    setDateFrom(undefined);
    setDateTo(undefined);
    setSummaryGenerated(false);
    router.replace(pathname, { scroll: false });
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
      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Report Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label className="text-xs">Farmer</Label>
              <Popover
                open={farmerComboboxOpen}
                onOpenChange={setFarmerComboboxOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={farmerComboboxOpen}
                    className="w-full justify-between font-normal"
                  >
                    <span className="truncate">
                      {selectedFarmer
                        ? farmersData?.items?.find(
                            (f) => f.id.toString() === selectedFarmer,
                          )?.name || 'Select farmer'
                        : 'Select farmer'}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Search farmer..." />
                    <CommandList>
                      <CommandEmpty>No farmer found.</CommandEmpty>
                      <CommandGroup>
                        {(farmersData?.items || []).map((farmer) => (
                          <CommandItem
                            key={farmer.id}
                            value={farmer.name}
                            onSelect={() => {
                              handleFarmerChange(farmer.id.toString());
                              setFarmerComboboxOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                selectedFarmer === farmer.id.toString()
                                  ? 'opacity-100'
                                  : 'opacity-0',
                              )}
                            />
                            {farmer.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Farm</Label>
              <Popover
                open={farmComboboxOpen}
                onOpenChange={setFarmComboboxOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={farmComboboxOpen}
                    className="w-full justify-between font-normal"
                    disabled={!selectedFarmer}
                  >
                    <span className="truncate">
                      {selectedFarm
                        ? filteredFarms.find(
                            (f) => f.id.toString() === selectedFarm,
                          )?.name || 'Select farm'
                        : 'Select farm'}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Search farm..." />
                    <CommandList>
                      <CommandEmpty>No farm found.</CommandEmpty>
                      <CommandGroup>
                        {filteredFarms.map((farm) => (
                          <CommandItem
                            key={farm.id}
                            value={farm.name}
                            onSelect={() => {
                              handleFarmChange(farm.id.toString());
                              setFarmComboboxOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                selectedFarm === farm.id.toString()
                                  ? 'opacity-100'
                                  : 'opacity-0',
                              )}
                            />
                            {farm.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
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
                    onSelect={handleDateFromChange}
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
                    onSelect={handleDateToChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          {!formValidation.success && selectedFarm && (
            <p className="text-xs text-destructive">
              {formValidation.error.issues.map((i) => i.message).join('. ')}
            </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-2">
            <Button
              onClick={handleGenerateSummary}
              disabled={!formValidation.success || isLoadingSummary}
              className="col-span-1 md:col-span-2"
            >
              {isLoadingSummary ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
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
          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button
              onClick={handleShare}
              variant="outline"
              size="lg"
              disabled={createShareMutation.isPending}
            >
              {createShareMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Share2 className="mr-2 h-4 w-4" />
              )}
              Share
            </Button>
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
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Left: Farm Details - Fixed small width */}
                  <div className="w-full md:w-[300px] shrink-0 space-y-1 text-sm">
                    <div className="flex items-center justify-between py-2.5 border-b">
                      <span className="text-muted-foreground">Farmer</span>
                      <span className="font-medium">
                        {selectedFarmerData?.name || '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2.5 border-b">
                      <span className="text-muted-foreground">Farm</span>
                      <span className="font-medium">
                        {selectedFarmData?.name || '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2.5 border-b">
                      <span className="text-muted-foreground">Location</span>
                      <span className="font-medium">
                        {selectedFarmData?.location || '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-muted-foreground">Period</span>
                      <span className="font-medium">
                        {dateFrom && dateTo
                          ? `${format(dateFrom, 'PP')} - ${format(dateTo, 'PP')}`
                          : 'All Time'}
                      </span>
                    </div>
                  </div>

                  {/* Right: Farm Location Map - Takes remaining space */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-2">
                      Farm Location
                    </p>
                    {selectedFarmData?.latitude &&
                    selectedFarmData?.longitude ? (
                      <div className="rounded-lg overflow-hidden border h-[180px] md:h-[160px]">
                        <MapView
                          latitude={selectedFarmData.latitude}
                          longitude={selectedFarmData.longitude}
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
                            <div
                              className={cn('rounded-lg p-2', config.bgColor)}
                            >
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

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Share Summary Report</DialogTitle>
            <DialogDescription>
              Manage shareable links for farm summary reports.
            </DialogDescription>
          </DialogHeader>

          <Tabs
            defaultValue={shareLink ? 'create' : 'history'}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">Current Link</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="space-y-4 pt-4">
              {shareLink ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Input
                      value={shareLink}
                      readOnly
                      className="flex-1 text-sm bg-muted"
                    />
                    <Button
                      onClick={handleCopyLink}
                      variant="outline"
                      size="icon"
                      className="shrink-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => window.open(shareLink, '_blank')}
                      variant="outline"
                      size="icon"
                      className="shrink-0"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-3 text-sm text-blue-700 dark:text-blue-300">
                    <p>
                      Link generated successfully! This link will expire in 30
                      days. Anyone with this link can view the summary without
                      logging in.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <p>No link generated in this session.</p>
                  <p className="text-xs mt-1">
                    Click "Share" button to generate a new link.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4 pt-4">
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {sharesData?.items?.length > 0 ? (
                  sharesData.items.map((share: any) => (
                    <div
                      key={share.id}
                      className="flex items-center justify-between rounded-lg border p-3 text-sm"
                    >
                      <div className="grid gap-1">
                        <div className="font-medium flex items-center gap-2">
                          {share.farm_name}
                          {!share.is_active &&
                            (share.is_expired ? (
                              <span className="rounded bg-orange-500/10 px-1.5 py-0.5 text-[10px] text-orange-500">
                                Expired
                              </span>
                            ) : (
                              <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-500">
                                Active
                              </span>
                            ))}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Created: {format(new Date(share.created_at), 'PP')} •
                          Expires: {format(new Date(share.expires_at), 'PP')}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            if (!share.is_expired) {
                              navigator.clipboard.writeText(
                                `${window.location.origin}/share/summary/${share.token}`,
                              );
                              toast.success('Link copied');
                            }
                          }}
                          disabled={share.is_expired}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() =>
                            deleteShareMutation.mutate(share.token)
                          }
                          disabled={deleteShareMutation.isPending}
                        >
                          {deleteShareMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    <p>No share history found.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
