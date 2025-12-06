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
    const interval = setInterval(fetchScans, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [fetchScans]);

  const initiateScan = async (domain: string, tool: 'THEHARVESTER' | 'AMASS', limit?: number, sources?: string) => {
    try {
      const newScan = await scanApi.initiateScan({ domain, tool, limit, sources });
      setScans(prev => [newScan, ...prev]);
      return newScan;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to initiate scan');
    }
  };

  return { scans, loading, error, initiateScan, refreshScans: fetchScans };
};

