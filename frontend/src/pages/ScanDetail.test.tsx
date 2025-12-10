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

        await waitFor(() => {
            expect(screen.getByText('example.com')).toBeInTheDocument();
            expect(screen.getByText('THEHARVESTER')).toBeInTheDocument();
        });
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
});
