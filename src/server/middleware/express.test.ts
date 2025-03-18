/**
 * Tests for Express middleware
 */

import { formShieldMiddleware } from './express';
import { validateFormShield } from '../validators';
import { Request, Response, NextFunction } from '../types';

// Mock the validators module
jest.mock('../validators', () => ({
    validateFormShield: jest.fn()
}));

describe('Express Middleware', () => {
    // Setup mock request, response, and next function
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;

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

        // Setup mock next function
        mockNext = jest.fn();
    });

    it('should pass non-POST requests to next middleware', () => {
        // Setup GET request
        mockReq.method = 'GET';

        // Call middleware
        const middleware = formShieldMiddleware();
        middleware(mockReq as Request, mockRes as Response, mockNext);

        // Verify validateFormShield was not called
        expect(validateFormShield).not.toHaveBeenCalled();

        // Verify next was called
        expect(mockNext).toHaveBeenCalled();

        // Verify response methods were not called
        expect(mockRes.status).not.toHaveBeenCalled();
        expect(mockRes.json).not.toHaveBeenCalled();
    });

    it('should call validateFormShield with request body and options', () => {
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
        const middleware = formShieldMiddleware(options);
        middleware(mockReq as Request, mockRes as Response, mockNext);

        // Verify validateFormShield was called with request body and options
        expect(validateFormShield).toHaveBeenCalledWith(mockReq.body, options);

        // Verify next was called
        expect(mockNext).toHaveBeenCalled();

        // Verify response methods were not called
        expect(mockRes.status).not.toHaveBeenCalled();
        expect(mockRes.json).not.toHaveBeenCalled();
    });

    it('should call next when validation passes', () => {
        // Setup mock validateFormShield to return valid result
        (validateFormShield as jest.Mock).mockReturnValue({
            valid: true,
            error: null,
            isBot: false
        });

        // Call middleware
        const middleware = formShieldMiddleware();
        middleware(mockReq as Request, mockRes as Response, mockNext);

        // Verify next was called
        expect(mockNext).toHaveBeenCalled();

        // Verify response methods were not called
        expect(mockRes.status).not.toHaveBeenCalled();
        expect(mockRes.json).not.toHaveBeenCalled();
    });

    it('should return 400 error when validation fails', () => {
        // Setup mock validateFormShield to return invalid result
        (validateFormShield as jest.Mock).mockReturnValue({
            valid: false,
            error: 'Form submitted too quickly. Please try again.',
            isBot: false
        });

        // Call middleware
        const middleware = formShieldMiddleware();
        middleware(mockReq as Request, mockRes as Response, mockNext);

        // Verify next was not called
        expect(mockNext).not.toHaveBeenCalled();

        // Verify response methods were called with correct arguments
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            error: 'Form submitted too quickly. Please try again.'
        });
    });

    it('should return 200 success when bot is detected (silent rejection)', () => {
        // Setup mock validateFormShield to return bot detection
        (validateFormShield as jest.Mock).mockReturnValue({
            valid: false,
            error: 'Honeypot field detected',
            isBot: true
        });

        // Call middleware
        const middleware = formShieldMiddleware();
        middleware(mockReq as Request, mockRes as Response, mockNext);

        // Verify next was not called
        expect(mockNext).not.toHaveBeenCalled();

        // Verify response methods were called with correct arguments
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: true,
            message: 'Form submitted successfully!'
        });
    });

    it('should use default error message when error is null', () => {
        // Setup mock validateFormShield to return invalid result with null error
        (validateFormShield as jest.Mock).mockReturnValue({
            valid: false,
            error: null,
            isBot: false
        });

        // Call middleware
        const middleware = formShieldMiddleware();
        middleware(mockReq as Request, mockRes as Response, mockNext);

        // Verify response methods were called with correct arguments
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            error: 'Invalid form submission'
        });
    });
});
