import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ScanGrid } from './ScanGrid';
import { ScanResponse } from '../services/api';

const mockScans: ScanResponse[] = [
    {
        id: 1,
        domain: 'example.com',
        tool: 'THEHARVESTER',
        startTime: '2024-01-01T12:00:00',
        endTime: null,
        status: 'RUNNING',
        results: null,
        errorMessage: null
    },
    {
        id: 2,
        domain: 'test.com',
        tool: 'AMASS',
        startTime: '2024-01-02T10:00:00',
        endTime: '2024-01-02T10:05:00',
        status: 'COMPLETED',
        results: '{}',
        errorMessage: null
    }
];

const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('ScanGrid', () => {
    it('renders scan cards for each scan', () => {
        renderWithRouter(<ScanGrid scans={mockScans} onViewResults={jest.fn()} />);

        expect(screen.getByText('example.com')).toBeInTheDocument();
        expect(screen.getByText('test.com')).toBeInTheDocument();
    });

    it('renders empty state when no scans', () => {
        renderWithRouter(<ScanGrid scans={[]} onViewResults={jest.fn()} />);

        expect(screen.getByText('No scans yet')).toBeInTheDocument();
        expect(screen.getByText('Initiate your first scan to get started!')).toBeInTheDocument();
    });

    it('renders scans with different statuses correctly', () => {
        const variedScans: ScanResponse[] = [
            { ...mockScans[0], status: 'RUNNING' },
            { ...mockScans[1], status: 'COMPLETED' },
            { ...mockScans[1], id: 3, domain: 'fail.com', status: 'FAILED', errorMessage: 'Fatal Error' }
        ];

        renderWithRouter(<ScanGrid scans={variedScans} onViewResults={jest.fn()} />);

        expect(screen.getByText('Scan in progress...')).toBeInTheDocument();
        expect(screen.getByText('test.com')).toBeInTheDocument();
        expect(screen.getByText('Fatal Error')).toBeInTheDocument();
    });
});
