"use client";

import React from "react";
import { motion } from "framer-motion";
import { FiAlertTriangle, FiMapPin, FiTool } from "react-icons/fi";

const OperatorActionPanel: React.FC = () => {
  const action = "Inspect Fabric";
  const zone = "42 – 44 m";
  const urgency = "HIGH";
  const reason = "High probability repeating defect pattern detected ahead";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-red-50 border border-red-200 rounded-xl p-6"
    >
      <h3 className="text-lg font-bold text-red-800 flex items-center gap-2 mb-4">
        <FiAlertTriangle className="text-red-600" />
        Operator Recommendation
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ActionItem title="Action" value={action} icon={FiTool} />
        <ActionItem title="Inspection Zone" value={zone} icon={FiMapPin} />
        <ActionItem title="Urgency" value={urgency} icon={FiAlertTriangle} />
      </div>

      <div className="mt-4 text-sm text-red-700">
        <b>Reason:</b> {reason}
      </div>
    </motion.div>
  );
};

const ActionItem = ({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: any;
}) => (
  <div className="bg-white rounded-lg p-4 border border-red-200">
    <div className="flex items-center gap-2 mb-1 text-sm text-red-600">
      <Icon className="w-4 h-4" />
      {title}
    </div>
    <p className="text-lg font-bold text-red-900">{value}</p>
  </div>
);

export default OperatorActionPanel;
