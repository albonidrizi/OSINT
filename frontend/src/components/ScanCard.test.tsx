import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ScanCard } from './ScanCard';
import { ScanResponse } from '../services/api';

const mockScan: ScanResponse = {
    id: 1,
    domain: 'example.com',
    tool: 'THEHARVESTER',
    startTime: '2024-01-01T12:00:00',
    endTime: '2024-01-01T12:05:00',
    status: 'COMPLETED',
    results: '{"emails": []}',
    errorMessage: null
};

const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('ScanCard', () => {
    it('renders scan information correctly', () => {
        renderWithRouter(<ScanCard scan={mockScan} onViewResults={jest.fn()} />);

        expect(screen.getByText('example.com')).toBeInTheDocument();
        expect(screen.getByText('THEHARVESTER')).toBeInTheDocument();
        expect(screen.getByText('COMPLETED')).toBeInTheDocument();
    });

    it('renders running state correctly', () => {
        const runningScan = { ...mockScan, status: 'RUNNING' as const, endTime: null };
        renderWithRouter(<ScanCard scan={runningScan} onViewResults={jest.fn()} />);

        expect(screen.getByText('Scan in progress...')).toBeInTheDocument();
    });

    it('renders failed state correctly', () => {
        const failedScan = {
            ...mockScan,
            status: 'FAILED' as const,
            errorMessage: 'Connection failed'
        };
        renderWithRouter(<ScanCard scan={failedScan} onViewResults={jest.fn()} />);

        expect(screen.getByText('Connection failed')).toBeInTheDocument();
    });

    it('calls onViewResults when "View Results" is clicked', () => {
        const handleViewResults = jest.fn();
        renderWithRouter(<ScanCard scan={mockScan} onViewResults={handleViewResults} />);

        fireEvent.click(screen.getByText('View Results'));
        expect(handleViewResults).toHaveBeenCalledWith(mockScan);
    });

    it('does not show "View Results" button if scan not completed', () => {
        const runningScan = { ...mockScan, status: 'RUNNING' as const };
        renderWithRouter(<ScanCard scan={runningScan} onViewResults={jest.fn()} />);

        expect(screen.queryByText('View Results')).not.toBeInTheDocument();
    });
});
