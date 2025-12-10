import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScanForm } from './ScanForm';
import { server } from '../mocks/server';
import { rest } from 'msw';

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = jest.fn();

describe('ScanForm', () => {
    it('renders "New Scan" button initially', () => {
        render(<ScanForm onScanInitiated={jest.fn()} />);
        expect(screen.getByText('New Scan')).toBeInTheDocument();
        expect(screen.queryByLabelText('Domain *')).not.toBeInTheDocument();
    });

    it('expands form when "New Scan" button is clicked', () => {
        render(<ScanForm onScanInitiated={jest.fn()} />);

        fireEvent.click(screen.getByText('New Scan'));

        expect(screen.getByLabelText(/Domain/i)).toBeInTheDocument();
        expect(screen.getByText('Start Scan')).toBeInTheDocument();
    });

    it('validates domain input', async () => {
        render(<ScanForm onScanInitiated={jest.fn()} />);
        fireEvent.click(screen.getByText('New Scan'));

        const submitButton = screen.getByText('Start Scan');
        fireEvent.click(submitButton);

        expect(screen.getByText('Domain is required')).toBeInTheDocument();

        const input = screen.getByLabelText(/Domain/i);
        await userEvent.type(input, 'invalid-domain');
        fireEvent.click(submitButton);

        expect(screen.getByText('Please enter a valid domain (e.g., example.com)')).toBeInTheDocument();
    });

    it('submits form with valid data', async () => {
        const handleScanInitiated = jest.fn();
        render(<ScanForm onScanInitiated={handleScanInitiated} />);

        fireEvent.click(screen.getByText('New Scan'));

        const input = screen.getByLabelText(/Domain/i);
        await userEvent.type(input, 'example.com');

        fireEvent.click(screen.getByText('Start Scan'));

        await waitFor(() => {
            expect(handleScanInitiated).toHaveBeenCalled();
        });
    });

    it('shows error message on API failure', async () => {
        server.use(
            rest.post('http://localhost:8080/api/scans', (req, res, ctx) => {
                return res(ctx.status(500), ctx.json({ message: 'Server error' }));
            })
        );

        render(<ScanForm onScanInitiated={jest.fn()} />);
        fireEvent.click(screen.getByText('New Scan'));

        await userEvent.type(screen.getByLabelText(/Domain/i), 'example.com');
        fireEvent.click(screen.getByText('Start Scan'));

        await waitFor(() => {
            // Axios error message structure might vary, checking for generic failure or specific message
            // The component utilizes err.message
            expect(screen.getByText(/Request failed with status code 500/i)).toBeInTheDocument();
        });
    });

    it('toggles tool selection', () => {
        render(<ScanForm onScanInitiated={jest.fn()} />);
        fireEvent.click(screen.getByText('New Scan'));

        const amassButton = screen.getByText('Amass');
        fireEvent.click(amassButton);

        // Check if Amass is active (class check or logic check)
        expect(amassButton).toHaveClass('active');

        // Limit field should disappear for Amass (assuming logic in component)
        expect(screen.queryByLabelText('Limit (optional)')).not.toBeInTheDocument();
    });
});
