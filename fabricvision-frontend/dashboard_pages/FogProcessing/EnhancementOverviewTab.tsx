"use client";

import AIAnalysisCard from "./AIAnalysisCard";
import PerformanceCard from "./PerformanceCard";
import FPSChart from "./FPSChart";
import QualityRiskChart from "./QualityRiskChart";
import AlertsPanel from "./AlertsPanel";
import HistoryTable from "./HistoryTable";

/**
 * Enhancement Overview Tab
 * -------------------------
 * This page composes all Fog Processing UI components
 * into a single operator-facing overview screen.
 */
export default function EnhancementOverviewTab() {
  return (
    <div className="space-y-6">
      {/* ROW 1: AI Enhancement + Performance */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <AIAnalysisCard />
        <PerformanceCard />
      </div>

      {/* ROW 2: FPS + Quality vs Risk */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <FPSChart />
        <QualityRiskChart />
      </div>

      {/* ROW 3: Alerts + History */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <AlertsPanel />
        <HistoryTable />
      </div>
    </div>
  );
}
