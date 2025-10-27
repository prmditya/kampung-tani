'use client';
import {
  Unplug,
  LayoutDashboard,
  HardDrive,
  Tractor,
  Settings,
  Database,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { Separator } from './ui/separator';
import Image from 'next/image';
import { NavUser } from './nav-user';
import { useCurrentUser } from '@/features/auth/hooks/use-auth';

// Menu items.
const items = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
    description: 'Overview & analytics',
  },
  {
    title: 'Devices',
    url: '/dashboard/devices',
    icon: HardDrive,
    description: 'Gateway management',
  },
  {
    title: 'Assignments',
    url: '/dashboard/assignments',
    icon: Unplug,
    description: 'Gateway to farm',
  },
  {
    title: 'Farmers',
    url: '/dashboard/farmers',
    icon: Tractor,
    description: 'Farmers & farms',
  },
  {
    title: 'Data',
    url: '/dashboard/data',
    icon: Database,
    description: 'Sensor readings',
  },
];

const secondaryItems = [
  {
    title: 'Settings',
    url: '/dashboard/settings',
    icon: Settings,
    description: 'System config',
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
          <SidebarGroupLabel className="pl-0">
            Main Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className={`h-auto px-2 py-1 ${
                      pathname === item.url ? 'bg-primary/10' : ''
                    }`}
                  >
                    <Link href={item.url} className="flex flex-row gap-1 ">
                      <item.icon
                        className={`h-5 w-5 ${pathname === item.url ? 'text-primary' : 'text-muted-foreground'}`}
                      />
                      <span
                        className={`font-medium ${pathname === item.url ? 'text-primary' : ''}`}
                      >
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel className="pl-0">Other</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {secondaryItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className={`h-auto  px-2 py-1 ${
                      pathname === item.url ? 'bg-primary/10 ' : ''
                    }`}
                  >
                    <Link href={item.url} className="flex flex-row gap-1 ">
                      <item.icon
                        className={`h-5 w-5 ${pathname === item.url ? 'text-primary' : 'text-muted-foreground'}`}
                      />
                      <span
                        className={`font-medium ${pathname === item.url ? 'text-primary' : ''}`}
                      >
                        {item.title}
                      </span>
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
        <NavUser
          user={{
            name: currentUser?.username || 'User',
            email: currentUser?.email || 'user@kampoengtani.com',
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
