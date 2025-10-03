import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { MdBarChart, MdDashboard, MdDevices } from "react-icons/md";
import { cn } from "../lib/utils";
import { ModeToggle } from "./mode-toggle";
import { UserMenu } from "./user-menu";

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
  },
  {
    name: "Historical Data",
    href: "/table",
    icon: MdBarChart,
    description: "Data history & analysis",
  },
  {
    name: "Device Status",
    href: "/devices",
    icon: MdDevices,
    description: "Device monitoring",
  },
];

export function Sidebar({ className, onClose }: SidebarProps) {
  const router = useRouter();

  return (
    <div
      className={cn(
        "flex h-full w-64 flex-col bg-card border-r border-border",
        className
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
            const isActive = router.pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose} // Close sidebar on mobile when link is clicked
                className={cn(
                  isActive
                    ? "bg-emerald-50 dark:bg-emerald-900/20 border-r-2 border-emerald-600 text-emerald-700 dark:text-emerald-400"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  "group flex items-center px-2 sm:px-3 py-3 text-sm font-medium rounded-l-lg transition-all hover:shadow-sm"
                )}
              >
                <div
                  className={cn(
                    isActive
                      ? "bg-emerald-100 dark:bg-emerald-900/30"
                      : "bg-muted group-hover:bg-muted/80",
                    "rounded-lg p-2 mr-3 transition-colors"
                  )}
                >
                  <item.icon
                    className={cn(
                      isActive
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-muted-foreground group-hover:text-foreground",
                      "flex-shrink-0 h-5 w-5"
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

      {/* Bottom Section */}
      <div className="border-t border-gray-200 dark:border-gray-700 px-3 py-4">
        <div className="flex items-center justify-between">
          <UserMenu />
          <ModeToggle />
        </div>
      </div>
    </div>
  );
}
