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

// Mock api for clearHistory
jest.mock('../services/api', () => ({
    scanApi: {
        clearHistory: jest.fn().mockResolvedValue(undefined),
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

    it('renders home page components', () => {
        renderWithRouter(<Home />);

        expect(screen.getByText('OSINT Scanner')).toBeInTheDocument();
        expect(screen.getByText('New Scan')).toBeInTheDocument();
        expect(screen.getByText('example.com')).toBeInTheDocument();
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

    it('handles clear history', async () => {
        // Mock confirm
        window.confirm = jest.fn(() => true);

        renderWithRouter(<Home />);

        const clearButton = screen.getByText(/Clear History/i);
        fireEvent.click(clearButton);

        expect(window.confirm).toHaveBeenCalled();
        await waitFor(() => {
            expect(require('../services/api').scanApi.clearHistory).toHaveBeenCalled();
        });
    });
});
