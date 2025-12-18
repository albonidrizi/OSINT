import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScanModal } from './ScanModal';
import { ScanResponse } from '../services/api';

const mockScan: ScanResponse = {
    id: 1,
    domain: 'example.com',
    tool: 'THEHARVESTER',
    startTime: '2024-01-01T12:00:00',
    endTime: '2024-01-01T12:05:00',
    status: 'COMPLETED',
    results: JSON.stringify({
        emails: ['test@example.com'],
        hosts: ['mail.example.com'],
        ips: ['1.1.1.1']
    }),
    errorMessage: null
};

describe('ScanModal', () => {
    it('does not render when scan is null', () => {
        render(<ScanModal scan={null} onClose={jest.fn()} />);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders all result categories correctly', () => {
        const complexScan: ScanResponse = {
            ...mockScan,
            results: JSON.stringify({
                emails: ['email@test.com'],
                subdomains: ['sub.example.com'],
                hosts: ['host.example.com'],
                ips: ['1.2.3.4'],
                linkedin: ['https://linkedin.com/in/test']
            })
        };
        render(<ScanModal scan={complexScan} onClose={jest.fn()} />);

        expect(screen.getByText('email@test.com')).toBeInTheDocument();
        expect(screen.getByText('sub.example.com')).toBeInTheDocument();
        expect(screen.getByText('host.example.com')).toBeInTheDocument();
        expect(screen.getByText('1.2.3.4')).toBeInTheDocument();
        expect(screen.getByText('https://linkedin.com/in/test')).toBeInTheDocument();
    });

    it('renders "No results found" when results are empty', () => {
        const emptyScan: ScanResponse = {
            ...mockScan,
            results: JSON.stringify({})
        };
        render(<ScanModal scan={emptyScan} onClose={jest.fn()} />);

        expect(screen.getByText('No results found for this scan.')).toBeInTheDocument();
    });

    it('falls back to raw output on JSON parsing error', () => {
        const rawScan: ScanResponse = {
            ...mockScan,
            results: 'Some non-JSON raw output'
        };
        render(<ScanModal scan={rawScan} onClose={jest.fn()} />);

        expect(screen.getByText('No results found for this scan.')).toBeInTheDocument();
        expect(screen.getByText('View Raw Output')).toBeInTheDocument();
        expect(screen.getByText('Some non-JSON raw output')).toBeInTheDocument();
    });

    it('renders raw output alongside structured data if present', () => {
        const hybridScan: ScanResponse = {
            ...mockScan,
            results: JSON.stringify({
                emails: ['hybrid@test.com'],
                raw: 'This is the raw version of the data'
            })
        };
        render(<ScanModal scan={hybridScan} onClose={jest.fn()} />);

        expect(screen.getByText('hybrid@test.com')).toBeInTheDocument();
        expect(screen.getByText('View Raw Output')).toBeInTheDocument();
        expect(screen.getByText('This is the raw version of the data')).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
        const handleClose = jest.fn();
        render(<ScanModal scan={mockScan} onClose={handleClose} />);

        const closeButton = screen.getByLabelText('Close');
        fireEvent.click(closeButton);

        expect(handleClose).toHaveBeenCalled();
    });
});
