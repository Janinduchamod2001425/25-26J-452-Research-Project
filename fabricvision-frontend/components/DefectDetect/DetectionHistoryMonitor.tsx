import React, { useEffect, useState } from "react";
import { FiClock, FiCalendar, FiFilter, FiDownload, FiRefreshCw } from "react-icons/fi";

interface HistoryItem {
  time: string;
  date: string;
  type: string;
  confidence: string;
  status: string;
  filename?: string;
  _id?: string;
  timestamp?: string;
}

interface DetectionHistoryMonitorProps {
  historyData?: any[];
  totalCount?: number;
  onLoadMore?: () => void;
}

const DetectionHistoryMonitor: React.FC<DetectionHistoryMonitorProps> = ({ 
  historyData, 
  totalCount = 0,
  onLoadMore 
}) => {
  const [displayData, setDisplayData] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    if (historyData && historyData.length > 0) {
      // Transform API data to match the component's expected format
      const transformed: HistoryItem[] = historyData.map((item: any) => {
        // Parse timestamp
        let timeStr = "Unknown";
        let dateStr = "Unknown";
        
        if (item.timestamp) {
          try {
            const timestamp = new Date(item.timestamp);
            if (!isNaN(timestamp.getTime())) {
              timeStr = timestamp.toLocaleTimeString();
              dateStr = timestamp.toLocaleDateString();
            }
          } catch (e) {
            // Use defaults
          }
        } else if (item.processed_at) {
          try {
            const timestamp = new Date(item.processed_at);
            if (!isNaN(timestamp.getTime())) {
              timeStr = timestamp.toLocaleTimeString();
              dateStr = timestamp.toLocaleDateString();
            }
          } catch (e) {
            // Use defaults
          }
        }
        
        // Determine defect type
        let defectType = "Unknown";
        if (item.defects && item.defects.length > 0) {
          defectType = item.defects[0].type || "Unknown";
        } else if (item.summary?.defect_types_found?.length > 0) {
          defectType = item.summary.defect_types_found[0];
        }
        
        // Determine confidence
        let confidence = "0%";
        if (item.defects && item.defects.length > 0) {
          confidence = item.defects[0].confidence || "0%";
        }
        
        // Determine status
        let status = "Pending";
        if (item.summary) {
          if (item.summary.total_defects > 0) {
            status = "Resolved";
          } else if (item.summary.is_defect_free) {
            status = "Passed";
          } else {
            status = "Pending";
          }
        }
        
        return {
          time: timeStr,
          date: dateStr,
          type: defectType,
          confidence: confidence,
          status: status,
          filename: item.filename || "Unknown",
          _id: item._id,
          timestamp: item.timestamp
        };
      });
      
      setDisplayData(transformed);
    } else {
      setDisplayData([]);
    }
  }, [historyData]);

  const getTypeColor = (type: string) => {
    switch(type?.toLowerCase()) {
      case 'hole':
      case 'holes':
        return 'bg-red-100 text-red-800';
      case 'stain':
        return 'bg-yellow-100 text-yellow-800';
      case 'line':
        return 'bg-blue-100 text-blue-800';
      case 'cut':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Resolved':
        return 'bg-green-100 text-green-800';
      case 'Passed':
        return 'bg-blue-100 text-blue-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  const getConfidenceValue = (confidence: string): number => {
    const match = confidence.match(/(\d+(\.\d+)?)/);
    return match ? parseFloat(match[0]) : 0;
  };

  const handleLoadMore = () => {
    if (onLoadMore) {
      setLoading(true);
      onLoadMore();
      setCurrentPage(prev => prev + 1);
      setTimeout(() => setLoading(false), 1000); // Simulate loading
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Detection History Monitor</h2>
            <p className="text-gray-600 text-sm mt-1">
              {totalCount > 0 ? `${totalCount} total records` : 'Historical defect detection records'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <FiFilter className="w-4 h-4 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <FiDownload className="w-4 h-4 text-gray-600" />
            </button>
            <button 
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => window.location.reload()}
            >
              <FiRefreshCw className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {displayData.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 rounded-l-lg">
                      <div className="flex items-center gap-2">
                        <FiClock className="w-4 h-4" />
                        Time
                      </div>
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                      <div className="flex items-center gap-2">
                        <FiCalendar className="w-4 h-4" />
                        Date
                      </div>
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Defect Type</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Confidence</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 rounded-r-lg">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {displayData.map((h, i) => {
                    const confidenceVal = getConfidenceValue(h.confidence);
                    
                    return (
                      <tr key={h._id || i} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{h.time}</div>
                          {h.filename && h.filename !== "Unknown" && (
                            <div className="text-xs text-gray-500 mt-1 truncate max-w-[150px]">
                              {h.filename}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-600">{h.date}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(h.type)}`}>
                            {h.type}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-1.5">
                              <div 
                                className={`h-1.5 rounded-full ${
                                  confidenceVal >= 90 ? 'bg-green-500' :
                                  confidenceVal >= 80 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${Math.min(confidenceVal, 100)}%` }}
                              ></div>
                            </div>
                            <span className={`text-sm font-medium ${
                              confidenceVal >= 90 ? 'text-green-600' :
                              confidenceVal >= 80 ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {h.confidence}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(h.status)}`}>
                            {h.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
              <div className="text-sm text-gray-600">
                Showing {displayData.length} of {totalCount || displayData.length} records
              </div>
              <div className="flex items-center gap-2">
                <button 
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
                  disabled={currentPage === 0}
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                >
                  Previous
                </button>
                <button 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
                  onClick={handleLoadMore}
                  disabled={loading || displayData.length >= totalCount}
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="py-12 text-center text-gray-500">
            <FiClock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium text-gray-700">No History Available</p>
            <p className="text-sm mt-2">Process images to see detection history</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetectionHistoryMonitor;