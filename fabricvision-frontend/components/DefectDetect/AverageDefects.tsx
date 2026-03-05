import React, { useEffect, useState } from "react";
import { FiBarChart2, FiTrendingUp, FiCalendar, FiAlertCircle, FiCheckCircle, FiTrendingDown } from "react-icons/fi";

interface AverageDefectsProps {
  apiData?: any;
  statsData?: any;
}

const AverageDefects: React.FC<AverageDefectsProps> = ({ apiData, statsData }) => {
  const [defectPercent, setDefectPercent] = useState("0%");
  const [avgProcessingTime, setAvgProcessingTime] = useState("0s");
  const [defectRate, setDefectRate] = useState(0);
  const [trend, setTrend] = useState("0%");
  const [trendDirection, setTrendDirection] = useState<"up" | "down">("down");
  const [totalFrames, setTotalFrames] = useState(0);
  const [defectFreeRate, setDefectFreeRate] = useState(100);
  const [lastUpdated, setLastUpdated] = useState<string>("Never");

  useEffect(() => {
    // Use stats data from database if available
    if (statsData) {
      // Defect rate
      if (statsData.defect_rate_percentage !== undefined) {
        setDefectRate(statsData.defect_rate_percentage);
        setDefectPercent(statsData.defect_rate_percentage.toFixed(1) + "%");
      }

      // Defect free rate
      if (statsData.defect_free_rate_percentage !== undefined) {
        setDefectFreeRate(statsData.defect_free_rate_percentage);
      }

      // Average processing time
      if (statsData.avg_processing_time_ms !== undefined) {
        const seconds = (statsData.avg_processing_time_ms / 1000).toFixed(2);
        setAvgProcessingTime(seconds + "s");
      }

      // Total frames
      if (statsData.total_frames_processed !== undefined) {
        setTotalFrames(statsData.total_frames_processed);
      }

      // Last updated
      if (statsData.last_updated) {
        const date = new Date(statsData.last_updated);
        setLastUpdated(date.toLocaleString());
      }

      // Trend (compare with previous period - for now, use mock based on defect rate)
      if (statsData.defect_rate_percentage > 5) {
        setTrend("↑ 2.1%");
        setTrendDirection("up");
      } else if (statsData.defect_rate_percentage > 3) {
        setTrend("↓ 1.5%");
        setTrendDirection("down");
      } else {
        setTrend("↓ 2.3%");
        setTrendDirection("down");
      }
    } 
    // Fallback to apiData
    else if (apiData?.defects?.length) {
      const areaPercentage = apiData.defects.reduce((sum: number, defect: any) => sum + defect.area_percentage, 0);
      const calculatedPercent = Math.min(areaPercentage, 100).toFixed(1) + "%";
      setDefectPercent(calculatedPercent);
      setDefectRate(areaPercentage);
      
      if (apiData.processing_time_ms) {
        const seconds = (apiData.processing_time_ms / 1000).toFixed(2);
        setAvgProcessingTime(seconds + "s");
      }
      
      if (apiData.timestamp) {
        setLastUpdated(new Date(apiData.timestamp).toLocaleString());
      }
    }
    // If no data, show zeros
    else {
      setDefectPercent("0%");
      setAvgProcessingTime("0s");
      setDefectRate(0);
      setDefectFreeRate(100);
    }
  }, [apiData, statsData]);

  const percentValue = parseFloat(defectPercent) || 0;

  // Get color based on defect rate
  const getProgressColor = (value: number) => {
    if (value > 30) return "bg-red-500";
    if (value > 15) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStatusText = (value: number) => {
    if (value > 30) return "Critical";
    if (value > 15) return "Warning";
    return "Good";
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FiBarChart2 className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-gray-900">Defect Analysis</h2>
          </div>
          <p className="text-gray-600 text-sm">
            {statsData ? "Live statistics from database" : apiData ? "Current detection analysis" : "No data available"}
          </p>
        </div>
        <div className="bg-gray-100 p-2 rounded-lg">
          <div className="w-8 h-8 flex items-center justify-center">
            {statsData ? (
              <FiBarChart2 className="w-5 h-5 text-indigo-600" />
            ) : apiData ? (
              <FiCheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <FiBarChart2 className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-4xl font-bold text-gray-900">{defectPercent}</div>
            <div className="text-gray-600 mt-1">
              {statsData ? "Defect Rate" : apiData ? "Defect Coverage" : "Defect Rate"}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Status: <span className={`font-medium ${
                percentValue > 30 ? 'text-red-600' :
                percentValue > 15 ? 'text-yellow-600' :
                'text-green-600'
              }`}>{getStatusText(percentValue)}</span>
            </div>
          </div>
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
            trendDirection === "up" ? "bg-red-100" : "bg-green-100"
          }`}>
            {trendDirection === "up" ? (
              <FiTrendingUp className="w-4 h-4 text-red-600" />
            ) : (
              <FiTrendingDown className="w-4 h-4 text-green-600" />
            )}
            <span className={`text-sm ${
              trendDirection === "up" ? "text-red-700" : "text-green-700"
            }`}>
              {trend}
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <FiCalendar className="w-4 h-4" />
            <span className="text-sm">
              {statsData ? "Last Updated" : apiData ? "Detection Time" : "Last Active"}
            </span>
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {lastUpdated}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Quality Target</span>
            <span className="font-medium text-gray-900">
              {defectFreeRate.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full mt-2 overflow-hidden">
            <div 
              className={`h-full rounded-full ${getProgressColor(percentValue)}`}
              style={{ width: `${Math.min(percentValue, 100)}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-600 mt-1 text-right">
            {percentValue.toFixed(1)}% defect rate
          </div>
        </div>

        {statsData && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <FiBarChart2 className="w-4 h-4" />
              <span>Processing Stats</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Avg. Detection Time</span>
              <span className="font-semibold text-gray-900">{avgProcessingTime}</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-gray-600">Total Frames</span>
              <span className="font-semibold text-gray-900">{totalFrames}</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-gray-600">Defect Frames</span>
              <span className="font-semibold text-red-600">{statsData.total_defect_frames || 0}</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-gray-600">Clean Frames</span>
              <span className="font-semibold text-green-600">{statsData.total_non_defect_frames || 0}</span>
            </div>
          </div>
        )}

        {apiData?.quality_assessment && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <FiAlertCircle className="w-4 h-4" />
              <span>Quality Grade</span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-lg font-bold ${
                apiData.quality_assessment.grade === 'A' ? 'text-green-600' :
                apiData.quality_assessment.grade === 'B' ? 'text-blue-600' :
                apiData.quality_assessment.grade === 'C' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                Grade {apiData.quality_assessment.grade}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                apiData.quality_assessment.status === 'Good' ? 'bg-green-100 text-green-800' :
                apiData.quality_assessment.status === 'Fair' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {apiData.quality_assessment.status}
              </span>
            </div>
          </div>
        )}
      </div>

      <button 
        onClick={() => window.location.href = '/analytics'}
        className="w-full mt-6 py-3 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition-colors"
      >
        {statsData ? "View Detailed Statistics" : apiData ? "Save Analysis Report" : "View Detailed Report"}
      </button>
    </div>
  );
};

export default AverageDefects;