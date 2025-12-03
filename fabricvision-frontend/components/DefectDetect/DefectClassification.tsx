// components/DefectDetect/DefectClassification.tsx
import React from "react";
import { defectData } from "@/data/defectData";
import { FiPieChart, FiTrendingUp, FiTrendingDown } from "react-icons/fi";

const DefectClassification = () => {
  const cls = defectData.classification;

  const getTrendIcon = (type: string) => {
    const trends: any = {
      stain: <FiTrendingUp className="w-4 h-4 text-red-500" />,
      holes: <FiTrendingDown className="w-4 h-4 text-green-500" />,
      line: <FiTrendingUp className="w-4 h-4 text-yellow-500" />,
    };
    return trends[type] || <FiTrendingUp className="w-4 h-4 text-gray-400" />;
  };

  const items = [
    { label: "Stain Defect", value: cls.stain, type: "stain", color: "bg-red-500", trend: "+12%" },
    { label: "Holes Defect", value: cls.holes, type: "holes", color: "bg-green-500", trend: "-8%" },
    { label: "Line Defect", value: cls.line, type: "line", color: "bg-yellow-500", trend: "+5%" },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6">
     VV
    </div>
  );
};

export default DefectClassification;