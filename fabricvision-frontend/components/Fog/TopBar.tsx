export default function TopBar() {
  return (
    <div className="flex items-center justify-between bg-white rounded-2xl px-6 py-4 shadow-sm">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          Fabric Enhancement Monitoring
        </h1>
        <p className="text-sm text-slate-500">
          Edge-level image enhancement, analysis & system health.
        </p>
      </div>

      <div className="flex items-center space-x-3">
        <button className="p-2 rounded-full bg-slate-100 text-slate-600">
          🔍
        </button>
        <button className="p-2 rounded-full bg-slate-100 text-slate-600">
          🔔
        </button>
        <div className="w-9 h-9 rounded-full bg-slate-300" />
      </div>
    </div>
  );
}
