"use client";

import { useState } from "react";

import TopBar from "@/dashboard_pages/FogProcessing/TopBar";
import AIAnalysisCard from "@/dashboard_pages/FogProcessing/AIAnalysisCard";
import PerformanceCard from "@/dashboard_pages/FogProcessing/PerformanceCard";
import FPSChart from "@/dashboard_pages/FogProcessing/FPSChart";
import QualityRiskChart from "@/dashboard_pages/FogProcessing/QualityRiskChart";
import AlertsPanel from "@/dashboard_pages/FogProcessing/AlertsPanel";
import HistoryTable from "@/dashboard_pages/FogProcessing/HistoryTable";

// 👉 NEW TAB CONTENT
import QualityAnalyticsTab from "@/dashboard_pages/FogProcessing/QualityAnalyticsTab";

type TabKey = "overview" | "analytics";

export default function FogComputingModule() {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  return (
    <main className="w-full min-h-screen bg-slate-100">
      <div className="w-full px-6 py-6 space-y-6">
        {/* Header */}
        <TopBar />

        {/* ---------------- TAB BAR ---------------- */}
        <div className="flex gap-6 border-b border-slate-200">
          <TabButton
            label="Enhancement Overview"
            active={activeTab === "overview"}
            onClick={() => setActiveTab("overview")}
          />
          <TabButton
            label="Quality Analytics"
            active={activeTab === "analytics"}
            onClick={() => setActiveTab("analytics")}
          />
        </div>

        {/* ---------------- TAB CONTENT ---------------- */}

        {/* TAB 1: Existing Dashboard (NO CHANGES INSIDE) */}
        {activeTab === "overview" && (
          <div className="space-y-6 pt-4">
            {/* Row 1 */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <AIAnalysisCard />
              <PerformanceCard />
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <FPSChart />
              <QualityRiskChart />
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <AlertsPanel />
              <HistoryTable />
            </div>
          </div>
        )}

        {/* TAB 2: Quality Analytics */}
        {activeTab === "analytics" && (
          <div className="pt-4">
            <QualityAnalyticsTab />
          </div>
        )}
      </div>
    </main>
  );
}

/* ---------------- TAB BUTTON ---------------- */

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`pb-3 text-sm font-medium transition-colors border-b-2
        ${
          active
            ? "border-indigo-600 text-indigo-600"
            : "border-transparent text-slate-500 hover:text-slate-800"
        }`}
    >
      {label}
    </button>
  );
}
