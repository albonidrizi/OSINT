import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import { server } from './mocks/server';
import { rest } from 'msw';

// Mock Home component to verify routing
jest.mock('./pages/Home', () => ({
    Home: () => <div data-testid="home-page">Home Page</div>
}));

// Mock ScanDetail component to verify routing
jest.mock('./pages/ScanDetail', () => ({
    ScanDetail: () => <div data-testid="scan-detail-page">Scan Detail Page</div>
}));

describe('App', () => {
    it('renders home page by default', async () => {
        render(<App />);
        expect(await screen.findByTestId('home-page')).toBeInTheDocument();
    });

    it('navigates to scan detail page', async () => {
        window.history.pushState({}, 'Test Page', '/scan/1');
        render(<App />);

        expect(await screen.findByTestId('scan-detail-page')).toBeInTheDocument();
    });
});
