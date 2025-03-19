/**
 * Anti-Spam Types
 *
 * This file defines TypeScript types used for anti-spam functionality across forms.
 *
 * @module client/types
 */

/**
 * Type definition for challenge
 * @interface Challenge
 * @property {string} type - The type of challenge
 * @property {string} question - The challenge question
 * @property {string} answer - The expected answer
 * @property {Record<string, any>} [data] - Optional additional data specific to challenge type
 */
export interface Challenge {
    type: string;
    question: string;
    answer: string;
    data?: Record<string, any>;
}

/**
 * Props for challenge presentation components
 * @interface ChallengePresentationProps
 * @property {Challenge} challenge - The challenge to present
 * @property {string} answer - The current answer
 * @property {(answer: string) => void} setAnswer - Function to update the answer
 * @property {() => void} onSubmit - Function to submit the answer
 */
export interface ChallengePresentationProps {
    challenge: Challenge;
    answer: string;
    setAnswer: (answer: string) => void;
    onSubmit: () => void;
}

/**
 * Definition for a challenge type
 * @interface ChallengeTypeDefinition
 * @property {() => Challenge} generate - Function to generate a challenge of this type
 * @property {(answer: string, challenge: Challenge) => boolean} [validate] - Optional function to validate an answer
 * @property {React.ComponentType<ChallengePresentationProps>} [component] - Optional component for custom rendering
 */
export interface ChallengeTypeDefinition {
    generate: () => Challenge;
    validate?: (answer: string, challenge: Challenge) => boolean;
    component?: React.ComponentType<ChallengePresentationProps>;
}

/**
 * Type definition for challenge metrics
 * @interface ChallengeMetrics
 * @property {number} completedChallenges - Number of challenges completed
 * @property {number} totalChallengeTime - Total time spent on challenges in milliseconds
 * @property {number} requiredChallenges - Number of challenges required to meet time deficit
 */
export interface ChallengeMetrics {
    completedChallenges: number;
    totalChallengeTime: number;
    requiredChallenges: number;
}

/**
 * Type definition for anti-spam check result
 * @interface AntiSpamCheckResult
 * @property {boolean} passed - Whether the form passed anti-spam checks
 * @property {boolean} isBot - Whether the submission is likely from a bot
 * @property {boolean} timeDelayPassed - Whether the time delay check passed
 * @property {string | null} errorMessage - Error message if check failed
 * @property {number} timeDeficitSeconds - Seconds remaining in time delay
 * @property {number} requiredChallenges - Number of challenges required to compensate for time deficit
 */
export interface AntiSpamCheckResult {
    passed: boolean;
    isBot: boolean;
    timeDelayPassed: boolean;
    errorMessage: string | null;
    timeDeficitSeconds: number;
    requiredChallenges: number;
}

/**
 * Type for honeypot field values
 * @type HoneypotValue
 */
export type HoneypotValue = string | number | boolean | undefined;

/**
 * Base interface for form values with anti-spam properties
 * @interface BaseFormValues
 * @property {boolean} [isBot] - Flag to indicate if this is a bot submission
 */
export interface BaseFormValues {
    isBot?: boolean;
    // Index signature for honeypot fields
    [honeypotField: string]: HoneypotValue;
}

/**
 * Type definition for anti-spam settings
 * @interface AntiSpamSettings
 * @property {boolean} ENABLE_TIME_DELAY - Whether to enable time delay check
 * @property {boolean} ENABLE_CHALLENGE_DIALOG - Whether to enable challenge dialog
 * @property {boolean} ENABLE_HONEYPOT - Whether to enable honeypot field
 * @property {boolean} ENABLE_MULTIPLE_CHALLENGES - Whether to enable multiple challenges
 * @property {number} CHALLENGE_TIME_VALUE - How many seconds each completed challenge is worth
 * @property {number} MAX_CHALLENGES - Maximum number of challenges to present
 */
export interface AntiSpamSettings {
    ENABLE_TIME_DELAY: boolean;
    ENABLE_CHALLENGE_DIALOG: boolean;
    ENABLE_HONEYPOT: boolean;
    ENABLE_MULTIPLE_CHALLENGES: boolean;
    CHALLENGE_TIME_VALUE: number;
    MAX_CHALLENGES: number;
}

/**
 * Type definition for form submission data with anti-spam metadata
 * @interface FormSubmissionData
 * @property {boolean} [isBot] - Flag to indicate if this is a bot submission
 * @property {number | null} firstFocusTime - Timestamp when form was first focused
 * @property {number} submissionTime - Timestamp when form was submitted
 * @property {boolean} challengeCompleted - Whether the challenge was completed
 * @property {ChallengeMetrics} challengeMetrics - Metrics about challenge completion
 * @property {AntiSpamSettings} [antiSpamSettings] - Form-level anti-spam settings
 */
export interface FormSubmissionData {
    isBot?: boolean;
    firstFocusTime: number | null;
    submissionTime: number;
    challengeCompleted: boolean;
    challengeMetrics: ChallengeMetrics;
    antiSpamSettings?: AntiSpamSettings;
    // Index signature for honeypot fields
    [honeypotField: string]: HoneypotValue | ChallengeMetrics | AntiSpamSettings | null;
}

/**
 * Options for the useFormShield hook
 * @interface FormShieldOptions
 * @property {AntiSpamSettings} settings - Anti-spam settings
 * @property {(error: string) => void} onError - Function to call when an error occurs
 * @property {string} honeypotFieldName - Custom honeypot field name
 * @property {string[]} challengeTypes - Specific challenge types to use
 * @property {string} preferredChallengeType - Preferred challenge type
 */
export interface FormShieldOptions {
    settings?: Partial<AntiSpamSettings>;
    onError?: (error: string) => void;
    honeypotFieldName?: string;
    challengeTypes?: string[];
    preferredChallengeType?: string;
}

/**
 * Props for the HoneypotField component
 * @interface HoneypotFieldProps
 * @property {string} name - Field name
 * @property {React.CSSProperties} style - Additional styles
 */
export interface HoneypotFieldProps {
    name: string;
    style?: React.CSSProperties;
}

/**
 * Props for the ChallengeDialog component
 * @interface ChallengeDialogProps
 * @property {boolean} open - Whether the dialog is open
 * @property {Challenge} challenge - Current challenge
 * @property {string} challengeAnswer - User's answer to the challenge
 * @property {React.Dispatch<React.SetStateAction<string>>} setChallengeAnswer - Function to update the answer
 * @property {() => Promise<void>} onSubmit - Function to call when the challenge is submitted
 * @property {string | null} error - Error message
 * @property {number} currentChallengeNumber - Current challenge number (1-based)
 * @property {number} totalRequiredChallenges - Total number of required challenges
 * @property {boolean} multipleEnabled - Whether multiple challenges are enabled
 * @property {string} title - Custom title for the dialog
 * @property {string} description - Custom description for the dialog
 * @property {string} buttonText - Custom button text
 */
export interface ChallengeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    challenge: Challenge;
    challengeAnswer: string;
    setChallengeAnswer: React.Dispatch<React.SetStateAction<string>>;
    onSubmit: () => Promise<void>;
    error?: string | null;
    currentChallengeNumber?: number;
    totalRequiredChallenges?: number;
    multipleEnabled?: boolean;
    title?: string;
    description?: string;
    buttonText?: string;
}
