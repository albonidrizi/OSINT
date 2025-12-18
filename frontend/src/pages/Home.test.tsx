import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Home } from './Home';

// Define a type for the useScans mock return value
type UseScansMock = {
    scans: any[];
    loading: boolean;
    initiateScan: jest.Mock;
    refreshScans: jest.Mock;
};

// Mock the custom hook
jest.mock('../hooks/useScans', () => ({
    useScans: jest.fn(),
}));

// Mock toast
jest.mock('react-toastify', () => ({
    ToastContainer: () => <div>ToastContainer</div>,
    toast: {
        success: jest.fn(),
        info: jest.fn(),
        error: jest.fn(),
    },
}));

jest.mock('../services/api', () => ({
    scanApi: {
        clearHistory: jest.fn().mockResolvedValue(undefined),
        initiateScan: jest.fn().mockResolvedValue({ id: 1 }),
    },
}));

const mockScans = [
    {
        id: 1,
        domain: 'example.com',
        tool: 'THEHARVESTER',
        startTime: '2024-01-01T12:00:00',
        endTime: '2024-01-01T12:05:00',
        status: 'COMPLETED',
        results: '{"emails": []}',
        errorMessage: null
    }
];

const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Home', () => {
    let useScansMock: UseScansMock;

    beforeEach(() => {
        useScansMock = {
            scans: mockScans,
            loading: false,
            initiateScan: jest.fn(),
            refreshScans: jest.fn(),
        };
        require('../hooks/useScans').useScans.mockReturnValue(useScansMock);
    });

    it('renders home page components', async () => {
        renderWithRouter(<Home />);

        expect(screen.getByText('OSINT Scanner')).toBeInTheDocument();
        expect(screen.getByText('New Scan')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText('example.com')).toBeInTheDocument();
        });
    });

    it('shows loading state', () => {
        require('../hooks/useScans').useScans.mockReturnValue({
            ...useScansMock,
            loading: true,
            scans: []
        });

        renderWithRouter(<Home />);
        expect(screen.getByText('Loading scans...')).toBeInTheDocument();
    });

    it('handles clear history success', async () => {
        window.confirm = jest.fn(() => true);
        renderWithRouter(<Home />);

        const clearButton = screen.getByText(/Clear History/i);
        fireEvent.click(clearButton);

        expect(window.confirm).toHaveBeenCalled();
        await waitFor(() => {
            expect(require('../services/api').scanApi.clearHistory).toHaveBeenCalled();
        });
    });

    it('shows error toast when clear history fails', async () => {
        window.confirm = jest.fn(() => true);
        const { toast } = require('react-toastify');
        const { scanApi } = require('../services/api');

        scanApi.clearHistory.mockRejectedValueOnce(new Error('API Error'));

        renderWithRouter(<Home />);

        const clearButton = screen.getByText(/Clear History/i);
        fireEvent.click(clearButton);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Failed to clear history');
        });
    });

    it('opens and closes ScanModal', async () => {
        renderWithRouter(<Home />);

        // Wait for scan to render in grid
        const viewButton = await screen.findByText(/View Results/i);
        fireEvent.click(viewButton);

        // Modal should be open (use findByRole to wait for animation)
        const modal = await screen.findByRole('dialog');
        expect(modal).toBeInTheDocument();

        // Wait for modal content specifically
        const modalTitle = await screen.findByText(/Scan Results/i);
        expect(modalTitle).toBeInTheDocument();
        expect(modalTitle).toHaveTextContent('example.com');

        // Close modal
        const closeButton = screen.getByLabelText(/Close/i);
        fireEvent.click(closeButton);

        // Modal should be gone
        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
    });

    it('handles scan initiation success', async () => {
        const { toast } = require('react-toastify');
        renderWithRouter(<Home />);

        // Fill domain input
        const domainInput = await screen.findByPlaceholderText(/example.com/i);
        fireEvent.change(domainInput, { target: { value: 'api-test.com' } });

        // Submit the form directly
        const form = screen.getByLabelText('Scan Form');
        fireEvent.submit(form);

        await waitFor(() => {
            expect(toast.success).toHaveBeenCalled();
            expect(useScansMock.refreshScans).toHaveBeenCalled();
        }, { timeout: 5000 });
    });
});
