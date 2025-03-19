/**
 * useHoneypot Hook Tests
 *
 * @module client/hooks/useHoneypot.test
 */

import { renderHook } from '@testing-library/react';
import { useHoneypot } from './useHoneypot';
import * as utils from '../utils';

// Mock the utils module
jest.mock('../utils', () => ({
    generateHoneypotFieldName: jest.fn().mockReturnValue('test_honeypot'),
}));

describe('useHoneypot', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('initializes with default values', () => {
        const { result } = renderHook(() => useHoneypot());

        expect(result.current.honeypotFieldName).toBe('test_honeypot');
        expect(result.current.honeypotProps.name).toBe('test_honeypot');
        expect(result.current.honeypotProps.style).toEqual({
            position: "absolute",
            left: "-9999px",
            opacity: 0,
            height: 0,
            width: 0,
            overflow: "hidden",
        });
        expect(utils.generateHoneypotFieldName).toHaveBeenCalled();
    });

    it('uses custom honeypot field name if provided', () => {
        const customHoneypotFieldName = 'custom_honeypot';
        const { result } = renderHook(() =>
            useHoneypot({ honeypotFieldName: customHoneypotFieldName })
        );

        expect(result.current.honeypotFieldName).toBe(customHoneypotFieldName);
        expect(result.current.honeypotProps.name).toBe(customHoneypotFieldName);
        expect(utils.generateHoneypotFieldName).not.toHaveBeenCalled();
    });

    it('detects bot submissions via honeypot field', () => {
        const { result } = renderHook(() => useHoneypot());

        // Simulate form with filled honeypot field (bot)
        const botFormValues = {
            name: 'Test User',
            email: 'test@example.com',
            test_honeypot: 'bot_value', // Honeypot field is filled
        };

        // Simulate form without filled honeypot field (human)
        const humanFormValues = {
            name: 'Test User',
            email: 'test@example.com',
        };

        expect(result.current.checkHoneypot(botFormValues)).toBe(true);
        expect(result.current.checkHoneypot(humanFormValues)).toBe(false);
    });
});
