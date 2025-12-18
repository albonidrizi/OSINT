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

    it('expands form when "New Scan" button is clicked', async () => {
        render(<ScanForm onScanInitiated={jest.fn()} />);

        fireEvent.click(screen.getByText('New Scan'));

        expect(await screen.findByLabelText(/Domain/i)).toBeInTheDocument();
        expect(await screen.findByText('Start Scan')).toBeInTheDocument();
    });

    it('validates domain input', async () => {
        render(<ScanForm onScanInitiated={jest.fn()} />);
        fireEvent.click(screen.getByText('New Scan'));

        const submitButton = await screen.findByText('Start Scan');
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

        const input = await screen.findByLabelText(/Domain/i);
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

        const input = await screen.findByLabelText(/Domain/i);
        await userEvent.type(input, 'example.com');
        fireEvent.click(screen.getByText('Start Scan'));

        await waitFor(() => {
            expect(screen.getByText(/500/)).toBeInTheDocument();
        });
    });

    it('toggles tool selection', async () => {
        render(<ScanForm onScanInitiated={jest.fn()} />);
        fireEvent.click(screen.getByText('New Scan'));

        await waitFor(() => {
            expect(screen.getByText(/Amass/i)).toBeInTheDocument();
        });

        const amassButton = screen.getByText(/Amass/i);
        fireEvent.click(amassButton);

        expect(amassButton).toHaveClass('active');
        expect(screen.queryByLabelText(/Limit/i)).not.toBeInTheDocument();
    });

    it('closes form when "X" button is clicked', async () => {
        render(<ScanForm onScanInitiated={jest.fn()} />);
        fireEvent.click(screen.getByText('New Scan'));

        const closeButton = await screen.findByLabelText('Close form');
        fireEvent.click(closeButton);

        await waitFor(() => {
            expect(screen.queryByLabelText(/Domain/i)).not.toBeInTheDocument();
            expect(screen.getByText('New Scan')).toBeInTheDocument();
        });
    });

    it('submits optional fields when provided', async () => {
        let capturedRequest: any = null;
        server.use(
            rest.post('http://localhost:8080/api/scans', (req, res, ctx) => {
                capturedRequest = req.body;
                return res(ctx.status(200), ctx.json({ id: 1 }));
            })
        );

        render(<ScanForm onScanInitiated={jest.fn()} />);
        fireEvent.click(screen.getByText('New Scan'));

        await userEvent.type(await screen.findByLabelText(/Domain/i), 'example.com');
        await userEvent.type(screen.getByLabelText(/Limit/i), '100');
        await userEvent.type(screen.getByLabelText(/Sources/i), 'google,bing');

        fireEvent.click(screen.getByText('Start Scan'));

        await waitFor(() => {
            expect(capturedRequest).toMatchObject({
                domain: 'example.com',
                limit: 100,
                sources: 'google,bing'
            });
        });
    });

    it('sanitizes limit and sources before submission', async () => {
        let capturedRequest: any = null;
        server.use(
            rest.post('http://localhost:8080/api/scans', (req, res, ctx) => {
                capturedRequest = req.body;
                return res(ctx.status(200), ctx.json({ id: 1 }));
            })
        );

        render(<ScanForm onScanInitiated={jest.fn()} />);
        fireEvent.click(screen.getByText('New Scan'));

        const domainInput = await screen.findByLabelText(/Domain/i);
        fireEvent.change(domainInput, { target: { value: 'example.com' } });

        // Test with limit 0 - should be sent as undefined
        const limitInput = screen.getByPlaceholderText('500');
        fireEvent.change(limitInput, { target: { value: '0' } });

        fireEvent.click(screen.getByText('Start Scan'));

        await waitFor(() => {
            expect(capturedRequest).toBeDefined();
            expect(capturedRequest).not.toHaveProperty('limit');
            expect(capturedRequest).not.toHaveProperty('sources');
        });
    });
});
