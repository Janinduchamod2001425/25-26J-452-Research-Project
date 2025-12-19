"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function AnimatedMetricCard({
  title,
  value,
  unit = "%",
  note,
  color,
}: any) {
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
      whileHover={{ scale: 1.03 }}
      className="bg-slate-50 rounded-xl p-4 shadow-sm"
    >
      <p className="text-xs uppercase text-slate-500">{title}</p>
      <p className={`text-3xl font-bold mt-2 ${color}`}>
        {count}
        {unit}
      </p>
      <p className="text-xs text-slate-500">{note}</p>
    </motion.div>
  );
}
