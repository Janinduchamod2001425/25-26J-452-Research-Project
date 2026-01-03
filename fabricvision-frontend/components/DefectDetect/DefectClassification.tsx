import React from "react";
import { defectData } from "@/data/defectData";
import { FiPieChart, FiTrendingUp, FiTrendingDown, FiCircle } from "react-icons/fi";

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
    { label: "Stain Defect", value: cls.stain, type: "stain", trend: "+12%" },
    { label: "Holes Defect", value: cls.holes, type: "holes", trend: "-8%" },
    { label: "Line Defect", value: cls.line, type: "line", trend: "+5%" },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <FiPieChart className="w-5 h-5 text-indigo-600" />
          Defect Classification
        </h2>
        <div className="text-sm text-gray-500">Last 24 hours</div>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-3">
              <FiCircle className={`w-3 h-3 ${
                item.type === "stain" ? "text-red-500" :
                item.type === "holes" ? "text-green-500" :
                "text-yellow-500"
              }`} />
              <div>
                <div className="font-medium text-gray-900">{item.label}</div>
                <div className="flex items-center gap-2 mt-1">
                  {getTrendIcon(item.type)}
                  <span className={`text-xs ${
                    item.trend.startsWith('+') ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {item.trend}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold text-gray-900">{item.value}</div>
              <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                <span className="text-sm text-gray-600">#{index + 1}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">Total Defects</div>
          <div className="text-lg font-bold text-gray-900">
            {cls.stain + cls.holes + cls.line}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-red-500" style={{ width: `${(cls.stain / (cls.stain + cls.holes + cls.line)) * 100}%` }}></div>
            <div className="h-full bg-green-500" style={{ width: `${(cls.holes / (cls.stain + cls.holes + cls.line)) * 100}%` }}></div>
            <div className="h-full bg-yellow-500" style={{ width: `${(cls.line / (cls.stain + cls.holes + cls.line)) * 100}%` }}></div>
          </div>
          <div className="text-xs text-gray-500">100%</div>
        </div>
      </div>
    </div>
  );
};

export default DefectClassification;