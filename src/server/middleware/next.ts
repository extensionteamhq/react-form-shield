/**
 * Next.js API Route Handler for Form Shield
 *
 * This file provides a higher-order function for Next.js API routes to validate form submissions.
 *
 * @module server/middleware/next
 */

import { Request, Response, FormShieldMiddlewareOptions } from '../types';
import { validateFormShield } from '../validators';

/**
 * Higher-order function for Next.js API routes to validate form shield data
 * @param {FormShieldMiddlewareOptions} options - Middleware options
 * @param {Function} handler - Next.js API route handler
 * @returns {Function} Next.js API route handler with form shield validation
 */
export const withFormShield = (
    options: FormShieldMiddlewareOptions = {},
    handler: (req: Request, res: Response) => Promise<void> | void
) => {
    return async (req: Request, res: Response) => {
        // Only process POST requests
        if (req.method !== 'POST') {
            return handler(req, res);
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

        // If validation passes, continue to handler
        return handler(req, res);
    };
};
