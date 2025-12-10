import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { useScans } from './useScans';
import { server } from '../mocks/server';
import { rest } from 'msw';

describe('useScans', () => {
    it('fetches scans on mount', async () => {
        const { result } = renderHook(() => useScans());

        // Initial state
        expect(result.current.loading).toBe(true);
        expect(result.current.scans).toEqual([]);

        // After fetch
        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.scans).toHaveLength(2); // Based on handlers.ts mock
        expect(result.current.scans[0].domain).toBe('example.com');
    });

    it('initiates scan successfully', async () => {
        const { result } = renderHook(() => useScans());

        await waitFor(() => expect(result.current.loading).toBe(false));

        let newScan;
        await act(async () => {
            newScan = await result.current.initiateScan('new.com', 'THEHARVESTER');
        });

        expect(newScan).toBeDefined();
        // Verify it updates local state (optimistic or after refetch)
        // The hook implementation does setScans(prev => [newScan, ...prev])
        expect(result.current.scans).toHaveLength(3);
        expect(result.current.scans[0].domain).toBe('new.com');
    });

    it('handles fetch error', async () => {
        server.use(
            rest.get('http://localhost:8080/api/scans', (req, res, ctx) => {
                return res(ctx.status(500));
            })
        );

        const { result } = renderHook(() => useScans());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        // Expect scan list to optionally be empty or error state set
        // The hook sets error state
        expect(result.current.error).toBe('Request failed with status code 500');
    });
});
