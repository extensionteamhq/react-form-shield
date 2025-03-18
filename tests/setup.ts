// Import jest-dom matchers
import '@testing-library/jest-dom';

// Configure React 18 for testing
import { configure } from '@testing-library/react';
import '@testing-library/react-hooks';

// Configure testing library
configure({
    testIdAttribute: 'data-testid',
});

// Mock window.matchMedia which is not implemented in JSDOM
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // Deprecated
        removeListener: jest.fn(), // Deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

// Mock IntersectionObserver which is not implemented in JSDOM
window.IntersectionObserver = jest.fn().mockImplementation((_callback) => ({
    root: null,
    rootMargin: '',
    thresholds: [],
    disconnect: jest.fn(),
    observe: jest.fn(),
    takeRecords: jest.fn().mockReturnValue([]),
    unobserve: jest.fn(),
})) as unknown as typeof IntersectionObserver;

// Suppress React 18 console errors/warnings
const originalConsoleError = console.error;
console.error = (...args) => {
    if (
        /Warning: ReactDOM.render is no longer supported in React 18/.test(args[0]) ||
        /Warning: The current testing environment is not configured to support act/.test(args[0]) ||
        /Warning.*not wrapped in act/.test(args[0]) ||
        /`ReactDOMTestUtils.act` is deprecated/.test(args[0])
    ) {
        return;
    }
    originalConsoleError(...args);
};
