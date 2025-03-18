# Accessibility Guide

This guide covers accessibility considerations when using react-form-shield to ensure your forms remain accessible to all users.

## Overview

react-form-shield is designed with accessibility in mind, following Web Content Accessibility Guidelines (WCAG). However, it's important to understand how the anti-spam features interact with assistive technologies and ensure your implementation maintains accessibility.

## Honeypot Fields

Honeypot fields are hidden from visual users but might be announced by screen readers. react-form-shield implements honeypot fields with the following accessibility features:

1. `aria-hidden="true"` to hide the field from screen readers
2. `tabIndex={-1}` to remove the field from the tab order
3. CSS positioning to visually hide the field

This implementation ensures that the honeypot field doesn't interfere with the user experience for people using assistive technologies.

## Challenge Dialog

The challenge dialog is designed to be accessible to all users, including those using screen readers or keyboard navigation. Key accessibility features include:

1. Focus management: When the dialog opens, focus is automatically moved to the dialog
2. Keyboard navigation: The dialog can be navigated using the keyboard
3. ARIA attributes: Appropriate ARIA roles and attributes are used to ensure screen readers announce the dialog correctly
4. Clear instructions: The challenge includes clear instructions for all users

### Customizing the Challenge Dialog for Accessibility

When customizing the challenge dialog, ensure you maintain these accessibility features:

```jsx
<ChallengeDialog
    open={showChallengeDialog}
    onOpenChange={setShowChallengeDialog}
    challenge={challenge}
    challengeAnswer={challengeAnswer}
    setChallengeAnswer={setChallengeAnswer}
    onSubmit={() => handleChallengeSubmit(onSubmit)}
    // Accessibility enhancements
    title="Human Verification" // Clear, descriptive title
    description="Please solve this simple math problem to verify you're human." // Clear instructions
    buttonText="Verify" // Descriptive button text
/>
```

## Time Delay Verification

Time delay verification is invisible to users and doesn't affect accessibility. However, some users with disabilities may take longer to fill out forms. Consider adjusting the minimum submission time to accommodate these users:

```jsx
const formShield = useFormShield({
    settings: {
        MIN_SUBMISSION_TIME: 5, // Shorter time for better accessibility
        ENABLE_MULTIPLE_CHALLENGES: true, // Allow challenges as an alternative
    },
});
```

## Multiple Challenges

Multiple challenges can be used to compensate for a shorter time delay, providing a more accessible experience for users who may need more time to complete forms:

```jsx
const formShield = useFormShield({
    settings: {
        MIN_SUBMISSION_TIME: 5, // Shorter time
        ENABLE_MULTIPLE_CHALLENGES: true,
        CHALLENGE_TIME_VALUE: 10, // Each challenge is worth more time
        MAX_CHALLENGES: 2, // Limit the number of challenges
    },
});
```

## Error Messages

Ensure error messages are clear and descriptive, providing users with information about what went wrong and how to fix it:

```jsx
const formShield = useFormShield({
    onError: (error) => {
        // Display error message in an accessible way
        setErrorMessage(error);
        // Focus the error message for screen readers
        errorRef.current?.focus();
    },
});

// In your component
return (
    <>
        {errorMessage && (
            <div
                role="alert"
                ref={errorRef}
                tabIndex={-1}
                className="error-message">
                {errorMessage}
            </div>
        )}
        {/* Rest of your form */}
    </>
);
```

## Keyboard Navigation

Ensure all form elements and the challenge dialog can be navigated using the keyboard:

1. All form fields should be focusable
2. The challenge dialog should trap focus while open
3. When the dialog closes, focus should return to the element that opened it

## Testing Accessibility

Test your form with assistive technologies to ensure it's accessible:

1. Screen readers (e.g., NVDA, VoiceOver, JAWS)
2. Keyboard navigation
3. High contrast mode
4. Zoom/magnification

## WCAG Compliance

react-form-shield aims to meet WCAG 2.1 Level AA compliance. Key considerations include:

1. **Perceivable**: Information and user interface components must be presentable to users in ways they can perceive.
2. **Operable**: User interface components and navigation must be operable.
3. **Understandable**: Information and the operation of the user interface must be understandable.
4. **Robust**: Content must be robust enough to be interpreted reliably by a wide variety of user agents, including assistive technologies.

By following the guidelines in this document, you can ensure your implementation of react-form-shield maintains accessibility for all users.
