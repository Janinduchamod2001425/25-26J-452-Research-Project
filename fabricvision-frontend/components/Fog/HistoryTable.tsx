import StatusPill from "./StatusPill";

const historyRows = [
  {
    time: "2:57 PM",
    date: "Nov 16 2025",
    mode: "Light",
    // fabricType: "Cotton",
    status: "Stable",
  },
  {
    time: "2:53 PM",
    date: "Nov 16 2025",
    mode: "Patterned",
    // fabricType: "Printed",
    status: "High Risk",
  },
  {
    time: "2:53 PM",
    date: "Nov 16 2025",
    mode: "Dark",
    // fabricType: "Printed",
    status: "Stable",
  },
];

export default function HistoryTable() {
  return (
    <section className="xl:col-span-2 bg-white rounded-2xl p-6 shadow-sm overflow-x-auto">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">
        Enhancement & Risk History
      </h2>

      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-slate-500 border-b border-slate-200">
            <th className="py-2">Time</th>
            <th className="py-2">Date</th>
            <th className="py-2">Profile</th>
            {/* <th className="py-2">Fabric Type</th> */}
            <th className="py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {historyRows.map((row, i) => (
            <tr key={i} className="border-b border-slate-200">
              <td className="py-2 text-slate-500">{row.time}</td>
              <td className="py-2 text-slate-500">{row.date}</td>
              <td className="py-2 text-slate-500">{row.mode}</td>
              {/* <td className="py-2">{row.fabricType}</td> */}
              <td className="py-2">
                <StatusPill status={row.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
