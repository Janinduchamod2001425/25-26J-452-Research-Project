"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

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

interface FrameData {
  id: number;
  timestamp: number;
  imageUrl: string;
  fis: number;
  status: AnomalyStatus;
  threshold: number | null;
  vimBase64: string | null;
  reconBase64: string | null;
  vimMean: number;
  vimVar: number;
  vimStability: number;
  regions: Array<{ region: string; error: number }>;
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
  const [loading, setLoading] = useState(true);
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("novelty2_currentFrameIndex");
      return saved ? parseInt(saved) : 0;
    }
    return 0;
  });
  const [storedFrames, setStoredFrames] = useState<FrameData[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("novelty2_storedFrames");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // 🔹 Current frame data (from storedFrames or defaults)
  const currentFrame = storedFrames[currentFrameIndex] || null;

  // 🔹 Dynamic states (from backend) - Initialize from localStorage
  const [fisValue, setFisValue] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("novelty2_fisValue");
      return saved ? parseFloat(saved) : 0;
    }
    return 0;
  });

  const [currentStatus, setCurrentStatus] = useState<AnomalyStatus>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("novelty2_currentStatus");
      return (saved as AnomalyStatus) || "NORMAL";
    }
    return "NORMAL";
  });

  const [threshold, setThreshold] = useState<number | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("novelty2_threshold");
      return saved ? parseFloat(saved) : null;
    }
    return null;
  });

  const [trendSeries, setTrendSeries] = useState<AnomalyPoint[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("novelty2_trendSeries");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [logs, setLogs] = useState<LogItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("novelty2_logs");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const statusStyles = statusConfig[currentStatus];
  const [hasUploaded, setHasUploaded] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("novelty2_hasUploaded");
      return saved === "true";
    }
    return false;
  });

  // ---- VIM metrics (dynamic) ----
  const [vimMean, setVimMean] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("novelty2_vimMean");
      return saved ? parseFloat(saved) : 0;
    }
    return 0;
  });

  const [vimVar, setVimVar] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("novelty2_vimVar");
      return saved ? parseFloat(saved) : 0;
    }
    return 0;
  });

  const [vimStability, setVimStability] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("novelty2_vimStability");
      return saved ? parseFloat(saved) : 0;
    }
    return 0;
  });

  // ---- FIS routing & reduction (session-based) ----
  const [totalFrames, setTotalFrames] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("novelty2_totalFrames");
      return saved ? parseInt(saved) : 0;
    }
    return 0;
  });

  const [fisForwardedFrames, setFisForwardedFrames] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("novelty2_fisForwardedFrames");
      return saved ? parseInt(saved) : 0;
    }
    return 0;
  });

  const [frameSummary, setFrameSummary] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("novelty2_frameSummary");
      return saved
        ? JSON.parse(saved)
        : { normal: 0, warning: 0, anomalous: 0 };
    }
    return { normal: 0, warning: 0, anomalous: 0 };
  });

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "novelty2_currentFrameIndex",
        currentFrameIndex.toString(),
      );
    }
  }, [currentFrameIndex]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "novelty2_storedFrames",
        JSON.stringify(storedFrames),
      );
    }
  }, [storedFrames]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("novelty2_fisValue", fisValue.toString());
    }
  }, [fisValue]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("novelty2_currentStatus", currentStatus);
    }
  }, [currentStatus]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("novelty2_threshold", threshold?.toString() || "");
    }
  }, [threshold]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("novelty2_trendSeries", JSON.stringify(trendSeries));
    }
  }, [trendSeries]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("novelty2_logs", JSON.stringify(logs));
    }
  }, [logs]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("novelty2_hasUploaded", hasUploaded.toString());
    }
  }, [hasUploaded]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("novelty2_vimMean", vimMean.toString());
    }
  }, [vimMean]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("novelty2_vimVar", vimVar.toString());
    }
  }, [vimVar]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("novelty2_vimStability", vimStability.toString());
    }
  }, [vimStability]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("novelty2_totalFrames", totalFrames.toString());
    }
  }, [totalFrames]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "novelty2_fisForwardedFrames",
        fisForwardedFrames.toString(),
      );
    }
  }, [fisForwardedFrames]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "novelty2_frameSummary",
        JSON.stringify(frameSummary),
      );
    }
  }, [frameSummary]);

  // Load current frame data when index changes
  useEffect(() => {
    if (currentFrame) {
      setFisValue(currentFrame.fis);
      setCurrentStatus(currentFrame.status);
      setThreshold(currentFrame.threshold);
      setVimMean(currentFrame.vimMean);
      setVimVar(currentFrame.vimVar);
      setVimStability(currentFrame.vimStability);
      setHasUploaded(true);
    }
  }, [currentFrame]);

  // 2-second loading spinner
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const fisFilteredFrames = totalFrames - fisForwardedFrames;

  const reductionPercent =
    totalFrames > 0 ? (fisFilteredFrames / totalFrames) * 100 : 0;

  const dynamicAnomalyTrendData: ChartData<"line"> = {
    labels: trendSeries.map((p) => p.frame.toString()),
    datasets: [
      {
        label: "Anomaly Score (FIS)",
        data: trendSeries.map((p) => p.score),
        borderColor: "#3B82F6",
        borderWidth: 3,
        tension: 0.35,
        fill: true,
        backgroundColor: (ctx: ScriptableContext<"line">) => {
          const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 260);
          g.addColorStop(0, "rgba(59,130,246,0.25)");
          g.addColorStop(1, "rgba(59,130,246,0.02)");
          return g;
        },
      },
      {
        label: "Threshold",
        data: trendSeries.map(() => THRESHOLD),
        borderColor: "#EF4444",
        borderDash: [6, 6],
        borderWidth: 2,
        pointRadius: 0,
      },
    ],
  };

  const dynamicAnomalyTrendOptions: ChartOptions<"line"> = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { min: 0, max: 1 } },
  };

  const dynamicRegions = currentFrame?.regions || [
    { region: "Top-Left", error: fisValue * (0.8 + Math.random() * 0.4) },
    { region: "Top-Right", error: fisValue * (0.8 + Math.random() * 0.4) },
    { region: "Center", error: fisValue * (0.8 + Math.random() * 0.4) },
    { region: "Bottom-Left", error: fisValue * (0.8 + Math.random() * 0.4) },
    { region: "Bottom-Right", error: fisValue * (0.8 + Math.random() * 0.4) },
  ];

  const highestDynamicRegion =
    hasUploaded && dynamicRegions.length > 0
      ? dynamicRegions.reduce((a, b) => (a.error > b.error ? a : b))
      : null;

  // Function to clear all stored data
  const clearAllData = () => {
    // Clear localStorage
    if (typeof window !== "undefined") {
      const keys = [
        "novelty2_currentFrameIndex",
        "novelty2_storedFrames",
        "novelty2_fisValue",
        "novelty2_currentStatus",
        "novelty2_threshold",
        "novelty2_trendSeries",
        "novelty2_logs",
        "novelty2_hasUploaded",
        "novelty2_vimMean",
        "novelty2_vimVar",
        "novelty2_vimStability",
        "novelty2_totalFrames",
        "novelty2_fisForwardedFrames",
        "novelty2_frameSummary",
      ];

      keys.forEach((key) => localStorage.removeItem(key));
    }

    // Reset all state to defaults
    setCurrentFrameIndex(0);
    setStoredFrames([]);
    setFisValue(0);
    setCurrentStatus("NORMAL");
    setThreshold(null);
    setTrendSeries([]);
    setLogs([]);
    setHasUploaded(false);
    setVimMean(0);
    setVimVar(0);
    setVimStability(0);
    setTotalFrames(0);
    setFisForwardedFrames(0);
    setFrameSummary({ normal: 0, warning: 0, anomalous: 0 });

    toast.info("All data has been cleared");
  };

  // Navigation functions
  const goToPreviousFrame = () => {
    if (currentFrameIndex > 0) {
      setCurrentFrameIndex((prev: number) => prev - 1);
    }
  };

  const goToNextFrame = () => {
    if (currentFrameIndex < storedFrames.length - 1) {
      setCurrentFrameIndex((prev: number) => prev + 1);
    }
  };

  const analyzeFrame = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("http://127.0.0.1:8000/frame/analyze", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    // Extract VIM metrics from region errors
    let vimMean = 0;
    let vimVar = 0;
    let vimStability = 0;
    const regions: Array<{ region: string; error: number }> = [];

    if (data.region_analysis?.regions) {
      const values = Object.values(data.region_analysis.regions) as number[];
      const regionNames = Object.keys(data.region_analysis.regions);

      if (values.length > 0) {
        vimMean = values.reduce((a, b) => a + b, 0) / values.length;
        vimVar =
          values.reduce((a, b) => a + Math.pow(b - vimMean, 2), 0) /
          values.length;
        vimStability = 1 / (1 + vimVar);

        // Store region errors
        regionNames.forEach((region, index) => {
          regions.push({
            region,
            error: values[index],
          });
        });
      }
    }

    const fis = data.frame_analysis.fis;
    const backendThreshold = data.frame_analysis.threshold;

    const status: AnomalyStatus =
      fis < backendThreshold
        ? "NORMAL"
        : fis < backendThreshold * 1.5
          ? "WARNING"
          : "ANOMALOUS";

    // Create new frame data
    const newFrameData: FrameData = {
      id: Date.now(),
      timestamp: Date.now(),
      imageUrl: URL.createObjectURL(file),
      fis,
      status,
      threshold: backendThreshold,
      vimBase64: data.visual_outputs?.vim_base64
        ? `data:image/png;base64,${data.visual_outputs.vim_base64}`
        : null,
      reconBase64: data.visual_outputs?.reconstruction_base64
        ? `data:image/jpeg;base64,${data.visual_outputs.reconstruction_base64}`
        : null,
      vimMean,
      vimVar,
      vimStability,
      regions,
    };

    // Add to stored frames and set as current
    setStoredFrames((prev: FrameData[]) => [...prev, newFrameData]);
    setCurrentFrameIndex(storedFrames.length); // Navigate to the new frame

    // Update current display values
    setFisValue(fis);
    setCurrentStatus(status);
    setThreshold(backendThreshold);
    setVimMean(vimMean);
    setVimVar(vimVar);
    setVimStability(vimStability);

    // Update trend series
    setTrendSeries((prev: AnomalyPoint[]) => [
      ...prev.slice(-7),
      { frame: Date.now(), score: fis },
    ]);

    // Update logs
    setLogs((prev: LogItem[]) => [
      {
        time: new Date().toLocaleTimeString(),
        frame: Date.now(),
        message: `FIS ${fis.toFixed(4)} → ${status}`,
        level:
          status === "ANOMALOUS"
            ? "error"
            : status === "WARNING"
              ? "warning"
              : "info",
      },
      ...prev.slice(0, 49), // Keep only last 50 logs
    ]);

    setHasUploaded(true);

    // ---- Session frame counters ----
    setTotalFrames((prev: number) => prev + 1);

    if (status !== "NORMAL") {
      setFisForwardedFrames((prev: number) => prev + 1);
    }

    // Update frame summary
    setFrameSummary(
      (prev: { normal: number; warning: number; anomalous: number }) => ({
        ...prev,
        normal: prev.normal + (status === "NORMAL" ? 1 : 0),
        warning: prev.warning + (status === "WARNING" ? 1 : 0),
        anomalous: prev.anomalous + (status === "ANOMALOUS" ? 1 : 0),
      }),
    );

    // Show toast notifications
    if (status === "WARNING") {
      toast.warning(
        <div>
          <strong>⚠️ Warning</strong>
          <div>Frame flagged as borderline</div>
          <small>FIS Score: {fis.toFixed(2)}</small>
        </div>,
        {
          autoClose: 4000,
          position: "top-right",
          style: {
            background: "#ff9800",
            color: "#fff",
          },
        },
      );
    }

    if (status === "ANOMALOUS") {
      toast.error(
        <div>
          <strong>🚨 Anomaly Detected</strong>
          <div>Frame has been forwarded to fog layer</div>
          <small>Immediate attention required</small>
        </div>,
        {
          autoClose: 4000,
          position: "top-right",
          style: {
            background: "#f44336",
            color: "#fff",
          },
        },
      );
    }
  };

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
        {/* Header with Clear Data and Frame Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={clearAllData}
            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors border border-gray-300 flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Clear All Data
          </button>

          {/* Frame Navigation */}
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-700 font-medium">
              Frame {currentFrameIndex + 1} of {storedFrames.length}
            </div>
            <div className="flex gap-2">
              <button
                onClick={goToPreviousFrame}
                disabled={currentFrameIndex === 0}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${
                  currentFrameIndex === 0
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Previous
              </button>
              <button
                onClick={goToNextFrame}
                disabled={currentFrameIndex >= storedFrames.length - 1}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${
                  currentFrameIndex >= storedFrames.length - 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
              >
                Next
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* ROW 1 – MAIN VISUALIZATION (3 big cards) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Original Frame
            </h3>

            {/* Image Preview */}
            <div className="relative w-full h-52 md:h-56 rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
              <Image
                src={currentFrame?.imageUrl ?? Live}
                alt="Original fabric frame"
                fill
                className="object-cover"
              />
            </div>

            {/* Upload Button */}
            <div className="mt-3 flex items-center gap-3">
              <input
                type="file"
                accept="image/jpeg,image/png"
                id="frame-upload"
                className="hidden"
                onChange={(e) => {
                  if (!e.target.files?.[0]) return;
                  const file = e.target.files[0];
                  analyzeFrame(file);
                }}
              />
              <label
                htmlFor="frame-upload"
                className="px-4 py-1.5 rounded-full bg-indigo-600 text-white text-xs font-semibold cursor-pointer hover:bg-indigo-700"
              >
                Upload Frame
              </label>
            </div>

            <p className="mt-2 text-xs text-gray-500">
              Upload a fabric frame to simulate live anomaly analysis.
            </p>
          </Card>

          {/* Autoencoder Reconstruction */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Autoencoder Reconstruction
            </h3>
            <div className="relative w-full h-52 md:h-56 rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
              <Image
                src={currentFrame?.reconBase64 ?? Live}
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
              {currentFrame?.vimBase64 ? (
                <img
                  src={currentFrame.vimBase64}
                  alt="VIM Heatmap"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[radial-gradient(circle_at_30%_30%,rgba(239,68,68,0.9),transparent_55%),radial-gradient(circle_at_70%_60%,rgba(245,158,11,0.9),transparent_55%),radial-gradient(circle_at_50%_90%,rgba(59,130,246,0.7),transparent_55%)]" />
              )}
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
                        {fisValue.toFixed(2)}
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
                      Frame ID
                    </p>
                    <p className="font-semibold">#{currentFrame?.id || "—"}</p>
                  </div>

                  <div>
                    <p className="text-gray-500 text-xs uppercase mb-1">
                      Threshold (μ + 3σ)
                    </p>
                    <p className="font-semibold">
                      {threshold !== null ? threshold.toFixed(4) : "--"}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500 text-xs uppercase mb-1">
                      Decision
                    </p>
                    <p className="font-semibold">
                      {currentStatus === "ANOMALOUS"
                        ? "Forward to Fog Enhancement"
                        : currentStatus === "WARNING"
                          ? "Flag for Fog Review"
                          : "Normal Flow"}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500 text-xs uppercase mb-1">
                      Decision Confidence (Edge)
                    </p>
                    <p className="font-semibold">
                      ~{(fisValue * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed">
                  FIS is computed as the mean squared error between original and
                  reconstructed frame. Frames above the threshold are flagged as
                  anomalous and forwarded to the fog computing layer, where
                  adaptive enhancement is applied before defect detection.
                </p>
              </div>
            </Card>

            {/* Region Breakdown Card */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Anomaly Region Breakdown
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                {dynamicRegions.map((p) => {
                  const isHighest =
                    hasUploaded && highestDynamicRegion?.region === p.region;

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
                        Error Score: {hasUploaded ? p.error.toFixed(2) : "0.00"}
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
                dominant irregularity zones and help localize anomalies before
                frames are forwarded to the fog computing layer for targeted
                enhancement.
              </p>
            </Card>
          </div>

          {/* RIGHT COLUMN: Anomaly Trend Line Chart */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Anomaly Trend Across Recent Frames
            </h3>
            <div className="w-full h-82 md:h-118">
              <Line
                data={dynamicAnomalyTrendData}
                options={dynamicAnomalyTrendOptions}
              />
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                <span>Frames forwarded to Fog Layer</span>
                <span className="font-semibold">{fisForwardedFrames}</span>
              </div>
              <div className="flex justify-between">
                <span>Frames filtered at edge</span>
                <span className="font-semibold">{fisFilteredFrames}</span>
              </div>
              <div className="flex justify-between">
                <span>Forwarding ratio</span>
                <span className="font-semibold">
                  {totalFrames > 0
                    ? ((fisForwardedFrames / totalFrames) * 100).toFixed(1)
                    : "0.0"}
                  %
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Only frames with meaningful irregularity are forwarded, reducing
              load on the defect detection model.
            </p>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Frame Classification Summary
            </h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-emerald-700">Normal frames</span>
                <span className="font-semibold">{frameSummary.normal}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-amber-700">Borderline frames</span>
                <span className="font-semibold">{frameSummary.warning}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-red-700">Irregular frames</span>
                <span className="font-semibold">{frameSummary.anomalous}</span>
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-3">
              Only borderline and irregular frames are forwarded to the next
              quality-intelligence stage (Novelty 3).
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
                  Reduces bandwidth and compute load by ensuring only relevant
                  frames are enhanced at the fog layer before defect detection.
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
            <div className="flex items-center space-x-2 text-xs text-red-700">
              <span className="inline-flex items-center px-3 py-2 rounded-full bg-red-50 outline">
                <span className="w-2 h-2 rounded-full bg-red-500 mr-1.5 -mt-0.5 animate-pulse font-bold" />
                LIVE
              </span>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto pr-1">
            {logs.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                No events logged yet. Upload a frame to start analysis.
              </div>
            ) : (
              logs.map((log, index) => (
                <div
                  key={`${log.time}-${log.frame}-${index}`}
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
              ))
            )}
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default Novelty2Anomaly;
