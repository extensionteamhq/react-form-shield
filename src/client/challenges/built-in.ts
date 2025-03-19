/**
 * Built-in Challenge Types
 *
 * This file registers built-in challenge types.
 *
 * @module client/challenges/built-in
 */

import { challengeRegistry } from './registry';
import { Challenge } from '../types';

/**
 * Register math challenge type
 */
challengeRegistry.register('math', {
    generate: (): Challenge => {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        return {
            type: 'math',
            question: `What is ${num1} + ${num2}?`,
            answer: (num1 + num2).toString(),
        };
    },
    // Optional custom validation if needed
    validate: (answer: string, challenge: Challenge): boolean => {
        return answer.trim() === challenge.answer;
    }
});

/**
 * Register text challenge type
 */
challengeRegistry.register('text', {
    generate: (): Challenge => {
        const questions = [
            {
                question: "Type the last word in this sentence: 'I agree to the terms and conditions'",
                answer: "conditions",
            },
            {
                question: "What color is the sky on a clear day?",
                answer: "blue",
            },
            {
                question: "Type the word 'human' to verify you're not a robot",
                answer: "human",
            },
            {
                question: "What is the opposite of 'up'?",
                answer: "down",
            },
            {
                question: "How many days are in a week?",
                answer: "7",
            },
        ];
        const selected = questions[Math.floor(Math.random() * questions.length)];
        return {
            type: 'text',
            question: selected.question,
            answer: selected.answer,
        };
    }
});

/**
 * Ensure built-in challenge types are registered
 * This function is just a hook to ensure the module is loaded
 */
export function registerBuiltInChallengeTypes(): void {
    // Registration happens when this module is imported
    // This function is just a hook to ensure the module is loaded
}
