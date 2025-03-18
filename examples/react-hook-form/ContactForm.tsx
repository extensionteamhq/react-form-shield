import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    useFormShield,
    ChallengeDialog,
    HoneypotField,
} from "react-form-shield";

// Define form schema with Zod
const formSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    message: z.string().min(1, { message: "Message is required" }),
});

type FormValues = z.infer<typeof formSchema>;

const ContactForm: React.FC = () => {
    // Initialize form with Zod resolver
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            message: "",
        },
    });

    // Initialize form shield
    const {
        honeypotProps,
        showChallengeDialog,
        setShowChallengeDialog,
        challenge,
        challengeAnswer,
        setChallengeAnswer,
        handleChallengeSubmit,
        validateSubmission,
        getFormShieldData,
    } = useFormShield({
        onError: (error) => {
            console.error(error);
            setError(error);
        },
    });

    // Form state
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isSubmitted, setIsSubmitted] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    // Handle form submission
    const onSubmit = async (values: FormValues) => {
        setError(null);

        // Validate submission with form shield
        const validationResult = validateSubmission(values);

        if (validationResult.passed) {
            await submitForm(values);
        }
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

            // Send data to the server
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(submissionData),
            });

            if (response.ok) {
                setIsSubmitted(true);
                form.reset();
            } else {
                const errorData = await response.json();
                setError(
                    errorData.error ||
                        "Failed to submit form. Please try again."
                );
            }
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
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>

            {error && (
                <div className="p-3 mb-4 bg-red-100 text-red-800 rounded-md">
                    {error}
                </div>
            )}

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Name field */}
                <div>
                    <label
                        htmlFor="name"
                        className="block text-sm font-medium mb-1">
                        Name
                    </label>
                    <input
                        id="name"
                        {...form.register("name")}
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
                        {...form.register("email")}
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
                        {...form.register("message")}
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
            />
        </div>
    );
};

export default ContactForm;
