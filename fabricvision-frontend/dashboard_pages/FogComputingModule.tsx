// Dashboard view
"use client";

import TopBar from "@/components/Fog/TopBar";
import AIAnalysisCard from "@/components/Fog/AIAnalysisCard";
import PerformanceCard from "@/components/Fog/PerformanceCard";
import FPSChart from "@/components/Fog/FPSChart";
import QualityRiskChart from "@/components/Fog/QualityRiskChart";
import AlertsPanel from "@/components/Fog/AlertsPanel";
import HistoryTable from "@/components/Fog/HistoryTable";

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
