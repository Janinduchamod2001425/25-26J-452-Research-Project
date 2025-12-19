"use client";

import { motion } from "framer-motion";
import AnimatedMetricCard from "./AnimatedMetricCard";
import Image from "next/image";
import fabricPreview from "@/assets/im_1.png";

export default function AIAnalysisCard() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-slate-900 mb-4">
        AI-Based Enhancement Analysis
      </h2>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Preview */}
        <div className="w-56 h-40 bg-slate-200 rounded-xl flex items-center justify-center text-slate-500">
          <div className="w-56 h-40 bg-slate-200 rounded-xl mb-3 relative overflow-hidden">
            //{" "}
            <Image
              src={fabricPreview}
              alt="Enhanced Fabric Preview"
              fill
              className="object-cover rounded-xl"
              priority
            />
          </div>
        </div>

        {/* Metrics */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
          <AnimatedMetricCard
            title="Brightness Balance"
            value={91}
            note="Target range"
            color="text-sky-600"
          />
          <AnimatedMetricCard
            title="Texture Clarity"
            value={87}
            note="Edge sharpness"
            color="text-emerald-600"
          />
          <AnimatedMetricCard
            title="Frame Quality"
            value={89}
            unit="/100"
            note="Overall score"
            color="text-indigo-600"
          />
        </div>
      </div>
    </motion.section>
  );
}
