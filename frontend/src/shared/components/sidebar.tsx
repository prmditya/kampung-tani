import { Moon, Sun } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useState } from "react";
import {
	MdBarChart,
	MdDashboard,
	MdDevices,
	MdLogout,
	MdPerson,
	MdSettings,
} from "react-icons/md";
import { useAuth } from "../hooks/useAuth";
import { cn } from "../lib/utils";

interface SidebarProps {
	className?: string;
	onClose?: () => void;
}

const navigation = [
	{
		name: "Dashboard",
		href: "/dashboard",
		icon: MdDashboard,
		description: "Real-time sensor values",
		color: "emerald",
	},
	{
		name: "Historical Data",
		href: "/table",
		icon: MdBarChart,
		description: "Data history & analysis",
		color: "blue",
	},
	{
		name: "Device Status",
		href: "/devices",
		icon: MdDevices,
		description: "Device monitoring",
		color: "orange",
	},
];

export function Sidebar({ className, onClose }: SidebarProps) {
	const pathname = usePathname();
	const { user, logout } = useAuth();
	const { setTheme, theme } = useTheme();
	const [showUserMenu, setShowUserMenu] = useState(false);

	const getColorClasses = (_color: string, isActive: boolean) => {
		const colorMap = {
			emerald: {
				active:
					"bg-emerald-50 dark:bg-emerald-900/20 border-r-2 border-emerald-600 text-emerald-700 dark:text-emerald-400",
				iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
				iconColor: "text-emerald-600 dark:text-emerald-400",
			},
		};

		return isActive ? colorMap.emerald : null;
	};

	return (
		<div
			className={cn(
				"flex h-full w-64 flex-col bg-card border-r border-border",
				className,
			)}
		>
			{/* Logo and Brand */}
			<div className="hidden sm:flex h-16 shrink-0 items-center justify-between border-b border-border px-4 sm:px-6">
				<div className="flex items-center space-x-3">
					<div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-2.5 shadow-lg">
						<Image
							src="/assets/kt-logo-sm.webp"
							alt="Kampung Tani"
							width={20}
							height={20}
							sizes="20px"
							className="h-5 w-5 object-contain filter brightness-0 invert"
						/>
					</div>
					<div className="ml-3">
						<h1 className="text-lg font-bold text-gray-900 dark:text-white">
							Kampoeng Tani
						</h1>
						<p className="text-xs text-gray-500 dark:text-gray-400 -mt-0.5">
							IoT Monitoring
						</p>
					</div>
				</div>
			</div>

			{/* Navigation */}
			<nav className="flex-1 space-y-1 px-3 py-6">
				<div className="space-y-1">
					{navigation.map((item) => {
						const isActive = pathname === item.href;
						const colorClasses = getColorClasses(item.color, isActive);
						return (
							<Link
								key={item.name}
								href={item.href}
								onClick={onClose} // Close sidebar on mobile when link is clicked
								className={cn(
									isActive
										? colorClasses?.active
										: "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
									"group flex items-center px-2 sm:px-3 py-3 text-sm font-medium rounded-l-lg transition-all hover:shadow-sm",
								)}
							>
								<div
									className={cn(
										isActive
											? colorClasses?.iconBg
											: "bg-muted group-hover:bg-muted/80",
										"rounded-lg p-2 mr-3 transition-colors",
									)}
								>
									<item.icon
										className={cn(
											isActive
												? colorClasses?.iconColor
												: "text-muted-foreground group-hover:text-foreground",
											"flex-shrink-0 h-5 w-5",
										)}
									/>
								</div>
								<div className="flex-1 min-w-0 hidden sm:block">
									<div className="font-medium">{item.name}</div>
									{item.description && (
										<div className="text-xs text-muted-foreground truncate">
											{item.description}
										</div>
									)}
								</div>
								{/* Mobile-only: Show just the name */}
								<div className="sm:hidden">
									<div className="font-medium text-xs">{item.name}</div>
								</div>
							</Link>
						);
					})}
				</div>
			</nav>

			{/* Profile Section */}
			<div className="border-t border-border px-3 py-4">
				<div className="relative">
					<button
						type="button"
						onClick={() => setShowUserMenu(!showUserMenu)}
						className="w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors"
					>
						<div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-full p-2">
							<MdPerson className="h-4 w-4 text-white" />
						</div>
						<div className="flex-1 text-left hidden sm:block">
							<div className="font-medium text-foreground">
								{user?.username || "Admin User"}
							</div>
							<div className="text-xs text-muted-foreground">
								{user?.email || "admin@kampungtani.com"}
							</div>
						</div>
					</button>

					{/* User Menu Popup */}
					{showUserMenu && (
						<div className="absolute bottom-full left-0 right-0 mb-2 bg-popover border border-border rounded-lg shadow-lg py-1 z-50">
							<button
								type="button"
								onClick={() => {
									setShowUserMenu(false);
									// Add settings handler here
								}}
								className="w-full flex items-center space-x-3 px-3 py-2 text-sm hover:bg-accent transition-colors"
							>
								<MdSettings className="h-4 w-4" />
								<span className="hidden sm:block">Settings</span>
							</button>
							<button
								type="button"
								onClick={() => {
									setTheme(theme === "light" ? "dark" : "light");
									setShowUserMenu(false);
								}}
								className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-accent transition-colors"
							>
								<div className="flex items-center space-x-3">
									<div className="h-4 w-4 relative">
										<Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
										<Moon className="absolute top-0 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
									</div>
									<span className="hidden sm:block">Theme</span>
								</div>
							</button>
							<div className="border-t border-border my-1"></div>
							<button
								type="button"
								onClick={() => {
									logout();
									setShowUserMenu(false);
								}}
								className="w-full flex items-center space-x-3 px-3 py-2 text-sm hover:bg-accent text-destructive transition-colors"
							>
								<MdLogout className="h-4 w-4" />
								<span className="hidden sm:block">Logout</span>
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
