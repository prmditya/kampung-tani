import React from "react";
import { UI_CONSTANTS } from "@/shared/lib/constants";

interface LoadingSpinnerProps {
	size?: "sm" | "md" | "lg";
	className?: string;
	text?: string;
}

const sizeClasses = {
	sm: "w-4 h-4",
	md: "w-6 h-6",
	lg: "w-8 h-8",
};

export function LoadingSpinner({
	size = "md",
	className = "",
	text,
}: LoadingSpinnerProps) {
	return (
		<div
			className={`flex flex-col items-center justify-center space-x-2 ${className}`}
		>
			<div
				className={`
        ${sizeClasses[size]} border-2 border-gray-300 dark:border-gray-600 
        border-t-emerald-600 dark:border-t-emerald-400 rounded-full 
        ${UI_CONSTANTS.ANIMATION.SPIN}
      `}
			/>
			{text && (
				<span className="text-sm text-gray-600 dark:text-gray-400">{text}</span>
			)}
		</div>
	);
}
