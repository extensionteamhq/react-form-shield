# Form Library Adapters

React Form Shield provides adapters for popular form libraries to simplify integration. These adapters enhance the form library's API with anti-spam protection features.

## Global Configuration with FormShieldProvider

All adapters work seamlessly with the `FormShieldProvider` component, which allows you to provide global configuration for all forms in your application. The adapters will automatically use the global configuration from the `FormShieldProvider` if available, but you can still override specific settings at the form level.

```tsx
import { FormShieldProvider } from "react-form-shield";

function App() {
    return (
        <FormShieldProvider
            settings={{
                ENABLE_HONEYPOT: true,
                ENABLE_TIME_DELAY: true,
                ENABLE_CHALLENGE_DIALOG: true,
            }}
            onError={(error) => console.error(error)}>
            {/* All forms within this provider will use the global configuration */}
            <ContactForm />
            <FeedbackForm />
        </FormShieldProvider>
    );
}
```

For more information about the `FormShieldProvider`, see the [FormShieldProvider documentation](./index.md#formshieldprovider).

## Available Adapters

- [React Hook Form Adapter](#react-hook-form-adapter)
- [Formik Adapter](#formik-adapter)

## React Hook Form Adapter

The React Hook Form adapter enhances React Hook Form with anti-spam protection features.

### Installation

```bash
npm install react-hook-form react-form-shield
```

### Usage

```tsx
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
        // Form data will be submitted only if it passes anti-spam checks
        console.log(data);

        // You can access form shield data
        console.log(getFormShieldData());
    };

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)}>
                <input {...register("name")} placeholder="Name" />
                <input {...register("email")} placeholder="Email" />
                <textarea {...register("message")} placeholder="Message" />

                {/* Add the honeypot field */}
                <HoneypotField {...honeypotProps} />

                <button type="submit">Submit</button>
            </form>

            {/* Add the challenge dialog */}
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

### API

#### `withReactHookForm(form, options?)`

Enhances a React Hook Form instance with anti-spam protection.

**Parameters:**

- `form`: The return value from React Hook Form's `useForm` hook
- `options` (optional): Configuration options
    - `onError`: Function to call when an error occurs
    - `onSubmitError`: Function to call when a submission error occurs
    - `honeypotFieldName`: Custom name for the honeypot field
    - `settings`: Anti-spam settings (see [Settings](#settings))

**Returns:**

An enhanced form object with the following properties:

- `register`: Enhanced version of React Hook Form's `register` function
- `handleSubmit`: Enhanced version of React Hook Form's `handleSubmit` function
- `honeypotProps`: Props for the honeypot field
- `showChallengeDialog`: Whether to show the challenge dialog
- `setShowChallengeDialog`: Function to set whether to show the challenge dialog
- `challenge`: Current challenge question and answer
- `challengeAnswer`: User's answer to the challenge
- `setChallengeAnswer`: Function to set the user's answer to the challenge
- `handleChallengeSubmit`: Function to handle challenge dialog submission
- `getFormShieldData`: Function to get form shield data for submission

## Formik Adapter

The Formik adapter enhances Formik with anti-spam protection features.

### Installation

```bash
npm install formik react-form-shield
```

### Usage

```tsx
import { useFormik } from "formik";
import { withFormik, HoneypotField, ChallengeDialog } from "react-form-shield";

function ContactForm() {
    const formik = useFormik({
        initialValues: {
            name: "",
            email: "",
            message: "",
        },
        onSubmit: (values) => {
            // Form data will be submitted only if it passes anti-spam checks
            console.log(values);
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

                {/* Add the honeypot field */}
                <HoneypotField {...honeypotProps} />

                <button type="submit">Submit</button>
            </form>

            {/* Add the challenge dialog */}
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

### API

#### `withFormik(formik, options?)`

Enhances a Formik instance with anti-spam protection.

**Parameters:**

- `formik`: The return value from Formik's `useFormik` hook
- `options` (optional): Configuration options
    - `onError`: Function to call when an error occurs
    - `onSubmitError`: Function to call when a submission error occurs
    - `honeypotFieldName`: Custom name for the honeypot field
    - `settings`: Anti-spam settings (see [Settings](#settings))

**Returns:**

An enhanced form object with the following properties:

- `getFieldProps`: Formik's `getFieldProps` function
- `handleSubmit`: Enhanced version of Formik's `handleSubmit` function
- `handleFieldFocus`: Function to track field focus for anti-spam detection
- `honeypotProps`: Props for the honeypot field
- `showChallengeDialog`: Whether to show the challenge dialog
- `setShowChallengeDialog`: Function to set whether to show the challenge dialog
- `challenge`: Current challenge question and answer
- `challengeAnswer`: User's answer to the challenge
- `setChallengeAnswer`: Function to set the user's answer to the challenge
- `handleChallengeSubmit`: Function to handle challenge dialog submission
- `getFormShieldData`: Function to get form shield data for submission

## Settings

Both adapters accept the following settings:

```typescript
{
    ENABLE_TIME_DELAY: boolean; // Whether to enable time delay check
    ENABLE_CHALLENGE_DIALOG: boolean; // Whether to enable challenge dialog
    ENABLE_HONEYPOT: boolean; // Whether to enable honeypot field
    ENABLE_MULTIPLE_CHALLENGES: boolean; // Whether to enable multiple challenges
    CHALLENGE_TIME_VALUE: number; // How many seconds each completed challenge is worth
    MAX_CHALLENGES: number; // Maximum number of challenges to present
}
```

Default settings:

```typescript
{
  ENABLE_TIME_DELAY: true,
  ENABLE_CHALLENGE_DIALOG: true,
  ENABLE_HONEYPOT: true,
  ENABLE_MULTIPLE_CHALLENGES: true,
  CHALLENGE_TIME_VALUE: 5,
  MAX_CHALLENGES: 3
}
```
