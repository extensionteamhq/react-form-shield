/**
 * Express Middleware for Form Shield
 *
 * This file provides middleware for Express.js applications to validate form submissions.
 *
 * @module server/middleware/express
 */

import { Request, Response, NextFunction, FormShieldMiddlewareOptions } from '../types';
import { validateFormShield } from '../validators';

/**
 * Express middleware for validating form shield data
 * @param {FormShieldMiddlewareOptions} options - Middleware options
 * @returns {Function} Express middleware function
 */
export const formShieldMiddleware = (options: FormShieldMiddlewareOptions = {}) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // Only process POST requests
        if (req.method !== 'POST') {
            return next();
        }

        // Validate form shield data
        const result = validateFormShield(req.body, options);

        // If validation fails, return error
        if (!result.valid) {
            // If it's a bot, silently accept but don't process further
            if (result.isBot) {
                return res.status(200).json({
                    success: true,
                    message: 'Form submitted successfully!',
                });
            }

            // Otherwise, return error
            return res.status(400).json({
                success: false,
                error: result.error || 'Invalid form submission',
            });
        }

        // If validation passes, continue to next middleware
        next();
    };
};
