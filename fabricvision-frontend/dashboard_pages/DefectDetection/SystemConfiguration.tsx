"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  FiSettings,
  FiSave,
  FiRefreshCw,
  FiBell,
  FiAlertCircle,
  FiServer,
  FiCpu,
  FiDatabase,
  FiCheck,
  FiX,
  FiZap,
  FiUpload,
  FiClock,
  FiMail,
  FiSmartphone
} from "react-icons/fi";

const SystemConfiguration: React.FC = () => {
  const [aiSettings, setAiSettings] = useState({
    yoloConfidence: 0.85,
    fusionMode: "weighted" as "weighted" | "priority" | "consensus",
    realtimeProcessing: true,
    enableDataAugmentation: false,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailAlerts: true,
    smsAlerts: false,
    pushNotifications: true,
    alertThreshold: "medium",
    silentHours: {
      enabled: true,
      start: "22:00",
      end: "06:00"
    }
  });

  const [storageSettings, setStorageSettings] = useState({
    retentionDays: 90,
    autoCleanup: true,
    compressImages: true,
    backupEnabled: true,
    backupInterval: 24
  });

  const [systemSettings, setSystemSettings] = useState({
    logLevel: "info",
    maxConcurrentJobs: 4,
    autoRestart: true,
    performanceMode: false
  });

  const saveSettings = () => {
    alert("Settings saved successfully!");
  };

  const resetToDefaults = () => {
    if (confirm("Reset all settings to defaults?")) {
      setAiSettings({
        yoloConfidence: 0.85,
        fusionMode: "weighted",
        realtimeProcessing: true,
        enableDataAugmentation: false,
      });
      setNotificationSettings({
        emailAlerts: true,
        smsAlerts: false,
        pushNotifications: true,
        alertThreshold: "medium",
        silentHours: {
          enabled: true,
          start: "22:00",
          end: "06:00"
        }
      });
      setStorageSettings({
        retentionDays: 90,
        autoCleanup: true,
        compressImages: true,
        backupEnabled: true,
        backupInterval: 24
      });
      setSystemSettings({
        logLevel: "info",
        maxConcurrentJobs: 4,
        autoRestart: true,
        performanceMode: false
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Configuration</h2>
          <p className="text-gray-600">Configure defect detection parameters and system settings</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={resetToDefaults}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors"
          >
            <FiRefreshCw className="w-4 h-4" />
            Reset Defaults
          </button>
          <button
            onClick={saveSettings}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 transition-colors"
          >
            <FiSave className="w-4 h-4" />
            Save All Settings
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
          className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <FiCpu className="w-6 h-6 text-indigo-600" />
            <h3 className="text-lg font-bold text-gray-800">AI Model Settings</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                YOLOv9 Confidence Threshold
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0.5"
                  max="0.95"
                  step="0.05"
                  value={aiSettings.yoloConfidence}
                  onChange={(e) => setAiSettings(prev => ({ ...prev, yoloConfidence: parseFloat(e.target.value) }))}
                  className="flex-1"
                />
                <span className="w-16 text-center font-semibold text-gray-900">
                  {(aiSettings.yoloConfidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Fusion Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["weighted", "priority", "consensus"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setAiSettings(prev => ({ ...prev, fusionMode: mode }))}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      aiSettings.fusionMode === mode
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-gray-700">Real-time Processing</span>
                <p className="text-sm text-gray-500">Process defects in real-time</p>
              </div>
              <button
                onClick={() => setAiSettings(prev => ({ ...prev, realtimeProcessing: !prev.realtimeProcessing }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  aiSettings.realtimeProcessing ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    aiSettings.realtimeProcessing ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-gray-700">Data Augmentation</span>
                <p className="text-sm text-gray-500">Enable training data augmentation</p>
              </div>
              <button
                onClick={() => setAiSettings(prev => ({ ...prev, enableDataAugmentation: !prev.enableDataAugmentation }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  aiSettings.enableDataAugmentation ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    aiSettings.enableDataAugmentation ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <FiBell className="w-6 h-6 text-indigo-600" />
            <h3 className="text-lg font-bold text-gray-800">Notification Settings</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FiMail className="w-5 h-5 text-gray-600" />
                <div>
                  <span className="font-medium text-gray-700">Email Alerts</span>
                  <p className="text-sm text-gray-500">Send defect alerts via email</p>
                </div>
              </div>
              <button
                onClick={() => setNotificationSettings(prev => ({ ...prev, emailAlerts: !prev.emailAlerts }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationSettings.emailAlerts ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    notificationSettings.emailAlerts ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FiSmartphone className="w-5 h-5 text-gray-600" />
                <div>
                  <span className="font-medium text-gray-700">Push Notifications</span>
                  <p className="text-sm text-gray-500">Mobile app notifications</p>
                </div>
              </div>
              <button
                onClick={() => setNotificationSettings(prev => ({ ...prev, pushNotifications: !prev.pushNotifications }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationSettings.pushNotifications ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    notificationSettings.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alert Threshold
              </label>
              <select
                value={notificationSettings.alertThreshold}
                onChange={(e) => setNotificationSettings(prev => ({ 
                  ...prev, 
                  alertThreshold: e.target.value 
                }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="low">Low (All defects)</option>
                <option value="medium">Medium (Medium+ severity)</option>
                <option value="high">High (High severity only)</option>
              </select>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <FiClock className="w-5 h-5 text-gray-600" />
                  <div>
                    <span className="font-medium text-gray-700">Silent Hours</span>
                    <p className="text-sm text-gray-500">Mute notifications during specified hours</p>
                  </div>
                </div>
                <button
                  onClick={() => setNotificationSettings(prev => ({ 
                    ...prev, 
                    silentHours: { ...prev.silentHours, enabled: !prev.silentHours.enabled }
                  }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notificationSettings.silentHours.enabled ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      notificationSettings.silentHours.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {notificationSettings.silentHours.enabled && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-600">Start Time</label>
                    <input
                      type="time"
                      value={notificationSettings.silentHours.start}
                      onChange={(e) => setNotificationSettings(prev => ({
                        ...prev,
                        silentHours: { ...prev.silentHours, start: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">End Time</label>
                    <input
                      type="time"
                      value={notificationSettings.silentHours.end}
                      onChange={(e) => setNotificationSettings(prev => ({
                        ...prev,
                        silentHours: { ...prev.silentHours, end: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <FiDatabase className="w-6 h-6 text-indigo-600" />
            <h3 className="text-lg font-bold text-gray-800">Storage Settings</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Retention Period (days)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="7"
                  max="365"
                  step="7"
                  value={storageSettings.retentionDays}
                  onChange={(e) => setStorageSettings(prev => ({ 
                    ...prev, 
                    retentionDays: parseInt(e.target.value) 
                  }))}
                  className="flex-1"
                />
                <span className="w-20 text-center">
                  <span className="font-semibold text-gray-900">{storageSettings.retentionDays}</span>
                  <span className="text-gray-600 ml-1">days</span>
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FiUpload className="w-5 h-5 text-gray-600" />
                <div>
                  <span className="font-medium text-gray-700">Auto Cleanup</span>
                  <p className="text-sm text-gray-500">Automatically delete old data</p>
                </div>
              </div>
              <button
                onClick={() => setStorageSettings(prev => ({ ...prev, autoCleanup: !prev.autoCleanup }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  storageSettings.autoCleanup ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    storageSettings.autoCleanup ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FiSave className="w-5 h-5 text-gray-600" />
                <div>
                  <span className="font-medium text-gray-700">Compress Images</span>
                  <p className="text-sm text-gray-500">Reduce storage usage</p>
                </div>
              </div>
              <button
                onClick={() => setStorageSettings(prev => ({ ...prev, compressImages: !prev.compressImages }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  storageSettings.compressImages ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    storageSettings.compressImages ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Backup Interval (hours)
              </label>
              <select
                value={storageSettings.backupInterval}
                onChange={(e) => setStorageSettings(prev => ({ 
                  ...prev, 
                  backupInterval: parseInt(e.target.value) 
                }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value={1}>1 hour</option>
                <option value={6}>6 hours</option>
                <option value={12}>12 hours</option>
                <option value={24}>24 hours</option>
                <option value={168}>Weekly</option>
              </select>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              <span className="font-semibold">Storage Estimate:</span> 
              {" "}Approximately {Math.round((storageSettings.retentionDays * 50) / 1024)} GB required for {storageSettings.retentionDays} days retention.
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <FiServer className="w-6 h-6 text-indigo-600" />
            <h3 className="text-lg font-bold text-gray-800">System Settings</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Log Level
              </label>
              <select
                value={systemSettings.logLevel}
                onChange={(e) => setSystemSettings(prev => ({ ...prev, logLevel: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="debug">Debug</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Concurrent Jobs
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={systemSettings.maxConcurrentJobs}
                onChange={(e) => setSystemSettings(prev => ({ ...prev, maxConcurrentJobs: parseInt(e.target.value) }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FiRefreshCw className="w-5 h-5 text-gray-600" />
                <div>
                  <span className="font-medium text-gray-700">Auto Restart</span>
                  <p className="text-sm text-gray-500">Restart service on failure</p>
                </div>
              </div>
              <button
                onClick={() => setSystemSettings(prev => ({ ...prev, autoRestart: !prev.autoRestart }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  systemSettings.autoRestart ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    systemSettings.autoRestart ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FiZap className="w-5 h-5 text-gray-600" />
                <div>
                  <span className="font-medium text-gray-700">Performance Mode</span>
                  <p className="text-sm text-gray-500">Optimize for speed over accuracy</p>
                </div>
              </div>
              <button
                onClick={() => setSystemSettings(prev => ({ ...prev, performanceMode: !prev.performanceMode }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  systemSettings.performanceMode ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    systemSettings.performanceMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div 
        className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">System Status</h3>
            <p className="text-gray-600">
              All systems operational. Configuration changes will take effect immediately.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">99.9%</div>
              <div className="text-gray-600 text-sm">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">0.42s</div>
              <div className="text-gray-600 text-sm">Avg. Response</div>
            </div>
            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors">
              System Check
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SystemConfiguration;