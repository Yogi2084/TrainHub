import type { PropsWithChildren } from "react";
import DashboardLayout from "@/components/dashboard/ClientDashboardLayout";

export default function Layout({ children }: PropsWithChildren) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
