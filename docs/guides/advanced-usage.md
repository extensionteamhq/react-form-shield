# Advanced Usage Guide

This guide covers advanced usage patterns and customization options for react-form-shield.

## Customizing Anti-Spam Settings

You can customize the anti-spam settings by passing options to the `useFormShield` hook:

```jsx
const formShield = useFormShield({
    settings: {
        ENABLE_TIME_DELAY: true,
        ENABLE_CHALLENGE_DIALOG: true,
        ENABLE_HONEYPOT: true,
        ENABLE_MULTIPLE_CHALLENGES: true,
        CHALLENGE_TIME_VALUE: 5, // seconds each challenge is worth
        MAX_CHALLENGES: 3, // maximum number of challenges to present
    },
    onError: (error) => console.error(error),
    honeypotFieldName: "custom_honeypot_field",
});
```

## Using with React Hook Form

react-form-shield provides a dedicated adapter for React Hook Form:

```jsx
import { useForm } from "react-hook-form";
import {
    withReactHookForm,
    HoneypotField,
    ChallengeDialog,
} from "react-form-shield";

function ContactForm() {
    const form = useForm();

    const {
        register,
        handleSubmit,
        honeypotProps,
        showChallengeDialog,
        setShowChallengeDialog,
        challenge,
        challengeAnswer,
        setChallengeAnswer,
        handleChallengeSubmit,
        getFormShieldData,
    } = withReactHookForm(form);

    const onSubmit = async (data) => {
        // Form data already includes anti-spam data
        await fetch("/api/contact", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        // Handle success
        console.log("Form submitted successfully!");
    };

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)}>
                <input {...register("name")} placeholder="Name" />
                <input {...register("email")} placeholder="Email" />
                <textarea {...register("message")} placeholder="Message" />

                <HoneypotField {...honeypotProps} />

                <button type="submit">Submit</button>
            </form>

            <ChallengeDialog
                open={showChallengeDialog}
                onOpenChange={setShowChallengeDialog}
                challenge={challenge}
                challengeAnswer={challengeAnswer}
                setChallengeAnswer={setChallengeAnswer}
                onSubmit={() => handleChallengeSubmit(onSubmit)}
            />
        </>
    );
}
```

## Using with Formik

react-form-shield also provides a dedicated adapter for Formik:

```jsx
import { useFormik } from "formik";
import { withFormik, HoneypotField, ChallengeDialog } from "react-form-shield";

function ContactForm() {
    const formik = useFormik({
        initialValues: {
            name: "",
            email: "",
            message: "",
        },
        onSubmit: async (values) => {
            // Handle form submission
            console.log("Form values:", values);
        },
    });

    const {
        getFieldProps,
        handleSubmit,
        handleFieldFocus,
        honeypotProps,
        showChallengeDialog,
        setShowChallengeDialog,
        challenge,
        challengeAnswer,
        setChallengeAnswer,
        handleChallengeSubmit,
        getFormShieldData,
    } = withFormik(formik);

    const submitForm = async (values, challengeCompleted, challengeMetrics) => {
        await formik.submitForm();

        // You can access form shield data
        console.log(getFormShieldData());
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <input
                    {...getFieldProps("name")}
                    onFocus={handleFieldFocus}
                    placeholder="Name"
                />
                <input
                    {...getFieldProps("email")}
                    onFocus={handleFieldFocus}
                    placeholder="Email"
                />
                <textarea
                    {...getFieldProps("message")}
                    onFocus={handleFieldFocus}
                    placeholder="Message"
                />

                <HoneypotField {...honeypotProps} />

                <button type="submit">Submit</button>
            </form>

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

## Customizing the Challenge Dialog

You can customize the appearance and behavior of the challenge dialog by passing additional props:

```jsx
<ChallengeDialog
    open={showChallengeDialog}
    onOpenChange={setShowChallengeDialog}
    challenge={challenge}
    challengeAnswer={challengeAnswer}
    setChallengeAnswer={setChallengeAnswer}
    onSubmit={() => handleChallengeSubmit(onSubmit)}
    title="Custom Challenge Title"
    description="Please complete this challenge to verify you're human."
    buttonText="Verify"
    currentChallengeNumber={currentChallengeNumber}
    totalRequiredChallenges={challengeMetrics.requiredChallenges}
    multipleEnabled={settings.ENABLE_MULTIPLE_CHALLENGES}
/>
```

## Advanced Server Configuration

You can customize the server-side validation by passing options to the middleware:

```javascript
// Express.js
app.post(
    "/api/contact",
    formShieldMiddleware({
        honeypotCheck: true,
        timeDelayCheck: true,
        challengeCheck: true,
        minSubmissionTime: 15, // seconds
        challengeTimeValue: 5, // seconds each challenge is worth
    }),
    handleContact
);

// Next.js
export default withFormShield(
    {
        honeypotCheck: true,
        timeDelayCheck: true,
        challengeCheck: true,
        minSubmissionTime: 15,
        challengeTimeValue: 5,
    },
    handler
);
```

## Handling Errors

You can handle errors by providing an `onError` callback:

```jsx
const formShield = useFormShield({
    onError: (error) => {
        console.error("Form shield error:", error);
        // Show error message to user
        setErrorMessage(error);
    },
});
```

## Accessing Form Shield Data

You can access form shield data for analytics or debugging:

```jsx
const { getFormShieldData } = useFormShield();

const handleSubmit = async (e) => {
    e.preventDefault();

    const formShieldData = getFormShieldData();
    console.log("Form shield data:", formShieldData);

    // formShieldData includes:
    // - firstFocusTime: when the form was first focused
    // - submissionTime: when the form was submitted
    // - challengeCompleted: whether a challenge was completed
    // - challengeMetrics: metrics about challenge completion
    // - antiSpamSettings: settings used by the form shield
};
```

## Global Configuration with FormShieldProvider

If you have multiple forms in your application that should share the same anti-spam settings, you can use the `FormShieldProvider` component to provide global configuration:

```jsx
import { FormShieldProvider } from "react-form-shield";

function App() {
    return (
        <FormShieldProvider
            settings={{
                ENABLE_HONEYPOT: true,
                ENABLE_TIME_DELAY: true,
                ENABLE_CHALLENGE_DIALOG: true,
                ENABLE_MULTIPLE_CHALLENGES: true,
                CHALLENGE_TIME_VALUE: 5,
                MAX_CHALLENGES: 3,
            }}
            onError={(error) =>
                console.error("Global form shield error:", error)
            }
            honeypotFieldName="global_honeypot_field">
            <ContactForm />
            <FeedbackForm />
            <SubscriptionForm />
        </FormShieldProvider>
    );
}
```

The `FormShieldProvider` component uses React Context to provide global configuration to all forms in your application. The `useFormShield` hook and framework adapters will automatically use this global configuration if available.

You can still override specific settings at the form level if needed:

```jsx
// This will use the global configuration from FormShieldProvider
// but override the ENABLE_MULTIPLE_CHALLENGES setting
const formShield = useFormShield({
    settings: {
        ENABLE_MULTIPLE_CHALLENGES: false,
    },
});
```

### Using with Framework Adapters

The framework adapters also work with the `FormShieldProvider`:

```jsx
// React Hook Form
const {
    register,
    handleSubmit,
    honeypotProps,
    // ...other props
} = withReactHookForm(form, {
    // Override specific settings if needed
    settings: {
        ENABLE_MULTIPLE_CHALLENGES: false,
    },
});

// Formik
const {
    getFieldProps,
    handleSubmit,
    honeypotProps,
    // ...other props
} = withFormik(formik, {
    // Override specific settings if needed
    settings: {
        ENABLE_MULTIPLE_CHALLENGES: false,
    },
});
```

## Multiple Forms on One Page

If you have multiple forms on one page and you're not using the `FormShieldProvider`, you should use a unique honeypot field name for each form:

```jsx
const form1Shield = useFormShield({
    honeypotFieldName: "honeypot_field_1",
});

const form2Shield = useFormShield({
    honeypotFieldName: "honeypot_field_2",
});
```

This ensures that the honeypot fields don't conflict with each other.

However, if you're using the `FormShieldProvider`, you can specify a global honeypot field name that will be used by all forms:

```jsx
<FormShieldProvider honeypotFieldName="global_honeypot_field">
    {/* All forms will use the same honeypot field name */}
    <ContactForm />
    <FeedbackForm />
</FormShieldProvider>
```

Or you can still override the honeypot field name at the form level if needed:

```jsx
const formShield = useFormShield({
    honeypotFieldName: "custom_honeypot_field",
});
```
