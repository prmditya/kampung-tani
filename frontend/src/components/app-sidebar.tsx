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
import { Separator } from "./ui/separator";
import Image from "next/image";
import { NavUser } from "./nav-user";
import { useCurrentUser } from "@/hooks/use-auth";

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
  const currentUser = useCurrentUser();

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="border-b px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-emerald-300 to-emerald-500 p-2 rounded-xl shadow-sm">
            <Image
              src="/favicon.webp"
              alt="Kampoeng Tani Logo"
              width={24}
              height={24}
              className="brightness-10 invert"
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
      <Separator />
      <SidebarFooter>
        {currentUser ? (
          <NavUser
            user={{
              name: currentUser.username,
              email: currentUser.email,
            }}
          />
        ) : (
          <NavUser
            user={{
              name: "Guest",
              email: "guest@kampoengtani.com",
            }}
          />
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
