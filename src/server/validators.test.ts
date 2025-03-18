/**
 * Tests for server-side validators
 */

import {
    validateHoneypot,
    validateTimeDelay,
    validateChallenge,
    validateFormShield
} from './validators';
import { FormShieldRequestData } from './types';

describe('Server Validators', () => {
    describe('validateHoneypot', () => {
        it('should return valid=true when no honeypot fields are detected', () => {
            const mockBody: FormShieldRequestData = {
                firstFocusTime: Date.now() - 15000, // 15 seconds ago
                submissionTime: Date.now(),
                challengeCompleted: false,
                challengeMetrics: {
                    completedChallenges: 0,
                    totalChallengeTime: 0,
                    requiredChallenges: 0
                }
            };

            const result = validateHoneypot(mockBody);
            expect(result.valid).toBe(true);
            expect(result.error).toBeNull();
            expect(result.isBot).toBe(false);
        });

        it('should return valid=false when honeypot fields are detected', () => {
            const mockBody: FormShieldRequestData = {
                firstFocusTime: Date.now() - 15000,
                submissionTime: Date.now(),
                challengeCompleted: false,
                challengeMetrics: {
                    completedChallenges: 0,
                    totalChallengeTime: 0,
                    requiredChallenges: 0
                },
                contact_input: 'This is a bot filling a honeypot field'
            };

            const result = validateHoneypot(mockBody);
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Honeypot field detected');
            expect(result.isBot).toBe(true);
        });

        it('should ignore empty honeypot fields', () => {
            const mockBody: FormShieldRequestData = {
                firstFocusTime: Date.now() - 15000,
                submissionTime: Date.now(),
                challengeCompleted: false,
                challengeMetrics: {
                    completedChallenges: 0,
                    totalChallengeTime: 0,
                    requiredChallenges: 0
                },
                contact_input: '' // Empty honeypot field should be ignored
            };

            const result = validateHoneypot(mockBody);
            expect(result.valid).toBe(true);
            expect(result.error).toBeNull();
            expect(result.isBot).toBe(false);
        });

        it('should detect various honeypot field patterns', () => {
            // Test different honeypot field naming patterns
            const patterns = [
                'name_input',
                'email_field',
                'phone_data',
                'address_value',
                'message_entry'
            ];

            patterns.forEach(pattern => {
                const mockBody: FormShieldRequestData = {
                    firstFocusTime: Date.now() - 15000,
                    submissionTime: Date.now(),
                    challengeCompleted: false,
                    challengeMetrics: {
                        completedChallenges: 0,
                        totalChallengeTime: 0,
                        requiredChallenges: 0
                    },
                    [pattern]: 'Bot input'
                };

                const result = validateHoneypot(mockBody);
                expect(result.valid).toBe(false);
                expect(result.error).toBe('Honeypot field detected');
                expect(result.isBot).toBe(true);
            });
        });

        it('should ignore known fields', () => {
            const mockBody: FormShieldRequestData = {
                firstFocusTime: Date.now() - 15000,
                submissionTime: Date.now(),
                challengeCompleted: false,
                challengeMetrics: {
                    completedChallenges: 0,
                    totalChallengeTime: 0,
                    requiredChallenges: 0
                },
                antiSpamSettings: {
                    ENABLE_TIME_DELAY: true,
                    ENABLE_CHALLENGE_DIALOG: true,
                    ENABLE_HONEYPOT: true,
                    ENABLE_MULTIPLE_CHALLENGES: true,
                    CHALLENGE_TIME_VALUE: 5,
                    MAX_CHALLENGES: 3
                },
                name: 'John Doe', // Regular form field
                email: 'john@example.com' // Regular form field
            };

            const result = validateHoneypot(mockBody);
            expect(result.valid).toBe(true);
            expect(result.error).toBeNull();
            expect(result.isBot).toBe(false);
        });
    });

    describe('validateTimeDelay', () => {
        it('should return valid=true when time delay is sufficient', () => {
            const mockBody: FormShieldRequestData = {
                firstFocusTime: Date.now() - 15000, // 15 seconds ago (> 10 seconds minimum)
                submissionTime: Date.now(),
                challengeCompleted: false,
                challengeMetrics: {
                    completedChallenges: 0,
                    totalChallengeTime: 0,
                    requiredChallenges: 0
                }
            };

            const result = validateTimeDelay(mockBody);
            expect(result.valid).toBe(true);
            expect(result.error).toBeNull();
            expect(result.isBot).toBe(false);
        });

        it('should return valid=false when time delay is insufficient', () => {
            const mockBody: FormShieldRequestData = {
                firstFocusTime: Date.now() - 5000, // 5 seconds ago (< 10 seconds minimum)
                submissionTime: Date.now(),
                challengeCompleted: false,
                challengeMetrics: {
                    completedChallenges: 0,
                    totalChallengeTime: 0,
                    requiredChallenges: 0
                }
            };

            const result = validateTimeDelay(mockBody);
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Form submitted too quickly. Please try again.');
            expect(result.isBot).toBe(false);
        });

        it('should return valid=false when firstFocusTime is missing', () => {
            const mockBody: FormShieldRequestData = {
                firstFocusTime: null, // Missing first focus time
                submissionTime: Date.now(),
                challengeCompleted: false,
                challengeMetrics: {
                    completedChallenges: 0,
                    totalChallengeTime: 0,
                    requiredChallenges: 0
                }
            };

            const result = validateTimeDelay(mockBody);
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Unable to verify form interaction. Please try again.');
            expect(result.isBot).toBe(false);
        });

        it('should consider challenge time credit', () => {
            const mockBody: FormShieldRequestData = {
                firstFocusTime: Date.now() - 5000, // 5 seconds ago (< 10 seconds minimum)
                submissionTime: Date.now(),
                challengeCompleted: true,
                challengeMetrics: {
                    completedChallenges: 2, // 2 challenges completed (worth 5 seconds each)
                    totalChallengeTime: 10000,
                    requiredChallenges: 2
                }
            };

            // With 5 seconds elapsed + 10 seconds from challenges, it should be valid
            const result = validateTimeDelay(mockBody);
            expect(result.valid).toBe(true);
            expect(result.error).toBeNull();
            expect(result.isBot).toBe(false);
        });

        it('should respect custom minSubmissionTime', () => {
            const mockBody: FormShieldRequestData = {
                firstFocusTime: Date.now() - 15000, // 15 seconds ago
                submissionTime: Date.now(),
                challengeCompleted: false,
                challengeMetrics: {
                    completedChallenges: 0,
                    totalChallengeTime: 0,
                    requiredChallenges: 0
                }
            };

            // With custom minSubmissionTime of 20 seconds, it should be invalid
            const result = validateTimeDelay(mockBody, 20);
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Form submitted too quickly. Please try again.');
            expect(result.isBot).toBe(false);
        });

        it('should respect custom challengeTimeValue', () => {
            const mockBody: FormShieldRequestData = {
                firstFocusTime: Date.now() - 5000, // 5 seconds ago
                submissionTime: Date.now(),
                challengeCompleted: true,
                challengeMetrics: {
                    completedChallenges: 1, // 1 challenge completed
                    totalChallengeTime: 5000,
                    requiredChallenges: 1
                }
            };

            // With custom challengeTimeValue of 10 seconds, it should be valid
            // (5 seconds elapsed + 10 seconds from challenge = 15 seconds > 10 seconds minimum)
            const result = validateTimeDelay(mockBody, 10, 10);
            expect(result.valid).toBe(true);
            expect(result.error).toBeNull();
            expect(result.isBot).toBe(false);
        });
    });

    describe('validateChallenge', () => {
        it('should return valid=true when challenge is completed', () => {
            const mockBody: FormShieldRequestData = {
                firstFocusTime: Date.now() - 15000,
                submissionTime: Date.now(),
                challengeCompleted: true,
                challengeMetrics: {
                    completedChallenges: 1,
                    totalChallengeTime: 5000,
                    requiredChallenges: 1
                }
            };

            const result = validateChallenge(mockBody);
            expect(result.valid).toBe(true);
            expect(result.error).toBeNull();
            expect(result.isBot).toBe(false);
        });

        it('should return valid=false when challenge is not completed', () => {
            const mockBody: FormShieldRequestData = {
                firstFocusTime: Date.now() - 15000,
                submissionTime: Date.now(),
                challengeCompleted: false,
                challengeMetrics: {
                    completedChallenges: 0,
                    totalChallengeTime: 0,
                    requiredChallenges: 1
                }
            };

            const result = validateChallenge(mockBody);
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Human verification required. Please complete the challenge.');
            expect(result.isBot).toBe(false);
        });

        it('should return valid=false when challenge metrics are missing', () => {
            const mockBody: FormShieldRequestData = {
                firstFocusTime: Date.now() - 15000,
                submissionTime: Date.now(),
                challengeCompleted: true,
                challengeMetrics: null as any // Missing challenge metrics
            };

            const result = validateChallenge(mockBody);
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Invalid challenge metrics. Please try again.');
            expect(result.isBot).toBe(false);
        });

        it('should return valid=false when no challenges were completed', () => {
            const mockBody: FormShieldRequestData = {
                firstFocusTime: Date.now() - 15000,
                submissionTime: Date.now(),
                challengeCompleted: true,
                challengeMetrics: {
                    completedChallenges: 0, // No challenges completed
                    totalChallengeTime: 0,
                    requiredChallenges: 1
                }
            };

            const result = validateChallenge(mockBody);
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Challenge not completed. Please try again.');
            expect(result.isBot).toBe(false);
        });

        it('should return valid=false when not enough challenges were completed', () => {
            const mockBody: FormShieldRequestData = {
                firstFocusTime: Date.now() - 15000,
                submissionTime: Date.now(),
                challengeCompleted: true,
                challengeMetrics: {
                    completedChallenges: 1, // Only 1 challenge completed
                    totalChallengeTime: 5000,
                    requiredChallenges: 2 // But 2 were required
                }
            };

            const result = validateChallenge(mockBody);
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Please complete all required challenges (1/2 completed).');
            expect(result.isBot).toBe(false);
        });
    });

    describe('validateFormShield', () => {
        it('should validate all checks when all are enabled', () => {
            const mockBody: FormShieldRequestData = {
                firstFocusTime: Date.now() - 15000, // 15 seconds ago
                submissionTime: Date.now(),
                challengeCompleted: true,
                challengeMetrics: {
                    completedChallenges: 1,
                    totalChallengeTime: 5000,
                    requiredChallenges: 1
                }
            };

            const options = {
                honeypotCheck: true,
                timeDelayCheck: true,
                challengeCheck: true
            };

            const result = validateFormShield(mockBody, options);
            expect(result.valid).toBe(true);
            expect(result.error).toBeNull();
            expect(result.isBot).toBe(false);
        });

        it('should skip disabled checks', () => {
            const mockBody: FormShieldRequestData = {
                firstFocusTime: Date.now() - 5000, // 5 seconds ago (< 10 seconds minimum)
                submissionTime: Date.now(),
                challengeCompleted: false, // Challenge not completed
                challengeMetrics: {
                    completedChallenges: 0,
                    totalChallengeTime: 0,
                    requiredChallenges: 1
                }
            };

            // Disable time delay and challenge checks
            const options = {
                honeypotCheck: true,
                timeDelayCheck: false,
                challengeCheck: false
            };

            // Should pass because the failing checks are disabled
            const result = validateFormShield(mockBody, options);
            expect(result.valid).toBe(true);
            expect(result.error).toBeNull();
            expect(result.isBot).toBe(false);
        });

        it('should fail on honeypot check when enabled', () => {
            const mockBody: FormShieldRequestData = {
                firstFocusTime: Date.now() - 15000,
                submissionTime: Date.now(),
                challengeCompleted: true,
                challengeMetrics: {
                    completedChallenges: 1,
                    totalChallengeTime: 5000,
                    requiredChallenges: 1
                },
                contact_input: 'Bot input' // Honeypot field
            };

            const options = {
                honeypotCheck: true,
                timeDelayCheck: true,
                challengeCheck: true
            };

            const result = validateFormShield(mockBody, options);
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Honeypot field detected');
            expect(result.isBot).toBe(true);
        });

        it('should fail on time delay check when enabled', () => {
            const mockBody: FormShieldRequestData = {
                firstFocusTime: Date.now() - 5000, // 5 seconds ago (< 10 seconds minimum)
                submissionTime: Date.now(),
                challengeCompleted: false,
                challengeMetrics: {
                    completedChallenges: 0,
                    totalChallengeTime: 0,
                    requiredChallenges: 0
                }
            };

            const options = {
                honeypotCheck: true,
                timeDelayCheck: true,
                challengeCheck: false
            };

            const result = validateFormShield(mockBody, options);
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Form submitted too quickly. Please try again.');
            expect(result.isBot).toBe(false);
        });

        it('should fail on challenge check when enabled', () => {
            const mockBody: FormShieldRequestData = {
                firstFocusTime: Date.now() - 15000, // 15 seconds ago (> 10 seconds minimum)
                submissionTime: Date.now(),
                challengeCompleted: false, // Challenge not completed
                challengeMetrics: {
                    completedChallenges: 0,
                    totalChallengeTime: 0,
                    requiredChallenges: 1
                }
            };

            const options = {
                honeypotCheck: true,
                timeDelayCheck: true,
                challengeCheck: true
            };

            const result = validateFormShield(mockBody, options);
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Human verification required. Please complete the challenge.');
            expect(result.isBot).toBe(false);
        });

        it('should allow submission with completed challenge despite time delay failure', () => {
            const mockBody: FormShieldRequestData = {
                firstFocusTime: Date.now() - 5000, // 5 seconds ago (< 10 seconds minimum)
                submissionTime: Date.now(),
                challengeCompleted: true, // Challenge completed
                challengeMetrics: {
                    completedChallenges: 1,
                    totalChallengeTime: 5000,
                    requiredChallenges: 1
                }
            };

            const options = {
                honeypotCheck: true,
                timeDelayCheck: true,
                challengeCheck: true
            };

            // Should pass because challenge was completed, even though time delay is insufficient
            const result = validateFormShield(mockBody, options);
            expect(result.valid).toBe(true);
            expect(result.error).toBeNull();
            expect(result.isBot).toBe(false);
        });

        it('should use custom options', () => {
            const mockBody: FormShieldRequestData = {
                firstFocusTime: Date.now() - 15000, // 15 seconds ago
                submissionTime: Date.now(),
                challengeCompleted: true,
                challengeMetrics: {
                    completedChallenges: 1,
                    totalChallengeTime: 5000,
                    requiredChallenges: 1
                }
            };

            // Custom options with higher minSubmissionTime
            const options = {
                honeypotCheck: true,
                timeDelayCheck: true,
                challengeCheck: true,
                minSubmissionTime: 20, // 20 seconds minimum (> 15 seconds elapsed)
                challengeTimeValue: 10 // 10 seconds per challenge (so 1 challenge = 10 seconds)
            };

            // Should pass because 15 seconds elapsed + 10 seconds from challenge = 25 seconds > 20 seconds minimum
            const result = validateFormShield(mockBody, options);
            expect(result.valid).toBe(true);
            expect(result.error).toBeNull();
            expect(result.isBot).toBe(false);
        });
    });
});
