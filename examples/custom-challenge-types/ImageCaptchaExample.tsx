/**
 * Image CAPTCHA Challenge Example
 *
 * This example demonstrates how to create and use a custom challenge type.
 */

import React, { useState, useEffect } from "react";
import {
    useFormShield,
    challengeRegistry,
    ChallengeTypeDefinition,
    Challenge,
    ChallengePresentationProps,
} from "../../src";

// Define the image CAPTCHA challenge component
const ImageCaptchaComponent: React.FC<ChallengePresentationProps> = ({
    challenge,
    answer,
    setAnswer,
    onSubmit,
}) => {
    return (
        <div className="space-y-4">
            <div>
                <label className="block font-medium mb-2">
                    {challenge.question}
                </label>
                <img
                    src={challenge.data?.imageUrl}
                    alt="CAPTCHA"
                    className="mb-4 border rounded max-w-full h-auto"
                    style={{ maxHeight: "150px" }}
                />
            </div>
            <input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Enter the characters you see"
                className="w-full px-3 py-2 border rounded-md"
                onKeyDown={(e) => {
                    if (e.key === "Enter" && answer.trim()) {
                        e.preventDefault();
                        onSubmit();
                    }
                }}
            />
        </div>
    );
};

// Register the image CAPTCHA challenge type
const registerImageCaptchaChallenge = () => {
    challengeRegistry.register("image-captcha", {
        generate: (): Challenge => {
            // In a real implementation, this would generate or fetch an image CAPTCHA
            // For this example, we're using a placeholder image
            const captchaCode = Math.random()
                .toString(36)
                .substring(2, 8)
                .toUpperCase();

            return {
                type: "image-captcha",
                question: "Enter the characters shown in the image",
                answer: captchaCode,
                data: {
                    // Using a placeholder service that generates CAPTCHA images
                    // In a real implementation, you would use your own CAPTCHA service
                    imageUrl: `https://dummyimage.com/200x80/000/fff&text=${captchaCode}`,
                },
            };
        },
        component: ImageCaptchaComponent,
    });
};

// Example form using the custom challenge type
export const ImageCaptchaExample: React.FC = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
    });

    // Register the custom challenge type when the component mounts
    useEffect(() => {
        registerImageCaptchaChallenge();
    }, []);

    const {
        honeypotProps,
        handleChallengeSubmit,
        showChallengeDialog,
        setShowChallengeDialog,
        challenge,
        challengeAnswer,
        setChallengeAnswer,
        validateSubmission,
    } = useFormShield({
        // Specify that we want to use our custom challenge type
        preferredChallengeType: "image-captcha",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate the form submission
        const result = validateSubmission({
            ...formData,
            [honeypotProps.name]: "", // Empty honeypot field (not filled by bots)
        });

        if (result.passed) {
            // Form passed anti-spam checks, submit it
            alert("Form submitted successfully!");
            console.log("Form data:", formData);
        } else if (showChallengeDialog) {
            // Challenge dialog is already open
        } else {
            // Form failed anti-spam checks, but no challenge dialog is shown
            alert("Form submission failed anti-spam checks.");
        }
    };

    const handleChallengeSuccess = async () => {
        // Challenge completed successfully, submit the form
        alert("Challenge completed successfully! Form submitted.");
        console.log("Form data:", formData);
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded shadow-md">
            <h1 className="text-2xl font-bold mb-6">
                Contact Form with Image CAPTCHA
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block mb-1">
                        Name
                    </label>
                    <input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full px-3 py-2 border rounded"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="email" className="block mb-1">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full px-3 py-2 border rounded"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="message" className="block mb-1">
                        Message
                    </label>
                    <textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                message: e.target.value,
                            })
                        }
                        className="w-full px-3 py-2 border rounded"
                        rows={4}
                        required
                    />
                </div>

                {/* Honeypot field (hidden from humans) */}
                <input {...honeypotProps} />

                <button
                    type="submit"
                    className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600">
                    Submit
                </button>
            </form>

            {/* Challenge Dialog */}
            {showChallengeDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">
                            Human Verification
                        </h2>

                        <ImageCaptchaComponent
                            challenge={challenge}
                            answer={challengeAnswer}
                            setAnswer={setChallengeAnswer}
                            onSubmit={() =>
                                handleChallengeSubmit(handleChallengeSuccess)
                            }
                        />

                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                className="px-4 py-2 bg-gray-200 rounded"
                                onClick={() => setShowChallengeDialog(false)}>
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-blue-500 text-white rounded"
                                onClick={() =>
                                    handleChallengeSubmit(
                                        handleChallengeSuccess
                                    )
                                }
                                disabled={!challengeAnswer.trim()}>
                                Verify
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageCaptchaExample;
