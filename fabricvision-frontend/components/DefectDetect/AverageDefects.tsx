import React from "react";
import { defectData } from "@/data/defectData";
import { FiBarChart2, FiTrendingUp, FiCalendar } from "react-icons/fi";

const AverageDefects = () => {
  const avg = defectData.averageDefects;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FiBarChart2 className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-gray-900">Average Defects</h2>
          </div>
          <p className="text-gray-600 text-sm">Daily defect rate analysis</p>
        </div>
        <div className="bg-gray-100 p-2 rounded-lg">
          <div className="w-8 h-8 flex items-center justify-center">
            <FiBarChart2 className="w-5 h-5 text-indigo-600" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-4xl font-bold text-gray-900">{avg.percent}</div>
            <div className="text-gray-600 mt-1">Defect Rate</div>
          </div>
          <div className="flex items-center gap-1 bg-green-100 px-3 py-1 rounded-full">
            <FiTrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-700">↓ 2.3%</span>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <FiCalendar className="w-4 h-4" />
            <span className="text-sm">Last Active</span>
          </div>
          <div className="text-lg font-semibold text-gray-900">{avg.lastActive}</div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Daily Target</span>
            <span className="font-medium text-gray-900">15%</span>
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-indigo-600 h-full rounded-full"
              style={{ width: `${(parseInt(avg.percent) / 15) * 100}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-600 mt-1 text-right">
            {parseInt(avg.percent)} / 15%
          </div>
        </div>
      </div>

      <button className="w-full mt-6 py-3 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition-colors">
        View Detailed Report
      </button>
    </div>
  );
};

export default AverageDefects;