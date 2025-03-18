/**
 * Server-Side Anti-Spam Types
 *
 * This file defines TypeScript types used for server-side anti-spam functionality.
 *
 * @module server/types
 */

/**
 * Type definition for form shield middleware options
 * @interface FormShieldMiddlewareOptions
 * @property {boolean} honeypotCheck - Whether to check honeypot fields
 * @property {boolean} timeDelayCheck - Whether to check time delay
 * @property {boolean} challengeCheck - Whether to check challenge completion
 * @property {number} minSubmissionTime - Minimum required time in seconds between form load and submission
 * @property {number} challengeTimeValue - How many seconds each completed challenge is worth
 */
export interface FormShieldMiddlewareOptions {
    honeypotCheck?: boolean;
    timeDelayCheck?: boolean;
    challengeCheck?: boolean;
    minSubmissionTime?: number;
    challengeTimeValue?: number;
}

/**
 * Type definition for form shield validation result
 * @interface FormShieldValidationResult
 * @property {boolean} valid - Whether the form submission is valid
 * @property {string | null} error - Error message if validation failed
 * @property {boolean} isBot - Whether the submission is likely from a bot
 */
export interface FormShieldValidationResult {
    valid: boolean;
    error: string | null;
    isBot: boolean;
}

/**
 * Type definition for form shield data in request body
 * @interface FormShieldRequestData
 * @property {number | null} firstFocusTime - Timestamp when form was first focused
 * @property {number} submissionTime - Timestamp when form was submitted
 * @property {boolean} challengeCompleted - Whether the challenge was completed
 * @property {Object} challengeMetrics - Metrics about challenge completion
 * @property {number} challengeMetrics.completedChallenges - Number of challenges completed
 * @property {number} challengeMetrics.totalChallengeTime - Total time spent on challenges in milliseconds
 * @property {number} challengeMetrics.requiredChallenges - Number of challenges required to meet time deficit
 * @property {Object} antiSpamSettings - Form-level anti-spam settings
 */
export interface FormShieldRequestData {
    firstFocusTime: number | null;
    submissionTime: number;
    challengeCompleted: boolean;
    challengeMetrics: {
        completedChallenges: number;
        totalChallengeTime: number;
        requiredChallenges: number;
    };
    antiSpamSettings?: {
        ENABLE_TIME_DELAY: boolean;
        ENABLE_CHALLENGE_DIALOG: boolean;
        ENABLE_HONEYPOT: boolean;
        ENABLE_MULTIPLE_CHALLENGES: boolean;
        CHALLENGE_TIME_VALUE: number;
        MAX_CHALLENGES: number;
    };
    [key: string]: any;
}

/**
 * Type definition for Express-like request object
 * @interface Request
 * @property {Object} body - Request body
 * @property {Object} headers - Request headers
 * @property {string} method - Request method
 */
export interface Request {
    body: any;
    headers: Record<string, string | string[] | undefined>;
    method: string;
}

/**
 * Type definition for Express-like response object
 * @interface Response
 * @property {Function} status - Set response status code
 * @property {Function} json - Send JSON response
 * @property {Function} send - Send response
 */
export interface Response {
    status: (code: number) => Response;
    json: (body: any) => void;
    send: (body: any) => void;
}

/**
 * Type definition for Express-like next function
 * @type NextFunction
 */
export type NextFunction = (error?: any) => void;
