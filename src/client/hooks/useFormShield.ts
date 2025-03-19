/**
 * Custom hook for form shield functionality
 *
 * This hook manages anti-spam features including time delay checks,
 * honeypot fields, and human verification challenges.
 *
 * @module client/hooks/useFormShield
 */

import { useState, useCallback } from "react";
import {
    AntiSpamCheckResult,
    BaseFormValues,
    FormShieldOptions,
    AntiSpamSettings,
    ChallengeMetrics
} from "../types";
import { mergeSettings } from "../utils";
import { useFormShieldContext } from "../FormShieldContext";
import { useHoneypot } from "./useHoneypot";
import { useTimeDelay } from "./useTimeDelay";
import { useChallenge } from "./useChallenge";

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
    /** Current challenge */
    challenge: any;
    /** Set a new challenge */
    setChallenge: React.Dispatch<React.SetStateAction<any>>;
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
    /** Register a custom challenge type */
    registerChallengeType: (type: string, definition: any) => void;
    /** Get available challenge types */
    getAvailableChallengeTypes: () => string[];
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
        honeypotFieldName: customHoneypotFieldName = context.honeypotFieldName,
        challengeTypes = options.challengeTypes,
        preferredChallengeType = options.preferredChallengeType
    } = options;

    // Merge settings with context settings and then with hook options
    const settings = mergeSettings({
        ...context.settings,
        ...options.settings
    });

    // Use specialized hooks
    const { honeypotProps, checkHoneypot } = useHoneypot({
        fieldName: customHoneypotFieldName,
        enabled: settings.ENABLE_HONEYPOT
    });

    const {
        firstFocusTime,
        requiredDelay,
        handleFieldFocus,
        checkTimeDelay
    } = useTimeDelay({
        enabled: settings.ENABLE_TIME_DELAY
    });

    const {
        showChallengeDialog,
        setShowChallengeDialog,
        challenge,
        challengeAnswer,
        setChallengeAnswer,
        challengeMetrics,
        currentChallengeNumber,
        calculateRequiredChallenges,
        handleChallengeSubmit: handleChallengeSubmitInternal,
        resetChallenge,
        registerChallengeType,
        getAvailableChallengeTypes
    } = useChallenge({
        enableMultipleChallenges: settings.ENABLE_MULTIPLE_CHALLENGES,
        maxChallenges: settings.MAX_CHALLENGES,
        challengeTimeValue: settings.CHALLENGE_TIME_VALUE,
        onError,
        challengeTypes,
        preferredChallengeType
    });

    // Store form values for after challenge completion
    const [formValues, setFormValues] = useState<BaseFormValues | null>(null);

    /**
     * Check if the form passes anti-spam checks
     * @param {BaseFormValues} values - Form values
     * @returns {AntiSpamCheckResult} Result of anti-spam checks
     */
    const checkAntiSpam = useCallback((values: BaseFormValues): AntiSpamCheckResult => {
        // Check honeypot
        const isBot = checkHoneypot(values);

        // Check time delay
        const timeDelayResult = checkTimeDelay();
        const { passed: timeDelayPassed, timeDeficitSeconds } = timeDelayResult;

        // Calculate required challenges if time delay failed
        let requiredChallenges = 0;
        if (!timeDelayPassed && settings.ENABLE_CHALLENGE_DIALOG) {
            requiredChallenges = calculateRequiredChallenges(timeDeficitSeconds);
        }

        // Determine error message
        let errorMessage: string | null = null;
        if (!timeDelayPassed) {
            if (settings.ENABLE_MULTIPLE_CHALLENGES && settings.ENABLE_CHALLENGE_DIALOG) {
                errorMessage = `Please complete ${requiredChallenges} verification challenge${requiredChallenges > 1 ? 's' : ''}.`;
            } else if (settings.ENABLE_CHALLENGE_DIALOG) {
                errorMessage = `Please verify you're human.`;
            } else {
                errorMessage = `Please review your information carefully. Form submitted too quickly.`;
            }
        }

        return {
            passed: timeDelayPassed && !isBot,
            isBot,
            timeDelayPassed,
            errorMessage,
            timeDeficitSeconds,
            requiredChallenges
        };
    }, [checkHoneypot, checkTimeDelay, calculateRequiredChallenges, settings]);

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

        await handleChallengeSubmitInternal(async (challengeCompleted, metrics) => {
            await onSuccess(formValues, challengeCompleted, metrics);
        });
    }, [handleChallengeSubmitInternal, formValues]);

    /**
     * Validate form submission
     * @param {BaseFormValues} values - Form values
     * @returns {AntiSpamCheckResult} Result of anti-spam checks
     */
    const validateSubmission = useCallback((values: BaseFormValues): AntiSpamCheckResult => {
        const result = checkAntiSpam(values);

        if (result.errorMessage && onError) {
            onError(result.errorMessage);
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
                resetChallenge();
            }

            // Force this to run after the current execution context
            setTimeout(() => {
                setShowChallengeDialog(true);
            }, 0);
        }

        return result;
    }, [checkAntiSpam, onError, resetChallenge, settings.ENABLE_CHALLENGE_DIALOG, settings.ENABLE_MULTIPLE_CHALLENGES, setShowChallengeDialog]);

    /**
     * Get form shield data for submission
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

    // Create a reference to the challenge's setChallenge function
    const setChallenge: React.Dispatch<React.SetStateAction<any>> = useCallback((newChallenge) => {
        // This is a placeholder since we don't have direct access to setChallenge from useChallenge
        console.warn('setChallenge is not fully implemented in the refactored version');
    }, []) as React.Dispatch<React.SetStateAction<any>>;

    // Create a reference to the challenge metrics' setChallengeMetrics function
    const setChallengeMetrics: React.Dispatch<React.SetStateAction<ChallengeMetrics>> = useCallback((newMetrics) => {
        // This is a placeholder since we don't have direct access to setChallengeMetrics from useChallenge
        console.warn('setChallengeMetrics is not fully implemented in the refactored version');
    }, []) as React.Dispatch<React.SetStateAction<ChallengeMetrics>>;

    return {
        firstFocusTime,
        formFocusTracked: { current: false }, // This is a placeholder
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
        settings,
        registerChallengeType,
        getAvailableChallengeTypes
    };
};
