"use client";

import React from "react";
import PredictionForecastMonitor from "@/components/futureDefects/PredictionForecastMonitor";
import PredictionConfidencePanel from "@/components/futureDefects/PredictionConfidencePanel";
import PatternEvolutionTracker from "@/components/futureDefects/PatternEvolutionTracker";
import OperatorActionPanel from "@/components/futureDefects/OperatorActionPanel";
import PredictedDefectTypeOverview from "@/components/futureDefects/PredictedDefectTypesImage";

import { motion } from "framer-motion";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Filler,
  Title,
} from "chart.js";
import {
  FiTrendingUp,
  FiAlertTriangle,
  FiMapPin,
  FiActivity,
  FiRefreshCw,
} from "react-icons/fi";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Filler,
  Title
);

const ModelAPrediction = () => {
  // 🔮 Example predicted positions from MODEL A
  const predictedPositions = [41.8, 42.2, 42.6, 43.1, 43.7];

  const data = {
    labels: ["Now", "+1 m", "+2 m", "+3 m", "+4 m"],
    datasets: [
      {
        label: "Predicted Defect Position (m)",
        data: predictedPositions,
        borderColor: "#6366f1",
        backgroundColor: "rgba(99, 102, 241, 0.15)",
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: "#6366f1",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        titleColor: "#fff",
        bodyColor: "#fff",
        padding: 12,
        cornerRadius: 6,
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: "Position (meters)",
          color: "#64748b",
          font: { size: 11 },
        },
        grid: { color: "rgba(226,232,240,0.6)" },
        ticks: { color: "#64748b" },
      },
      x: {
        grid: { display: false },
        ticks: { color: "#64748b" },
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            MODEL A — Live Defect Prediction
          </h2>
          <p className="text-gray-600 text-sm">
            Short-horizon forecasting based on real-time detection sequence
          </p>
        </div>
        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
          LIVE
        </span>
      </div>

      {/* MAIN STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Stat title="Next Position" value="42.6 m" icon={FiMapPin} />
        <Stat title="Interval" value="1.0 m" icon={FiActivity} />
        <Stat title="Probability" value="92%" icon={FiTrendingUp} />
        <Stat title="Pattern" value="Repeating" icon={FiActivity} />
      </div>

      {/* GRAPH */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <FiTrendingUp className="text-indigo-600" />
            Upcoming Defect Position Forecast
          </h3>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <FiRefreshCw className="text-gray-600" />
          </button>
        </div>

        <div className="h-64">
          <Line data={data} options={options} />
        </div>

        <p className="text-xs text-gray-500 mt-3">
          Prediction horizon: next ~4 meters
        </p>
      </div>
      <PredictedDefectTypeOverview />
      <PredictionForecastMonitor />
      <PredictionConfidencePanel />
<PatternEvolutionTracker />
<OperatorActionPanel />

      {/* ALERT */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-5">
        <div className="flex items-center gap-3">
          <FiAlertTriangle className="text-red-600 w-6 h-6" />
          <div>
            <p className="font-semibold text-red-800">
              High probability defect detected ahead
            </p>
            <p className="text-sm text-red-600">
              Inspect fabric between <b>42 – 44 m</b>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Stat = ({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: any;
}) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
    <div className="flex items-center gap-2 mb-1">
      <Icon className="text-indigo-600 w-4 h-4" />
      <p className="text-sm text-gray-600">{title}</p>
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
  </div>
);

export default ModelAPrediction;
