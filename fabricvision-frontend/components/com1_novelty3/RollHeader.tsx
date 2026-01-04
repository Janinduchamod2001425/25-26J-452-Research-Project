"use client";

import React from "react";
import { motion } from "framer-motion";
import { FiLayers, FiTruck, FiCpu, FiClock } from "react-icons/fi";

interface RollHeaderProps {
  rollId?: string;
  supplier?: string;
  machine?: string;
  startTime?: string;
  status?: "RUNNING" | "PAUSED" | "COMPLETED";
}

const statusStyle: Record<
  NonNullable<RollHeaderProps["status"]>,
  { bg: string; text: string }
> = {
  RUNNING: {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
  },
  PAUSED: {
    bg: "bg-amber-100",
    text: "text-amber-700",
  },
  COMPLETED: {
    bg: "bg-gray-200",
    text: "text-gray-700",
  },
};

const RollHeader: React.FC<RollHeaderProps> = ({
  rollId = "ROLL-2025-12-10-001",
  supplier = "Supplier B",
  machine = "Loom #04",
  startTime = "10:00 AM",
  status = "RUNNING",
}) => {
  const badge = statusStyle[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-gray-200 bg-white/80 shadow-sm px-6 py-4"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* LEFT: Roll Identity */}
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Active Fabric Roll
            </p>
            <h2 className="text-lg font-bold text-gray-900">{rollId}</h2>
          </div>
        </div>

        {/* RIGHT: Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <FiTruck className="text-indigo-500" />
            <span className="font-semibold">{supplier}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-700">
            <FiCpu className="text-indigo-500" />
            <span className="font-semibold">{machine}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-700">
            <FiClock className="text-indigo-500" />
            <span className="font-semibold">Started: {startTime}</span>
          </div>

          <span
            className={`px-4 py-1.5 ml-3 rounded-full text-xs font-semibold border border-green-600 ${badge.bg} ${badge.text}`}
          >
            {status}
          </span>

          <span className="text-xs text-gray-700 italic">
            Live monitoring session
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default RollHeader;
