import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Circle } from 'lucide-react';

interface DeviceStatusChange {
  id: number;
  gateway_id: number;
  status: string;
  created_at: string;
  uptime_seconds: number | null;
  gateway: {
    id: number;
    gateway_uid: string;
    name: string | null;
  };
}

interface RecentActivityProps {
  statusChanges: DeviceStatusChange[];
}

export function RecentActivity({ statusChanges }: RecentActivityProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'online':
        return 'default';
      case 'offline':
        return 'secondary';
      case 'maintenance':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'text-green-500';
      case 'offline':
        return 'text-gray-500';
      case 'maintenance':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  // Format seconds to compact duration format (5m, 1h5m, 2d3h)
  const formatSecondsToCompact = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      const remainingHours = hours % 24;
      return remainingHours > 0 ? `${days}d${remainingHours}h` : `${days}d`;
    }

    if (hours > 0) {
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0
        ? `${hours}h${remainingMinutes}m`
        : `${hours}h`;
    }

    if (minutes > 0) {
      return `${minutes}m`;
    }

    return `${totalSeconds}s`;
  };

  // Get duration display for a status change
  const getStatusDuration = (change: DeviceStatusChange) => {
    if (change.status === 'online' && change.uptime_seconds) {
      // For online status, use uptime_seconds from #SYS_UPTIME
      return formatSecondsToCompact(change.uptime_seconds);
    } else {
      // For offline/maintenance, calculate time since status changed
      const now = new Date();
      const past = new Date(change.created_at);
      const diffSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
      return formatSecondsToCompact(diffSeconds);
    }
  };

  // Get only the latest status for each gateway
  const getLatestStatusPerGateway = () => {
    const gatewayMap = new Map<number, DeviceStatusChange>();

    statusChanges.forEach((change) => {
      const existing = gatewayMap.get(change.gateway_id);
      if (
        !existing ||
        new Date(change.created_at) > new Date(existing.created_at)
      ) {
        gatewayMap.set(change.gateway_id, change);
      }
    });

    return Array.from(gatewayMap.values())
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      .slice(0, 5);
  };

  const latestStatuses = getLatestStatusPerGateway();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Device Status
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-y-auto h-[220px] scrollbar-hide">
        <div className="space-y-4">
          {latestStatuses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No recent status changes
            </p>
          ) : (
            latestStatuses.map((change) => (
              <div
                key={change.id}
                className="flex gap-3 pb-4 border-b last:border-0 last:pb-0"
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg bg-muted shrink-0 ${getStatusColor(change.status)}`}
                >
                  <Circle className="h-3 w-3 fill-current" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {change.gateway.name || change.gateway.gateway_uid}
                  </p>
                  <p className="text-xs text-muted-foreground truncate capitalize">
                    {change.status} {getStatusDuration(change)}
                  </p>
                </div>
                <Badge
                  variant={getStatusVariant(change.status)}
                  className="text-xs shrink-0 capitalize"
                >
                  {change.status}
                </Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
