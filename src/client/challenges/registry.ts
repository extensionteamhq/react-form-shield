/**
 * Challenge Registry
 *
 * This file provides a registry for challenge types.
 *
 * @module client/challenges/registry
 */

import { Challenge, ChallengeTypeDefinition } from '../types';

/**
 * Registry for challenge types
 * @class ChallengeRegistry
 */
class ChallengeRegistry {
    private types: Record<string, ChallengeTypeDefinition> = {};

    /**
     * Register a challenge type
     * @param {string} type - The type identifier
     * @param {ChallengeTypeDefinition} definition - The challenge type definition
     */
    register(type: string, definition: ChallengeTypeDefinition): void {
        this.types[type] = definition;
    }

    /**
     * Get a challenge type definition
     * @param {string} type - The type identifier
     * @returns {ChallengeTypeDefinition | undefined} The challenge type definition or undefined if not found
     */
    get(type: string): ChallengeTypeDefinition | undefined {
        return this.types[type];
    }

    /**
     * Get all registered challenge types
     * @returns {string[]} Array of registered type identifiers
     */
    getTypes(): string[] {
        return Object.keys(this.types);
    }

    /**
     * Generate a challenge of a specific type or a random type
     * @param {string} [type] - Optional type identifier. If not provided, a random type will be used.
     * @returns {Challenge} The generated challenge
     * @throws {Error} If the specified type is not registered or no types are registered
     */
    generateChallenge(type?: string): Challenge {
        // If type is specified, use that type
        // Otherwise, randomly select from registered types
        const selectedType = type || this.getRandomType();
        const definition = this.get(selectedType);

        if (!definition) {
            throw new Error(`Challenge type '${selectedType}' not registered`);
        }

        return definition.generate();
    }

    /**
     * Validate an answer for a challenge
     * @param {string} answer - The answer to validate
     * @param {Challenge} challenge - The challenge
     * @returns {boolean} Whether the answer is correct
     */
    validateAnswer(answer: string, challenge: Challenge): boolean {
        const definition = this.get(challenge.type);

        if (definition && definition.validate) {
            // Use custom validation if available
            return definition.validate(answer, challenge);
        }

        // Default case-insensitive comparison
        return answer.trim().toLowerCase() === challenge.answer.toLowerCase();
    }

    /**
     * Get a random challenge type
     * @returns {string} A random type identifier
     * @throws {Error} If no types are registered
     */
    private getRandomType(): string {
        const types = this.getTypes();

        if (types.length === 0) {
            throw new Error('No challenge types registered');
        }

        return types[Math.floor(Math.random() * types.length)];
    }
}

// Create and export singleton instance
export const challengeRegistry = new ChallengeRegistry();
