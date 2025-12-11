"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Inter } from "next/font/google";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

// Register Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
);

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

// -------------------- Animation --------------------
const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

// -------------------- Reusable Card --------------------
const Card: React.FC<CardProps> = ({ children, className = "" }) => (
  <motion.div
    variants={fadeIn}
    className={`rounded-2xl bg-white shadow-md p-7 border border-gray-200 ${className}`}
  >
    {children}
  </motion.div>
);

// -------------------- Historical Data --------------------
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const inspectionData = {
  labels: days,
  datasets: [
    {
      label: "Frames Inspected",
      data: [4200, 3900, 4500, 4800, 5100, 4700, 4300],
      backgroundColor: "rgba(59, 130, 246, 0.7)",
      borderRadius: 6,
    },
    {
      label: "Defective Frames",
      data: [210, 180, 260, 300, 330, 280, 220],
      backgroundColor: "rgba(239, 68, 68, 0.7)",
      borderRadius: 6,
    },
  ],
};

const defectTrendData = {
  labels: days,
  datasets: [
    {
      label: "Defect Rate (%)",
      data: [4.8, 4.3, 5.2, 5.8, 6.1, 5.7, 5.0],
      borderColor: "#10b981",
      pointBackgroundColor: "#047857",
      pointBorderColor: "#fff",
      backgroundColor: "rgba(16,185,129,0.15)",
      tension: 0.35,
      borderWidth: 3,
      fill: true,
    },
  ],
};

// -------------------- REALISTIC OVERLAY HEATMAP --------------------
const ContourHeatmap: React.FC = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    const img = new Image();
    img.src = "/fabric/img.png"; // must be inside /public folder

    img.onload = () => {
      // Draw background fabric image
      ctx.drawImage(img, 0, 0, w, h);

      // Grayscale conversion of the background
      const frame = ctx.getImageData(0, 0, w, h);
      const px = frame.data;

      for (let i = 0; i < px.length; i += 4) {
        const avg = (px[i] + px[i + 1] + px[i + 2]) / 3;
        px[i] = avg;
        px[i + 1] = avg;
        px[i + 2] = avg;
      }
      ctx.putImageData(frame, 0, 0);

      // ---------- CONTOUR INTENSITY FIELD ----------
      const intensity = new Float32Array(w * h);

      // More organic anomaly shapes
      const blobs = [
        { x: 150, y: 80, r: 140 },
        { x: 330, y: 120, r: 220 },
        { x: 490, y: 70, r: 150 },
      ];

      blobs.forEach((b) => {
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const dx = x - b.x;
            const dy = y - b.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            let v = Math.max(0, 1 - dist / b.r);
            v = Math.pow(v, 1.7); // softer rolloff

            intensity[y * w + x] += v;
          }
        }
      });

      // ---------- FINAL HEATMAP COLORING (CONTOUR STYLE) ----------
      const heatmap = ctx.getImageData(0, 0, w, h);
      const d = heatmap.data;

      const contour = (v: number) => {
        // v: 0 → 1 normalized

        if (v < 0.15) return { r: 255, g: 255, b: 150, a: 90 }; // very light yellow
        if (v < 0.35) return { r: 255, g: 220, b: 120, a: 110 }; // gold
        if (v < 0.55) return { r: 255, g: 160, b: 60, a: 130 }; // orange
        if (v < 0.8) return { r: 255, g: 100, b: 40, a: 160 }; // deep orange-red
        return { r: 255, g: 40, b: 40, a: 180 }; // strong red (peak)
      };

      for (let i = 0; i < intensity.length; i++) {
        let v = Math.min(1, intensity[i] * 1.25);

        if (v > 0.05) {
          const idx = i * 4;
          const col = contour(v);

          d[idx] = col.r;
          d[idx + 1] = col.g;
          d[idx + 2] = col.b;
          d[idx + 3] = col.a;
        }
      }

      ctx.putImageData(heatmap, 0, 0);

      // Final blur pass for contour blending
      ctx.globalAlpha = 0.5;
      ctx.filter = "blur(10px)";
      ctx.drawImage(canvas, 0, 0);
      ctx.filter = "none";
      ctx.globalAlpha = 1;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={200}
      className="w-full h-[150px] rounded-xl"
    />
  );
};

// -------------------- Component --------------------
const HomeDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1800);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <motion.div className="flex items-center justify-center min-h-screen bg-gray-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="h-12 w-12 border-4 border-indigo-500 rounded-full border-t-transparent"
        />
      </motion.div>
    );
  }

  // -------------------- PAGE --------------------
  return (
    <AnimatePresence>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className={`p-6 min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 ${inter.className}`}
      >
        {/* HEADER */}
        <div className="max-w-[1500px] mx-auto mb-8">
          <h1 className="text-sm font-mono text-gray-600 mb-1">Overview</h1>
          <h1 className="text-4xl font-bold text-gray-800 mb-1">
            Home Dashboard
          </h1>
          <p className="text-lg font-semibold text-gray-600">
            Summary • Insights • Factory Performance
          </p>
        </div>

        {/* MAIN GRID (3 COLUMNS) */}
        <div className="max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN – Historical Performance */}
          <div className="space-y-6">
            {/* Week Summary Chart */}
            <Card className="min-h-[300px]">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Weekly Fabric Inspection Summary
              </h3>
              <Bar
                data={inspectionData}
                options={{
                  responsive: true,
                  plugins: { legend: { position: "bottom" } },
                }}
              />
              <p className="text-xs text-gray-500 mt-4">
                Shows total inspected frames vs detected anomalies during the
                last 7 days.
              </p>
            </Card>

            {/* Defect Rate Trend */}
            <Card className="min-h-[300px]">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Defect Rate Trend (Past 7 Days)
              </h3>
              <Line
                data={defectTrendData}
                options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                }}
              />
              <p className="text-xs text-gray-500 mt-4">
                Average defect rate this week:{" "}
                <span className="font-semibold">5.1%</span>
              </p>
            </Card>
          </div>

          {/* MIDDLE COLUMN – Latest Fabric Roll */}
          <div className="space-y-6">
            {/* Latest Roll Summary */}
            <Card className="min-h-[300px]">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Latest Fabric Roll Summary
              </h3>

              <div className="flex items-center gap-6">
                {/* RQI Score Ring */}
                <div className="w-28 h-28 rounded-full border-[10px] border-green-400 flex items-center justify-center text-3xl font-bold text-green-600">
                  0.91
                </div>

                <div className="flex-1 space-y-2">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Dominant Defect:</span> Knot
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Frames processed:</span>{" "}
                    4,850
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Anomalies found:</span> 214
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-xl overflow-hidden border border-gray-300 bg-black/80">
                <ContourHeatmap />
              </div>

              <p className="text-xs text-gray-500 mt-2">
                Heatmap represents concentrated irregularity zones detected in
                the last inspected roll.
              </p>
            </Card>

            {/* Recent Activity Log */}
            <Card className="min-h-[260px]">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Recent Activity
              </h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>✔ Roll #32 completed inspection.</li>
                <li>✔ System ran continuously for 6.2 hours.</li>
                <li>✔ Camera clarity stable at 96%.</li>
                <li>⚠ Minor tension irregularities detected in Roll #31.</li>
              </ul>
            </Card>
          </div>

          {/* RIGHT COLUMN – System Overview */}
          <div className="space-y-6">
            {/* System Stability */}
            <Card className="min-h-[260px]">
              <h3 className="text-xl font-bold text-gray-800 mb-6">
                System Stability Overview
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Uptime (Week)</span>
                  <span className="text-xl font-bold text-blue-600">97%</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Processing Efficiency</span>
                  <span className="text-xl font-bold text-indigo-600">92%</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Camera Reliability</span>
                  <span className="text-xl font-bold text-green-600">95%</span>
                </div>
              </div>
            </Card>

            {/* Recommendations */}
            <Card className="min-h-[240px]">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Recommendations
              </h3>

              <ul className="text-sm text-gray-700 space-y-3">
                <li>• Clean camera lens before starting next shift.</li>
                <li>• Monitor tension in Roll #31 (unstable texture zones).</li>
                <li>• Recalibrate brightness if ambient light changes.</li>
              </ul>
            </Card>
          </div>
        </div>

        {/* FOOTER */}
        <motion.div className="max-w-[1500px] mx-auto mt-10 pt-6 border-t border-gray-200 text-sm text-gray-500">
          <div className="flex justify-between">
            <span>
              <strong>Home Dashboard v1.0</strong>
            </span>
            <span className="font-mono">Updated Today • 10:25:30</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default HomeDashboard;
