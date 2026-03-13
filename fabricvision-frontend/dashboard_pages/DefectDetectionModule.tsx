"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Inter } from "next/font/google";
import { 
  FiFileText, FiActivity, FiBarChart2, FiSettings, 
  FiUpload, FiPlay, FiPause, FiRefreshCw, FiDatabase,
  FiWifi, FiWifiOff, FiCheckCircle, FiAlertCircle,
  FiClock, FiZap
} from "react-icons/fi";
import io, { Socket } from 'socket.io-client';
import RealTimeDashboard from "./DefectDetection/RealTimeDashboard";
import HistoryAnalytics from "./DefectDetection/HistoryAnalytics";
import SystemConfiguration from "./DefectDetection/SystemConfiguration";
import DefectReportingTab from "./DefectDetection/DefectReportingTab";

// Define all interfaces locally to avoid import issues
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

interface QualityAssessment {
  grade: string;
  status: string;
  description: string;
}

interface DetectionResult {
  success: boolean;
  message: string;
  timestamp: string;
  summary: Summary;
  defects: Defect[];
  quality_assessment: QualityAssessment;
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
  mongo_id?: string;
  classification?: string;
  processed_at?: string;
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
    start_time?: string;
    last_scan?: string;
  };
  timestamp?: string;
  aggregated_stats?: StatsData;
}

interface StatsData {
  total_frames_processed: number;
  total_defect_frames: number;
  total_non_defect_frames: number;
  defect_type_counts: {
    stain: number;
    holes: number;
    line: number;
    cut: number;
  };
  avg_processing_time_ms: number;
  defect_rate_percentage: number;
  defect_free_rate_percentage: number;
  last_updated: string;
  recent_history: any[];
}

interface StatusUpdateData {
  is_running: boolean;
  is_paused: boolean;
  current_file: string | null;
  pending_count: number;
  processed_count: number;
  stats?: ScannerStatus['stats'];
  aggregated_stats?: StatsData;
  timestamp?: string;
}

interface StatusChangeData {
  is_running: boolean;
  is_paused: boolean;
  message: string;
  timestamp?: string;
  stats?: ScannerStatus['stats'];
}

interface ProcessingData {
  filename: string;
  frame_number: number;
  pulse: number;
  position_cm: number;
  timestamp: string;
  status: string;
  time?: string;
}

interface DefectDetectedData {
  message: string;
  filename: string;
  frame_number: number;
  pulse_count: number;
  position_cm: number;
  defects: Defect[];
  quality: QualityAssessment;
  timestamp?: string;
  stats?: StatsData;
}

interface ScanResponseData {
  message: string;
  success: boolean;
}

interface ErrorData {
  filename?: string;
  error: string;
  timestamp?: string;
}

interface PongData {
  timestamp: string;
  sid?: string;
}

interface WelcomeData {
  message: string;
  client_id: string;
  timestamp: string;
  stats: ScannerStatus['stats'];
  aggregated_stats?: StatsData;
  recent_history?: any[];
}

interface StatsResponseData {
  success: boolean;
  stats: StatsData;
  error?: string;
}

interface HistoryResponseData {
  success: boolean;
  history: any[];
  limit?: number;
  skip?: number;
  error?: string;
}

interface UploadStatus {
  loading: boolean;
  error: string | null;
}

interface DefectAlert {
  show: boolean;
  message: string;
  filename: string;
  position_cm: number;
  defects: Defect[];
}

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-inter",
});

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

const subTabs = [
  { key: "reporting", label: "Defect Reporting", icon: FiFileText },
  { key: "dashboard", label: "Real-time Dashboard", icon: FiActivity },
  { key: "history", label: "History & Analytics", icon: FiBarChart2 },
  { key: "config", label: "System Configuration", icon: FiSettings },
];

const DefectDetectionModule: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [activeSubTab, setActiveSubTab] = useState<string>("dashboard");
  const [apiData, setApiData] = useState<DetectionResult | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({ loading: false, error: null });
  const [socketConnected, setSocketConnected] = useState<boolean>(false);
  
  // Database data states
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [totalHistoryCount, setTotalHistoryCount] = useState<number>(0);
  
  // Real-time scanner states
  const [scannerStatus, setScannerStatus] = useState<ScannerStatus>({
    is_running: false,
    is_paused: false,
    current_file: null,
    pending_count: 0,
    pending_files: [],
    processed_count: 0,
    connected_clients: 0
  });
  
  const [latestResult, setLatestResult] = useState<DetectionResult | null>(null);
  const [defectAlert, setDefectAlert] = useState<DefectAlert>({ 
    show: false, 
    message: "", 
    filename: "", 
    position_cm: 0,
    defects: [] 
  });
  
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  // Fetch initial data via HTTP
  const fetchInitialData = useCallback(async () => {
    try {
      const statusResponse = await fetch("http://localhost:8000/realtime/status");
      if (statusResponse.ok) {
        const data: ScannerStatus = await statusResponse.json();
        console.log('📊 HTTP Status:', data);
        setScannerStatus(data);
      }
      
      const statsResponse = await fetch("http://localhost:8000/api/stats");
      if (statsResponse.ok) {
        const data = await statsResponse.json();
        if (data.success && data.stats) {
          console.log('📈 HTTP Stats:', data.stats);
          setStatsData(data.stats);
        }
      }
      
      const historyResponse = await fetch("http://localhost:8000/api/history?limit=20&skip=0");
      if (historyResponse.ok) {
        const data = await historyResponse.json();
        if (data.success && data.history) {
          console.log('📚 HTTP History:', data.history.length, 'records');
          setHistoryData(data.history);
          setTotalHistoryCount(data.total || data.history.length);
        }
      }
    } catch (error) {
      console.error("Failed to fetch initial data:", error);
    }
  }, []);

  const connectSocket = useCallback(() => {
    if (socketRef.current?.connected) return;

    console.log("🔄 Attempting Connection to localhost:8000...");
    
    const socket = io('http://localhost:8000', {
      transports: ['websocket'],
      path: '/socket.io',
      withCredentials: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Socket.IO connected! ID:', socket.id);
      setSocketConnected(true);
      socket.emit('ping', { client: 'web', timestamp: new Date().toISOString() });
      
      socket.emit('get_status');
      socket.emit('get_stats');
      socket.emit('get_history', { limit: 20, skip: 0 });
    });

    socket.on('disconnect', (reason: string) => {
      console.warn('❌ Socket.IO disconnected:', reason);
      setSocketConnected(false);
    });

    socket.on('connect_error', (error: Error) => {
      console.error('⚠️ Connection Error:', error.message);
      setSocketConnected(false);
    });

    socket.on('status', (data: ScannerStatus) => {
      console.log('📊 Status update:', data);
      setScannerStatus(prev => ({ ...prev, ...data }));
    });

    socket.on('status_update', (data: StatusUpdateData) => {
      console.log('📊 Status update:', data);
      setScannerStatus(prev => ({ ...prev, ...data }));
      
      if (data.aggregated_stats) {
        setStatsData(data.aggregated_stats);
      }
    });

    socket.on('stats_response', (data: StatsResponseData) => {
      if (data.success && data.stats) {
        console.log('📈 Stats received:', data.stats);
        setStatsData(data.stats);
      }
    });

    socket.on('stats_update', (data: StatsData) => {
      console.log('📈 Stats update:', data);
      setStatsData(data);
    });

    socket.on('history_response', (data: HistoryResponseData) => {
      if (data.success && data.history) {
        console.log('📚 History received:', data.history.length, 'records');
        setHistoryData(data.history);
      }
    });

    socket.on('detection_result', (data: DetectionResult) => {
      console.log('🎯 New Detection:', data.filename, 'Defects:', data.defects?.length, 'Pos:', data.position_cm, 'cm');
      console.log('🖼️ Annotated image available:', data.annotated_image ? 'Yes' : 'No');
      
      setLatestResult(data);
      setApiData(data);
      
      socket.emit('get_stats');
      socket.emit('get_history', { limit: 20, skip: 0 });
    });

    socket.on('defect_detected', (data: DefectDetectedData) => {
      console.log('⚠️ Defect detected:', data.filename, 'at', data.position_cm, 'cm');
      setDefectAlert({
        show: true,
        message: data.message,
        filename: data.filename,
        position_cm: data.position_cm,
        defects: data.defects
      });
      
      if (data.stats) {
        setStatsData(data.stats);
      }
      
      setTimeout(() => setDefectAlert(prev => ({ ...prev, show: false })), 10000);
    });

    socket.on('processing', (data: ProcessingData) => {
      console.log('⚙️ Processing:', data.filename, 'Frame:', data.frame_number, 'Pulse:', data.pulse, 'Pos:', data.position_cm, 'cm');
      setScannerStatus(prev => ({ ...prev, current_file: data.filename }));
    });

    socket.on('pong', (data: PongData) => {
      console.log('💓 Heartbeat ack:', data.timestamp);
    });

    socket.on('scan_response', (data: ScanResponseData) => {
      console.log('📡 Scan response:', data);
    });

    socket.on('welcome', (data: WelcomeData) => {
      console.log('👋 Welcome:', data.message);
      if (data.aggregated_stats) {
        setStatsData(data.aggregated_stats);
      }
      if (data.recent_history) {
        setHistoryData(data.recent_history);
      }
    });

    socket.on('error', (data: ErrorData) => {
      console.error('❌ Socket error:', data);
    });

  }, []);

  useEffect(() => {
    connectSocket();
    fetchInitialData();

    const statsInterval = setInterval(() => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('get_stats');
      }
    }, 5000);

    return () => {
      clearInterval(statsInterval);
      if (socketRef.current) {
        console.log("🔌 Component unmounting: Closing socket...");
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [connectSocket, fetchInitialData]);

  const handleFileUpload = useCallback(async (file: File) => {
    setUploadStatus({ loading: true, error: null });
    
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const response = await fetch("http://localhost:8000/detect?confidence=0.25", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      
      const data: DetectionResult = await response.json();
      console.log('📤 Upload result:', data.filename, 'Defects:', data.defects?.length);
      setApiData(data);
      setLatestResult(data);
      setUploadStatus({ loading: false, error: null });
      
      if (socketRef.current) {
        socketRef.current.emit('get_stats');
        socketRef.current.emit('get_history', { limit: 20, skip: 0 });
      }
    } catch (error: any) {
      setUploadStatus({ loading: false, error: error.message });
      console.error("Upload error:", error);
    }
  }, []);

  const startScanner = useCallback(() => {
    if (socketRef.current) {
      console.log('▶️ Starting scanner');
      socketRef.current.emit('start_scan');
    } else {
      console.error('Socket not connected');
    }
  }, []);

  const pauseScanner = useCallback(() => {
    if (socketRef.current) {
      console.log('⏸️ Pausing scanner');
      socketRef.current.emit('pause_scan');
    }
  }, []);

  const resumeScanner = useCallback(() => {
    if (socketRef.current) {
      console.log('▶️ Resuming scanner');
      socketRef.current.emit('resume_scan');
    }
  }, []);

  const stopScanner = useCallback(() => {
    if (socketRef.current) {
      console.log('⏹️ Stopping scanner');
      socketRef.current.emit('stop_scan');
    }
  }, []);

  const refreshData = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('get_stats');
      socketRef.current.emit('get_history', { limit: 20, skip: 0 });
    }
  }, []);

  const activeTab = subTabs.find((t) => t.key === activeSubTab);
  const ActiveIcon = activeTab?.icon || FiActivity;

  const renderSubContent = useCallback(() => {
    switch (activeSubTab) {
      case "reporting":
        return <DefectReportingTab />;
      case "dashboard":
        return (
          <RealTimeDashboard 
            apiData={apiData} 
            onFileUpload={handleFileUpload} 
            uploadStatus={uploadStatus}
            scannerStatus={scannerStatus}
            onStartScanner={startScanner}
            onPauseScanner={pauseScanner}
            onResumeScanner={resumeScanner}
            onStopScanner={stopScanner}
            latestResult={latestResult}
            defectAlert={defectAlert}
            onCloseAlert={() => setDefectAlert((prev: DefectAlert) => ({ ...prev, show: false }))}
            socketConnected={socketConnected}
            statsData={statsData}
            historyData={historyData}
            onRefreshData={refreshData}
          />
        );
      case "history":
        return <HistoryAnalytics statsData={statsData} historyData={historyData} />;
      case "config":
        return <SystemConfiguration />;
      default:
        return (
          <RealTimeDashboard 
            apiData={apiData} 
            onFileUpload={handleFileUpload} 
            uploadStatus={uploadStatus}
            scannerStatus={scannerStatus}
            onStartScanner={startScanner}
            onPauseScanner={pauseScanner}
            onResumeScanner={resumeScanner}
            onStopScanner={stopScanner}
            latestResult={latestResult}
            defectAlert={defectAlert}
            onCloseAlert={() => setDefectAlert((prev: DefectAlert) => ({ ...prev, show: false }))}
            socketConnected={socketConnected}
            statsData={statsData}
            historyData={historyData}
            onRefreshData={refreshData}
          />
        );
    }
  }, [activeSubTab, apiData, handleFileUpload, uploadStatus, scannerStatus, 
      startScanner, pauseScanner, resumeScanner, stopScanner, latestResult, 
      defectAlert, socketConnected, statsData, historyData, refreshData]);

  const getLastUpdatedText = () => {
    if (statsData?.last_updated) {
      try {
        const date = new Date(statsData.last_updated);
        return date.toLocaleTimeString();
      } catch (e) {
        return 'Unknown';
      }
    }
    return 'Never';
  };

  if (loading) {
    return (
      <motion.div
        className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/20"
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
        key="defect-module"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={fadeIn}
        className={`p-6 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/20 ${inter.className}`}
      >
        <div className="max-w-[1500px] mx-auto mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ActiveIcon className="text-2xl text-indigo-600" />
              <h2 className="text-3xl font-bold text-gray-800">{activeTab?.label}</h2>
            </div>
            
            {/* Stats Bar */}
            <div className="flex items-center gap-6">
              {statsData && (
                <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center gap-2">
                    <FiDatabase className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm text-gray-600">Frames:</span>
                    <span className="font-semibold text-gray-900">{statsData.total_frames_processed}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiAlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-gray-600">Defects:</span>
                    <span className="font-semibold text-red-600">{statsData.total_defect_frames}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiClock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Last:</span>
                    <span className="font-semibold text-gray-900">{getLastUpdatedText()}</span>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                {socketConnected ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg">
                    <FiWifi className="w-4 h-4" />
                    <span className="text-sm font-medium">Live</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg">
                    <FiWifiOff className="w-4 h-4" />
                    <span className="text-sm font-medium">Disconnected</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2">
            <p className="text-lg font-semibold text-gray-600">
              YOLOv9 • Real-time monitoring • Socket.IO Live Updates
            </p>
            
            <div className="flex items-center gap-3">
              {scannerStatus.is_running ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-700">
                      {scannerStatus.is_paused ? "Paused" : "Scanning"}
                    </span>
                    {scannerStatus.current_file && (
                      <span className="text-xs text-gray-500 ml-2 truncate max-w-[150px]">
                        {scannerStatus.current_file}
                      </span>
                    )}
                  </div>
                  
                  {scannerStatus.is_paused ? (
                    <button
                      onClick={resumeScanner}
                      disabled={!socketConnected}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiPlay className="w-4 h-4" />
                      Resume
                    </button>
                  ) : (
                    <button
                      onClick={pauseScanner}
                      disabled={!socketConnected}
                      className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiPause className="w-4 h-4" />
                      Pause
                    </button>
                  )}
                  
                  <button
                    onClick={stopScanner}
                    disabled={!socketConnected}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiRefreshCw className="w-4 h-4" />
                    Stop
                  </button>
                </>
              ) : (
                <button
                  onClick={startScanner}
                  disabled={!socketConnected}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiPlay className="w-4 h-4" />
                  Start Real-time Scan
                </button>
              )}
              
              <button
                onClick={refreshData}
                disabled={!socketConnected}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh Data"
              >
                <FiRefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="text-sm text-gray-500 mt-3">
            Component 3 / Defect Detection /{" "}
            <span className="font-semibold text-gray-700">{activeTab?.label}</span>
            {statsData && (
              <span className="ml-2 text-indigo-600">
                • Defect Rate: {statsData.defect_rate_percentage.toFixed(1)}% 
                • Avg Time: {(statsData.avg_processing_time_ms / 1000).toFixed(2)}s
              </span>
            )}
          </div>
        </div>

        <div className="max-w-[1500px] mx-auto mb-6 border-b border-gray-200">
          <div className="flex space-x-8 overflow-x-auto pb-1">
            {subTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSubTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveSubTab(tab.key)}
                  className={`pb-3 text-sm font-semibold transition-colors flex items-center gap-2 ${
                    isActive
                      ? "text-indigo-600 border-b-2 border-indigo-600"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.key === "dashboard" && scannerStatus.pending_count > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                      {scannerStatus.pending_count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="max-w-[1500px] mx-auto">{renderSubContent()}</div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DefectDetectionModule;