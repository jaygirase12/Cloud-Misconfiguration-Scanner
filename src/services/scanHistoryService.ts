import { ScanResult } from '../scanner/types';

const LOCAL_STORAGE_PREFIX = 'cloudguard_scans_';

export async function saveScanRecord(
  userId: string,
  scan: ScanResult
): Promise<void> {
  // Store locally per user session (Firestore functionality not active yet)
  try {
    const key = `${LOCAL_STORAGE_PREFIX}${userId}`;
    const raw = localStorage.getItem(key);
    const list: ScanResult[] = raw ? JSON.parse(raw) : [];
    // Prepend new scan
    const updated = [scan, ...list.filter((s) => s.scanId !== scan.scanId)].slice(0, 50);
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (err) {
    console.warn('LocalStorage save error:', err);
  }
}

export async function loadUserScans(userId: string): Promise<ScanResult[]> {
  const localKey = `${LOCAL_STORAGE_PREFIX}${userId}`;
  let localList: ScanResult[] = [];
  try {
    const raw = localStorage.getItem(localKey);
    if (raw) {
      localList = JSON.parse(raw);
    }
  } catch {
    localList = [];
  }

  return localList;
}

export async function deleteUserScan(userId: string, scanId: string): Promise<void> {
  const key = `${LOCAL_STORAGE_PREFIX}${userId}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const list: ScanResult[] = JSON.parse(raw);
      const filtered = list.filter((s) => s.scanId !== scanId);
      localStorage.setItem(key, JSON.stringify(filtered));
    }
  } catch (err) {
    console.warn('LocalStorage delete notice:', err);
  }
}
