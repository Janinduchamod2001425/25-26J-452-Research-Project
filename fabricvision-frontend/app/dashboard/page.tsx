import { Suspense } from "react";
import DashboardPage from "@/app/dashboard/DashboardPage";

export default function Dashboard() {
  return (
    <Suspense>
      <DashboardPage />
    </Suspense>
  );
}
