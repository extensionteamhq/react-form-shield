/**
 * useTimeDelay Hook Tests
 *
 * @module client/hooks/useTimeDelay.test
 */

import { renderHook, act } from '@testing-library/react';
import { useTimeDelay } from './useTimeDelay';
import * as utils from '../utils';

// Mock the utils module
jest.mock('../utils', () => ({
    getRandomDelay: jest.fn().mockReturnValue(10),
}));

// Mock Date.now for consistent timing tests
const mockDateNow = jest.spyOn(Date, 'now');
mockDateNow.mockReturnValue(1000);

// Mock document.querySelectorAll for focus event tests
const mockQuerySelectorAll = jest.spyOn(document, 'querySelectorAll');
const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();
const mockMatches = jest.fn().mockReturnValue(false);

mockQuerySelectorAll.mockReturnValue([
    {
        id: 'test_field',
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener,
        matches: mockMatches,
    },
] as unknown as NodeListOf<Element>);

describe('useTimeDelay', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockDateNow.mockReturnValue(1000);
        mockMatches.mockReturnValue(false);
    });

    it('initializes with default values', () => {
        const { result } = renderHook(() => useTimeDelay());

        expect(result.current.firstFocusTime).toBeNull();
        expect(result.current.formFocusTracked.current).toBe(false);
        expect(result.current.requiredDelay).toBe(10);
        expect(utils.getRandomDelay).toHaveBeenCalled();
    });

    it('uses custom required delay if provided', () => {
        const customRequiredDelay = 20;
        const { result } = renderHook(() =>
            useTimeDelay({ requiredDelay: customRequiredDelay })
        );

        expect(result.current.requiredDelay).toBe(customRequiredDelay);
        expect(utils.getRandomDelay).not.toHaveBeenCalled();
    });

    it('tracks first focus time', () => {
        const { result } = renderHook(() => useTimeDelay());

        // Simulate field focus
        act(() => {
            result.current.handleFieldFocus();
        });

        expect(result.current.firstFocusTime).toBe(1000);
        expect(result.current.formFocusTracked.current).toBe(true);
    });

    it('only tracks first focus once', () => {
        const { result } = renderHook(() => useTimeDelay());

        // Simulate first field focus
        act(() => {
            result.current.handleFieldFocus();
        });

        // Change mock time
        mockDateNow.mockReturnValue(2000);

        // Simulate second field focus
        act(() => {
            result.current.handleFieldFocus();
        });

        // Should still have the first focus time
        expect(result.current.firstFocusTime).toBe(1000);
    });

    it('validates time delay for submissions', () => {
        const { result } = renderHook(() => useTimeDelay());

        // Simulate field focus
        act(() => {
            result.current.handleFieldFocus();
        });

        // Time elapsed is 0 seconds (same as focus time)
        const checkResult = result.current.checkTimeDelay();

        expect(checkResult.passed).toBe(false);
        expect(checkResult.timeDeficitSeconds).toBe(10); // requiredDelay - elapsed time
    });

    it('passes validation when time delay is met', () => {
        const { result } = renderHook(() => useTimeDelay());

        // Simulate field focus
        act(() => {
            result.current.handleFieldFocus();
        });

        // Change mock time to simulate delay
        mockDateNow.mockReturnValue(11000); // 10 seconds later

        // Check time delay
        const checkResult = result.current.checkTimeDelay();

        expect(checkResult.passed).toBe(true);
        expect(checkResult.timeDeficitSeconds).toBe(0);
    });

    it('returns maximum time deficit when no focus time is set', () => {
        const { result } = renderHook(() => useTimeDelay());

        // Check time delay without setting focus time
        const checkResult = result.current.checkTimeDelay();

        expect(checkResult.passed).toBe(false);
        expect(checkResult.timeDeficitSeconds).toBe(10); // full required delay
    });

    it('sets up focus event listeners', () => {
        const { result } = renderHook(() => useTimeDelay());

        // Setup focus listeners
        const cleanup = result.current.setupFocusListeners();

        expect(mockQuerySelectorAll).toHaveBeenCalledWith("input, textarea, select");
        expect(mockAddEventListener).toHaveBeenCalledWith("focus", expect.any(Function));

        // Cleanup
        cleanup();

        expect(mockRemoveEventListener).toHaveBeenCalledWith("focus", expect.any(Function));
    });

    it('respects exclude selector when setting up listeners', () => {
        const { result } = renderHook(() => useTimeDelay());

        // Setup focus listeners with exclude selector
        const cleanup = result.current.setupFocusListeners("input", ".honeypot");

        expect(mockQuerySelectorAll).toHaveBeenCalledWith("input");
        expect(mockMatches).toHaveBeenCalledWith(".honeypot");

        // Simulate excluded element
        mockMatches.mockReturnValueOnce(true);

        // Cleanup
        cleanup();

        expect(mockMatches).toHaveBeenCalledWith(".honeypot");
    });
});
