"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Inter } from "next/font/google";

// -------------------- Fonts --------------------
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-inter",
});

// -------------------- Types --------------------
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

interface LogEntryProps {
  time: string;
  message: string;
}

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
    className={`rounded-2xl bg-white/80 shadow-lg p-7 border border-gray-200 ${className}`}
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

const OperatorDashboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);

  // 3-second loading spinner
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
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
        key="operator-dashboard"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={fadeIn}
        className={`p-6 min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 ${inter.className}`}
      >
        {/* -------------------- HEADER -------------------- */}
        <div className="max-w-[1500px] mx-auto mb-8">
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-gray-600 text-sm font-mono mb-2"
          >
            Real-time Monitoring & Diagnostics
          </motion.h1>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold text-gray-800 mb-1"
          >
            Operator Dashboard
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-lg font-semibold text-gray-600"
          >
            System Performance • Frame Analytics • Live Monitoring
          </motion.p>
        </div>

        {/* -------------------- MAIN GRID -------------------- */}
        <div className="max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            {/* System Performance */}
            <Card className="min-h-[280px]">
              <h3 className="text-xl font-bold text-gray-800 mb-6">
                System Performance
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 px-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50">
                  <span className="font-semibold text-gray-700">
                    Capture Efficiency
                  </span>
                  <span className="text-2xl font-bold text-gray-800">84%</span>
                </div>
                <div className="flex justify-between items-center py-3 px-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50">
                  <span className="font-semibold text-gray-700">
                    Upload Success
                  </span>
                  <span className="text-2xl font-bold text-gray-800">96%</span>
                </div>
                <div className="flex justify-between items-center py-3 px-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50">
                  <span className="font-semibold text-gray-700">
                    Average Latency
                  </span>
                  <span className="text-2xl font-bold text-gray-800">
                    145 ms
                  </span>
                </div>
              </div>
            </Card>

            {/* Frame Quality Summary */}
            <Card className="min-h-[240px]">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Frame Quality Summary
              </h3>
              <div className="space-y-4">
                <div className="rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 p-4">
                  <h4 className="text-sm font-semibold text-gray-600 mb-3">
                    Camera Health Diagnostics
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-800 mb-1">
                        0.95
                      </div>
                      <div className="text-xs text-gray-500">
                        Lighting Focus
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600 mb-1">
                        GOOD
                      </div>
                      <div className="text-xs text-gray-500">Stabilization</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Frame Uploaded */}
            <Card className="min-h-[220px]">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  Frame Uploaded
                </h3>
                <div className="px-3 py-1 rounded-full bg-red-100 text-red-600 text-sm font-bold">
                  DISK LEVEL: LOW
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-700">Avg FQI</span>
                  <span className="font-bold text-gray-800">0.91</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-700">Avg Anomaly</span>
                  <span className="font-bold text-gray-800">0.26</span>
                </div>
                <div className="pt-2">
                  <p className="text-xs text-gray-500">
                    Role Quality Index (RQI) metrics for frame stability
                    assessment
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* MIDDLE COLUMN */}
          <div className="space-y-6">
            {/* Texture Density Index */}
            <Card className="min-h-[240px]">
              <h3 className="text-xl font-bold text-gray-800 mb-6">
                Texture Density Index
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 p-4 text-center">
                  <div className="text-3xl font-bold text-gray-800 mb-1">
                    0.87
                  </div>
                  <div className="text-sm font-semibold text-gray-600">TDI</div>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-4 text-center">
                  <div className="text-3xl font-bold text-gray-800 mb-1">
                    0.97
                  </div>
                  <div className="text-sm font-semibold text-gray-600">
                    Entropy
                  </div>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-cyan-50 to-blue-50 p-4 text-center">
                  <div className="text-3xl font-bold text-gray-800 mb-1">
                    1.12
                  </div>
                  <div className="text-sm font-semibold text-gray-600">
                    GLCM
                  </div>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 p-4 text-center">
                  <div className="text-2xl font-bold text-gray-800 mb-1">
                    Contrast
                  </div>
                  <div className="text-sm font-semibold text-gray-600">
                    Index
                  </div>
                </div>
              </div>
            </Card>

            {/* Live Logs */}
            <Card className="min-h-[340px]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Live Logs</h3>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-gray-600">
                    LIVE
                  </span>
                </div>
              </div>
              <div className="space-y-1 max-h-[280px] overflow-y-auto pr-2">
                <LogEntry time="09:58:19" message="Fabric Detected" />
                <LogEntry time="09:58:19" message="Cut-piece Mode Enabled" />
                <LogEntry time="09:58:19" message="Start Frame Extraction" />
                <LogEntry time="09:58:19" message="Frames Uploading ..." />
                <LogEntry time="09:58:19" message="Uploaded Successfully" />
                <LogEntry time="09:58:19" message="Stay IDLE" />
              </div>
            </Card>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            {/* Session Info */}
            <Card className="min-h-[280px]">
              <h3 className="text-xl font-bold text-gray-800 mb-6">
                Session Info
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="font-semibold text-gray-700">
                    Visual Clarity
                  </span>
                  <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 font-semibold text-sm">
                    Good
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="font-semibold text-gray-700">
                    Calibration Time
                  </span>
                  <span className="font-bold text-gray-800">10 min</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="font-semibold text-gray-700">Timestamp</span>
                  <span className="font-mono font-bold text-gray-800">
                    10:20:52
                  </span>
                </div>
                <div className="py-2">
                  <div className="h-6"></div>
                </div>
                <div className="py-2">
                  <div className="h-6"></div>
                </div>
              </div>
            </Card>

            {/* Production Info */}
            <Card className="min-h-[220px]">
              <h3 className="text-xl font-bold text-gray-800 mb-6">
                Production Overview
              </h3>
              <div className="space-y-6 text-center">
                <div>
                  <div className="text-5xl font-bold text-gray-800 mb-2">
                    1350
                  </div>
                  <div className="text-lg font-semibold text-gray-600">
                    Cut-Piece
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-800 mb-2">
                    08
                  </div>
                  <div className="text-lg font-semibold text-gray-600">
                    Fabric-Roll
                  </div>
                </div>
              </div>
            </Card>

            {/* Status Indicators */}
            <Card className="min-h-[120px]">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                System Status
              </h3>
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className="h-3 w-3 bg-green-500 rounded-full mx-auto mb-2"></div>
                  <div className="text-xs font-semibold text-gray-600">
                    Active
                  </div>
                </div>
                <div className="text-center">
                  <div className="h-3 w-3 bg-blue-500 rounded-full mx-auto mb-2"></div>
                  <div className="text-xs font-semibold text-gray-600">
                    Connected
                  </div>
                </div>
                <div className="text-center">
                  <div className="h-3 w-3 bg-amber-500 rounded-full mx-auto mb-2"></div>
                  <div className="text-xs font-semibold text-gray-600">
                    Monitoring
                  </div>
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
              <strong>Operator Dashboard v1.0</strong> — Real-time Monitoring &
              Diagnostics
            </span>
            <span className="font-mono">
              Session ID: OP-2024-03-15-001 • Updated Today 10:25:30
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OperatorDashboard;
