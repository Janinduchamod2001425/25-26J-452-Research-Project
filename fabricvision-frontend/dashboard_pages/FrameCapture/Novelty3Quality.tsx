"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { useFramePipelineStore } from "@/store/framePipelineStore";
import Image from "next/image";

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

// ---------------- TYPES ----------------
interface QualityAssessment {
  frame_quality: "good" | "poor";
  risk_level: "low" | "high" | "critical";
  action: "continue" | "alert_operator";
  confidence_reason: string[];
}

const Novelty3Quality: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [quality, setQuality] = useState<QualityAssessment | null>(null);

  const forwardedFrames = useFramePipelineStore((s) => s.forwardedFrames);

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentFrame = forwardedFrames[currentIndex];

  useEffect(() => {
    if (!currentFrame) return;

    const assessQuality = async () => {
      const res = await fetch("http://127.0.0.1:8000/quality/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          motion: {
            prediction: "active",
            confidence: 0.82,
          },
          frame_analysis: {
            frame_type: currentFrame.frame_type,
            fis: currentFrame.fis,
            threshold: currentFrame.threshold,
          },
        }),
      });

      const data = await res.json();
      setQuality(data.quality_assessment);
    };

    assessQuality();
  }, [currentFrame]);

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
          <RollHeader />

          {currentFrame ? (
            <div className="bg-white rounded-2xl p-5 border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  Forwarded Frame Review
                </h3>

                <div className="text-sm text-gray-500">
                  Frame {currentIndex + 1} of {forwardedFrames.length}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="relative h-52 rounded-xl overflow-hidden border">
                  <Image
                    src={currentFrame.image ?? "/assets/LivePreview.jpeg"}
                    alt="Forwarded frame"
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="space-y-2 text-sm">
                  <p>
                    <b>Frame Type:</b> {currentFrame.frame_type}
                  </p>
                  <p>
                    <b>FIS:</b> {currentFrame.fis.toFixed(3)}
                  </p>
                  <p>
                    <b>Threshold:</b> {currentFrame.threshold.toFixed(3)}
                  </p>
                </div>

                <div className="flex items-end justify-end gap-2">
                  <button
                    disabled={currentIndex === 0}
                    onClick={() => setCurrentIndex((i) => i - 1)}
                    className="px-4 py-1.5 rounded bg-gray-200 text-sm disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <button
                    disabled={currentIndex === forwardedFrames.length - 1}
                    onClick={() => setCurrentIndex((i) => i + 1)}
                    className="px-4 py-1.5 rounded bg-indigo-600 text-white text-sm disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-6 text-center text-gray-500">
              No irregular frames forwarded from Novelty-2 yet.
            </div>
          )}

          {/* Quality Intelligence */}
          <FrameQualitySummary quality={quality} />

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
