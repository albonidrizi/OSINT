import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ScanDetail } from './ScanDetail';
import { server } from '../mocks/server';
import { rest } from 'msw';

// Mock clipboard API
Object.assign(navigator, {
    clipboard: {
        writeText: jest.fn(),
    },
});

describe('ScanDetail', () => {
    it('renders loading state initially', () => {
        render(
            <MemoryRouter initialEntries={['/scan/1']}>
                <Routes>
                    <Route path="/scan/:id" element={<ScanDetail />} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Loading scan details...')).toBeInTheDocument();
    });

    it('renders scan details when fetched', async () => {
        render(
            <MemoryRouter initialEntries={['/scan/1']}>
                <Routes>
                    <Route path="/scan/:id" element={<ScanDetail />} />
                </Routes>
            </MemoryRouter>
        );

        // Wait for loading to disappear and then check for data
        await waitFor(() => {
            expect(screen.queryByText('Loading scan details...')).not.toBeInTheDocument();
        });

        expect(await screen.findByText('example.com')).toBeInTheDocument();
        expect(await screen.findByText('THEHARVESTER')).toBeInTheDocument();
    });

    it('renders error when scan not found', async () => {
        server.use(
            rest.get('http://localhost:8080/api/scans/999', (req: any, res: any, ctx: any) => {
                return res(ctx.status(404));
            })
        );

        render(
            <MemoryRouter initialEntries={['/scan/999']}>
                <Routes>
                    <Route path="/scan/:id" element={<ScanDetail />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Scan not found')).toBeInTheDocument();
        });
    });

    it('handles generic error on fetch', async () => {
        server.use(
            rest.get('http://localhost:8080/api/scans/1', (req, res, ctx) => {
                return res(ctx.status(500), ctx.json({ message: 'Internal Server Error' }));
            })
        );

        render(
            <MemoryRouter initialEntries={['/scan/1']}>
                <Routes>
                    <Route path="/scan/:id" element={<ScanDetail />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Internal Server Error/i)).toBeInTheDocument();
        });
    });

    const mockScan = {
        id: 1,
        domain: 'example.com',
        tool: 'THEHARVESTER',
        startTime: '2024-01-01T12:00:00',
        endTime: '2024-01-01T12:05:00',
        status: 'COMPLETED',
        results: null,
        errorMessage: null
    };

    it('handles null start and end times', async () => {
        server.use(
            rest.get('http://localhost:8080/api/scans/1', (req, res, ctx) => {
                return res(
                    ctx.json({
                        ...mockScan,
                        startTime: null,
                        endTime: null,
                        status: 'RUNNING'
                    })
                );
            })
        );

        render(
            <MemoryRouter initialEntries={['/scan/1']}>
                <Routes>
                    <Route path="/scan/:id" element={<ScanDetail />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.queryByText('Loading scan details...')).not.toBeInTheDocument();
        });

        const nAValues = await screen.findAllByText('N/A');
        expect(nAValues.length).toBeGreaterThan(0);
    });

    it('handles unexpected scan status', async () => {
        server.use(
            rest.get('http://localhost:8080/api/scans/1', (req, res, ctx) => {
                return res(
                    ctx.json({
                        ...mockScan,
                        status: 'UNKNOWN_STATUS'
                    })
                );
            })
        );

        render(
            <MemoryRouter initialEntries={['/scan/1']}>
                <Routes>
                    <Route path="/scan/:id" element={<ScanDetail />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.queryByText('Loading scan details...')).not.toBeInTheDocument();
        });

        const badges = screen.getAllByText('UNKNOWN_STATUS');
        expect(badges.length).toBeGreaterThan(0);
        // The first one is usually the large badge in the header
        expect(badges[0]).toHaveStyle({ backgroundColor: 'rgb(149, 165, 166)' });
    });

    it('shows error when id is missing from params', async () => {
        render(
            <MemoryRouter initialEntries={['/scan/']}>
                <Routes>
                    <Route path="/scan/:id?" element={<ScanDetail />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Invalid scan ID')).toBeInTheDocument();
        });
    });
});
