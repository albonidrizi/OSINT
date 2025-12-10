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

    it('updates items order', () => {
        const items = [createMockScan(1), createMockScan(2), createMockScan(3)];
        const { result } = renderHook(() => useDragAndDrop(items));

        // Simulate new order: 2, 3, 1
        const newOrder = [2, 3, 1];

        act(() => {
            result.current.updateOrder(newOrder);
        });

        const ids = result.current.orderedScans.map(s => s.id);
        expect(ids).toEqual([2, 3, 1]);
    });

    it('persists order to localStorage', () => {
        const items = [createMockScan(1), createMockScan(2)];
        const { result } = renderHook(() => useDragAndDrop(items));

        const newOrder = [2, 1];

        act(() => {
            result.current.updateOrder(newOrder);
        });

        const saved = JSON.parse(localStorage.getItem('osint_scan_order') || '[]');
        expect(saved).toEqual(newOrder);
    });
});
