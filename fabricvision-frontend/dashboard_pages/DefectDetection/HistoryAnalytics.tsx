"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  FiCalendar,
  FiTrendingUp,
  FiTrendingDown,
  FiFilter,
  FiDownload,
  FiBarChart2,
  FiPieChart,
  FiMap,
  FiClock,
  FiCircle,
  FiAlertCircle,
  FiActivity
} from "react-icons/fi";

const HistoryAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState("7d");

  const defectTrends = [
    { date: "Jan 1", holes: 12, stains: 8, lines: 15 },
    { date: "Jan 2", holes: 8, stains: 12, lines: 18 },
    { date: "Jan 3", holes: 15, stains: 6, lines: 12 },
    { date: "Jan 4", holes: 10, stains: 9, lines: 20 },
    { date: "Jan 5", holes: 14, stains: 11, lines: 16 },
    { date: "Jan 6", holes: 9, stains: 13, lines: 14 },
    { date: "Jan 7", holes: 11, stains: 7, lines: 17 },
  ];

  const defectDistribution = [
    { type: "Holes", count: 89, percentage: 35, trend: "+12%" },
    { type: "Stains", count: 67, percentage: 26, trend: "-5%" },
    { type: "Line Defects", count: 98, percentage: 39, trend: "+8%" },
  ];

  const topDefectiveRolls = [
    { id: "ROLL-001", defects: 12, length: "45.6m", date: "2024-01-15" },
    { id: "ROLL-002", defects: 9, length: "38.2m", date: "2024-01-14" },
    { id: "ROLL-003", defects: 7, length: "42.1m", date: "2024-01-13" },
    { id: "ROLL-004", defects: 6, length: "39.8m", date: "2024-01-12" },
    { id: "ROLL-005", defects: 5, length: "41.3m", date: "2024-01-11" },
  ];

  const timeOfDayStats = [
    { hour: "00:00", defects: 2 },
    { hour: "04:00", defects: 1 },
    { hour: "08:00", defects: 8 },
    { hour: "12:00", defects: 12 },
    { hour: "16:00", defects: 9 },
    { hour: "20:00", defects: 4 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Defect History & Analytics</h2>
          <p className="text-gray-600">Historical defect data and trend analysis</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors">
            <FiFilter className="w-4 h-4" />
            Filter
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 transition-colors">
            <FiDownload className="w-4 h-4" />
            Export Data
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div 
          className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
          whileHover={{ y: -2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Total Defects</h3>
            <FiBarChart2 className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">254</div>
          <div className="flex items-center gap-2 mt-2">
            <FiTrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-600">+12.5% from last period</span>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
          whileHover={{ y: -2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Avg. Defect Rate</h3>
            <FiPieChart className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">3.2%</div>
          <div className="flex items-center gap-2 mt-2">
            <FiTrendingDown className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-600">-2.1% from last period</span>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
          whileHover={{ y: -2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Rolls Inspected</h3>
            <FiMap className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">42</div>
          <div className="text-sm text-gray-600 mt-2">Total fabric length: 1,764m</div>
        </motion.div>

        <motion.div 
          className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
          whileHover={{ y: -2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Avg. Detection Time</h3>
            <FiClock className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">0.42s</div>
          <div className="text-sm text-gray-600 mt-2">Per defect identification</div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
          className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-800">Defect Type Distribution</h3>
            <button className="text-sm text-indigo-600 hover:text-indigo-800">
              View Details
            </button>
          </div>
          
          <div className="space-y-4">
            {defectDistribution.map((item) => (
              <div key={item.type} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiCircle className={`w-3 h-3 ${
                      item.type === "Holes" ? "text-red-500" :
                      item.type === "Stains" ? "text-yellow-500" :
                      "text-blue-500"
                    }`} />
                    <span className="font-medium text-gray-700">{item.type}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-900 font-semibold">{item.count}</span>
                    <span className="text-sm text-gray-600">({item.percentage}%)</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      item.trend.startsWith('+') 
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {item.trend}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      item.type === "Holes" ? "bg-red-500" :
                      item.type === "Stains" ? "bg-yellow-500" :
                      "bg-blue-500"
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h3 className="font-bold text-gray-800 mb-6">Defect Trend Over Time</h3>
          
          <div className="space-y-4">
            {defectTrends.map((day) => (
              <div key={day.date} className="flex items-center gap-4">
                <div className="w-16 text-sm text-gray-600">{day.date}</div>
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 bg-red-100 rounded h-6">
                    <div 
                      className="bg-red-500 h-6 rounded"
                      style={{ width: `${(day.holes / 20) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex-1 bg-yellow-100 rounded h-6">
                    <div 
                      className="bg-yellow-500 h-6 rounded"
                      style={{ width: `${(day.stains / 15) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex-1 bg-blue-100 rounded h-6">
                    <div 
                      className="bg-blue-500 h-6 rounded"
                      style={{ width: `${(day.lines / 25) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-20 text-right">
                  <span className="font-semibold text-gray-900">{day.holes + day.stains + day.lines}</span>
                  <span className="text-xs text-gray-600 ml-1">defects</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <FiCircle className="w-3 h-3 text-red-500" />
              <span className="text-sm text-gray-600">Holes</span>
            </div>
            <div className="flex items-center gap-2">
              <FiCircle className="w-3 h-3 text-yellow-500" />
              <span className="text-sm text-gray-600">Stains</span>
            </div>
            <div className="flex items-center gap-2">
              <FiCircle className="w-3 h-3 text-blue-500" />
              <span className="text-sm text-gray-600">Lines</span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
          className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="font-bold text-gray-800 mb-6">Top Defective Rolls</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Roll ID</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Defects</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Length</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {topDefectiveRolls.map((roll) => (
                  <tr key={roll.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{roll.id}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                        {roll.defects} defects
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{roll.length}</td>
                    <td className="py-3 px-4 text-gray-600">{roll.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="font-bold text-gray-800 mb-6">Defects by Time of Day</h3>
          
          <div className="space-y-4">
            {timeOfDayStats.map((stat) => (
              <div key={stat.hour} className="flex items-center gap-4">
                <div className="w-16 text-sm text-gray-600">{stat.hour}</div>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-indigo-500 h-4 rounded-full"
                      style={{ width: `${(stat.defects / 15) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-12 text-right">
                  <span className="font-semibold text-gray-900">{stat.defects}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              <span className="font-semibold">Peak Hours:</span> 10:00 - 14:00 (68% of defects)
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div 
        className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Analytics Summary</h3>
            <p className="text-gray-600">
              Defect rate has improved by 15% over the last 30 days. 
              Most defects occur during morning shifts (08:00-12:00).
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-gray-900">3.2%</div>
            <div className="text-gray-600">Overall Defect Rate</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default HistoryAnalytics;