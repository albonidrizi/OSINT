import { scanApi } from './api';
import { server } from '../mocks/server';
import { rest } from 'msw';

describe('scanApi', () => {
    it('fetches all scans', async () => {
        const scans = await scanApi.getAllScans();
        expect(scans).toHaveLength(2);
        expect(scans[0].domain).toBe('example.com');
    });

    it('fetches scan by id', async () => {
        const scan = await scanApi.getScanById(1);
        expect(scan.id).toBe(1);
        expect(scan.domain).toBe('example.com');
    });

    it('initiates scan', async () => {
        const scan = await scanApi.initiateScan({
            domain: 'new.com',
            tool: 'THEHARVESTER'
        });

        expect(scan.domain).toBe('new.com');
        expect(scan.status).toBe('RUNNING');
    });

    it('clears history', async () => {
        await expect(scanApi.clearHistory()).resolves.not.toThrow();
    });

    it('throws error on failure', async () => {
        server.use(
            rest.get('http://localhost:8080/api/scans', (req, res, ctx) => {
                return res(ctx.status(500));
            })
        );

        await expect(scanApi.getAllScans()).rejects.toThrow();
    });
});
