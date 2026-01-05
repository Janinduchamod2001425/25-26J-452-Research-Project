"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

import RollHeader from "@/components/com1_novelty3/RollHeader";
import { useNovelty3DemoStore } from "@/store/novelty3DemoStore";
import FrameDecisionLogTable from "@/components/com1_novelty3/FrameDecisionLogTable";

import normalFrameImage from "@/assets/Normal frame.jpg";

const badge = (
  type:
    | "good"
    | "poor"
    | "low"
    | "high"
    | "critical"
    | "continue"
    | "alert_operator",
) => {
  switch (type) {
    case "good":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "poor":
      return "bg-red-50 text-red-700 border-red-200";
    case "low":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "high":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "critical":
      return "bg-red-50 text-red-700 border-red-200";
    case "continue":
      return "bg-slate-50 text-slate-700 border-slate-200";
    case "alert_operator":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
};

const routeBadge = (route?: "to_fog" | "to_next_component" | "hold_drop") => {
  if (route === "to_fog")
    return "bg-indigo-50 text-indigo-700 border-indigo-200";
  if (route === "to_next_component")
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (route === "hold_drop") return "bg-red-50 text-red-700 border-red-200";
  return "bg-slate-50 text-slate-700 border-slate-200";
};

const routeLabel = (route?: "to_fog" | "to_next_component" | "hold_drop") => {
  if (route === "to_fog") return "Forward → Fog Enhancement";
  if (route === "to_next_component") return "Forward → Next Component";
  if (route === "hold_drop") return "Hold/Drop + Operator Alert";
  return "—";
};

const Novelty3Quality: React.FC = () => {
  const [loading, setLoading] = useState(true);

  const {
    frames,
    currentIndex,
    setCurrentIndex,
    clearAll,
    addSingleFrame,
    addScenarioBatch,
    isAssessing,
    lastError,
    stats,
  } = useNovelty3DemoStore();

  const currentFrame = frames[currentIndex];

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(t);
  }, []);

  const totalLabel = useMemo(() => {
    if (!stats.total) return "No frames simulated yet";
    return `${stats.total} frames processed`;
  }, [stats.total]);

  const rejectedRatio = useMemo(() => {
    if (!stats.total) return 0;
    return (stats.heldDropped / stats.total) * 100;
  }, [stats.total, stats.heldDropped]);

  const rollDecision = useMemo(() => {
    if (!stats.total) return "PENDING";
    if (rejectedRatio > 25) return "COMPROMISED";
    if (rejectedRatio > 10) return "DEGRADED";
    return "RELIABLE";
  }, [stats.total, rejectedRatio]);

  const rollAction = {
    PENDING: "Awaiting frames for quality evaluation",
    RELIABLE: "Proceed with defect detection",
    DEGRADED: "Monitor closely or apply selective re-capture",
    COMPROMISED: "Pause inspection and re-capture affected fabric segment",
  };

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

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50"
      >
        <div className="max-w-[1500px] mx-auto space-y-6 px-3 md:px-0">
          <RollHeader />

          <div
            className={`mt-6 p-4 rounded-xl border ${
              rollDecision === "COMPROMISED"
                ? "bg-red-50 border-red-300 text-red-800"
                : rollDecision === "DEGRADED"
                  ? "bg-amber-50 border-amber-300 text-amber-800"
                  : rollDecision === "RELIABLE"
                    ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                    : "bg-gray-50 border-gray-300 text-gray-700"
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">
                  Roll Quality Decision:{" "}
                  <span className="font-bold">{rollDecision}</span>
                </p>

                {rollDecision !== "PENDING" ? (
                  <p className="text-xs mt-1">
                    {stats.heldDropped} of {stats.total} frames rejected (
                    {rejectedRatio.toFixed(1)}%)
                  </p>
                ) : (
                  <p className="text-xs mt-1 italic">No frames assessed yet</p>
                )}
              </div>

              <div className="text-xs font-medium">
                <span className="opacity-80">System Action:</span>{" "}
                <span className="font-semibold">
                  {rollAction[rollDecision]}
                </span>
              </div>
            </div>
          </div>

          {/* ✅ MODERN DEMO CONTROL PANEL */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Demo Control Panel
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Simulate Novelty-2 inputs to trigger quality assessment via{" "}
                  <span className="font-mono text-indigo-600">
                    /quality/assess
                  </span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() =>
                  addSingleFrame({
                    frame_type: "borderline",
                    motion: { prediction: "idle", confidence: 0.45 },
                    image: "/fabric/Borderline frame.jpg",
                  })
                }
                disabled={isAssessing}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm disabled:opacity-40 transition-colors flex items-center gap-2"
              >
                <span className="h-2 w-2 rounded-full bg-white/80"></span>
                Add Borderline Frame
              </button>

              <button
                onClick={() =>
                  addSingleFrame({
                    frame_type: "irregular",
                    motion: { prediction: "active", confidence: 0.82 },
                    image: "/fabric/irregular frame.jpg",
                  })
                }
                disabled={isAssessing}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm disabled:opacity-40 transition-colors flex items-center gap-2"
              >
                <span className="h-2 w-2 rounded-full bg-white/80"></span>
                Add Irregular Frame
              </button>

              <button
                onClick={() => addScenarioBatch("GOOD_CAPTURE", 25)}
                disabled={isAssessing}
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm disabled:opacity-40 transition-colors"
              >
                Good Capture (25)
              </button>

              <button
                onClick={() => addScenarioBatch("HIGH_SPEED_MOTION", 25)}
                disabled={isAssessing}
                className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm disabled:opacity-40 transition-colors"
              >
                High-Speed Motion (25)
              </button>

              <button
                onClick={() => addScenarioBatch("POOR_LIGHTING", 25)}
                disabled={isAssessing}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-800 text-white text-sm disabled:opacity-40 transition-colors"
              >
                Poor Lighting (25)
              </button>

              <button
                onClick={() => addScenarioBatch("MIXED_ROLL", 50)}
                disabled={isAssessing}
                className="px-4 py-2 rounded-lg bg-gray-900 hover:bg-black text-white text-sm disabled:opacity-40 transition-colors"
              >
                Mixed Roll (50)
              </button>

              <button
                onClick={clearAll}
                disabled={isAssessing}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm disabled:opacity-40 transition-colors border border-gray-300"
              >
                Clear All
              </button>
            </div>

            {lastError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                {lastError}
              </div>
            )}

            {/* ✅ MODERN STATS DASHBOARD */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-700">
                  Processing Metrics
                </h4>
                <span className="text-xs text-gray-500">{totalLabel}</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                <ModernStatCard
                  label="Total"
                  value={stats.total}
                  color="gray"
                  trend="neutral"
                />
                <ModernStatCard
                  label="Borderline"
                  value={stats.borderline}
                  color="amber"
                  trend="up"
                />
                <ModernStatCard
                  label="Irregular"
                  value={stats.irregular}
                  color="red"
                  trend="up"
                />
                <ModernStatCard
                  label="Good Quality"
                  value={stats.good}
                  color="emerald"
                  trend="positive"
                />
                <ModernStatCard
                  label="Poor Quality"
                  value={stats.poor}
                  color="red"
                  trend="negative"
                />
                <ModernStatCard
                  label="→ Fog"
                  value={stats.forwardedToFog}
                  color="indigo"
                  trend="neutral"
                />
                <ModernStatCard
                  label="→ Next"
                  value={stats.forwardedToNext}
                  color="emerald"
                  trend="positive"
                />
                <ModernStatCard
                  label="Hold/Drop"
                  value={stats.heldDropped}
                  color="red"
                  trend="alert"
                />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                  <span className="text-xs text-gray-600">Good</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                  <span className="text-xs text-gray-600">Borderline</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-500"></div>
                  <span className="text-xs text-gray-600">Critical</span>
                </div>
              </div>

              <div className="text-xs text-gray-500 flex items-center gap-2">
                <span className="font-medium text-gray-700">Alerts:</span>
                <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 font-semibold">
                  {stats.alerts}
                </span>
              </div>
            </div>
          </div>

          {/* ✅ MODERN FRAME REVIEW */}
          {currentFrame ? (
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Frame Analysis Review
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Inspect quality assessment and routing decisions
                  </p>
                </div>

                <div className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-700">
                  Frame{" "}
                  <span className="font-bold text-indigo-600">
                    {currentIndex + 1}
                  </span>{" "}
                  of{" "}
                  <span className="font-bold text-gray-900">
                    {frames.length}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Frame Image */}
                <div className="lg:col-span-1">
                  <div className="relative h-64 rounded-xl overflow-hidden border border-gray-300 bg-gradient-to-br from-gray-100 to-gray-50">
                    <Image
                      src={currentFrame.image || normalFrameImage}
                      alt="Frame"
                      fill
                      className="object-cover"
                      unoptimized={!currentFrame.image} // Only unoptimized for dynamic images
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/70 text-white text-xs font-medium">
                      {currentFrame.frame_type.toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* Assessment Details */}
                <div className="lg:col-span-2 space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <DetailCard
                      label="FIS"
                      value={currentFrame.fis.toFixed(3)}
                    />
                    <DetailCard
                      label="Threshold"
                      value={currentFrame.threshold.toFixed(3)}
                    />
                    <DetailCard
                      label="Motion"
                      value={currentFrame.motion.prediction}
                      subValue={`${(currentFrame.motion.confidence * 100).toFixed(0)}%`}
                    />
                    <DetailCard label="Type" value={currentFrame.frame_type} />
                  </div>

                  {currentFrame.assessment && (
                    <>
                      {/* Quality Badges */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div
                          className={`px-4 py-3 rounded-xl border ${badge(currentFrame.assessment.frame_quality)}`}
                        >
                          <div className="text-xs text-gray-500 mb-1">
                            Quality
                          </div>
                          <div className="font-semibold">
                            {currentFrame.assessment.frame_quality}
                          </div>
                        </div>
                        <div
                          className={`px-4 py-3 rounded-xl border ${badge(currentFrame.assessment.risk_level)}`}
                        >
                          <div className="text-xs text-gray-500 mb-1">
                            Risk Level
                          </div>
                          <div className="font-semibold">
                            {currentFrame.assessment.risk_level}
                          </div>
                        </div>
                        <div
                          className={`px-4 py-3 rounded-xl border ${badge(currentFrame.assessment.action)}`}
                        >
                          <div className="text-xs text-gray-500 mb-1">
                            Action
                          </div>
                          <div className="font-semibold">
                            {currentFrame.assessment.action}
                          </div>
                        </div>
                      </div>

                      {/* Routing Decision */}
                      <div
                        className={`p-4 rounded-xl border ${routeBadge(currentFrame.route)}`}
                      >
                        <div className="text-xs text-gray-600 mb-2">
                          Routing Decision
                        </div>
                        <div className="font-medium">
                          {routeLabel(currentFrame.route)}
                        </div>
                      </div>

                      {/* Reasons */}
                      {currentFrame.assessment.confidence_reason?.length >
                        0 && (
                        <div className="p-4 rounded-xl border border-gray-200">
                          <div className="text-sm font-medium text-gray-900 mb-2">
                            Assessment Reasons
                          </div>
                          <ul className="space-y-2">
                            {currentFrame.assessment.confidence_reason.map(
                              (r, idx) => (
                                <li
                                  key={`${r}-${idx}`}
                                  className="flex items-start gap-2 text-sm text-gray-700"
                                >
                                  <div className="h-1.5 w-1.5 rounded-full bg-gray-400 mt-2"></div>
                                  <span>{r}</span>
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Navigation */}
              <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between">
                <button
                  disabled={currentIndex === 0 || isAssessing}
                  onClick={() => setCurrentIndex(currentIndex - 1)}
                  className="px-5 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm disabled:opacity-40 transition-colors flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Previous
                </button>

                <button
                  disabled={currentIndex === frames.length - 1 || isAssessing}
                  onClick={() => setCurrentIndex(currentIndex + 1)}
                  className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm disabled:opacity-40 transition-colors flex items-center gap-2"
                >
                  Next
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-200 shadow-sm">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No frames simulated
              </h3>
              <p className="text-gray-500 text-sm">
                Use the Demo Control Panel to add frames and trigger quality
                assessment.
              </p>
            </div>
          )}

          <FrameDecisionLogTable frames={frames} />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Novelty3Quality;

// Modern Stat Card Component
function ModernStatCard({
  label,
  value,
  color = "gray",
  trend = "neutral",
}: {
  label: string;
  value: number;
  color: "gray" | "amber" | "red" | "emerald" | "indigo";
  trend: "neutral" | "up" | "down" | "positive" | "negative" | "alert";
}) {
  const colorClasses = {
    gray: "bg-gray-50 border-gray-200",
    amber: "bg-amber-50 border-amber-200",
    red: "bg-red-50 border-red-200",
    emerald: "bg-emerald-50 border-emerald-200",
    indigo: "bg-indigo-50 border-indigo-200",
  };

  const textColors = {
    gray: "text-gray-700",
    amber: "text-amber-700",
    red: "text-red-700",
    emerald: "text-emerald-700",
    indigo: "text-indigo-700",
  };

  const trendIcons = {
    neutral: null,
    up: "↗",
    down: "↘",
    positive: "↑",
    negative: "↓",
    alert: "⚠",
  };

  return (
    <div className={`rounded-xl border p-4 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-1">
        <div className={`text-xs font-medium ${textColors[color]}`}>
          {label}
        </div>
        {trend !== "neutral" && (
          <span className="text-xs">{trendIcons[trend]}</span>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
    </div>
  );
}

// Detail Card Component
function DetailCard({
  label,
  value,
  subValue,
}: {
  label: string;
  value: string | number;
  subValue?: string;
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="flex items-baseline gap-2">
        <div className="text-sm font-semibold text-gray-900">{value}</div>
        {subValue && <div className="text-xs text-gray-500">{subValue}</div>}
      </div>
    </div>
  );
}
