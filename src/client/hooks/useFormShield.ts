/**
 * Custom hook for form shield functionality
 *
 * This hook manages anti-spam features including time delay checks,
 * honeypot fields, and human verification challenges.
 *
 * @module client/hooks/useFormShield
 */

import { useState, useRef, useCallback, useEffect } from "react";
import {
    Challenge,
    ChallengeMetrics,
    AntiSpamCheckResult,
    BaseFormValues,
    FormShieldOptions,
    AntiSpamSettings
} from "../types";
import {
    generateChallenge,
    getRandomDelay,
    calculateRequiredChallenges,
    generateHoneypotFieldName,
    mergeSettings
} from "../utils";
import { useFormShieldContext } from "../FormShieldContext";

/**
 * Interface for the useFormShield hook return value
 * @interface UseFormShieldReturn
 */
interface UseFormShieldReturn {
    /** Time when the form was first focused */
    firstFocusTime: number | null;
    /** Whether the form focus has been tracked */
    formFocusTracked: React.MutableRefObject<boolean>;
    /** Required delay in seconds before form submission */
    requiredDelay: number;
    /** Whether to show the challenge dialog */
    showChallengeDialog: boolean;
    /** Set whether to show the challenge dialog */
    setShowChallengeDialog: React.Dispatch<React.SetStateAction<boolean>>;
    /** Current challenge question and answer */
    challenge: Challenge;
    /** Set a new challenge */
    setChallenge: React.Dispatch<React.SetStateAction<Challenge>>;
    /** User's answer to the challenge */
    challengeAnswer: string;
    /** Set the user's answer to the challenge */
    setChallengeAnswer: React.Dispatch<React.SetStateAction<string>>;
    /** Stored form values for after challenge completion */
    formValues: BaseFormValues | null;
    /** Set the stored form values */
    setFormValues: React.Dispatch<React.SetStateAction<BaseFormValues | null>>;
    /** Challenge metrics for tracking multiple challenges */
    challengeMetrics: ChallengeMetrics;
    /** Set challenge metrics */
    setChallengeMetrics: React.Dispatch<React.SetStateAction<ChallengeMetrics>>;
    /** Current challenge number (1-based) */
    currentChallengeNumber: number;
    /** Handle form field focus to track first interaction */
    handleFieldFocus: () => void;
    /** Check if the form passes anti-spam checks */
    checkAntiSpam: (values: BaseFormValues, honeypotFieldName?: string) => AntiSpamCheckResult;
    /** Handle challenge dialog submission */
    handleChallengeSubmit: (
        onSuccess: (
            values: BaseFormValues,
            challengeCompleted: boolean,
            challengeMetrics: ChallengeMetrics
        ) => Promise<void>
    ) => Promise<void>;
    /** Get honeypot field props */
    honeypotProps: {
        name: string;
        style: React.CSSProperties;
    };
    /** Get form shield data for submission */
    getFormShieldData: () => {
        firstFocusTime: number | null;
        submissionTime: number;
        challengeCompleted: boolean;
        challengeMetrics: ChallengeMetrics;
        antiSpamSettings: AntiSpamSettings;
    };
    /** Validate form submission */
    validateSubmission: (values: BaseFormValues) => AntiSpamCheckResult;
    /** Settings used by the form shield */
    settings: AntiSpamSettings;
}

/**
 * Custom hook for managing form shield functionality
 * @param {FormShieldOptions} options - Hook options
 * @returns {UseFormShieldReturn} Form shield state and handlers
 */
export const useFormShield = (options: FormShieldOptions = {}): UseFormShieldReturn => {
    // Get context values
    const context = useFormShieldContext();

    // Merge options with context values, giving priority to hook options
    const {
        onError = context.onError,
        honeypotFieldName: customHoneypotFieldName = context.honeypotFieldName
    } = options;

    // Merge settings with context settings and then with hook options
    const settings = mergeSettings({
        ...context.settings,
        ...options.settings
    });

    // Generate honeypot field name if not provided
    const [honeypotFieldName] = useState(customHoneypotFieldName || generateHoneypotFieldName());

    // Time tracking for anti-spam
    const [firstFocusTime, setFirstFocusTime] = useState<number | null>(null);
    const [requiredDelay] = useState(getRandomDelay());
    const formFocusTracked = useRef(false);

    // Challenge dialog state
    const [showChallengeDialog, setShowChallengeDialog] = useState(false);
    const [challenge, setChallenge] = useState(generateChallenge());
    const [challengeAnswer, setChallengeAnswer] = useState("");
    const [formValues, setFormValues] = useState<BaseFormValues | null>(null);

    // Multiple challenge tracking
    const [challengeMetrics, setChallengeMetrics] = useState<ChallengeMetrics>({
        completedChallenges: 0,
        totalChallengeTime: 0,
        requiredChallenges: 0
    });
    const [currentChallengeNumber, setCurrentChallengeNumber] = useState(1);
    const challengeStartTime = useRef<number | null>(null);

    // Error handling
    const setError = useCallback((error: string | null) => {
        if (error && onError) {
            onError(error);
        }
    }, [onError]);

    // Track first focus on any form field
    const handleFieldFocus = useCallback(() => {
        if (!formFocusTracked.current) {
            setFirstFocusTime(Date.now());
            formFocusTracked.current = true;
        }
    }, []);

    // Add focus event listeners to form fields
    useEffect(() => {
        const formElements = document.querySelectorAll(
            "input, textarea, select"
        );

        formElements.forEach((element) => {
            // Skip the honeypot field
            if (honeypotFieldName && element.id !== honeypotFieldName) {
                element.addEventListener("focus", handleFieldFocus);
            }
        });

        return () => {
            formElements.forEach((element) => {
                if (honeypotFieldName && element.id !== honeypotFieldName) {
                    element.removeEventListener("focus", handleFieldFocus);
                }
            });
        };
    }, [handleFieldFocus, honeypotFieldName]);

    // Track challenge dialog open/close
    useEffect(() => {
        // Start timing when dialog opens
        if (showChallengeDialog) {
            challengeStartTime.current = Date.now();
        } else {
            // Reset challenge answer when dialog closes
            setChallengeAnswer("");
        }
    }, [showChallengeDialog]);

    /**
     * Check if the form passes anti-spam checks
     * @param {BaseFormValues} values - Form values
     * @param {string} [fieldName] - Honeypot field name (if different from the one provided at initialization)
     * @returns {AntiSpamCheckResult} Result of anti-spam checks
     */
    const checkAntiSpam = useCallback((values: BaseFormValues, fieldName?: string): AntiSpamCheckResult => {
        let isBot = false;
        let timeDelayPassed = true;
        let errorMessage: string | null = null;
        let timeDeficitSeconds = 0;
        let requiredChallenges = 0;

        // Check if honeypot field is filled (bot detection)
        if (settings.ENABLE_HONEYPOT) {
            const honeypotName = fieldName || honeypotFieldName;
            if (honeypotName && values[honeypotName]) {
                isBot = true;
            }
        }

        // Time delay check
        if (settings.ENABLE_TIME_DELAY && firstFocusTime) {
            const elapsedSeconds = (Date.now() - firstFocusTime) / 1000;

            if (elapsedSeconds < requiredDelay) {
                timeDeficitSeconds = requiredDelay - elapsedSeconds;

                if (settings.ENABLE_MULTIPLE_CHALLENGES) {
                    requiredChallenges = calculateRequiredChallenges(timeDeficitSeconds, settings);

                    // Update challenge metrics
                    setChallengeMetrics(prev => ({
                        ...prev,
                        requiredChallenges: requiredChallenges
                    }));

                    errorMessage = `Please complete ${requiredChallenges} verification challenge${requiredChallenges > 1 ? 's' : ''}.`;
                } else {
                    errorMessage = `Please review your information carefully. Form submitted too quickly.`;
                }

                timeDelayPassed = false;
            }
        } else if (settings.ENABLE_TIME_DELAY) {
            // If somehow the focus time wasn't tracked
            errorMessage = "Unable to verify form interaction. Please try again.";
            timeDelayPassed = false;
        }

        return {
            passed: !errorMessage,
            isBot,
            timeDelayPassed,
            errorMessage,
            timeDeficitSeconds,
            requiredChallenges
        };
    }, [firstFocusTime, honeypotFieldName, requiredDelay, settings]);

    /**
     * Handle challenge dialog submission
     * @param {Function} onSuccess - Function to call on successful challenge completion
     */
    const handleChallengeSubmit = useCallback(async (
        onSuccess: (
            values: BaseFormValues,
            challengeCompleted: boolean,
            challengeMetrics: ChallengeMetrics
        ) => Promise<void>
    ) => {
        if (!formValues) return;

        // Check if the answer is correct (case insensitive)
        if (
            challengeAnswer.trim().toLowerCase() ===
            challenge.answer.toLowerCase()
        ) {
            // Calculate time spent on this challenge
            let challengeTime = 0;
            if (challengeStartTime.current) {
                challengeTime = Date.now() - challengeStartTime.current;
            }

            // Update challenge metrics
            const updatedMetrics = {
                completedChallenges: challengeMetrics.completedChallenges + 1,
                totalChallengeTime: challengeMetrics.totalChallengeTime + challengeTime,
                requiredChallenges: challengeMetrics.requiredChallenges
            };

            setChallengeMetrics(updatedMetrics);

            // Check if we need more challenges
            if (settings.ENABLE_MULTIPLE_CHALLENGES &&
                updatedMetrics.completedChallenges < updatedMetrics.requiredChallenges) {

                // Generate a new challenge for the next round
                setChallenge(generateChallenge());
                setChallengeAnswer("");
                setCurrentChallengeNumber(prev => prev + 1);
                challengeStartTime.current = Date.now();

                // Show progress message
                setError(`Challenge ${updatedMetrics.completedChallenges} of ${updatedMetrics.requiredChallenges} completed. Please complete the next challenge.`);
            } else {
                // All challenges completed or not using multiple challenges
                setShowChallengeDialog(false);
                setChallengeAnswer("");
                setCurrentChallengeNumber(1);

                // Ensure we have at least one completed challenge in the metrics
                if (updatedMetrics.completedChallenges === 0) {
                    updatedMetrics.completedChallenges = 1;
                }

                // Continue with form submission, indicating challenge was completed
                await onSuccess(formValues, true, updatedMetrics);
            }
        } else {
            setError("Incorrect answer. Please try again.");
            // Generate a new challenge
            setChallenge(generateChallenge());
            setChallengeAnswer("");
        }
    }, [challenge, challengeAnswer, challengeMetrics, formValues, setError, settings.ENABLE_MULTIPLE_CHALLENGES]);

    /**
     * Get form shield data for submission
     * @returns {Object} Form shield data
     */
    const getFormShieldData = useCallback(() => {
        return {
            firstFocusTime,
            submissionTime: Date.now(),
            challengeCompleted: challengeMetrics.completedChallenges > 0,
            challengeMetrics,
            antiSpamSettings: settings
        };
    }, [firstFocusTime, challengeMetrics, settings]);

    /**
     * Validate form submission
     * @param {BaseFormValues} values - Form values
     * @returns {AntiSpamCheckResult} Result of anti-spam checks
     */
    const validateSubmission = useCallback((values: BaseFormValues): AntiSpamCheckResult => {
        const result = checkAntiSpam(values);

        if (result.errorMessage) {
            setError(result.errorMessage);
        }

        // Store form values with bot flag for after challenge completion
        setFormValues({
            ...values,
            isBot: result.isBot,
        });

        // Show challenge dialog if enabled and needed
        if (settings.ENABLE_CHALLENGE_DIALOG && !result.passed) {
            // Reset challenge metrics if we're starting a new challenge sequence
            if (settings.ENABLE_MULTIPLE_CHALLENGES) {
                setChallengeMetrics({
                    completedChallenges: 0,
                    totalChallengeTime: 0,
                    requiredChallenges: result.requiredChallenges
                });
            }

            // Generate a new challenge and show the dialog
            setChallenge(generateChallenge());

            // Force this to run after the current execution context
            setTimeout(() => {
                setShowChallengeDialog(true);
            }, 0);
        }

        return result;
    }, [checkAntiSpam, setError, settings.ENABLE_CHALLENGE_DIALOG, settings.ENABLE_MULTIPLE_CHALLENGES]);

    // Honeypot field props
    const honeypotProps = {
        name: honeypotFieldName,
        style: {
            position: "absolute",
            left: "-9999px",
            opacity: 0,
            height: 0,
            width: 0,
            overflow: "hidden",
        } as React.CSSProperties
    };

    return {
        firstFocusTime,
        formFocusTracked,
        requiredDelay,
        showChallengeDialog,
        setShowChallengeDialog,
        challenge,
        setChallenge,
        challengeAnswer,
        setChallengeAnswer,
        formValues,
        setFormValues,
        challengeMetrics,
        setChallengeMetrics,
        currentChallengeNumber,
        handleFieldFocus,
        checkAntiSpam,
        handleChallengeSubmit,
        honeypotProps,
        getFormShieldData,
        validateSubmission,
        settings
    };
};
