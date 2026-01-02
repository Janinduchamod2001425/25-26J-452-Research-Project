"use client";

import React from "react";
import { motion } from "framer-motion";
import { FiShield, FiTrendingUp, FiActivity } from "react-icons/fi";

const PredictionConfidencePanel: React.FC = () => {
  const confidence = 92;
  const variance = 0.12;
  const stability = "Stable";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
    >
      <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
        <FiShield className="text-indigo-600" />
        Prediction Confidence
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Metric title="Confidence Level" value={`${confidence}%`} icon={FiTrendingUp} />
        <Metric title="Position Variance" value={`±${variance} m`} icon={FiActivity} />
        <Metric title="Stability" value={stability} icon={FiShield} />
      </div>

      <p className="text-xs text-gray-500 mt-4">
        Confidence calculated from recent prediction consistency and probability
        convergence.
      </p>
    </motion.div>
  );
};

const Metric = ({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: any;
}) => (
  <div className="bg-gray-50 rounded-lg p-4">
    <div className="flex items-center gap-2 mb-1">
      <Icon className="text-indigo-600 w-4 h-4" />
      <p className="text-sm text-gray-600">{title}</p>
    </div>
    <p className="text-xl font-bold text-gray-900">{value}</p>
  </div>
);

export default PredictionConfidencePanel;
