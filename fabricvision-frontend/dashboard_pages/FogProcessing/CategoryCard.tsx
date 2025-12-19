// export default function CategoryCard({
//   label,
//   count,
//   pillClass,
// }: {
//   label: string;
//   count: number;
//   pillClass?: string;
// }) {
//   return (
//     <div
//       className={`flex items-center justify-between rounded-xl px-4 py-3 ${pillClass} border border-slate-100`}
//     >
//       <div>
//         <p className="text-xs text-slate-500">{label}</p>
//         <p className="text-xl font-semibold">{count}</p>
//       </div>
//       <span className="text-xs rounded-full bg-white px-2 py-1 text-slate-500 border border-slate-200">
//         frames
//       </span>
//     </div>
//   );
// }

export default function CategoryCard({ label, count }: any) {
  return (
    <div className="bg-slate-50 rounded-xl p-4 shadow-sm flex justify-between">
      <span className="text-slate-500 text-sm">{label}</span>
      <span className="text-xl font-bold">{count}</span>
    </div>
  );
}
