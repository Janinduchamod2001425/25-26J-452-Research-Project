import React from "react";
import { defectData } from "@/data/defectData";
import { FiClock, FiCalendar, FiFilter, FiDownload } from "react-icons/fi";

const DetectionHistoryMonitor = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Detection History Monitor</h2>
            <p className="text-gray-600 text-sm mt-1">Historical defect detection records</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <FiFilter className="w-4 h-4 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <FiDownload className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 rounded-l-lg">
                  <div className="flex items-center gap-2">
                    <FiClock className="w-4 h-4" />
                    Time
                  </div>
                </th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                  <div className="flex items-center gap-2">
                    <FiCalendar className="w-4 h-4" />
                    Date
                  </div>
                </th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Defect Type</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Confidence</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 rounded-r-lg">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {defectData.history.map((h, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{h.time}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-gray-600">{h.date}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      h.type === 'Hole' ? 'bg-red-100 text-red-800' :
                      h.type === 'Stain' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {h.type}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-green-500 h-1.5 rounded-full"
                          style={{ width: `${parseInt(h.confidence)}%` }}
                        ></div>
                      </div>
                      <span className={`text-sm font-medium ${
                        parseInt(h.confidence) >= 90 ? 'text-green-600' :
                        parseInt(h.confidence) >= 80 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {h.confidence}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Resolved
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
          <div className="text-sm text-gray-600">
            Showing {defectData.history.length} of 128 records
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
              Previous
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              Load More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetectionHistoryMonitor;