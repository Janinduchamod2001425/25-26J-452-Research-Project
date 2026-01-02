"use client";

import React from "react";
import ShapContributionPanel from "@/components/futureDefects/ShapContributionPanel";
import ShapSummaryImage from "@/components/futureDefects/ShapSummaryImage";
import { motion } from "framer-motion";
import {
  FiBarChart2,
  FiTool,
  FiUsers,
  FiTrendingUp,
  FiAlertCircle,
} from "react-icons/fi";

const ModelBRiskAnalytics = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Risk & Root Cause Analytics
        </h2>
        <p className="text-gray-600">
          MODEL B • Offline analytics & explainability
        </p>
      </div>

      {/* RISK CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Metric title="Roll Risk Score" value="7.8 / 10" />
        <Metric title="Risk Level" value="HIGH" highlight />
        <Metric title="Risk Trend" value="Increasing" />
        <Metric title="Confidence" value="88%" />
      </div>

      {/* RCA */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FiTool className="text-indigo-600" />
          Root Cause Analysis
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="font-semibold text-gray-700 mb-2">
              Primary Cause
            </p>
            <p className="text-2xl font-bold text-gray-900">Machine</p>
            <p className="text-sm text-gray-600 mt-2">
              Based on interval variance and pattern instability
            </p>
          </div>

          <div>
            <p className="font-semibold text-gray-700 mb-2">
              Key Contributors
            </p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>High standard deviation in defect spacing</li>
              <li>Irregular repeating pattern</li>
              <li>Deviation from supplier baseline</li>
            </ul>
          </div>
        </div>
      </div>
      <ShapSummaryImage/>
      <ShapContributionPanel/>


      {/* SUPPLIER ANALYTICS */}
      <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-200">
        <h3 className="font-bold text-indigo-800 flex items-center gap-2">
          <FiUsers />
          Supplier Intelligence
        </h3>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <SupplierStat title="Supplier" value="Supplier B" />
          <SupplierStat title="Avg Risk Score" value="6.2" />
          <SupplierStat title="Trend" value="↑ +12%" />
        </div>

        <p className="text-sm text-indigo-700 mt-4">
          Supplier B shows higher defect density compared to historical
          average across similar rolls.
        </p>
      </div>

      {/* ACTION SUGGESTIONS */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <FiAlertCircle className="text-yellow-600 w-6 h-6" />
          <h3 className="font-bold text-yellow-800">
            Recommended Actions
          </h3>
        </div>

        <ul className="list-disc pl-6 text-yellow-800 space-y-1">
          <li>Inspect machine rollers and tension control</li>
          <li>Reduce line speed temporarily</li>
          <li>Increase inspection frequency for next rolls</li>
        </ul>
      </div>
    </motion.div>
  );
};

const Metric = ({
  title,
  value,
  highlight,
}: {
  title: string;
  value: string;
  highlight?: boolean;
}) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
    <p className="text-sm text-gray-600">{title}</p>
    <p
      className={`text-3xl font-bold ${
        highlight ? "text-red-600" : "text-gray-900"
      }`}
    >
      {value}
    </p>
  </div>
);

const SupplierStat = ({
  title,
  value,
}: {
  title: string;
  value: string;
}) => (
  <div className="bg-white rounded-lg p-4 border border-indigo-200">
    <p className="text-sm text-indigo-700">{title}</p>
    <p className="text-xl font-bold text-indigo-900">{value}</p>
  </div>
);

export default ModelBRiskAnalytics;
