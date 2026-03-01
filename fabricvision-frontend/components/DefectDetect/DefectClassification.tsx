import React, { useEffect, useState } from "react";
import { FiPieChart, FiTrendingUp, FiTrendingDown, FiCircle, FiAlertCircle } from "react-icons/fi";

interface DefectClassificationProps {
  apiData?: any;
  statsData?: any;
}

const DefectClassification: React.FC<DefectClassificationProps> = ({ apiData, statsData }) => {
  const [defectCounts, setDefectCounts] = useState({
    stain: 0,
    holes: 0,
    line: 0,
    cut: 0
  });

  const [trends, setTrends] = useState({
    stain: "0%",
    holes: "0%",
    line: "0%",
    cut: "0%"
  });

  const [totalDefects, setTotalDefects] = useState(0);
  const [defectTypes, setDefectTypes] = useState<string[]>([]);

  useEffect(() => {
    // Use stats data from database if available
    if (statsData?.defect_type_counts) {
      const counts = {
        stain: statsData.defect_type_counts.stain || 0,
        holes: statsData.defect_type_counts.holes || 0,
        line: statsData.defect_type_counts.line || 0,
        cut: statsData.defect_type_counts.cut || 0
      };
      
      setDefectCounts(counts);
      
      // Calculate total defects
      const total = Object.values(counts).reduce((sum, val) => sum + val, 0);
      setTotalDefects(total);
      
      // Get defect types that have counts
      const types = Object.entries(counts)
        .filter(([_, count]) => (count as number) > 0)
        .map(([type]) => type);
      setDefectTypes(types);

      // Calculate trends based on defect rate
      if (statsData.defect_rate_percentage) {
        const rate = statsData.defect_rate_percentage;
        setTrends({
          stain: rate > 30 ? "+12%" : rate > 20 ? "+8%" : "+5%",
          holes: rate < 15 ? "-8%" : rate < 25 ? "-5%" : "-2%",
          line: rate > 25 ? "+5%" : "+3%",
          cut: rate > 10 ? "+3%" : "+1%"
        });
      }
    } 
    // Fallback to apiData defects if available
    else if (apiData?.defects?.length) {
      const counts = apiData.defects.reduce((acc: any, defect: any) => {
        const type = defect.type.toLowerCase();
        if (type === 'stain' || type === 'holes' || type === 'line' || type === 'cut') {
          acc[type] = (acc[type] || 0) + 1;
        }
        return acc;
      }, { stain: 0, holes: 0, line: 0, cut: 0 });
      
      setDefectCounts(counts);
      
      // Calculate total defects
      const total = Object.values(counts).reduce((sum: number, val: any) => sum + val, 0);
      setTotalDefects(total);
      
      // Get defect types from summary
      if (apiData.summary?.defect_types_found) {
        setDefectTypes(apiData.summary.defect_types_found);
      }
    }
    // If no data, reset to zeros
    else {
      setDefectCounts({ stain: 0, holes: 0, line: 0, cut: 0 });
      setTotalDefects(0);
      setDefectTypes([]);
    }
  }, [apiData, statsData]);

  const getTrendIcon = (type: string) => {
    const trendValue = trends[type as keyof typeof trends] || "0%";
    if (trendValue.startsWith('+')) {
      return <FiTrendingUp className="w-4 h-4 text-red-500" />;
    } else if (trendValue.startsWith('-')) {
      return <FiTrendingDown className="w-4 h-4 text-green-500" />;
    }
    return null;
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

  const getBgColor = (type: string) => {
    const colors: any = {
      stain: "bg-red-500",
      holes: "bg-green-500",
      line: "bg-yellow-500",
      cut: "bg-blue-500"
    };
    return colors[type] || "bg-gray-500";
  };

  const items = [
    { label: "Stain Defect", value: defectCounts.stain, type: "stain" },
    { label: "Holes Defect", value: defectCounts.holes, type: "holes" },
    { label: "Line Defect", value: defectCounts.line, type: "line" },
    { label: "Cut Defect", value: defectCounts.cut, type: "cut" }
  ].filter(item => item.value > 0); // Only show items with counts

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <FiPieChart className="w-5 h-5 text-indigo-600" />
          Defect Classification
        </h2>
        <div className="text-sm text-gray-500">
          {statsData ? "Live Statistics" : apiData ? "Current Detection" : "No Data"}
        </div>
      </div>

      {items.length > 0 ? (
        <>
          <div className="space-y-4">
            {items.map((item, index) => {
              const percentage = totalDefects > 0 ? ((item.value / totalDefects) * 100).toFixed(1) : "0";
              
              return (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <FiCircle className={`w-3 h-3 ${getColor(item.type)}`} />
                    <div>
                      <div className="font-medium text-gray-900">{item.label}</div>
                      <div className="flex items-center gap-2 mt-1">
                        {getTrendIcon(item.type)}
                        <span className={`text-xs ${
                          trends[item.type as keyof typeof trends]?.startsWith('+') ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {trends[item.type as keyof typeof trends] || "0%"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {percentage}% of total
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
              );
            })}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">Total Defects</div>
              <div className="text-lg font-bold text-gray-900">
                {totalDefects}
                {statsData && ` (across ${statsData.total_frames_processed || 0} frames)`}
              </div>
            </div>
            
            {totalDefects > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden flex">
                  {items.map((item, index) => {
                    const width = (item.value / totalDefects) * 100;
                    return (
                      <div 
                        key={index}
                        className={`h-full ${getBgColor(item.type)}`}
                        style={{ width: `${width}%` }}
                      ></div>
                    );
                  })}
                </div>
                <div className="text-xs text-gray-500">100%</div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="py-8 text-center text-gray-500">
          <FiPieChart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No defect data available</p>
          <p className="text-sm mt-1">Upload an image or start scanner to see classifications</p>
        </div>
      )}

      {defectTypes.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <FiAlertCircle className="w-4 h-4" />
            <span>Detected Types</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {defectTypes.map((type, idx) => {
              const count = defectCounts[type as keyof typeof defectCounts] || 0;
              return (
                <span 
                  key={idx}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    type === 'stain' ? 'bg-yellow-100 text-yellow-800' :
                    type === 'holes' ? 'bg-green-100 text-green-800' :
                    type === 'cut' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}
                >
                  {type} {count > 0 && `(${count})`}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {!statsData && !apiData && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <button 
            onClick={() => window.location.href = '/realtime/start'}
            className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Start Scanner
          </button>
        </div>
      )}
    </div>
  );
};

export default DefectClassification;