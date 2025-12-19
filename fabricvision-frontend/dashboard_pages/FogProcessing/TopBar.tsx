"use client";

import { motion } from "framer-motion";

export default function TopBar() {
  return (
    <motion.div
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white rounded-2xl px-6 py-4 shadow-sm flex justify-between items-center"
    >
      <div>
        <h1 className="text-xl font-bold text-slate-900">
          Fabric Enhancement Monitoring
        </h1>
        <p className="text-sm text-slate-500">
          Edge-level image enhancement & reliability dashboard
        </p>
      </div>

      {/* <div className="flex items-center gap-3">
        <button className="p-2 rounded-full bg-slate-100">🔍</button>
        <button className="p-2 rounded-full bg-slate-100">🔔</button>
        <div className="w-9 h-9 rounded-full bg-slate-300" />
      </div> */}
    </motion.div>
  );
}
