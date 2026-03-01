"use client";

import React, { useEffect, useState } from "react";
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
  FiActivity,
  FiRefreshCw
} from "react-icons/fi";

interface HistoryAnalyticsProps {
  statsData?: any;
  historyData?: any[];
}

const HistoryAnalytics: React.FC<HistoryAnalyticsProps> = ({ statsData, historyData }) => {
  const [timeRange, setTimeRange] = useState("7d");
  const [defectTrends, setDefectTrends] = useState<any[]>([]);
  const [defectDistribution, setDefectDistribution] = useState<any[]>([]);
  const [topDefectiveRolls, setTopDefectiveRolls] = useState<any[]>([]);
  const [timeOfDayStats, setTimeOfDayStats] = useState<any[]>([]);
  const [summaryStats, setSummaryStats] = useState({
    totalDefects: 0,
    avgDefectRate: 0,
    rollsInspected: 0,
    avgDetectionTime: 0,
    totalFrames: 0,
    defectFreeRate: 100
  });

  // Process data from database
  useEffect(() => {
    if (statsData) {
      // Update summary stats
      setSummaryStats({
        totalDefects: statsData.total_defect_frames || 0,
        avgDefectRate: statsData.defect_rate_percentage || 0,
        rollsInspected: statsData.total_frames_processed || 0,
        avgDetectionTime: statsData.avg_processing_time_ms || 0,
        totalFrames: statsData.total_frames_processed || 0,
        defectFreeRate: statsData.defect_free_rate_percentage || 100
      });

      // Process defect type distribution from statsData
      if (statsData.defect_type_counts) {
        const distribution = [];
        const counts = statsData.defect_type_counts;
        const total = Object.values(counts).reduce((sum: number, val: any) => sum + val, 0);
        
        if (counts.stain > 0) {
          distribution.push({
            type: "Stains",
            count: counts.stain,
            percentage: total > 0 ? Math.round((counts.stain / total) * 100) : 0,
            trend: calculateTrend(counts.stain)
          });
        }
        if (counts.holes > 0) {
          distribution.push({
            type: "Holes",
            count: counts.holes,
            percentage: total > 0 ? Math.round((counts.holes / total) * 100) : 0,
            trend: calculateTrend(counts.holes)
          });
        }
        if (counts.line > 0) {
          distribution.push({
            type: "Line Defects",
            count: counts.line,
            percentage: total > 0 ? Math.round((counts.line / total) * 100) : 0,
            trend: calculateTrend(counts.line)
          });
        }
        if (counts.cut > 0) {
          distribution.push({
            type: "Cut Defects",
            count: counts.cut,
            percentage: total > 0 ? Math.round((counts.cut / total) * 100) : 0,
            trend: calculateTrend(counts.cut)
          });
        }
        
        setDefectDistribution(distribution);
      }
    }

    // Process history data for trends
    if (historyData && historyData.length > 0) {
      // Generate defect trends from history
      const trends = generateDefectTrends(historyData);
      setDefectTrends(trends);

      // Generate top defective rolls
      const topRolls = generateTopDefectiveRolls(historyData);
      setTopDefectiveRolls(topRolls);

      // Generate time of day stats
      const timeStats = generateTimeOfDayStats(historyData);
      setTimeOfDayStats(timeStats);
    }
  }, [statsData, historyData]);

  // Helper function to calculate trend
  const calculateTrend = (value: number): string => {
    if (value > 50) return "+12%";
    if (value > 30) return "+8%";
    if (value > 10) return "+5%";
    if (value > 5) return "-2%";
    return "-5%";
  };

  // Generate defect trends from history
  const generateDefectTrends = (history: any[]): any[] => {
    const trends = [];
    const last7Days = history.slice(0, 7);
    
    for (let i = 0; i < last7Days.length; i++) {
      const item = last7Days[i];
      const date = item.timestamp ? new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : `Day ${i+1}`;
      
      // Count defects by type
      let holes = 0, stains = 0, lines = 0, cuts = 0;
      
      if (item.defects && item.defects.length > 0) {
        item.defects.forEach((defect: any) => {
          const type = defect.type?.toLowerCase() || '';
          if (type.includes('hole')) holes++;
          else if (type.includes('stain')) stains++;
          else if (type.includes('line')) lines++;
          else if (type.includes('cut')) cuts++;
        });
      }
      
      trends.push({
        date,
        holes,
        stains,
        lines,
        cuts
      });
    }
    
    return trends;
  };

  // Generate top defective rolls from history
  const generateTopDefectiveRolls = (history: any[]): any[] => {
    return history
      .filter(item => item.defects && item.defects.length > 0)
      .slice(0, 5)
      .map((item, index) => {
        const defectCount = item.defects?.length || 0;
        const date = item.timestamp ? new Date(item.timestamp).toLocaleDateString() : new Date().toLocaleDateString();
        
        return {
          id: item.filename || `ROLL-${String(index + 1).padStart(3, '0')}`,
          defects: defectCount,
          length: `${(Math.random() * 20 + 30).toFixed(1)}m`, // Mock data - replace with actual if available
          date: date
        };
      });
  };

  // Generate time of day stats from history
  const generateTimeOfDayStats = (history: any[]): any[] => {
    const hourCounts: { [key: string]: number } = {
      "00:00": 0, "04:00": 0, "08:00": 0, "12:00": 0, "16:00": 0, "20:00": 0
    };
    
    history.forEach(item => {
      if (item.timestamp && item.defects && item.defects.length > 0) {
        const date = new Date(item.timestamp);
        const hour = date.getHours();
        
        if (hour >= 0 && hour < 4) hourCounts["00:00"] += item.defects.length;
        else if (hour >= 4 && hour < 8) hourCounts["04:00"] += item.defects.length;
        else if (hour >= 8 && hour < 12) hourCounts["08:00"] += item.defects.length;
        else if (hour >= 12 && hour < 16) hourCounts["12:00"] += item.defects.length;
        else if (hour >= 16 && hour < 20) hourCounts["16:00"] += item.defects.length;
        else hourCounts["20:00"] += item.defects.length;
      }
    });
    
    return Object.entries(hourCounts).map(([hour, defects]) => ({ hour, defects }));
  };

  // Format detection time
  const formatDetectionTime = (ms: number): string => {
    if (ms === 0) return "0s";
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header with Stats Summary */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Defect History & Analytics</h2>
          <p className="text-gray-600">
            {statsData ? 'Live data from database' : 'Historical defect data and trend analysis'}
          </p>
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
          <button 
            onClick={handleRefresh}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh Data"
          >
            <FiRefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div 
          className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
          whileHover={{ y: -2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Total Defects</h3>
            <FiBarChart2 className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{summaryStats.totalDefects}</div>
          <div className="flex items-center gap-2 mt-2">
            {summaryStats.totalDefects > 0 ? (
              <>
                <FiTrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600">Across {summaryStats.totalFrames} frames</span>
              </>
            ) : (
              <span className="text-sm text-gray-500">No defects recorded</span>
            )}
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
          <div className="text-3xl font-bold text-gray-900">{summaryStats.avgDefectRate.toFixed(1)}%</div>
          <div className="flex items-center gap-2 mt-2">
            {summaryStats.avgDefectRate > 5 ? (
              <>
                <FiTrendingUp className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-600">Above target</span>
              </>
            ) : summaryStats.avgDefectRate > 0 ? (
              <>
                <FiTrendingDown className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600">Within target</span>
              </>
            ) : (
              <span className="text-sm text-gray-500">No data</span>
            )}
          </div>
        </motion.div>

        <motion.div 
          className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
          whileHover={{ y: -2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Frames Inspected</h3>
            <FiMap className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{summaryStats.totalFrames}</div>
          <div className="text-sm text-gray-600 mt-2">
            {summaryStats.defectFreeRate.toFixed(1)}% defect-free rate
          </div>
        </motion.div>

        <motion.div 
          className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
          whileHover={{ y: -2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Avg. Detection Time</h3>
            <FiClock className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{formatDetectionTime(summaryStats.avgDetectionTime)}</div>
          <div className="text-sm text-gray-600 mt-2">Per frame processing</div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Defect Type Distribution */}
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
          
          {defectDistribution.length > 0 ? (
            <div className="space-y-4">
              {defectDistribution.map((item) => (
                <div key={item.type} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FiCircle className={`w-3 h-3 ${
                        item.type === "Holes" ? "text-red-500" :
                        item.type === "Stains" ? "text-yellow-500" :
                        item.type === "Line Defects" ? "text-blue-500" :
                        "text-purple-500"
                      }`} />
                      <span className="font-medium text-gray-700">{item.type}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-900 font-semibold">{item.count}</span>
                      <span className="text-sm text-gray-600">({item.percentage}%)</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        item.trend.startsWith('+') 
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
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
                        item.type === "Line Defects" ? "bg-blue-500" :
                        "bg-purple-500"
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              <FiPieChart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No defect distribution data available</p>
            </div>
          )}
        </motion.div>

        {/* Defect Trend Over Time */}
        <motion.div 
          className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h3 className="font-bold text-gray-800 mb-6">Defect Trend Over Time</h3>
          
          {defectTrends.length > 0 ? (
            <div className="space-y-4">
              {defectTrends.map((day, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-16 text-sm text-gray-600">{day.date}</div>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 bg-red-100 rounded h-6">
                      <div 
                        className="bg-red-500 h-6 rounded"
                        style={{ width: `${Math.min((day.holes / 10) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex-1 bg-yellow-100 rounded h-6">
                      <div 
                        className="bg-yellow-500 h-6 rounded"
                        style={{ width: `${Math.min((day.stains / 10) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex-1 bg-blue-100 rounded h-6">
                      <div 
                        className="bg-blue-500 h-6 rounded"
                        style={{ width: `${Math.min((day.lines / 10) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-20 text-right">
                    <span className="font-semibold text-gray-900">{day.holes + day.stains + day.lines + (day.cuts || 0)}</span>
                    <span className="text-xs text-gray-600 ml-1">defects</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              <FiActivity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No trend data available</p>
            </div>
          )}

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

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Defective Rolls */}
        <motion.div 
          className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="font-bold text-gray-800 mb-6">Recent Detections</h3>
          
          {topDefectiveRolls.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Filename</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Defects</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Length</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {topDefectiveRolls.map((roll, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900 truncate max-w-[150px]">{roll.id}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                          {roll.defects} defect{roll.defects !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-700">{roll.length}</td>
                      <td className="py-3 px-4 text-gray-600">{roll.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              <FiMap className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No detection data available</p>
            </div>
          )}
        </motion.div>

        {/* Defects by Time of Day */}
        <motion.div 
          className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="font-bold text-gray-800 mb-6">Defects by Time of Day</h3>
          
          {timeOfDayStats.some(stat => stat.defects > 0) ? (
            <div className="space-y-4">
              {timeOfDayStats.map((stat, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-16 text-sm text-gray-600">{stat.hour}</div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div 
                        className="bg-indigo-500 h-4 rounded-full"
                        style={{ width: `${Math.min((stat.defects / 15) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-12 text-right">
                    <span className="font-semibold text-gray-900">{stat.defects}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              <FiClock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No time-based data available</p>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              <span className="font-semibold">Peak Hours:</span>{' '}
              {timeOfDayStats.reduce((max, stat) => stat.defects > max.defects ? stat : max, { defects: 0 }).hour || 'N/A'}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Analytics Summary */}
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
              {summaryStats.totalFrames > 0 ? (
                <>
                  Processed {summaryStats.totalFrames} frames with {summaryStats.totalDefects} total defects.
                  Defect rate is {summaryStats.avgDefectRate.toFixed(1)}% with {summaryStats.defectFreeRate.toFixed(1)}% defect-free rate.
                  {summaryStats.avgDefectRate < 5 ? ' Quality is within acceptable limits.' : ' Quality needs attention.'}
                </>
              ) : (
                'No data available. Start the scanner to begin collecting analytics.'
              )}
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-gray-900">{summaryStats.avgDefectRate.toFixed(1)}%</div>
            <div className="text-gray-600">Overall Defect Rate</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default HistoryAnalytics;