"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AnnotatedDefectImage from "@/components/DefectDetect/AnnotatedDefectImage";
import AverageDefects from "@/components/DefectDetect/AverageDefects";
import DefectClassification from "@/components/DefectDetect/DefectClassification";
import DefectDetail from "@/components/DefectDetect/DefectDetail";
import DetectionHistoryMonitor from "@/components/DefectDetect/DetectionHistoryMonitor";
import EncoderPulseMonitor from "@/components/DefectDetect/EncoderPulseMonitor";


const RealTimeDashboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [systemStatus, setSystemStatus] = useState({
    active: true,
    defectCount: 24,
    detectionRate: "98.7%",
    avgResponse: "0.4s",
    uptime: "99.9%"
  });

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
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
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Defect Detection Dashboard</h1>
              <p className="text-gray-600">Real-time fabric inspection and quality control system</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">System Active</span>
              </div>
              <div className="text-sm text-gray-500">
                Last updated: Just now
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnnotatedDefectImage />
            <EncoderPulseMonitor />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <DefectDetail />
              <DetectionHistoryMonitor />
            </div>

            <div className="space-y-6">
              <DefectClassification />
              <AverageDefects />
              
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Defects Today</span>
                    <span className="font-semibold text-gray-800">{systemStatus.defectCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Detection Rate</span>
                    <span className="font-semibold text-green-600">{systemStatus.detectionRate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Avg. Response</span>
                    <span className="font-semibold text-gray-800">{systemStatus.avgResponse}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Uptime</span>
                    <span className="font-semibold text-blue-600">{systemStatus.uptime}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RealTimeDashboard;