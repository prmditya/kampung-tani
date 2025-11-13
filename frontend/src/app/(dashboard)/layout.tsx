import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { Topbar } from '@/components/layout/topbar';
import { cookies } from 'next/headers';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar:state')?.value !== 'false';

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset className="overflow-hidden">
        <div className="flex h-screen w-full flex-col overflow-hidden md:h-[calc(100vh-1rem)] md:rounded-xl md:border">
          <Topbar />
          <main className="flex-1 bg-muted/40 p-3 sm:p-4 md:p-6 lg:p-8 overflow-y-auto scrollbar-hide">
            <div className="max-w-[100vw] sm:max-w-none">{children}</div>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
