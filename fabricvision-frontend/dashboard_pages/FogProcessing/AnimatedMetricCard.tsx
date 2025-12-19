// "use client";

// import { motion, useAnimation, useInView } from "framer-motion";
// import { useEffect, useRef, useState } from "react";

// export default function AnimatedMetricCard({
//   title,
//   value,
//   note,
//   color,
// }: {
//   title: string;
//   value: number;
//   note: string;
//   color: string;
// }) {
//   const ref = useRef(null);
//   const isInView = useInView(ref, { once: true });

//   const controls = useAnimation();
//   const [displayValue, setDisplayValue] = useState(0);

//   useEffect(() => {
//     if (isInView) {
//       controls.start({
//         opacity: 1,
//         y: 0,
//         transition: { duration: 0.6 },
//       });

//       let start = 0;
//       const end = value;
//       const duration = 700; // ms
//       const increment = (end - start) / (duration / 16);

//       const counter = setInterval(() => {
//         start += increment;
//         if (start >= end) {
//           start = end;
//           clearInterval(counter);
//         }
//         setDisplayValue(Math.round(start));
//       }, 16);
//     }
//   }, [isInView, controls, value]);

//   return (
//     <motion.div
//       ref={ref}
//       className="bg-slate-50 rounded-xl p-4 shadow-sm"
//       initial={{ opacity: 0, y: 20 }}
//       animate={controls}
//     >
//       <p className="text-xs uppercase tracking-wide text-slate-500">{title}</p>

//       <p className={`text-3xl font-bold mt-2 ${color}`}>{displayValue}%</p>

//       <p className="text-xs text-slate-500 mt-1">{note}</p>
//     </motion.div>
//   );
// }

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
