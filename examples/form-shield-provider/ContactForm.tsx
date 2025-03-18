import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    ChallengeDialog,
    HoneypotField,
    withReactHookForm,
    AntiSpamSettings,
} from "react-form-shield";

// Define form schema with Zod
const formSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    message: z.string().min(1, { message: "Message is required" }),
});

type FormValues = z.infer<typeof formSchema>;

interface ContactFormProps {
    overrideSettings?: Partial<AntiSpamSettings>;
}

/**
 * Contact Form Component
 *
 * This component demonstrates how to use the FormShieldProvider with React Hook Form.
 * It will use the global configuration from the FormShieldProvider, but can also
 * override specific settings if needed.
 */
const ContactForm: React.FC<ContactFormProps> = ({ overrideSettings }) => {
    // Initialize form with Zod resolver
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            message: "",
        },
    });

    // Form state
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isSubmitted, setIsSubmitted] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    // Initialize form shield with React Hook Form adapter
    // The withReactHookForm adapter will use the global configuration from FormShieldProvider
    // but we can also override specific settings if needed
    const {
        register,
        handleSubmit,
        honeypotProps,
        showChallengeDialog,
        setShowChallengeDialog,
        challenge,
        challengeAnswer,
        setChallengeAnswer,
        handleChallengeSubmit,
        getFormShieldData,
        settings,
    } = withReactHookForm(form, {
        // Local error handler (will be used instead of the global one)
        onError: (error: unknown) => {
            console.error("Form-specific error:", error);
            setError(error as string);
        },
        // Override settings from FormShieldProvider if provided
        settings: overrideSettings,
    });

    // Handle form submission
    const onSubmit = async (values: FormValues) => {
        setError(null);
        await submitForm(values);
    };

    // Submit form data to the API
    const submitForm = async (
        values: FormValues,
        challengeCompleted = false
    ) => {
        setIsSubmitting(true);

        try {
            // Add form shield data to the submission
            const submissionData = {
                ...values,
                ...getFormShieldData(),
            };

            // In a real application, you would send this data to your server
            console.log("Form submission data:", submissionData);

            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Show success message
            setIsSubmitted(true);
            form.reset();
        } catch (error) {
            setError("An error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // If form is submitted successfully, show success message
    if (isSubmitted) {
        return (
            <div className="p-4 bg-green-100 text-green-800 rounded-md">
                <h3 className="text-lg font-semibold">Thank you!</h3>
                <p>
                    Your message has been sent successfully. We'll get back to
                    you soon.
                </p>
                <button
                    onClick={() => setIsSubmitted(false)}
                    className="mt-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
                    Send Another Message
                </button>
            </div>
        );
    }

    return (
        <div>
            {/* Display current settings (for demonstration purposes) */}
            <div className="mb-4 p-3 bg-gray-100 rounded-md text-sm">
                <p className="font-semibold">Current FormShield Settings:</p>
                <ul className="mt-1 space-y-1">
                    <li>
                        Honeypot:{" "}
                        {settings.ENABLE_HONEYPOT ? "Enabled" : "Disabled"}
                    </li>
                    <li>
                        Time Delay:{" "}
                        {settings.ENABLE_TIME_DELAY ? "Enabled" : "Disabled"}
                    </li>
                    <li>
                        Challenge Dialog:{" "}
                        {settings.ENABLE_CHALLENGE_DIALOG
                            ? "Enabled"
                            : "Disabled"}
                    </li>
                    <li>
                        Multiple Challenges:{" "}
                        {settings.ENABLE_MULTIPLE_CHALLENGES
                            ? "Enabled"
                            : "Disabled"}
                    </li>
                </ul>
            </div>

            {error && (
                <div className="p-3 mb-4 bg-red-100 text-red-800 rounded-md">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Name field */}
                <div>
                    <label
                        htmlFor="name"
                        className="block text-sm font-medium mb-1">
                        Name
                    </label>
                    <input
                        id="name"
                        {...register("name")}
                        className="w-full px-3 py-2 border rounded-md"
                    />
                    {form.formState.errors.name && (
                        <p className="mt-1 text-sm text-red-600">
                            {form.formState.errors.name.message}
                        </p>
                    )}
                </div>

                {/* Email field */}
                <div>
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium mb-1">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        {...register("email")}
                        className="w-full px-3 py-2 border rounded-md"
                    />
                    {form.formState.errors.email && (
                        <p className="mt-1 text-sm text-red-600">
                            {form.formState.errors.email.message}
                        </p>
                    )}
                </div>

                {/* Message field */}
                <div>
                    <label
                        htmlFor="message"
                        className="block text-sm font-medium mb-1">
                        Message
                    </label>
                    <textarea
                        id="message"
                        {...register("message")}
                        rows={4}
                        className="w-full px-3 py-2 border rounded-md"
                    />
                    {form.formState.errors.message && (
                        <p className="mt-1 text-sm text-red-600">
                            {form.formState.errors.message.message}
                        </p>
                    )}
                </div>

                {/* Honeypot field (invisible to humans) */}
                <HoneypotField {...honeypotProps} />

                {/* Submit button */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50">
                    {isSubmitting ? "Submitting..." : "Submit"}
                </button>
            </form>

            {/* Challenge dialog */}
            <ChallengeDialog
                open={showChallengeDialog}
                onOpenChange={setShowChallengeDialog}
                challenge={challenge}
                challengeAnswer={challengeAnswer}
                setChallengeAnswer={setChallengeAnswer}
                onSubmit={() => handleChallengeSubmit(submitForm)}
                error={error}
                currentChallengeNumber={1}
                totalRequiredChallenges={
                    settings.ENABLE_MULTIPLE_CHALLENGES
                        ? settings.MAX_CHALLENGES
                        : 1
                }
                multipleEnabled={settings.ENABLE_MULTIPLE_CHALLENGES}
            />
        </div>
    );
};

export default ContactForm;
