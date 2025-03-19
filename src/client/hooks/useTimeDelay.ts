/**
 * Custom hook for time delay verification
 *
 * This hook manages time delay verification to prevent rapid form submissions.
 *
 * @module client/hooks/useTimeDelay
 */

import { useState, useRef, useCallback } from "react";
import { getRandomDelay } from "../utils";

/**
 * Interface for the useTimeDelay hook options
 * @interface UseTimeDelayOptions
 * @property {number} [requiredDelay] - Custom required delay in seconds
 * @property {boolean} [enabled] - Whether to enable time delay check
 */
export interface UseTimeDelayOptions {
    /** Custom required delay in seconds */
    requiredDelay?: number;
    /** Whether to enable time delay check */
    enabled?: boolean;
}

/**
 * Interface for the useTimeDelay hook return value
 * @interface UseTimeDelayReturn
 */
export interface UseTimeDelayReturn {
    /** Time when the form was first focused */
    firstFocusTime: number | null;
    /** Whether the form focus has been tracked */
    formFocusTracked: React.MutableRefObject<boolean>;
    /** Required delay in seconds before form submission */
    requiredDelay: number;
    /** Handle form field focus to track first interaction */
    handleFieldFocus: () => void;
    /** Check if enough time has passed before submission */
    checkTimeDelay: () => {
        passed: boolean;
        timeDeficitSeconds: number;
    };
    /** Setup focus event listeners for form fields */
    setupFocusListeners: (formSelector?: string, excludeSelector?: string) => () => void;
}

/**
 * Custom hook for managing time delay verification
 * @param {UseTimeDelayOptions} options - Hook options
 * @returns {UseTimeDelayReturn} Time delay state and handlers
 */
export const useTimeDelay = (options: UseTimeDelayOptions = {}): UseTimeDelayReturn => {
    // Time tracking for anti-spam
    const [firstFocusTime, setFirstFocusTime] = useState<number | null>(null);
    const [requiredDelay] = useState(options.requiredDelay || getRandomDelay());
    const formFocusTracked = useRef(false);

    /**
     * Track first focus on any form field
     */
    const handleFieldFocus = useCallback(() => {
        if (!formFocusTracked.current) {
            setFirstFocusTime(Date.now());
            formFocusTracked.current = true;
        }
    }, []);

    /**
     * Check if enough time has passed before submission
     * @returns {Object} Result of time delay check
     */
    const checkTimeDelay = useCallback(() => {
        // If time delay is disabled, always pass
        if (options.enabled === false) {
            return {
                passed: true,
                timeDeficitSeconds: 0
            };
        }

        if (!firstFocusTime) {
            return {
                passed: false,
                timeDeficitSeconds: requiredDelay
            };
        }

        const elapsedSeconds = (Date.now() - firstFocusTime) / 1000;
        const timeDeficitSeconds = Math.max(0, requiredDelay - elapsedSeconds);

        return {
            passed: elapsedSeconds >= requiredDelay,
            timeDeficitSeconds
        };
    }, [firstFocusTime, requiredDelay, options.enabled]);

    /**
     * Setup focus event listeners for form fields
     * @param {string} [formSelector="input, textarea, select"] - Selector for form elements
     * @param {string} [excludeSelector=""] - Selector for elements to exclude
     * @returns {Function} Cleanup function to remove event listeners
     */
    const setupFocusListeners = useCallback((
        formSelector = "input, textarea, select",
        excludeSelector = ""
    ) => {
        const formElements = document.querySelectorAll(formSelector);

        formElements.forEach((element) => {
            // Skip excluded elements
            if (excludeSelector && element.matches(excludeSelector)) {
                return;
            }

            element.addEventListener("focus", handleFieldFocus);
        });

        // Return cleanup function
        return () => {
            formElements.forEach((element) => {
                if (excludeSelector && element.matches(excludeSelector)) {
                    return;
                }
                element.removeEventListener("focus", handleFieldFocus);
            });
        };
    }, [handleFieldFocus]);

    return {
        firstFocusTime,
        formFocusTracked,
        requiredDelay,
        handleFieldFocus,
        checkTimeDelay,
        setupFocusListeners
    };
};
