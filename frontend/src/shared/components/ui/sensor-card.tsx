import React from "react";
import { Card } from "./card";
import { TextIcon } from "./text-icon";
import {
  formatSensorValue,
  getSensorCardTheme,
  getSensorStatus,
  getSensorDescription,
} from "@/shared/lib/helpers";
import { UI_CONSTANTS, SENSOR_CONFIG } from "@/shared/lib/constants";
import type { SensorType } from "@/shared/lib/constants";

interface SensorCardProps {
  sensorType: SensorType;
  value: number;
  title: string;
  iconText?: string;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

export function SensorCard({
  sensorType,
  value,
  title,
  iconText,
  icon,
  className = "",
}: SensorCardProps) {
  const theme = getSensorCardTheme(sensorType);
  const status = getSensorStatus(sensorType, value);
  const formattedValue = formatSensorValue(sensorType, value);
  const description = getSensorDescription(sensorType);
  const normalRange = SENSOR_CONFIG.NORMAL_RANGES[sensorType];

  // Get the normal range text
  const getNormalRangeText = () => {
    if (!normalRange) return "";
    if (sensorType === "ph") {
      return `Normal: ${normalRange.min} - ${normalRange.max}`;
    }
    return `Normal: ${normalRange.min} - ${normalRange.max}${
      SENSOR_CONFIG.UNITS[sensorType] || ""
    }`;
  };

  // Get status indicator text and color
  const getStatusInfo = () => {
    switch (status) {
      case "normal":
        return { text: "NORMAL", color: "text-green-600" };
      case "warning":
        return { text: "WARNING", color: "text-yellow-600" };
      case "critical":
        return { text: "CRITICAL", color: "text-red-600" };
      default:
        return { text: "UNKNOWN", color: "text-gray-600" };
    }
  };

  // Render icon based on what's provided
  const renderIcon = () => {
    if (iconText) {
      return (
        <div
          className={`w-12 h-12 rounded-xl ${theme.icon} flex items-center justify-center`}
        >
          <span className="text-white font-bold text-lg">{iconText}</span>
        </div>
      );
    } else if (icon) {
      const IconComponent = icon;
      return (
        <div
          className={`w-12 h-12 rounded-xl ${theme.icon} flex items-center justify-center`}
        >
          <IconComponent className="w-6 h-6 text-white" />
        </div>
      );
    } else {
      // Fallback to first letter
      return (
        <div
          className={`w-12 h-12 rounded-xl ${theme.icon} flex items-center justify-center`}
        >
          <span className="text-white font-bold text-lg">
            {sensorType.charAt(0).toUpperCase()}
          </span>
        </div>
      );
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Card
      className={`
        relative p-6 ${theme.bg} border border-border/50
        ${UI_CONSTANTS.BORDERS.RADIUS.DEFAULT}
        ${UI_CONSTANTS.SHADOWS.CARD} ${UI_CONSTANTS.ANIMATION.TRANSITION}
        hover:shadow-lg hover:border-border hover:scale-105
        ${className}
      `}
    >
      <div className="space-y-4">
        {/* Header with icon and title */}
        <div className="flex items-center justify-between">
          {renderIcon()}
          <div
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              status === "normal"
                ? "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200"
                : status === "warning"
                ? "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200"
                : "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200"
            }`}
          >
            {statusInfo.text}
          </div>
        </div>

        {/* Sensor name */}
        <h3 className="text-foreground font-semibold text-lg">{title}</h3>

        {/* Value */}
        <div className="space-y-1">
          <p className="text-3xl font-bold text-foreground">{formattedValue}</p>
          <p className="text-muted-foreground dark:text-slate-300 text-sm">
            {description}
          </p>
          <p className="text-muted-foreground dark:text-slate-300 text-xs">
            {getNormalRangeText()}
          </p>
        </div>
      </div>
    </Card>
  );
}
