import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import type { Device, DeviceStatusHistory } from '../../hooks/useApiOptimized';

interface DeviceHistoryPanelProps {
  selectedDeviceId: number | null;
  devices: Device[] | null;
  statusHistory: DeviceStatusHistory[] | null;
  loading: boolean;
  formatUptime: (seconds: number | null) => string;
  renderStatusIndicator: (status: string) => React.ReactNode;
}

const DeviceHistoryPanel: React.FC<DeviceHistoryPanelProps> = ({
  selectedDeviceId,
  devices,
  statusHistory,
  loading,
  formatUptime,
  renderStatusIndicator,
}) => {
  const selectedDeviceName = selectedDeviceId
    ? devices?.find((device) => device.id === selectedDeviceId)?.name
    : undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Device Status History</CardTitle>
        <CardDescription>
          {selectedDeviceId
            ? `Status history for device ${selectedDeviceName ?? 'Unknown'}`
            : 'Select a device to view its status history'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {selectedDeviceId ? (
            <div className="space-y-2">
              {loading ? (
                <div className="text-center py-4 text-muted-foreground">Loading history...</div>
              ) : statusHistory && statusHistory.length > 0 ? (
                statusHistory.map((entry, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-slate-800"
                  >
                    <div className="flex items-center space-x-3">
                      {renderStatusIndicator(entry.status)}
                      <div>
                        <div className="text-sm">Uptime: {formatUptime(entry.uptime_seconds)}</div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {entry.created_at ? new Date(entry.created_at).toLocaleString() : 'Unknown'}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  No status history available for this device.
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              Select a device from the Device List tab to view its status history.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DeviceHistoryPanel;
