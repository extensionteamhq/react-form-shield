/**
 * Tests for Next.js middleware
 */

import { withFormShield } from './next';
import { validateFormShield } from '../validators';
import { Request, Response } from '../types';

// Mock the validators module
jest.mock('../validators', () => ({
    validateFormShield: jest.fn()
}));

describe('Next.js Middleware', () => {
    // Setup mock request, response, and handler
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockHandler: jest.Mock;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Setup mock request
        mockReq = {
            method: 'POST',
            body: {
                firstFocusTime: Date.now() - 15000,
                submissionTime: Date.now(),
                challengeCompleted: true,
                challengeMetrics: {
                    completedChallenges: 1,
                    totalChallengeTime: 5000,
                    requiredChallenges: 1
                }
            }
        };

        // Setup mock response
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn()
        };

        // Setup mock handler
        mockHandler = jest.fn();
    });

    it('should pass non-POST requests to handler', async () => {
        // Setup GET request
        mockReq.method = 'GET';

        // Call middleware
        const wrappedHandler = withFormShield({}, mockHandler);
        await wrappedHandler(mockReq as Request, mockRes as Response);

        // Verify validateFormShield was not called
        expect(validateFormShield).not.toHaveBeenCalled();

        // Verify handler was called with request and response
        expect(mockHandler).toHaveBeenCalledWith(mockReq, mockRes);
    });

    it('should call validateFormShield with request body and options', async () => {
        // Setup mock validateFormShield to return valid result
        (validateFormShield as jest.Mock).mockReturnValue({
            valid: true,
            error: null,
            isBot: false
        });

        // Setup custom options
        const options = {
            honeypotCheck: true,
            timeDelayCheck: false,
            challengeCheck: true
        };

        // Call middleware with options
        const wrappedHandler = withFormShield(options, mockHandler);
        await wrappedHandler(mockReq as Request, mockRes as Response);

        // Verify validateFormShield was called with request body and options
        expect(validateFormShield).toHaveBeenCalledWith(mockReq.body, options);

        // Verify handler was called with request and response
        expect(mockHandler).toHaveBeenCalledWith(mockReq, mockRes);
    });

    it('should call handler when validation passes', async () => {
        // Setup mock validateFormShield to return valid result
        (validateFormShield as jest.Mock).mockReturnValue({
            valid: true,
            error: null,
            isBot: false
        });

        // Call middleware
        const wrappedHandler = withFormShield({}, mockHandler);
        await wrappedHandler(mockReq as Request, mockRes as Response);

        // Verify handler was called with request and response
        expect(mockHandler).toHaveBeenCalledWith(mockReq, mockRes);

        // Verify response methods were not called directly by middleware
        expect(mockRes.status).not.toHaveBeenCalled();
        expect(mockRes.json).not.toHaveBeenCalled();
    });

    it('should return 400 error when validation fails', async () => {
        // Setup mock validateFormShield to return invalid result
        (validateFormShield as jest.Mock).mockReturnValue({
            valid: false,
            error: 'Form submitted too quickly. Please try again.',
            isBot: false
        });

        // Call middleware
        const wrappedHandler = withFormShield({}, mockHandler);
        await wrappedHandler(mockReq as Request, mockRes as Response);

        // Verify handler was not called
        expect(mockHandler).not.toHaveBeenCalled();

        // Verify response methods were called with correct arguments
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            error: 'Form submitted too quickly. Please try again.'
        });
    });

    it('should return 200 success when bot is detected (silent rejection)', async () => {
        // Setup mock validateFormShield to return bot detection
        (validateFormShield as jest.Mock).mockReturnValue({
            valid: false,
            error: 'Honeypot field detected',
            isBot: true
        });

        // Call middleware
        const wrappedHandler = withFormShield({}, mockHandler);
        await wrappedHandler(mockReq as Request, mockRes as Response);

        // Verify handler was not called
        expect(mockHandler).not.toHaveBeenCalled();

        // Verify response methods were called with correct arguments
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: true,
            message: 'Form submitted successfully!'
        });
    });

    it('should use default error message when error is null', async () => {
        // Setup mock validateFormShield to return invalid result with null error
        (validateFormShield as jest.Mock).mockReturnValue({
            valid: false,
            error: null,
            isBot: false
        });

        // Call middleware
        const wrappedHandler = withFormShield({}, mockHandler);
        await wrappedHandler(mockReq as Request, mockRes as Response);

        // Verify response methods were called with correct arguments
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            error: 'Invalid form submission'
        });
    });

    it('should handle async handlers', async () => {
        // Setup mock validateFormShield to return valid result
        (validateFormShield as jest.Mock).mockReturnValue({
            valid: true,
            error: null,
            isBot: false
        });

        // Setup async handler
        const asyncHandler = jest.fn().mockImplementation(() => Promise.resolve());

        // Call middleware
        const wrappedHandler = withFormShield({}, asyncHandler);
        await wrappedHandler(mockReq as Request, mockRes as Response);

        // Verify handler was called with request and response
        expect(asyncHandler).toHaveBeenCalledWith(mockReq, mockRes);
    });
});
