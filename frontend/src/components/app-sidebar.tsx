"use client";

import {
	Unplug,
	LayoutDashboard,
	HardDrive,
	Tractor,
	Settings,
	Database,
	Sprout,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarHeader,
} from "@/components/ui/sidebar";

// Menu items.
const items = [
	{
		title: "Dashboard",
		url: "/dashboard",
		icon: LayoutDashboard,
	},
	{
		title: "Devices",
		url: "/dashboard/devices",
		icon: HardDrive,
	},
	{
		title: "Assignments",
		url: "/dashboard/assignments",
		icon: Unplug,
	},
	{
		title: "Farmers",
		url: "/dashboard/farmers",
		icon: Tractor,
	},
	{
		title: "Data",
		url: "/dashboard/data",
		icon: Database,
	},
	{
		title: "Settings",
		url: "/dashboard/settings",
		icon: Settings,
	},
];

export function AppSidebar() {
	const pathname = usePathname();

	return (
		<Sidebar>
			<SidebarHeader className="border-b px-6 py-4">
				<div className="flex items-center gap-2">
					<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
						<Sprout className="h-5 w-5" />
					</div>
					<div className="flex flex-col">
						<span className="text-sm font-semibold">Kampoeng Tani</span>
						<span className="text-xs text-muted-foreground">
							Admin Dashboard
						</span>
					</div>
				</div>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{items.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild isActive={pathname === item.url}>
										<Link href={item.url}>
											<item.icon />
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
