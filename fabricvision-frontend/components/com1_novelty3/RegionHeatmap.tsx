"use client";

import React from "react";
import Card from "./Card";

const RegionHeatmap: React.FC = () => {
  const regions = [
    {
      label: "Left Warp Tension",
      value: 0.72,
      color: "from-rose-100 to-rose-300",
    },
    {
      label: "Center Weave",
      value: 0.35,
      color: "from-emerald-100 to-emerald-300",
    },
    {
      label: "Right Warp Tension",
      value: 0.81,
      color: "from-amber-100 to-amber-300",
    },
  ];

  return (
    <Card>
      <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
        Localized Motion Heatmap (Across Fabric Width)
      </h3>
      <p className="text-xs md:text-sm text-gray-500 mb-4">
        Indicates which fabric regions are contributing most to motion spikes.
        Darker bands correspond to higher vibration or tension imbalance.
      </p>

      <div className="space-y-3">
        {regions.map((r) => (
          <div key={r.label} className="space-y-1">
            <div className="flex justify-between text-xs text-gray-600">
              <span>{r.label}</span>
              <span className="font-mono font-semibold">
                {(r.value * 100).toFixed(0)}%
              </span>
            </div>
            <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${r.color}`}
                style={{ width: `${Math.max(r.value * 100, 5)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="mt-3 text-[11px] text-gray-400">
        These signals are fed back into the capture engine and anomaly
        pre-screen, so high-risk zones receive more attention without increasing
        full-roll FPS.
      </p>
    </Card>
  );
};

export default RegionHeatmap;
