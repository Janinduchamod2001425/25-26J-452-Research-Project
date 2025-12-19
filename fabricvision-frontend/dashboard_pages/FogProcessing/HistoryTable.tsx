export default function HistoryTable() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm overflow-x-auto">
      <h2 className="text-lg font-semibold mb-4">Enhancement History</h2>

      <table className="w-full table-fixed text-sm">
        {/* Table Head */}
        <thead>
          <tr className="border-b border-slate-200 text-slate-500">
            <th className="w-1/4 text-left py-2">Time</th>
            <th className="w-1/4 text-left py-2">Profile</th>
            {/* <th className="w-1/4 text-left py-2">Fabric Type</th> */}
            <th className="w-1/4 text-left py-2">Status</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {[
            {
              time: "2:50 PM",
              profile: "Light",
              // fabric: "Cotton",
              status: "Stable",
            },
            {
              time: "2:51 PM",
              profile: "Dark",
              // fabric: "Denim",
              status: "Stable",
            },
            {
              time: "2:52 PM",
              profile: "Patterned",
              // fabric: "Printed",
              status: "Stable",
            },
          ].map((row, idx) => (
            <tr key={idx} className="border-b border-slate-100 last:border-0">
              <td className="py-2 text-slate-700">{row.time}</td>
              <td className="py-2 text-slate-700">{row.profile}</td>
              <td className="py-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                  {row.status}
                </span>
              </td>
              {/* <td className="py-2 text-slate-700">{row.fabric}</td> */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
