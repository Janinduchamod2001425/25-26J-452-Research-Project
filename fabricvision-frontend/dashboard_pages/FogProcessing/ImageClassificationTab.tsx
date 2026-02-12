// "use client";

// import React from "react";
// import axios from "axios";
// import { motion } from "framer-motion";
// import Image from "next/image";
// import { useFog } from "./FogContext";

// const ENHANCE_API =
//   "http://127.0.0.1:8000/fogcomputing/enhance?auto_classify=true";

// const ImageClassificationTab: React.FC = () => {
//   const {
//     file,
//     previewUrl,
//     setFileWithPreview,
//     enhanceData,
//     setEnhanceData,
//     loading,
//     setLoading,
//     error,
//     setError,
//   } = useFog();

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const selected = e.target.files?.[0] || null;
//     setFileWithPreview(selected);
//     setEnhanceData(null);
//     setError(null);
//   };

//   const handleRun = async () => {
//     if (!file) return;

//     setLoading(true);
//     setError(null);

//     try {
//       const formData = new FormData();
//       formData.append("file", file);

//       const res = await axios.post(ENHANCE_API, formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       setEnhanceData(res.data);
//     } catch (err: any) {
//       setError(err?.response?.data?.detail || "Failed. Check API.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const probs = enhanceData?.classification?.probabilities || null;
//   const predictedClass = enhanceData?.predicted_class;
//   const confidence = enhanceData?.classification?.confidence;

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 16 }}
//       animate={{ opacity: 1, y: 0 }}
//       className="space-y-6 max-w-5xl mx-auto"
//     >
//       <div>
//         <h1 className="text-2xl font-bold text-gray-900">
//           Fabric Classification & Enhancement
//         </h1>
//         {/* <p className="text-gray-600">
//           Upload once → class + confidence + probabilities, and Quality
//           Analytics tab will show metrics.
//         </p> */}
//       </div>

//       {/* Upload */}
//       <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
//         <label className="block text-sm font-medium text-gray-700 mb-2">
//           Upload Fabric Image
//         </label>

//         <input
//           type="file"
//           accept="image/png,image/jpeg"
//           onChange={handleFileChange}
//           className="block w-full text-sm text-gray-500
//             file:mr-4 file:py-2 file:px-4
//             file:rounded-lg file:border-0
//             file:text-sm file:font-semibold
//             file:bg-indigo-50 file:text-indigo-700
//             hover:file:bg-indigo-100"
//         />

//         {previewUrl && (
//           <div className="mt-4 relative w-full h-64 rounded-lg overflow-hidden border bg-gray-50">
//             <Image
//               src={previewUrl}
//               alt="Preview"
//               fill
//               className="object-contain"
//             />
//           </div>
//         )}

//         <button
//           onClick={handleRun}
//           disabled={!file || loading}
//           className="mt-4 px-6 py-2 rounded-lg bg-indigo-600 text-white font-medium
//             hover:bg-indigo-700 disabled:opacity-50"
//         >
//           {loading ? "Processing..." : "Run Classification"}
//         </button>
//       </div>

//       {/* Result */}
//       {enhanceData && (
//         <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-5">
//           <h2 className="text-lg font-semibold text-gray-900">
//             Classification Result
//           </h2>

//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600">Predicted Class</p>
//               <p className="text-2xl font-bold text-indigo-600">
//                 {predictedClass}
//               </p>
//             </div>

//             <div className="text-right">
//               <p className="text-sm text-gray-600">Confidence</p>
//               <p className="text-2xl font-bold text-emerald-600">
//                 {confidence === null || confidence === undefined
//                   ? "—"
//                   : `${(confidence * 100).toFixed(1)}%`}
//               </p>
//             </div>
//           </div>

//           {/* Probability bars (the “previous panel” you asked for) */}
//           {probs && (
//             <div>
//               <h3 className="text-sm font-semibold text-gray-700 mb-2">
//                 Class Probabilities
//               </h3>

//               <div className="space-y-2">
//                 {Object.entries(probs)
//                   .sort((a: any, b: any) => b[1] - a[1])
//                   .map(([cls, prob]: any) => (
//                     <div key={cls}>
//                       <div className="flex justify-between text-sm">
//                         <span
//                           className={`${
//                             cls === predictedClass
//                               ? "font-semibold text-indigo-700"
//                               : ""
//                           }`}
//                         >
//                           {cls}
//                         </span>
//                         <span>{(prob * 100).toFixed(1)}%</span>
//                       </div>
//                       <div className="w-full h-2 bg-gray-100 rounded-full">
//                         <div
//                           className={`h-2 rounded-full ${
//                             cls === predictedClass
//                               ? "bg-indigo-600"
//                               : "bg-indigo-300"
//                           }`}
//                           style={{ width: `${Math.min(100, prob * 100)}%` }}
//                         />
//                       </div>
//                     </div>
//                   ))}
//               </div>
//             </div>
//           )}
//         </div>
//       )}

//       {error && (
//         <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
//           {error}
//         </div>
//       )}
//     </motion.div>
//   );
// };

// export default ImageClassificationTab;

// new metrics
"use client";

import { useEffect, useState } from "react";

type StatusType = {
  timestamp: number | null;
  uptime_sec: number;
  fabric: {
    patterned_label: string;
    patterned_confidence: number;
    pattern_type: string;
    pattern_type_confidence: number;
  };
  enhancement: {
    strategy: string;
    quality_score: number;
    metrics_before: Record<string, number>;
    metrics_after: Record<string, number>;
    delta: Record<string, number>;
  };
  alerts: string[];
  performance: {
    fps: number;
    latency_ms: number;
    frames_processed: number;
  };
  preview: {
    enabled: boolean;
    enhanced_image_base64: string | null;
  };
};

export default function Dashboard() {
  const [status, setStatus] = useState<StatusType | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("http://localhost:8000/fog/status");
        const data = await res.json();
        setStatus(data);
      } catch (error) {
        console.error("Failed to fetch status:", error);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  const getQualityColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (!status) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gray-900">
        Loading system status...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">FabricVision Fog Dashboard</h1>

      {/* Fabric Profile */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-800 p-5 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-3">Fabric Profile</h2>
          <p>
            <strong>Patterned:</strong> {status.fabric.patterned_label}
          </p>
          <p>
            <strong>Pattern Confidence:</strong>{" "}
            {(status.fabric.patterned_confidence * 100).toFixed(1)}%
          </p>
          <p>
            <strong>Pattern Type:</strong> {status.fabric.pattern_type}
          </p>
          <p>
            <strong>Type Confidence:</strong>{" "}
            {(status.fabric.pattern_type_confidence * 100).toFixed(1)}%
          </p>
          <p>
            <strong>Strategy:</strong> {status.enhancement.strategy}
          </p>
        </div>

        {/* Quality Score */}
        <div className="bg-gray-800 p-5 rounded-xl shadow-lg flex flex-col justify-center items-center">
          <h2 className="text-xl font-semibold mb-3">Image Quality</h2>
          <div
            className={`w-32 h-32 rounded-full flex items-center justify-center text-3xl font-bold ${getQualityColor(
              status.enhancement.quality_score,
            )}`}
          >
            {status.enhancement.quality_score.toFixed(0)}
          </div>
        </div>
      </div>

      {/* Preview */}
      {status.preview.enabled && status.preview.enhanced_image_base64 && (
        <div className="bg-gray-800 p-5 rounded-xl shadow-lg mb-6">
          <h2 className="text-xl font-semibold mb-3">Enhanced Preview</h2>
          <img
            src={`data:image/jpeg;base64,${status.preview.enhanced_image_base64}`}
            alt="Enhanced Fabric"
            className="rounded-lg max-h-[400px] object-contain mx-auto"
          />
        </div>
      )}

      {/* Alerts */}
      <div className="bg-gray-800 p-5 rounded-xl shadow-lg mb-6">
        <h2 className="text-xl font-semibold mb-3">System Alerts</h2>
        {status.alerts.length === 0 ? (
          <p className="text-green-400">No alerts</p>
        ) : (
          <ul className="space-y-2">
            {status.alerts.map((alert, idx) => (
              <li key={idx} className="bg-red-600 px-3 py-2 rounded-md">
                {alert}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Performance Metrics */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gray-800 p-5 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-2">FPS</h3>
          <p className="text-2xl">{status.performance.fps.toFixed(2)}</p>
        </div>
        <div className="bg-gray-800 p-5 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-2">Latency (ms)</h3>
          <p className="text-2xl">{status.performance.latency_ms.toFixed(1)}</p>
        </div>
        <div className="bg-gray-800 p-5 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-2">Frames Processed</h3>
          <p className="text-2xl">{status.performance.frames_processed}</p>
        </div>
      </div>
    </div>
  );
}
