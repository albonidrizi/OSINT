import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// Increase default timeout for waitFor, findBy, etc. to 5s
configure({ asyncUtilTimeout: 5000 });

// Mocks for window properties that might be missing in JSDOM
import React from 'react';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
    ...jest.requireActual('framer-motion'),
    motion: {
        div: 'div',
        button: 'button',
        span: 'span',
        header: 'header',
        section: 'section',
    },
    AnimatePresence: (props: any) => props.children,
}));

window.matchMedia = window.matchMedia || function (query) {
    return {
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    };
};

// Mock for IntersectionObserver
class IntersectionObserverMock {
    observe = jest.fn();
    disconnect = jest.fn();
    unobserve = jest.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: IntersectionObserverMock
});

// Mock for ResizeObserver
class ResizeObserverMock {
    observe = jest.fn();
    disconnect = jest.fn();
    unobserve = jest.fn();
}

Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    configurable: true,
    value: ResizeObserverMock
});

import { server } from './mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
