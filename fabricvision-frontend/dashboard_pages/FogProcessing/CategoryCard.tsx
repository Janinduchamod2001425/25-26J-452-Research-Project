export default function CategoryCard({ label, count }: any) {
  return (
    <div className="bg-slate-50 rounded-xl p-4 shadow-sm flex justify-between">
      <span className="text-slate-500 text-sm">{label}</span>
      <span className="text-xl font-bold">{count}</span>
    </div>
  );
}
