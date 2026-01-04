"use client";

import React from "react";
import { useModelAPrediction } from "@/hooks/useModelAPrediction";
import SequenceInputPanel from "@/components/futureDefects/SequenceInputPanel";

import PredictionForecastMonitor from "@/components/futureDefects/PredictionForecastMonitor";
import PredictionConfidencePanel from "@/components/futureDefects/PredictionConfidencePanel";
import PatternEvolutionTracker from "@/components/futureDefects/PatternEvolutionTracker";
import OperatorActionPanel from "@/components/futureDefects/OperatorActionPanel";

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
} from "chart.js";
import {
  FiTrendingUp,
  FiMapPin,
  FiActivity,
} from "react-icons/fi";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Filler
);

const ModelAPrediction = () => {
  const { predictions, loading, predict } = useModelAPrediction();

  const chartData = {
    labels: predictions.map((_, i) => `+${i + 1}`),
    datasets: [
      {
        data: predictions,
        borderColor: "#6366f1",
        backgroundColor: "rgba(99,102,241,0.15)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return (
    <motion.div className="space-y-6">
      <h2 className="text-2xl font-bold">MODEL A — Live Prediction</h2>

      {/* 🔹 INPUT */}
      <SequenceInputPanel onSubmit={predict} />

      {loading && <p className="text-gray-500">Predicting...</p>}

      {predictions.length > 0 && (
        <>
          {/* STATS */}
          <div className="grid grid-cols-4 gap-4">
            <Stat title="Next Position" value={`${predictions[0]} m`} icon={FiMapPin} />
            <Stat
              title="Avg Interval"
              value={`${(predictions[1] - predictions[0]).toFixed(2)} m`}
              icon={FiActivity}
            />
            <Stat title="Confidence" value="Model-based" icon={FiTrendingUp} />
            <Stat title="Pattern" value="Learned" icon={FiActivity} />
          </div>

          {/* CHART */}
          <div className="bg-white p-6 rounded-xl">
            <Line data={chartData} />
          </div>

          {/* ANALYTICS */}
          <PredictionForecastMonitor predictions={predictions} />
          <PredictionConfidencePanel predictions={predictions} />
          <PatternEvolutionTracker predictions={predictions} />
          <OperatorActionPanel predictions={predictions} />
        </>
      )}
    </motion.div>
  );
};

const Stat = ({ title, value, icon: Icon }: any) => (
  <div className="bg-white p-4 rounded-xl border">
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <Icon />
      {title}
    </div>
    <p className="text-xl font-bold">{value}</p>
  </div>
);

export default ModelAPrediction;
