/**
 * Challenge Dialog Component
 *
 * This component displays a dialog with a challenge question
 * to verify that the user is human.
 *
 * @module client/components/ChallengeDialog
 */

import React from "react";
import { ChallengeDialogProps, ChallengePresentationProps } from "../types";
import { challengeRegistry } from "../challenges";

/**
 * Dialog for human verification challenge
 * @component
 * @param {ChallengeDialogProps} props - Component props
 * @returns {JSX.Element | null} Rendered challenge dialog or null if not open
 */
export const ChallengeDialog: React.FC<ChallengeDialogProps> = ({
    open,
    onOpenChange,
    challenge,
    challengeAnswer,
    setChallengeAnswer,
    onSubmit,
    error,
    currentChallengeNumber = 1,
    totalRequiredChallenges = 1,
    multipleEnabled = false,
    title = "Human Verification",
    description,
    buttonText = "Verify",
}) => {
    // Handle Enter key press
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && challengeAnswer.trim()) {
            e.preventDefault();
            onSubmit();
        }
    };

    // Generate default description if not provided
    const defaultDescription =
        multipleEnabled && totalRequiredChallenges > 1
            ? `Challenge ${currentChallengeNumber} of ${totalRequiredChallenges}. Please answer the following question to verify you're human.`
            : `Please answer the following question to verify you're human.`;

    // If dialog is not open, don't render anything
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
                <div className="mb-4">
                    <h2 className="text-xl font-bold">{title}</h2>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                        {description || defaultDescription}
                    </p>
                </div>
                <div className="space-y-4 py-4">
                    {/* Use custom component if available */}
                    {challenge.type &&
                    challengeRegistry.get(challenge.type)?.component ? (
                        <div className="space-y-2">
                            {React.createElement(
                                challengeRegistry.get(challenge.type)!
                                    .component!,
                                {
                                    challenge,
                                    answer: challengeAnswer,
                                    setAnswer: setChallengeAnswer,
                                    onSubmit,
                                } as ChallengePresentationProps
                            )}
                            {error && (
                                <p className="text-red-500 text-sm">{error}</p>
                            )}
                        </div>
                    ) : (
                        // Default challenge UI
                        <div className="space-y-2">
                            <label
                                htmlFor="challenge-answer"
                                className="block font-medium">
                                {challenge.question}
                            </label>
                            <input
                                id="challenge-answer"
                                value={challengeAnswer}
                                onChange={(e) =>
                                    setChallengeAnswer(e.target.value)
                                }
                                onKeyDown={handleKeyDown}
                                placeholder="Your answer"
                                autoComplete="off"
                                autoFocus
                                className="w-full px-3 py-2 border rounded-md"
                            />
                            {error && (
                                <p className="text-red-500 text-sm">{error}</p>
                            )}
                        </div>
                    )}
                </div>
                <div className="flex justify-end gap-2">
                    <button
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md"
                        onClick={() => onOpenChange(false)}>
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        onClick={onSubmit}
                        disabled={!challengeAnswer.trim()}>
                        {buttonText}
                    </button>
                </div>
            </div>
        </div>
    );
};
