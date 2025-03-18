import { renderHook, act } from '@testing-library/react';
import { useFormShield } from './useFormShield';
import * as utils from '../utils';
import { ANTI_SPAM_FEATURES } from '../constants';

// Mock the utils module
jest.mock('../utils', () => ({
    generateHoneypotFieldName: jest.fn().mockReturnValue('test_honeypot'),
    getRandomDelay: jest.fn().mockReturnValue(10),
    generateChallenge: jest.fn().mockReturnValue({
        question: 'What is 2 + 2?',
        answer: '4',
    }),
    calculateRequiredChallenges: jest.fn().mockReturnValue(1),
    mergeSettings: jest.fn().mockImplementation((userSettings) => ({
        ...ANTI_SPAM_FEATURES,
        ...userSettings,
    })),
}));

// Mock Date.now for consistent timing tests
const mockDateNow = jest.spyOn(Date, 'now');
mockDateNow.mockReturnValue(1000);

// Mock document.querySelectorAll for focus event tests
const mockQuerySelectorAll = jest.spyOn(document, 'querySelectorAll');
const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();
mockQuerySelectorAll.mockReturnValue([
    {
        id: 'test_field',
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener,
    },
] as unknown as NodeListOf<Element>);

describe('useFormShield', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockDateNow.mockReturnValue(1000);
    });

    it('initializes with default values', () => {
        const { result } = renderHook(() => useFormShield());

        expect(result.current.firstFocusTime).toBeNull();
        expect(result.current.formFocusTracked.current).toBe(false);
        expect(result.current.requiredDelay).toBe(10);
        expect(result.current.showChallengeDialog).toBe(false);
        expect(result.current.challenge).toEqual({
            question: 'What is 2 + 2?',
            answer: '4',
        });
        expect(result.current.challengeAnswer).toBe('');
        expect(result.current.formValues).toBeNull();
        expect(result.current.challengeMetrics).toEqual({
            completedChallenges: 0,
            totalChallengeTime: 0,
            requiredChallenges: 0,
        });
        expect(result.current.currentChallengeNumber).toBe(1);
        expect(result.current.honeypotProps.name).toBe('test_honeypot');
    });

    it('uses custom honeypot field name if provided', () => {
        const customHoneypotFieldName = 'custom_honeypot';
        const { result } = renderHook(() =>
            useFormShield({ honeypotFieldName: customHoneypotFieldName })
        );

        expect(result.current.honeypotProps.name).toBe(customHoneypotFieldName);
    });

    it('merges custom settings with defaults', () => {
        const customSettings = {
            ENABLE_HONEYPOT: false,
        };
        renderHook(() => useFormShield({ settings: customSettings }));

        expect(utils.mergeSettings).toHaveBeenCalledWith(customSettings);
    });

    it('tracks first focus time', () => {
        const { result } = renderHook(() => useFormShield());

        // Simulate field focus
        act(() => {
            result.current.handleFieldFocus();
        });

        expect(result.current.firstFocusTime).toBe(1000);
        expect(result.current.formFocusTracked.current).toBe(true);
    });

    it('only tracks first focus once', () => {
        const { result } = renderHook(() => useFormShield());

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

    it('detects bot submissions via honeypot field', () => {
        const { result } = renderHook(() => useFormShield());

        // Simulate form with filled honeypot field
        const formValues = {
            name: 'Test User',
            email: 'test@example.com',
            test_honeypot: 'bot_value', // Honeypot field is filled
        };

        const checkResult = result.current.checkAntiSpam(formValues);

        expect(checkResult.isBot).toBe(true);
    });

    it('validates time delay for submissions', () => {
        const { result } = renderHook(() => useFormShield());

        // Simulate field focus
        act(() => {
            result.current.handleFieldFocus();
        });

        // Simulate form submission too quickly
        const formValues = {
            name: 'Test User',
            email: 'test@example.com',
        };

        // Time elapsed is 0 seconds (same as focus time)
        const checkResult = result.current.checkAntiSpam(formValues);

        expect(checkResult.timeDelayPassed).toBe(false);
        expect(checkResult.timeDeficitSeconds).toBe(10); // requiredDelay - elapsed time
    });

    it('passes validation when time delay is met', () => {
        const { result } = renderHook(() => useFormShield());

        // Simulate field focus
        act(() => {
            result.current.handleFieldFocus();
        });

        // Change mock time to simulate delay
        mockDateNow.mockReturnValue(11000); // 10 seconds later

        // Simulate form submission after delay
        const formValues = {
            name: 'Test User',
            email: 'test@example.com',
        };

        const checkResult = result.current.checkAntiSpam(formValues);

        expect(checkResult.timeDelayPassed).toBe(true);
        expect(checkResult.passed).toBe(true);
    });

    it('calculates required challenges based on time deficit', () => {
        const { result } = renderHook(() => useFormShield());

        // Simulate field focus
        act(() => {
            result.current.handleFieldFocus();
        });

        // Simulate form submission too quickly
        const formValues = {
            name: 'Test User',
            email: 'test@example.com',
        };

        // Mock calculateRequiredChallenges to return 2
        (utils.calculateRequiredChallenges as jest.Mock).mockReturnValueOnce(2);

        const checkResult = result.current.checkAntiSpam(formValues);

        expect(checkResult.requiredChallenges).toBe(2);
    });

    it('shows challenge dialog when validation fails', async () => {
        // Mock setTimeout to execute immediately
        jest.useFakeTimers();

        const { result } = renderHook(() => useFormShield());

        // Simulate field focus
        act(() => {
            result.current.handleFieldFocus();
        });

        // Simulate form submission too quickly
        const formValues = {
            name: 'Test User',
            email: 'test@example.com',
        };

        // Validate submission (which should fail due to time)
        act(() => {
            result.current.validateSubmission(formValues);
            // Fast-forward timers to execute the setTimeout
            jest.runAllTimers();
        });

        // Restore timers
        jest.useRealTimers();

        // Now the dialog should be shown
        expect(result.current.showChallengeDialog).toBe(true);
        expect(result.current.formValues).toEqual({
            ...formValues,
            isBot: false,
        });
    });

    it('handles correct challenge answer', async () => {
        const { result } = renderHook(() => useFormShield());

        // Setup challenge dialog
        act(() => {
            result.current.setFormValues({
                name: 'Test User',
                email: 'test@example.com',
            });
            result.current.setChallengeAnswer('4'); // Correct answer
            result.current.setShowChallengeDialog(true);
        });

        // Mock time for challenge duration
        mockDateNow.mockReturnValueOnce(5000); // 4 seconds after challenge start

        // Mock onSuccess function
        const onSuccess = jest.fn().mockResolvedValue(undefined);

        // Submit challenge
        await act(async () => {
            await result.current.handleChallengeSubmit(onSuccess);
        });

        // Challenge should be completed and dialog closed
        expect(result.current.showChallengeDialog).toBe(false);
        expect(onSuccess).toHaveBeenCalledWith(
            { name: 'Test User', email: 'test@example.com' },
            true,
            expect.objectContaining({
                completedChallenges: 1,
                totalChallengeTime: expect.any(Number),
            })
        );
    });

    it('handles incorrect challenge answer', async () => {
        const { result } = renderHook(() => useFormShield({
            onError: jest.fn(),
        }));

        // Setup challenge dialog
        act(() => {
            result.current.setFormValues({
                name: 'Test User',
                email: 'test@example.com',
            });
            result.current.setChallengeAnswer('5'); // Incorrect answer
            result.current.setShowChallengeDialog(true);
        });

        // Mock onSuccess function
        const onSuccess = jest.fn().mockResolvedValue(undefined);

        // Submit challenge
        await act(async () => {
            await result.current.handleChallengeSubmit(onSuccess);
        });

        // Challenge should not be completed and dialog still open
        expect(result.current.showChallengeDialog).toBe(true);
        expect(onSuccess).not.toHaveBeenCalled();
        expect(result.current.challengeAnswer).toBe('');
    });

    it('provides form shield data for submission', () => {
        const { result } = renderHook(() => useFormShield());

        // Simulate field focus
        act(() => {
            result.current.handleFieldFocus();
        });

        // Change mock time
        mockDateNow.mockReturnValue(5000);

        // Get form shield data
        const formShieldData = result.current.getFormShieldData();

        expect(formShieldData).toEqual({
            firstFocusTime: 1000,
            submissionTime: 5000,
            challengeCompleted: false,
            challengeMetrics: {
                completedChallenges: 0,
                totalChallengeTime: 0,
                requiredChallenges: 0,
            },
            antiSpamSettings: expect.any(Object),
        });
    });
});
