/**
 * React Hook Form Adapter
 *
 * This adapter provides integration between react-form-shield and React Hook Form.
 *
 * @module client/adapters/reactHookForm
 */

import { UseFormReturn, FieldValues, UseFormHandleSubmit } from "react-hook-form";
import { useFormShield } from "../hooks/useFormShield";
import { FormShieldOptions, ChallengeMetrics, BaseFormValues } from "../types";

/**
 * Options for the withReactHookForm adapter
 * @interface WithReactHookFormOptions
 * @extends FormShieldOptions
 */
export interface WithReactHookFormOptions extends FormShieldOptions {
    /**
     * Custom handler for form submission errors
     * @param {string} error - Error message
     */
    onSubmitError?: (error: string) => void;
}

/**
 * Return type for the withReactHookForm adapter
 * @interface WithReactHookFormReturn
 * @template TFieldValues - Form field values type
 */
export interface WithReactHookFormReturn<TFieldValues extends FieldValues = FieldValues> {
    /**
     * Enhanced version of React Hook Form's register function
     * Tracks field focus for anti-spam detection
     */
    register: UseFormReturn<TFieldValues>["register"];

    /**
     * Enhanced version of React Hook Form's handleSubmit function
     * Includes anti-spam validation
     */
    handleSubmit: UseFormHandleSubmit<TFieldValues>;

    /**
     * Props for the honeypot field
     */
    honeypotProps: {
        name: string;
        style: React.CSSProperties;
    };

    /**
     * Whether to show the challenge dialog
     */
    showChallengeDialog: boolean;

    /**
     * Function to set whether to show the challenge dialog
     */
    setShowChallengeDialog: React.Dispatch<React.SetStateAction<boolean>>;

    /**
     * Current challenge question and answer
     */
    challenge: {
        question: string;
        answer: string;
    };

    /**
     * User's answer to the challenge
     */
    challengeAnswer: string;

    /**
     * Function to set the user's answer to the challenge
     */
    setChallengeAnswer: React.Dispatch<React.SetStateAction<string>>;

    /**
     * Function to handle challenge dialog submission
     */
    handleChallengeSubmit: (
        onSuccess: (
            values: BaseFormValues,
            challengeCompleted: boolean,
            challengeMetrics: ChallengeMetrics
        ) => Promise<void>
    ) => Promise<void>;

    /**
     * Function to get form shield data for submission
     */
    getFormShieldData: () => {
        firstFocusTime: number | null;
        submissionTime: number;
        challengeCompleted: boolean;
        challengeMetrics: ChallengeMetrics;
        antiSpamSettings: import("../types").AntiSpamSettings;
    };
}

/**
 * Adapter for React Hook Form integration with FormShield
 * 
 * @template TFieldValues - Form field values type
 * @param {UseFormReturn<TFieldValues>} form - React Hook Form's useForm return value
 * @param {WithReactHookFormOptions} options - Options for the adapter
 * @returns {WithReactHookFormReturn<TFieldValues>} Enhanced form functions and FormShield props
 * 
 * @example
 * ```tsx
 * const form = useForm<FormValues>();
 * const { 
 *   register, 
 *   handleSubmit, 
 *   honeypotProps, 
 *   showChallengeDialog,
 *   setShowChallengeDialog,
 *   challenge,
 *   challengeAnswer,
 *   setChallengeAnswer,
 *   handleChallengeSubmit,
 *   getFormShieldData
 * } = withReactHookForm(form);
 * 
 * // Use in your form
 * <form onSubmit={handleSubmit(onSubmit)}>
 *   <input {...register("name")} />
 *   <HoneypotField {...honeypotProps} />
 *   <button type="submit">Submit</button>
 * </form>
 * 
 * // Challenge dialog
 * <ChallengeDialog
 *   open={showChallengeDialog}
 *   onOpenChange={setShowChallengeDialog}
 *   challenge={challenge}
 *   challengeAnswer={challengeAnswer}
 *   setChallengeAnswer={setChallengeAnswer}
 *   onSubmit={() => handleChallengeSubmit(submitForm)}
 * />
 * ```
 */
export const withReactHookForm = <TFieldValues extends FieldValues = FieldValues>(
    form: UseFormReturn<TFieldValues>,
    options: WithReactHookFormOptions = {}
): WithReactHookFormReturn<TFieldValues> => {
    // Initialize form shield
    const formShield = useFormShield({
        ...options,
        onError: (error) => {
            // Call custom error handler if provided
            if (options.onSubmitError) {
                options.onSubmitError(error);
            }

            // Call original error handler if provided
            if (options.onError) {
                options.onError(error);
            }
        },
    });

    // Create enhanced register function that tracks field focus
    const register = (name: any, options?: any) => {
        // Get the original registration
        const registration = form.register(name, options);

        // Create a ref callback that tracks focus
        const originalRef = registration.ref;

        return {
            ...registration,
            ref: (element: any) => {
                // Call the original ref callback
                if (originalRef) {
                    originalRef(element);
                }

                // Add focus event listener to track field focus
                if (element) {
                    element.addEventListener('focus', () => {
                        formShield.handleFieldFocus();
                    });
                }
            }
        };
    };

    // Create enhanced handleSubmit function that includes anti-spam validation
    const handleSubmit = (onValid: any, onInvalid?: any) => {
        return form.handleSubmit((values) => {
            // Validate submission with form shield
            const validationResult = formShield.validateSubmission(values as BaseFormValues);

            // If validation passes, call the original onValid function
            if (validationResult.passed) {
                return onValid(values);
            }

            // Otherwise, the challenge dialog will be shown automatically
            return Promise.resolve();
        }, onInvalid);
    };

    return {
        register,
        handleSubmit,
        honeypotProps: formShield.honeypotProps,
        showChallengeDialog: formShield.showChallengeDialog,
        setShowChallengeDialog: formShield.setShowChallengeDialog,
        challenge: formShield.challenge,
        challengeAnswer: formShield.challengeAnswer,
        setChallengeAnswer: formShield.setChallengeAnswer,
        handleChallengeSubmit: formShield.handleChallengeSubmit,
        getFormShieldData: formShield.getFormShieldData,
    };
};
