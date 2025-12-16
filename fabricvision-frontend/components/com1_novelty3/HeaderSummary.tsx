"use client";

import React from "react";
import { motion } from "framer-motion";

const HeaderSummary: React.FC = () => {
  return (
    <motion.header
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-6"
    >
      <p className="mt-2 text-sm md:text-base text-gray-600 ">
        Context-aware frame capture that adjusts FPS based on motion stability,
        local tension zones, and anomaly risk — reducing redundant frames while
        preserving all critical defect segments.
      </p>

      {/* KPI chips */}
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
          Avg FPS: 11.2 → 6.8 (-39%)
        </span>
        <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
          Burst Capture Events: 12
        </span>
        <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold">
          Roller Slip Incidents: 2
        </span>
        <span className="px-3 py-1 rounded-full bg-pink-50 text-pink-700 text-xs font-semibold">
          High-Tension Zones Flagged: 4
        </span>
      </div>
    </motion.header>
  );
};

export default HeaderSummary;
