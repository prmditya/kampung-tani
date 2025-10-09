import React from "react";
import type { SensorType } from "@/shared/lib/constants";
import { getSensorCardTheme } from "@/shared/lib/helpers";

interface TextIconProps {
	text: string;
	sensorType?: SensorType;
	size?: "sm" | "md" | "lg";
	className?: string;
}

const sizeClasses = {
	sm: "text-xs w-6 h-6",
	md: "text-sm w-8 h-8",
	lg: "text-base w-10 h-10",
};

export function TextIcon({
	text,
	sensorType,
	size = "md",
	className = "",
}: TextIconProps) {
	const theme = sensorType ? getSensorCardTheme(sensorType) : null;
	const baseClasses = `inline-flex items-center justify-center font-bold text-white rounded-full ${sizeClasses[size]}`;
	const bgClass = theme?.icon || "bg-gray-500";

	return <div className={`${baseClasses} ${bgClass} ${className}`}>{text}</div>;
}
