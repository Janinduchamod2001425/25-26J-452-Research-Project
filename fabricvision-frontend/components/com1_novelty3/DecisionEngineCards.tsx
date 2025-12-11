"use client";

import React from "react";
import Card from "./Card";

interface DecisionProps {
  className?: string;
}

const rules = [
  {
    title: "Stable Window",
    desc: "When motion variance stays below 3%, capture is clamped to low FPS to avoid redundant frames.",
    badge: "Low FPS (energy saving)",
  },
  {
    title: "Moderate Vibration",
    desc: "FPS scales linearly with motion variance – more vibration, more frames, but still capped for efficiency.",
    badge: "Adaptive FPS",
  },
  {
    title: "High Instability Spike",
    desc: "Short bursts of 18–20 FPS are enabled when motion crosses the high-risk band to avoid missing micro-defects.",
    badge: "Burst Capture Mode",
  },
  {
    title: "Localized Tension / Roller Slip",
    desc: "If motion is mostly from one side, the system tags that region and prioritizes its frames for downstream analysis.",
    badge: "Region-Aware Capture",
  },
];

const DecisionEngineCards: React.FC<DecisionProps> = ({ className = "" }) => {
  return (
    <Card className={className}>
      <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
        Adaptive Capture Decision Engine
      </h3>
      <p className="text-xs md:text-sm text-gray-500 mb-4">
        Instead of capturing at a fixed FPS, the system reasons about motion,
        stability, and region-wise vibration before deciding how aggressively to
        sample frames.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rules.map((r) => (
          <div
            key={r.title}
            className="rounded-xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-4 space-y-2"
          >
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-semibold text-gray-900">{r.title}</h4>
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-[10px] font-semibold text-indigo-700">
                {r.badge}
              </span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">{r.desc}</p>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default DecisionEngineCards;
