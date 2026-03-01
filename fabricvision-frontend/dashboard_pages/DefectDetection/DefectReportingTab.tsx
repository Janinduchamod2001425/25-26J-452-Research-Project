"use client";

import React, { useState } from "react";
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
  FiActivity
} from "react-icons/fi";

interface EmailRecipient {
  id: string;
  name: string;
  email: string;
  enabled: boolean;
}

interface ReportSchedule {
  frequency: "daily" | "weekly" | "monthly" | "custom";
  time: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
}

const DefectReportingTab: React.FC = () => {
  const [reportDateRange, setReportDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  
  const [emailRecipients, setEmailRecipients] = useState<EmailRecipient[]>([
    { id: "1", name: "Quality Manager", email: "quality@fabric.com", enabled: true },
    { id: "2", name: "Production Head", email: "production@fabric.com", enabled: true },
    { id: "3", name: "Shift Supervisor A", email: "supervisor-a@fabric.com", enabled: false },
    { id: "4", name: "Shift Supervisor B", email: "supervisor-b@fabric.com", enabled: true },
  ]);
  
  const [schedule, setSchedule] = useState<ReportSchedule>({
    frequency: "daily",
    time: "08:00",
    dayOfWeek: 1
  });
  
  const [reportFormat, setReportFormat] = useState({
    includeImages: true,
    includeCharts: true,
    includeRawData: false,
    pdfFormat: true,
    csvFormat: true
  });
  
  const [cronStatus, setCronStatus] = useState<{
    running: boolean;
    lastRun: string;
    nextRun: string;
  }>({
    running: true,
    lastRun: "2026-01-15 08:00:00",
    nextRun: "2026-01-16 08:00:00"
  });
  
  const [newRecipient, setNewRecipient] = useState({ name: "", email: "" });

  const toggleRecipient = (id: string) => {
    setEmailRecipients(recipients =>
      recipients.map(recipient =>
        recipient.id === id
          ? { ...recipient, enabled: !recipient.enabled }
          : recipient
      )
    );
  };

  const addRecipient = () => {
    if (newRecipient.name && newRecipient.email) {
      setEmailRecipients([
        ...emailRecipients,
        {
          id: Date.now().toString(),
          name: newRecipient.name,
          email: newRecipient.email,
          enabled: true
        }
      ]);
      setNewRecipient({ name: "", email: "" });
    }
  };

  const removeRecipient = (id: string) => {
    setEmailRecipients(recipients =>
      recipients.filter(recipient => recipient.id !== id)
    );
  };

  const sendTestReport = () => {
    alert("Test report sent to all enabled recipients!");
  };

  const runReportNow = () => {
    alert("Generating report for selected date range...");
  };

  const toggleCronJob = () => {
    setCronStatus(prev => ({
      ...prev,
      running: !prev.running
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
          whileHover={{ y: -2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <FiCalendar className="w-8 h-8 text-indigo-600" />
            <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-semibold">
              {schedule.frequency.toUpperCase()}
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Report Schedule</h3>
          <p className="text-gray-600 text-sm mb-4">
            Automatic reports sent {schedule.frequency} at {schedule.time}
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Next run:</span>
            <span className="font-bold text-gray-900">{cronStatus.nextRun}</span>
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
            <span className="font-bold text-gray-900">{cronStatus.lastRun}</span>
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
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                cronStatus.running 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {cronStatus.running ? <FiPause className="inline mr-2" /> : <FiPlay className="inline mr-2" />}
              {cronStatus.running ? 'Pause' : 'Start'}
            </button>
            <button
              onClick={runReportNow}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-semibold text-sm transition-colors"
            >
              <FiRefreshCw className="inline mr-2" />
              Run Now
            </button>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
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
                onClick={runReportNow}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-semibold"
              >
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
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Reports will include data from selected range</span>
              <button className="text-indigo-600 hover:text-indigo-800 font-medium">
                Set as Default
              </button>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FiSettings className="w-5 h-5 text-indigo-600" />
              Report Format Settings
            </h3>

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
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
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
        </div>

        <div className="space-y-6">
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
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
              >
                Send Test Report
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
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={newRecipient.email}
                  onChange={(e) => setNewRecipient(prev => ({ ...prev, email: e.target.value }))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
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

            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {emailRecipients.map((recipient) => (
                <div
                  key={recipient.id}
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
                      onClick={() => toggleRecipient(recipient.id)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        recipient.enabled
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {recipient.enabled ? 'Enabled' : 'Disabled'}
                    </button>
                    <button
                      onClick={() => removeRecipient(recipient.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FiClock className="w-5 h-5 text-indigo-600" />
              Schedule Configuration
            </h3>

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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                   `0 8 ${schedule.dayOfMonth} * *`}
                </code>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

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
              onClick={() => alert("Downloading last 30 reports...")}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <FiDownload className="w-4 h-4" />
              Download Reports
            </button>
            <button
              onClick={() => alert("Notification preferences updated!")}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <FiBell className="w-4 h-4" />
              Notifications
            </button>
            <button
              onClick={() => {
                setReportDateRange({
                  start: new Date().toISOString().split('T')[0],
                  end: new Date().toISOString().split('T')[0]
                });
                alert("Settings saved successfully!");
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </motion.div>

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

export default DefectReportingTab;