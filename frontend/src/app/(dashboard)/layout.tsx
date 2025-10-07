"use client";

import { DashboardLayout } from "@/shared/components/dashboard-layout";
import { withAuth } from "@/shared/hooks/useAuth";

function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}

export default withAuth(DashboardGroupLayout);
