# Troubleshooting Guide

This guide addresses common issues you might encounter when using react-form-shield and provides solutions.

## Challenge Dialog Shows Too Frequently

**Issue**: The challenge dialog appears too often for legitimate users.

**Possible Causes**:

- The minimum submission time is set too high
- Users are filling out the form too quickly

**Solutions**:

1. Reduce the minimum submission time:

```jsx
const formShield = useFormShield({
    settings: {
        MIN_SUBMISSION_TIME: 5, // Reduce from default (10 seconds)
    },
});
```

2. Ensure the form focus tracking is working correctly:

```jsx
// Make sure this is called when the user first interacts with the form
formShield.handleFieldFocus();
```

## Challenge Dialog Never Shows

**Issue**: The challenge dialog doesn't appear even when it should.

**Possible Causes**:

- Challenge dialog is disabled in settings
- Time delay verification is disabled

**Solutions**:

1. Check your settings:

```jsx
const formShield = useFormShield({
    settings: {
        ENABLE_TIME_DELAY: true,
        ENABLE_CHALLENGE_DIALOG: true,
    },
});
```

2. Verify that `validateSubmission` is being called:

```jsx
const handleSubmit = (e) => {
    e.preventDefault();

    // This should trigger the challenge dialog if needed
    const validationResult = formShield.validateSubmission(formData);

    if (validationResult.passed) {
        // Submit form
    }
};
```

## Server-Side Validation Fails

**Issue**: The server-side validation fails even though the client-side validation passes.

**Possible Causes**:

- Form shield data is not being sent to the server
- Server-side validation settings are different from client-side

**Solutions**:

1. Ensure form shield data is included in the request:

```jsx
await fetch("/api/contact", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        ...formData,
        ...formShield.getFormShieldData(), // Include this!
    }),
});
```

2. Align server-side validation settings with client-side:

```javascript
// Server-side
app.post(
    "/api/contact",
    formShieldMiddleware({
        minSubmissionTime: 10, // Same as client-side
        challengeTimeValue: 5, // Same as client-side
    }),
    handleContact
);
```

## Honeypot Field Is Visible

**Issue**: The honeypot field is visible to users.

**Possible Causes**:

- CSS styles are being overridden
- Custom styling is interfering

**Solutions**:

1. Ensure the honeypot field has the correct styles:

```jsx
<HoneypotField
    {...formShield.honeypotProps}
    style={{
        position: "absolute",
        left: "-9999px",
        opacity: 0,
        height: 0,
        width: 0,
        overflow: "hidden",
        ...formShield.honeypotProps.style,
    }}
/>
```

2. Check for CSS conflicts in your application.

## Form Submission Blocked for Legitimate Users

**Issue**: Legitimate users are unable to submit the form.

**Possible Causes**:

- Time delay verification is too strict
- Challenge is too difficult
- Server-side validation is too strict

**Solutions**:

1. Adjust time delay settings:

```jsx
const formShield = useFormShield({
    settings: {
        MIN_SUBMISSION_TIME: 5, // Reduce from default
        MAX_RANDOM_DELAY: 2, // Reduce from default
    },
});
```

2. Provide clearer instructions for the challenge.

3. Adjust server-side validation:

```javascript
app.post(
    "/api/contact",
    formShieldMiddleware({
        timeDelayCheck: false, // Disable time delay check on server
        honeypotCheck: true, // Keep honeypot check
        challengeCheck: true, // Keep challenge check
    }),
    handleContact
);
```

## TypeScript Errors

**Issue**: TypeScript errors when using react-form-shield.

**Possible Causes**:

- Missing type definitions
- Incompatible TypeScript version

**Solutions**:

1. Ensure you're using TypeScript 4.0 or higher.

2. Import types correctly:

```tsx
import {
    useFormShield,
    HoneypotField,
    ChallengeDialog,
    FormShieldOptions,
    AntiSpamSettings,
} from "react-form-shield";
```

3. Specify types for form data:

```tsx
interface FormData {
    name: string;
    email: string;
    message: string;
    [key: string]: any; // For honeypot field
}

const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    message: "",
});
```

## Server-Side Rendering (SSR) Issues

**Issue**: Errors when using react-form-shield with SSR frameworks like Next.js.

**Possible Causes**:

- Browser-specific APIs being used during server rendering
- Hydration mismatches

**Solutions**:

1. Use dynamic imports for client-side only components:

```jsx
// Next.js example
import dynamic from "next/dynamic";

const ChallengeDialog = dynamic(
    () => import("react-form-shield").then((mod) => mod.ChallengeDialog),
    { ssr: false }
);
```

2. Use useEffect to initialize form shield:

```jsx
const [formShield, setFormShield] = useState(null);

useEffect(() => {
    // Only run on client-side
    const { useFormShield } = require("react-form-shield");
    setFormShield(useFormShield());
}, []);
```

## Still Having Issues?

If you're still experiencing problems, check the following:

1. Ensure you're using the latest version of react-form-shield.
2. Check your browser console for errors.
3. Verify that your server is correctly processing the form shield data.
4. Review the [API documentation](../api/index.md) for detailed information about the available options and methods.
