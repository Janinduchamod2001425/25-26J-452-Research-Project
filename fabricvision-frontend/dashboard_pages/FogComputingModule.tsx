"use client";

import { useState } from "react";
import TopBar from "./FogProcessing/TopBar";
import EnhancementOverviewTab from "./FogProcessing/EnhancementOverviewTab";
import QualityAnalyticsTab from "./FogProcessing/QualityAnalyticsTab";
import ImageClassificationTab from "./FogProcessing/ImageClassificationTab";
import type { IconType } from "react-icons";
import { FiImage, FiSliders, FiBarChart2 } from "react-icons/fi";
import { FogProvider } from "./FogProcessing/FogContext";

type Tab = "classification" | "overview" | "analytics";

export default function FogComputingModule() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [tab, setTab] = useState<"classify" | "quality">("classify");

  return (
    <FogProvider>
      <main className="w-full min-h-screen bg-slate-100">
        <div className="w-full px-6 py-6 space-y-6">
          {/* Header */}
          <TopBar />

          {/* Tabs */}
          <div className="flex gap-6 border-b border-slate-200">
            <TabButton
              label="Image Classification"
              icon={FiImage}
              active={activeTab === "classification"}
              onClick={() => setActiveTab("classification")}
            />
            <TabButton
              label="Enhancement Overview"
              icon={FiSliders}
              active={activeTab === "overview"}
              onClick={() => setActiveTab("overview")}
            />
            <TabButton
              label="Quality Analytics"
              icon={FiBarChart2}
              active={activeTab === "analytics"}
              onClick={() => setActiveTab("analytics")}
            />
          </div>

          {/* Tab Content */}
          <div className="pt-4 bold">
            {activeTab === "classification" && <ImageClassificationTab />}
            {activeTab === "overview" && <EnhancementOverviewTab />}
            {activeTab === "analytics" && <QualityAnalyticsTab />}
          </div>
        </div>
      </main>
    </FogProvider>
  );
}

function TabButton({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: IconType;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = icon;
  return (
    <button
      onClick={onClick}
      className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2
        ${
          active
            ? "border-indigo-600 text-indigo-600"
            : "border-transparent text-slate-500 hover:text-slate-800"
        }`}
    >
      <Icon
        size={16}
        className={active ? "text-indigo-600" : "text-slate-400"}
      />
      {label}
    </button>
  );
}
