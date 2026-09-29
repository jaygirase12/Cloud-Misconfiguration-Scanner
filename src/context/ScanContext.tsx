import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '../firebase/authContext';
import { runSecurityScan } from '../scanner/scannerEngine';
import { SECURE_SAMPLE_CONFIG } from '../scanner/sampleData';
import { CloudConfiguration, ScanResult } from '../scanner/types';
import { deleteUserScan, loadUserScans, saveScanRecord } from '../services/scanHistoryService';

interface ScanContextType {
  currentScan: ScanResult | null;
  allScans: ScanResult[];
  loadingScans: boolean;
  selectedFindingId: string | null;
  setSelectedFindingId: (id: string | null) => void;
  setCurrentScan: (scan: ScanResult) => void;
  executeScan: (config: CloudConfiguration, name?: string) => Promise<ScanResult>;
  deleteScan: (scanId: string) => Promise<void>;
  refreshHistory: () => Promise<void>;
}

const ScanContext = createContext<ScanContextType | undefined>(undefined);

export const ScanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [currentScan, setCurrentScan] = useState<ScanResult | null>(null);
  const [allScans, setAllScans] = useState<ScanResult[]>([]);
  const [loadingScans, setLoadingScans] = useState<boolean>(false);
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);

  // Initialize with default demo scan if none exists
  useEffect(() => {
    if (!currentScan) {
      const initial = runSecurityScan(
        SECURE_SAMPLE_CONFIG,
        'Enterprise Baseline Hardened Configuration (Demo)'
      );
      setCurrentScan(initial);
    }
  }, [currentScan]);

  const refreshHistory = async () => {
    if (!user) return;
    setLoadingScans(true);
    try {
      const scans = await loadUserScans(user.uid);
      setAllScans(scans);
    } catch (err) {
      console.warn('Error loading scans:', err);
    } finally {
      setLoadingScans(false);
    }
  };

  useEffect(() => {
    if (user) {
      refreshHistory();
    } else {
      setAllScans([]);
    }
  }, [user]);

  const executeScan = async (
    config: CloudConfiguration,
    name?: string
  ): Promise<ScanResult> => {
    const result = runSecurityScan(config, name);
    setCurrentScan(result);

    if (user) {
      await saveScanRecord(user.uid, result);
      setAllScans((prev) => [result, ...prev.filter((s) => s.scanId !== result.scanId)]);
    }

    return result;
  };

  const deleteScan = async (scanId: string) => {
    if (!user) return;
    await deleteUserScan(user.uid, scanId);
    setAllScans((prev) => prev.filter((s) => s.scanId !== scanId));
    if (currentScan?.scanId === scanId) {
      const remaining = allScans.filter((s) => s.scanId !== scanId);
      if (remaining.length > 0) {
        setCurrentScan(remaining[0]);
      }
    }
  };

  return (
    <ScanContext.Provider
      value={{
        currentScan,
        allScans,
        loadingScans,
        selectedFindingId,
        setSelectedFindingId,
        setCurrentScan,
        executeScan,
        deleteScan,
        refreshHistory,
      }}
    >
      {children}
    </ScanContext.Provider>
  );
};

export const useScan = () => {
  const context = useContext(ScanContext);
  if (!context) {
    throw new Error('useScan must be used within a ScanProvider');
  }
  return context;
};
