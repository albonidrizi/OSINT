import { rest } from 'msw';
import { ScanResponse } from '../services/api';

const API_URL = 'http://localhost:8080/api';

export const mockScans: ScanResponse[] = [
    {
        id: 1,
        domain: 'example.com',
        tool: 'THEHARVESTER',
        startTime: '2024-01-01T12:00:00',
        endTime: '2024-01-01T12:05:00',
        status: 'COMPLETED',
        results: '{"emails": ["admin@example.com"], "hosts": ["www.example.com"]}',
        errorMessage: null
    },
    {
        id: 2,
        domain: 'test.com',
        tool: 'AMASS',
        startTime: '2024-01-02T10:00:00',
        endTime: null,
        status: 'RUNNING',
        results: null,
        errorMessage: null
    }
];

export const handlers = [
    // GET all scans
    rest.get(`${API_URL}/scans`, (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json(mockScans)
        );
    }),

    // GET scan by ID
    rest.get(`${API_URL}/scans/:id`, (req, res, ctx) => {
        const { id } = req.params;
        const scan = mockScans.find(s => s.id === Number(id));

        if (scan) {
            return res(ctx.status(200), ctx.json(scan));
        }
        return res(ctx.status(404));
    }),

    // POST initiate scan
    rest.post(`${API_URL}/scans`, (req, res, ctx) => {
        const newScan = {
            id: 3,
            domain: (req.body as any).domain,
            tool: (req.body as any).tool,
            startTime: new Date().toISOString(),
            endTime: null,
            status: 'RUNNING',
            results: null,
            errorMessage: null
        };
        return res(ctx.status(201), ctx.json(newScan));
    }),

    // DELETE clear history
    rest.delete(`${API_URL}/scans`, (req, res, ctx) => {
        return res(ctx.status(204));
    })
];
