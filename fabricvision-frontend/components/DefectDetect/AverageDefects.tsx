import React, { useEffect, useState } from "react";
import { defectData } from "@/data/defectData";
import { FiBarChart2, FiTrendingUp, FiCalendar, FiAlertCircle, FiCheckCircle } from "react-icons/fi";

interface AverageDefectsProps {
  apiData?: any;
}

const AverageDefects: React.FC<AverageDefectsProps> = ({ apiData }) => {
  const avg = defectData.averageDefects;
  const [defectPercent, setDefectPercent] = useState(avg.percent);

  useEffect(() => {
    if (apiData?.defects?.length) {
      const areaPercentage = apiData.defects.reduce((sum: number, defect: any) => sum + defect.area_percentage, 0);
      const calculatedPercent = Math.min(areaPercentage, 100).toFixed(1) + "%";
      setDefectPercent(calculatedPercent);
    } else {
      setDefectPercent(avg.percent);
    }
  }, [apiData, avg.percent]);

  const percentValue = parseFloat(defectPercent);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FiBarChart2 className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-gray-900">Defect Analysis</h2>
          </div>
          <p className="text-gray-600 text-sm">
            {apiData ? "Current detection analysis" : "Daily defect rate analysis"}
          </p>
        </div>
        <div className="bg-gray-100 p-2 rounded-lg">
          <div className="w-8 h-8 flex items-center justify-center">
            {apiData ? (
              <FiCheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <FiBarChart2 className="w-5 h-5 text-indigo-600" />
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-4xl font-bold text-gray-900">{defectPercent}</div>
            <div className="text-gray-600 mt-1">
              {apiData ? "Defect Coverage" : "Defect Rate"}
            </div>
          </div>
          <div className="flex items-center gap-1 bg-green-100 px-3 py-1 rounded-full">
            <FiTrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-700">↓ 2.3%</span>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <FiCalendar className="w-4 h-4" />
            <span className="text-sm">
              {apiData ? "Detection Time" : "Last Active"}
            </span>
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {apiData ? new Date(apiData.timestamp).toLocaleTimeString() : avg.lastActive}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Quality Target</span>
            <span className="font-medium text-gray-900">
              {apiData?.quality_assessment?.grade || "15%"}
            </span>
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full mt-2 overflow-hidden">
            <div 
              className={`h-full rounded-full ${
                percentValue > 30 ? "bg-red-500" :
                percentValue > 15 ? "bg-yellow-500" :
                "bg-green-500"
              }`}
              style={{ width: `${Math.min(percentValue, 100)}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-600 mt-1 text-right">
            {percentValue.toFixed(1)}% coverage
          </div>
        </div>

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

      <button className="w-full mt-6 py-3 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition-colors">
        {apiData ? "Save Analysis Report" : "View Detailed Report"}
      </button>
    </div>
  );
};

export default AverageDefects;