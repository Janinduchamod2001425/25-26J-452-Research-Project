import React, { useEffect, useState } from "react";
import { defectData } from "@/data/defectData";
import { FiPieChart, FiTrendingUp, FiTrendingDown, FiCircle, FiAlertCircle } from "react-icons/fi";

interface DefectClassificationProps {
  apiData?: any;
}

const DefectClassification: React.FC<DefectClassificationProps> = ({ apiData }) => {
  const cls = defectData.classification;
  const [defectCounts, setDefectCounts] = useState({
    stain: cls.stain,
    holes: cls.holes,
    line: cls.line,
    cut: 0
  });

  useEffect(() => {
    if (apiData?.defects?.length) {
      const counts = apiData.defects.reduce((acc: any, defect: any) => {
        const type = defect.type.toLowerCase();
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, { stain: 0, holes: 0, line: 0, cut: 0 });
      
      setDefectCounts(prev => ({
        stain: counts.stain || prev.stain,
        holes: counts.holes || prev.holes,
        line: counts.line || prev.line,
        cut: counts.cut || prev.cut
      }));
    } else {
      setDefectCounts({
        stain: cls.stain,
        holes: cls.holes,
        line: cls.line,
        cut: 0
      });
    }
  }, [apiData, cls]);

  const getTrendIcon = (type: string) => {
    const trends: any = {
      stain: <FiTrendingUp className="w-4 h-4 text-red-500" />,
      holes: <FiTrendingDown className="w-4 h-4 text-green-500" />,
      line: <FiTrendingUp className="w-4 h-4 text-yellow-500" />,
      cut: <FiTrendingUp className="w-4 h-4 text-blue-500" />
    };
    return trends[type] || <FiTrendingUp className="w-4 h-4 text-gray-400" />;
  };

  const getColor = (type: string) => {
    const colors: any = {
      stain: "text-red-500",
      holes: "text-green-500",
      line: "text-yellow-500",
      cut: "text-blue-500"
    };
    return colors[type] || "text-gray-400";
  };

  const items = [
    { label: "Stain Defect", value: defectCounts.stain, type: "stain", trend: "+12%" },
    { label: "Holes Defect", value: defectCounts.holes, type: "holes", trend: "-8%" },
    { label: "Line Defect", value: defectCounts.line, type: "line", trend: "+5%" },
    ...(defectCounts.cut > 0 ? [{ label: "Cut Defect", value: defectCounts.cut, type: "cut", trend: "+3%" }] : [])
  ];

  const totalDefects = items.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <FiPieChart className="w-5 h-5 text-indigo-600" />
          Defect Classification
        </h2>
        <div className="text-sm text-gray-500">
          {apiData ? "Current Detection" : "Last 24 hours"}
        </div>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-3">
              <FiCircle className={`w-3 h-3 ${getColor(item.type)}`} />
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
            {totalDefects}
            {apiData && ` (${apiData.summary?.total_defects})`}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            {items.map((item, index) => (
              <div 
                key={index}
                className="h-full float-left"
                style={{ 
                  width: `${totalDefects > 0 ? (item.value / totalDefects) * 100 : 0}%`,
                  backgroundColor: 
                    item.type === "stain" ? "#ef4444" :
                    item.type === "holes" ? "#10b981" :
                    item.type === "line" ? "#f59e0b" :
                    "#3b82f6"
                }}
              ></div>
            ))}
          </div>
          <div className="text-xs text-gray-500">100%</div>
        </div>
      </div>

      {apiData?.summary?.defect_types_found?.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <FiAlertCircle className="w-4 h-4" />
            <span>Detected Types</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {apiData.summary.defect_types_found.map((type: string, idx: number) => (
              <span 
                key={idx}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  type === 'stain' ? 'bg-yellow-100 text-yellow-800' :
                  type === 'holes' ? 'bg-green-100 text-green-800' :
                  type === 'cut' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DefectClassification;