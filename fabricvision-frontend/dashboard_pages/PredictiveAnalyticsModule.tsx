"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiZap, FiBarChart2 } from "react-icons/fi";

import ModelAPrediction from "./FutureDefectsDetection/ModelAPrediction";
import ModelBRiskAnalytics from "./FutureDefectsDetection/ModelBRiskAnalytics";

const tabs = [
  { key: "modelA", label: "Live Prediction (Model A)", icon: FiZap },
  { key: "modelB", label: "Risk & RCA (Model B)", icon: FiBarChart2 },
];

const PredictiveAnalyticsModule = () => {
  const [activeTab, setActiveTab] = useState("modelA");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50"
    >
      {/* Header */}
      <div className="max-w-[1500px] mx-auto mb-6">
        <h1 className="text-gray-600 text-sm font-mono mb-1">
          Component 4 • Predictive Analytics
        </h1>
        <h2 className="text-3xl font-bold text-gray-800">
          Prediction & Risk Intelligence
        </h2>
        <p className="text-gray-600 mt-1">
          Model A (Real-time) + Model B (Analytics)
        </p>
      </div>

      {/* Tabs */}
      <div className="max-w-[1500px] mx-auto mb-6 border-b border-gray-200">
        <div className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`pb-3 flex items-center gap-2 font-semibold transition ${
                  active
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1500px] mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === "modelA" && <ModelAPrediction />}
          {activeTab === "modelB" && <ModelBRiskAnalytics />}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default PredictiveAnalyticsModule;
