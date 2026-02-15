import { useState } from 'react';
import { Cloud, Save, RefreshCw, AlertTriangle, CheckCircle2, ShieldCheck, Database } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { getGoogleApiConfig, saveGoogleApiConfig } from '../../store';
import { syncAllData, performHardWriteTest } from '../../utils/googleApi';

export function GoogleApiSettings() {
  const [config, setConfig] = useState(getGoogleApiConfig());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [syncResults, setSyncResults] = useState<any>(null);

  const handleSaveConfig = () => {
    saveGoogleApiConfig(config);
    setSuccess('Configuration saved successfully!');
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleTestConnection = async () => {
    if (!config.spreadsheetId || !config.credentialsJson) {
      setError('Spreadsheet ID and Credentials are required');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('[UI] EXECUTING HARD WRITE TEST...');
      await performHardWriteTest(config.spreadsheetId, config.credentialsJson);
      setSuccess('DEBUG: Test row successfully appended to Settings sheet.');
    } catch (err: any) {
      console.error('[UI] Hard write test failed:', err);
      setError(err.message || 'Debug test failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncNow = async () => {
    if (!config.spreadsheetId || !config.credentialsJson) {
      setError('Spreadsheet ID and Credentials are required');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const results = await syncAllData(config.spreadsheetId, config.credentialsJson);
      setSyncResults(results);
      setSuccess('Full synchronization complete!');
      
      const updatedConfig = { ...config, lastSyncAt: new Date().toISOString() };
      setConfig(updatedConfig);
      saveGoogleApiConfig(updatedConfig);
    } catch (err: any) {
      setError(err.message || 'Sync failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      try {
        const creds = JSON.parse(content);
        if (!creds.client_email || !creds.private_key) {
          throw new Error('Invalid service account JSON');
        }
        setConfig({
          ...config,
          credentialsJson: content,
          clientEmail: creds.client_email,
          isEnabled: true
        });
      } catch (err) {
        setError('Invalid JSON file format');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Google API Integration</h1>
          <p className="text-gray-600 mt-1">Real-time backup and synchronization with Google Sheets</p>
        </div>
        <Button onClick={handleSaveConfig} disabled={loading}>
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-red-800 font-medium">Error</h3>
            <p className="text-red-700 text-sm font-mono mt-1">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-green-800 font-medium">Status</h3>
            <p className="text-green-700 text-sm mt-1">{success}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">1. Authentication</h2>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
              <p className="text-sm text-blue-800 leading-relaxed">
                Upload your <strong>Service Account JSON</strong> file.
                Ensure you've shared your spreadsheet with the service account email.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Credentials File</label>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
            </div>

            {config.clientEmail && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Connected Email</p>
                <p className="text-sm text-gray-800 font-mono break-all mt-1">{config.clientEmail}</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold">2. Spreadsheet Config</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Spreadsheet ID</label>
              <Input
                placeholder="Enter ID"
                value={config.spreadsheetId || ''}
                onChange={(e) => setConfig({ ...config, spreadsheetId: e.target.value })}
              />
            </div>

            <div className="pt-2 flex flex-col gap-3">
              <Button 
                variant="secondary" 
                onClick={handleTestConnection} 
                disabled={loading || !config.credentialsJson}
                className="w-full"
              >
                {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                DEBUG: Hard Write Test
              </Button>
              
              <Button 
                onClick={handleSyncNow} 
                disabled={loading || !config.spreadsheetId || !config.credentialsJson}
                className="w-full"
              >
                {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Cloud className="w-4 h-4 mr-2" />}
                Sync All Data Now
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {syncResults && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Sync Results</h2>
          <div className="flex gap-4">
            <Badge variant="info">{syncResults.students} Students</Badge>
            <Badge variant="info">{syncResults.teachers} Teachers</Badge>
          </div>
        </Card>
      )}
    </div>
  );
}
