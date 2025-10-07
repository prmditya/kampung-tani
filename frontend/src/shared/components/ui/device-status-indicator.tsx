import React from "react";
import { getDeviceStatusTheme, getRelativeTime } from "@/shared/lib/helpers";
import { UI_CONSTANTS } from "@/shared/lib/constants";
import type { DeviceStatusType } from "@/shared/lib/constants";
import { MdWifi, MdWifiOff, MdRestartAlt } from "react-icons/md";

interface DeviceStatusIndicatorProps {
  status: DeviceStatusType;
  lastSeen?: string;
  showLastSeen?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function DeviceStatusIndicator({
  status,
  lastSeen,
  showLastSeen = true,
  size = "md",
  className = "",
}: DeviceStatusIndicatorProps) {
  const theme = getDeviceStatusTheme(status);

  // Icon mapping for different statuses
  const getStatusIcon = () => {
    switch (status) {
      case "online":
        return MdWifi;
      case "offline":
        return MdWifiOff;
      case "restarted":
        return MdRestartAlt;
      default:
        return MdWifi;
    }
  };

  const StatusIcon = getStatusIcon();

  // Size variants for better design
  const sizeVariants = {
    sm: {
      badge: "px-2.5 py-1 text-xs",
      icon: "w-3 h-3",
    },
    md: {
      badge: "px-3 py-1.5 text-sm",
      icon: "w-4 h-4",
    },
    lg: {
      badge: "px-4 py-2 text-base",
      icon: "w-5 h-5",
    },
  };

  const currentSize = sizeVariants[size];

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div
        className={`
          inline-flex items-center gap-2 ${currentSize.badge}
          ${theme.bg} border
          ${UI_CONSTANTS.BORDERS.RADIUS.DEFAULT}
          ${UI_CONSTANTS.ANIMATION.TRANSITION}
          hover:shadow-sm font-medium
        `}
      >
        {/* Status Icon */}
        <div className="flex items-center justify-center">
          <StatusIcon className={`${currentSize.icon}`} />
        </div>

        <span className="capitalize font-semibold tracking-wide">{status}</span>
      </div>

      {showLastSeen && lastSeen && (
        <span className="text-xs text-muted-foreground font-medium">
          {getRelativeTime(lastSeen)}
        </span>
      )}
    </div>
  );
}
