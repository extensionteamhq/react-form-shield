/**
 * Anti-Spam Constants
 *
 * This file defines constants used for anti-spam functionality across forms.
 *
 * @module client/constants
 */

/**
 * Anti-spam feature flags - toggle these to enable/disable features
 * @constant
 */
export const ANTI_SPAM_FEATURES = {
    /** Set to true to enable minimum time delay check */
    ENABLE_TIME_DELAY: true,
    /** Set to true to enable human verification challenge */
    ENABLE_CHALLENGE_DIALOG: true,
    /** Set to true to enable honeypot field */
    ENABLE_HONEYPOT: true,
    /** Set to true to enable multiple challenges to compensate for time delay */
    ENABLE_MULTIPLE_CHALLENGES: true,
    /** How many seconds each completed challenge is worth */
    CHALLENGE_TIME_VALUE: 5,
    /** Maximum number of challenges to present */
    MAX_CHALLENGES: 3,
};

/**
 * Minimum required time in seconds between form load and submission
 * @constant
 */
export const MIN_SUBMISSION_TIME = 10; // 10 seconds

/**
 * Maximum random delay in seconds to add to minimum submission time
 * @constant
 */
export const MAX_RANDOM_DELAY = 5; // Up to 5 additional seconds
