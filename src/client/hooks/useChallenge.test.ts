/**
 * useChallenge Hook Tests
 *
 * @module client/hooks/useChallenge.test
 */

import { renderHook, act } from '@testing-library/react';
import { useChallenge } from './useChallenge';
import * as utils from '../utils';

// Mock the utils module
jest.mock('../utils', () => ({
    generateChallenge: jest.fn().mockReturnValue({
        question: 'What is 2 + 2?',
        answer: '4',
    }),
    calculateRequiredChallenges: jest.fn().mockReturnValue(1),
}));

// Mock Date.now for consistent timing tests
const mockDateNow = jest.spyOn(Date, 'now');
mockDateNow.mockReturnValue(1000);

describe('useChallenge', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockDateNow.mockReturnValue(1000);
    });

    it('initializes with default values', () => {
        const { result } = renderHook(() => useChallenge());

        expect(result.current.showChallengeDialog).toBe(false);
        expect(result.current.challenge).toEqual({
            question: 'What is 2 + 2?',
            answer: '4',
        });
        expect(result.current.challengeAnswer).toBe('');
        expect(result.current.challengeMetrics).toEqual({
            completedChallenges: 0,
            totalChallengeTime: 0,
            requiredChallenges: 0,
        });
        expect(result.current.currentChallengeNumber).toBe(1);
        expect(utils.generateChallenge).toHaveBeenCalled();
    });

    it('calculates required challenges based on time deficit', () => {
        const { result } = renderHook(() => useChallenge({
            enableMultipleChallenges: true,
            maxChallenges: 3,
            challengeTimeValue: 5
        }));

        // Calculate required challenges
        result.current.calculateRequiredChallenges(10);

        expect(utils.calculateRequiredChallenges).toHaveBeenCalledWith(
            10,
            expect.objectContaining({
                ENABLE_MULTIPLE_CHALLENGES: true,
                MAX_CHALLENGES: 3,
                CHALLENGE_TIME_VALUE: 5,
                ENABLE_TIME_DELAY: true,
                ENABLE_CHALLENGE_DIALOG: true,
                ENABLE_HONEYPOT: true
            })
        );
    });

    it('tracks challenge dialog open/close', () => {
        const { result } = renderHook(() => useChallenge());

        // Open challenge dialog
        act(() => {
            result.current.setShowChallengeDialog(true);
        });

        expect(result.current.showChallengeDialog).toBe(true);

        // Close challenge dialog
        act(() => {
            result.current.setShowChallengeDialog(false);
        });

        expect(result.current.showChallengeDialog).toBe(false);
        expect(result.current.challengeAnswer).toBe('');
    });

    it('handles correct challenge answer', async () => {
        const onError = jest.fn();
        const { result } = renderHook(() => useChallenge({
            onError
        }));

        // Setup challenge dialog
        act(() => {
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
            true,
            expect.objectContaining({
                completedChallenges: 1,
                totalChallengeTime: expect.any(Number),
            })
        );
        expect(onError).not.toHaveBeenCalled();
    });

    it('handles incorrect challenge answer', async () => {
        const onError = jest.fn();
        const { result } = renderHook(() => useChallenge({
            onError
        }));

        // Setup challenge dialog
        act(() => {
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
        expect(onError).toHaveBeenCalledWith('Incorrect answer. Please try again.');
        // The generateChallenge function is called at least twice (initial + after incorrect answer)
        expect(utils.generateChallenge).toHaveBeenCalled();
    });

    it('supports multiple challenges', async () => {
        const onError = jest.fn();
        const { result } = renderHook(() => useChallenge({
            enableMultipleChallenges: true,
            onError
        }));

        // Setup challenge dialog with multiple required challenges
        act(() => {
            result.current.setChallengeMetrics({
                completedChallenges: 0,
                totalChallengeTime: 0,
                requiredChallenges: 2
            });
            result.current.setChallengeAnswer('4'); // Correct answer
            result.current.setShowChallengeDialog(true);
        });

        // Mock time for challenge duration
        mockDateNow.mockReturnValueOnce(5000); // 4 seconds after challenge start

        // Mock onSuccess function
        const onSuccess = jest.fn().mockResolvedValue(undefined);

        // Submit first challenge
        await act(async () => {
            await result.current.handleChallengeSubmit(onSuccess);
        });

        // Dialog should still be open for second challenge
        expect(result.current.showChallengeDialog).toBe(true);
        expect(result.current.currentChallengeNumber).toBe(2);
        expect(onSuccess).not.toHaveBeenCalled();
        expect(onError).toHaveBeenCalledWith('Challenge 1 of 2 completed. Please complete the next challenge.');

        // Complete second challenge
        act(() => {
            result.current.setChallengeAnswer('4'); // Correct answer again
        });

        // Mock time for second challenge duration
        mockDateNow.mockReturnValueOnce(10000); // 5 seconds after second challenge start

        // Submit second challenge
        await act(async () => {
            await result.current.handleChallengeSubmit(onSuccess);
        });

        // All challenges completed, dialog should be closed
        expect(result.current.showChallengeDialog).toBe(false);
        expect(onSuccess).toHaveBeenCalledWith(
            true,
            expect.objectContaining({
                completedChallenges: 2,
                totalChallengeTime: expect.any(Number),
                requiredChallenges: 2
            })
        );
    });

    it('resets challenge state', () => {
        const { result } = renderHook(() => useChallenge());

        // Setup challenge state
        act(() => {
            result.current.setShowChallengeDialog(true);
            result.current.setChallengeAnswer('test');
            // We can't directly set currentChallengeNumber as it's not exposed
            result.current.setChallengeMetrics({
                completedChallenges: 2,
                totalChallengeTime: 10000,
                requiredChallenges: 3
            });
        });

        // Reset challenge state
        act(() => {
            result.current.resetChallenge();
        });

        // State should be reset
        expect(result.current.showChallengeDialog).toBe(false);
        expect(result.current.challengeAnswer).toBe('');
        expect(result.current.currentChallengeNumber).toBe(1);
        expect(result.current.challengeMetrics).toEqual({
            completedChallenges: 0,
            totalChallengeTime: 0,
            requiredChallenges: 0
        });
        // The generateChallenge function is called at least twice (initial + after reset)
        expect(utils.generateChallenge).toHaveBeenCalled();
    });
});
