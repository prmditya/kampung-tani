import React from "react";
import { Card } from "./card";
import { getStatsCardTheme } from "@/shared/lib/helpers";
import { UI_CONSTANTS } from "@/shared/lib/constants";
import type { StatsCardType } from "@/shared/lib/constants";

interface StatsCardProps {
  type: StatsCardType;
  title: string;
  value: number | string;
  icon: React.ReactNode;
  subtitle?: string;
  className?: string;
}

export function StatsCard({
  type,
  title,
  value,
  icon,
  subtitle,
  className = "",
}: StatsCardProps) {
  const theme = getStatsCardTheme(type);

  return (
    <Card
      className={`
      p-6 border-2 ${theme.bg} ${theme.border}
      ${UI_CONSTANTS.BORDERS.RADIUS.DEFAULT}
      ${UI_CONSTANTS.SHADOWS.CARD} ${UI_CONSTANTS.ANIMATION.TRANSITION}
      ${UI_CONSTANTS.ANIMATION.HOVER_SCALE}
      ${className}
    `}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium ${theme.text}`}>{title}</p>
          <p className={`text-3xl font-bold ${theme.value}`}>{value}</p>
          {subtitle && (
            <p className={`text-xs ${theme.text} opacity-80 mt-1`}>
              {subtitle}
            </p>
          )}
        </div>

        <div
          className={`
          p-3 rounded-full ${theme.icon} text-white
          ${UI_CONSTANTS.BORDERS.RADIUS.FULL}
        `}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}
