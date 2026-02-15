import { useState, useEffect } from 'react';
import { Upload, Download, Cloud, HardDrive, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  getGoogleApiConfig,
  saveGoogleApiConfig,
  exportAllData,
  importAllData,
  getStudents,
  getTeachers,
  getFeeRecords,
  getSalaryPayments,
  getClasses,
  getFeeHeads,
  getSchoolInfo,
  getAcademicYears
} from '../../store';
import { syncAllData, performHardWriteTest } from '../../utils/googleApi';

export function BackupSettings() {
  const [config, setConfig] = useState(getGoogleApiConfig());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleLocalExport = () => {
    const data = exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SchoolFeeManager-Backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleLocalImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = importAllData(content);
      if (result.success) {
        setSuccess('Data imported successfully!');
        window.location.reload();
      } else {
        setError(result.message || 'Invalid backup file');
      }
    };
    reader.readAsText(file);
  };

  const handleGoogleSync = async () => {
    if (!config.spreadsheetId || !config.credentialsJson) {
      setError('Google API not configured');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await syncAllData(config.spreadsheetId, config.credentialsJson);
      setSuccess('Synced to Google Sheets successfully!');
      saveGoogleApiConfig({ ...config, lastSyncAt: new Date().toISOString() });
    } catch (err: any) {
      setError(err.message || 'Sync failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Backup & Restore</h1>
          <p className="text-gray-600 mt-1">Protect your data with local and cloud backups</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <p className="text-green-700">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <HardDrive className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Local Backup</h2>
          </div>
          <p className="text-gray-600 mb-6">
            Save your data to a JSON file on this computer. You can use this file to restore your data later.
          </p>
          <div className="flex flex-col gap-3">
            <Button onClick={handleLocalExport} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Export Data (.json)
            </Button>
            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={handleLocalImport}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button variant="secondary" className="w-full">
                <Upload className="w-4 h-4 mr-2" />
                Import Data (.json)
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Cloud className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold">Google Cloud Sync</h2>
          </div>
          <p className="text-gray-600 mb-6">
            Automatically sync your data to Google Sheets. This requires a Google Service Account.
          </p>
          <div className="space-y-4">
            <Button
              onClick={handleGoogleSync}
              disabled={loading || !config.isEnabled}
              className="w-full"
            >
              {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              Sync to Google Sheets
            </Button>
            
            {!config.isEnabled && (
              <p className="text-sm text-amber-600 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                Google API is not configured in Settings
              </p>
            )}

            {config.lastSyncAt && (
              <p className="text-xs text-gray-500 text-center">
                Last synced: {new Date(config.lastSyncAt).toLocaleString()}
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
