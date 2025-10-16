import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Topbar } from "@/components/topbar";
import { cookies } from "next/headers";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar:state")?.value !== "false";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset>
        <div className="flex min-h-screen w-full flex-col overflow-x-hidden rounded-xl shadow-lg">
          <Topbar />
          <main className="flex-1 bg-muted/40 p-3 sm:p-4 md:p-6 lg:p-8 overflow-x-hidden">
            <div className="max-w-[100vw] sm:max-w-none">{children}</div>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
