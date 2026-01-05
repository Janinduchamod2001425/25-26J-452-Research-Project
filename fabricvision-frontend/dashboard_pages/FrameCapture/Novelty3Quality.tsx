"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

import RollHeader from "@/components/com1_novelty3/RollHeader";

import { useNovelty3DemoStore } from "@/store/novelty3DemoStore";
import FrameDecisionLogTable from "@/components/com1_novelty3/FrameDecisionLogTable";

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

  // keep same feel as your modules (2 sec loader)
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(t);
  }, []);

  const quality = currentFrame?.assessment ?? null;

  const totalLabel = useMemo(() => {
    if (!stats.total) return "No frames simulated yet";
    return `${stats.total} frames processed`;
  }, [stats.total]);

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

          {/* ✅ DEMO CONTROL PANEL (Option 1 + Option 3) */}
          <div className="bg-white rounded-2xl border shadow-sm p-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Demo Control Panel (Simulated Novelty-2 Input)
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  For demo only: inject frames + call{" "}
                  <span className="font-mono">/quality/assess</span> to produce
                  live outputs.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                <button
                  onClick={() =>
                    addSingleFrame({
                      frame_type: "borderline",
                      motion: { prediction: "idle", confidence: 0.45 },
                      image: "/fabric/img.png",
                    })
                  }
                  disabled={isAssessing}
                  className="px-4 py-2 rounded-lg bg-amber-600 text-white text-sm disabled:opacity-50"
                >
                  + Add Borderline Frame
                </button>

                <button
                  onClick={() =>
                    addSingleFrame({
                      frame_type: "irregular",
                      motion: { prediction: "active", confidence: 0.82 },
                      image: "/fabric/img.png",
                    })
                  }
                  disabled={isAssessing}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm disabled:opacity-50"
                >
                  + Add Irregular Frame
                </button>

                <button
                  onClick={() => addScenarioBatch("GOOD_CAPTURE", 25)}
                  disabled={isAssessing}
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm disabled:opacity-50"
                >
                  Scenario: Good Capture (25)
                </button>

                <button
                  onClick={() => addScenarioBatch("HIGH_SPEED_MOTION", 25)}
                  disabled={isAssessing}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm disabled:opacity-50"
                >
                  Scenario: High-Speed Motion (25)
                </button>

                <button
                  onClick={() => addScenarioBatch("POOR_LIGHTING", 25)}
                  disabled={isAssessing}
                  className="px-4 py-2 rounded-lg bg-slate-700 text-white text-sm disabled:opacity-50"
                >
                  Scenario: Poor Lighting (25)
                </button>

                <button
                  onClick={() => addScenarioBatch("MIXED_ROLL", 50)}
                  disabled={isAssessing}
                  className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm disabled:opacity-50"
                >
                  Scenario: Mixed Roll (50)
                </button>

                <button
                  onClick={clearAll}
                  disabled={isAssessing}
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-900 text-sm disabled:opacity-50"
                >
                  Clear
                </button>
              </div>
            </div>

            {lastError && (
              <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {lastError}
              </div>
            )}

            {/* Dynamic counters */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mt-5">
              <StatCard label="Total" value={stats.total} />
              <StatCard label="Borderline" value={stats.borderline} />
              <StatCard label="Irregular" value={stats.irregular} />
              <StatCard label="Good Quality" value={stats.good} />
              <StatCard label="Poor Quality" value={stats.poor} />
              <StatCard label="→ Fog" value={stats.forwardedToFog} />
              <StatCard label="→ Next" value={stats.forwardedToNext} />
              <StatCard label="Hold/Drop" value={stats.heldDropped} />
            </div>

            <div className="mt-3 text-xs text-gray-500 flex items-center justify-between flex-wrap gap-2">
              <span>{totalLabel}</span>
              <span>
                Alerts triggered:{" "}
                <span className="font-semibold text-red-700">
                  {stats.alerts}
                </span>
              </span>
            </div>
          </div>

          {/* ✅ FORWARDED FRAME REVIEW (dynamic viewer) */}
          {currentFrame ? (
            <div className="bg-white rounded-2xl p-5 border shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Frame Review
                </h3>

                <div className="text-sm text-gray-500">
                  Frame{" "}
                  <span className="font-semibold">{currentIndex + 1}</span> of{" "}
                  <span className="font-semibold">{frames.length}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="relative h-52 rounded-xl overflow-hidden border bg-gray-50">
                  <Image
                    src={currentFrame.image || "/fabric/img.png"}
                    alt="Frame"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>

                <div className="space-y-2 text-sm text-gray-800">
                  <p>
                    <b>Frame Type:</b> {currentFrame.frame_type}
                  </p>
                  <p>
                    <b>FIS:</b> {currentFrame.fis.toFixed(3)}
                  </p>
                  <p>
                    <b>Threshold:</b> {currentFrame.threshold.toFixed(3)}
                  </p>
                  <p>
                    <b>Motion:</b> {currentFrame.motion.prediction} (
                    {currentFrame.motion.confidence.toFixed(2)})
                  </p>

                  {currentFrame.assessment && (
                    <div className="pt-2 space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`px-3 py-1 rounded-full border text-xs ${badge(currentFrame.assessment.frame_quality)}`}
                        >
                          Quality: {currentFrame.assessment.frame_quality}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full border text-xs ${badge(currentFrame.assessment.risk_level)}`}
                        >
                          Risk: {currentFrame.assessment.risk_level}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full border text-xs ${badge(currentFrame.assessment.action)}`}
                        >
                          Action: {currentFrame.assessment.action}
                        </span>
                      </div>

                      <div
                        className={`px-3 py-2 rounded-lg border text-xs ${routeBadge(currentFrame.route)}`}
                      >
                        <b>Routing Decision:</b>{" "}
                        {routeLabel(currentFrame.route)}
                      </div>

                      {currentFrame.assessment.confidence_reason?.length >
                        0 && (
                        <div className="text-xs text-gray-600">
                          <b>Reasons:</b>
                          <ul className="list-disc ml-5 mt-1">
                            {currentFrame.assessment.confidence_reason.map(
                              (r, idx) => (
                                <li key={`${r}-${idx}`}>{r}</li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-end justify-end gap-2">
                  <button
                    disabled={currentIndex === 0 || isAssessing}
                    onClick={() => setCurrentIndex(currentIndex - 1)}
                    className="px-4 py-2 rounded-lg bg-gray-200 text-sm disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <button
                    disabled={currentIndex === frames.length - 1 || isAssessing}
                    onClick={() => setCurrentIndex(currentIndex + 1)}
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-6 text-center text-gray-500 border shadow-sm">
              No frames simulated yet. Use the Demo Control Panel above.
            </div>
          )}

          <FrameDecisionLogTable frames={frames} />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Novelty3Quality;

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-white p-3 shadow-sm">
      <div className="text-[11px] text-gray-500">{label}</div>
      <div className="text-lg font-bold text-gray-900">{value}</div>
    </div>
  );
}
