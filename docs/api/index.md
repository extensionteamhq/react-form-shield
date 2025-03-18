# react-form-shield API Reference

This document provides detailed information about the API of the react-form-shield package.

## Table of Contents

- [react-form-shield API Reference](#react-form-shield-api-reference)
  - [Table of Contents](#table-of-contents)
  - [Client-Side API](#client-side-api)
    - [Hooks](#hooks)
      - [useFormShield](#useformshield)
    - [Components](#components)
      - [HoneypotField](#honeypotfield)
      - [ChallengeDialog](#challengedialog)
    - [Utilities](#utilities)
  - [Server-Side API](#server-side-api)
    - [Express Middleware](#express-middleware)
    - [Next.js API Route Handler](#nextjs-api-route-handler)
    - [Validation Functions](#validation-functions)

## Client-Side API

### Hooks

#### useFormShield

The main hook for form protection. It provides all the necessary functionality for anti-spam protection.

```tsx
const formShield = useFormShield(options);
```

**Parameters:**

- `options` (optional): Configuration options for the form shield
    - `settings`: Override default anti-spam settings
    - `onError`: Callback function for error handling
    - `honeypotFieldName`: Custom name for the honeypot field

**Returns:**

An object with the following properties:

- `firstFocusTime`: Timestamp when the form was first focused
- `formFocusTracked`: Ref to track if form focus has been tracked
- `requiredDelay`: Required delay in seconds before form submission
- `showChallengeDialog`: Whether to show the challenge dialog
- `setShowChallengeDialog`: Function to set whether to show the challenge dialog
- `challenge`: Current challenge question and answer
- `setChallenge`: Function to set a new challenge
- `challengeAnswer`: User's answer to the challenge
- `setChallengeAnswer`: Function to set the user's answer to the challenge
- `formValues`: Stored form values for after challenge completion
- `setFormValues`: Function to set the stored form values
- `challengeMetrics`: Metrics about challenge completion
- `setChallengeMetrics`: Function to set challenge metrics
- `currentChallengeNumber`: Current challenge number (1-based)
- `handleFieldFocus`: Function to handle form field focus
- `checkAntiSpam`: Function to check if the form passes anti-spam checks
- `handleChallengeSubmit`: Function to handle challenge dialog submission
- `honeypotProps`: Props for the honeypot field
- `getFormShieldData`: Function to get form shield data for submission
- `validateSubmission`: Function to validate form submission
- `settings`: Anti-spam settings used by the form shield

**Example:**

```tsx
import { useFormShield } from "react-form-shield";

function ContactForm() {
    const {
        honeypotProps,
        showChallengeDialog,
        challenge,
        challengeAnswer,
        setChallengeAnswer,
        handleChallengeSubmit,
        validateSubmission,
        getFormShieldData,
    } = useFormShield();

    // Use these values in your form
}
```

### Components

#### HoneypotField

A hidden field component that helps detect bots.

```tsx
<HoneypotField {...props} />
```

**Props:**

- `name`: Field name
- `style` (optional): Additional styles

**Example:**

```tsx
import { HoneypotField } from "react-form-shield";

function ContactForm() {
    const { honeypotProps } = useFormShield();

    return (
        <form>
            {/* Regular form fields */}
            <HoneypotField {...honeypotProps} />
        </form>
    );
}
```

#### ChallengeDialog

A dialog component that presents a challenge to verify the user is human.

```tsx
<ChallengeDialog {...props} />
```

**Props:**

- `open`: Whether the dialog is open
- `onOpenChange`: Function to set whether the dialog is open
- `challenge`: Challenge question and answer
- `challengeAnswer`: User's answer to the challenge
- `setChallengeAnswer`: Function to set the user's answer
- `onSubmit`: Function to call when the challenge is submitted
- `error` (optional): Error message
- `currentChallengeNumber` (optional): Current challenge number (1-based)
- `totalRequiredChallenges` (optional): Total number of required challenges
- `multipleEnabled` (optional): Whether multiple challenges are enabled
- `title` (optional): Custom title for the dialog
- `description` (optional): Custom description for the dialog
- `buttonText` (optional): Custom button text

**Example:**

```tsx
import { ChallengeDialog } from "react-form-shield";

function ContactForm() {
    const {
        showChallengeDialog,
        setShowChallengeDialog,
        challenge,
        challengeAnswer,
        setChallengeAnswer,
        handleChallengeSubmit,
    } = useFormShield();

    return (
        <>
            {/* Form fields */}
            <ChallengeDialog
                open={showChallengeDialog}
                onOpenChange={setShowChallengeDialog}
                challenge={challenge}
                challengeAnswer={challengeAnswer}
                setChallengeAnswer={setChallengeAnswer}
                onSubmit={() => handleChallengeSubmit(submitForm)}
            />
        </>
    );
}
```

### Utilities

The package provides several utility functions that are used internally but can also be used directly if needed:

- `generateHoneypotFieldName()`: Generate a random honeypot field name
- `generateChallenge()`: Generate a random challenge
- `getRandomDelay()`: Get a random delay between MIN_SUBMISSION_TIME and MIN_SUBMISSION_TIME + MAX_RANDOM_DELAY seconds
- `calculateRequiredChallenges(timeDeficitSeconds, settings)`: Calculate required challenges based on time deficit
- `getHoneypotStyles()`: Create CSS styles for honeypot field
- `mergeSettings(userSettings)`: Merge default settings with user-provided settings

## Server-Side API

### Express Middleware

Middleware for Express.js applications to validate form submissions.

```js
const { formShieldMiddleware } = require("react-form-shield/server");

app.post("/api/contact", formShieldMiddleware(options), (req, res) => {
    // Handle form submission
});
```

**Parameters:**

- `options` (optional): Configuration options for the middleware
    - `honeypotCheck`: Whether to check honeypot fields (default: true)
    - `timeDelayCheck`: Whether to check time delay (default: true)
    - `challengeCheck`: Whether to check challenge completion (default: true)
    - `minSubmissionTime`: Minimum required time in seconds (default: 10)
    - `challengeTimeValue`: How many seconds each completed challenge is worth (default: 5)

### Next.js API Route Handler

Higher-order function for Next.js API routes to validate form submissions.

```ts
import { withFormShield } from "react-form-shield/server";

export default withFormShield(options, handler);
```

**Parameters:**

- `options` (optional): Configuration options (same as Express middleware)
- `handler`: Next.js API route handler

**Example:**

```ts
import { withFormShield } from "react-form-shield/server";

export default withFormShield(
    { honeypotCheck: true, timeDelayCheck: true },
    async (req, res) => {
        // Handle form submission
    }
);
```

### Validation Functions

The package provides several validation functions that are used internally but can also be used directly if needed:

- `validateHoneypot(body)`: Validate honeypot fields in the request body
- `validateTimeDelay(body, minSubmissionTime, challengeTimeValue)`: Validate time delay in the request body
- `validateChallenge(body)`: Validate challenge completion in the request body
- `validateFormShield(body, options)`: Validate form shield data in the request body
