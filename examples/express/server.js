const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { formShieldMiddleware } = require("react-form-shield/server");

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Contact form endpoint with form shield middleware
app.post(
    "/api/contact",
    formShieldMiddleware({
        honeypotCheck: true,
        timeDelayCheck: true,
        challengeCheck: true,
        minSubmissionTime: 10, // 10 seconds
        challengeTimeValue: 5, // 5 seconds per challenge
    }),
    (req, res) => {
        // At this point, the request has passed all anti-spam checks

        // Extract form data
        const { name, email, message } = req.body;

        // Log the submission (in a real app, you would save to a database or send an email)
        console.log("Form submission received:");
        console.log("- Name:", name);
        console.log("- Email:", email);
        console.log("- Message:", message);

        // Return success response
        res.json({
            success: true,
            message: "Form submitted successfully!",
        });
    }
);

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Contact form endpoint: http://localhost:${port}/api/contact`);
});
