import React, { useState } from 'react';
import {
  SearchCode,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Upload,
  FileCode,
  Play,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
} from 'lucide-react';
import { useRouter } from '../context/RouterContext';
import { useScan } from '../context/ScanContext';
import {
  HIGH_RISK_SAMPLE_CONFIG,
  MODERATE_SAMPLE_CONFIG,
  SECURE_SAMPLE_CONFIG,
} from '../scanner/sampleData';
import { CloudConfiguration } from '../scanner/types';
import { validateConfigurationJson, validateFileBasics } from '../scanner/validation';

export const ScannerPage: React.FC = () => {
  const { executeScan } = useScan();
  const { navigate } = useRouter();

  const [mode, setMode] = useState<'demo' | 'upload'>('demo');
  const [selectedDemo, setSelectedDemo] = useState<'secure' | 'moderate' | 'high'>('secure');

  // Custom upload state
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [jsonText, setJsonText] = useState<string>('');
  const [validatedConfig, setValidatedConfig] = useState<CloudConfiguration | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [copied, setCopied] = useState(false);

  const getDemoConfig = (type: 'secure' | 'moderate' | 'high'): CloudConfiguration => {
    if (type === 'secure') return SECURE_SAMPLE_CONFIG;
    if (type === 'moderate') return MODERATE_SAMPLE_CONFIG;
    return HIGH_RISK_SAMPLE_CONFIG;
  };

  const handleSelectDemo = (type: 'secure' | 'moderate' | 'high') => {
    setSelectedDemo(type);
    setValidationErrors([]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setValidationErrors([]);
    setValidatedConfig(null);

    const basicCheck = validateFileBasics(file);
    if (!basicCheck.valid) {
      setValidationErrors([basicCheck.error || 'Invalid file format.']);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonText(content);
      const res = validateConfigurationJson(content);
      if (res.valid) {
        setValidatedConfig(res.config);
      } else {
        setValidationErrors(res.errors);
      }
    };
    reader.onerror = () => {
      setValidationErrors(['Error reading uploaded file.']);
    };
    reader.readAsText(file);
  };

  const handleRunScan = async () => {
    setIsScanning(true);
    try {
      let targetConfig: CloudConfiguration;
      let label = '';

      if (mode === 'demo') {
        targetConfig = getDemoConfig(selectedDemo);
        label = targetConfig.configuration_name || `${selectedDemo.toUpperCase()} Demo`;
      } else {
        if (!validatedConfig) {
          setIsScanning(false);
          return;
        }
        targetConfig = validatedConfig;
        label = targetConfig.configuration_name || uploadedFileName || 'Uploaded Configuration';
      }

      await executeScan(targetConfig, label);
      navigate('/dashboard');
    } finally {
      setIsScanning(false);
    }
  };

  const activeJson =
    mode === 'demo'
      ? JSON.stringify(getDemoConfig(selectedDemo), null, 2)
      : jsonText || '// Upload a valid .json configuration file to inspect its structure';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(activeJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5 pb-8 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <SearchCode className="w-5 h-5 text-cyan-400" />
          <span>Configuration Scanner</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Select a predefined cloud configuration or upload a custom JSON file to test the 6 security rules.
        </p>
      </div>

      {/* Mode Tabs */}
      <div className="flex border-b border-slate-800 text-xs font-medium">
        <button
          onClick={() => {
            setMode('demo');
            setValidationErrors([]);
          }}
          className={`pb-2.5 px-3 flex items-center gap-2 transition-colors cursor-pointer ${
            mode === 'demo'
              ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Mode 1: Demo Configuration</span>
        </button>

        <button
          onClick={() => {
            setMode('upload');
            setValidationErrors([]);
          }}
          className={`pb-2.5 px-3 flex items-center gap-2 transition-colors cursor-pointer ${
            mode === 'upload'
              ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Mode 2: Upload JSON File</span>
        </button>
      </div>

      {/* Mode 1: Pre-packaged Demo Cards */}
      {mode === 'demo' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => handleSelectDemo('secure')}
            className={`p-3.5 rounded-lg text-left border transition-all cursor-pointer ${
              selectedDemo === 'secure'
                ? 'bg-slate-900 border-cyan-500 shadow-sm'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono font-bold text-emerald-400">
                BENCHMARK 1
              </span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="font-semibold text-white text-xs">Secure Config</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              All 6 checks pass. MFA, encryption, restricted SSH, and logging enabled.
            </p>
            <div className="mt-2 text-[11px] font-mono text-emerald-400 font-bold">
              Expected Score: 100/100
            </div>
          </button>

          <button
            onClick={() => handleSelectDemo('moderate')}
            className={`p-3.5 rounded-lg text-left border transition-all cursor-pointer ${
              selectedDemo === 'moderate'
                ? 'bg-slate-900 border-amber-500 shadow-sm'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono font-bold text-amber-400">
                BENCHMARK 2
              </span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <h3 className="font-semibold text-white text-xs">Moderate Risk Config</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Storage encryption disabled and audit logging disabled (2 checks fail).
            </p>
            <div className="mt-2 text-[11px] font-mono text-amber-400 font-bold">
              Expected Score: 90/100
            </div>
          </button>

          <button
            onClick={() => handleSelectDemo('high')}
            className={`p-3.5 rounded-lg text-left border transition-all cursor-pointer ${
              selectedDemo === 'high'
                ? 'bg-slate-900 border-rose-500 shadow-sm'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono font-bold text-rose-400">
                BENCHMARK 3
              </span>
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            </div>
            <h3 className="font-semibold text-white text-xs">High Risk Config</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Public storage, wildcards, MFA off, open SSH, no encryption or logging.
            </p>
            <div className="mt-2 text-[11px] font-mono text-rose-400 font-bold">
              Expected Score: 50/100
            </div>
          </button>
        </div>
      )}

      {/* Mode 2: Upload Zone */}
      {mode === 'upload' && (
        <div className="space-y-3">
          <div className="p-5 rounded-xl bg-slate-900 border-2 border-dashed border-slate-700 hover:border-cyan-500 text-center">
            <Upload className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
            <h3 className="text-xs font-semibold text-white">
              Upload Simulated Configuration JSON
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
              Only standard .json files under 2 MB are accepted. Uploaded data is parsed directly in your browser.
            </p>

            <label className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>Select File (.json)</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {uploadedFileName && (
              <p className="mt-2 text-xs font-mono text-cyan-300">
                Selected: {uploadedFileName}
              </p>
            )}
          </div>

          {validationErrors.length > 0 && (
            <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800 text-xs text-rose-300 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-rose-400">
                <XCircle className="w-4 h-4 shrink-0" />
                <span>Validation Errors:</span>
              </div>
              <ul className="list-disc list-inside text-rose-200 text-[11px]">
                {validationErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {validatedConfig && (
            <div className="p-2.5 rounded-lg bg-emerald-950/50 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Valid JSON. Ready to scan: <strong>{validatedConfig.configuration_name}</strong></span>
            </div>
          )}
        </div>
      )}

      {/* JSON Payload Preview Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-3.5 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
            <FileCode className="w-3.5 h-3.5 text-cyan-400" />
            <span>Configuration Preview</span>
          </div>

          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-900 border border-slate-800 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy JSON</span>
              </>
            )}
          </button>
        </div>

        <div className="p-3.5 bg-slate-950/70 max-h-64 overflow-y-auto">
          <pre className="text-xs font-mono text-cyan-200 leading-relaxed overflow-x-auto">
            {activeJson}
          </pre>
        </div>

        {/* Action Button Bar */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3">
          <span className="text-[11px] text-slate-400">
            Evaluates 6 core rules: Public Storage, Encryption, MFA, Wildcards, SSH, and Logging.
          </span>

          <button
            onClick={handleRunScan}
            disabled={isScanning || (mode === 'upload' && !validatedConfig)}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isScanning ? 'Scanning...' : 'Run Security Scan'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
