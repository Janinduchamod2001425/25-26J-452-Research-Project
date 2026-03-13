"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  FiCalendar, 
  FiClock, 
  FiMail, 
  FiSettings, 
  FiPlay,
  FiPause,
  FiRefreshCw,
  FiDownload,
  FiBell,
  FiFileText,
  FiUsers,
  FiActivity,
  FiAlertCircle,
  FiCheckCircle,
  FiLoader,
  FiTrash2,
  FiSave,
  FiSend,
  FiDownloadCloud
} from "react-icons/fi";

interface EmailRecipient {
  id: string;
  name: string;
  email: string;
  enabled: boolean;
  _id?: string;
}

interface ReportSchedule {
  frequency: "daily" | "weekly" | "monthly" | "custom";
  time: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  enabled?: boolean;
  _id?: string;
}

interface ReportFormat {
  includeImages: boolean;
  includeCharts: boolean;
  includeRawData: boolean;
  pdfFormat: boolean;
  csvFormat: boolean;
  _id?: string;
}

interface CronStatus {
  running: boolean;
  lastRun: string;
  nextRun: string;
  frequency?: string;
  time?: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface GeneratedReport {
  _id: string;
  startDate: string;
  endDate: string;
  generatedAt: string;
  filename: string;
  size: number;
  recipients: string[];
  status: 'success' | 'failed';
}

const DefectReportingTab: React.FC = () => {
  // State for all form data
  const [reportDateRange, setReportDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  
  const [emailRecipients, setEmailRecipients] = useState<EmailRecipient[]>([]);
  const [schedule, setSchedule] = useState<ReportSchedule>({
    frequency: "daily",
    time: "08:00",
    dayOfWeek: 1,
    dayOfMonth: 1,
    enabled: true
  });
  
  const [reportFormat, setReportFormat] = useState<ReportFormat>({
    includeImages: true,
    includeCharts: true,
    includeRawData: false,
    pdfFormat: true,
    csvFormat: true
  });
  
  const [cronStatus, setCronStatus] = useState<CronStatus>({
    running: true,
    lastRun: "Loading...",
    nextRun: "Loading..."
  });
  
  const [newRecipient, setNewRecipient] = useState({ name: "", email: "" });
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([]);
  
  // UI States
  const [loading, setLoading] = useState({
    recipients: false,
    schedule: false,
    format: false,
    cron: false,
    generate: false,
    test: false,
    reports: false
  });
  
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 5,
    total: 0,
    pages: 1
  });
  
  const [notifications, setNotifications] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'info';
    message: string;
  }>({
    show: false,
    type: 'info',
    message: ''
  });

  // Fetch all data on component mount
  useEffect(() => {
    fetchRecipients();
    fetchSchedule();
    fetchFormat();
    fetchCronStatus();
    fetchGeneratedReports();
  }, []);

  // Show notification helper
  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotifications({ show: true, type, message });
    setTimeout(() => setNotifications(prev => ({ ...prev, show: false })), 5000);
  };

  // API Functions
  const fetchRecipients = async (page = 1) => {
    setLoading(prev => ({ ...prev, recipients: true }));
    try {
      const res = await fetch(`/api/reporting/recipients?page=${page}&limit=${pagination.limit}`);
      const data = await res.json();
      if (data.success) {
        setEmailRecipients(data.data);
        setPagination(data.pagination);
      } else {
        showNotification('error', data.error || 'Failed to fetch recipients');
      }
    } catch (error) {
      console.error('Failed to fetch recipients:', error);
      showNotification('error', 'Network error while fetching recipients');
    } finally {
      setLoading(prev => ({ ...prev, recipients: false }));
    }
  };

  const fetchSchedule = async () => {
    setLoading(prev => ({ ...prev, schedule: true }));
    try {
      const res = await fetch('/api/reporting/schedule');
      const data = await res.json();
      if (data.success && data.data) {
        setSchedule(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch schedule:', error);
    } finally {
      setLoading(prev => ({ ...prev, schedule: false }));
    }
  };

  const fetchFormat = async () => {
    setLoading(prev => ({ ...prev, format: true }));
    try {
      const res = await fetch('/api/reporting/format');
      const data = await res.json();
      if (data.success && data.data) {
        setReportFormat(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch format:', error);
    } finally {
      setLoading(prev => ({ ...prev, format: false }));
    }
  };

  const fetchCronStatus = async () => {
    setLoading(prev => ({ ...prev, cron: true }));
    try {
      const res = await fetch('/api/reporting/cron');
      const data = await res.json();
      if (data.success && data.data) {
        setCronStatus(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch cron status:', error);
    } finally {
      setLoading(prev => ({ ...prev, cron: false }));
    }
  };

  const fetchGeneratedReports = async (page = 1) => {
    setLoading(prev => ({ ...prev, reports: true }));
    try {
      const res = await fetch(`/api/reporting/reports?page=${page}&limit=5`);
      const data = await res.json();
      if (data.success) {
        setGeneratedReports(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(prev => ({ ...prev, reports: false }));
    }
  };

  const addRecipient = async () => {
    if (!newRecipient.name || !newRecipient.email) {
      showNotification('error', 'Please fill in both name and email');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newRecipient.email)) {
      showNotification('error', 'Please enter a valid email address');
      return;
    }

    try {
      const res = await fetch('/api/reporting/recipients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newRecipient.name,
          email: newRecipient.email,
          enabled: true
        }),
      });

      const data = await res.json();
      if (data.success) {
        showNotification('success', 'Recipient added successfully');
        setNewRecipient({ name: "", email: "" });
        fetchRecipients(1);
      } else {
        showNotification('error', data.error || 'Failed to add recipient');
      }
    } catch (error) {
      console.error('Failed to add recipient:', error);
      showNotification('error', 'Network error while adding recipient');
    }
  };

  const toggleRecipient = async (id: string, currentEnabled: boolean) => {
    try {
      const res = await fetch(`/api/reporting/recipients/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !currentEnabled }),
      });

      const data = await res.json();
      if (data.success) {
        showNotification('success', `Recipient ${!currentEnabled ? 'enabled' : 'disabled'}`);
        fetchRecipients(pagination.page);
      } else {
        showNotification('error', data.error || 'Failed to update recipient');
      }
    } catch (error) {
      console.error('Failed to toggle recipient:', error);
      showNotification('error', 'Network error while updating recipient');
    }
  };

  const removeRecipient = async (id: string) => {
    if (!confirm('Are you sure you want to remove this recipient?')) return;

    try {
      const res = await fetch(`/api/reporting/recipients/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (data.success) {
        showNotification('success', 'Recipient removed successfully');
        fetchRecipients(pagination.page);
      } else {
        showNotification('error', data.error || 'Failed to remove recipient');
      }
    } catch (error) {
      console.error('Failed to remove recipient:', error);
      showNotification('error', 'Network error while removing recipient');
    }
  };

  const saveSchedule = async () => {
    setLoading(prev => ({ ...prev, schedule: true }));
    try {
      const res = await fetch('/api/reporting/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schedule),
      });

      const data = await res.json();
      if (data.success) {
        showNotification('success', 'Schedule saved successfully!');
        setSchedule(data.data);
        fetchCronStatus();
      } else {
        showNotification('error', data.error || 'Failed to save schedule');
      }
    } catch (error) {
      console.error('Failed to save schedule:', error);
      showNotification('error', 'Network error while saving schedule');
    } finally {
      setLoading(prev => ({ ...prev, schedule: false }));
    }
  };

  const saveFormat = async () => {
    setLoading(prev => ({ ...prev, format: true }));
    try {
      const res = await fetch('/api/reporting/format', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportFormat),
      });

      const data = await res.json();
      if (data.success) {
        showNotification('success', 'Format settings saved successfully!');
      } else {
        showNotification('error', data.error || 'Failed to save format');
      }
    } catch (error) {
      console.error('Failed to save format:', error);
      showNotification('error', 'Network error while saving format');
    } finally {
      setLoading(prev => ({ ...prev, format: false }));
    }
  };

  const generateReport = async () => {
    setLoading(prev => ({ ...prev, generate: true }));
    try {
      const res = await fetch('/api/reporting/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: reportDateRange.start,
          endDate: reportDateRange.end,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showNotification('success', 'Report generated and sent successfully!');
        fetchGeneratedReports(1);
      } else {
        showNotification('error', data.error || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
      showNotification('error', 'Network error while generating report');
    } finally {
      setLoading(prev => ({ ...prev, generate: false }));
    }
  };

  const sendTestReport = async () => {
    const enabledRecipients = emailRecipients.filter(r => r.enabled);
    if (enabledRecipients.length === 0) {
      showNotification('error', 'No enabled recipients found');
      return;
    }

    setLoading(prev => ({ ...prev, test: true }));
    try {
      const res = await fetch('/api/reporting/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          testEmail: enabledRecipients[0].email 
        }),
      });

      const data = await res.json();
      if (data.success) {
        showNotification('success', 'Test report sent successfully!');
      } else {
        showNotification('error', data.error || 'Failed to send test report');
      }
    } catch (error) {
      console.error('Failed to send test report:', error);
      showNotification('error', 'Network error while sending test report');
    } finally {
      setLoading(prev => ({ ...prev, test: false }));
    }
  };

  const toggleCronJob = async () => {
    const newStatus = !cronStatus.running;
    try {
      const res = await fetch('/api/reporting/cron', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ running: newStatus }),
      });

      const data = await res.json();
      if (data.success) {
        setCronStatus(prev => ({ ...prev, running: newStatus }));
        showNotification('success', data.message);
      } else {
        showNotification('error', data.error || 'Failed to toggle cron job');
      }
    } catch (error) {
      console.error('Failed to toggle cron job:', error);
      showNotification('error', 'Network error while toggling cron job');
    }
  };

  const downloadReport = (filename: string, type: 'pdf' | 'csv') => {
    // In a real implementation, this would download the actual file
    // For now, we'll show a notification
    showNotification('info', `Downloading ${filename}.${type}...`);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 relative"
    >
      {/* Notification Toast */}
      <AnimatePresence>
        {notifications.show && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-3 ${
              notifications.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
              notifications.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
              'bg-blue-50 text-blue-800 border border-blue-200'
            }`}
          >
            {notifications.type === 'success' && <FiCheckCircle className="w-5 h-5" />}
            {notifications.type === 'error' && <FiAlertCircle className="w-5 h-5" />}
            {notifications.type === 'info' && <FiBell className="w-5 h-5" />}
            <span>{notifications.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
          whileHover={{ y: -2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <FiCalendar className="w-8 h-8 text-indigo-600" />
            <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-semibold">
              {schedule.frequency?.toUpperCase() || 'DAILY'}
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Report Schedule</h3>
          <p className="text-gray-600 text-sm mb-4">
            Automatic reports sent {schedule.frequency} at {schedule.time}
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Next run:</span>
            <span className="font-bold text-gray-900">
              {loading.cron ? <FiLoader className="animate-spin inline" /> : cronStatus.nextRun}
            </span>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
          whileHover={{ y: -2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <FiMail className="w-8 h-8 text-indigo-600" />
            <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-semibold">
              {emailRecipients.filter(r => r.enabled).length} RECIPIENTS
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Email Distribution</h3>
          <p className="text-gray-600 text-sm mb-4">
            Reports automatically sent to configured recipients
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Last sent:</span>
            <span className="font-bold text-gray-900">
              {loading.cron ? <FiLoader className="animate-spin inline" /> : cronStatus.lastRun}
            </span>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
          whileHover={{ y: -2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <FiSettings className="w-8 h-8 text-indigo-600" />
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              cronStatus.running ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {cronStatus.running ? 'ACTIVE' : 'PAUSED'}
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Cron Job Status</h3>
          <p className="text-gray-600 text-sm mb-4">
            Automated report generation service
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleCronJob}
              disabled={loading.cron}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center gap-2 ${
                cronStatus.running 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading.cron ? (
                <FiLoader className="animate-spin" />
              ) : cronStatus.running ? (
                <FiPause className="w-4 h-4" />
              ) : (
                <FiPlay className="w-4 h-4" />
              )}
              {cronStatus.running ? 'Pause' : 'Start'}
            </button>
            <button
              onClick={generateReport}
              disabled={loading.generate}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-semibold text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loading.generate ? <FiLoader className="animate-spin" /> : <FiRefreshCw className="w-4 h-4" />}
              Run Now
            </button>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Date Range */}
          <motion.div 
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FiCalendar className="w-5 h-5 text-indigo-600" />
                Report Date Range
              </h3>
              <button
                onClick={generateReport}
                disabled={loading.generate}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
              >
                {loading.generate ? <FiLoader className="animate-spin" /> : <FiSend className="w-4 h-4" />}
                Generate Report
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={reportDateRange.start}
                  onChange={(e) => setReportDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  max={reportDateRange.end}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={reportDateRange.end}
                  onChange={(e) => setReportDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  min={reportDateRange.start}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Reports will include data from selected range</span>
            </div>
          </motion.div>

          {/* Format Settings */}
          <motion.div 
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FiSettings className="w-5 h-5 text-indigo-600" />
                Report Format Settings
              </h3>
              <button
                onClick={saveFormat}
                disabled={loading.format}
                className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
              >
                {loading.format ? <FiLoader className="animate-spin" /> : <FiSave className="w-4 h-4" />}
                Save Format
              </button>
            </div>

            <div className="space-y-4">
              {Object.entries(reportFormat).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-gray-700">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                    <p className="text-sm text-gray-500">
                      {key === 'includeImages' && 'Include annotated defect images'}
                      {key === 'includeCharts' && 'Include trend charts and graphs'}
                      {key === 'includeRawData' && 'Include raw detection data'}
                      {key === 'pdfFormat' && 'Generate PDF version'}
                      {key === 'csvFormat' && 'Generate CSV data export'}
                    </p>
                  </div>
                  <button
                    onClick={() => setReportFormat(prev => ({ ...prev, [key]: !value }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                      value ? 'bg-indigo-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        value ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Reports */}
          <motion.div 
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FiFileText className="w-5 h-5 text-indigo-600" />
              Recent Reports
            </h3>

            {loading.reports ? (
              <div className="flex justify-center py-8">
                <FiLoader className="w-8 h-8 text-indigo-600 animate-spin" />
              </div>
            ) : generatedReports.length > 0 ? (
              <div className="space-y-3">
                {generatedReports.map((report) => (
                  <div
                    key={report._id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        report.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        <FiFileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">
                          {new Date(report.startDate).toLocaleDateString()} - {new Date(report.endDate).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatFileSize(report.size)} • {report.recipients.length} recipients
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => downloadReport(report.filename, 'pdf')}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Download PDF"
                      >
                        <FiDownloadCloud className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => downloadReport(report.filename, 'csv')}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Download CSV"
                      >
                        <FiDownload className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => {
                        const newPage = pagination.page - 1;
                        setPagination(prev => ({ ...prev, page: newPage }));
                        fetchGeneratedReports(newPage);
                      }}
                      disabled={pagination.page === 1}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <button
                      onClick={() => {
                        const newPage = pagination.page + 1;
                        setPagination(prev => ({ ...prev, page: newPage }));
                        fetchGeneratedReports(newPage);
                      }}
                      disabled={pagination.page === pagination.pages}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FiFileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No reports generated yet</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Email Recipients */}
          <motion.div 
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FiMail className="w-5 h-5 text-indigo-600" />
                Email Recipients
              </h3>
              <button
                onClick={sendTestReport}
                disabled={loading.test || emailRecipients.filter(r => r.enabled).length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
              >
                {loading.test ? <FiLoader className="animate-spin" /> : <FiSend className="w-4 h-4" />}
                Send Test
              </button>
            </div>

            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FiUsers className="w-4 h-4" />
                Add New Recipient
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Name"
                  value={newRecipient.name}
                  onChange={(e) => setNewRecipient(prev => ({ ...prev, name: e.target.value }))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={newRecipient.email}
                  onChange={(e) => setNewRecipient(prev => ({ ...prev, email: e.target.value }))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={addRecipient}
                className="mt-3 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-sm font-semibold flex items-center gap-2"
              >
                <FiMail className="w-4 h-4" />
                Add Recipient
              </button>
            </div>

            {loading.recipients ? (
              <div className="flex justify-center py-8">
                <FiLoader className="w-8 h-8 text-indigo-600 animate-spin" />
              </div>
            ) : (
              <>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                  {emailRecipients.map((recipient) => (
                    <div
                      key={recipient._id || recipient.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          recipient.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          <FiMail className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{recipient.name}</div>
                          <div className="text-sm text-gray-600">{recipient.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleRecipient(recipient._id || recipient.id, recipient.enabled)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                            recipient.enabled
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {recipient.enabled ? 'Enabled' : 'Disabled'}
                        </button>
                        <button
                          onClick={() => removeRecipient(recipient._id || recipient.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => {
                        const newPage = pagination.page - 1;
                        setPagination(prev => ({ ...prev, page: newPage }));
                        fetchRecipients(newPage);
                      }}
                      disabled={pagination.page === 1}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <button
                      onClick={() => {
                        const newPage = pagination.page + 1;
                        setPagination(prev => ({ ...prev, page: newPage }));
                        fetchRecipients(newPage);
                      }}
                      disabled={pagination.page === pagination.pages}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </motion.div>

          {/* Schedule Configuration */}
          <motion.div 
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FiClock className="w-5 h-5 text-indigo-600" />
                Schedule Configuration
              </h3>
              <button
                onClick={saveSchedule}
                disabled={loading.schedule}
                className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
              >
                {loading.schedule ? <FiLoader className="animate-spin" /> : <FiSave className="w-4 h-4" />}
                Save Schedule
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frequency
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {(['daily', 'weekly', 'monthly', 'custom'] as const).map((freq) => (
                    <button
                      key={freq}
                      onClick={() => setSchedule(prev => ({ ...prev, frequency: freq }))}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        schedule.frequency === freq
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {freq.charAt(0).toUpperCase() + freq.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time of Day
                </label>
                <input
                  type="time"
                  value={schedule.time}
                  onChange={(e) => setSchedule(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {schedule.frequency === 'weekly' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Day of Week
                  </label>
                  <select
                    value={schedule.dayOfWeek}
                    onChange={(e) => setSchedule(prev => ({ ...prev, dayOfWeek: parseInt(e.target.value) }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value={1}>Monday</option>
                    <option value={2}>Tuesday</option>
                    <option value={3}>Wednesday</option>
                    <option value={4}>Thursday</option>
                    <option value={5}>Friday</option>
                    <option value={6}>Saturday</option>
                    <option value={0}>Sunday</option>
                  </select>
                </div>
              )}

              {schedule.frequency === 'monthly' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Day of Month
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={schedule.dayOfMonth}
                    onChange={(e) => setSchedule(prev => ({ ...prev, dayOfMonth: parseInt(e.target.value) }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Cron Expression</span>
                <code className="px-3 py-1 bg-gray-100 rounded font-mono text-gray-800">
                  {schedule.frequency === 'daily' ? '0 8 * * *' :
                   schedule.frequency === 'weekly' ? `0 8 * * ${schedule.dayOfWeek}` :
                   schedule.frequency === 'monthly' ? `0 8 ${schedule.dayOfMonth} * *` :
                   'custom'}
                </code>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Actions Bar */}
      <motion.div 
        className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-800">Report Actions</h3>
            <p className="text-sm text-gray-600">Manually trigger reports or download existing ones</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchGeneratedReports(1)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <FiRefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={saveSchedule}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold flex items-center gap-2"
            >
              <FiSave className="w-4 h-4" />
              Save All Settings
            </button>
          </div>
        </div>
      </motion.div>

      {/* Status Bar */}
      <div className="text-center text-sm text-gray-500">
        <p className="flex items-center justify-center gap-2">
          <FiActivity className={`w-4 h-4 ${cronStatus.running ? "text-green-500" : "text-red-500"}`} />
          <span className="font-semibold">Cron Job Status:</span>{" "}
          <span className={cronStatus.running ? "text-green-600" : "text-red-600"}>
            {cronStatus.running ? "● ACTIVE" : "● PAUSED"}
          </span>
          {" • "}
          <span className="font-mono">Next run: {cronStatus.nextRun}</span>
          {" • "}
          <span className="font-mono">Last run: {cronStatus.lastRun}</span>
        </p>
      </div>
    </motion.div>
  );
};

// Helper component for animations
const AnimatePresence: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export default DefectReportingTab;