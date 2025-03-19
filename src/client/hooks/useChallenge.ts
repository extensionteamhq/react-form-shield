/**
 * Custom hook for challenge dialog functionality
 *
 * This hook manages human verification challenges.
 *
 * @module client/hooks/useChallenge
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { Challenge, ChallengeMetrics, ChallengeTypeDefinition } from "../types";
import { calculateRequiredChallenges } from "../utils";
import { challengeRegistry, registerBuiltInChallengeTypes } from "../challenges";

// Ensure built-in challenge types are registered
registerBuiltInChallengeTypes();

/**
 * Interface for the useChallenge hook options
 * @interface UseChallengeOptions
 * @property {boolean} [enableMultipleChallenges] - Whether to enable multiple challenges
 * @property {number} [maxChallenges] - Maximum number of challenges
 * @property {number} [challengeTimeValue] - Time value of each challenge in seconds
 * @property {(error: string) => void} [onError] - Error handler
 */
export interface UseChallengeOptions {
    /** Whether to enable multiple challenges */
    enableMultipleChallenges?: boolean;
    /** Maximum number of challenges */
    maxChallenges?: number;
    /** Time value of each challenge in seconds */
    challengeTimeValue?: number;
    /** Error handler */
    onError?: (error: string) => void;
    /** Specific challenge types to use */
    challengeTypes?: string[];
    /** Preferred challenge type */
    preferredChallengeType?: string;
}

/**
 * Interface for the useChallenge hook return value
 * @interface UseChallengeReturn
 */
export interface UseChallengeReturn {
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
    /** Challenge metrics for tracking multiple challenges */
    challengeMetrics: ChallengeMetrics;
    /** Set challenge metrics */
    setChallengeMetrics: React.Dispatch<React.SetStateAction<ChallengeMetrics>>;
    /** Current challenge number (1-based) */
    currentChallengeNumber: number;
    /** Calculate required challenges based on time deficit */
    calculateRequiredChallenges: (timeDeficitSeconds: number) => number;
    /** Handle challenge dialog submission */
    handleChallengeSubmit: (
        onSuccess: (
            challengeCompleted: boolean,
            challengeMetrics: ChallengeMetrics
        ) => Promise<void>
    ) => Promise<void>;
    /** Reset challenge state */
    resetChallenge: () => void;
    /** Register a custom challenge type */
    registerChallengeType: (type: string, definition: ChallengeTypeDefinition) => void;
    /** Get available challenge types */
    getAvailableChallengeTypes: () => string[];
}

/**
 * Custom hook for managing challenge dialog functionality
 * @param {UseChallengeOptions} options - Hook options
 * @returns {UseChallengeReturn} Challenge dialog state and handlers
 */
export const useChallenge = (options: UseChallengeOptions = {}): UseChallengeReturn => {
    /**
     * Generate a new challenge based on options
     */
    const generateNewChallenge = useCallback((): Challenge => {
        if (options.preferredChallengeType) {
            return challengeRegistry.generateChallenge(options.preferredChallengeType);
        } else if (options.challengeTypes && options.challengeTypes.length > 0) {
            const type = options.challengeTypes[
                Math.floor(Math.random() * options.challengeTypes.length)
            ];
            return challengeRegistry.generateChallenge(type);
        } else {
            return challengeRegistry.generateChallenge();
        }
    }, [options.preferredChallengeType, options.challengeTypes]);

    // Challenge dialog state
    const [showChallengeDialog, setShowChallengeDialog] = useState(false);
    const [challenge, setChallenge] = useState(generateNewChallenge());
    const [challengeAnswer, setChallengeAnswer] = useState("");

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
        if (error && options.onError) {
            options.onError(error);
        }
    }, [options.onError]);

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
     * Calculate required challenges based on time deficit
     * @param {number} timeDeficitSeconds - Time deficit in seconds
     * @returns {number} Number of required challenges
     */
    const calculateRequiredChallengesFunc = useCallback((timeDeficitSeconds: number): number => {
        return calculateRequiredChallenges(timeDeficitSeconds, {
            ENABLE_MULTIPLE_CHALLENGES: !!options.enableMultipleChallenges,
            MAX_CHALLENGES: options.maxChallenges || 3,
            CHALLENGE_TIME_VALUE: options.challengeTimeValue || 5,
            // Add required properties for AntiSpamSettings
            ENABLE_TIME_DELAY: true,
            ENABLE_CHALLENGE_DIALOG: true,
            ENABLE_HONEYPOT: true
        });
    }, [options.enableMultipleChallenges, options.maxChallenges, options.challengeTimeValue]);

    /**
     * Handle challenge dialog submission
     * @param {Function} onSuccess - Function to call on successful challenge completion
     */
    const handleChallengeSubmit = useCallback(async (
        onSuccess: (
            challengeCompleted: boolean,
            challengeMetrics: ChallengeMetrics
        ) => Promise<void>
    ) => {
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
            if (options.enableMultipleChallenges &&
                updatedMetrics.completedChallenges < updatedMetrics.requiredChallenges) {

                // Generate a new challenge for the next round
                setChallenge(generateNewChallenge());
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
                await onSuccess(true, updatedMetrics);
            }
        } else {
            setError("Incorrect answer. Please try again.");
            // Generate a new challenge
            setChallenge(generateNewChallenge());
            setChallengeAnswer("");
        }
    }, [challenge, challengeAnswer, challengeMetrics, options.enableMultipleChallenges, setError, generateNewChallenge]);

    /**
     * Reset challenge state
     */
    const resetChallenge = useCallback(() => {
        setShowChallengeDialog(false);
        setChallengeAnswer("");
        setCurrentChallengeNumber(1);
        setChallengeMetrics({
            completedChallenges: 0,
            totalChallengeTime: 0,
            requiredChallenges: 0
        });
        setChallenge(generateNewChallenge());
    }, [generateNewChallenge]);

    /**
     * Register a custom challenge type
     * @param {string} type - The type identifier
     * @param {ChallengeTypeDefinition} definition - The challenge type definition
     */
    const registerChallengeType = useCallback((type: string, definition: ChallengeTypeDefinition): void => {
        challengeRegistry.register(type, definition);
    }, []);

    /**
     * Get available challenge types
     * @returns {string[]} Array of registered type identifiers
     */
    const getAvailableChallengeTypes = useCallback((): string[] => {
        return challengeRegistry.getTypes();
    }, []);

    return {
        showChallengeDialog,
        setShowChallengeDialog,
        challenge,
        setChallenge,
        challengeAnswer,
        setChallengeAnswer,
        challengeMetrics,
        setChallengeMetrics,
        currentChallengeNumber,
        calculateRequiredChallenges: calculateRequiredChallengesFunc,
        handleChallengeSubmit,
        resetChallenge,
        registerChallengeType,
        getAvailableChallengeTypes
    };
};
