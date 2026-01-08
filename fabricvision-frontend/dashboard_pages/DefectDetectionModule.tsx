"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Inter } from "next/font/google";
import { FiFileText, FiActivity, FiBarChart2, FiSettings, FiUpload, FiImage, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import DefectReportingTab from "./DefectDetection/DefectReportingTab";
import RealTimeDashboard from "./DefectDetection/RealTimeDashboard";
import HistoryAnalytics from "./DefectDetection/HistoryAnalytics";
import SystemConfiguration from "./DefectDetection/SystemConfiguration";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-inter",
});

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

const subTabs = [
  { key: "reporting", label: "Defect Reporting", icon: FiFileText },
  { key: "dashboard", label: "Real-time Dashboard", icon: FiActivity },
  { key: "history", label: "History & Analytics", icon: FiBarChart2 },
  { key: "config", label: "System Configuration", icon: FiSettings },
];

const DefectDetectionModule: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [activeSubTab, setActiveSubTab] = useState<string>("dashboard");
  const [apiData, setApiData] = useState<any>(null);
  const [uploadStatus, setUploadStatus] = useState<{loading: boolean; error: string | null}>({ loading: false, error: null });

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleFileUpload = async (file: File) => {
    setUploadStatus({ loading: true, error: null });
    
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const response = await fetch("http://localhost:8000/detect?confidence=0.25", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      setApiData(data);
      setUploadStatus({ loading: false, error: null });
    } catch (error: any) {
      setUploadStatus({ loading: false, error: error.message });
      console.error("Upload error:", error);
    }
  };

  const activeTab = subTabs.find((t) => t.key === activeSubTab);
  const ActiveIcon = activeTab?.icon || FiActivity;

  const renderSubContent = () => {
    switch (activeSubTab) {
      case "reporting":
        return <DefectReportingTab />;
      case "dashboard":
        return <RealTimeDashboard apiData={apiData} onFileUpload={handleFileUpload} uploadStatus={uploadStatus} />;
      case "history":
        return <HistoryAnalytics />;
      case "config":
        return <SystemConfiguration />;
      default:
        return <RealTimeDashboard apiData={apiData} onFileUpload={handleFileUpload} uploadStatus={uploadStatus} />;
    }
  };

  if (loading) {
    return (
      <motion.div
        className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/20"
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

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="defect-module"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={fadeIn}
        className={`p-6 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/20 ${inter.className}`}
      >
        <div className="max-w-[1500px] mx-auto mb-6">
          <h1 className="text-gray-600 text-sm font-mono mb-1">
            Component 3 • Defect Detection Module
          </h1>

          <div className="flex items-center gap-3">
            <ActiveIcon className="text-2xl text-indigo-600" />
            <h2 className="text-3xl font-bold text-gray-800">{activeTab?.label}</h2>
          </div>

          <p className="text-lg font-semibold text-gray-600 mt-1">
            YOLOv9 • Real-time monitoring • Precise localization
          </p>

          <div className="text-sm text-gray-500 mt-3">
            Component 3 / Defect Detection /{" "}
            <span className="font-semibold text-gray-700">{activeTab?.label}</span>
          </div>
        </div>

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

        <div className="max-w-[1500px] mx-auto">{renderSubContent()}</div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DefectDetectionModule;