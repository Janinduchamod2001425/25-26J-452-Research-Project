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
import { AlertTriangle, Pause, Play } from "lucide-react";

/* -------------------- Chart Register -------------------- */
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
);

/* -------------------- Font -------------------- */
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-inter",
});

/* -------------------- Motion API -------------------- */
const callMotionAPI = async (base64Image: string) => {
  const blob = await fetch(base64Image).then((r) => r.blob());
  const formData = new FormData();
  formData.append("file", blob, "frame.jpg");

  const res = await fetch("http://127.0.0.1:8000/motion/predict", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Motion API failed");
  return res.json();
};

/* -------------------- Types -------------------- */
type MotionState = "ACTIVE" | "IDLE" | "UNSTABLE";

interface MotionTimelinePoint {
  label: string;
  state: MotionState;
}

interface LogItem {
  time: string;
  message: string;
}

/* -------------------- Static Info -------------------- */
const motionStatus = {
  state: "ACTIVE" as MotionState,
  fps: 24,
  mode: "Fabric Roll" as const,
  confidence: 0.95,
};

const idleSummary = {
  longestGapSec: 12,
  events: 4,
  totalIdleSec: 38,
};

const initialTimeline: MotionTimelinePoint[] = [
  { label: "10:20", state: "IDLE" },
  { label: "10:21", state: "ACTIVE" },
  { label: "10:22", state: "ACTIVE" },
  { label: "10:23", state: "UNSTABLE" },
  { label: "10:24", state: "ACTIVE" },
  { label: "10:25", state: "IDLE" },
  { label: "10:26", state: "ACTIVE" },
];

const initialLogs: LogItem[] = [
  { time: "10:22:01", message: "Fabric Detected" },
  { time: "10:22:02", message: "Motion State: ACTIVE" },
  { time: "10:22:03", message: "Frame Captured" },
];

/* -------------------- Animations -------------------- */
const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

/* -------------------- Reusable -------------------- */
const Card = ({ children, className = "" }: any) => (
  <motion.div
    variants={fadeIn}
    className={`rounded-2xl shadow-lg p-6 border border-gray-200 ${className}`}
  >
    {children}
  </motion.div>
);

const LogEntry = ({ time, message }: LogItem) => (
  <div className="flex justify-between text-sm text-gray-600 py-1 border-b border-gray-100">
    <span className="font-mono">{time}</span>
    <span>{message}</span>
  </div>
);

/* ============================ MAIN ============================ */
const Novelty1Motion: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [liveFrame, setLiveFrame] = useState<string | null>(null);
  const [apiResult, setApiResult] = useState<any>(null);

  const [logs, setLogs] = useState<LogItem[]>(initialLogs);
  const [timeline, setTimeline] =
    useState<MotionTimelinePoint[]>(initialTimeline);

  const [recentStates, setRecentStates] = useState<MotionState[]>([]);

  // Idle analytics state
  const [idleEvents, setIdleEvents] = useState(0);
  const [totalIdleSec, setTotalIdleSec] = useState(0);
  const [longestIdleSec, setLongestIdleSec] = useState(0);

  // Internal trackers
  const [currentIdleStart, setCurrentIdleStart] = useState<number | null>(null);
  const [lastMotionState, setLastMotionState] = useState<MotionState>("IDLE");

  /* ✅ DYNAMIC FRAME STATS */
  const [frameStats, setFrameStats] = useState({
    totalFrames: 0,
    savedFrames: 0,
    ignoredFrames: 0,
  });

  /* Loader */
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!videoFile) return;

    const url = URL.createObjectURL(videoFile);
    const video = document.getElementById("demo-video") as HTMLVideoElement;
    if (video) video.src = url;

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [videoFile]);

  /* Video → Frame → API */
  useEffect(() => {
    if (!demoMode || !videoFile) return;

    const video = document.getElementById("demo-video") as HTMLVideoElement;
    const canvas = document.getElementById("demo-canvas") as HTMLCanvasElement;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const interval = setInterval(async () => {
      if (video.videoWidth === 0) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      const frame = canvas.toDataURL("image/jpeg");
      setLiveFrame(frame);

      const result = await callMotionAPI(frame);
      setApiResult(result);

      const isActive = result.prediction === "active";

      const now = Date.now();

      // Transition: ACTIVE → IDLE
      if (!isActive && lastMotionState !== "IDLE") {
        setIdleEvents((prev) => prev + 1);
        setCurrentIdleStart(now);
      }

      // Still IDLE
      if (!isActive && currentIdleStart !== null) {
        const idleDurationSec = Math.floor((now - currentIdleStart) / 1000);

        setTotalIdleSec((prev) =>
          idleDurationSec > prev ? idleDurationSec : prev,
        );

        setLongestIdleSec((prev) =>
          idleDurationSec > prev ? idleDurationSec : prev,
        );
      }

      // Transition: IDLE → ACTIVE
      if (isActive && lastMotionState === "IDLE") {
        setCurrentIdleStart(null);
      }

      // Save last state
      setLastMotionState(isActive ? "ACTIVE" : "IDLE");

      setRecentStates((prev) => {
        const nextState: MotionState = isActive ? "ACTIVE" : "IDLE";
        const updated: MotionState[] = [...prev, nextState];
        return updated.slice(-10);
      });

      /* ✅ UPDATE FRAME METRICS */
      setFrameStats((prev) => ({
        totalFrames: prev.totalFrames + 1,
        savedFrames: prev.savedFrames + (isActive ? 1 : 0),
        ignoredFrames: prev.ignoredFrames + (isActive ? 0 : 1),
      }));

      setLogs((prev) => [
        {
          time: new Date().toLocaleTimeString(),
          message: `Motion State: ${result.prediction.toUpperCase()}`,
        },
        ...prev.slice(0, 14),
      ]);

      setTimeline((prev) => [
        ...prev.slice(1),
        {
          label: new Date().toLocaleTimeString().slice(0, 5),
          state: isActive ? "ACTIVE" : "IDLE",
        },
      ]);
    }, 1200);

    return () => clearInterval(interval);
  }, [demoMode, videoFile]);

  /* Derived Metrics */
  const activeRatio =
    frameStats.totalFrames > 0
      ? (frameStats.savedFrames / frameStats.totalFrames) * 100
      : 0;

  const idleRatio = 100 - activeRatio;

  const reduction =
    frameStats.totalFrames > 0
      ? (frameStats.ignoredFrames / frameStats.totalFrames) * 100
      : 0;

  /* Chart */
  const motionTimelineData: ChartData<"line"> = {
    labels: timeline.map((t) => t.label),
    datasets: [
      {
        label: "Motion",
        data: timeline.map((t) =>
          t.state === "ACTIVE" ? 1 : t.state === "IDLE" ? 0 : 0.5,
        ),
        fill: true,
        borderColor: "#3B82F6",
        tension: 0.35,
      },
    ],
  };

  const motionTimelineOptions: ChartOptions<"line"> = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { min: 0, max: 1 } },
  };

  const derivedState: MotionState =
    demoMode && apiResult
      ? apiResult.prediction === "active"
        ? "ACTIVE"
        : "IDLE"
      : "IDLE";

  const stabilityScore =
    recentStates.length === 0
      ? 0
      : recentStates.filter((s) => s === "ACTIVE").length / recentStates.length;

  if (loading) return <div className="min-h-screen" />;

  return (
    <AnimatePresence>
      <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={fadeIn}
        className={`min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 ${inter.className}`}
      >
        {/* Hidden */}
        <video
          id="demo-video"
          src={videoFile ? URL.createObjectURL(videoFile) : undefined}
          autoPlay
          muted
          loop
          className="hidden"
        />
        <canvas id="demo-canvas" className="hidden" />

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
                  <span
                    className={`px-4 py-1 rounded-full text-white font-bold ${
                      derivedState === "ACTIVE" ? "bg-green-600" : "bg-red-600"
                    }`}
                  >
                    {derivedState}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="font-semibold text-gray-700">
                    Confidence
                  </span>
                  <span className="font-bold text-gray-800">
                    {apiResult ? (apiResult.confidence * 100).toFixed(0) : "—"}%
                  </span>
                </div>
              </div>
            </Card>

            {/* 🔹 Live Preview + Demo Video Input */}
            <Card className="min-h-[260px]">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Live Preview (Sample Frame)
              </h3>

              {/* Preview Area */}
              <div className="relative w-full h-40 rounded-xl overflow-hidden border border-gray-200 bg-black/5">
                {demoMode && liveFrame ? (
                  <img
                    src={liveFrame}
                    alt="Live Frame"
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <Image
                    src={Live}
                    alt="Current fabric frame"
                    fill
                    className="object-cover"
                  />
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-gray-500 mt-2">
                {demoMode
                  ? "Live frames sampled from uploaded fabric roll video."
                  : "Static sample image for demo. In production, this will show the latest captured frame when motion is ACTIVE."}
              </p>

              {/* Divider */}
              <div className="border-t border-gray-200 my-3" />

              {/* Video Upload */}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">
                  Demo Mode – Upload Fabric Roll Video
                </label>

                <div>
                  <input
                    type="file"
                    accept="video/mp4"
                    id="video-upload"
                    className="hidden"
                    onChange={(e) => {
                      if (!e.target.files?.[0]) return;
                      setVideoFile(e.target.files[0]);
                      setDemoMode(true);
                    }}
                  />

                  <label
                    htmlFor="video-upload"
                    className="
                      inline-flex items-center gap-2
                      px-4 py-2
                      rounded-full
                      bg-blue-600 text-white
                      text-xs mt-0.5 font-semibold
                      cursor-pointer
                      hover:bg-blue-700
                      transition
                      shadow-sm
                    "
                  >
                    ▶ Upload Demo Video
                  </label>
                </div>

                <p className="text-[11px] text-gray-500 mt-1">
                  Used only for demonstration. Replaces live camera feed
                  temporarily.
                </p>
              </div>
            </Card>

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

            {/* Motion Stability */}
            <Card className="min-h-[150px]">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Motion Stability
              </h3>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-semibold text-lg">
                  Stability Score
                </span>
                <span
                  className={`text-3xl font-bold ${
                    stabilityScore > 0.7
                      ? "text-green-600"
                      : stabilityScore > 0.4
                        ? "text-amber-500"
                        : "text-red-600"
                  }`}
                >
                  {stabilityScore.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Computed from last {recentStates.length} frames • 1.0 = stable
                motion
              </p>

              <p className="text-xs text-red-500 font-normal italic mt-2">
                (Note: 1.0 = continuous stable motion • 0 = no effective motion)
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
                  <span className="font-bold">{idleEvents}</span>
                </div>

                <div className="flex justify-between">
                  <span>Longest Idle Gap</span>
                  <span className="font-bold">{longestIdleSec}s</span>
                </div>

                <div className="flex justify-between">
                  <span>Total Idle Duration</span>
                  <span className="font-bold">{totalIdleSec}s</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="max-w-[1500px] mx-auto mt-10 pt-6 border-t border-gray-200 text-sm text-gray-500">
          <div className="flex justify-between">
            <span>
              <strong>Operator Dashboard • Novelty 1</strong> — Motion-Driven
              Capture
            </span>
            <span className="font-mono">
              Session ID: MD-2025-01-01-001 • LIVE
            </span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Novelty1Motion;
