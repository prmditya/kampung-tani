import Image from "next/image";
import { ReactNode, useState } from "react";
import { MdMenu } from "react-icons/md";
import { cn } from "../lib/utils";
import { Sidebar } from "./sidebar";
import { Button } from "./ui/button";

interface DashboardLayoutProps {
  children: ReactNode;
  className?: string;
}

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Hidden on mobile, shown on desktop */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile App Style Header */}
        <header className="lg:hidden relative">
          {/* Main Header */}
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 px-4 py-3 shadow-lg">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="p-3 rounded-2xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 active:scale-95 shadow-sm"
              >
                <MdMenu className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              </Button>
              <div className="flex items-center">
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
              <div className="w-12"></div> {/* Spacer untuk balance */}
            </div>
          </div>
        </header>

        {/* Main content with scroll */}
        <main
          className={cn(
            "flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 bg-background",
            className
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
