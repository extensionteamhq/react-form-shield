/**
 * FormShield Provider Component
 *
 * This component provides global configuration for FormShield through React Context.
 *
 * @module client/components/FormShieldProvider
 */

import React from "react";
import {
    FormShieldContext,
    FormShieldContextValue,
} from "../FormShieldContext";
import { AntiSpamSettings } from "../types";
import { mergeSettings } from "../utils";

/**
 * Props for the FormShieldProvider component
 * @interface FormShieldProviderProps
 * @property {React.ReactNode} children - Child components
 * @property {Partial<AntiSpamSettings>} settings - Global anti-spam settings
 * @property {(error: string) => void} onError - Global error handler
 * @property {string} honeypotFieldName - Global honeypot field name
 */
export interface FormShieldProviderProps {
    children: React.ReactNode;
    settings?: Partial<AntiSpamSettings>;
    onError?: (error: string) => void;
    honeypotFieldName?: string;
}

/**
 * FormShield Provider Component
 *
 * Provides global configuration for FormShield through React Context.
 * This allows for consistent settings across multiple forms in an application.
 *
 * @example
 * ```tsx
 * <FormShieldProvider
 *   settings={{
 *     ENABLE_CHALLENGE_DIALOG: true,
 *     ENABLE_HONEYPOT: true,
 *   }}
 *   onError={(error) => console.error(error)}
 * >
 *   <App />
 * </FormShieldProvider>
 * ```
 */
export const FormShieldProvider: React.FC<FormShieldProviderProps> = ({
    children,
    settings,
    onError,
    honeypotFieldName,
}) => {
    // Merge provided settings with defaults
    const mergedSettings = mergeSettings(settings);

    // Create context value
    const contextValue: FormShieldContextValue = {
        settings: mergedSettings,
        onError,
        honeypotFieldName,
    };

    return (
        <FormShieldContext.Provider value={contextValue}>
            {children}
        </FormShieldContext.Provider>
    );
};
