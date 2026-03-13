"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Filler,
  Title,
} from "chart.js";
import { 
  FiActivity, 
  FiTrendingUp, 
  FiRefreshCw,  
  FiCpu,
  FiBarChart2,
  FiClock,
  FiAlertCircle
} from "react-icons/fi";
import { FaPencilRuler } from "react-icons/fa";
import io, { Socket } from 'socket.io-client';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Filler, Title);

// Define interfaces
interface EncoderData {
  pulses: number;
  cm: number;
  inches: number;
  status: string;
  rotation: string;
  last_update: string;
  pulse_rate: number;
  current_pulse: number;
  average_pulse: number;
  peak_pulse: number;
  total_cm: number;
  total_inches: number;
  wheel_diameter: number;
  ppr: number;
  circumference: number;
  serial_connected?: boolean;
}

interface PulseHistoryItem {
  timestamp: number;
  pulse_rate: number;
  length_cm: number;
  index: number;
}

interface EncoderPulseMonitorProps {
  className?: string;
}

// Add to window interface
declare global {
  interface Window {
    encoderInterval?: NodeJS.Timeout;
  }
}

const EncoderPulseMonitor: React.FC<EncoderPulseMonitorProps> = ({ className = "" }) => {
  const [encoderData, setEncoderData] = useState<EncoderData | null>(null);
  const [pulseHistory, setPulseHistory] = useState<PulseHistoryItem[]>([]);
  const [lengthHistory, setLengthHistory] = useState<number[]>([]);
  const [timeLabels, setTimeLabels] = useState<string[]>([]);
  const [socketConnected, setSocketConnected] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string>("Just now");
  const [chartView, setChartView] = useState<'pulse' | 'length'>('pulse');
  const [connectionAttempts, setConnectionAttempts] = useState<number>(0);
  
  const socketRef = useRef<Socket | null>(null);
  const chartRef = useRef<any>(null);

  // Connect to Socket.IO
  useEffect(() => {
    console.log("🔄 Connecting to encoder socket...");
    
    const socket = io('http://localhost:8000', {
      transports: ['websocket', 'polling'],
      path: '/socket.io',
      withCredentials: false,
      reconnection: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      forceNew: true
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Encoder Monitor: Socket connected! ID:', socket.id);
      setSocketConnected(true);
      setConnectionAttempts(0);
      
      // Request initial encoder data immediately
      setTimeout(() => {
        socket.emit('get_encoder_status');
        socket.emit('get_encoder_history', { limit: 100 });
      }, 100);
      
      // Set up periodic status requests (every 2 seconds) as backup
      if (window.encoderInterval) {
        clearInterval(window.encoderInterval);
      }
      window.encoderInterval = setInterval(() => {
        if (socket.connected) {
          socket.emit('get_encoder_status');
        }
      }, 2000);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Encoder Monitor: Socket disconnected:', reason);
      setSocketConnected(false);
      if (window.encoderInterval) {
        clearInterval(window.encoderInterval);
      }
    });

    socket.on('connect_error', (error) => {
      console.error('⚠️ Connection error:', error.message);
      setConnectionAttempts(prev => prev + 1);
      setSocketConnected(false);
    });

    socket.on('encoder_update', (data: EncoderData) => {
      console.log('📊 Encoder update received:', data);
      setEncoderData(data);
      setLastUpdated(new Date().toLocaleTimeString());
      
      // Update chart data
      updateChartData(data);
    });

    socket.on('encoder_history', (data: { success: boolean; history: PulseHistoryItem[] }) => {
      if (data.success && data.history && data.history.length > 0) {
        console.log('📈 Encoder history loaded:', data.history.length, 'points');
        
        // Process history for chart
        const pulses = data.history.map(item => item.pulse_rate);
        const lengths = data.history.map(item => item.length_cm);
        const times = data.history.map((_, index) => {
          const date = new Date();
          date.setSeconds(date.getSeconds() - (data.history.length - index));
          return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        });
        
        setPulseHistory(data.history);
        setLengthHistory(lengths);
        setTimeLabels(times);
      }
    });

    // Fetch initial data via HTTP as backup
    fetchInitialData();

    return () => {
      console.log("🔌 Cleaning up encoder socket...");
      if (window.encoderInterval) {
        clearInterval(window.encoderInterval);
      }
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      console.log("📡 Fetching initial encoder data via HTTP...");
      
      // Fetch encoder status
      const statusResponse = await fetch("http://localhost:8000/encoder/status");
      if (statusResponse.ok) {
        const data = await statusResponse.json();
        console.log("📊 Initial encoder status:", data);
        setEncoderData(data);
        setLastUpdated(new Date().toLocaleTimeString());
      }
      
      // Fetch history
      const historyResponse = await fetch("http://localhost:8000/encoder/history?limit=100");
      if (historyResponse.ok) {
        const data = await historyResponse.json();
        if (data.success && data.history) {
          console.log("📈 Initial history loaded:", data.history.length, "points");
          setPulseHistory(data.history);
          
          // Prepare chart data
          const pulses = data.history.map((item: PulseHistoryItem) => item.pulse_rate);
          const lengths = data.history.map((item: PulseHistoryItem) => item.length_cm);
          const times = data.history.map((_: any, index: number) => {
            const date = new Date();
            date.setSeconds(date.getSeconds() - (data.history.length - index));
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          });
          
          setLengthHistory(lengths);
          setTimeLabels(times);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch encoder data:", error);
      setLoading(false);
    }
  };

  const updateChartData = (data: EncoderData) => {
    setPulseHistory(prev => {
      const newHistory = [...prev, {
        timestamp: Date.now(),
        pulse_rate: data.pulse_rate || 0,
        length_cm: data.cm || 0,
        index: prev.length
      }];
      
      // Keep only last 100 points
      if (newHistory.length > 100) {
        return newHistory.slice(-100);
      }
      return newHistory;
    });
    
    setLengthHistory(prev => {
      const newHistory = [...prev, data.cm || 0];
      if (newHistory.length > 100) {
        return newHistory.slice(-100);
      }
      return newHistory;
    });
    
    setTimeLabels(prev => {
      const newTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const newLabels = [...prev, newTime];
      if (newLabels.length > 100) {
        return newLabels.slice(-100);
      }
      return newLabels;
    });
  };

  const handleRefresh = useCallback(() => {
    if (socketRef.current && socketConnected) {
      socketRef.current.emit('get_encoder_status');
      socketRef.current.emit('get_encoder_history', { limit: 100 });
    } else {
      fetchInitialData();
    }
  }, [socketConnected]);

  const resetCounter = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:8000/encoder/reset", {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Encoder reset:', data);
        
        // Clear local history
        setPulseHistory([]);
        setLengthHistory([]);
        setTimeLabels([]);
        
        // Request fresh data
        if (socketRef.current && socketConnected) {
          socketRef.current.emit('get_encoder_status');
        }
      }
    } catch (error) {
      console.error('Failed to reset encoder:', error);
    }
  }, [socketConnected]);

  // Prepare chart data
  const chartData = {
    labels: timeLabels.length > 0 ? timeLabels : Array(20).fill('').map((_, i) => `${i}s`),
    datasets: [
      {
        label: chartView === 'pulse' ? 'Pulse Rate' : 'Length (cm)',
        data: chartView === 'pulse' 
          ? (pulseHistory.length > 0 ? pulseHistory.map(item => item.pulse_rate) : Array(20).fill(65).map((v, i) => v + Math.sin(i) * 5))
          : (lengthHistory.length > 0 ? lengthHistory : Array(20).fill(10).map((v, i) => v + i * 0.5)),
        borderColor: chartView === 'pulse' ? "#3b82f6" : "#10b981",
        backgroundColor: chartView === 'pulse' ? "rgba(59, 130, 246, 0.1)" : "rgba(16, 185, 129, 0.1)",
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: chartView === 'pulse' ? "#3b82f6" : "#10b981",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0 // Disable animation for better performance with live data
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        padding: 12,
        cornerRadius: 6,
      },
    },
    scales: {
      y: {
        beginAtZero: chartView === 'pulse' ? false : true,
        min: chartView === 'pulse' ? 0 : undefined,
        grid: {
          color: "rgba(226, 232, 240, 0.5)",
        },
        ticks: {
          color: "#64748b",
          font: {
            size: 11,
          },
        },
        title: {
          display: true,
          text: chartView === 'pulse' ? 'Pulse Rate' : 'Length (cm)',
          color: "#64748b",
          font: {
            size: 11,
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#64748b",
          font: {
            size: 11,
          },
          maxTicksLimit: 8,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  if (loading && !encoderData) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 shadow-lg p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FiActivity className="w-5 h-5 text-blue-600" />
            Encoder Pulse Monitor
          </h2>
          <p className="text-gray-600 text-sm mt-1">Real-time pulse monitoring and fabric length measurement</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleRefresh}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh data"
          >
            <FiRefreshCw className={`w-4 h-4 text-gray-600 ${!socketConnected ? 'animate-spin' : ''}`} />
          </button>
          <span className={`px-3 py-1 ${socketConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} text-xs rounded-full font-medium`}>
            {socketConnected ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>
      </div>

      {/* Quick Stats Cards - Current Pulse, Average, Peak */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-xs text-blue-600 mb-1">Current Pulse</div>
          <div className="text-2xl font-bold text-blue-700">
            {encoderData?.current_pulse || 0}
          </div>
          <div className="text-xs text-blue-500 mt-1">pulses/sec</div>
        </div>
        <div className="text-center p-3 bg-emerald-50 rounded-lg">
          <div className="text-xs text-emerald-600 mb-1">Average</div>
          <div className="text-2xl font-bold text-emerald-700">
            {encoderData?.average_pulse?.toFixed(1) || 0}
          </div>
          <div className="text-xs text-emerald-500 mt-1">pulses/sec</div>
        </div>
        <div className="text-center p-3 bg-amber-50 rounded-lg">
          <div className="text-xs text-amber-600 mb-1">Peak</div>
          <div className="text-2xl font-bold text-amber-700">
            {encoderData?.peak_pulse || 0}
          </div>
          <div className="text-xs text-amber-500 mt-1">pulses/sec</div>
        </div>
      </div>

      {/* Length Display - CM and Inches */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg p-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <FaPencilRuler className="w-4 h-4" />
            <span className="text-xs opacity-90">Length (cm)</span>
          </div>
          <div className="text-3xl font-bold">{encoderData?.cm?.toFixed(2) || 0.00}</div>
          <div className="text-xs opacity-75 mt-1">Total: {encoderData?.total_cm?.toFixed(2) || 0.00} cm</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <FaPencilRuler className="w-4 h-4 rotate-90" />
            <span className="text-xs opacity-90">Length (inches)</span>
          </div>
          <div className="text-3xl font-bold">{encoderData?.inches?.toFixed(2) || 0.00}</div>
          <div className="text-xs opacity-75 mt-1">Total: {encoderData?.total_inches?.toFixed(2) || 0.00} in</div>
        </div>
      </div>

      {/* Chart Type Toggle */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setChartView('pulse')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              chartView === 'pulse' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FiBarChart2 className="w-3 h-3 inline mr-1" />
            Pulse Rate
          </button>
          <button
            onClick={() => setChartView('length')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              chartView === 'length' 
                ? 'bg-emerald-600 text-white' 
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FaPencilRuler className="w-3 h-3 inline mr-1" />
            Length
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 text-xs rounded-full ${
            encoderData?.rotation === 'Running' 
              ? 'bg-green-100 text-green-800 animate-pulse' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {encoderData?.rotation || 'Stopped'}
          </span>
          <button
            onClick={resetCounter}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Reset counter"
          >
            <FiRefreshCw className="w-3 h-3 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-48">
        <Line ref={chartRef} data={chartData} options={chartOptions} />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
        <div>
          <div className="flex items-center gap-2 text-sm">
            <FiCpu className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">Pulse Count:</span>
            <span className="font-semibold text-gray-800">{encoderData?.pulses || 0}</span>
          </div>
          <div className="flex items-center gap-2 text-sm mt-1">
            <FiClock className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">Last Update:</span>
            <span className="font-semibold text-gray-800">{encoderData?.last_update || lastUpdated}</span>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 text-sm">
            <FiActivity className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">Pulse Rate:</span>
            <span className="font-semibold text-gray-800">{encoderData?.pulse_rate?.toFixed(1) || 0}/s</span>
          </div>
          <div className="flex items-center gap-2 text-sm mt-1">
            <FiAlertCircle className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">Status:</span>
            <span className="font-semibold text-gray-800">{encoderData?.status || 'Unknown'}</span>
          </div>
        </div>
      </div>

      {/* Calibration Info */}
      <div className="mt-3 text-xs text-gray-500 flex items-center justify-between">
        <span>Wheel: {encoderData?.wheel_diameter} cm | PPR: {encoderData?.ppr}</span>
        <span>Circ: {encoderData?.circumference?.toFixed(2)} cm</span>
      </div>
      
      {/* Connection Status */}
      {!socketConnected && connectionAttempts > 0 && (
        <div className="mt-3 text-xs text-center text-amber-600 bg-amber-50 p-2 rounded-lg">
          ⚠️ Connecting to server... (attempt {connectionAttempts})
        </div>
      )}
      
      {encoderData?.status?.includes("SIMULATION") && (
        <div className="mt-3 text-xs text-center text-blue-600 bg-blue-50 p-2 rounded-lg">
          🔧 Demo Mode - Simulating encoder data
        </div>
      )}
    </div>
  );
};

export default EncoderPulseMonitor;