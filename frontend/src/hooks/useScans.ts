import { useState, useEffect, useCallback } from 'react';
import { scanApi, ScanResponse } from '../services/api';

export const useScans = () => {
  const [scans, setScans] = useState<ScanResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchScans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await scanApi.getAllScans();
      setScans(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch scans');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScans();

    // Only poll if there are running scans
    let interval: NodeJS.Timeout | null = null;
    const hasRunningScans = scans.some(scan => scan.status === 'RUNNING');

    if (hasRunningScans || scans.length === 0) {
      interval = setInterval(fetchScans, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fetchScans, scans.length > 0 && scans.some(s => s.status === 'RUNNING')]);

  const initiateScan = async (domain: string, tool: 'THEHARVESTER' | 'AMASS', limit?: number, sources?: string) => {
    try {
      const newScan = await scanApi.initiateScan({ domain, tool, limit, sources });
      setScans(prev => [newScan, ...prev]);
      return newScan;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to initiate scan';
      throw new Error(message);
    }
  };

  return { scans, loading, error, initiateScan, refreshScans: fetchScans };
};

