"use client";

import { useState } from "react";
import TopBar from "./FogProcessing/TopBar";
import EnhancementOverviewTab from "./FogProcessing/EnhancementOverviewTab";
import QualityAnalyticsTab from "./FogProcessing/QualityAnalyticsTab";
import ImageClassificationTab from "./FogProcessing/ImageClassificationTab";

type Tab = "classification" | "overview" | "analytics";

export default function FogComputingModule() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  return (
    <main className="w-full min-h-screen bg-slate-100">
      <div className="w-full px-6 py-6 space-y-6">
        {/* Header */}
        <TopBar />

        {/* Tabs */}
        <div className="flex gap-6 border-b border-slate-200">
          <TabButton
            label="Image Classification"
            active={activeTab === "classification"}
            onClick={() => setActiveTab("classification")}
          />
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

        {/* Tab Content */}
        <div className="pt-4">
          {activeTab === "classification" && <ImageClassificationTab />}
          {activeTab === "overview" && <EnhancementOverviewTab />}
          {activeTab === "analytics" && <QualityAnalyticsTab />}
        </div>
      </div>
    </main>
  );
}

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
      className={`pb-3 text-sm font-medium border-b-2 transition-colors
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
