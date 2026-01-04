// "use client";

// import React from "react";
// import { motion } from "framer-motion";
// import { FiTrendingUp, FiBarChart2, FiTarget, FiLayers } from "react-icons/fi";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   BarChart,
//   Bar,
// } from "recharts";
// import Image from "next/image";
// import { useFog } from "./FogContext";

// const MotionCard = ({
//   icon,
//   title,
//   subtitle,
//   children,
// }: {
//   icon: React.ReactNode;
//   title: string;
//   subtitle?: string;
//   children: React.ReactNode;
// }) => (
//   <motion.div
//     whileHover={{ y: -3 }}
//     initial={{ opacity: 0, y: 15 }}
//     animate={{ opacity: 1, y: 0 }}
//     transition={{ duration: 0.4 }}
//     className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
//   >
//     <div className="flex items-center gap-3 mb-2">
//       <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">{icon}</div>
//       <h3 className="text-base font-semibold text-slate-900">{title}</h3>
//     </div>
//     {subtitle && <p className="text-xs text-slate-500 mb-4">{subtitle}</p>}
//     {children}
//   </motion.div>
// );

// const Metric = ({ label, value }: { label: string; value: string }) => (
//   <motion.div
//     whileHover={{ scale: 1.03 }}
//     className="rounded-xl bg-slate-50 p-4 border border-slate-100"
//   >
//     <p className="text-xs text-slate-500">{label}</p>
//     <p className="text-xl font-semibold text-slate-900 mt-1">{value}</p>
//   </motion.div>
// );

// const QualityAnalyticsTab = () => {
//   const { enhanceData, previewUrl } = useFog();

//   if (!enhanceData) {
//     return (
//       <div className="bg-white p-8 rounded-xl border text-center text-gray-600">
//         Upload and run <b>Classification</b> first.
//         <div className="text-sm text-gray-500 mt-2">
//           This tab will automatically show real metrics for the same image (no
//           second upload).
//         </div>
//       </div>
//     );
//   }

//   const timeline = enhanceData.quality_timeline || [];
//   const regions = enhanceData.region_contribution || [];
//   const metrics = enhanceData.metrics || null;

//   const beforeB64 = enhanceData.images?.before_png_base64;
//   const afterB64 = enhanceData.images?.after_png_base64;

//   const beforeSrc = beforeB64 ? `data:image/png;base64,${beforeB64}` : null;
//   const afterSrc = afterB64 ? `data:image/png;base64,${afterB64}` : null;

//   const afterQuality = metrics?.after?.quality ?? 0;

//   // SAFE delta % (avoid your crash)
//   const deltaQuality = metrics?.delta?.quality ?? 0;
//   const deltaSharpness = metrics?.delta?.sharpness ?? 0;
//   const deltaNoise = metrics?.delta?.contrast ?? 0; // if you interpret contrast drop as "noise reduction" (simple proxy)

//   return (
//     <div className="space-y-6">
//       {/* Before vs After */}
//       <MotionCard
//         icon={<FiLayers />}
//         title="Before vs After Enhancement"
//         subtitle="Real output images returned from the enhancement endpoint."
//       >
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div className="relative w-full h-64 rounded-lg overflow-hidden border bg-gray-50">
//             {(beforeSrc || previewUrl) && (
//               <Image
//                 src={beforeSrc || previewUrl!}
//                 alt="Before"
//                 fill
//                 className="object-contain"
//               />
//             )}
//             <div className="absolute top-2 left-2 text-xs bg-white/90 border px-2 py-1 rounded">
//               BEFORE
//             </div>
//           </div>

//           <div className="relative w-full h-64 rounded-lg overflow-hidden border bg-gray-50">
//             {afterSrc && (
//               <Image
//                 src={afterSrc}
//                 alt="After"
//                 fill
//                 className="object-contain"
//               />
//             )}
//             <div className="absolute top-2 left-2 text-xs bg-white/90 border px-2 py-1 rounded">
//               AFTER
//             </div>
//           </div>
//         </div>

//         <div className="mt-4 text-sm text-slate-700">
//           <b>Class:</b> {enhanceData.predicted_class} &nbsp; | &nbsp;
//           <b>Mode:</b> {enhanceData.enhancement?.params?.mode || "—"}
//         </div>
//       </MotionCard>

//       {/* TOP GRID */}
//       <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
//         {/* Timeline */}
//         <MotionCard
//           icon={<FiTrendingUp />}
//           title="Enhancement Quality Timeline"
//           subtitle="Each run adds a real point (quality + sharpness) to session timeline."
//         >
//           <div className="h-56">
//             <ResponsiveContainer width="100%" height="100%">
//               <LineChart data={timeline}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="time" />
//                 <YAxis />
//                 <Tooltip />
//                 <Line
//                   type="monotone"
//                   dataKey="quality"
//                   stroke="#22c55e"
//                   strokeWidth={3}
//                 />
//                 <Line
//                   type="monotone"
//                   dataKey="sharpness"
//                   stroke="#3b82f6"
//                   strokeWidth={3}
//                 />
//               </LineChart>
//             </ResponsiveContainer>
//           </div>
//         </MotionCard>

//         {/* Region contribution */}
//         <MotionCard
//           icon={<FiLayers />}
//           title="Localized Fabric Contribution"
//           subtitle="Relative sharpness improvement per region (normalized)."
//         >
//           {(() => {
//             const regions = enhanceData.region_contribution || [];

//             const total = regions.reduce(
//               (sum: number, r: any) => sum + Math.max(0, r.improvement || 0),
//               0
//             );

//             return (
//               <div className="space-y-4">
//                 {regions.map((r: any) => {
//                   const raw = Math.max(0, r.improvement || 0);
//                   const pct = total > 0 ? (raw / total) * 100 : 0;

//                   return (
//                     <div key={r.name}>
//                       <div className="flex justify-between text-sm text-slate-700 mb-1">
//                         <span className="capitalize">{r.region}</span>
//                         <span className="font-medium">{pct.toFixed(1)}%</span>
//                       </div>

//                       <div className="w-full h-2 bg-slate-100 rounded-full">
//                         <div
//                           className="h-2 rounded-full bg-indigo-500 transition-all"
//                           style={{ width: `${pct}%` }}
//                         />
//                       </div>

//                       <p className="text-xs text-slate-500 mt-1">
//                         Δ Sharpness: {raw.toFixed(2)}
//                       </p>
//                     </div>
//                   );
//                 })}
//               </div>
//             );
//           })()}
//         </MotionCard>

//         {/* Adaptive Enhancement Decisions */}
//         <MotionCard
//           icon={<FiTarget />}
//           title="Adaptive Enhancement Decisions"
//           subtitle="AI-driven parameters selected at runtime."
//         >
//           <div className="space-y-4 text-sm">
//             {/* Class */}
//             <div className="flex justify-between">
//               <span className="text-slate-600">Predicted Fabric Class</span>
//               <span className="font-semibold capitalize text-indigo-600">
//                 {enhanceData.predicted_class}
//               </span>
//             </div>

//             {/* Mode */}
//             <div className="flex justify-between">
//               <span className="text-slate-600">Enhancement Mode</span>
//               <span className="font-semibold">
//                 {enhanceData.enhancement?.params?.mode || "none"}
//               </span>
//             </div>

//             <hr />

//             {/* Parameter list */}
//             <div className="space-y-2">
//               {Object.entries(enhanceData.enhancement?.params || {})
//                 .filter(([k]) => k !== "mode")
//                 .map(([key, value]) => (
//                   <div
//                     key={key}
//                     className="flex justify-between bg-slate-50 border rounded-lg px-3 py-2"
//                   >
//                     <span className="text-slate-600 capitalize">
//                       {key.replaceAll("_", " ")}
//                     </span>
//                     <span className="font-medium text-slate-900">
//                       {String(value)}
//                     </span>
//                   </div>
//                 ))}
//             </div>
//           </div>
//         </MotionCard>
//       </div>

//       {/* BOTTOM GRID */}
//       <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
//         {/* Quality vs Risk */}
//         <MotionCard
//           icon={<FiBarChart2 />}
//           title="Quality vs Defect Risk"
//           subtitle="Simple demo: risk = 100 - quality (panel-friendly)."
//         >
//           <div className="h-64">
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart
//                 data={[
//                   {
//                     segment: "Current Frame",
//                     quality: afterQuality,
//                     risk: 100 - afterQuality,
//                   },
//                 ]}
//               >
//                 <XAxis dataKey="segment" />
//                 <YAxis />
//                 <Tooltip />
//                 <Bar dataKey="quality" fill="#22c55e" />
//                 <Bar dataKey="risk" fill="#f97316" />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         </MotionCard>

//         {/* KPI Summary */}
//         <MotionCard
//           icon={<FiTrendingUp />}
//           title="Quality Analytics Summary"
//           subtitle="Derived directly from before vs after metrics."
//         >
//           <div className="grid grid-cols-2 gap-4">
//             <Metric
//               label="Δ Quality"
//               value={`${Number(deltaQuality).toFixed(2)}`}
//             />
//             <Metric
//               label="Δ Sharpness"
//               value={`${Number(deltaSharpness).toFixed(2)}`}
//             />
//             <Metric
//               label="Δ Contrast"
//               value={`${Number(deltaNoise).toFixed(2)}`}
//             />
//             <Metric label="Frames Improved" value="1 / 1" />
//           </div>
//         </MotionCard>
//       </div>
//     </div>
//   );
// };

// export default QualityAnalyticsTab;

// "use client";

// import React from "react";
// import { motion } from "framer-motion";
// import { FiTrendingUp, FiBarChart2, FiTarget, FiLayers } from "react-icons/fi";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   BarChart,
//   Bar,
// } from "recharts";
// import Image from "next/image";
// import { useFog } from "./FogContext";

// const MotionCard = ({
//   icon,
//   title,
//   subtitle,
//   children,
// }: {
//   icon: React.ReactNode;
//   title: string;
//   subtitle?: string;
//   children: React.ReactNode;
// }) => (
//   <motion.div
//     whileHover={{ y: -3 }}
//     initial={{ opacity: 0, y: 15 }}
//     animate={{ opacity: 1, y: 0 }}
//     transition={{ duration: 0.4 }}
//     className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
//   >
//     <div className="flex items-center gap-3 mb-2">
//       <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">{icon}</div>
//       <h3 className="text-base font-semibold text-slate-900">{title}</h3>
//     </div>
//     {subtitle && <p className="text-xs text-slate-500 mb-4">{subtitle}</p>}
//     {children}
//   </motion.div>
// );

// const Metric = ({ label, value }: { label: string; value: string }) => (
//   <motion.div
//     whileHover={{ scale: 1.03 }}
//     className="rounded-xl bg-slate-50 p-4 border border-slate-100"
//   >
//     <p className="text-xs text-slate-500">{label}</p>
//     <p className="text-xl font-semibold text-slate-900 mt-1">{value}</p>
//   </motion.div>
// );

// const QualityAnalyticsTab = () => {
//   const { enhanceData, previewUrl } = useFog();

//   if (!enhanceData) {
//     return (
//       <div className="bg-white p-8 rounded-xl border text-center text-gray-600">
//         Upload and run <b>Classification</b> first.
//         {/* <div className="text-sm text-gray-500 mt-2">
//           This tab will automatically show real metrics for the same image (no
//           second upload).
//         </div> */}
//       </div>
//     );
//   }

//   const timeline = enhanceData.quality_timeline || [];
//   const regions = enhanceData.region_contribution || [];
//   const metrics = enhanceData.metrics || null;

//   const beforeB64 = enhanceData.images?.before_png_base64;
//   const afterB64 = enhanceData.images?.after_png_base64;

//   const beforeSrc = beforeB64 ? `data:image/png;base64,${beforeB64}` : null;
//   const afterSrc = afterB64 ? `data:image/png;base64,${afterB64}` : null;

//   const afterQuality = metrics?.after?.quality ?? 0;

//   // SAFE delta % (avoid your crash)
//   const deltaQuality = metrics?.delta?.quality ?? 0;
//   const deltaSharpness = metrics?.delta?.sharpness ?? 0;
//   const deltaNoise = metrics?.delta?.contrast ?? 0;

//   return (
//     <div className="space-y-6">
//       {/* Before vs After */}
//       <MotionCard
//         icon={<FiLayers />}
//         title="Before vs After Enhancement"
//         subtitle="Real output images returned from the enhancement endpoint."
//       >
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div className="relative w-full h-64 rounded-lg overflow-hidden border bg-gray-50">
//             {(beforeSrc || previewUrl) && (
//               <Image
//                 src={beforeSrc || previewUrl!}
//                 alt="Before"
//                 fill
//                 className="object-contain"
//               />
//             )}
//             <div className="absolute top-2 left-2 text-xs bg-white/90 border px-2 py-1 rounded">
//               BEFORE
//             </div>
//           </div>

//           <div className="relative w-full h-64 rounded-lg overflow-hidden border bg-gray-50">
//             {afterSrc && (
//               <Image
//                 src={afterSrc}
//                 alt="After"
//                 fill
//                 className="object-contain"
//               />
//             )}
//             <div className="absolute top-2 left-2 text-xs bg-white/90 border px-2 py-1 rounded">
//               AFTER
//             </div>
//           </div>
//         </div>

//         <div className="mt-4 text-sm text-slate-700">
//           <b>Class:</b> {enhanceData.predicted_class} &nbsp; | &nbsp;
//           <b>Mode:</b> {enhanceData.enhancement?.params?.mode || "—"}
//         </div>
//       </MotionCard>

//       {/* TOP GRID */}
//       <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
//         {/* Timeline */}
//         <MotionCard
//           icon={<FiTrendingUp />}
//           title="Enhancement Quality Timeline"
//           subtitle="Each run adds a real point (quality + sharpness) to session timeline."
//         >
//           <div className="h-56">
//             <ResponsiveContainer width="100%" height="100%">
//               <LineChart data={timeline}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="time" />
//                 <YAxis />
//                 <Tooltip />
//                 <Line
//                   type="monotone"
//                   dataKey="quality"
//                   stroke="#22c55e"
//                   strokeWidth={3}
//                 />
//                 <Line
//                   type="monotone"
//                   dataKey="sharpness"
//                   stroke="#3b82f6"
//                   strokeWidth={3}
//                 />
//               </LineChart>
//             </ResponsiveContainer>
//           </div>
//         </MotionCard>

//         {/* Region contribution */}
//         <MotionCard
//           icon={<FiLayers />}
//           title="Localized Fabric Contribution"
//           subtitle="Relative sharpness improvement per region (normalized)."
//         >
//           {(() => {
//             const regions = enhanceData.region_contribution || [];

//             const total = regions.reduce(
//               (sum: number, r: any) => sum + Math.max(0, r.improvement || 0),
//               0
//             );

//             return (
//               <div className="space-y-4">
//                 {regions.map((r: any, idx: number) => {
//                   const raw = Math.max(0, r.improvement || 0);
//                   const pct = total > 0 ? (raw / total) * 100 : 0;

//                   const regionKey = String(r.region ?? r.name ?? "region");
//                   const key = `${regionKey}-${idx}`;

//                   return (
//                     <div key={key}>
//                       <div className="flex justify-between text-sm text-slate-700 mb-1">
//                         <span className="capitalize">{r.region}</span>
//                         <span className="font-medium">{pct.toFixed(1)}%</span>
//                       </div>

//                       <div className="w-full h-2 bg-slate-100 rounded-full">
//                         <div
//                           className="h-2 rounded-full bg-indigo-500 transition-all"
//                           style={{ width: `${pct}%` }}
//                         />
//                       </div>

//                       <p className="text-xs text-slate-500 mt-1">
//                         Δ Sharpness: {raw.toFixed(2)}
//                       </p>
//                     </div>
//                   );
//                 })}
//               </div>
//             );
//           })()}
//         </MotionCard>

//         {/* Adaptive Enhancement Decisions */}
//         <MotionCard
//           icon={<FiTarget />}
//           title="Adaptive Enhancement Decisions"
//           subtitle="AI-driven parameters selected at runtime."
//         >
//           <div className="space-y-4 text-sm">
//             {/* Class */}
//             <div className="flex justify-between">
//               <span className="text-slate-600">Predicted Fabric Class</span>
//               <span className="font-semibold capitalize text-indigo-600">
//                 {enhanceData.predicted_class}
//               </span>
//             </div>

//             {/* Mode */}
//             <div className="flex justify-between">
//               <span className="text-slate-600">Enhancement Mode</span>
//               <span className="font-semibold">
//                 {enhanceData.enhancement?.params?.mode || "none"}
//               </span>
//             </div>

//             <hr />

//             {/* Parameter list */}
//             <div className="space-y-2">
//               {Object.entries(enhanceData.enhancement?.params || {})
//                 .filter(([k]) => k !== "mode")
//                 .map(([key, value]) => (
//                   <div
//                     key={key}
//                     className="flex justify-between bg-slate-50 border rounded-lg px-3 py-2"
//                   >
//                     <span className="text-slate-600 capitalize">
//                       {key.replaceAll("_", " ")}
//                     </span>
//                     <span className="font-medium text-slate-900">
//                       {String(value)}
//                     </span>
//                   </div>
//                 ))}
//             </div>
//           </div>
//         </MotionCard>
//       </div>

//       {/* BOTTOM GRID */}
//       <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
//         {/* Quality vs Risk */}
//         <MotionCard
//           icon={<FiBarChart2 />}
//           title="Quality vs Defect Risk"
//           subtitle="Simple demo: risk = 100 - quality (panel-friendly)."
//         >
//           <div className="h-64">
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart
//                 data={[
//                   {
//                     segment: "Current Frame",
//                     quality: afterQuality,
//                     risk: 100 - afterQuality,
//                   },
//                 ]}
//               >
//                 <XAxis dataKey="segment" />
//                 <YAxis />
//                 <Tooltip />
//                 <Bar dataKey="quality" fill="#22c55e" />
//                 <Bar dataKey="risk" fill="#f97316" />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         </MotionCard>

//         {/* KPI Summary */}
//         <MotionCard
//           icon={<FiTrendingUp />}
//           title="Quality Analytics Summary"
//           subtitle="Derived directly from before vs after metrics."
//         >
//           <div className="grid grid-cols-2 gap-4">
//             <Metric
//               label="Δ Quality"
//               value={`${Number(deltaQuality).toFixed(2)}`}
//             />
//             <Metric
//               label="Δ Sharpness"
//               value={`${Number(deltaSharpness).toFixed(2)}`}
//             />
//             <Metric
//               label="Δ Contrast"
//               value={`${Number(deltaNoise).toFixed(2)}`}
//             />
//             <Metric label="Frames Improved" value="1 / 1" />
//           </div>
//         </MotionCard>
//       </div>
//     </div>
//   );
// };

// export default QualityAnalyticsTab;

// remove ai enhancement view
"use client";

import React from "react";
import { motion } from "framer-motion";
import { FiTrendingUp, FiBarChart2, FiTarget, FiLayers } from "react-icons/fi";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import Image from "next/image";
import { useFog } from "./FogContext";

const MotionCard = ({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) => (
  <motion.div
    whileHover={{ y: -3 }}
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
  >
    <div className="flex items-center gap-3 mb-2">
      <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">{icon}</div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
    </div>
    {subtitle && <p className="text-xs text-slate-500 mb-4">{subtitle}</p>}
    {children}
  </motion.div>
);

const Metric = ({ label, value }: { label: string; value: string }) => (
  <motion.div
    whileHover={{ scale: 1.03 }}
    className="rounded-xl bg-slate-50 p-4 border border-slate-100"
  >
    <p className="text-xs text-slate-500">{label}</p>
    <p className="text-xl font-semibold text-slate-900 mt-1">{value}</p>
  </motion.div>
);

const QualityAnalyticsTab = () => {
  const { enhanceData, previewUrl } = useFog();

  if (!enhanceData) {
    return (
      <div className="bg-white p-8 rounded-xl border text-center text-gray-600">
        Upload and run <b>Classification</b> first.
        {/* <div className="text-sm text-gray-500 mt-2">
          This tab will automatically show real metrics for the same image (no
          second upload).
        </div> */}
      </div>
    );
  }

  const timeline = enhanceData.quality_timeline || [];
  const regions = enhanceData.region_contribution || [];
  const metrics = enhanceData.metrics || null;

  const beforeB64 = enhanceData.images?.before_png_base64;
  const afterB64 = enhanceData.images?.after_png_base64;

  const beforeSrc = beforeB64 ? `data:image/png;base64,${beforeB64}` : null;
  const afterSrc = afterB64 ? `data:image/png;base64,${afterB64}` : null;

  const afterQuality = metrics?.after?.quality ?? 0;

  // SAFE delta % (avoid your crash)
  const deltaQuality = metrics?.delta?.quality ?? 0;
  const deltaSharpness = metrics?.delta?.sharpness ?? 0;
  const deltaNoise = metrics?.delta?.contrast ?? 0;

  return (
    <div className="space-y-6">
      {/* Before vs After */}
      <MotionCard
        icon={<FiLayers />}
        title="Before vs After Enhancement"
        // subtitle="Real output images returned from the enhancement endpoint."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative w-full h-64 rounded-lg overflow-hidden border bg-gray-50">
            {(beforeSrc || previewUrl) && (
              <Image
                src={beforeSrc || previewUrl!}
                alt="Before"
                fill
                className="object-contain"
              />
            )}
            <div className="absolute top-2 left-2 text-xs bg-white/90 border px-2 py-1 rounded">
              BEFORE
            </div>
          </div>

          <div className="relative w-full h-64 rounded-lg overflow-hidden border bg-gray-50">
            {afterSrc && (
              <Image
                src={afterSrc}
                alt="After"
                fill
                className="object-contain"
              />
            )}
            <div className="absolute top-2 left-2 text-xs bg-white/90 border px-2 py-1 rounded">
              AFTER
            </div>
          </div>
        </div>

        <div className="mt-4 text-sm text-slate-700">
          <b>Class:</b> {enhanceData.predicted_class} &nbsp; | &nbsp;
          <b>Mode:</b> {enhanceData.enhancement?.params?.mode || "—"}
        </div>
      </MotionCard>

      {/* TOP GRID - Now 2 columns instead of 3 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Timeline */}
        <MotionCard
          icon={<FiTrendingUp />}
          title="Enhancement Quality Timeline"
          subtitle="Each run adds a real point (quality + sharpness) to session timeline."
        >
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="quality"
                  stroke="#22c55e"
                  strokeWidth={3}
                />
                <Line
                  type="monotone"
                  dataKey="sharpness"
                  stroke="#3b82f6"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </MotionCard>

        {/* Region contribution */}
        <MotionCard
          icon={<FiLayers />}
          title="Localized Fabric Contribution"
          subtitle="Relative sharpness improvement per region (normalized)."
        >
          {(() => {
            const regions = enhanceData.region_contribution || [];

            const total = regions.reduce(
              (sum: number, r: any) => sum + Math.max(0, r.improvement || 0),
              0
            );

            return (
              <div className="space-y-4">
                {regions.map((r: any, idx: number) => {
                  const raw = Math.max(0, r.improvement || 0);
                  const pct = total > 0 ? (raw / total) * 100 : 0;

                  const regionKey = String(r.region ?? r.name ?? "region");
                  const key = `${regionKey}-${idx}`;

                  return (
                    <div key={key}>
                      <div className="flex justify-between text-sm text-slate-700 mb-1">
                        <span className="capitalize">{r.region}</span>
                        <span className="font-medium">{pct.toFixed(1)}%</span>
                      </div>

                      <div className="w-full h-2 bg-slate-100 rounded-full">
                        <div
                          className="h-2 rounded-full bg-indigo-500 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <p className="text-xs text-slate-500 mt-1">
                        Δ Sharpness: {raw.toFixed(2)}
                      </p>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </MotionCard>

        {/* 
        // Adaptive Enhancement Decisions - COMMENTED OUT
        <MotionCard
          icon={<FiTarget />}
          title="Adaptive Enhancement Decisions"
          subtitle="AI-driven parameters selected at runtime."
        >
          <div className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Predicted Fabric Class</span>
              <span className="font-semibold capitalize text-indigo-600">
                {enhanceData.predicted_class}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-600">Enhancement Mode</span>
              <span className="font-semibold">
                {enhanceData.enhancement?.params?.mode || "none"}
              </span>
            </div>

            <hr />

            <div className="space-y-2">
              {Object.entries(enhanceData.enhancement?.params || {})
                .filter(([k]) => k !== "mode")
                .map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between bg-slate-50 border rounded-lg px-3 py-2"
                  >
                    <span className="text-slate-600 capitalize">
                      {key.replaceAll("_", " ")}
                    </span>
                    <span className="font-medium text-slate-900">
                      {String(value)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </MotionCard>
        */}
      </div>

      {/* BOTTOM GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Quality vs Risk */}
        <MotionCard
          icon={<FiBarChart2 />}
          title="Quality vs Defect Risk"
          // subtitle="Simple demo: risk = 100 - quality."
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  {
                    segment: "Current Frame",
                    quality: afterQuality,
                    risk: 100 - afterQuality,
                  },
                ]}
              >
                <XAxis dataKey="segment" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quality" fill="#22c55e" />
                <Bar dataKey="risk" fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </MotionCard>

        {/* KPI Summary */}
        <MotionCard
          icon={<FiTrendingUp />}
          title="Quality Analytics Summary"
          subtitle="Derived directly from before vs after metrics."
        >
          <div className="grid grid-cols-2 gap-4">
            <Metric
              label="Δ Quality"
              value={`${Number(deltaQuality).toFixed(2)}`}
            />
            <Metric
              label="Δ Sharpness"
              value={`${Number(deltaSharpness).toFixed(2)}`}
            />
            <Metric
              label="Δ Contrast"
              value={`${Number(deltaNoise).toFixed(2)}`}
            />
            <Metric label="Frames Improved" value="1 / 1" />
          </div>
        </MotionCard>
      </div>
    </div>
  );
};

export default QualityAnalyticsTab;
