/**
 * Formik Adapter
 *
 * This adapter provides integration between react-form-shield and Formik.
 *
 * @module client/adapters/formik
 */

import { FormikProps, FormikValues } from "formik";
import { useFormShield } from "../hooks/useFormShield";
import { FormShieldOptions, ChallengeMetrics, BaseFormValues } from "../types";

/**
 * Options for the withFormik adapter
 * @interface WithFormikOptions
 * @extends FormShieldOptions
 */
export interface WithFormikOptions extends FormShieldOptions {
    /**
     * Custom handler for form submission errors
     * @param {string} error - Error message
     */
    onSubmitError?: (error: string) => void;
}

/**
 * Return type for the withFormik adapter
 * @interface WithFormikReturn
 * @template TValues - Form values type
 */
export interface WithFormikReturn<TValues extends FormikValues = FormikValues> {
    /**
     * Enhanced version of Formik's handleSubmit function
     * Includes anti-spam validation
     */
    handleSubmit: (e?: React.FormEvent<HTMLFormElement>) => void;

    /**
     * Enhanced version of Formik's getFieldProps function
     * Returns the original field props
     */
    getFieldProps: FormikProps<TValues>["getFieldProps"];

    /**
     * Function to handle field focus for anti-spam detection
     */
    handleFieldFocus: () => void;

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
 * Adapter for Formik integration with FormShield
 * 
 * @template TValues - Form values type
 * @param {FormikProps<TValues>} formik - Formik's useFormik return value
 * @param {WithFormikOptions} options - Options for the adapter
 * @returns {WithFormikReturn<TValues>} Enhanced form functions and FormShield props
 * 
 * @example
 * ```tsx
 * const formik = useFormik<FormValues>({
 *   initialValues: { name: '', email: '' },
 *   onSubmit: values => console.log(values)
 * });
 * 
 * const { 
 *   getFieldProps, 
 *   handleSubmit, 
 *   handleFieldFocus,
 *   honeypotProps, 
 *   showChallengeDialog,
 *   setShowChallengeDialog,
 *   challenge,
 *   challengeAnswer,
 *   setChallengeAnswer,
 *   handleChallengeSubmit,
 *   getFormShieldData
 * } = withFormik(formik);
 * 
 * // Use in your form
 * <form onSubmit={handleSubmit}>
 *   <input {...getFieldProps("name")} onFocus={handleFieldFocus} />
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
export const withFormik = <TValues extends FormikValues = FormikValues>(
    formik: FormikProps<TValues>,
    options: WithFormikOptions = {}
): WithFormikReturn<TValues> => {
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

    // Create enhanced handleSubmit function that includes anti-spam validation
    const handleSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
        // Prevent default form submission
        if (e) {
            e.preventDefault();
        }

        // Get current form values
        const values = formik.values;

        // Validate submission with form shield
        const validationResult = formShield.validateSubmission(values as BaseFormValues);

        // If validation passes, call the original handleSubmit function
        if (validationResult.passed) {
            // Submit the form directly since validation passed
            return formik.submitForm();
        }

        // Otherwise, the challenge dialog will be shown automatically
        return Promise.resolve();
    };

    return {
        getFieldProps: formik.getFieldProps,
        handleSubmit,
        handleFieldFocus: formShield.handleFieldFocus,
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
