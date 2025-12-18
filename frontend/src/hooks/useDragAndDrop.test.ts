import { renderHook, act } from '@testing-library/react';
import { useDragAndDrop } from './useDragAndDrop';
import { ScanResponse } from '../services/api';

// Helper to create a mock ScanResponse satisfying the interface
const createMockScan = (id: number): ScanResponse => ({
    id,
    domain: `example${id}.com`,
    tool: 'THEHARVESTER',
    startTime: '2024-01-01T10:00:00',
    endTime: null,
    status: 'COMPLETED',
    results: null,
    errorMessage: null
});

describe('useDragAndDrop', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('initializes with provided items', () => {
        const items = [createMockScan(1), createMockScan(2)];
        const { result } = renderHook(() => useDragAndDrop(items));

        expect(result.current.orderedScans).toEqual(items);
    });

    it('updates items order', async () => {
        const items = [createMockScan(1), createMockScan(2), createMockScan(3)];
        const { result } = renderHook(() => useDragAndDrop(items));

        // Simulate new order: 2, 3, 1
        const newOrder = [2, 3, 1];

        await act(async () => {
            result.current.updateOrder(newOrder);
        });

        const ids = result.current.orderedScans.map(s => s.id);
        expect(ids).toEqual([2, 3, 1]);
    });

    it('persists order to localStorage', async () => {
        const items = [createMockScan(1), createMockScan(2)];
        const { result } = renderHook(() => useDragAndDrop(items));

        const newOrder = [2, 1];

        await act(async () => {
            result.current.updateOrder(newOrder);
        });

        const saved = JSON.parse(localStorage.getItem('osint_scan_order') || '[]');
        expect(saved).toEqual(newOrder);
    });

    it('handles corrupted localStorage data', () => {
        localStorage.setItem('osint_scan_order', 'invalid-json');
        const items = [createMockScan(1), createMockScan(2)];

        // Should not throw and fallback to default order
        const { result } = renderHook(() => useDragAndDrop(items));
        expect(result.current.orderedScans).toEqual(items);
    });

    it('appends new scans not in saved order', () => {
        localStorage.setItem('osint_scan_order', JSON.stringify([2, 1]));
        const items = [createMockScan(1), createMockScan(2), createMockScan(3)];

        const { result } = renderHook(() => useDragAndDrop(items));
        const ids = result.current.orderedScans.map(s => s.id);

        // 2 and 1 in order, 3 is new and should be appended
        expect(ids).toEqual([2, 1, 3]);
    });
});
