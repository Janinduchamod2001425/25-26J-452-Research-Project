"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import fabricPreview from "@/assets/im_1.png";

// Loading Spinner Component
const LoadingSpinner = () => (
  <motion.div
    className="flex items-center justify-center min-h-screen"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      className="h-12 w-12 border-4 border-indigo-500 rounded-full border-t-transparent"
    />
  </motion.div>
);

// Animated Metric Card Component
const AnimatedMetricCard = ({ title, value, unit = "%", note, color }: any) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let current = 0;
    const step = value / 30;
    const timer = setInterval(() => {
      current += step;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.round(current));
      }
    }, 20);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm"
    >
      <p className="text-sm text-gray-600 mb-2">{title}</p>
      <p className={`text-3xl font-bold ${color}`}>
        {count}
        <span className="text-lg font-medium">{unit}</span>
      </p>
      <p className="text-xs text-gray-500 mt-2">{note}</p>
    </motion.div>
  );
};

// Metric Row Component
const MetricRow = ({
  label,
  value,
  trend,
}: {
  label: string;
  value: string;
  trend: "up" | "flat" | "down";
}) => {
  const trendConfig = {
    up: { icon: "↗", color: "text-green-500", bg: "bg-green-50" },
    flat: { icon: "→", color: "text-blue-500", bg: "bg-blue-50" },
    down: { icon: "↘", color: "text-amber-500", bg: "bg-amber-50" },
  };
  const config = trendConfig[trend];

  return (
    <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      <div
        className={`px-3 py-1 rounded-full ${config.bg} ${config.color} text-sm font-medium`}
      >
        {config.icon} {trend.toUpperCase()}
      </div>
    </div>
  );
};

// Alert Card Component
const AlertCard = ({
  alert,
}: {
  alert: {
    id: number;
    level: string;
    message: string;
    time: string;
    date: string;
  };
}) => {
  const bg =
    alert.level === "High"
      ? "bg-red-50 border-l-4 border-red-500"
      : alert.level === "Medium"
      ? "bg-amber-50 border-l-4 border-amber-500"
      : "bg-blue-50 border-l-4 border-blue-500";

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-start rounded-lg p-4 ${bg} shadow-sm hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start gap-3 w-full">
        <div
          className={`w-3 h-3 rounded-full mt-1.5 ${
            alert.level === "High"
              ? "bg-red-500"
              : alert.level === "Medium"
              ? "bg-amber-500"
              : "bg-blue-500"
          }`}
        />
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {alert.level} Alert
              </p>
              <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-gray-500">{alert.time}</p>
              <p className="text-xs text-gray-400">{alert.date}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Main Dashboard Component
const EnhancementOverviewDashboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [systemStatus, setSystemStatus] = useState({
    active: true,
    uptime: "99.9%",
    avgFPS: 28,
    latency: "62ms",
    activeAlerts: 3,
  });

  // Chart data
  const fpsData = [
    { time: "14:00", fps: 30 },
    { time: "14:05", fps: 28 },
    { time: "14:10", fps: 29 },
    { time: "14:15", fps: 31 },
    { time: "14:20", fps: 27 },
    { time: "14:25", fps: 30 },
  ];

  const qualityData = [
    { segment: "0–10m", quality: 88, risk: 12 },
    { segment: "10–20m", quality: 92, risk: 8 },
    { segment: "20–30m", quality: 85, risk: 15 },
    { segment: "30–40m", quality: 94, risk: 6 },
    { segment: "40–50m", quality: 90, risk: 10 },
  ];

  const alerts = [
    {
      id: 1,
      level: "High",
      message: "Low lighting detected in section B",
      time: "2:45 PM",
      date: "Today",
    },
    {
      id: 2,
      level: "Medium",
      message: "FPS dropped below threshold",
      time: "2:30 PM",
      date: "Today",
    },
    {
      id: 3,
      level: "Low",
      message: "Brightness fluctuation detected",
      time: "2:15 PM",
      date: "Today",
    },
  ];

  const history = [
    { time: "2:50 PM", profile: "Light", fabric: "Cotton", status: "Stable" },
    { time: "2:51 PM", profile: "Dark", fabric: "Denim", status: "Stable" },
    {
      time: "2:52 PM",
      profile: "Patterned",
      // fabric: "Printed",
      status: "Warning",
    },
    {
      time: "2:53 PM",
      profile: "Light",
      // fabric: "Polyester",
      status: "Stable",
    },
    {
      time: "2:54 PM",
      profile: "Dark",
      // fabric: "Silk",
      status: "Stable",
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="min-h-screen bg-gray-50 p-6"
      >
        <div className="space-y-6 max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Fabric Enhancement Monitoring
              </h1>
              <p className="text-gray-600">
                Edge-level image enhancement & reliability dashboard
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">System Active</span>
              </div>
              <div className="text-sm text-gray-500">
                Last updated: Just now
              </div>
            </div>
          </div>

          {/* AI Analysis Card */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              AI-Based Enhancement Analysis
            </h2>

            <div className="flex flex-col lg:flex-row gap-6">
              {/* Preview Image */}
              <div className="lg:w-64">
                <div className="relative h-48 w-full rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={fabricPreview}
                    alt="Enhanced Fabric Preview"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Enhanced Fabric Preview
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                <AnimatedMetricCard
                  title="Brightness Balance"
                  value={91}
                  note="Within optimal range"
                  color="text-blue-600"
                />
                <AnimatedMetricCard
                  title="Texture Clarity"
                  value={87}
                  note="Excellent edge detection"
                  color="text-emerald-600"
                />
                <AnimatedMetricCard
                  title="Frame Quality"
                  value={89}
                  note="High resolution output"
                  color="text-indigo-600"
                />
              </div>
            </div>
          </motion.section>

          {/* Performance Metrics & FPS Chart Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Performance Metrics
              </h2>
              <div className="space-y-4">
                <MetricRow label="System Uptime" value="99.9%" trend="up" />
                <MetricRow label="Average FPS" value="28" trend="flat" />
                <MetricRow label="Latency" value="62 ms" trend="down" />
                <MetricRow label="Active Alerts" value="3" trend="up" />
              </div>
            </motion.div>

            {/* FPS Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  FPS Trend
                </h2>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Real-time FPS</span>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={fpsData}>
                    <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #E5E7EB",
                        borderRadius: "6px",
                        fontSize: "12px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="fps"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#3B82F6" }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Quality vs Risk Chart & Alerts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quality vs Risk Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Quality vs Defect Risk
                </h2>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Quality</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Risk</span>
                  </div>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={qualityData}>
                    <XAxis dataKey="segment" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #E5E7EB",
                        borderRadius: "6px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar
                      dataKey="quality"
                      fill="#10B981"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar dataKey="risk" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Alerts Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Active Alerts
                </h2>
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                  {alerts.length} Active
                </span>
              </div>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <AlertCard key={alert.id} alert={alert} />
                ))}
              </div>
            </motion.div>
          </div>

          {/* History Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Enhancement History
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">
                      Time
                    </th>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">
                      Profile
                    </th>
                    {/* <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">
                      Fabric Type
                    </th> */}
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {history.map((row, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-6 text-sm text-gray-900">
                        {row.time}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-900">
                        {row.profile}
                      </td>
                      {/* <td className="py-4 px-6 text-sm text-gray-900">
                        {row.fabric}
                      </td> */}
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            row.status === "Stable"
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {row.status === "Stable" ? "✓" : "⚠"} {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Quick Stats Footer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm"
          >
            <h3 className="font-semibold text-gray-800 mb-4">System Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Uptime</p>
                <p className="text-2xl font-bold text-blue-600">
                  {systemStatus.uptime}
                </p>
              </div>
              <div className="text-center p-4 bg-emerald-50 rounded-lg">
                <p className="text-sm text-gray-600">Avg FPS</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {systemStatus.avgFPS}
                </p>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-lg">
                <p className="text-sm text-gray-600">Latency</p>
                <p className="text-2xl font-bold text-amber-600">
                  {systemStatus.latency}
                </p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600">Alerts</p>
                <p className="text-2xl font-bold text-red-600">
                  {systemStatus.activeAlerts}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EnhancementOverviewDashboard;
