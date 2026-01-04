// "use client";

// import React, { useEffect, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import Image from "next/image";
// import {
//   LineChart,
//   Line,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";
// import fabricPreview from "@/assets/im_1.png";

// // Loading Spinner Component
// const LoadingSpinner = () => (
//   <motion.div
//     className="flex items-center justify-center min-h-screen"
//     initial={{ opacity: 0 }}
//     animate={{ opacity: 1 }}
//   >
//     <motion.div
//       animate={{ rotate: 360 }}
//       transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
//       className="h-12 w-12 border-4 border-indigo-500 rounded-full border-t-transparent"
//     />
//   </motion.div>
// );

// // Animated Metric Card Component
// const AnimatedMetricCard = ({ title, value, unit = "%", note, color }: any) => {
//   const [count, setCount] = useState(0);

//   useEffect(() => {
//     let current = 0;
//     const step = value / 30;
//     const timer = setInterval(() => {
//       current += step;
//       if (current >= value) {
//         setCount(value);
//         clearInterval(timer);
//       } else {
//         setCount(Math.round(current));
//       }
//     }, 20);
//     return () => clearInterval(timer);
//   }, [value]);

//   return (
//     <motion.div
//       whileHover={{ scale: 1.03 }}
//       className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm"
//     >
//       <p className="text-sm text-gray-600 mb-2">{title}</p>
//       <p className={`text-3xl font-bold ${color}`}>
//         {count}
//         <span className="text-lg font-medium">{unit}</span>
//       </p>
//       <p className="text-xs text-gray-500 mt-2">{note}</p>
//     </motion.div>
//   );
// };

// // Metric Row Component
// const MetricRow = ({
//   label,
//   value,
//   trend,
// }: {
//   label: string;
//   value: string;
//   trend: "up" | "flat" | "down";
// }) => {
//   const trendConfig = {
//     up: { icon: "↗", color: "text-green-500", bg: "bg-green-50" },
//     flat: { icon: "→", color: "text-blue-500", bg: "bg-blue-50" },
//     down: { icon: "↘", color: "text-amber-500", bg: "bg-amber-50" },
//   };
//   const config = trendConfig[trend];

//   return (
//     <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
//       <div>
//         <p className="text-sm font-medium text-gray-700">{label}</p>
//         <p className="text-2xl font-bold text-gray-900">{value}</p>
//       </div>
//       <div
//         className={`px-3 py-1 rounded-full ${config.bg} ${config.color} text-sm font-medium`}
//       >
//         {config.icon} {trend.toUpperCase()}
//       </div>
//     </div>
//   );
// };

// // Alert Card Component
// const AlertCard = ({
//   alert,
// }: {
//   alert: {
//     id: number;
//     level: string;
//     message: string;
//     time: string;
//     date: string;
//   };
// }) => {
//   const bg =
//     alert.level === "High"
//       ? "bg-red-50 border-l-4 border-red-500"
//       : alert.level === "Medium"
//       ? "bg-amber-50 border-l-4 border-amber-500"
//       : "bg-blue-50 border-l-4 border-blue-500";

//   return (
//     <motion.div
//       initial={{ opacity: 0, x: -10 }}
//       animate={{ opacity: 1, x: 0 }}
//       className={`flex items-start rounded-lg p-4 ${bg} shadow-sm hover:shadow-md transition-shadow`}
//     >
//       <div className="flex items-start gap-3 w-full">
//         <div
//           className={`w-3 h-3 rounded-full mt-1.5 ${
//             alert.level === "High"
//               ? "bg-red-500"
//               : alert.level === "Medium"
//               ? "bg-amber-500"
//               : "bg-blue-500"
//           }`}
//         />
//         <div className="flex-1">
//           <div className="flex justify-between items-start">
//             <div>
//               <p className="text-sm font-semibold text-gray-900">
//                 {alert.level} Alert
//               </p>
//               <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
//             </div>
//             <div className="text-right">
//               <p className="text-xs font-medium text-gray-500">{alert.time}</p>
//               <p className="text-xs text-gray-400">{alert.date}</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </motion.div>
//   );
// };

// // Main Dashboard Component
// const EnhancementOverviewDashboard: React.FC = () => {
//   const [loading, setLoading] = useState<boolean>(true);
//   const [systemStatus, setSystemStatus] = useState({
//     active: true,
//     uptime: "99.9%",
//     avgFPS: 28,
//     latency: "62ms",
//     activeAlerts: 3,
//   });

//   // Chart data
//   const fpsData = [
//     { time: "14:00", fps: 30 },
//     { time: "14:05", fps: 28 },
//     { time: "14:10", fps: 29 },
//     { time: "14:15", fps: 31 },
//     { time: "14:20", fps: 27 },
//     { time: "14:25", fps: 30 },
//   ];

//   const qualityData = [
//     { segment: "0–10m", quality: 88, risk: 12 },
//     { segment: "10–20m", quality: 92, risk: 8 },
//     { segment: "20–30m", quality: 85, risk: 15 },
//     { segment: "30–40m", quality: 94, risk: 6 },
//     { segment: "40–50m", quality: 90, risk: 10 },
//   ];

//   const alerts = [
//     {
//       id: 1,
//       level: "High",
//       message: "Low lighting detected in section B",
//       time: "2:45 PM",
//       date: "Today",
//     },
//     {
//       id: 2,
//       level: "Medium",
//       message: "FPS dropped below threshold",
//       time: "2:30 PM",
//       date: "Today",
//     },
//     {
//       id: 3,
//       level: "Low",
//       message: "Brightness fluctuation detected",
//       time: "2:15 PM",
//       date: "Today",
//     },
//   ];

//   const history = [
//     { time: "2:50 PM", profile: "Light", fabric: "Cotton", status: "Stable" },
//     { time: "2:51 PM", profile: "Dark", fabric: "Denim", status: "Stable" },
//     {
//       time: "2:52 PM",
//       profile: "Patterned",
//       // fabric: "Printed",
//       status: "Warning",
//     },
//     {
//       time: "2:53 PM",
//       profile: "Light",
//       // fabric: "Polyester",
//       status: "Stable",
//     },
//     {
//       time: "2:54 PM",
//       profile: "Dark",
//       // fabric: "Silk",
//       status: "Stable",
//     },
//   ];

//   useEffect(() => {
//     const timer = setTimeout(() => setLoading(false), 1500);
//     return () => clearTimeout(timer);
//   }, []);

//   if (loading) {
//     return <LoadingSpinner />;
//   }

//   return (
//     <AnimatePresence mode="wait">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.4 }}
//         className="min-h-screen bg-gray-50 p-6"
//       >
//         <div className="space-y-6 max-w-7xl mx-auto">
//           {/* Header Section */}
//           <div className="flex items-center justify-between">
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900">
//                 Fabric Enhancement Monitoring
//               </h1>
//               {/* <p className="text-gray-600">
//                 Edge-level image enhancement & reliability dashboard
//               </p> */}
//             </div>
//             <div className="flex items-center gap-4">
//               <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200">
//                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
//                 <span className="text-sm font-medium">System Active</span>
//               </div>
//               <div className="text-sm text-gray-500">
//                 Last updated: Just now
//               </div>
//             </div>
//           </div>

//           {/* AI Analysis Card */}
//           <motion.section
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.1 }}
//             className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
//           >
//             <h2 className="text-lg font-semibold text-gray-900 mb-4">
//               AI-Based Enhancement Analysis
//             </h2>

//             <div className="flex flex-col lg:flex-row gap-6">
//               {/* Preview Image */}
//               <div className="lg:w-64">
//                 <div className="relative h-48 w-full rounded-lg overflow-hidden bg-gray-100">
//                   <Image
//                     src={fabricPreview}
//                     alt="Enhanced Fabric Preview"
//                     fill
//                     className="object-cover"
//                     priority
//                   />
//                 </div>
//                 <p className="text-xs text-gray-500 text-center mt-2">
//                   Enhanced Fabric Preview
//                 </p>
//               </div>

//               {/* Metrics Grid */}
//               <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <AnimatedMetricCard
//                   title="Brightness Balance"
//                   value={91}
//                   note="Within optimal range"
//                   color="text-blue-600"
//                 />
//                 <AnimatedMetricCard
//                   title="Texture Clarity"
//                   value={87}
//                   note="Excellent edge detection"
//                   color="text-emerald-600"
//                 />
//                 <AnimatedMetricCard
//                   title="Frame Quality"
//                   value={89}
//                   note="High resolution output"
//                   color="text-indigo-600"
//                 />
//               </div>
//             </div>
//           </motion.section>

//           {/* Performance Metrics & FPS Chart Row */}
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             {/* Performance Metrics */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.2 }}
//               className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
//             >
//               <h2 className="text-lg font-semibold text-gray-900 mb-4">
//                 Performance Metrics
//               </h2>
//               <div className="space-y-4">
//                 <MetricRow label="System Uptime" value="99.9%" trend="up" />
//                 <MetricRow label="Average FPS" value="28" trend="flat" />
//                 <MetricRow label="Latency" value="62 ms" trend="down" />
//                 <MetricRow label="Active Alerts" value="3" trend="up" />
//               </div>
//             </motion.div>

//             {/* FPS Chart */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.3 }}
//               className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
//             >
//               <div className="flex justify-between items-center mb-6">
//                 <h2 className="text-lg font-semibold text-gray-900">
//                   FPS Trend
//                 </h2>
//                 <div className="flex items-center gap-2">
//                   <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
//                   <span className="text-sm text-gray-600">Real-time FPS</span>
//                 </div>
//               </div>
//               <div className="h-64">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <LineChart data={fpsData}>
//                     <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
//                     <YAxis stroke="#9CA3AF" fontSize={12} />
//                     <Tooltip
//                       contentStyle={{
//                         backgroundColor: "white",
//                         border: "1px solid #E5E7EB",
//                         borderRadius: "6px",
//                         fontSize: "12px",
//                       }}
//                     />
//                     <Line
//                       type="monotone"
//                       dataKey="fps"
//                       stroke="#3B82F6"
//                       strokeWidth={3}
//                       dot={{ r: 4, fill: "#3B82F6" }}
//                       activeDot={{ r: 6 }}
//                     />
//                   </LineChart>
//                 </ResponsiveContainer>
//               </div>
//             </motion.div>
//           </div>

//           {/* Quality vs Risk Chart & Alerts Row */}
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             {/* Quality vs Risk Chart */}
//             {/* <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.4 }}
//               className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
//             >
//               <div className="flex justify-between items-center mb-6">
//                 <h2 className="text-lg font-semibold text-gray-900">
//                   Quality vs Defect Risk
//                 </h2>
//                 <div className="flex items-center gap-4">
//                   <div className="flex items-center gap-2">
//                     <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
//                     <span className="text-sm text-gray-600">Quality</span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
//                     <span className="text-sm text-gray-600">Risk</span>
//                   </div>
//                 </div>
//               </div>
//               <div className="h-64">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <BarChart data={qualityData}>
//                     <XAxis dataKey="segment" stroke="#9CA3AF" fontSize={12} />
//                     <YAxis stroke="#9CA3AF" fontSize={12} />
//                     <Tooltip
//                       contentStyle={{
//                         backgroundColor: "white",
//                         border: "1px solid #E5E7EB",
//                         borderRadius: "6px",
//                         fontSize: "12px",
//                       }}
//                     />
//                     <Bar
//                       dataKey="quality"
//                       fill="#10B981"
//                       radius={[4, 4, 0, 0]}
//                     />
//                     <Bar dataKey="risk" fill="#F59E0B" radius={[4, 4, 0, 0]} />
//                   </BarChart>
//                 </ResponsiveContainer>
//               </div>
//             </motion.div> */}
//             {/* Alerts Panel */}
//           </div>

//           {/* History Table */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.6 }}
//             className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
//           >
//             <div className="p-6 border-b border-gray-200">
//               <h2 className="text-lg font-semibold text-gray-900">
//                 Enhancement History
//               </h2>
//             </div>
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">
//                       Time
//                     </th>
//                     <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">
//                       Profile
//                     </th>
//                     {/* <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">
//                       Fabric Type
//                     </th> */}
//                     <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">
//                       Status
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-200">
//                   {history.map((row, idx) => (
//                     <tr
//                       key={idx}
//                       className="hover:bg-gray-50 transition-colors"
//                     >
//                       <td className="py-4 px-6 text-sm text-gray-900">
//                         {row.time}
//                       </td>
//                       <td className="py-4 px-6 text-sm text-gray-900">
//                         {row.profile}
//                       </td>
//                       {/* <td className="py-4 px-6 text-sm text-gray-900">
//                         {row.fabric}
//                       </td> */}
//                       <td className="py-4 px-6">
//                         <span
//                           className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
//                             row.status === "Stable"
//                               ? "bg-green-100 text-green-700"
//                               : "bg-amber-100 text-amber-700"
//                           }`}
//                         >
//                           {row.status === "Stable" ? "✓" : "⚠"} {row.status}
//                         </span>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </motion.div>

//           {/* Quick Stats Footer */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.7 }}
//             className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm"
//           >
//             <h3 className="font-semibold text-gray-800 mb-4">System Summary</h3>
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//               <div className="text-center p-4 bg-blue-50 rounded-lg">
//                 <p className="text-sm text-gray-600">Uptime</p>
//                 <p className="text-2xl font-bold text-blue-600">
//                   {systemStatus.uptime}
//                 </p>
//               </div>
//               <div className="text-center p-4 bg-emerald-50 rounded-lg">
//                 <p className="text-sm text-gray-600">Avg FPS</p>
//                 <p className="text-2xl font-bold text-emerald-600">
//                   {systemStatus.avgFPS}
//                 </p>
//               </div>
//               <div className="text-center p-4 bg-amber-50 rounded-lg">
//                 <p className="text-sm text-gray-600">Latency</p>
//                 <p className="text-2xl font-bold text-amber-600">
//                   {systemStatus.latency}
//                 </p>
//               </div>
//               <div className="text-center p-4 bg-red-50 rounded-lg">
//                 <p className="text-sm text-gray-600">Alerts</p>
//                 <p className="text-2xl font-bold text-red-600">
//                   {systemStatus.activeAlerts}
//                 </p>
//               </div>
//             </div>
//           </motion.div>
//         </div>
//       </motion.div>
//     </AnimatePresence>
//   );
// };

// export default EnhancementOverviewDashboard;

// -- with Ai analysis
// "use client";

// import React, { useEffect, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import Image from "next/image";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";
// import { useFog } from "./FogContext";

// // ------------------ Loading Spinner ------------------
// const LoadingSpinner = () => (
//   <motion.div
//     className="flex items-center justify-center min-h-screen"
//     initial={{ opacity: 0 }}
//     animate={{ opacity: 1 }}
//   >
//     <motion.div
//       animate={{ rotate: 360 }}
//       transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
//       className="h-12 w-12 border-4 border-indigo-500 rounded-full border-t-transparent"
//     />
//   </motion.div>
// );

// // ------------------ Animated Metric Card ------------------
// const AnimatedMetricCard = ({ title, value, unit = "", note, color }: any) => {
//   const [count, setCount] = useState(0);

//   useEffect(() => {
//     let current = 0;
//     const step = value / 30;
//     const timer = setInterval(() => {
//       current += step;
//       if (current >= value) {
//         setCount(value);
//         clearInterval(timer);
//       } else {
//         setCount(Math.round(current));
//       }
//     }, 20);
//     return () => clearInterval(timer);
//   }, [value]);

//   return (
//     <motion.div
//       whileHover={{ scale: 1.03 }}
//       className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm"
//     >
//       <p className="text-sm text-gray-600 mb-2">{title}</p>
//       <p className={`text-3xl font-bold ${color}`}>
//         {count}
//         {unit && <span className="text-lg font-medium">{unit}</span>}
//       </p>
//       <p className="text-xs text-gray-500 mt-2">{note}</p>
//     </motion.div>
//   );
// };

// // ======================================================
// // MAIN DASHBOARD
// // ======================================================
// const EnhancementOverviewDashboard: React.FC = () => {
//   const { enhanceData, previewUrl, loading } = useFog();

//   if (loading) return <LoadingSpinner />;

//   if (!enhanceData) {
//     return (
//       <div className="bg-white p-8 rounded-xl border text-center text-gray-600">
//         Upload an image and run <b>Enhancement</b> to view AI insights.
//       </div>
//     );
//   }

//   const ai = enhanceData.ai_analysis;
//   const metrics = enhanceData.metrics;
//   const afterImg = enhanceData.images?.after_png_base64;

//   return (
//     <AnimatePresence mode="wait">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.4 }}
//         className="min-h-screen bg-gray-50 p-6"
//       >
//         <div className="space-y-6 max-w-7xl mx-auto">
//           {/* ================= HEADER ================= */}
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900">
//               Fabric Enhancement Monitoring
//             </h1>
//             <p className="text-gray-600">
//               Edge-level image enhancement & AI validation dashboard
//             </p>
//           </div>

//           {/* ================= AI-BASED ENHANCEMENT ================= */}
//           <motion.section className="bg-white rounded-xl border shadow-sm p-6">
//             <h2 className="text-lg font-semibold text-gray-900 mb-4">
//               AI-Based Enhancement Analysis
//             </h2>

//             <div className="flex flex-col lg:flex-row gap-6">
//               {/* Preview */}
//               <div className="lg:w-64">
//                 <div className="relative h-48 rounded-lg overflow-hidden bg-gray-100 border">
//                   {(afterImg || previewUrl) && (
//                     <Image
//                       src={
//                         afterImg
//                           ? `data:image/png;base64,${afterImg}`
//                           : previewUrl!
//                       }
//                       alt="Enhanced Fabric"
//                       fill
//                       className="object-contain"
//                     />
//                   )}
//                 </div>
//                 <p className="text-xs text-gray-500 text-center mt-2">
//                   Enhanced Output
//                 </p>
//               </div>

//               {/* Metrics */}
//               <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <AnimatedMetricCard
//                   title="Brightness Balance"
//                   value={metrics.after.brightness}
//                   note="Post-enhancement luminance"
//                   color="text-blue-600"
//                 />
//                 <AnimatedMetricCard
//                   title="Texture Clarity"
//                   value={metrics.after.sharpness}
//                   note="Edge & texture strength"
//                   color="text-emerald-600"
//                 />
//                 <AnimatedMetricCard
//                   title="Frame Quality"
//                   value={metrics.after.quality}
//                   note="Composite quality score"
//                   color="text-indigo-600"
//                 />
//               </div>
//             </div>
//           </motion.section>

//           {/* ================= AI INSIGHT & SAFETY ================= */}
//           <motion.section className="bg-white rounded-xl border shadow-sm p-6">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-lg font-semibold text-gray-900">
//                 AI Insight & Safety Check
//               </h2>

//               <span
//                 className={`px-3 py-1 rounded-full text-xs font-semibold ${
//                   ai.safety.safe
//                     ? "bg-green-100 text-green-700"
//                     : "bg-amber-100 text-amber-700"
//                 }`}
//               >
//                 {ai.safety.safe ? "SAFE" : "WARNING"}
//               </span>
//             </div>

//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//               {/* Detected Issues */}
//               <div className="bg-gray-50 rounded-lg p-4 border">
//                 <p className="text-sm font-semibold mb-2">
//                   Detected Input Issues
//                 </p>
//                 {ai.issues.length === 0 ? (
//                   <p className="text-sm text-green-700">
//                     No significant input anomalies detected.
//                   </p>
//                 ) : (
//                   <ul className="space-y-2 text-sm">
//                     {ai.issues.map((i: any, idx: number) => (
//                       <li
//                         key={idx}
//                         className={
//                           i.severity === "high"
//                             ? "text-red-600"
//                             : "text-amber-600"
//                         }
//                       >
//                         • <b>{i.severity}</b>: {i.message}
//                       </li>
//                     ))}
//                   </ul>
//                 )}
//               </div>

//               {/* Strategy */}
//               <div className="bg-gray-50 rounded-lg p-4 border">
//                 <p className="text-sm font-semibold mb-2">
//                   AI Enhancement Strategy
//                 </p>

//                 <p className="text-sm mb-1">
//                   <b>Profile:</b>{" "}
//                   <span className="capitalize text-indigo-600">
//                     {ai.strategy.profile}
//                   </span>
//                 </p>

//                 <div className="text-sm mt-2">
//                   <b>Why:</b>
//                   <ul className="list-disc ml-5">
//                     {ai.strategy.why.map((w: string, i: number) => (
//                       <li key={i}>{w}</li>
//                     ))}
//                   </ul>
//                 </div>

//                 <div className="text-sm mt-2">
//                   <b>Actions:</b>
//                   <ul className="list-disc ml-5">
//                     {ai.strategy.actions.map((a: string, i: number) => (
//                       <li key={i}>{a}</li>
//                     ))}
//                   </ul>
//                 </div>
//               </div>

//               {/* AI Confidence */}
//               <div className="bg-gray-50 rounded-lg p-4 border">
//                 <p className="text-sm font-semibold mb-2">AI Confidence</p>

//                 <div className="flex items-end gap-2">
//                   <p className="text-4xl font-bold text-indigo-600">
//                     {(ai.ai_confidence * 100).toFixed(1)}
//                   </p>
//                   <span className="text-lg text-gray-600">%</span>
//                 </div>

//                 <div className="mt-3 w-full bg-gray-200 h-2 rounded-full">
//                   <div
//                     className="h-2 bg-indigo-500 rounded-full"
//                     style={{ width: `${ai.ai_confidence * 100}%` }}
//                   />
//                 </div>

//                 <p className="text-xs text-gray-500 mt-2">
//                   Confidence derived from classification certainty and
//                   post-enhancement stability.
//                 </p>
//               </div>
//             </div>
//           </motion.section>
//         </div>
//       </motion.div>
//     </AnimatePresence>
//   );
// };

// export default EnhancementOverviewDashboard;

// ui enhanements
// "use client";

// import React, { useEffect, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import Image from "next/image";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";
// import fabricPreview from "@/assets/im_1.png";

// /* ---------------------------------------------
//    Loading Spinner
// --------------------------------------------- */
// const LoadingSpinner = () => (
//   <motion.div
//     className="flex items-center justify-center min-h-screen"
//     initial={{ opacity: 0 }}
//     animate={{ opacity: 1 }}
//   >
//     <motion.div
//       animate={{ rotate: 360 }}
//       transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
//       className="h-12 w-12 border-4 border-indigo-500 rounded-full border-t-transparent"
//     />
//   </motion.div>
// );

// /* ---------------------------------------------
//    Animated Metric Card
// --------------------------------------------- */
// const AnimatedMetricCard = ({ title, value, unit = "%", note, color }: any) => {
//   const [count, setCount] = useState(0);

//   useEffect(() => {
//     let current = 0;
//     const step = value / 30;
//     const timer = setInterval(() => {
//       current += step;
//       if (current >= value) {
//         setCount(value);
//         clearInterval(timer);
//       } else {
//         setCount(Math.round(current));
//       }
//     }, 20);
//     return () => clearInterval(timer);
//   }, [value]);

//   return (
//     <motion.div
//       whileHover={{ scale: 1.03 }}
//       className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm"
//     >
//       <p className="text-sm text-gray-600 mb-2">{title}</p>
//       <p className={`text-3xl font-bold ${color}`}>
//         {count}
//         <span className="text-lg font-medium">{unit}</span>
//       </p>
//       <p className="text-xs text-gray-500 mt-2">{note}</p>
//     </motion.div>
//   );
// };

// /* ---------------------------------------------
//    Metric Row
// --------------------------------------------- */
// const MetricRow = ({
//   label,
//   value,
//   trend,
// }: {
//   label: string;
//   value: string;
//   trend: "up" | "flat" | "down";
// }) => {
//   const trendConfig = {
//     up: { icon: "↗", color: "text-green-500", bg: "bg-green-50" },
//     flat: { icon: "→", color: "text-blue-500", bg: "bg-blue-50" },
//     down: { icon: "↘", color: "text-amber-500", bg: "bg-amber-50" },
//   };
//   const config = trendConfig[trend];

//   return (
//     <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
//       <div>
//         <p className="text-sm font-medium text-gray-700">{label}</p>
//         <p className="text-2xl font-bold text-gray-900">{value}</p>
//       </div>
//       <div
//         className={`px-3 py-1 rounded-full ${config.bg} ${config.color} text-sm font-medium`}
//       >
//         {config.icon} {trend.toUpperCase()}
//       </div>
//     </div>
//   );
// };

// /* ---------------------------------------------
//    Safety Badge
// --------------------------------------------- */
// const StatusBadge = ({
//   label,
//   status,
// }: {
//   label: string;
//   status: "safe" | "warning";
// }) => {
//   const config =
//     status === "safe"
//       ? { bg: "bg-green-50", text: "text-green-700", icon: "✓" }
//       : { bg: "bg-amber-50", text: "text-amber-700", icon: "⚠" };

//   return (
//     <div
//       className={`flex items-center justify-between px-4 py-3 rounded-lg ${config.bg}`}
//     >
//       <span className="text-sm font-medium text-gray-700">{label}</span>
//       <span className={`text-sm font-semibold ${config.text}`}>
//         {config.icon} {status === "safe" ? "Safe" : "Warning"}
//       </span>
//     </div>
//   );
// };

// /* ---------------------------------------------
//    MAIN DASHBOARD
// --------------------------------------------- */
// const EnhancementOverviewDashboard: React.FC = () => {
//   const [loading, setLoading] = useState(true);

//   const systemStatus = {
//     uptime: "99.9%",
//     avgFPS: 28,
//     latency: "62ms",
//     activeAlerts: 3,
//   };

//   const fpsData = [
//     { time: "14:00", fps: 30 },
//     { time: "14:05", fps: 28 },
//     { time: "14:10", fps: 29 },
//     { time: "14:15", fps: 31 },
//     { time: "14:20", fps: 27 },
//     { time: "14:25", fps: 30 },
//   ];

//   const history = [
//     { time: "2:50 PM", profile: "Light", status: "Stable" },
//     { time: "2:51 PM", profile: "Dark", status: "Stable" },
//     { time: "2:52 PM", profile: "Patterned", status: "Warning" },
//     { time: "2:53 PM", profile: "Light", status: "Stable" },
//     { time: "2:54 PM", profile: "Dark", status: "Stable" },
//   ];

//   useEffect(() => {
//     const timer = setTimeout(() => setLoading(false), 1200);
//     return () => clearTimeout(timer);
//   }, []);

//   if (loading) return <LoadingSpinner />;

//   return (
//     <AnimatePresence>
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="min-h-screen bg-gray-50 p-6"
//       >
//         <div className="max-w-7xl mx-auto space-y-6">
//           {/* Header */}
//           <div className="flex justify-between items-center">
//             <h1 className="text-2xl font-bold text-gray-900">
//               Fabric Enhancement Monitoring
//             </h1>
//             <div className="flex items-center gap-3 bg-green-50 px-4 py-2 rounded-lg border">
//               <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
//               <span className="text-sm font-medium text-green-700">
//                 System Active
//               </span>
//             </div>
//           </div>

//           {/* AI Enhancement Metrics */}
//           <div className="bg-white rounded-xl border shadow-sm p-6">
//             <h2 className="text-lg font-semibold mb-4">
//               AI-Based Enhancement Analysis
//             </h2>
//             <div className="flex flex-col lg:flex-row gap-6">
//               <div className="relative h-48 lg:w-64 rounded-lg overflow-hidden">
//                 <Image
//                   src={fabricPreview}
//                   alt="Preview"
//                   fill
//                   className="object-cover"
//                 />
//               </div>
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
//                 <AnimatedMetricCard
//                   title="Brightness Balance"
//                   value={91}
//                   note="Optimal range"
//                   color="text-blue-600"
//                 />
//                 <AnimatedMetricCard
//                   title="Texture Clarity"
//                   value={87}
//                   note="Edges preserved"
//                   color="text-emerald-600"
//                 />
//                 <AnimatedMetricCard
//                   title="Frame Quality"
//                   value={89}
//                   note="High quality output"
//                   color="text-indigo-600"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* AI Decision & Safety */}
//           <div className="bg-white rounded-xl border shadow-sm p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
//             <div>
//               <h3 className="font-semibold mb-3">AI Decision Summary</h3>
//               <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
//                 <div className="flex justify-between">
//                   <span>Predicted Profile</span>
//                   <b>Patterned</b>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Model Confidence</span>
//                   <b>87%</b>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Strategy</span>
//                   <b>Edge-Preserving Enhancement</b>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Mode</span>
//                   <b>Auto-Adaptive</b>
//                 </div>
//               </div>
//             </div>

//             <div>
//               <h3 className="font-semibold mb-3">Enhancement Safety</h3>
//               <div className="space-y-3">
//                 <StatusBadge label="Over-Sharpening Risk" status="safe" />
//                 <StatusBadge label="Contrast Saturation" status="safe" />
//                 <StatusBadge label="Noise Amplification" status="safe" />
//                 <StatusBadge label="Detail Preservation" status="safe" />
//               </div>
//             </div>
//           </div>

//           {/* Performance + FPS */}
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
//               <h2 className="font-semibold">Performance Metrics</h2>
//               <MetricRow
//                 label="System Uptime"
//                 value={systemStatus.uptime}
//                 trend="up"
//               />
//               <MetricRow
//                 label="Average FPS"
//                 value={String(systemStatus.avgFPS)}
//                 trend="flat"
//               />
//               <MetricRow
//                 label="Latency"
//                 value={systemStatus.latency}
//                 trend="down"
//               />
//               <MetricRow
//                 label="Active Alerts"
//                 value={String(systemStatus.activeAlerts)}
//                 trend="up"
//               />
//             </div>

//             <div className="bg-white p-6 rounded-xl border shadow-sm">
//               <h2 className="font-semibold mb-4">FPS Trend</h2>
//               <div className="h-64">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <LineChart data={fpsData}>
//                     <XAxis dataKey="time" />
//                     <YAxis />
//                     <Tooltip />
//                     <Line dataKey="fps" stroke="#3B82F6" strokeWidth={3} />
//                   </LineChart>
//                 </ResponsiveContainer>
//               </div>
//             </div>
//           </div>

//           {/* History */}
//           <div className="bg-white rounded-xl border shadow-sm">
//             <div className="p-4 font-semibold border-b">
//               Enhancement History
//             </div>
//             <table className="w-full">
//               <tbody>
//                 {history.map((h, i) => (
//                   <tr key={i} className="border-b text-sm">
//                     <td className="p-4">{h.time}</td>
//                     <td className="p-4">{h.profile}</td>
//                     <td className="p-4">
//                       <span
//                         className={`px-3 py-1 rounded-full text-xs ${
//                           h.status === "Stable"
//                             ? "bg-green-100 text-green-700"
//                             : "bg-amber-100 text-amber-700"
//                         }`}
//                       >
//                         {h.status}
//                       </span>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </motion.div>
//     </AnimatePresence>
//   );
// };

// export default EnhancementOverviewDashboard;

/// deepseek
"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { toast } from "react-toastify";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";
import fabricPreview from "@/assets/im_1.png";

/* ---------------------------------------------
   Types & Interfaces
--------------------------------------------- */
type TrendType = "up" | "flat" | "down";
type StatusType = "safe" | "warning" | "critical";

interface MetricCardProps {
  title: string;
  value: number;
  unit?: string;
  note: string;
  color: string;
  icon?: React.ReactNode;
}

interface SystemStatus {
  uptime: string;
  avgFPS: number;
  latency: string;
  activeAlerts: number;
}

interface HistoryItem {
  time: string;
  profile: string;
  status: "Stable" | "Warning";
  confidence: number;
}

/* ---------------------------------------------
   Animation Variants
--------------------------------------------- */
const fadeIn: any = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3 },
  },
};

/* ---------------------------------------------
   Reusable Card Component
--------------------------------------------- */
const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}> = ({ children, className = "", noPadding = false }) => (
  <motion.div
    variants={fadeIn}
    initial="hidden"
    animate="visible"
    className={`rounded-2xl bg-white/80 shadow-lg border border-gray-200 ${
      noPadding ? "" : "p-6"
    } ${className}`}
  >
    {children}
  </motion.div>
);

/* ---------------------------------------------
   Loading Spinner
--------------------------------------------- */
const LoadingSpinner = () => (
  <motion.div
    className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50"
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

/* ---------------------------------------------
   Animated Metric Card
--------------------------------------------- */
const AnimatedMetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit = "%",
  note,
  color,
  icon,
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let current = 0;
    const step = value / 30;
    const timer = setInterval(() => {
      current += step;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.round(current));
      }
    }, 20);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ scale: 1.03 }}
      className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        {icon && (
          <div
            className={`p-2 rounded-lg ${color
              .replace("text", "bg")
              .replace("-600", "-50")}`}
          >
            {icon}
          </div>
        )}
      </div>
      <p className={`text-3xl font-bold ${color}`}>
        {count}
        <span className="text-lg font-medium ml-1">{unit}</span>
      </p>
      <p className="text-xs text-gray-500 mt-3">{note}</p>
    </motion.div>
  );
};

/* ---------------------------------------------
   Metric Row
--------------------------------------------- */
const MetricRow = ({
  label,
  value,
  trend,
}: {
  label: string;
  value: string;
  trend: TrendType;
}) => {
  const trendConfig = {
    up: {
      icon: "↗",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      label: "Increasing",
    },
    flat: {
      icon: "→",
      color: "text-blue-600",
      bg: "bg-blue-50",
      label: "Stable",
    },
    down: {
      icon: "↘",
      color: "text-amber-600",
      bg: "bg-amber-50",
      label: "Decreasing",
    },
  };
  const config = trendConfig[trend];

  return (
    <motion.div
      whileHover={{ x: 5 }}
      className="flex items-center justify-between py-4 px-5 bg-gray-50/80 rounded-xl border border-gray-100"
    >
      <div>
        <p className="text-sm font-medium text-gray-700 mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      <div
        className={`px-4 py-2 rounded-full ${config.bg} ${config.color} text-sm font-semibold flex items-center gap-2`}
      >
        <span className="text-lg">{config.icon}</span>
        <span>{config.label}</span>
      </div>
    </motion.div>
  );
};

/* ---------------------------------------------
   Status Badge
--------------------------------------------- */
const StatusBadge = ({
  label,
  status,
  description,
}: {
  label: string;
  status: StatusType;
  description?: string;
}) => {
  const config = {
    safe: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      icon: "✓",
    },
    warning: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      icon: "⚠",
    },
    critical: {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
      icon: "✗",
    },
  }[status];

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`flex flex-col p-4 rounded-xl border ${config.border} ${config.bg}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span
          className={`text-sm font-semibold ${config.text} flex items-center gap-2`}
        >
          <span className="text-lg">{config.icon}</span>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>
      {description && (
        <p className="text-xs text-gray-600 mt-1">{description}</p>
      )}
    </motion.div>
  );
};

/* ---------------------------------------------
   MAIN DASHBOARD
--------------------------------------------- */
const EnhancementOverviewDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);

  const systemStatus: SystemStatus = {
    uptime: "99.9%",
    avgFPS: 28,
    latency: "62ms",
    activeAlerts: 3,
  };

  const fpsData = [
    { time: "14:00", fps: 30, target: 25 },
    { time: "14:05", fps: 28, target: 25 },
    { time: "14:10", fps: 29, target: 25 },
    { time: "14:15", fps: 31, target: 25 },
    { time: "14:20", fps: 27, target: 25 },
    { time: "14:25", fps: 30, target: 25 },
    { time: "14:30", fps: 32, target: 25 },
    { time: "14:35", fps: 29, target: 25 },
  ];

  const history: HistoryItem[] = [
    { time: "14:50", profile: "Light", status: "Stable", confidence: 94 },
    { time: "14:51", profile: "Dark", status: "Stable", confidence: 87 },
    { time: "14:52", profile: "Patterned", status: "Warning", confidence: 72 },
    { time: "14:53", profile: "Light", status: "Stable", confidence: 91 },
    { time: "14:54", profile: "Dark", status: "Stable", confidence: 89 },
    { time: "14:55", profile: "Textured", status: "Stable", confidence: 85 },
    { time: "14:56", profile: "Patterned", status: "Warning", confidence: 68 },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6 space-y-8"
      >
        {/* Header Section */}
        <Card className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Fabric Enhancement Monitoring Dashboard
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Real-time AI-powered fabric enhancement analysis and performance
              metrics
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-200">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-emerald-700">
                System Active • Edge Processing
              </span>
            </div>

            <div className="flex items-center gap-1 text-xs">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
                Uptime: {systemStatus.uptime}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full font-medium">
                {systemStatus.activeAlerts} Active Alerts
              </span>
            </div>
          </div>
        </Card>

        {/* AI Enhancement Metrics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="relative h-64 lg:w-80 rounded-xl overflow-hidden border border-gray-200">
                <Image
                  src={fabricPreview}
                  alt="Enhanced Fabric Preview"
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <p className="text-white text-sm font-medium">
                    Enhanced Output
                  </p>
                  <p className="text-white/80 text-xs">AI-processed frame</p>
                </div>
              </div>

              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  AI-Based Enhancement Analysis
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  <AnimatedMetricCard
                    title="Brightness Balance"
                    value={91}
                    note="Optimal lighting distribution across fabric surface"
                    color="text-blue-600"
                  />
                  <AnimatedMetricCard
                    title="Texture Clarity"
                    value={87}
                    note="Edge preservation and detail enhancement"
                    color="text-emerald-600"
                  />
                  <AnimatedMetricCard
                    title="Frame Quality Index"
                    value={89}
                    note="Overall enhancement quality score"
                    color="text-indigo-600"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* AI Decision Summary */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              AI Decision Summary
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
                  <p className="text-sm text-gray-600 mb-2">Active Profile</p>
                  <p className="text-xl font-bold text-indigo-700">Patterned</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100">
                  <p className="text-sm text-gray-600 mb-2">Model Confidence</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xl font-bold text-emerald-700">87%</p>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "87%" }}
                        transition={{ duration: 1 }}
                        className="h-full bg-emerald-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50/80 rounded-lg">
                  <span className="text-sm text-gray-700">
                    Enhancement Strategy
                  </span>
                  <span className="font-semibold text-gray-900">
                    Edge-Preserving + Denoise
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50/80 rounded-lg">
                  <span className="text-sm text-gray-700">Processing Mode</span>
                  <span className="font-semibold text-gray-900">
                    Auto-Adaptive
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50/80 rounded-lg">
                  <span className="text-sm text-gray-700">Quality Target</span>
                  <span className="font-semibold text-gray-900">≥85 FQI</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Enhancement Safety & Performance Metrics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Enhancement Safety */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Enhancement Safety Metrics
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <StatusBadge
                label="Over-Sharpening Risk"
                status="safe"
                description="Within optimal range, no artifact introduction"
              />
              <StatusBadge
                label="Contrast Saturation"
                status="safe"
                description="Balanced contrast enhancement applied"
              />
              <StatusBadge
                label="Noise Amplification"
                status="warning"
                description="Slight increase in high-frequency noise detected"
              />
              <StatusBadge
                label="Detail Preservation"
                status="safe"
                description="Critical fabric details preserved"
              />
            </div>

            <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <span className="text-amber-600 font-bold">!</span>
                </div>
                <div>
                  <p className="font-semibold text-amber-800">Safety Notice</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Noise amplification detected in high-frequency regions.
                    Consider enabling adaptive denoise filter.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800">
                System Performance Metrics
              </h2>
              <span className="text-xs px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
                Real-time Monitoring
              </span>
            </div>

            <div className="space-y-4">
              <MetricRow
                label="System Uptime"
                value={systemStatus.uptime}
                trend="up"
              />
              <MetricRow
                label="Average FPS"
                value={`${systemStatus.avgFPS}`}
                trend="flat"
              />
              <MetricRow
                label="Processing Latency"
                value={systemStatus.latency}
                trend="down"
              />
              <MetricRow
                label="Active Alerts"
                value={`${systemStatus.activeAlerts}`}
                trend="up"
              />
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Last Updated</span>
                <span className="font-medium text-gray-900">
                  {new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* FPS Trend Chart */}
        <Card>
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-2/3">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800">
                  Frames Per Second Trend
                </h2>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-sm text-gray-600">Actual FPS</span>
                  <div className="w-3 h-3 rounded-full bg-gray-300 ml-3" />
                  <span className="text-sm text-gray-600">Target (25)</span>
                </div>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={fpsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="time" stroke="#6B7280" fontSize={12} />
                    <YAxis
                      stroke="#6B7280"
                      fontSize={12}
                      label={{
                        value: "FPS",
                        angle: -90,
                        position: "insideLeft",
                        style: { textAnchor: "middle", fill: "#6B7280" },
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(17,24,39,0.92)",
                        borderColor: "rgba(55,65,81,0.5)",
                        borderRadius: "8px",
                        color: "white",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="target"
                      stroke="#9CA3AF"
                      fill="#9CA3AF"
                      fillOpacity={0.1}
                      strokeWidth={1}
                      strokeDasharray="4 4"
                      name="Target"
                    />
                    <Area
                      type="monotone"
                      dataKey="fps"
                      stroke="#3B82F6"
                      fill="url(#colorFps)"
                      strokeWidth={3}
                      name="Actual FPS"
                    />
                    <defs>
                      <linearGradient id="colorFps" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#3B82F6"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3B82F6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <span>
                  Monitoring frame rate stability for consistent enhancement
                  quality
                </span>
                <span className="font-medium text-gray-700">
                  {fpsData.length} data points
                </span>
              </div>
            </div>

            <div className="lg:w-1/3">
              <div className="h-full flex flex-col justify-center space-y-4">
                <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200">
                  <p className="text-sm text-gray-600 mb-2">Peak Performance</p>
                  <p className="text-2xl font-bold text-indigo-700">32 FPS</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Achieved at 14:30
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200">
                  <p className="text-sm text-gray-600 mb-2">
                    Average Performance
                  </p>
                  <p className="text-2xl font-bold text-emerald-700">
                    29.5 FPS
                  </p>
                  <p className="text-xs text-gray-500 mt-1">±2 FPS variation</p>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
                  <p className="text-sm text-gray-600 mb-2">
                    Minimum Performance
                  </p>
                  <p className="text-2xl font-bold text-amber-700">27 FPS</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Within acceptable range
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Enhancement History */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800">
              Enhancement History Log
            </h2>
            <div className="flex items-center gap-2 text-red-700">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-semibold">LIVE STREAM</span>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50/80">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">
                    Time
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">
                    Profile
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">
                    Confidence
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="p-4 font-mono text-sm text-gray-900">
                      {h.time}
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-gray-700">
                        {h.profile}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                          h.status === "Stable"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {h.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${h.confidence}%` }}
                            transition={{ duration: 0.8 }}
                            className={`h-full rounded-full ${
                              h.confidence > 85
                                ? "bg-emerald-500"
                                : h.confidence > 70
                                ? "bg-amber-500"
                                : "bg-red-500"
                            }`}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {h.confidence}%
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() =>
                          toast.info(
                            `Viewing details for ${h.time} - ${h.profile}`
                          )
                        }
                        className="text-xs px-3 py-1.5 text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        View Details →
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
            <span>Showing last {history.length} enhancement operations</span>
            <button
              onClick={() => toast.info("Loading full history...")}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Load More History →
            </button>
          </div>
        </Card>

        {/* Footer Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
            <p className="text-sm text-gray-600 mb-1">Enhancement Quality</p>
            <p className="text-xl font-bold text-indigo-700">Excellent</p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200">
            <p className="text-sm text-gray-600 mb-1">System Health</p>
            <p className="text-xl font-bold text-emerald-700">Optimal</p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
            <p className="text-sm text-gray-600 mb-1">Recommendation</p>
            <p className="text-xl font-bold text-amber-700">
              Monitor Noise Levels
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EnhancementOverviewDashboard;
