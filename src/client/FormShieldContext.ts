/**
 * FormShield Context
 *
 * This file defines the React context for global FormShield configuration.
 *
 * @module client/FormShieldContext
 */

import { createContext, useContext } from 'react';
import { AntiSpamSettings } from './types';
import { ANTI_SPAM_FEATURES } from './constants';

/**
 * Interface for the FormShield context value
 * @interface FormShieldContextValue
 * @property {AntiSpamSettings} settings - Global anti-spam settings
 * @property {(error: string) => void} onError - Global error handler
 * @property {string | undefined} honeypotFieldName - Global honeypot field name
 */
export interface FormShieldContextValue {
    settings: AntiSpamSettings;
    onError?: (error: string) => void;
    honeypotFieldName?: string;
}

/**
 * Default context value
 */
const defaultContextValue: FormShieldContextValue = {
    settings: ANTI_SPAM_FEATURES as AntiSpamSettings,
};

/**
 * React context for FormShield configuration
 */
export const FormShieldContext = createContext<FormShieldContextValue>(defaultContextValue);

/**
 * Hook to access the FormShield context
 * @returns {FormShieldContextValue} FormShield context value
 */
export const useFormShieldContext = (): FormShieldContextValue => {
    return useContext(FormShieldContext);
};
