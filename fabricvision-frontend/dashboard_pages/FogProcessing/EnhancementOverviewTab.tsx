"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { toast } from "react-toastify";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";
import fabricPreview from "@/assets/im_1.png";

/* ---------------------------------------------
   Types & Interfaces
--------------------------------------------- */
type TrendType = "up" | "flat" | "down";
type StatusType = "safe" | "warning" | "critical";

interface MetricCardProps {
  title: string;
  value: number;
  unit?: string;
  note: string;
  color: string;
  icon?: React.ReactNode;
}

interface SystemStatus {
  uptime: string;
  avgFPS: number;
  latency: string;
  activeAlerts: number;
}

interface HistoryItem {
  time: string;
  profile: string;
  status: "Stable" | "Warning";
  confidence: number;
}

/* ---------------------------------------------
   Animation Variants
--------------------------------------------- */
const fadeIn: any = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2 },
  },
};

/* ---------------------------------------------
   Reusable Card Component
--------------------------------------------- */
const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}> = ({ children, className = "", noPadding = false }) => (
  <motion.div
    variants={fadeIn}
    initial="hidden"
    animate="visible"
    className={`rounded-xl bg-white/80 shadow-md border border-gray-200 ${
      noPadding ? "" : "p-4"
    } ${className}`}
  >
    {children}
  </motion.div>
);

/* ---------------------------------------------
   Loading Spinner
--------------------------------------------- */
const LoadingSpinner = () => (
  <motion.div
    className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      className="h-8 w-8 border-3 border-indigo-500 rounded-full border-t-transparent"
    />
  </motion.div>
);

/* ---------------------------------------------
   Compact Metric Card
--------------------------------------------- */
const CompactMetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit = "%",
  note,
  color,
  icon,
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let current = 0;
    const step = value / 20;
    const timer = setInterval(() => {
      current += step;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.round(current));
      }
    }, 15);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ scale: 1.02 }}
      className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow transition-shadow"
    >
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs font-medium text-gray-600">{title}</p>
        {icon && (
          <div
            className={`p-1.5 rounded-md ${color
              .replace("text", "bg")
              .replace("-600", "-50")}`}
          >
            {icon}
          </div>
        )}
      </div>
      <p className={`text-xl font-bold ${color}`}>
        {count}
        <span className="text-sm font-medium ml-0.5">{unit}</span>
      </p>
      <p className="text-xs text-gray-500 mt-2">{note}</p>
    </motion.div>
  );
};

/* ---------------------------------------------
   Compact Metric Row
--------------------------------------------- */
const CompactMetricRow = ({
  label,
  value,
  trend,
}: {
  label: string;
  value: string;
  trend: TrendType;
}) => {
  const trendConfig = {
    up: {
      icon: "↗",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      label: "Up",
    },
    flat: {
      icon: "→",
      color: "text-blue-600",
      bg: "bg-blue-50",
      label: "Stable",
    },
    down: {
      icon: "↘",
      color: "text-amber-600",
      bg: "bg-amber-50",
      label: "Down",
    },
  };
  const config = trendConfig[trend];

  return (
    <motion.div
      whileHover={{ x: 3 }}
      className="flex items-center justify-between py-3 px-4 bg-gray-50/80 rounded-lg border border-gray-100"
    >
      <div>
        <p className="text-xs font-medium text-gray-700">{label}</p>
        <p className="text-lg font-bold text-gray-900">{value}</p>
      </div>
      <div
        className={`px-3 py-1 rounded-full ${config.bg} ${config.color} text-xs font-semibold flex items-center gap-1.5`}
      >
        <span className="text-sm">{config.icon}</span>
        <span>{config.label}</span>
      </div>
    </motion.div>
  );
};

/* ---------------------------------------------
   Compact Status Badge
--------------------------------------------- */
const CompactStatusBadge = ({
  label,
  status,
  description,
}: {
  label: string;
  status: StatusType;
  description?: string;
}) => {
  const config = {
    safe: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      icon: "✓",
    },
    warning: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      icon: "⚠",
    },
    critical: {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
      icon: "✗",
    },
  }[status];

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className={`flex flex-col p-3 rounded-lg border ${config.border} ${config.bg}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-700">{label}</span>
        <span
          className={`text-xs font-semibold ${config.text} flex items-center gap-1.5`}
        >
          <span className="text-sm">{config.icon}</span>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>
      {description && (
        <p className="text-xs text-gray-600 mt-1">{description}</p>
      )}
    </motion.div>
  );
};

/* ---------------------------------------------
   MAIN DASHBOARD
--------------------------------------------- */
const EnhancementOverviewDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);

  const systemStatus: SystemStatus = {
    uptime: "99.9%",
    avgFPS: 28,
    latency: "62ms",
    activeAlerts: 3,
  };

  const fpsData = [
    { time: "14:00", fps: 30, target: 25 },
    { time: "14:05", fps: 28, target: 25 },
    { time: "14:10", fps: 29, target: 25 },
    { time: "14:15", fps: 31, target: 25 },
    { time: "14:20", fps: 27, target: 25 },
    { time: "14:25", fps: 30, target: 25 },
    { time: "14:30", fps: 32, target: 25 },
    { time: "14:35", fps: 29, target: 25 },
  ];

  const history: HistoryItem[] = [
    { time: "14:50", profile: "Light", status: "Stable", confidence: 94 },
    { time: "14:51", profile: "Dark", status: "Stable", confidence: 87 },
    { time: "14:52", profile: "Patterned", status: "Warning", confidence: 72 },
    { time: "14:53", profile: "Light", status: "Stable", confidence: 91 },
    { time: "14:54", profile: "Dark", status: "Stable", confidence: 89 },
    { time: "14:55", profile: "Textured", status: "Stable", confidence: 85 },
    { time: "14:56", profile: "Patterned", status: "Warning", confidence: 68 },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 space-y-6"
      >
        {/* Header Section - More Compact */}
        <Card className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Fabric Enhancement Monitoring
            </h1>
            <p className="text-xs text-gray-600 mt-0.5">
              Real-time AI-powered fabric enhancement analysis
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-emerald-700">
                System Active
              </span>
            </div>

            <div className="flex items-center gap-1 text-xs">
              <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
                Uptime: {systemStatus.uptime}
              </span>
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full font-medium">
                {systemStatus.activeAlerts} Alerts
              </span>
            </div>
          </div>
        </Card>

        {/* AI Enhancement Metrics Row - More Compact */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative h-48 lg:w-64 rounded-lg overflow-hidden border border-gray-200">
                <Image
                  src={fabricPreview}
                  alt="Enhanced Fabric Preview"
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                  <p className="text-xs font-medium text-white">
                    Enhanced Output
                  </p>
                  <p className="text-xs text-white/80">AI-processed frame</p>
                </div>
              </div>

              <div className="flex-1">
                <h2 className="text-base font-semibold text-gray-800 mb-3">
                  Enhancement Analysis
                </h2>
                <div className="grid grid-cols-1 gap-3">
                  <CompactMetricCard
                    title="Brightness Balance"
                    value={91}
                    note="Optimal lighting distribution"
                    color="text-blue-600"
                  />
                  <CompactMetricCard
                    title="Texture Clarity"
                    value={87}
                    note="Edge preservation and detail"
                    color="text-emerald-600"
                  />
                  <CompactMetricCard
                    title="Frame Quality Index"
                    value={89}
                    note="Overall enhancement quality"
                    color="text-indigo-600"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* AI Decision Summary - More Compact */}
          <Card>
            <h3 className="text-base font-semibold text-gray-800 mb-3">
              AI Decision Summary
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
                  <p className="text-xs text-gray-600 mb-1">Active Profile</p>
                  <p className="text-lg font-bold text-indigo-700">Patterned</p>
                </div>
                <div className="p-3 rounded-lg bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100">
                  <p className="text-xs text-gray-600 mb-1">Confidence</p>
                  <div className="flex items-center gap-1.5">
                    <p className="text-lg font-bold text-emerald-700">87%</p>
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "87%" }}
                        transition={{ duration: 0.8 }}
                        className="h-full bg-emerald-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-gray-50/80 rounded-md">
                  <span className="text-xs text-gray-700">Strategy</span>
                  <span className="text-xs font-semibold text-gray-900">
                    Edge-Preserving + Denoise
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50/80 rounded-md">
                  <span className="text-xs text-gray-700">Mode</span>
                  <span className="text-xs font-semibold text-gray-900">
                    Auto-Adaptive
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50/80 rounded-md">
                  <span className="text-xs text-gray-700">Target</span>
                  <span className="text-xs font-semibold text-gray-900">
                    ≥85 FQI
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Enhancement Safety & Performance Metrics Row - More Compact */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Enhancement Safety */}
          <Card>
            <h3 className="text-base font-semibold text-gray-800 mb-3">
              Safety Metrics
            </h3>
            <div className="grid grid-cols-1 gap-2">
              <CompactStatusBadge
                label="Over-Sharpening Risk"
                status="safe"
                description="No artifact introduction"
              />
              <CompactStatusBadge
                label="Contrast Saturation"
                status="safe"
                description="Balanced enhancement"
              />
              <CompactStatusBadge
                label="Noise Amplification"
                status="warning"
                description="Slight high-frequency noise"
              />
              <CompactStatusBadge
                label="Detail Preservation"
                status="safe"
                description="Critical details preserved"
              />
            </div>

            {/* <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
              <div className="flex items-start gap-2">
                <div className="p-1.5 bg-amber-100 rounded-md">
                  <span className="text-amber-600 text-sm font-bold">!</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-amber-800">
                    Safety Notice
                  </p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Noise detected in high-frequency regions
                  </p>
                </div>
              </div>
            </div> */}
          </Card>

          {/* Performance Metrics */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-800">
                Performance Metrics
              </h2>
              <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
                Live
              </span>
            </div>

            <div className="space-y-3">
              <CompactMetricRow
                label="System Uptime"
                value={systemStatus.uptime}
                trend="up"
              />
              <CompactMetricRow
                label="Average FPS"
                value={`${systemStatus.avgFPS}`}
                trend="flat"
              />
              <CompactMetricRow
                label="Processing Latency"
                value={systemStatus.latency}
                trend="down"
              />
              <CompactMetricRow
                label="Active Alerts"
                value={`${systemStatus.activeAlerts}`}
                trend="up"
              />
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Last Updated</span>
                <span className="font-medium text-gray-900">
                  {new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* FPS Trend Chart - More Compact */}
        <Card>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="lg:w-2/3">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-800">
                  FPS Trend
                </h2>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-xs text-gray-600">Actual</span>
                  <div className="w-2 h-2 rounded-full bg-gray-300 ml-2" />
                  <span className="text-xs text-gray-600">Target (25)</span>
                </div>
              </div>

              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={fpsData}>
                    <CartesianGrid strokeDasharray="2 2" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="time"
                      stroke="#6B7280"
                      fontSize={10}
                      tickMargin={5}
                    />
                    <YAxis
                      stroke="#6B7280"
                      fontSize={10}
                      label={{
                        value: "FPS",
                        angle: -90,
                        position: "insideLeft",
                        style: {
                          textAnchor: "middle",
                          fill: "#6B7280",
                          fontSize: "10px",
                        },
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(17,24,39,0.92)",
                        borderColor: "rgba(55,65,81,0.5)",
                        borderRadius: "6px",
                        color: "white",
                        fontSize: "12px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="target"
                      stroke="#9CA3AF"
                      fill="#9CA3AF"
                      fillOpacity={0.1}
                      strokeWidth={1}
                      strokeDasharray="3 3"
                      name="Target"
                    />
                    <Area
                      type="monotone"
                      dataKey="fps"
                      stroke="#3B82F6"
                      fill="url(#colorFps)"
                      strokeWidth={2}
                      name="Actual FPS"
                    />
                    <defs>
                      <linearGradient id="colorFps" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#3B82F6"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3B82F6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                <span>Frame rate stability monitoring</span>
                <span className="font-medium text-gray-700">
                  {fpsData.length} points
                </span>
              </div>
            </div>

            <div className="lg:w-1/3">
              <div className="h-full flex flex-col justify-center space-y-3">
                <div className="p-3 rounded-lg bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200">
                  <p className="text-xs text-gray-600 mb-1">Peak Performance</p>
                  <p className="text-lg font-bold text-indigo-700">32 FPS</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Achieved at 14:30
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200">
                  <p className="text-xs text-gray-600 mb-1">Average</p>
                  <p className="text-lg font-bold text-emerald-700">29.5 FPS</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    ±2 FPS variation
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
                  <p className="text-xs text-gray-600 mb-1">Minimum</p>
                  <p className="text-lg font-bold text-amber-700">27 FPS</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Acceptable range
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Enhancement History - More Compact */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800">
              Enhancement History
            </h2>
            <div className="flex items-center gap-1.5 text-red-700">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-semibold">LIVE</span>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50/80">
                <tr>
                  <th className="text-left p-3 text-xs font-semibold text-gray-700">
                    Time
                  </th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-700">
                    Profile
                  </th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-700">
                    Confidence
                  </th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="p-3 font-mono text-xs text-gray-900">
                      {h.time}
                    </td>
                    <td className="p-3">
                      <span className="text-xs font-medium text-gray-700">
                        {h.profile}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          h.status === "Stable"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {h.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${h.confidence}%` }}
                            transition={{ duration: 0.6 }}
                            className={`h-full rounded-full ${
                              h.confidence > 85
                                ? "bg-emerald-500"
                                : h.confidence > 70
                                ? "bg-amber-500"
                                : "bg-red-500"
                            }`}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-700">
                          {h.confidence}%
                        </span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex justify-between items-center text-xs text-gray-500">
            <span>Last {history.length} operations</span>
            <button
              onClick={() => toast.info("Loading full history...")}
              className="text-indigo-600 hover:text-indigo-700 font-medium text-xs"
            >
              Load More →
            </button>
          </div>
        </Card>

        {/* Footer Status - More Compact */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
            <p className="text-xs text-gray-600 mb-0.5">Enhancement Quality</p>
            <p className="text-lg font-bold text-indigo-700">Excellent</p>
          </div>
          <div className="p-3 rounded-lg bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200">
            <p className="text-xs text-gray-600 mb-0.5">System Health</p>
            <p className="text-lg font-bold text-emerald-700">Optimal</p>
          </div>
          <div className="p-3 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
            <p className="text-xs text-gray-600 mb-0.5">Recommendation</p>
            <p className="text-lg font-bold text-amber-700">
              Monitor Noise Levels
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EnhancementOverviewDashboard;
