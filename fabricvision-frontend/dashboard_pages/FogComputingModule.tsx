// Dashboard view
"use client";

import TopBar from "@/dashboard_pages/FogProcessing/TopBar";
import AIAnalysisCard from "@/dashboard_pages/FogProcessing/AIAnalysisCard";
import PerformanceCard from "@/dashboard_pages/FogProcessing/PerformanceCard";
import FPSChart from "@/dashboard_pages/FogProcessing/FPSChart";
import QualityRiskChart from "@/dashboard_pages/FogProcessing/QualityRiskChart";
import AlertsPanel from "@/dashboard_pages/FogProcessing/AlertsPanel";
import HistoryTable from "@/dashboard_pages/FogProcessing/HistoryTable";

export default function FogComputingModule() {
  return (
    <div className="min-h-screen bg-slate-100 p-6 space-y-6">
      {/* Top Bar */}
      <TopBar />

      {/* AI Analysis + Performance */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <AIAnalysisCard />
        <PerformanceCard />
      </div>

      {/* Charts + Distribution */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <FPSChart />
        <QualityRiskChart />
      </div>

      {/* Alerts + History */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <AlertsPanel />
        <HistoryTable />
      </div>
    </div>
  );
}
