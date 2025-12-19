import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Circle } from 'lucide-react';
import { GatewayResponse } from '@/types/api';
import { formatDistanceToNow } from 'date-fns';

interface DeviceStatusWidgetProps {
  className?: string;
  gateways: GatewayResponse[];
}

export function DeviceStatusWidget({
  className,
  gateways,
}: DeviceStatusWidgetProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'online':
        return 'default';
      case 'offline':
        return 'destructive';
      case 'maintenance':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'text-primary';
      case 'offline':
        return 'text-destructive';
      case 'maintenance':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  const getLastSeenText = (lastSeen: string | null) => {
    if (!lastSeen) return 'Never seen';
    try {
      return formatDistanceToNow(new Date(lastSeen), { addSuffix: true });
    } catch (e) {
      return 'Unknown';
    }
  };

  // Sort: Online first, then by last seen
  const sortedGateways = [...gateways].sort((a, b) => {
    if (a.status === 'online' && b.status !== 'online') return -1;
    if (a.status !== 'online' && b.status === 'online') return 1;

    // If status is same, sort by last_seen (recent first)
    const dateA = a.last_seen ? new Date(a.last_seen).getTime() : 0;
    const dateB = b.last_seen ? new Date(b.last_seen).getTime() : 0;
    return dateB - dateA;
  });

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Device Status
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-y-auto min-h-[300px] scrollbar-hide">
        <div className="space-y-4">
          {sortedGateways.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No devices found
            </p>
          ) : (
            sortedGateways.map((gateway) => (
              <div
                key={gateway.id}
                className="flex gap-3 pb-4 border-b last:border-0 last:pb-0"
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg bg-muted shrink-0 ${getStatusColor(gateway.status)}`}
                >
                  <Circle className="h-3 w-3 fill-current " />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {gateway.name || gateway.gateway_uid}
                  </p>
                  <p className="text-xs text-muted-foreground truncate capitalize">
                    {gateway.status === 'online'
                      ? 'Connected'
                      : `${getLastSeenText(gateway.last_seen)}`}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge
                    variant={getStatusVariant(gateway.status)}
                    className="text-xs shrink-0 capitalize"
                  >
                    {gateway.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
