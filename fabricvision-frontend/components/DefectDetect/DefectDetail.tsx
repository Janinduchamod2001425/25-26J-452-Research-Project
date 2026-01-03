import React from "react";
import { defectData } from "@/data/defectData";
import { FiCheckCircle, FiAlertTriangle, FiMapPin, FiBarChart2, FiTarget, FiNavigation } from "react-icons/fi";

const DefectDetail = () => {
  const { defectDetail } = defectData;

  const getSeverityColor = (severity: string) => {
    switch(severity.toLowerCase()) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getConfidenceColor = (confidence: string) => {
    const percent = parseInt(confidence);
    if (percent >= 90) return 'text-green-600';
    if (percent >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <FiCheckCircle className="w-5 h-5 text-green-600" />
          Defect Analysis Details
        </h2>
        <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium">
          Verified
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <FiAlertTriangle className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-gray-600">Defect Type</span>
          </div>
          <div className="text-lg font-bold text-gray-900">{defectDetail.type}</div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <FiBarChart2 className="w-4 h-4 text-amber-600" />
            <span className="text-sm text-gray-600">Severity</span>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(defectDetail.severity)}`}>
            {defectDetail.severity}
          </span>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <FiTarget className="w-4 h-4 text-purple-600" />
            <span className="text-sm text-gray-600">Confidence</span>
          </div>
          <div className={`text-lg font-bold ${getConfidenceColor(defectDetail.confidence)}`}>
            {defectDetail.confidence}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <FiNavigation className="w-4 h-4 text-green-600" />
            <span className="text-sm text-gray-600">Defect ID</span>
          </div>
          <div className="text-sm font-mono text-gray-900">#FD-2024-0876</div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100">
        <div className="flex items-center gap-2 mb-4">
          <FiMapPin className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Defect Location</h3>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-gray-600 mb-1">Fabric Length</div>
            <div className="font-bold text-gray-900">{defectDetail.location.fabricLength}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">X Position</div>
            <div className="font-bold text-gray-900">{defectDetail.location.xPos}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Y Position</div>
            <div className="font-bold text-gray-900">{defectDetail.location.yPos}</div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-blue-200">
          <div className="text-sm text-gray-600 mb-2">Material Zone</div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-800">Central Fabric Region</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-6 pt-6 border-t border-gray-100">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
          Generate Report
        </button>
        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
          Export Data
        </button>
      </div>
    </div>
  );
};

export default DefectDetail;