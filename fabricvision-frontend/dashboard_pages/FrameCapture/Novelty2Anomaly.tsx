"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion, Variants, AnimatePresence } from "framer-motion";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
  type ChartData,
  type ChartOptions,
  type TooltipItem,
  type ScriptableContext,
} from "chart.js";
import { Line } from "react-chartjs-2";

import Live from "@/assets/LivePreview.jpeg";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
);

// -------------------- Types --------------------
type AnomalyStatus = "NORMAL" | "WARNING" | "ANOMALOUS";

interface AnomalyPoint {
  frame: number;
  score: number; // 0–1
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

interface LogItem {
  time: string;
  frame: number;
  message: string;
  level: "info" | "warning" | "error";
}

interface RegionPatch {
  region: string;
  error: number; // reconstruction error 0–1
}

// -------------------- Animation --------------------
const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// -------------------- Reusable Card --------------------
const Card: React.FC<CardProps> = ({ children, className = "" }) => (
  <motion.div
    variants={fadeIn}
    initial="hidden"
    animate="visible"
    className={`rounded-2xl bg-white/80 shadow-lg p-6 border border-gray-200 ${className}`}
  >
    {children}
  </motion.div>
);

// -------------------- Mock Data (replace with real backend later) --------------------
const THRESHOLD = 0.35;
const WARNING_MARGIN = 0.15;

const anomalySeries: AnomalyPoint[] = [
  { frame: 1010, score: 0.08 },
  { frame: 1015, score: 0.12 },
  { frame: 1020, score: 0.18 },
  { frame: 1025, score: 0.28 },
  { frame: 1030, score: 0.33 },
  { frame: 1035, score: 0.41 },
  { frame: 1040, score: 0.52 },
  { frame: 1045, score: 0.49 },
  { frame: 1050, score: 0.62 },
];

const latestPoint = anomalySeries[anomalySeries.length - 1];

const logs: LogItem[] = [
  {
    time: "10:32:10",
    frame: 1030,
    message: "Reconstruction error slightly above mean.",
    level: "info",
  },
  {
    time: "10:32:18",
    frame: 1035,
    message: "FIS crossed warning band (0.41).",
    level: "warning",
  },
  {
    time: "10:32:26",
    frame: 1050,
    message: "Anomalous region detected near left edge.",
    level: "error",
  },
];

const vimMean = 0.11;
const vimVar = 0.007;
const vimStability = 0.89;

const fisForwardedFrames = 720;
const fisFilteredFrames = 280;
const totalFrames = fisForwardedFrames + fisFilteredFrames;
const reductionPercent = (fisFilteredFrames / totalFrames) * 100;

// Region-level anomaly mock data
const regionPatches: RegionPatch[] = [
  { region: "Top-Left", error: 0.41 },
  { region: "Top-Right", error: 0.22 },
  { region: "Center", error: 0.35 },
  { region: "Bottom-Left", error: 0.18 },
  { region: "Bottom-Right", error: 0.79 }, // highest
];

const highestPatch: RegionPatch = regionPatches.reduce((a, b) =>
  a.error > b.error ? a : b,
);

// -------------------- Derived Status --------------------
const getStatus = (score: number): AnomalyStatus => {
  if (score < THRESHOLD) return "NORMAL";
  if (score < THRESHOLD + WARNING_MARGIN) return "WARNING";
  return "ANOMALOUS";
};

const status: AnomalyStatus = getStatus(latestPoint.score);

const statusConfig: Record<
  AnomalyStatus,
  { label: string; color: string; bg: string }
> = {
  NORMAL: {
    label: "Normal",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
  },
  WARNING: {
    label: "Warning",
    color: "text-amber-700",
    bg: "bg-amber-50",
  },
  ANOMALOUS: {
    label: "Anomalous",
    color: "text-red-700",
    bg: "bg-red-50",
  },
};

// -------------------- Chart.js Config --------------------
const labels: string[] = anomalySeries.map((p) => p.frame.toString());
const scores: number[] = anomalySeries.map((p) => p.score);

const getGradient = (ctx: CanvasRenderingContext2D): CanvasGradient => {
  const g = ctx.createLinearGradient(0, 0, 0, 260);
  g.addColorStop(0, "rgba(59,130,246,0.22)");
  g.addColorStop(0.5, "rgba(59,130,246,0.10)");
  g.addColorStop(1, "rgba(59,130,246,0.02)");
  return g;
};

const anomalyTrendData: ChartData<"line"> = {
  labels,
  datasets: [
    {
      label: "Anomaly Score (FIS)",
      data: scores,
      tension: 0.35,
      borderWidth: 3,
      pointRadius: 5,
      pointHoverRadius: 7,
      borderColor: "#3B82F6",
      pointBackgroundColor: "#1D4ED8",
      pointBorderColor: "#FFFFFF",
      pointBorderWidth: 2,
      fill: true,
      backgroundColor: (ctx: ScriptableContext<"line">) => {
        const { chart } = ctx;
        const { ctx: c, chartArea } = chart;
        if (!chartArea) return "rgba(59,130,246,0.08)";
        return getGradient(c);
      },
    },
    {
      label: "Threshold",
      data: labels.map(() => THRESHOLD),
      borderColor: "#EF4444",
      borderWidth: 2,
      borderDash: [6, 6],
      pointRadius: 0,
      fill: false,
    },
  ],
};

const anomalyTrendOptions: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      mode: "index",
      intersect: false,
      backgroundColor: "rgba(17,24,39,0.92)",
      borderColor: "rgba(55,65,81,0.5)",
      borderWidth: 1,
      padding: 10,
      cornerRadius: 8,
      callbacks: {
        label: (ctx: TooltipItem<"line">): string => {
          const label =
            ctx.datasetIndex === 1 ? "Threshold" : "Anomaly score (FIS)";
          const v = ctx.parsed.y ?? 0;
          return `${label}: ${v.toFixed(3)}`;
        },
      },
    },
  },
  scales: {
    x: {
      grid: { color: "rgba(229,231,235,0.6)" },
      ticks: {
        color: "#6B7280",
        font: { size: 11 },
      },
      title: {
        display: true,
        text: "Frame ID",
        color: "#6B7280",
        font: { size: 11 },
      },
    },
    y: {
      min: 0,
      max: 1,
      grid: { color: "rgba(229,231,235,0.5)" },
      ticks: {
        color: "#6B7280",
        font: { size: 11 },
      },
      title: {
        display: true,
        text: "FIS (0 – 1)",
        color: "#6B7280",
        font: { size: 11 },
      },
    },
  },
  interaction: {
    intersect: false,
    mode: "index",
  },
  animation: {
    duration: 900,
  },
};

// -------------------- Component --------------------
const Novelty2Anomaly: React.FC = () => {
  const statusStyles = statusConfig[status];

  const [loading, setLoading] = useState<boolean>(true);

  // 2-second loading spinner
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <motion.div
        className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="h-12 w-12 border-4 border-indigo-500 rounded-full border-t-transparent"
        ></motion.div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-8"
      >
        {/* ROW 1 – MAIN VISUALIZATION (3 big cards) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Original Frame */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Original Frame
            </h3>
            <div className="relative w-full h-52 md:h-56 rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
              <Image
                src={Live}
                alt="Original fabric frame"
                fill
                className="object-cover"
              />
            </div>
            <p className="mt-3 text-xs text-gray-500">
              Raw fabric frame received from motion-driven capture module.
            </p>
          </Card>

          {/* Autoencoder Reconstruction */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Autoencoder Reconstruction
            </h3>
            <div className="relative w-full h-52 md:h-56 rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
              <Image
                src={Live}
                alt="Reconstructed fabric frame"
                fill
                className="object-cover opacity-95"
              />
            </div>
            <p className="mt-3 text-xs text-gray-500">
              Output of the 128×128 convolutional autoencoder trained only on
              defect-free fabric.
            </p>
          </Card>

          {/* Error / Irregularity Heatmap */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Visual Irregularity Map (VIM)
            </h3>
            <div className="relative w-full h-52 md:h-56 rounded-xl overflow-hidden border border-gray-200 bg-gray-900">
              {/* Placeholder gradient; you’ll later replace this with real VIM heatmap */}
              <div className="w-full h-full bg-[radial-gradient(circle_at_30%_30%,rgba(239,68,68,0.9),transparent_55%),radial-gradient(circle_at_70%_60%,rgba(245,158,11,0.9),transparent_55%),radial-gradient(circle_at_50%_90%,rgba(59,130,246,0.7),transparent_55%)]" />
            </div>
            <p className="mt-3 text-xs text-gray-500">
              High-energy regions show where reconstruction error is
              concentrated. Brighter areas = higher anomaly probability.
            </p>
          </Card>
        </div>

        {/* ROW 2 – SCORE GAUGE + REGION BREAKDOWN + TREND CHART */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* LEFT COLUMN: FIS Decision + Region Breakdown */}
          <div className="space-y-4">
            {/* Anomaly Score & FIS Decision */}
            <Card className="flex flex-col md:flex-row items-center md:items-start gap-8 py-6">
              {/* Top Status Badge (Centered & Balanced) */}
              <div className="w-full flex justify-center mb-2 md:hidden">
                <span
                  className={`px-4 py-1 rounded-full text-xs font-semibold ${statusStyles.bg} ${statusStyles.color}`}
                >
                  Current status: {statusStyles.label}
                </span>
              </div>

              {/* Gauge Section */}
              <div className="flex flex-col items-center justify-center md:w-1/3 space-y-3">
                <div className="relative w-36 h-36">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center">
                    <div className="w-28 h-28 rounded-full bg-white shadow-inner flex items-center justify-center">
                      <span className="text-3xl font-bold text-gray-900">
                        {latestPoint.score.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 uppercase tracking-wide text-center">
                  FIS (Frame Irregularity Score)
                </p>
              </div>

              {/* Divider for Desktop */}
              <div className="hidden md:block w-px bg-gray-200" />

              {/* Right Side – Details */}
              <div className="flex-1 w-full space-y-4">
                {/* Status Badge (Desktop Only) */}
                <div className="hidden md:flex">
                  <span
                    className={`px-4 py-1 rounded-full text-xs font-semibold ${statusStyles.bg} ${statusStyles.color}`}
                  >
                    Current status: {statusStyles.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                  <div>
                    <p className="text-gray-500 text-xs uppercase mb-1">
                      Latest Frame
                    </p>
                    <p className="font-semibold">#{latestPoint.frame}</p>
                  </div>

                  <div>
                    <p className="text-gray-500 text-xs uppercase mb-1">
                      Threshold (μ + 3σ)
                    </p>
                    <p className="font-semibold">{THRESHOLD.toFixed(2)}</p>
                  </div>

                  <div>
                    <p className="text-gray-500 text-xs uppercase mb-1">
                      Decision
                    </p>
                    <p className="font-semibold">
                      {status === "ANOMALOUS"
                        ? "Forward to Defect Detector"
                        : status === "WARNING"
                          ? "Flag for Review"
                          : "Treat as Normal"}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500 text-xs uppercase mb-1">
                      Confidence (Edge Estimate)
                    </p>
                    <p className="font-semibold">
                      ~{(latestPoint.score * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed">
                  FIS is computed as the mean squared error between original and
                  reconstructed frame. Frames above threshold are considered
                  anomalous and are prioritized for Component 3 (YOLO).
                </p>
              </div>
            </Card>

            {/* Region Breakdown Card */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Anomaly Region Breakdown
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                {regionPatches.map((p) => {
                  const isHighest = p.region === highestPatch.region;

                  return (
                    <div
                      key={p.region}
                      className={`flex flex-col p-3 rounded-lg border ${
                        isHighest
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <span
                        className={`font-semibold ${
                          isHighest ? "text-red-700" : "text-gray-700"
                        }`}
                      >
                        {p.region}
                      </span>
                      <span
                        className={`text-sm mt-1 ${
                          isHighest ? "text-red-600 font-bold" : "text-gray-600"
                        }`}
                      >
                        Error Score: {p.error.toFixed(2)}
                      </span>
                      {isHighest && (
                        <span className="text-[11px] mt-1 text-red-600 font-semibold">
                          Highest anomaly region
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <p className="text-xs text-gray-500 mt-4 leading-relaxed">
                Error values represent mean reconstruction error across local
                spatial patches in the VIM. Regions with higher scores indicate
                dominant irregularity zones and help localize anomalies prior to
                forwarding frames to Component 3 (YOLO).
              </p>
            </Card>
          </div>

          {/* RIGHT COLUMN: Anomaly Trend Line Chart */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Anomaly Trend Across Recent Frames
            </h3>
            <div className="w-full h-82 md:h-118">
              <Line data={anomalyTrendData} options={anomalyTrendOptions} />
            </div>
            <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
              <span>
                Higher FIS = higher reconstruction error. Red dashed line shows
                adaptive threshold (μ + 3σ).
              </span>
            </div>
          </Card>
        </div>

        {/* ROW 3 – VIM / FIS / Reduction cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* VIM metrics */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              VIM Metrics
            </h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>VIM Mean</span>
                <span className="font-semibold">{vimMean.toFixed(3)}</span>
              </div>
              <div className="flex justify-between">
                <span>VIM Variance</span>
                <span className="font-semibold">{vimVar.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span>Texture Stability Index</span>
                <span className="font-semibold">{vimStability.toFixed(2)}</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              VIM summarises local irregularity of weave texture. Higher
              variance usually indicates unstable or defective regions.
            </p>
          </Card>

          {/* FIS summary */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              FIS Routing Summary
            </h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Frames forwarded to YOLO</span>
                <span className="font-semibold">{fisForwardedFrames}</span>
              </div>
              <div className="flex justify-between">
                <span>Frames filtered at edge</span>
                <span className="font-semibold">{fisFilteredFrames}</span>
              </div>
              <div className="flex justify-between">
                <span>Forwarding ratio</span>
                <span className="font-semibold">
                  {((fisForwardedFrames / totalFrames) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Only frames with meaningful irregularity are forwarded, reducing
              load on the defect detection model.
            </p>
          </Card>

          {/* Data reduction */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Data Reduction
            </h3>
            <div className="flex items-center justify-between">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 rounded-full bg-gray-100 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-inner">
                    <span className="text-xl font-bold text-emerald-600">
                      {reductionPercent.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex-1 ml-4 text-sm text-gray-700 space-y-1">
                <p className="font-semibold">
                  Frames safely dropped at pre-screen stage.
                </p>
                <p className="text-xs text-gray-500">
                  Reduces bandwidth and compute cost for downstream defect
                  detection while maintaining coverage of risky segments.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* ROW 4 – Logs */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Anomaly Events Log
            </h3>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span className="inline-flex items-center px-3 py-2 rounded-full bg-gray-100 outline">
                <span className="w-2 h-2 rounded-full bg-red-500 mr-1.5 animate-pulse font-bold" />
                LIVE
              </span>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto pr-1">
            {logs.map((log) => (
              <div
                key={`${log.time}-${log.frame}-${log.message}`}
                className="flex items-start justify-between text-sm py-2 border-b border-gray-100 last:border-0"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex flex-col items-end text-xs text-gray-500 w-20">
                    <span className="font-mono">{log.time}</span>
                    <span className="font-mono text-[11px] text-gray-400">
                      #{log.frame}
                    </span>
                  </div>
                  <p className="text-gray-700">{log.message}</p>
                </div>
                <span
                  className={`ml-4 text-[11px] font-semibold uppercase px-4 py-1.5 rounded-full ${
                    log.level === "error"
                      ? "bg-red-100 text-red-700 outline outline-red-700"
                      : log.level === "warning"
                        ? "bg-amber-100 text-amber-700 outline outline-orange-700"
                        : "bg-gray-100 text-gray-600 outline outline-gray-700"
                  }`}
                >
                  {log.level}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default Novelty2Anomaly;
