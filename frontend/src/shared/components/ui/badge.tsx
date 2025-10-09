import type * as React from "react";
import { cn } from "../../lib/utils";

// Badge variant styles
const getBadgeVariantStyles = (variant: BadgeVariant = "default"): string => {
	const baseStyles =
		"inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

	const variantStyles = {
		default: "border-transparent bg-blue-500 text-white hover:bg-blue-600",
		secondary: "border-transparent bg-gray-500 text-white hover:bg-gray-600",
		destructive: "border-transparent bg-red-500 text-white hover:bg-red-600",
		outline: "border-gray-300 text-gray-700 hover:bg-gray-100",
	};

	return cn(baseStyles, variantStyles[variant]);
};

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
	variant?: BadgeVariant;
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
	return (
		<div className={cn(getBadgeVariantStyles(variant), className)} {...props} />
	);
}

export { Badge };
