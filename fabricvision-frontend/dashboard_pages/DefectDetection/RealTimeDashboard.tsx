"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AnnotatedDefectImage from "@/components/DefectDetect/AnnotatedDefectImage";
import AverageDefects from "@/components/DefectDetect/AverageDefects";
import DefectClassification from "@/components/DefectDetect/DefectClassification";
import DefectDetail from "@/components/DefectDetect/DefectDetail";
import DetectionHistoryMonitor from "@/components/DefectDetect/DetectionHistoryMonitor";
import EncoderPulseMonitor from "@/components/DefectDetect/EncoderPulseMonitor";
import { 
  FiAlertCircle, FiCheckCircle, FiUpload, 
  FiPlay, FiPause, FiRefreshCw, FiDatabase,
  FiClock, FiImage, FiActivity, FiWifi, FiWifiOff,
  FiBarChart2, FiRefreshCcw, FiZap
} from "react-icons/fi";
import { FaPencilRuler } from "react-icons/fa";

interface Defect {
  id: number;
  type: string;
  confidence: string;
  severity: string;
  area_percentage: number;
  bounding_box: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
  location: {
    fabricLength: string;
    xPos: string;
    yPos: string;
  };
}

interface Summary {
  total_defects: number;
  is_defect_free: boolean;
  defect_types_found: string[];
  overall_severity: string;
}

interface DetectionResult {
  success: boolean;
  message: string;
  timestamp: string;
  summary: Summary;
  defects: Defect[];
  quality_assessment: {
    grade: string;
    status: string;
    description: string;
  };
  annotated_image: string;
  processing_time_ms: number;
  filename?: string;
  frame_number?: number;
  pulse_count?: number;
  position_cm?: number;
  image_info?: {
    filename: string;
    size_bytes: number;
    content_type: string;
  };
  _id?: string;
}

interface ScannerStatus {
  is_running: boolean;
  is_paused: boolean;
  current_file: string | null;
  pending_count: number;
  pending_files?: Array<{filename: string, position_cm: number}>;
  processed_count: number;
  connected_clients: number;
  stats?: {
    total_scanned: number;
    total_defects: number;
  };
  aggregated_stats?: any;
}

interface DefectAlert {
  show: boolean;
  message: string;
  filename: string;
  position_cm: number;
  defects: Defect[];
}

interface RealTimeDashboardProps {
  apiData: DetectionResult | null;
  onFileUpload: (file: File) => Promise<void>;
  uploadStatus: { loading: boolean; error: string | null };
  scannerStatus: ScannerStatus;
  onStartScanner: () => void;
  onPauseScanner: () => void;
  onResumeScanner: () => void;
  onStopScanner: () => void;
  latestResult: DetectionResult | null;
  defectAlert: DefectAlert;
  onCloseAlert: () => void;
  socketConnected: boolean;
  statsData?: any;
  historyData?: any[];
  onRefreshData?: () => void;
}

const RealTimeDashboard: React.FC<RealTimeDashboardProps> = ({ 
  apiData, 
  onFileUpload, 
  uploadStatus,
  scannerStatus,
  onStartScanner,
  onPauseScanner,
  onResumeScanner,
  onStopScanner,
  latestResult,
  defectAlert,
  onCloseAlert,
  socketConnected,
  statsData,
  historyData,
  onRefreshData
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [systemStatus, setSystemStatus] = useState({
    active: true,
    defectCount: 0,
    detectionRate: "0%",
    avgResponse: "0s",
    uptime: "99.9%"
  });
  const [showRealtimeLog, setShowRealtimeLog] = useState<boolean>(true);
  const [totalHistoryCount, setTotalHistoryCount] = useState<number>(0);
  const [lastUpdated, setLastUpdated] = useState<string>("Just now");
  const [currentPosition, setCurrentPosition] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (statsData) {
      setSystemStatus(prev => ({
        ...prev,
        defectCount: statsData.total_defect_frames || 0,
        detectionRate: statsData.defect_rate_percentage ? `${statsData.defect_rate_percentage.toFixed(1)}%` : "0%",
        avgResponse: statsData.avg_processing_time_ms ? `${(statsData.avg_processing_time_ms / 1000).toFixed(2)}s` : "0s"
      }));
      
      setTotalHistoryCount(statsData.total_frames_processed || 0);
      
      if (statsData.last_updated) {
        const date = new Date(statsData.last_updated);
        setLastUpdated(date.toLocaleTimeString());
      }
    }
  }, [statsData]);

  useEffect(() => {
    if (latestResult) {
      setLastUpdated(new Date().toLocaleTimeString());
      if (latestResult.position_cm) {
        setCurrentPosition(latestResult.position_cm);
      }
    }
  }, [latestResult]);

  useEffect(() => {
    if (scannerStatus.current_file && scannerStatus.pending_files && scannerStatus.pending_files.length > 0) {
      const currentPending = scannerStatus.pending_files.find(f => f.filename === scannerStatus.current_file);
      if (currentPending) {
        setCurrentPosition(currentPending.position_cm);
      }
    }
  }, [scannerStatus.current_file, scannerStatus.pending_files]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
    if (event.target) {
      event.target.value = '';
    }
  }, [onFileUpload]);

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleRefresh = useCallback(() => {
    if (onRefreshData) {
      onRefreshData();
    }
  }, [onRefreshData]);

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
          {/* Defect Alert */}
          <AnimatePresence>
            {defectAlert.show && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <FiAlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-red-800">Defect Detected at {defectAlert.position_cm.toFixed(2)} cm!</h3>
                      <p className="text-red-700 text-sm mt-1">{defectAlert.message}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {defectAlert.defects.map((defect, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full"
                          >
                            {defect.type} ({defect.confidence})
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={onCloseAlert}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scanner Status Bar */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <FiActivity className="w-5 h-5 text-indigo-600" />
                  <span className="font-medium text-gray-700">Scanner:</span>
                  {scannerStatus.is_running ? (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      scannerStatus.is_paused 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {scannerStatus.is_paused ? 'Paused' : 'Running'}
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                      Stopped
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <FiImage className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    Current: {scannerStatus.current_file || 'None'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <FaPencilRuler className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-600">
                    Position: {currentPosition !== null ? `${currentPosition.toFixed(2)} cm` : 'N/A'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <FiClock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    Pending: {scannerStatus.pending_count} | Processed: {scannerStatus.processed_count}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {socketConnected ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <FiWifi className="w-4 h-4" />
                      <span className="text-xs">Live</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-red-600">
                      <FiWifiOff className="w-4 h-4" />
                      <span className="text-xs">Offline</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowRealtimeLog(!showRealtimeLog)}
                  className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {showRealtimeLog ? 'Hide' : 'Show'} Log
                </button>
                <button
                  onClick={handleRefresh}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Refresh data"
                >
                  <FiRefreshCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Pending Files List */}
            {scannerStatus.pending_files && scannerStatus.pending_files.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="text-xs font-medium text-gray-500 mb-2">Pending Queue ({scannerStatus.pending_count}):</div>
                <div className="flex flex-wrap gap-2">
                  {scannerStatus.pending_files.slice(0, 5).map((file, idx) => (
                    <div key={idx} className="px-2 py-1 bg-gray-100 rounded text-xs">
                      <span className="font-mono">{file.position_cm.toFixed(2)}cm</span>
                    </div>
                  ))}
                  {scannerStatus.pending_count > 5 && (
                    <div className="px-2 py-1 bg-gray-100 rounded text-xs">
                      +{scannerStatus.pending_count - 5} more
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Stats Bar */}
            {(scannerStatus.stats || statsData) && (
              <div className="flex gap-4 mt-3 pt-3 border-t border-gray-100 text-xs">
                <span className="text-gray-600">
                  Total Scanned: <span className="font-medium text-gray-800">
                    {statsData?.total_frames_processed || scannerStatus.stats?.total_scanned || 0}
                  </span>
                </span>
                <span className="text-gray-600">
                  Total Defects: <span className="font-medium text-red-600">
                    {statsData?.total_defect_frames || scannerStatus.stats?.total_defects || 0}
                  </span>
                </span>
                <span className="text-gray-600">
                  Defect Rate: <span className="font-medium text-indigo-600">
                    {statsData?.defect_rate_percentage?.toFixed(1) || '0'}%
                  </span>
                </span>
                <span className="text-gray-600">
                  Clients: <span className="font-medium text-indigo-600">{scannerStatus.connected_clients}</span>
                </span>
                <span className="text-gray-600 ml-auto">
                  Last Updated: {lastUpdated}
                </span>
              </div>
            )}
          </div>

          {/* Latest Detection Result */}
          <AnimatePresence>
            {showRealtimeLog && latestResult && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm overflow-hidden"
              >
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FiDatabase className="w-4 h-4 text-indigo-600" />
                  Latest Detection
                </h3>
                <div className="space-y-2">
                  <div
                    className={`p-3 rounded-lg text-sm ${
                      latestResult.summary?.total_defects > 0
                        ? 'bg-red-50 border border-red-200'
                        : 'bg-green-50 border border-green-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {latestResult.summary?.total_defects > 0 ? (
                          <FiAlertCircle className="w-4 h-4 text-red-500" />
                        ) : (
                          <FiCheckCircle className="w-4 h-4 text-green-500" />
                        )}
                        <span className="font-medium">{latestResult.filename || 'Unknown'}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {latestResult.timestamp || 'Just now'}
                      </span>
                    </div>
                    <div className="mt-1 flex gap-4 text-xs text-gray-600">
                      <span>Frame: {latestResult.frame_number || 'N/A'}</span>
                      <span>Pulse: {latestResult.pulse_count || 'N/A'}</span>
                      <span>Position: {latestResult.position_cm ? `${latestResult.position_cm.toFixed(2)} cm` : 'N/A'}</span>
                      <span>Defects: {latestResult.summary?.total_defects || 0}</span>
                      <span>Severity: {latestResult.summary?.overall_severity || 'N/A'}</span>
                      <span>Time: {latestResult.processing_time_ms}ms</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Defect Detection Dashboard</h1>
              <p className="text-gray-600">Real-time fabric inspection and quality control system</p>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".jpg,.jpeg,.png,.bmp,.webp"
                className="hidden"
              />
              <button
                onClick={triggerFileInput}
                disabled={uploadStatus.loading}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadStatus.loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white rounded-full border-t-transparent"
                    />
                    Processing...
                  </>
                ) : (
                  <>
                    <FiUpload className="w-4 h-4" />
                    Upload Fabric Image
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                {!scannerStatus.is_running ? (
                  <button
                    onClick={onStartScanner}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <FiPlay className="w-4 h-4" />
                    Start Scanner
                  </button>
                ) : scannerStatus.is_paused ? (
                  <button
                    onClick={onResumeScanner}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FiPlay className="w-4 h-4" />
                    Resume
                  </button>
                ) : (
                  <button
                    onClick={onPauseScanner}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    <FiPause className="w-4 h-4" />
                    Pause
                  </button>
                )}
                {scannerStatus.is_running && (
                  <button
                    onClick={onStopScanner}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Stop
                  </button>
                )}
              </div>
            </div>
          </div>

          {uploadStatus.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-700">
                <FiAlertCircle className="w-5 h-5" />
                <span className="font-medium">Upload Error: {uploadStatus.error}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnnotatedDefectImage 
              apiData={latestResult || apiData} 
            />
            <EncoderPulseMonitor />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <DefectDetail 
                apiData={latestResult || apiData} 
              />
              <DetectionHistoryMonitor 
                historyData={historyData} 
                totalCount={totalHistoryCount} 
              />
            </div>

            <div className="space-y-6">
              <DefectClassification 
                apiData={latestResult || apiData} 
                statsData={statsData} 
              />
              <AverageDefects 
                apiData={latestResult || apiData} 
                statsData={statsData} 
              />
              
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Defects Today</span>
                    <span className="font-semibold text-gray-800">
                      {statsData?.total_defect_frames || systemStatus.defectCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Detection Rate</span>
                    <span className="font-semibold text-green-600">
                      {statsData?.defect_rate_percentage ? `${statsData.defect_rate_percentage.toFixed(1)}%` : systemStatus.detectionRate}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Avg. Response</span>
                    <span className="font-semibold text-gray-800">
                      {statsData?.avg_processing_time_ms ? `${(statsData.avg_processing_time_ms / 1000).toFixed(2)}s` : systemStatus.avgResponse}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Uptime</span>
                    <span className="font-semibold text-blue-600">{systemStatus.uptime}</span>
                  </div>
                  {apiData && (
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-sm text-gray-600">API Status</span>
                      <span className="font-semibold text-green-600">Connected</span>
                    </div>
                  )}
                  {statsData && (
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-sm text-gray-600">Total Frames</span>
                      <span className="font-semibold text-indigo-600">{statsData.total_frames_processed}</span>
                    </div>
                  )}
                  {latestResult?.position_cm && (
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-sm text-gray-600">Current Position</span>
                      <span className="font-semibold text-blue-600">{latestResult.position_cm.toFixed(2)} cm</span>
                    </div>
                  )}
                  {statsData?.defect_type_counts && (
                    <div className="pt-3 border-t border-gray-100">
                      <span className="text-sm text-gray-600 block mb-2">Defect Types:</span>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(statsData.defect_type_counts)
                          .filter(([_, count]) => (count as number) > 0)
                          .map(([type, count]) => (
                            <span 
                              key={type}
                              className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full"
                            >
                              {type}: {count as number}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
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