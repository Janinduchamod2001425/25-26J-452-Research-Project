import React, { useEffect, useState } from "react";
import { FaPencilRuler } from "react-icons/fa";
import { FiCheckCircle, FiAlertTriangle, FiMapPin, FiBarChart2, FiTarget, FiNavigation, FiActivity, FiZap } from "react-icons/fi";

interface DefectDetailProps {
  apiData?: any;
}

const DefectDetail: React.FC<DefectDetailProps> = ({ apiData }) => {
  const [currentDefect, setCurrentDefect] = useState({
    type: "No Defects",
    severity: "None",
    confidence: "0%",
    location: { fabricLength: "N/A", xPos: "N/A", yPos: "N/A" }
  });
  const [hasDefects, setHasDefects] = useState(false);
  const [defectCount, setDefectCount] = useState(0);
  const [defectId, setDefectId] = useState<string>("N/A");
  const [summary, setSummary] = useState<any>(null);
  const [positionCm, setPositionCm] = useState<number | null>(null);
  const [frameNumber, setFrameNumber] = useState<number | null>(null);
  const [pulseCount, setPulseCount] = useState<number | null>(null);

  useEffect(() => {
    if (apiData) {
      const defects = apiData.defects || [];
      setDefectCount(defects.length);
      setHasDefects(defects.length > 0);
      
      if (apiData.summary) {
        setSummary(apiData.summary);
      }
      
      if (apiData._id) {
        setDefectId(apiData._id.substring(0, 8));
      } else if (defects.length > 0) {
        setDefectId(`FD-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`);
      } else {
        setDefectId("N/A");
      }
      
      setPositionCm(apiData.position_cm || null);
      setFrameNumber(apiData.frame_number || null);
      setPulseCount(apiData.pulse_count || null);
      
      if (defects.length > 0) {
        const defect = defects[0];
        setCurrentDefect({
          type: defect.type || "Unknown",
          severity: defect.severity || "Unknown",
          confidence: defect.confidence || "0%",
          location: defect.location || { fabricLength: "N/A", xPos: "N/A", yPos: "N/A" }
        });
      } else {
        setCurrentDefect({
          type: "No Defects",
          severity: "None",
          confidence: "100%",
          location: { fabricLength: "N/A", xPos: "N/A", yPos: "N/A" }
        });
      }
    } else {
      setHasDefects(false);
      setDefectCount(0);
      setDefectId("N/A");
      setSummary(null);
      setPositionCm(null);
      setFrameNumber(null);
      setPulseCount(null);
      setCurrentDefect({
        type: "No Data",
        severity: "None",
        confidence: "0%",
        location: { fabricLength: "N/A", xPos: "N/A", yPos: "N/A" }
      });
    }
  }, [apiData]);

  const getSeverityColor = (severity: string) => {
    switch(severity?.toLowerCase()) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      case 'none': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getConfidenceColor = (confidence: string) => {
    if (!confidence) return 'text-gray-600';
    const percent = parseFloat(confidence);
    if (isNaN(percent)) return 'text-gray-600';
    if (percent >= 90) return 'text-green-600';
    if (percent >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTypeColor = (type: string) => {
    switch(type?.toLowerCase()) {
      case 'stain': return 'bg-yellow-100 text-yellow-800';
      case 'holes': return 'bg-green-100 text-green-800';
      case 'line': return 'bg-blue-100 text-blue-800';
      case 'cut': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          {apiData ? (
            hasDefects ? (
              <FiAlertTriangle className="w-5 h-5 text-red-600" />
            ) : (
              <FiCheckCircle className="w-5 h-5 text-green-600" />
            )
          ) : (
            <FiActivity className="w-5 h-5 text-blue-600" />
          )}
          Defect Analysis Details
        </h2>
        <span className={`px-3 py-1 ${
          apiData 
            ? hasDefects 
              ? 'bg-red-100 text-red-800' 
              : 'bg-green-100 text-green-800'
            : 'bg-blue-100 text-blue-800'
        } text-sm rounded-full font-medium`}>
          {apiData 
            ? hasDefects 
              ? `${defectCount} Defect${defectCount !== 1 ? 's' : ''} Detected` 
              : "Clean Fabric"
            : "No Data"}
        </span>
      </div>

      {positionCm && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FaPencilRuler className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-600">Position:</span>
              <span className="font-bold text-blue-700">{positionCm.toFixed(2)} cm</span>
            </div>
            {frameNumber && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Frame:</span>
                <span className="font-medium text-gray-900">{frameNumber}</span>
              </div>
            )}
            {pulseCount && (
              <div className="flex items-center gap-2">
                <FiZap className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-gray-600">Pulse:</span>
                <span className="font-medium text-gray-900">{pulseCount}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {hasDefects ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FiAlertTriangle className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-600">Defect Type</span>
              </div>
              <div className="text-lg font-bold text-gray-900">
                {currentDefect.type}
              </div>
              <div className="mt-1">
                <span className={`px-2 py-0.5 text-xs rounded-full ${getTypeColor(currentDefect.type)}`}>
                  {currentDefect.type}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FiBarChart2 className="w-4 h-4 text-amber-600" />
                <span className="text-sm text-gray-600">Severity</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(currentDefect.severity)}`}>
                {currentDefect.severity}
              </span>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FiTarget className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-gray-600">Confidence</span>
              </div>
              <div className={`text-lg font-bold ${getConfidenceColor(currentDefect.confidence)}`}>
                {currentDefect.confidence}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FiNavigation className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600">Defect ID</span>
              </div>
              <div className="text-sm font-mono text-gray-900">
                {defectId}
              </div>
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
                <div className="font-bold text-gray-900">
                  {positionCm ? `${positionCm.toFixed(2)} cm` : (currentDefect.location?.fabricLength || "N/A")}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">X Position</div>
                <div className="font-bold text-gray-900">
                  {currentDefect.location?.xPos || "N/A"}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Y Position</div>
                <div className="font-bold text-gray-900">
                  {currentDefect.location?.yPos || "N/A"}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="py-8 text-center text-gray-500">
          {apiData ? (
            <>
              <FiCheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <p className="text-lg font-medium text-gray-700">No Defects Detected</p>
              <p className="text-sm mt-2">This fabric sample is clean and defect-free</p>
            </>
          ) : (
            <>
              <FiActivity className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium text-gray-700">No Detection Data</p>
              <p className="text-sm mt-2">Upload an image or start scanner to analyze fabric</p>
            </>
          )}
        </div>
      )}

      {summary && hasDefects && (
        <div className="mt-6 bg-gradient-to-r from-gray-50 to-slate-50 p-5 rounded-xl border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Detection Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">Total Defects</div>
              <div className={`text-lg font-bold ${summary.total_defects > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {summary.total_defects}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Overall Severity</div>
              <div className="text-lg font-bold text-gray-900">
                {summary.overall_severity || "None"}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Defect Free</div>
              <div className={`text-lg font-bold ${summary.is_defect_free ? 'text-green-600' : 'text-red-600'}`}>
                {summary.is_defect_free ? "Yes" : "No"}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Processing Time</div>
              <div className="text-lg font-bold text-gray-900">
                {apiData?.processing_time_ms ? `${apiData.processing_time_ms}ms` : "N/A"}
              </div>
            </div>
            {summary.defect_types_found?.length > 0 && (
              <div className="col-span-2">
                <div className="text-sm text-gray-600 mb-1">Defect Types Found</div>
                <div className="flex flex-wrap gap-2">
                  {summary.defect_types_found.map((type: string, idx: number) => (
                    <span key={idx} className={`px-2 py-1 text-xs rounded-full ${getTypeColor(type)}`}>
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 mt-6 pt-6 border-t border-gray-100">
        {apiData && hasDefects && (
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            Save Report
          </button>
        )}
        {apiData && (
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
            {hasDefects ? "Export Data" : "Save Result"}
          </button>
        )}
        {!apiData && (
          <button 
            onClick={() => window.location.href = '/realtime/start'}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            Start Scanner
          </button>
        )}
      </div>
    </div>
  );
};

export default DefectDetail;