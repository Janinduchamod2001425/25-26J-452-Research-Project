"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Inter } from "next/font/google";

import { FiActivity, FiAlertOctagon, FiBarChart2 } from "react-icons/fi";

// Import Sub Pages
import Novelty1Motion from "./FrameCapture/Novelty1Motion";
import Novelty2Anomaly from "./FrameCapture/Novelty2Anomaly";
import Novelty3Quality from "./FrameCapture/Novelty3Quality";

// ---------------- Font ----------------
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-inter",
});

// ---------------- Animation ----------------
const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

// ---------------- Global Status Bar ----------------
const GlobalStatusBar: React.FC = () => {
  return (
    <div className="flex items-center gap-6">
      {/* Motion Status */}
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
        <span className="text-sm font-semibold text-gray-700">
          Motion: ACTIVE
        </span>
      </div>

      {/* Anomaly Status */}
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
        <span className="text-sm font-semibold text-gray-700">
          Anomaly: WARNING
        </span>
      </div>

      {/* Quality Status */}
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
        <span className="text-sm font-semibold text-gray-700">Quality: OK</span>
      </div>
    </div>
  );
};

// ---------------- Sub Tabs ----------------
const subTabs = [
  { key: "novelty1", label: "Motion Extraction", icon: FiActivity },
  { key: "novelty2", label: "Anomaly Pre-Screen", icon: FiAlertOctagon },
  { key: "novelty3", label: "Quality Analytics", icon: FiBarChart2 },
];

// ---------------- Main Component ----------------
const FrameCaptureModule: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [activeSubTab, setActiveSubTab] = useState<string>("novelty1");

  // Loading Animation
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const activeLabel = subTabs.find((t) => t.key === activeSubTab)?.label ?? "";

  // ---------------- Sub Tab Renderer ----------------
  const renderSubContent = () => {
    switch (activeSubTab) {
      case "novelty1":
        return <Novelty1Motion />;
      case "novelty2":
        return <Novelty2Anomaly />;
      case "novelty3":
        return <Novelty3Quality />;
      default:
        return <Novelty1Motion />;
    }
  };

  // ---------------- Loading Screen ----------------
  if (loading) {
    return (
      <motion.div
        className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="h-12 w-12 border-4 border-indigo-500 rounded-full border-t-transparent"
        />
      </motion.div>
    );
  }

  // ---------------- Main Layout ----------------
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="frame-module"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={fadeIn}
        className={`p-6 min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 ${inter.className}`}
      >
        {/* ---------------- HEADER ---------------- */}
        <div className="max-w-[1500px] mx-auto mb-6 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          {/* LEFT HEADER CONTENT */}
          <div>
            <h1 className="text-gray-600 text-sm font-mono mb-1">
              Component 1 • Frame Capture Module
            </h1>

            <h2 className="text-3xl font-bold text-gray-800">{activeLabel}</h2>

            <p className="text-lg font-semibold text-gray-600 mt-1">
              Motion analysis • Frame extraction • Diagnostics
            </p>

            {/* Breadcrumb */}
            <div className="text-sm text-gray-500 mt-3">
              Component 1 / Frame Capture /{" "}
              <span className="font-semibold text-gray-700">{activeLabel}</span>
            </div>
          </div>

          {/* RIGHT GLOBAL STATUS BAR */}
          <div className="flex justify-start lg:justify-end">
            <GlobalStatusBar />
          </div>
        </div>

        {/* ---------------- Sub Navigation ---------------- */}
        <div className="max-w-[1500px] mx-auto mb-6 border-b border-gray-200">
          <div className="flex space-x-8 overflow-x-auto pb-1">
            {subTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSubTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveSubTab(tab.key)}
                  className={`pb-3 text-sm font-semibold transition-colors flex items-center gap-2 ${
                    isActive
                      ? "text-indigo-600 border-b-2 border-indigo-600"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ---------------- Dynamic Sub Content ---------------- */}
        <div className="max-w-[1500px] mx-auto">{renderSubContent()}</div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FrameCaptureModule;
