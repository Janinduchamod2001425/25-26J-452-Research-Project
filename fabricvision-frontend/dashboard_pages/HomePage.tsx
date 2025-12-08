"use client";
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { Inter } from "next/font/google";
import Image from "next/image";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-inter",
});

// Animation helpers
const fadeIn: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 60, damping: 14 },
  },
  exit: { opacity: 0, y: -24 },
};

// Card component
interface CardProps {
  children: React.ReactNode;
  className?: string;
  [key: string]: unknown;
}

function Card({ children, className = "", ...props }: CardProps) {
  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      exit="exit"
      whileHover={{ scale: 1.02 }}
      className={`rounded-3xl bg-white drop-shadow-lg px-6 py-5 transition-all duration-300 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Stat Card component
function StatCard({
  title,
  value,
  className = "",
}: {
  title: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={`bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 ${className}`}
    >
      <h3 className="text-sm font-semibold text-gray-600 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}

// Log Entry component
function LogEntry({ time, message }: { time: string; message: string }) {
  return (
    <div className="flex items-start space-x-3 py-2 border-b border-gray-100 last:border-0">
      <div className="min-w-[70px]">
        <span className="text-sm font-mono text-blue-600">{time}</span>
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-700">{message}</p>
      </div>
    </div>
  );
}

export default function OperatorDashboard() {
  const [loading, setLoading] = useState<boolean>(true);

  // Add useEffect to handle the 3-second loading delay
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
        exit={{ opacity: 0 }}
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
        key="dashboard"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={fadeIn}
        className={`p-4 md:p-6 min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 ${inter.className}`}
      >
        {/* Header */}
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

        {/* Main Dashboard Grid */}
        <div className="max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - System Performance */}
          <div className="space-y-6">
            {/* System Performance Card */}
            <Card className="min-h-[300px]">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                System Performance
              </h2>
              <div className="space-y-4">
                <StatCard title="Capture Efficiency" value="84 %" />
                <StatCard title="Upload Success" value="96 %" />
                <StatCard title="Average Latency" value="145 ms" />
              </div>
            </Card>

            {/* Frame Quality Summary Card */}
            <Card className="min-h-[250px]">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Frame Quality Summary
              </h2>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">
                    Camera Health Diagnostics
                  </h3>
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

            {/* Frame Uploaded Card */}
            <Card className="min-h-[200px]">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Frame Uploaded
                </h2>
                <div className="bg-red-100 text-red-600 text-sm font-bold px-3 py-1 rounded-full">
                  DISK LEVEL: LOW
                </div>
              </div>

              <div className="space-y-4">
                <div className="overflow-hidden rounded-xl border border-gray-200">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600">
                          Role Quality Index (RQI)
                        </th>
                        <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600">
                          Stable
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-gray-200">
                        <td className="py-3 px-4 text-sm text-gray-600">
                          Avg FQI
                        </td>
                        <td className="py-3 px-4 text-sm font-bold text-gray-800">
                          0.91
                        </td>
                      </tr>
                      <tr className="border-t border-gray-200">
                        <td className="py-3 px-4 text-sm text-gray-600">
                          Avg Anomaly
                        </td>
                        <td className="py-3 px-4 text-sm font-bold text-gray-800">
                          0.26
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          </div>

          {/* Middle Column - Texture & Live Logs */}
          <div className="space-y-6">
            {/* Texture Density Index Card */}
            <Card className="min-h-[200px]">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Texture Density Index
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-bold text-gray-800 mb-1">
                    0.87
                  </div>
                  <div className="text-sm font-semibold text-gray-600">TDI</div>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-bold text-gray-800 mb-1">
                    0.97
                  </div>
                  <div className="text-sm font-semibold text-gray-600">
                    Entropy
                  </div>
                </div>
                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-bold text-gray-800 mb-1">
                    1.12
                  </div>
                  <div className="text-sm font-semibold text-gray-600">
                    GLCM
                  </div>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-bold text-gray-800 mb-1">
                    Contrast
                  </div>
                  <div className="text-sm font-semibold text-gray-600">
                    Index
                  </div>
                </div>
              </div>
            </Card>

            {/* Live Logs Card */}
            <Card className="min-h-[400px]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Live Logs</h2>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-gray-600">
                    LIVE
                  </span>
                </div>
              </div>

              <div className="space-y-1 max-h-[300px] overflow-y-auto pr-2">
                <LogEntry time="09:58:19" message="Fabric Detected" />
                <LogEntry time="09:58:19" message="Cut-piece Mode Enabled" />
                <LogEntry time="09:58:19" message="Start Frame Extraction" />
                <LogEntry time="09:58:19" message="Frames Uploading ..." />
                <LogEntry time="09:58:19" message="Uploaded Successfully" />
                <LogEntry time="09:58:19" message="Stay IDLE" />
              </div>
            </Card>
          </div>

          {/* Right Column - Session Info & Production */}
          <div className="space-y-6">
            {/* Session Info Card */}
            <Card className="min-h-[300px]">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Session Info
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-sm font-semibold text-gray-600">
                    Visual Clarity
                  </span>
                  <span className="text-sm font-bold text-green-600">Good</span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-sm font-semibold text-gray-600">
                    Calibration Time
                  </span>
                  <span className="text-sm font-bold text-gray-800">
                    10 min
                  </span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-sm font-semibold text-gray-600">
                    Timestamp
                  </span>
                  <span className="text-sm font-bold text-gray-800 font-mono">
                    10:20:52
                  </span>
                </div>

                {/* Empty rows as per wireframe */}
                <div className="h-8 border-b border-gray-100"></div>
                <div className="h-8 border-b border-gray-100"></div>
                <div className="h-8"></div>
              </div>
            </Card>

            {/* Production Info Card */}
            <Card className="min-h-[200px]">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-5xl font-bold text-gray-800 mb-2">
                    1350
                  </div>
                  <div className="text-lg font-semibold text-gray-600">
                    Cut-Piece
                  </div>
                </div>

                <div className="text-center">
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
            <Card className="min-h-[100px]">
              <div className="flex items-center justify-center space-x-6">
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

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="max-w-[1500px] mx-auto mt-8 pt-6 border-t border-gray-200"
        >
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <div className="mb-2 md:mb-0">
              <span className="font-semibold">Operator Dashboard v1.0</span>
              <span className="mx-2">•</span>
              <span>Last Updated: Today 10:25:30</span>
            </div>
            <div>
              <span className="font-mono">Session ID: OP-2024-03-15-001</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
