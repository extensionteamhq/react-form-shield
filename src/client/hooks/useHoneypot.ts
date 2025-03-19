/**
 * Custom hook for honeypot field functionality
 *
 * This hook manages honeypot fields for bot detection.
 *
 * @module client/hooks/useHoneypot
 */

import { useState } from "react";
import { BaseFormValues } from "../types";
import { generateHoneypotFieldName } from "../utils";

/**
 * Interface for the useHoneypot hook options
 * @interface UseHoneypotOptions
 * @property {string} [honeypotFieldName] - Custom honeypot field name
 * @property {string} [fieldName] - Alias for honeypotFieldName
 * @property {boolean} [enabled] - Whether to enable honeypot field
 */
export interface UseHoneypotOptions {
    /** Custom honeypot field name */
    honeypotFieldName?: string;
    /** Alias for honeypotFieldName */
    fieldName?: string;
    /** Whether to enable honeypot field */
    enabled?: boolean;
}

/**
 * Interface for the useHoneypot hook return value
 * @interface UseHoneypotReturn
 */
export interface UseHoneypotReturn {
    /** Honeypot field name */
    honeypotFieldName: string;
    /** Props for the honeypot field */
    honeypotProps: {
        name: string;
        style: React.CSSProperties;
    };
    /** Check if honeypot field is filled (bot detection) */
    checkHoneypot: (values: BaseFormValues) => boolean;
}

/**
 * Custom hook for managing honeypot field functionality
 * @param {UseHoneypotOptions} options - Hook options
 * @returns {UseHoneypotReturn} Honeypot field state and handlers
 */
export const useHoneypot = (options: UseHoneypotOptions = {}): UseHoneypotReturn => {
    // Generate honeypot field name if not provided
    const [honeypotFieldName] = useState(
        options.honeypotFieldName || options.fieldName || generateHoneypotFieldName()
    );

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

    /**
     * Check if honeypot field is filled (bot detection)
     * @param {BaseFormValues} values - Form values
     * @returns {boolean} True if honeypot field is filled (bot detected)
     */
    const checkHoneypot = (values: BaseFormValues): boolean => {
        return !!values[honeypotFieldName];
    };

    return {
        honeypotFieldName,
        honeypotProps,
        checkHoneypot
    };
};
