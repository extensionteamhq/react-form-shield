import * as utils from './utils';
import {
    generateHoneypotFieldName,
    generateMathChallenge,
    generateCustomChallenge,
    generateChallenge,
    getRandomDelay,
    calculateRequiredChallenges,
    getHoneypotStyles,
    mergeSettings
} from './utils';
import { ANTI_SPAM_FEATURES, MIN_SUBMISSION_TIME, MAX_RANDOM_DELAY } from './constants';

// Mock Math.random for consistent test results
const mockRandom = jest.spyOn(Math, 'random');

describe('Utils', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('generateHoneypotFieldName', () => {
        it('generates a random honeypot field name', () => {
            // Mock Math.random to return predictable values
            mockRandom.mockReturnValueOnce(0).mockReturnValueOnce(0);

            const fieldName = generateHoneypotFieldName();
            expect(fieldName).toBe('contact_field');

            // Different random values should produce different field names
            mockRandom.mockReturnValueOnce(0.9).mockReturnValueOnce(0.9);

            const fieldName2 = generateHoneypotFieldName();
            expect(fieldName2).toBe('form_data');

            expect(fieldName).not.toBe(fieldName2);
        });
    });

    describe('generateMathChallenge', () => {
        it('generates a math challenge with question and answer', () => {
            // Mock Math.random to return predictable values
            mockRandom.mockReturnValueOnce(0.5).mockReturnValueOnce(0.5);

            const challenge = generateMathChallenge();

            expect(challenge).toHaveProperty('question');
            expect(challenge).toHaveProperty('answer');
            expect(challenge.question).toMatch(/What is \d+ \+ \d+\?/);

            // Extract numbers from the question
            const numbers = challenge.question.match(/\d+/g);
            if (numbers && numbers.length === 2) {
                const expectedAnswer = (parseInt(numbers[0]) + parseInt(numbers[1])).toString();
                expect(challenge.answer).toBe(expectedAnswer);
            }
        });
    });

    describe('generateCustomChallenge', () => {
        it('generates a custom challenge with question and answer', () => {
            // Mock Math.random to return predictable values
            mockRandom.mockReturnValueOnce(0);

            const challenge = generateCustomChallenge();

            expect(challenge).toHaveProperty('question');
            expect(challenge).toHaveProperty('answer');

            // Should return the first challenge in the array with Math.random() = 0
            expect(challenge.question).toContain('Type the last word in this sentence');
            expect(challenge.answer).toBe('conditions');
        });
    });

    describe('generateChallenge', () => {
        it('generates either a math or custom challenge', () => {
            // Mock Math.random to return a value that will select math challenge
            mockRandom.mockReturnValueOnce(0.6);

            // Create a spy on generateMathChallenge
            const mathChallengeSpy = jest.spyOn(utils, 'generateMathChallenge');
            const customChallengeSpy = jest.spyOn(utils, 'generateCustomChallenge');

            // Call generateChallenge
            generateChallenge();

            // With Math.random() > 0.5, it should call generateMathChallenge
            expect(mathChallengeSpy).toHaveBeenCalled();
            expect(customChallengeSpy).not.toHaveBeenCalled();

            // Reset mocks
            mathChallengeSpy.mockRestore();
            customChallengeSpy.mockRestore();

            // Now test with Math.random() < 0.5
            mockRandom.mockReturnValueOnce(0.4);

            // Create new spies
            const mathChallengeSpy2 = jest.spyOn(utils, 'generateMathChallenge');
            const customChallengeSpy2 = jest.spyOn(utils, 'generateCustomChallenge');

            // Call generateChallenge again
            generateChallenge();

            // With Math.random() < 0.5, it should call generateCustomChallenge
            expect(mathChallengeSpy2).not.toHaveBeenCalled();
            expect(customChallengeSpy2).toHaveBeenCalled();

            // Reset mocks
            mathChallengeSpy2.mockRestore();
            customChallengeSpy2.mockRestore();
        });
    });

    describe('getRandomDelay', () => {
        it('returns a random delay between MIN_SUBMISSION_TIME and MIN_SUBMISSION_TIME + MAX_RANDOM_DELAY', () => {
            // Mock Math.random to return predictable values
            mockRandom.mockReturnValueOnce(0);

            const delay = getRandomDelay();

            // With Math.random() = 0, it should return MIN_SUBMISSION_TIME
            expect(delay).toBe(MIN_SUBMISSION_TIME);

            // With Math.random() = 1, it should return MIN_SUBMISSION_TIME + MAX_RANDOM_DELAY
            mockRandom.mockReturnValueOnce(0.99999); // Use a value very close to 1 to avoid rounding issues

            const delay2 = getRandomDelay();

            // Check that the delay is close to MIN_SUBMISSION_TIME + MAX_RANDOM_DELAY
            expect(delay2).toBeGreaterThanOrEqual(MIN_SUBMISSION_TIME + MAX_RANDOM_DELAY - 1);
            expect(delay2).toBeLessThanOrEqual(MIN_SUBMISSION_TIME + MAX_RANDOM_DELAY);
        });
    });

    describe('calculateRequiredChallenges', () => {
        it('returns 0 when time deficit is 0 or negative', () => {
            const challenges = calculateRequiredChallenges(0);
            expect(challenges).toBe(0);

            const challenges2 = calculateRequiredChallenges(-5);
            expect(challenges2).toBe(0);
        });

        it('calculates required challenges based on time deficit', () => {
            // Mock settings
            const settings = {
                ...ANTI_SPAM_FEATURES,
                CHALLENGE_TIME_VALUE: 5,
                MAX_CHALLENGES: 3
            };

            // Time deficit of 7 seconds with CHALLENGE_TIME_VALUE of 5 should require 2 challenges
            const challenges = calculateRequiredChallenges(7, settings);
            expect(challenges).toBe(2);

            // Time deficit of 20 seconds with MAX_CHALLENGES of 3 should be capped at 3
            const challenges2 = calculateRequiredChallenges(20, settings);
            expect(challenges2).toBe(3);
        });
    });

    describe('getHoneypotStyles', () => {
        it('returns CSS styles to hide honeypot field', () => {
            const styles = getHoneypotStyles();

            expect(styles).toEqual({
                position: 'absolute',
                left: '-9999px',
                opacity: 0,
                height: 0,
                width: 0,
                overflow: 'hidden'
            });
        });
    });

    describe('mergeSettings', () => {
        it('returns default settings when no user settings provided', () => {
            const settings = mergeSettings();

            expect(settings).toEqual(ANTI_SPAM_FEATURES);
        });

        it('merges user settings with default settings', () => {
            const userSettings = {
                ENABLE_HONEYPOT: false,
                CHALLENGE_TIME_VALUE: 10
            };

            const settings = mergeSettings(userSettings);

            expect(settings).toEqual({
                ...ANTI_SPAM_FEATURES,
                ...userSettings
            });
        });
    });
});
