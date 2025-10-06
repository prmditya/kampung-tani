import React from "react";
import { Badge } from "./badge";
import { getDeviceStatusTheme, getRelativeTime } from "@/shared/lib/helpers";
import { UI_CONSTANTS } from "@/shared/lib/constants";
import type { DeviceStatusType } from "@/shared/lib/constants";

interface DeviceStatusIndicatorProps {
  status: DeviceStatusType;
  lastSeen?: string;
  showLastSeen?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "px-2 py-1 text-xs",
  md: "px-3 py-1 text-sm",
  lg: "px-4 py-2 text-base",
};

export function DeviceStatusIndicator({
  status,
  lastSeen,
  showLastSeen = true,
  size = "md",
  className = "",
}: DeviceStatusIndicatorProps) {
  const theme = getDeviceStatusTheme(status);

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Badge
        className={`
        ${theme.bg} ${sizeClasses[size]}
        ${UI_CONSTANTS.BORDERS.RADIUS.DEFAULT}
        ${UI_CONSTANTS.ANIMATION.TRANSITION}
        flex items-center space-x-1
      `}
      >
        {/* Status Pulse Indicator */}
        <div className="relative">
          <div className={`w-2 h-2 rounded-full ${theme.pulse}`} />
          {status === "online" && (
            <div
              className={`
              absolute inset-0 w-2 h-2 rounded-full ${theme.pulse} 
              ${UI_CONSTANTS.ANIMATION.PULSE} opacity-75
            `}
            />
          )}
        </div>

        <span className="capitalize font-medium">{status}</span>
      </Badge>

      {showLastSeen && lastSeen && (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {getRelativeTime(lastSeen)}
        </span>
      )}
    </div>
  );
}
