import type { NextApiRequest, NextApiResponse } from 'next';
import { withFormShield } from 'react-form-shield/server';

type ContactFormData = {
    name: string;
    email: string;
    message: string;
};

type ResponseData = {
    success: boolean;
    message?: string;
    error?: string;
};

/**
 * Contact form API route with form shield protection
 * 
 * This route handles contact form submissions and validates them using
 * the form shield middleware to prevent spam submissions.
 */
export default withFormShield(
    {
        honeypotCheck: true,
        timeDelayCheck: true,
        challengeCheck: true,
        minSubmissionTime: 10, // 10 seconds
        challengeTimeValue: 5, // 5 seconds per challenge
    },
    async (req: NextApiRequest, res: NextApiResponse<ResponseData>) => {
        // Only allow POST method
        if (req.method !== 'POST') {
            return res.status(405).json({
                success: false,
                error: 'Method not allowed',
            });
        }

        try {
            // Extract form data
            const { name, email, message } = req.body as ContactFormData;

            // Validate required fields
            if (!name || !email || !message) {
                return res.status(400).json({
                    success: false,
                    error: 'All fields are required',
                });
            }

            // Process the form submission
            // In a real application, you would:
            // - Send an email notification
            // - Store the submission in a database
            // - Trigger a webhook
            // - etc.
            console.log('Form submission received:');
            console.log('- Name:', name);
            console.log('- Email:', email);
            console.log('- Message:', message);

            // Return success response
            return res.status(200).json({
                success: true,
                message: 'Form submitted successfully!',
            });
        } catch (error) {
            console.error('Error processing form submission:', error);
            return res.status(500).json({
                success: false,
                error: 'An error occurred while processing your submission',
            });
        }
    }
);
