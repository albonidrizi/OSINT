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

    it('renders scan results when open', () => {
        render(<ScanModal scan={mockScan} onClose={jest.fn()} />);

        expect(screen.getByText('Results for example.com')).toBeInTheDocument();
        expect(screen.getByText('test@example.com')).toBeInTheDocument();
        expect(screen.getByText('mail.example.com')).toBeInTheDocument();
        expect(screen.getByText('1.1.1.1')).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
        const handleClose = jest.fn();
        render(<ScanModal scan={mockScan} onClose={handleClose} />);

        const closeButton = screen.getByLabelText('Close modal'); // Assuming aria-label or button text
        fireEvent.click(closeButton);

        expect(handleClose).toHaveBeenCalled();
    });
});
