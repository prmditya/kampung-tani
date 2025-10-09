import * as React from "react";

// Simple utility function untuk combine classes
const cn = (...classes: (string | undefined | null | false)[]): string => {
	return classes.filter(Boolean).join(" ");
};

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
	defaultValue?: string;
	value?: string;
	onValueChange?: (value: string) => void;
}

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {}

interface TabsTriggerProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	value: string;
}

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
	value: string;
}

const TabsContext = React.createContext<{
	value: string;
	onValueChange: (value: string) => void;
}>({
	value: "",
	onValueChange: () => {},
});

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
	(
		{ className, defaultValue = "", value, onValueChange, children, ...props },
		ref,
	) => {
		const [internalValue, setInternalValue] = React.useState(defaultValue);
		const currentValue = value !== undefined ? value : internalValue;
		const handleValueChange = onValueChange || setInternalValue;

		return (
			<TabsContext.Provider
				value={{ value: currentValue, onValueChange: handleValueChange }}
			>
				<div ref={ref} className={cn("w-full", className)} {...props}>
					{children}
				</div>
			</TabsContext.Provider>
		);
	},
);
Tabs.displayName = "Tabs";

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
	({ className, ...props }, ref) => (
		<div
			ref={ref}
			className={cn(
				"inline-flex h-10 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800 p-1 text-slate-500 dark:text-slate-400",
				className,
			)}
			{...props}
		/>
	),
);
TabsList.displayName = "TabsList";

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
	({ className, value: triggerValue, children, ...props }, ref) => {
		const { value, onValueChange } = React.useContext(TabsContext);
		const isActive = value === triggerValue;

		return (
			<button
				ref={ref}
				className={cn(
					"inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
					isActive
						? "bg-white dark:bg-slate-950 text-slate-950 dark:text-slate-50 shadow-sm"
						: "hover:bg-slate-200 dark:hover:bg-slate-700",
					className,
				)}
				onClick={() => onValueChange(triggerValue)}
				{...props}
			>
				{children}
			</button>
		);
	},
);
TabsTrigger.displayName = "TabsTrigger";

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
	({ className, value: contentValue, ...props }, ref) => {
		const { value } = React.useContext(TabsContext);

		if (value !== contentValue) {
			return null;
		}

		return (
			<div
				ref={ref}
				className={cn(
					"mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2",
					className,
				)}
				{...props}
			/>
		);
	},
);
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
