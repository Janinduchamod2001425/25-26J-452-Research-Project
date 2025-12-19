"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Inter } from "next/font/google";

import Live from "@/assets/LivePreview.jpeg";

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
} from "chart.js";
import { Line } from "react-chartjs-2";
import {
  AlertTriangle,
  Pause,
  PauseCircle,
  Play,
  PlayCircle,
} from "lucide-react";

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

// -------------------- Fonts --------------------
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-inter",
});

// -------------------- Types --------------------
type MotionState = "ACTIVE" | "IDLE" | "UNSTABLE";

interface MotionStatus {
  state: MotionState;
  fps: number;
  mode: "Fabric Roll" | "Cut Piece";
  confidence: number; // 0–1
}

interface FrameStats {
  totalFrames: number;
  savedFrames: number;
  ignoredFrames: number;
}

interface IdleSummary {
  longestGapSec: number;
  events: number;
  totalIdleSec: number;
}

interface MotionTimelinePoint {
  label: string; // e.g. "10:20", "10:21"
  state: MotionState;
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

interface LogEntryProps {
  time: string;
  message: string;
}

// -------------------- Mock Data (replace with real API later) --------------------
const motionStatus: MotionStatus = {
  state: "ACTIVE",
  fps: 24,
  mode: "Fabric Roll",
  confidence: 0.95,
};

const frameStats: FrameStats = {
  totalFrames: 1235,
  savedFrames: 980,
  ignoredFrames: 255,
};

const idleSummary: IdleSummary = {
  longestGapSec: 12,
  events: 4,
  totalIdleSec: 38,
};

const timelinePoints: MotionTimelinePoint[] = [
  { label: "10:20", state: "IDLE" },
  { label: "10:21", state: "ACTIVE" },
  { label: "10:22", state: "ACTIVE" },
  { label: "10:23", state: "UNSTABLE" },
  { label: "10:24", state: "ACTIVE" },
  { label: "10:25", state: "IDLE" },
  { label: "10:26", state: "ACTIVE" },
];

interface LogItem {
  time: string;
  message: string;
}

const logs: LogItem[] = [
  { time: "10:22:01", message: "Fabric Detected" },
  { time: "10:22:02", message: "Motion State: ACTIVE" },
  { time: "10:22:03", message: "Frame Captured" },
  { time: "10:22:04", message: "Motion State: IDLE" },
  { time: "10:22:06", message: "Motion State: ACTIVE" },
  { time: "10:22:10", message: "Idle Gap: 6s" },
];

// -------------------- Animations --------------------
const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.4 } },
};

// -------------------- Reusable Components --------------------
const Card: React.FC<CardProps> = ({ children, className = "" }) => (
  <motion.div
    variants={fadeIn}
    className={`rounded-2xl  shadow-lg p-6 border border-gray-200 ${className}`}
  >
    {children}
  </motion.div>
);

const LogEntry: React.FC<LogEntryProps> = ({ time, message }) => (
  <div className="flex justify-between text-sm text-gray-600 py-1 border-b border-gray-100">
    <span className="font-mono">{time}</span>
    <span>{message}</span>
  </div>
);

// -------------------- Chart.js config --------------------
const stateToNumeric = (state: MotionState): number => {
  if (state === "IDLE") return 0;
  if (state === "ACTIVE") return 1;
  return 0.5; // UNSTABLE
};

const timelineLabels: string[] = timelinePoints.map((p) => p.label);
const timelineValues: number[] = timelinePoints.map((p) =>
  stateToNumeric(p.state),
);

// Add color configuration for the chart
const getPointColor = (state: MotionState): string => {
  switch (state) {
    case "ACTIVE":
      return "#10B981"; // Green
    case "IDLE":
      return "#EF4444"; // Red
    case "UNSTABLE":
      return "#F59E0B"; // Amber
    default:
      return "#6B7280"; // Gray
  }
};

const getPointBorderColor = (state: MotionState): string => {
  switch (state) {
    case "ACTIVE":
      return "#047857"; // Darker Green
    case "IDLE":
      return "#DC2626"; // Darker Red
    case "UNSTABLE":
      return "#D97706"; // Darker Amber
    default:
      return "#4B5563"; // Darker Gray
  }
};

const getGradientColors = (ctx: CanvasRenderingContext2D): CanvasGradient => {
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, "rgba(59, 130, 246, 0.3)"); // Blue with opacity
  gradient.addColorStop(0.5, "rgba(59, 130, 246, 0.15)");
  gradient.addColorStop(1, "rgba(59, 130, 246, 0.05)");
  return gradient;
};

const motionTimelineData: ChartData<"line"> = {
  labels: timelineLabels,
  datasets: [
    {
      label: "Motion State",
      data: timelineValues,
      fill: true,
      tension: 0.35,
      pointRadius: 6,
      pointHoverRadius: 8,
      pointBackgroundColor: timelinePoints.map((p) => getPointColor(p.state)),
      pointBorderColor: timelinePoints.map((p) => getPointBorderColor(p.state)),
      pointBorderWidth: 2,
      backgroundColor: (context) => {
        const chart = context.chart;
        const { ctx, chartArea } = chart;
        if (!chartArea) return "rgba(59, 130, 246, 0.1)";
        return getGradientColors(ctx);
      },
      borderColor: "#3B82F6", // Blue border
      borderWidth: 3,
      pointHoverBackgroundColor: "#FFFFFF",
      pointHoverBorderColor: "#1D4ED8",
      pointHoverBorderWidth: 3,
    },
  ],
};

const motionTimelineOptions: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      titleColor: "#111827",
      bodyColor: "#374151",
      borderColor: "#E5E7EB",
      borderWidth: 1,
      padding: 12,
      cornerRadius: 8,
      displayColors: false,
      callbacks: {
        label: (ctx) => {
          const value = ctx.parsed.y;
          let label: MotionState = "IDLE";
          let color = "#EF4444"; // Red
          if (value === 1) {
            label = "ACTIVE";
            color = "#10B981"; // Green
          } else if (value === 0.5) {
            label = "UNSTABLE";
            color = "#F59E0B"; // Amber
          }
          return ` ${label}`;
        },
        labelColor: (ctx) => {
          const value = ctx.parsed.y;
          let color = "#EF4444"; // Red
          if (value === 1)
            color = "#10B981"; // Green
          else if (value === 0.5) color = "#F59E0B"; // Amber
          return {
            borderColor: color,
            backgroundColor: color,
            borderWidth: 3,
            borderRadius: 2,
          };
        },
      },
    },
  },
  scales: {
    x: {
      grid: {
        color: "rgba(229, 231, 235, 0.5)",
      },
      ticks: {
        color: "#6B7280",
        font: {
          size: 11,
        },
      },
    },
    y: {
      min: -0.1,
      max: 1.1,
      grid: {
        color: "rgba(229, 231, 235, 0.5)",
      },
      ticks: {
        color: "#6B7280",
        font: {
          size: 11,
        },
        callback: function (value) {
          if (value === 0) return "IDLE";
          if (value === 0.5) return "UNSTABLE";
          if (value === 1) return "ACTIVE";
          return "";
        },
      },
    },
  },
  interaction: {
    intersect: false,
    mode: "index",
  },
  animation: {
    duration: 1000,
  },
};

const Novelty1Motion: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);

  // 2-second loading spinner
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const activeRatio =
    (frameStats.savedFrames / frameStats.totalFrames) * 100 || 0;
  const idleRatio = 100 - activeRatio;
  const reduction =
    (frameStats.ignoredFrames / frameStats.totalFrames) * 100 || 0;

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
        key="frame-dashboard"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={fadeIn}
        className={`min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 ${inter.className}`}
      >
        {/* -------------------- MAIN GRID -------------------- */}
        <div className="max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            {/* Live Status */}
            <Card className="min-h-[190px] bg-green-50">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Live Motion Status
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span className="font-semibold">Mode</span>
                  <span className="font-bold">{motionStatus.mode}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span className="font-semibold">FPS</span>
                  <span className="font-bold">{motionStatus.fps}</span>
                </div>
                <div className="flex justify-between items-center mt-3">
                  <span className="font-semibold text-gray-700">State</span>
                  <span className="px-4 py-1 rounded-full bg-green-600 text-white font-bold">
                    {motionStatus.state}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="font-semibold text-gray-700">
                    Confidence
                  </span>
                  <span className="font-bold text-gray-800">
                    {(motionStatus.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </Card>

            {/* Live Preview Card (static image) */}
            <Card className="min-h-[220px]">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Live Preview (Sample Frame)
              </h3>
              <div className="relative w-full h-40 rounded-xl overflow-hidden border border-gray-200 bg-black/5">
                {/* Replace src with your real frame image / API later */}
                <Image
                  src={Live}
                  alt="Current fabric frame"
                  fill
                  className="object-cover"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Static sample image for demo. In production, this will show the
                latest captured frame when motion is ACTIVE.
              </p>
            </Card>

            {/* Frame Stats & Efficiency */}
            <Card className="min-h-[210px]">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Frame Capture Metrics
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>Total Frames (Camera)</span>
                  <span className="font-bold">{frameStats.totalFrames}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Saved Frames (Active)</span>
                  <span className="font-bold text-green-700">
                    {frameStats.savedFrames}
                  </span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Ignored Frames (Idle)</span>
                  <span className="font-bold text-gray-800">
                    {frameStats.ignoredFrames}
                  </span>
                </div>
                <div className="flex justify-between text-gray-700 pt-1 border-t border-gray-100">
                  <span>Active Ratio</span>
                  <span className="font-bold">{activeRatio.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Idle Ratio</span>
                  <span className="font-bold">{idleRatio.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Data Reduction</span>
                  <span className="font-bold text-green-700">
                    {reduction.toFixed(1)}% less frames
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* MIDDLE COLUMN */}
          <div className="space-y-6">
            {/* Motion Timeline (Chart.js) */}
            <Card className="min-h-[280px]">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Motion Timeline (Last Window)
              </h3>
              <div className="w-full h-[200px]">
                <Line
                  data={motionTimelineData}
                  options={motionTimelineOptions}
                />
              </div>
              {/* You can add a legend if you want */}
              <div className="flex justify-center items-center space-x-4 mt-4">
                <div className="flex items-center space-x-1">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span className="text-xs text-gray-600">ACTIVE</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                  <span className="text-xs text-gray-600">UNSTABLE</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <span className="text-xs text-gray-600">IDLE</span>
                </div>
              </div>
            </Card>

            {/* Live Logs */}
            <Card className="min-h-[320px]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Live Logs</h3>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse -mt-[2px]"></div>
                  <span className="text-sm font-semibold text-gray-600">
                    LIVE
                  </span>
                </div>
              </div>
              <div className="space-y-1 max-h-[240px] overflow-y-auto pr-2">
                {logs.map((log) => (
                  <LogEntry
                    key={`${log.time}-${log.message}`}
                    time={log.time}
                    message={log.message}
                  />
                ))}
              </div>
            </Card>

            {/* Camera Health */}
            <Card className="min-h-[190px]">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Camera & Edge Health
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex justify-between">
                  <span>Lighting</span>
                  <span className="text-green-600 font-semibold">OK</span>
                </li>
                <li className="flex justify-between">
                  <span>Vibration</span>
                  <span className="text-green-600 font-semibold">Stable</span>
                </li>
                <li className="flex justify-between">
                  <span>Connection</span>
                  <span className="text-green-600 font-semibold">
                    Connected
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Motion Model</span>
                  <span className="text-green-600 font-semibold">Running</span>
                </li>
              </ul>
            </Card>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            {/* Capture Rules */}
            <Card className="border border-gray-300 bg-white">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Frame Capture Logic
              </h3>

              <div className="space-y-3">
                {/* ACTIVE */}
                <div className="flex items-start gap-4 p-3 border-l-4 border-green-500 bg-green-50 rounded">
                  <Play className="w-6 h-6 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-700">
                      ACTIVE — Capture Frames
                    </p>
                    <p className="text-xs text-gray-700">
                      Stable fabric motion • Full FPS capture
                    </p>
                  </div>
                </div>

                {/* UNSTABLE */}
                <div className="flex items-start gap-4 p-3 border-l-4 border-amber-500 bg-amber-50 rounded">
                  <AlertTriangle className="w-6 h-6 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-700">
                      UNSTABLE — Adaptive Capture
                    </p>
                    <p className="text-xs text-gray-700">
                      Motion fluctuation • Burst capture near transitions
                    </p>
                  </div>
                </div>

                {/* IDLE */}
                <div className="flex items-start gap-4 p-3 border-l-4 border-red-500 bg-red-50 rounded">
                  <Pause className="w-6 h-6 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-700">
                      IDLE — Skip Frames
                    </p>
                    <p className="text-xs text-gray-700">
                      No effective motion • Frames ignored
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-[11px] text-gray-500 leading-relaxed">
                Rule-based capture logic applied at the edge to reduce redundant
                frames before downstream processing.
              </p>
            </Card>

            {/* Motion Stability */}
            <Card className="min-h-[150px]">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Motion Stability
              </h3>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-semibold text-lg">
                  Stability Score
                </span>
                <span className="text-3xl font-bold text-green-600">0.92</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                1.0 = continuous stable motion • 0 = no effective motion
              </p>
            </Card>

            {/* Idle Event Summary */}
            <Card className="min-h-[170px]">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Idle Event Summary
              </h3>
              <div className="space-y-3 text-gray-700">
                <div className="flex justify-between">
                  <span>Idle Events</span>
                  <span className="font-bold">{idleSummary.events}</span>
                </div>
                <div className="flex justify-between">
                  <span>Longest Idle Gap</span>
                  <span className="font-bold">
                    {idleSummary.longestGapSec}s
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Idle Duration</span>
                  <span className="font-bold">{idleSummary.totalIdleSec}s</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* FOOTER */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-[1500px] mx-auto mt-10 pt-6 border-t border-gray-200 text-sm text-gray-500"
        >
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
            <span>
              <strong>Operator Dashboard • Novelty 1</strong> — Motion-Driven
              Capture
            </span>
            <span className="font-mono">
              Session ID: MD-2025-01-01-001 • Updated Now
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Novelty1Motion;
