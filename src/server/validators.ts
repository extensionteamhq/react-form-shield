/**
 * Server-Side Anti-Spam Validators
 *
 * This file provides validation functions for server-side anti-spam checks.
 *
 * @module server/validators
 */

import { FormShieldRequestData, FormShieldValidationResult, FormShieldMiddlewareOptions } from './types';

// Default anti-spam settings
const DEFAULT_OPTIONS: Required<FormShieldMiddlewareOptions> = {
    honeypotCheck: true,
    timeDelayCheck: true,
    challengeCheck: true,
    minSubmissionTime: 10, // 10 seconds
    challengeTimeValue: 5, // 5 seconds per challenge
};

/**
 * Validate honeypot fields in the request body
 * @param {FormShieldRequestData} body - Request body
 * @returns {FormShieldValidationResult} Validation result
 */
export const validateHoneypot = (body: FormShieldRequestData): FormShieldValidationResult => {
    // Check for honeypot fields (any unexpected fields with non-empty values might be honeypots)
    const honeypotFields = Object.keys(body).filter((key) => {
        // Only consider fields with non-empty values
        if (!body[key]) {
            return false;
        }

        // Skip known fields
        if (
            key === 'firstFocusTime' ||
            key === 'submissionTime' ||
            key === 'challengeCompleted' ||
            key === 'challengeMetrics' ||
            key === 'antiSpamSettings'
        ) {
            return false;
        }

        // Check if the field name matches common honeypot patterns
        return (
            key.includes('_input') ||
            key.includes('_field') ||
            key.includes('_data') ||
            key.includes('_value') ||
            key.includes('_entry')
        );
    });

    if (honeypotFields.length > 0) {
        return {
            valid: false,
            error: 'Honeypot field detected',
            isBot: true,
        };
    }

    return {
        valid: true,
        error: null,
        isBot: false,
    };
};

/**
 * Validate time delay in the request body
 * @param {FormShieldRequestData} body - Request body
 * @param {number} minSubmissionTime - Minimum required time in seconds
 * @param {number} challengeTimeValue - How many seconds each completed challenge is worth
 * @returns {FormShieldValidationResult} Validation result
 */
export const validateTimeDelay = (
    body: FormShieldRequestData,
    minSubmissionTime: number = DEFAULT_OPTIONS.minSubmissionTime,
    challengeTimeValue: number = DEFAULT_OPTIONS.challengeTimeValue
): FormShieldValidationResult => {
    const { firstFocusTime, submissionTime, challengeMetrics } = body;

    // If firstFocusTime is not provided, we can't validate time delay
    if (!firstFocusTime) {
        return {
            valid: false,
            error: 'Unable to verify form interaction. Please try again.',
            isBot: false,
        };
    }

    // Calculate elapsed time in seconds
    const elapsedSeconds = (submissionTime - firstFocusTime) / 1000;

    // Get challenge metrics if available
    const completedChallenges = challengeMetrics?.completedChallenges || 0;

    // Calculate time credit from challenges
    const challengeTimeCredit = completedChallenges * challengeTimeValue;

    // Check if total time (elapsed + challenge credit) meets requirement
    if (elapsedSeconds + challengeTimeCredit < minSubmissionTime) {
        return {
            valid: false,
            error: 'Form submitted too quickly. Please try again.',
            isBot: false,
        };
    }

    return {
        valid: true,
        error: null,
        isBot: false,
    };
};

/**
 * Validate challenge completion in the request body
 * @param {FormShieldRequestData} body - Request body
 * @returns {FormShieldValidationResult} Validation result
 */
export const validateChallenge = (body: FormShieldRequestData): FormShieldValidationResult => {
    const { challengeCompleted, challengeMetrics } = body;

    // If challenge dialog is enabled but not completed, reject the submission
    if (!challengeCompleted) {
        return {
            valid: false,
            error: 'Human verification required. Please complete the challenge.',
            isBot: false,
        };
    }

    // If challenge metrics are not provided, reject the submission
    if (!challengeMetrics) {
        return {
            valid: false,
            error: 'Invalid challenge metrics. Please try again.',
            isBot: false,
        };
    }

    // If no challenges were completed, reject the submission
    if (challengeMetrics.completedChallenges < 1) {
        return {
            valid: false,
            error: 'Challenge not completed. Please try again.',
            isBot: false,
        };
    }

    // If required challenges were not completed, reject the submission
    if (
        challengeMetrics.requiredChallenges > 0 &&
        challengeMetrics.completedChallenges < challengeMetrics.requiredChallenges
    ) {
        return {
            valid: false,
            error: `Please complete all required challenges (${challengeMetrics.completedChallenges}/${challengeMetrics.requiredChallenges} completed).`,
            isBot: false,
        };
    }

    return {
        valid: true,
        error: null,
        isBot: false,
    };
};

/**
 * Validate form shield data in the request body
 * @param {FormShieldRequestData} body - Request body
 * @param {FormShieldMiddlewareOptions} options - Validation options
 * @returns {FormShieldValidationResult} Validation result
 */
export const validateFormShield = (
    body: FormShieldRequestData,
    options: FormShieldMiddlewareOptions = {}
): FormShieldValidationResult => {
    // Merge options with defaults
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

    // Check honeypot fields
    if (mergedOptions.honeypotCheck) {
        const honeypotResult = validateHoneypot(body);
        if (!honeypotResult.valid) {
            return honeypotResult;
        }
    }

    // Check time delay
    if (mergedOptions.timeDelayCheck) {
        const timeDelayResult = validateTimeDelay(
            body,
            mergedOptions.minSubmissionTime,
            mergedOptions.challengeTimeValue
        );
        if (!timeDelayResult.valid) {
            // If challenge check is enabled and challenge was completed, allow the submission
            if (mergedOptions.challengeCheck && body.challengeCompleted) {
                // Continue with validation
            } else {
                return timeDelayResult;
            }
        }
    }

    // Check challenge completion
    if (mergedOptions.challengeCheck) {
        const challengeResult = validateChallenge(body);
        if (!challengeResult.valid) {
            return challengeResult;
        }
    }

    return {
        valid: true,
        error: null,
        isBot: false,
    };
};
