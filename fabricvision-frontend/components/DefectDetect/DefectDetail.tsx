// components/DefectDetect/DefectDetail.tsx
import React from "react";
import { defectData } from "@/data/defectData";
import { FiCheckCircle, FiAlertTriangle, FiMapPin, FiBarChart2 } from "react-icons/fi";

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
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6">
     AA
    </div>
  );
};

export default DefectDetail;