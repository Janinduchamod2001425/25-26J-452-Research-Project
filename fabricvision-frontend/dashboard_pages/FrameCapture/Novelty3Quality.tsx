"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import HeaderSummary from "@/components/com1_novelty3/HeaderSummary";
import MotionTimeline from "@/components/com1_novelty3/MotionTimeline";
import DecisionEngineCards from "@/components/com1_novelty3/DecisionEngineCards";
import RegionHeatmap from "@/components/com1_novelty3/RegionHeatmap";
import RegionContributionCards from "@/components/com1_novelty3/RegionContributionCards";
import EfficiencyComparison from "@/components/com1_novelty3/EfficiencyComparison";
import EventTimeline from "@/components/com1_novelty3/EventTimeline";
import ModeDistributionChart from "@/components/com1_novelty3/ModeDistributionChart";
import MotionIrregularityCorrelation from "@/components/com1_novelty3/MotionIrregularityCorrelation";
import SystemHealthIndicators from "@/components/com1_novelty3/SystemHealthIndicators";
import InsightSummary from "@/components/com1_novelty3/InsightSummary";
import FrameQualitySummary from "@/components/com1_novelty3/FrameQualitySummary";
import RollHeader from "@/components/com1_novelty3/RollHeader";

const Novelty3Quality: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);

  // 2-second loading spinner
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

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
        ></motion.div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50"
      >
        <div className="max-w-[1500px] mx-auto space-y-6">
          <HeaderSummary />
          <RollHeader />

          {/* Frame Quality Summary */}
          <FrameQualitySummary />

          {/* Row: Motion Timeline + Region Heatmap */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <MotionTimeline />
            <RegionHeatmap />
          </div>

          {/* Decision engine + Region contribution */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <DecisionEngineCards className="xl:col-span-2" />
            <RegionContributionCards />
          </div>

          {/* Efficiency + Event timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EfficiencyComparison />
            <EventTimeline />
          </div>

          {/* Mode distribution + correlation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ModeDistributionChart />
            <MotionIrregularityCorrelation />
          </div>

          {/* System health + Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SystemHealthIndicators />
            <InsightSummary />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Novelty3Quality;
