"use client";

import React from "react";
import { useModelAPrediction } from "@/hooks/useModelAPrediction";
import SequenceInputPanel from "@/components/futureDefects/SequenceInputPanel";

import PredictionForecastMonitor from "@/components/futureDefects/PredictionForecastMonitor";
import PredictionConfidencePanel from "@/components/futureDefects/PredictionConfidencePanel";
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

  // -----------------------------
  // Pattern + Confidence analysis
  // -----------------------------
  let pattern = "Unknown";
  let confidence = 0;
  let avgInterval = 0;

  if (predictions.length > 2) {

    const intervals = predictions.slice(1).map((p, i) => p - predictions[i]);

    avgInterval =
      intervals.reduce((a, b) => a + b, 0) / intervals.length;

    const std = Math.sqrt(
      intervals.reduce((sum, v) => sum + Math.pow(v - avgInterval, 2), 0) /
        intervals.length
    );

    // Pattern classification
    if (std < 2) pattern = "Repeating";
    else if (std < 10) pattern = "Drifting";
    else pattern = "Irregular";

    // Confidence score
    confidence = Math.max(0, Math.min(100, 100 - std * 10));
  }

  // -----------------------------
  // Chart Data
  // -----------------------------
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

      <h2 className="text-2xl font-bold">
        MODEL A — Live Prediction
      </h2>

      {/* INPUT */}
      <SequenceInputPanel onSubmit={predict} />

      {loading && (
        <p className="text-gray-500">
          Predicting...
        </p>
      )}

      {predictions.length > 0 && (
        <>

          {/* STATS */}
          <div className="grid grid-cols-4 gap-4">

            <Stat
              title="Next Position"
              value={`${predictions[0]} cm`}
              icon={FiMapPin}
            />

            <Stat
              title="Avg Interval"
              value={`${avgInterval.toFixed(1)} cm`}
              icon={FiActivity}
            />

            <Stat
              title="Confidence"
              value={`${confidence.toFixed(0)} %`}
              icon={FiTrendingUp}
            />

            <Stat
              title="Pattern"
              value={pattern}
              icon={FiActivity}
            />

          </div>

          {/* CHART */}
          <div className="bg-white p-6 rounded-xl">
            <Line data={chartData} />
          </div>

          {/* ANALYTICS */}
          <PredictionForecastMonitor predictions={predictions} />

          <PredictionConfidencePanel predictions={predictions} />

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

    <p className="text-xl font-bold">
      {value}
    </p>

  </div>

);

export default ModelAPrediction;