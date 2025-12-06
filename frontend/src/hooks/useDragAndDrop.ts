import { useState, useEffect } from 'react';
import { ScanResponse } from '../services/api';

const STORAGE_KEY = 'osint_scan_order';

export const useDragAndDrop = (scans: ScanResponse[]) => {
  const [orderedScanIds, setOrderedScanIds] = useState<number[]>([]);

  useEffect(() => {
    const savedOrder = localStorage.getItem(STORAGE_KEY);
    if (savedOrder) {
      try {
        const parsed = JSON.parse(savedOrder);
        setOrderedScanIds(parsed);
      } catch (e) {
        // Invalid saved order, ignore
      }
    }
  }, []);

  const getOrderedScans = (): ScanResponse[] => {
    if (orderedScanIds.length === 0) {
      return scans;
    }

    const scanMap = new Map(scans.map(scan => [scan.id, scan]));
    const ordered: ScanResponse[] = [];
    const remaining = new Set(scans.map(scan => scan.id));

    // Add scans in saved order
    orderedScanIds.forEach(id => {
      const scan = scanMap.get(id);
      if (scan) {
        ordered.push(scan);
        remaining.delete(id);
      }
    });

    // Add remaining scans
    remaining.forEach(id => {
      const scan = scanMap.get(id);
      if (scan) {
        ordered.push(scan);
      }
    });

    return ordered;
  };

  const updateOrder = (newOrder: number[]) => {
    setOrderedScanIds(newOrder);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newOrder));
  };

  return {
    orderedScans: getOrderedScans(),
    updateOrder,
  };
};

