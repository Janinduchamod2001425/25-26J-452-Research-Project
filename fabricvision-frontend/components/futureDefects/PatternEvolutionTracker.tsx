"use client";

import React from "react";
import { motion } from "framer-motion";
import { FiRepeat, FiTrendingUp, FiAlertCircle } from "react-icons/fi";

const PatternEvolutionTracker: React.FC = () => {
  const currentPattern = "Repeating";
  const previousPattern = "Repeating";
  const changeRisk = "Low";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
    >
      <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
        <FiRepeat className="text-indigo-600" />
        Pattern Evolution
      </h3>

      <div className="space-y-4">
        <Row label="Current Pattern" value={currentPattern} icon={FiTrendingUp} />
        <Row label="Previous Pattern" value={previousPattern} icon={FiRepeat} />
        <Row label="Change Risk" value={changeRisk} icon={FiAlertCircle} />
      </div>

      <div className="mt-4">
        <p className="text-xs text-gray-500">
          Pattern evolution is tracked over the last prediction windows to detect
          early transitions.
        </p>
      </div>
    </motion.div>
  );
};

const Row = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: any;
}) => (
  <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <Icon className="text-indigo-600 w-4 h-4" />
      {label}
    </div>
    <span className="font-semibold text-gray-900">{value}</span>
  </div>
);

export default PatternEvolutionTracker;
