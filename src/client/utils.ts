/**
 * Anti-Spam Utilities
 *
 * This file provides utility functions for anti-spam functionality across forms.
 *
 * @module client/utils
 */

import { Challenge, AntiSpamSettings } from "./types";
import { MIN_SUBMISSION_TIME, MAX_RANDOM_DELAY, ANTI_SPAM_FEATURES } from "./constants";

/**
 * Generate a random honeypot field name
 * @returns {string} Random honeypot field name
 */
export const generateHoneypotFieldName = (): string => {
    const prefix = ["contact", "user", "info", "data", "form"];
    const suffix = ["field", "input", "value", "entry", "data"];
    return `${prefix[Math.floor(Math.random() * prefix.length)]}_${suffix[Math.floor(Math.random() * suffix.length)]}`;
};

/**
 * Generate a random math challenge
 * @returns {Challenge} Math challenge with question and answer
 */
export const generateMathChallenge = (): Challenge => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    return {
        question: `What is ${num1} + ${num2}?`,
        answer: (num1 + num2).toString(),
    };
};

/**
 * Generate a custom question challenge
 * @returns {Challenge} Custom challenge with question and answer
 */
export const generateCustomChallenge = (): Challenge => {
    const questions = [
        {
            question:
                "Type the last word in this sentence: 'I agree to the terms and conditions'",
            answer: "conditions",
        },
        {
            question: "What color is the sky on a clear day?",
            answer: "blue",
        },
        {
            question: "Type the word 'human' to verify you're not a robot",
            answer: "human",
        },
        {
            question: "What is the opposite of 'up'?",
            answer: "down",
        },
        {
            question: "How many days are in a week?",
            answer: "7",
        },
    ];
    return questions[Math.floor(Math.random() * questions.length)];
};

/**
 * Generate a random challenge (either math or custom)
 * @returns {Challenge} Challenge with question and answer
 */
export const generateChallenge = (): Challenge => {
    return Math.random() > 0.5
        ? generateMathChallenge()
        : generateCustomChallenge();
};

/**
 * Get a random delay between MIN_SUBMISSION_TIME and MIN_SUBMISSION_TIME + MAX_RANDOM_DELAY seconds
 * @returns {number} Random delay in seconds
 */
export const getRandomDelay = (): number => {
    return MIN_SUBMISSION_TIME + Math.floor(Math.random() * (MAX_RANDOM_DELAY + 1));
};

/**
 * Calculate required challenges based on time deficit
 * @param {number} timeDeficitSeconds - Time deficit in seconds
 * @param {AntiSpamSettings} settings - Anti-spam settings to use (defaults to global settings)
 * @returns {number} Number of required challenges
 */
export const calculateRequiredChallenges = (
    timeDeficitSeconds: number,
    settings: AntiSpamSettings = ANTI_SPAM_FEATURES as AntiSpamSettings
): number => {
    if (timeDeficitSeconds <= 0) return 0;

    const challengesNeeded = Math.ceil(timeDeficitSeconds / settings.CHALLENGE_TIME_VALUE);
    return Math.min(challengesNeeded, settings.MAX_CHALLENGES);
};

/**
 * Create CSS styles for honeypot field
 * @returns {React.CSSProperties} CSS styles object
 */
export const getHoneypotStyles = (): React.CSSProperties => {
    return {
        position: "absolute",
        left: "-9999px",
        opacity: 0,
        height: 0,
        width: 0,
        overflow: "hidden",
    };
};

/**
 * Merge default settings with user-provided settings
 * @param {Partial<AntiSpamSettings>} userSettings - User-provided settings
 * @returns {AntiSpamSettings} Merged settings
 */
export const mergeSettings = (userSettings?: Partial<AntiSpamSettings>): AntiSpamSettings => {
    if (!userSettings) return ANTI_SPAM_FEATURES as AntiSpamSettings;

    return {
        ...ANTI_SPAM_FEATURES,
        ...userSettings,
    } as AntiSpamSettings;
};
