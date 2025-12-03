import AnnotatedDefectImage from "@/components/DefectDetect/AnnotatedDefectImage";
import AverageDefects from "@/components/DefectDetect/AverageDefects";
import DefectClassification from "@/components/DefectDetect/DefectClassification";
import DefectDetail from "@/components/DefectDetect/DefectDetail";
import DetectionHistoryMonitor from "@/components/DefectDetect/DetectionHistoryMonitor";
import EncoderPulseMonitor from "@/components/DefectDetect/EncoderPulseMonitor";
import React from "react";

const DefectDetectionModule = () => {
  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/20 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
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

        {/* TOP ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT */}
          <AnnotatedDefectImage />

          {/* RIGHT */}
          <EncoderPulseMonitor />
        </div>

        {/* MIDDLE + BOTTOM ROWS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* FULL LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            <DefectDetail />
            <DetectionHistoryMonitor />
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            <DefectClassification />
            <AverageDefects />
            
            {/* Additional Stats Card */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Defects Today</span>
                  <span className="font-semibold text-gray-800">24</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Detection Rate</span>
                  <span className="font-semibold text-green-600">98.7%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg. Response</span>
                  <span className="font-semibold text-gray-800">0.4s</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Uptime</span>
                  <span className="font-semibold text-blue-600">99.9%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DefectDetectionModule;
