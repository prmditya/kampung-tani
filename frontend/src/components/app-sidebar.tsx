"use client";

import {
  Unplug,
  LayoutDashboard,
  HardDrive,
  Tractor,
  Settings,
  Database,
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
  SidebarFooter,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { NavUser } from "./nav-user";

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
];

const secondaryItems = [
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="border-b px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-100  p-2 rounded-lg shadow-sm">
            <Image
              src="/favicon.webp"
              alt="Kampoeng Tani Logo"
              width={24}
              height={24}
            />
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
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className={
                      pathname === item.url ? "bg-muted hover:bg-muted/80" : ""
                    }
                  >
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
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className={
                      pathname === item.url ? "bg-muted hover:bg-muted/80" : ""
                    }
                  >
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
      <SidebarFooter>
        <NavUser
          user={{
            name: "Admin",
            email: "admin@kampoengtani.com",
            avatar: "/path/to/avatar.jpg",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
